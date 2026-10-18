export type DocumentTemplateId =
  | "privacy-notice"
  | "equipment-intake"
  | "service-proposal"
  | "intervention-authorization"
  | "remote-access-consent"
  | "work-report"
  | "warranty-policy"
  | "data-deletion-certificate"
  | "data-processing-agreement"
  | "asset-inventory";

export type DocumentField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "checkbox" | "email";
  required?: boolean;
  requiredForSend?: boolean;
  hint?: string;
};

export type DocumentSection = {
  title: string;
  fields?: string[];
  paragraphs?: string[];
};

export type DocumentTemplate = {
  id: DocumentTemplateId;
  title: string;
  description: string;
  sections: DocumentSection[];
  fields: DocumentField[];
};

function fields(...items: Array<[string, string, DocumentField["type"]?, string?, boolean?]>): DocumentField[] {
  return items.map(([name, label, type = "text", hint, requiredForSend]) => ({
    name,
    label,
    type,
    hint,
    requiredForSend,
  }));
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "privacy-notice",
    title: "Aviso de privacidad de consultas",
    description: "Aviso para entregar a una persona que envía una consulta o solicita una cotización.",
    fields: fields(
      ["nombre", "Nombre de la persona", "text"],
      ["contacto", "Correo o teléfono de contacto", "text"],
      ["fecha", "Fecha", "date"],
      ["aceptacion", "Acepta el tratamiento para responder la consulta", "checkbox"],
      ["retencion", "Plazo de conservación de consultas sin servicio", "text", "Propuesta base: 6 meses. Validar antes de usar.", true],
    ),
    sections: [
      {
        title: "Aviso",
        paragraphs: [
          "ZIPEK TECNOLOGÍA SpA (RUT 76.850.804-6) usa los datos entregados —como nombre, medio de contacto, descripción del problema y datos del equipo— solo para responder la consulta, cotizar y coordinar el servicio.",
          "No envíes contraseñas ni códigos de verificación. Si la consulta no se convierte en un servicio, se conserva durante el plazo indicado en este aviso y luego se elimina. Si hay servicio, los documentos que corresponda se conservan por el tiempo que exijan las obligaciones aplicables.",
          "Los datos no se venden. Solo se comparten con proveedores necesarios para prestar el servicio o cuando la ley lo exige. Para ejercer derechos o consultar sobre el tratamiento, escribe al correo de contacto de Zipek.",
        ],
        fields: ["retencion"],
      },
      { title: "Constancia de entrega", fields: ["nombre", "contacto", "fecha", "aceptacion"] },
    ],
  },
  {
    id: "equipment-intake",
    title: "Orden de ingreso de equipo",
    description: "Registra el equipo, accesorios, estado físico y costo de revisión antes de recibirlo.",
    fields: fields(
      ["numero_orden", "N.º de orden", "text"],
      ["fecha", "Fecha y hora", "text"],
      ["cliente", "Cliente", "text"],
      ["rut", "RUT", "text"],
      ["telefono", "Teléfono / WhatsApp", "text"],
      ["correo", "Correo", "email"],
      ["tipo_equipo", "Tipo de equipo", "text"],
      ["marca_modelo", "Marca y modelo", "text"],
      ["serie", "Número de serie", "text"],
      ["accesorios", "Accesorios entregados", "textarea"],
      ["estado_fisico", "Estado físico al recibirlo", "textarea"],
      ["problema", "Problema que describe el cliente", "textarea", undefined, true],
      ["archivos_importantes", "¿Hay archivos importantes?", "text"],
      ["respaldo_existente", "¿Existe un respaldo?", "text"],
      ["costo_revision", "Costo de revisión informado (CLP; indicar si es sin costo)", "text", undefined, true],
      ["canal_aviso", "Canal para avisar la cotización", "text"],
      ["plazo_retiro", "Plazo acordado para coordinar retiro tras aviso", "text", "Propuesta base: 30 días; confirmar con el cliente."],
    ),
    sections: [
      {
        title: "Ingreso",
        fields: [
          "numero_orden", "fecha", "cliente", "rut", "telefono", "correo",
          "tipo_equipo", "marca_modelo", "serie", "accesorios", "estado_fisico",
          "problema", "archivos_importantes", "respaldo_existente", "costo_revision",
        ],
      },
      {
        title: "Condiciones informadas",
        fields: ["canal_aviso", "plazo_retiro"],
        paragraphs: [
          "La revisión sirve para diagnosticar y cotizar. No se hace ninguna reparación ni cambio sin autorización por escrito.",
          "No se reciben contraseñas escritas en esta orden. Si se necesita acceso, se coordina con el cliente.",
          "Un equipo con fallas puede perder información o no encender durante la revisión. Si hay archivos importantes, el cliente debe avisarlo antes.",
          "Se avisará por el canal indicado cuando esté la cotización. Si transcurre el plazo acordado desde el aviso de término sin retirar el equipo, se contactará al cliente para coordinar su retiro.",
        ],
      },
    ],
  },
  {
    id: "service-proposal",
    title: "Propuesta de servicio",
    description: "Detalla tareas, exclusiones, costos, vigencia, forma de pago y garantía.",
    fields: fields(
      ["numero_propuesta", "N.º de propuesta", "text", undefined, true],
      ["fecha", "Fecha", "date", undefined, true],
      ["valida_hasta", "Válida hasta", "date", undefined, true],
      ["cliente", "Cliente", "text"],
      ["equipo_sistema", "Equipos o sistemas incluidos", "textarea", undefined, true],
      ["modalidad", "Modalidad (remota / Quillota / fuera de Quillota)", "text", undefined, true],
      ["situacion", "Situación encontrada", "textarea", undefined, true],
      ["tareas", "Tareas incluidas (una por línea)", "textarea", undefined, true],
      ["exclusiones", "No incluye (indica “Nada adicional” si corresponde)", "textarea", undefined, true],
      ["mano_obra", "Mano de obra (CLP)", "text"],
      ["repuestos_licencias", "Repuestos o licencias (CLP)", "text"],
      ["traslado", "Traslado (CLP)", "text"],
      ["total", "Total calculado (CLP)", "text", undefined, true],
      ["tratamiento_tributario", "Tratamiento de IVA / impuestos (validar antes de enviar)", "textarea", undefined, true],
      ["fecha_entrega", "Fecha estimada de entrega", "text"],
      ["forma_pago", "Forma de pago y anticipo", "textarea", undefined, true],
      ["garantia", "Garantía aplicable (indica expresamente si no aplica)", "text", "La garantía debe definirse para este caso.", true],
    ),
    sections: [
      { title: "Identificación y alcance", fields: ["numero_propuesta", "fecha", "valida_hasta", "cliente", "equipo_sistema", "modalidad", "situacion", "tareas", "exclusiones"] },
      { title: "Costos y condiciones", fields: ["mano_obra", "repuestos_licencias", "traslado", "total", "tratamiento_tributario", "fecha_entrega", "forma_pago", "garantia"] },
      {
        title: "Aceptación",
        paragraphs: [
          "El cliente puede aceptar o rechazar esta propuesta mediante el enlace seguro incluido en el correo. La aceptación queda registrada con nombre y fecha, y autoriza únicamente el alcance y total indicados.",
          "Si durante el trabajo cambia el alcance o el precio, el servicio se pausa y se consulta. No se realiza ningún adicional sin una nueva aprobación del cliente.",
        ],
      },
    ],
  },
  {
    id: "intervention-authorization",
    title: "Autorización de intervención y respaldo",
    description: "Deja constancia del alcance autorizado, las opciones de respaldo y la aprobación del cliente.",
    fields: fields(
      ["orden_propuesta", "N.º de orden o propuesta", "text"],
      ["cliente", "Cliente", "text"],
      ["equipo", "Equipo", "text"],
      ["problema", "Problema reportado", "textarea"],
      ["tareas_autorizadas", "Tareas autorizadas y límites", "textarea", undefined, true],
      ["datos_revisables", "Información o ubicaciones que podrían revisarse", "textarea"],
      ["precio", "Precio acordado (CLP)", "text", undefined, true],
      ["forma_pago", "Forma de pago / condiciones", "text"],
      ["archivos_respaldo", "Archivos o carpetas a respaldar", "textarea"],
      ["origen_respaldo", "Origen del respaldo", "text"],
      ["destino_respaldo", "Destino o medio de almacenamiento", "text"],
      ["responsable_medio", "Quién aporta el medio de almacenamiento", "text"],
      ["respaldo_estado", "Decisión / estado del respaldo", "text", undefined, true],
      ["plazo_copias", "Fecha o plazo acordado para devolver o eliminar la copia", "text"],
      ["riesgos_informados", "Riesgos o limitaciones informados", "textarea"],
      ["fecha", "Fecha y hora de aceptación", "text"],
    ),
    sections: [
      { title: "Intervención autorizada", fields: ["orden_propuesta", "cliente", "equipo", "problema", "tareas_autorizadas", "datos_revisables", "precio", "forma_pago"] },
      {
        title: "Respaldo de información",
        fields: ["archivos_respaldo", "origen_respaldo", "destino_respaldo", "responsable_medio", "respaldo_estado", "plazo_copias"],
        paragraphs: [
          "Solo se copiarán los datos especificados. La posibilidad de copiar o recuperar información depende del estado del equipo y del medio de almacenamiento.",
          "Cuando sea técnicamente posible, se verificará que la copia se haya completado. Esto no garantiza que todos los archivos estén íntegros, sean legibles o recuperables, ni la recuperación de datos inaccesibles, dañados o sobrescritos.",
          "Un intento de recuperación que no esté incluido en las tareas y el precio indicados requiere cotización y autorización por separado. Reinstalar el sistema o formatear puede borrar los datos del equipo.",
        ],
      },
      {
        title: "Declaraciones y riesgos",
        fields: ["riesgos_informados"],
        paragraphs: [
          "El cliente declara ser titular del equipo y los datos o tener autorización suficiente para solicitar el trabajo. Zipek solo instala software con licencia vigente o alternativas libres y legales.",
          "No se deben entregar contraseñas por escrito. Si se necesita una clave, el cliente la ingresa cuando sea posible. No se conserva la contraseña tras el servicio.",
          "Cualquier tarea adicional requiere nueva autorización y precio acordado. La información se utiliza solo para el servicio y las copias temporales se devuelven o eliminan según lo acordado.",
        ],
      },
      { title: "Aceptación", fields: ["fecha"], paragraphs: ["Firma del cliente: __________________________________    Firma del técnico: __________________________________"] },
    ],
  },
  {
    id: "remote-access-consent",
    title: "Consentimiento de acceso remoto",
    description: "Registra autorización para acceder al equipo a distancia y los datos de la sesión.",
    fields: fields(
      ["cliente", "Cliente", "text"],
      ["fecha", "Fecha", "date"],
      ["orden_propuesta", "N.º de orden o propuesta", "text"],
      ["herramienta", "Herramienta de acceso remoto", "text", undefined, true],
      ["inicio_sesion", "Inicio de sesión", "text"],
      ["termino_sesion", "Término de sesión", "text"],
      ["tareas_realizadas", "Tareas realizadas", "textarea"],
      ["aceptacion", "Aceptación del cliente", "checkbox"],
      ["observaciones", "Observaciones", "textarea"],
    ),
    sections: [
      {
        title: "Consentimiento",
        fields: ["cliente", "fecha", "orden_propuesta", "herramienta", "aceptacion"],
        paragraphs: [
          "El cliente inicia la sesión y permanece presente mientras dure, salvo acuerdo escrito distinto. Zipek accede solo a lo necesario para las tareas acordadas.",
          "El cliente puede cortar la sesión en cualquier momento. Zipek no guarda contraseñas ni las pide por mensaje. Al terminar, se cierra la sesión y se elimina o desactiva cualquier acceso creado.",
          "Si se graba la sesión, se informará antes y se explicará para qué se usa. También puede aceptarse por escrito respondiendo: «Acepto el acceso remoto en las condiciones indicadas».",
        ],
      },
      { title: "Registro de la sesión", fields: ["inicio_sesion", "termino_sesion", "tareas_realizadas", "observaciones"] },
    ],
  },
  {
    id: "work-report",
    title: "Informe de trabajo y acta de conformidad",
    description: "Resume el trabajo, pruebas, pendientes, costos, respaldo y recepción del servicio.",
    fields: fields(
      ["orden_propuesta", "N.º de orden o propuesta", "text"],
      ["cliente", "Cliente", "text"],
      ["equipo", "Equipo", "text"],
      ["fecha_entrega", "Fecha de entrega", "date"],
      ["tareas_realizadas", "Tareas realizadas (una por línea)", "textarea", undefined, true],
      ["hallazgos", "Hallazgos y recomendaciones en lenguaje simple", "textarea"],
      ["pruebas", "Pruebas realizadas y resultado", "textarea", undefined, true],
      ["pendientes", "Pendientes o limitaciones", "textarea"],
      ["respaldo", "Respaldo (copia entregada / medio devuelto / no corresponde)", "text"],
      ["cotizado", "Total cotizado (CLP)", "text"],
      ["cobrado", "Total cobrado (CLP)", "text"],
      ["diferencia", "Motivo de diferencia y autorización, si corresponde", "textarea"],
      ["garantia_hasta", "Garantía aplicable hasta", "date"],
      ["conformidad", "Conformidad u observaciones del cliente", "textarea"],
    ),
    sections: [
      { title: "Servicio realizado", fields: ["orden_propuesta", "cliente", "equipo", "fecha_entrega", "tareas_realizadas", "hallazgos", "pruebas", "pendientes", "respaldo"] },
      { title: "Costos y garantía", fields: ["cotizado", "cobrado", "diferencia", "garantia_hasta"] },
      {
        title: "Acta de conformidad",
        fields: ["conformidad"],
        paragraphs: [
          "El cliente declara recibir el equipo o servicio funcionando conforme a lo acordado, o con las observaciones indicadas arriba.",
          "Firma del cliente: __________________________________    Entrega por Zipek: __________________________________",
        ],
      },
    ],
  },
  {
    id: "warranty-policy",
    title: "Política de garantía",
    description: "Entrega las condiciones de garantía junto con la propuesta o el informe de servicio.",
    fields: fields(
      ["dias_garantia", "Plazo de garantía en días corridos", "text", "Definir de acuerdo con la propuesta aceptada.", true],
      ["fecha_entrega", "Fecha de entrega", "date", undefined, true],
      ["orden", "N.º de orden asociada", "text"],
    ),
    sections: [
      {
        title: "Cobertura",
        fields: ["dias_garantia", "fecha_entrega", "orden"],
        paragraphs: [
          "Esta política aplica al trabajo descrito en el informe del servicio. En los planes para pymes, la garantía se define en la propuesta aceptada.",
          "Si una tarea realizada por Zipek vuelve a fallar por una causa atribuible a ese trabajo dentro del plazo indicado desde la entrega, se evaluará y, si corresponde, se corregirá sin costo.",
          "Los repuestos y equipos tienen la garantía del fabricante o proveedor, que se informará cuando se compren por encargo del cliente.",
        ],
      },
      {
        title: "Exclusiones y solicitud",
        paragraphs: [
          "No cubre fallas nuevas o distintas; daños posteriores por golpes, líquidos, sobrecargas o mal uso; virus o estafas posteriores; intervención de terceros; software sin licencia instalado por el cliente; ni pérdida de datos no respaldados cuando el riesgo fue informado.",
          "Para solicitar evaluación, escribe por WhatsApp o correo indicando el número de orden y qué ocurrió. Zipek informará si corresponde cobertura.",
          "Esta política no limita los derechos que reconoce la Ley 19.496 sobre protección de los derechos de los consumidores.",
        ],
      },
    ],
  },
  {
    id: "data-deletion-certificate",
    title: "Constancia de eliminación o devolución de datos",
    description: "Deja registro de copias devueltas, datos eliminados y accesos revocados al cerrar un caso.",
    fields: fields(
      ["orden_propuesta", "N.º de orden o propuesta", "text"],
      ["cliente", "Cliente", "text"],
      ["fecha", "Fecha", "date", undefined, true],
      ["copia_devuelta", "Copia devuelta y medio", "text"],
      ["copias_eliminadas", "Copias eliminadas y ubicación", "text"],
      ["accesos_cerrados", "Accesos remotos o cuentas temporales revocadas", "text"],
      ["temporales_eliminados", "Archivos temporales y papeleras eliminados", "text"],
      ["metodo", "Método de eliminación", "text"],
      ["excepcion", "Excepción de retención", "textarea"],
      ["responsable", "Responsable en Zipek", "text", undefined, true],
      ["recibido_por", "Recibí conforme (cliente)", "text"],
    ),
    sections: [
      {
        title: "Registro de cierre",
        fields: ["orden_propuesta", "cliente", "fecha", "copia_devuelta", "copias_eliminadas", "accesos_cerrados", "temporales_eliminados", "metodo"],
        paragraphs: ["ZIPEK TECNOLOGÍA SpA deja constancia de las acciones indicadas respecto de los datos recibidos para el servicio."],
      },
      {
        title: "Excepciones y recepción",
        fields: ["excepcion", "responsable", "recibido_por"],
        paragraphs: ["Los documentos tributarios y de cobro que la ley exija conservar se mantienen por el plazo aplicable; esta excepción no implica conservar archivos del cliente."],
      },
    ],
  },
  {
    id: "data-processing-agreement",
    title: "Acuerdo de encargado de tratamiento de datos",
    description: "Anexo para clientes pyme; completar junto al contrato de soporte y validar legalmente.",
    fields: fields(
      ["responsable_empresa", "Empresa responsable y RUT", "text", undefined, true],
      ["contrato", "Contrato de soporte (número y fecha)", "text", undefined, true],
      ["titulares", "Titulares cuyos datos podrían tratarse", "text"],
      ["categorias", "Categorías de datos", "textarea", undefined, true],
      ["herramientas", "Herramientas de terceros utilizadas", "textarea"],
      ["plazo_derechos", "Plazo para derivar solicitudes de titulares", "text", "Borrador base: 2 días hábiles; validar."],
      ["plazo_incidentes", "Plazo máximo de aviso de incidentes", "text", "Borrador base: 48 horas; validar."],
      ["plazo_devolucion", "Plazo para devolver o eliminar datos tras el término", "text", "Borrador base: 30 días; validar."],
      ["fecha", "Fecha del acuerdo", "date"],
      ["responsable_firma", "Nombre y cargo de quien firma por la empresa", "text"],
      ["zipek_firma", "Nombre y cargo de quien firma por Zipek", "text"],
    ),
    sections: [
      {
        title: "Partes y alcance",
        fields: ["responsable_empresa", "contrato", "titulares", "categorias"],
        paragraphs: [
          "1. Objeto: Zipek trata datos personales por cuenta del Responsable solo para prestar el soporte descrito en el contrato indicado.",
          "2. Datos y titulares: se limita a los datos necesarios contenidos en equipos, correos y respaldos a los que Zipek acceda para el servicio.",
        ],
      },
      {
        title: "Obligaciones",
        fields: ["herramientas", "plazo_derechos", "plazo_incidentes", "plazo_devolucion"],
        paragraphs: [
          "3. Instrucciones: Zipek trata datos solo según instrucciones documentadas del Responsable y le avisa si considera que una instrucción puede contravenir la ley.",
          "4. Confidencialidad: las personas que acceden a datos por Zipek mantienen reserva, incluso después del término.",
          "5. Seguridad: acceso mínimo necesario, autenticación multifactor donde esté disponible, respaldos cifrados, equipos actualizados y cuentas individuales.",
          "6. Terceros: Zipek informa las herramientas que traten datos y avisa antes de incorporar otras.",
          "7. Derechos: Zipek deriva solicitudes de titulares al Responsable dentro del plazo indicado y ayuda a responder.",
          "8. Incidentes: Zipek informa sin demora injustificada y dentro del plazo indicado sobre pérdida, filtración o acceso no autorizado, incluyendo las medidas adoptadas.",
          "9. Término: Zipek devuelve o elimina datos en el plazo indicado y entrega constancia, salvo obligación legal de conservación.",
          "10. Verificación: el Responsable puede solicitar información razonable para verificar el cumplimiento de este acuerdo.",
        ],
      },
      {
        title: "Firmas",
        fields: ["fecha", "responsable_firma", "zipek_firma"],
        paragraphs: ["Firma Responsable: __________________________________    Firma Zipek: __________________________________"],
      },
    ],
  },
  {
    id: "asset-inventory",
    title: "Inventario de equipos y licencias",
    description: "Registra equipos, software y recomendaciones sin guardar claves completas de licencias.",
    fields: fields(
      ["cliente", "Cliente / empresa", "text"],
      ["fecha", "Fecha del levantamiento", "date"],
      ["responsable", "Levantado por", "text"],
      ["equipos", "Equipos (una fila por equipo)", "textarea", "Usa columnas separadas por |: ID | tipo | marca/modelo | usuario | sistema operativo | antigüedad | almacenamiento | estado | observaciones.", true],
      ["software", "Software y licencias (una fila por programa)", "textarea", "Usa columnas separadas por |: programa | versión | tipo de licencia | referencia parcial | vence | equipos | situación | prioridad. No anotes claves completas."],
      ["urgente", "Recomendaciones urgentes", "textarea"],
      ["proximos_meses", "Acciones para los próximos 6 a 12 meses", "textarea"],
      ["alternativas", "Alternativas legales sugeridas", "textarea"],
      ["respaldo_actual", "Respaldo actual y frecuencia", "textarea"],
    ),
    sections: [
      {
        title: "Identificación e inventario de equipos",
        fields: ["cliente", "fecha", "responsable", "equipos"],
        paragraphs: ["No anotes claves completas de licencias. Usa una referencia parcial, como los últimos cuatro caracteres, o indica dónde está guardada."],
      },
      { title: "Software y licencias", fields: ["software"] },
      { title: "Resumen y recomendaciones", fields: ["urgente", "proximos_meses", "alternativas", "respaldo_actual"] },
    ],
  },
];

export function getDocumentTemplate(id: string): DocumentTemplate | undefined {
  return documentTemplates.find((template) => template.id === id);
}

export function getDocumentFieldValues(
  template: DocumentTemplate,
  client: { full_name: string; rut: string | null; phone: string; email: string | null },
  order?: { order_number: string; equipment_brand: string | null; equipment_model: string | null; equipment_serial: string | null },
  existing: Record<string, string> = {},
): Record<string, string> {
  const todayInChile = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const equipment = [
    order?.equipment_brand,
    order?.equipment_model,
  ].filter(Boolean).join(" ");
  const defaults: Record<string, string> = {
    cliente: client.full_name,
    nombre: client.full_name,
    rut: client.rut ?? "",
    telefono: client.phone,
    contacto: client.email ?? client.phone,
    correo: client.email ?? "",
    equipo: equipment,
    equipo_sistema: equipment,
    marca_modelo: equipment,
    numero_orden: order?.order_number ?? "",
    orden: order?.order_number ?? "",
    orden_propuesta: order?.order_number ?? "",
    serie: order?.equipment_serial ?? "",
    fecha: todayInChile,
    retencion: "6 meses",
    plazo_derechos: "2 días hábiles",
    plazo_incidentes: "48 horas",
    plazo_devolucion: "30 días",
  };

  return Object.fromEntries(
    template.fields.map((field) => [
      field.name,
      existing[field.name] ?? defaults[field.name] ?? "",
    ]),
  );
}
