# ZIPEK: administración de servicios

## Arquitectura

- **Interfaz:** Next.js App Router. El sitio público vive en `(main)`; seguimiento y consultas usan un layout aislado `(portal)` sin el menú general; `/admin` y `/admin/login` son rutas privadas.
- **Identidad:** Supabase Auth con correo y contraseña. No hay registro público. El acceso requiere un registro activo en `admin_profiles`.
- **Persistencia:** PostgreSQL administrado por Supabase. Las tablas privadas tienen RLS y las operaciones críticas pasan por funciones SQL que validan el perfil activo.
- **Capa de acceso:** Server Components y Server Actions usan el cliente SSR autenticado; `src/proxy.ts` actualiza las cookies de sesión. `SUPABASE_SERVICE_ROLE_KEY` se usa solo en el servidor para invitaciones del equipo y el cron de alertas; nunca debe agregarse a variables `NEXT_PUBLIC_*`.
- **Búsqueda del panel:** listados acotados por cursor desde Route Handlers privados; los filtros se conservan en la URL y PostgreSQL ejecuta búsqueda y filtrado bajo RLS.
- **Seguimiento público:** la página comparte una clave aleatoria de 256 bits en el fragmento del enlace. Solo se almacena su SHA-256. El visitante envía la clave al backend y recibe los campos públicos mínimos. Se emite un broadcast privado de Supabase Realtime para la clave correspondiente y se conserva una consulta de respaldo cada 15 segundos.
- **Renovación de enlace:** desde el detalle de una orden, personal activo puede generar y copiar un nuevo enlace privado. La operación sustituye el hash vigente en `service_tracking_tokens`; el enlace anterior queda invalidado. El valor nuevo solo se muestra tras generarlo y no se puede recuperar desde la base de datos.
- **Consultas:** el formulario web permite elegir entre enviar una consulta anónima (sin respuesta posible) o solicitar respuesta proporcionando teléfono o correo y autorizando expresamente su uso para ese fin. El código de referencia no permite consultar el contenido ni el estado de una consulta; sirve para retomarla manualmente por WhatsApp. Las conversaciones de WhatsApp se registran manualmente desde el panel; no hay sincronización automática con Meta/WhatsApp Business.
- **Documentos:** `/admin/documentos` permite crear, editar y guardar borradores para los diez documentos de servicio, vinculados a un cliente y opcionalmente a una orden. Cada documento tiene vista imprimible compatible con “Guardar como PDF” y puede enviarse por correo con un PDF adjunto y una versión HTML en el cuerpo. El envío requiere `RESEND_API_KEY` y `RESEND_FROM_EMAIL` con un remitente verificado en Resend. Los borradores y su estado de envío se guardan en `service_documents`, protegida por RLS para personal activo. Las firmas siguen siendo manuscritas o deben coordinarse por un canal acordado; el panel no ofrece firma electrónica. La plantilla de autorización está también en `docs/authorization-intervention-backup.md`.

## Modelo de datos

La migración `supabase/migrations/20261011000000_service_operations.sql` crea:

| Tabla | Responsabilidad |
| --- | --- |
| `admin_profiles` | Identidad local, rol y estado activo del operador asociado a `auth.users`. |
| `clients` | Nombre, RUT opcional, teléfono, correo, dirección y notas internas; archivado lógico. |
| `service_orders` | Orden, alcance autorizado, equipo, precio, respaldo, diagnóstico, software, recomendaciones, estado y garantía. |
| `service_order_events` | Historial de creación, cambios de estado, tareas e informe, con visibilidad interna/pública. |
| `service_tasks` | Registro estructurado de tareas completadas o pendientes. |
| `service_tracking_tokens` | Hash de la clave de seguimiento, vinculado a la orden y revocable. |
| `service_inquiries` | Consulta, canal, estado y datos de contacto opcionales sujetos a autorización. |
| `service_inquiry_events` | Historial interno de creación, cambios de estado y notas de seguimiento. |
| `service_documents` | Borradores de documentos operativos, datos completados y estado del envío de correo. |

Las funciones transaccionales `create_service_order`, `update_service_order_status`, `log_service_task` y `update_service_report` escriben la operación y su historial dentro de la misma transacción. La función `get_public_tracking_status` solo devuelve número de orden, tipo de servicio, estado, mensaje público y eventos marcados como públicos.

## Preparar Supabase

1. Crear un proyecto Supabase y configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` (ver `.env.example`). Configurar `NEXT_PUBLIC_SITE_URL` con el dominio de producción.
2. Aplicar la migración SQL completa desde Supabase CLI (`supabase db push`) o el editor SQL del proyecto. No aplicar fragmentos: crea tipos, tablas, funciones, triggers y políticas de seguridad relacionados.
   Aplicar también `supabase/migrations/20261012000000_service_inquiries.sql` y `supabase/migrations/20261013000000_service_documents.sql` para habilitar las consultas y el módulo de documentos.
   Aplicar también `supabase/migrations/20261014000000_rotate_tracking_token.sql` para habilitar la generación de enlaces de seguimiento nuevos desde el detalle de una orden, `supabase/migrations/20261015000000_admin_search.sql` para habilitar la búsqueda y paginación del panel, y por último `supabase/migrations/20261016000000_admin_operations.sql` para permisos, auditoría, KPIs, alertas y configuración.
3. En Auth, desactivar los registros públicos y habilitar MFA en producción. Para invitar usuarios desde `/admin/usuarios`, configurar `SUPABASE_SERVICE_ROLE_KEY` solo como variable privada del servidor. La invitación también crea el perfil administrativo con el rol seleccionado.
4. Para la configuración inicial, dar acceso de administrador a una cuenta ya creada ejecutando como propietario del proyecto:

   ```sql
   insert into public.admin_profiles (id, display_name, role, active)
   select id, 'Nombre del operador', 'admin', true
   from auth.users
   where email = 'admin@tu-dominio.cl'
   on conflict (id) do update
   set display_name = excluded.display_name,
       role = excluded.role,
       active = excluded.active;
   ```

5. Ejecutar `npm run dev`; entrar a `/admin/login`. En producción, configurar las mismas variables en el proveedor de despliegue. La clave `service_role` no debe agregarse al frontend ni a las variables `NEXT_PUBLIC_*`.
6. Para envío de documentos por correo, configurar `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en el entorno del servidor. El dominio o dirección remitente debe estar verificado por Resend; sin estas variables, guardar e imprimir borradores sigue disponible, pero el envío muestra un error y no simula éxito.
7. Para el resumen diario de alertas, configurar `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en producción. `vercel.json` agenda el endpoint los días hábiles; los fallos quedan registrados en `admin_alert_runs`. Habilita el envío y define el correo receptor en `/admin/configuracion`. Sin estas variables, las alertas del panel siguen disponibles pero no se envía correo.

## Roles y controles administrativos

La migración convierte automáticamente los antiguos perfiles `operator` en `technician`. Los permisos se aplican en la interfaz, en Server Actions y en PostgreSQL/RLS; la interfaz por sí sola no es la frontera de seguridad.

| Rol | Permisos |
| --- | --- |
| `admin` | Todos los módulos, configuración, equipo, auditoría e informes. |
| `technician` | Lectura general; gestión de órdenes y documentos. |
| `support` | Lectura general; gestión de clientes, documentos y consultas. |
| `auditor` | Solo lectura de módulos, informes, configuración de consulta y auditoría. |

No se puede desactivar o degradar al último administrador activo. Las invitaciones, cambios de rol/estado y modificaciones de datos operativos generan filas en `admin_audit_log`. El registro es append-only para el personal y guarda actor, acción, entidad y nombres de campos alterados; no copia valores de contacto, notas ni contenido de documentos. Las exportaciones de auditoría e informes también quedan registradas.

`/admin/configuracion` permite ajustar SLA, jornada laboral y zona horaria, mantener el calendario de feriados, configurar el destinatario del correo diario y declarar plazos de retención para clientes archivados, consultas resueltas, documentos y órdenes cerradas. Los SLA cuentan las horas indicadas entre semana, dentro del horario y excluyendo las fechas cargadas en el calendario; los valores iniciales son 9 horas hábiles (un día con jornada 09:00–18:00) para primera atención, 4 para órdenes urgentes y 18 (dos jornadas) para órdenes sin actualización. Los feriados deben mantenerse actualizados por un administrador y corresponder a la zona horaria configurada. La retención empieza sin plazos aprobados y el reporte es informativo: no hay borrado automático ni se marcan casos activos como candidatos.

El resumen muestra conteos actuales, promedio de primera respuesta y de entrega para los últimos 90 días, y alertas de consultas fuera de plazo, órdenes urgentes fuera de plazo, órdenes estancadas y fallos de correo de documentos en los últimos 7 días. Las entregas/fallos de correo guardan solo el resultado, el código técnico, el actor y el documento, nunca el destinatario. Los errores de Next se emiten como eventos JSON sin query strings; las búsquedas lentas agregan una métrica `Server-Timing`. En producción, revisar Vercel Observability y configurar alertas del proveedor para errores y latencia.

Si una cuenta se deshabilita, establecer `admin_profiles.active = false` y revocar su sesión desde Supabase Auth. El acceso a las tablas y funciones vuelve a comprobar el estado activo en PostgreSQL.

## Rutas implementadas

- `/admin`: resumen operativo.
- `/admin/usuarios`: invitaciones y administración de roles/estado (solo administradores).
- `/admin/auditoria`: trazabilidad y exportación CSV (administradores y auditores).
- `/admin/configuracion`: SLA, jornada laboral, alertas por correo e informe no destructivo de retención.
- `GET /api/admin/reports`: exportación CSV de KPIs y candidatos de retención; requiere rol autorizado y queda auditada.
- `GET /api/cron/admin-alerts`: cron protegido por `CRON_SECRET`; envía un resumen sin datos personales y evita duplicados por día hábil.
- `/admin/clientes`, `/admin/clientes/nuevo`, `/admin/clientes/[id]`: alta, consulta, edición y archivo lógico de clientes.
- `/admin/ordenes`, `/admin/ordenes/nueva`, `/admin/ordenes/[id]`: alta de órdenes, estado, informe, registro de tareas e historial.
- `/admin/ordenes/[id]/documentos`: anexos A y B para impresión.
- `/admin/documentos`: plantillas, borradores guardados, edición, impresión/PDF y envío por correo.
- `/admin/documentos/nuevo/[tipo]` y `/admin/documentos/[id]`: completar y revisar los diez tipos de documentos operativos.
- `/seguimiento`: consulta pública mediante el enlace privado que se genera al crear la orden.
- `/consultas`: formulario público para registrar una consulta y recibir un código de referencia.
- `/admin/consultas`, `/admin/consultas/[id]`: bandeja privada, estados, historial y notas internas.
- `/admin/consultas/nueva`: registro manual de una conversación de WhatsApp.
- `POST /api/tracking`: verifica la clave y devuelve solo el estado público. La clave viaja en el fragmento/en el cuerpo de la solicitud, nunca como parámetro de API ni se persiste en texto claro.
- `POST /api/inquiries`: valida y guarda consultas web mediante una función SQL; no expone datos personales al público.
- `GET /api/admin/lists/clients`, `GET /api/admin/lists/orders`, `GET /api/admin/lists/documents` y `GET /api/admin/lists/inquiries`: búsqueda autenticada, filtros validados y paginación estable con cursor (`limit` máximo 100); no devuelve totales costosos ni permite nombres de columna de ordenamiento arbitrarios.

## Búsqueda y paginación del panel

- Las cuatro bandejas realizan una primera carga en servidor y consultan páginas siguientes desde `/api/admin/lists/[module]`. La paginación usa `(updated_at, id)` como cursor compuesto; el desempate por UUID evita saltos cuando hay fechas iguales.
- Las búsquedas aceptan texto acotado, rango de fechas y filtros específicos por módulo: archivo para clientes; estado y prioridad para órdenes; estado y plantilla para documentos; estado y canal para consultas.
- Los resultados se limitan a 25 por defecto y 100 como máximo. No se carga el directorio completo ni se solicita un `COUNT(*)` exacto en cada búsqueda.
- La migración `20261015000000_admin_search.sql` añade índices B-tree compuestos para orden y filtros, índices trigram para coincidencias parciales, índices GIN de texto completo para órdenes/consultas/documentos, y un campo `search_text` acotado a 4.000 caracteres para buscar en los datos variables de documentos. El cambio inicial de documentos llena ese campo; los cambios posteriores lo mantienen con un trigger.
- Las funciones SQL son `SECURITY INVOKER`, solo se conceden a `authenticated` y respetan las políticas RLS existentes. El API vuelve a comprobar que la cuenta tenga un perfil administrativo activo. La bandeja de consultas devuelve el contacto solo cuando existe consentimiento; el enlace público no recibe acceso a estos endpoints.
- Los filtros y el cursor se reflejan en la URL. La búsqueda de texto espera 300 ms después de escribir, cancela las solicitudes anteriores y muestra errores de API sin reemplazar silenciosamente los resultados.
- Las búsquedas parciales de 1 carácter se rechazan para evitar exploraciones amplias; se requiere un mínimo de 2 caracteres. Si el volumen crece, revisar planes reales con `EXPLAIN (ANALYZE, BUFFERS)` y ajustar o retirar índices según uso antes de añadir un motor de búsqueda externo.

## Controles de seguridad y operación

- RLS está habilitado en todas las tablas operativas; `anon` no puede leer clientes, órdenes, eventos ni claves.
- Las consultas solo son legibles por personal activo; la escritura pública pasa por una función SQL que valida campos y no conserva datos de contacto sin autorización.
- El código de referencia no permite consultar la consulta ni revela su contenido. Definir y operar un plazo de conservación antes de producción; esta migración no elimina automáticamente consultas ni datos de contacto.
- La interfaz privada autentica con `auth.getUser()` y confirma un perfil activo. Las Server Actions repiten la autorización y validan los campos con Zod.
- El enlace público es una credencial tipo bearer de alta entropía. Compartirlo permite consultar el estado de esa orden; debe revocarse deshabilitando su fila en `service_tracking_tokens`.
- Los broadcasts son privados. La política de `realtime.messages` valida que el hash del tópico pertenezca a una clave habilitada; los eventos de estado no incluyen RUT, contacto, notas internas ni descripción técnica.
- El estado del equipo cambia mediante una función SQL que guarda la actualización y el evento histórico atómicamente.
- Los documentos contienen datos personales para operación del servicio. Imprimir/descargar solo en dispositivos controlados y entregar por canal acordado.

## Limitaciones iniciales

- Los importes se almacenan como CLP enteros dentro de `numeric`; aún no hay módulo de pagos ni emisión tributaria.
- Las invitaciones dependen de Supabase Auth y de `SUPABASE_SERVICE_ROLE_KEY`, disponible solo en el servidor. Desactivar un perfil bloquea el acceso a la aplicación y sus políticas RLS.
- El registro de tareas admite nuevas entradas, no edición/borrado del historial.
- El seguimiento refresca por Realtime y consulta de respaldo cada 15 segundos; depende de habilitar Realtime y desplegar la migración.
- El formulario limita el tamaño y valida el origen; antes de publicarlo, configurar protección antispam o límites de solicitudes en el proveedor de despliegue.
