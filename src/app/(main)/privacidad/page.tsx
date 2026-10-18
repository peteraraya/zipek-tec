

import { getEmailUrl, siteConfig } from "@/config/site";

export default function PrivacidadPage() {
  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
          <p className="text-gray-400 mb-6">Última actualización: {new Date().toLocaleDateString("es-CL")}</p>
          
          <div className="space-y-6 text-gray-300">
            <p>
              <strong>{siteConfig.name} ({siteConfig.shortName})</strong> trata los datos que compartes al hacer una consulta o contratar soporte informático. Aquí explicamos qué información recibimos, para qué la usamos y cómo puedes contactarnos para solicitar su revisión o eliminación, cuando corresponda.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">1. Datos que recolectamos</h2>
            <p>Dependiendo de cómo interactúes con nosotros, podemos recolectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de contacto:</strong> nombre, correo electrónico y teléfono cuando los proporcionas para una consulta o servicio.</li>
              <li><strong>Consultas:</strong> tema, mensaje y, cuando solicitas una cotización, tipo de equipo, marca/modelo si lo indicas, tareas solicitadas, modalidad y comuna o sector. Puedes enviar una consulta general sin identificarte; una solicitud formal de cotización pide datos de contacto para poder responder.</li>
              <li><strong>Datos de facturación:</strong> razón social, RUT, dirección, necesarios para emitir documentos tributarios.</li>
              <li><strong>Analítica:</strong> si la autorizas, Vercel Analytics puede procesar información técnica de navegación según su servicio y política. La analítica no se carga antes de aceptar.</li>
              <li><strong>Información visible en los equipos:</strong> durante un servicio autorizado podríamos ver archivos o información presentes en las ubicaciones acordadas. No envíes contraseñas ni códigos por los formularios.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8">2. Finalidades del tratamiento</h2>
            <p>Usamos tus datos personales para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder consultas, cotizar y ejecutar los proyectos o servicios contratados.</li>
              <li>Si autorizas expresamente el uso de tus datos de contacto, utilizarlos para responder tu consulta, preparar una propuesta solicitada y coordinar ese servicio. No los usamos para publicidad.</li>
              <li>Emitir facturas, boletas y demás documentos tributarios.</li>
              <li>Prestar soporte técnico remoto o presencial sobre los equipos y sistemas que nos solicites revisar.</li>
              <li>Enviar comunicaciones relacionadas con un servicio que hayas solicitado o contratado.</li>
              <li>Cumplir obligaciones legales y tributarias.</li>
            </ul>
            <p>No vendemos ni compartimos tus datos personales con terceros para fines de marketing sin tu consentimiento expreso.</p>

            <h2 className="text-2xl font-semibold text-white mt-8">3. Base de licitud y conservación</h2>
            <p>
              Las consultas generales sin datos de contacto pueden enviarse anónimamente. Para solicitar una cotización, guardamos los datos de contacto y los detalles que envías si marcas la autorización mostrada en el formulario. Conservamos la información mientras atendemos la solicitud y durante el tiempo necesario para gestionar el servicio y cumplir obligaciones aplicables. El panel permite revisar posibles registros sujetos a retención, pero no ejecuta borrado automático; los plazos concretos deben definirse según el tipo de registro y sus obligaciones antes de programar su eliminación. No usamos los datos de consultas para publicidad.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">4. Encargados y terceros proveedores</h2>
            <p>
              La información puede alojarse en proveedores de infraestructura necesarios para operar el sitio, la base de datos, el correo y el panel. El correo y los mensajes enviados mediante WhatsApp quedan además sujetos a las políticas de esos proveedores. El equipo de {siteConfig.shortName} limita el acceso según las funciones administrativas asignadas.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">5. Tus derechos</h2>
            <p>
              Puedes escribir a <a href={getEmailUrl()} className="text-primary hover:underline">{siteConfig.contact.email}</a> para consultar o solicitar acceso, rectificación o eliminación de información. Atenderemos las solicitudes y otros derechos que correspondan conforme a la normativa aplicable; la eliminación puede estar sujeta a obligaciones legales o tributarias de conservación.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">6. Seguridad de la información</h2>
            <p>
              Aplicamos controles de acceso al panel, conexiones cifradas y permisos por función. Si un servicio requiere acceso remoto, su alcance y autorización deben acordarse antes de la sesión. No incluyas contraseñas ni códigos en consultas; el método de acceso se coordina según cada caso.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">7. Cookies</h2>
            <p>
              La analítica de visitas de Vercel solo se activa si la aceptas en el aviso del sitio. Si la rechazas, no se carga. Puedes cambiar esa decisión desde “Preferencias de analítica” en el pie de página. Guardamos tu elección en el almacenamiento local del navegador.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">8. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos cualquier cambio en esta misma página, indicando la fecha de la última actualización.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">9. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta Política de Privacidad o el tratamiento de tus datos personales, contáctanos en:
              <br />
              Correo: <a href={getEmailUrl()} className="text-primary hover:underline">{siteConfig.contact.email}</a>
            </p>
          </div>
        </div>
      </main>
      </>
  );
}
