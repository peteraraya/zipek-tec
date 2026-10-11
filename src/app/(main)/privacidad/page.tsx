

import { siteConfig } from "@/config/site";

export default function PrivacidadPage() {
  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
          <p className="text-gray-400 mb-6">Última actualización: {new Date().toLocaleDateString("es-CL")}</p>
          
          <div className="space-y-6 text-gray-300">
            <p>
              <strong>{siteConfig.name} ("{siteConfig.shortName}", "nosotros")</strong> es responsable del tratamiento de los datos personales que recolecta a través de su sitio web y en el marco de la prestación de sus servicios de desarrollo de software, sitios web, soporte remoto y consultoría tecnológica. Esta Política de Privacidad describe qué datos recolectamos, para qué los usamos, y qué derechos tienes sobre ellos, en conformidad con la legislación chilena vigente en materia de protección de datos personales.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">1. Datos que recolectamos</h2>
            <p>Dependiendo de cómo interactúes con nosotros, podemos recolectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de contacto:</strong> nombre, correo electrónico, teléfono, empresa y cargo, cuando completas un formulario de contacto o solicitas una cotización.</li>
              <li><strong>Datos de facturación:</strong> razón social, RUT, dirección, necesarios para emitir documentos tributarios.</li>
              <li><strong>Datos técnicos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, mediante cookies o herramientas de analítica web.</li>
              <li><strong>Datos de acceso a sistemas:</strong> en el marco de servicios de soporte remoto, podemos acceder temporalmente a sistemas, credenciales o información que tú nos facilites expresamente para resolver una incidencia.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8">2. Finalidades del tratamiento</h2>
            <p>Usamos tus datos personales para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder consultas, cotizar y ejecutar los proyectos o servicios contratados.</li>
              <li>Emitir facturas, boletas y demás documentos tributarios.</li>
              <li>Prestar soporte técnico remoto sobre los sistemas que administras o que hemos desarrollado para ti.</li>
              <li>Enviar comunicaciones relacionadas con el servicio contratado (avisos, actualizaciones, vencimientos).</li>
              <li>Cumplir obligaciones legales y tributarias.</li>
            </ul>
            <p>No vendemos ni compartimos tus datos personales con terceros para fines de marketing sin tu consentimiento expreso.</p>

            <h2 className="text-2xl font-semibold text-white mt-8">3. Base de licitud y conservación</h2>
            <p>
              Tratamos tus datos en base a la ejecución del contrato de servicios entre las partes, tu consentimiento cuando corresponda (por ejemplo, para envío de comunicaciones comerciales), y el cumplimiento de obligaciones legales. Conservamos tus datos mientras exista una relación contractual vigente y, posteriormente, durante los plazos exigidos por la normativa tributaria y comercial aplicable en Chile.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">4. Encargados y terceros proveedores</h2>
            <p>
              Podemos compartir datos con proveedores que nos prestan servicios necesarios para operar (por ejemplo, hosting, facturación electrónica, herramientas de soporte remoto), quienes están obligados contractualmente a proteger tu información y a usarla únicamente para los fines encomendados.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">5. Tus derechos</h2>
            <p>
              Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación, oposición y portabilidad sobre tus datos personales, escribiendo a <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">{siteConfig.contact.email}</a>. Responderemos tu solicitud dentro de los plazos que establece la normativa vigente.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">6. Seguridad de la información</h2>
            <p>
              Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales frente a accesos no autorizados, pérdida o alteración, incluyendo control de accesos, uso de conexiones cifradas y revocación de credenciales una vez finalizado un servicio de soporte remoto.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">7. Cookies</h2>
            <p>
              Nuestro sitio web puede utilizar cookies propias y/o de terceros para fines de analítica y funcionamiento. Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar la experiencia de navegación.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">8. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos cualquier cambio en esta misma página, indicando la fecha de la última actualización.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">9. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta Política de Privacidad o el tratamiento de tus datos personales, contáctanos en:
              <br />
              Correo: <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">{siteConfig.contact.email}</a>
            </p>
          </div>
        </div>
      </main>
      </>
  );
}
