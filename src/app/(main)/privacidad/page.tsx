

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
              <li><strong>Consultas web:</strong> tema y mensaje enviados mediante el formulario. Puedes enviarlos sin identificarte; el nombre, correo y teléfono son opcionales.</li>
              <li><strong>Datos de facturación:</strong> razón social, RUT, dirección, necesarios para emitir documentos tributarios.</li>
              <li><strong>Datos técnicos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, mediante cookies o herramientas de analítica web.</li>
              <li><strong>Datos de acceso a sistemas:</strong> en el marco de servicios de soporte remoto, podemos acceder temporalmente a sistemas, credenciales o información que tú nos facilites expresamente para resolver una incidencia.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8">2. Finalidades del tratamiento</h2>
            <p>Usamos tus datos personales para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder consultas, cotizar y ejecutar los proyectos o servicios contratados.</li>
              <li>Si autorizas expresamente el uso de tus datos de contacto en el formulario, utilizarlos solo para responder y dar seguimiento a esa consulta. No los usamos para publicidad.</li>
              <li>Emitir facturas, boletas y demás documentos tributarios.</li>
              <li>Prestar soporte técnico remoto o presencial sobre los equipos y sistemas que nos solicites revisar.</li>
              <li>Enviar comunicaciones relacionadas con un servicio que hayas solicitado o contratado.</li>
              <li>Cumplir obligaciones legales y tributarias.</li>
            </ul>
            <p>No vendemos ni compartimos tus datos personales con terceros para fines de marketing sin tu consentimiento expreso.</p>

            <h2 className="text-2xl font-semibold text-white mt-8">3. Base de licitud y conservación</h2>
            <p>
              Los datos de contacto del formulario se guardan únicamente si marcas la autorización y necesitamos un teléfono o correo para responder. Sin esa autorización, el formulario no conserva los campos de contacto. Conservamos las consultas mientras sean necesarias para atenderlas; los documentos de servicios contratados pueden conservarse por el tiempo que exijan las obligaciones aplicables. No usamos los datos de consultas para publicidad.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">4. Encargados y terceros proveedores</h2>
            <p>
              La información puede alojarse en proveedores de infraestructura que permiten operar el sitio y el panel de gestión. El equipo de {siteConfig.shortName} limita el acceso a quienes atienden el servicio.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">5. Tus derechos</h2>
            <p>
              Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación, oposición y portabilidad sobre tus datos personales, escribiendo a <a href={getEmailUrl()} className="text-primary hover:underline">{siteConfig.contact.email}</a>. Responderemos tu solicitud dentro de los plazos que establece la normativa vigente.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">6. Seguridad de la información</h2>
            <p>
              Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales frente a accesos no autorizados, pérdida o alteración, incluyendo control de accesos, uso de conexiones cifradas y revocación de credenciales una vez finalizado un servicio de soporte remoto.
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
