

import { siteConfig } from "@/config/site";

export default function TerminosPage() {
  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
          <p className="text-gray-400 mb-6">Última actualización: {new Date().toLocaleDateString("es-CL")}</p>
          
          <div className="space-y-6 text-gray-300">
            <p>
              Estos Términos y Condiciones regulan el uso del sitio web y la relación comercial general entre <strong>{siteConfig.name} ("{siteConfig.shortName}")</strong> y quienes visitan el sitio o solicitan información sobre sus servicios. Los términos específicos de cada proyecto contratado se rigen adicionalmente por el contrato de prestación de servicios o de soporte firmado entre las partes, el cual prevalece sobre este documento en caso de conflicto.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">1. Servicios ofrecidos</h2>
            <p>
              {siteConfig.shortName} presta servicios de desarrollo de software a medida, diseño y desarrollo de sitios y landing pages, soporte técnico remoto, y consultoría en optimización tecnológica para pequeñas y medianas empresas. La información publicada en el sitio web tiene carácter referencial; el alcance, precio y condiciones definitivas de cada servicio se establecen en la cotización y contrato correspondientes.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">2. Uso del sitio web</h2>
            <p>Al navegar en este sitio, el usuario se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizarlo de conformidad con la ley, la moral, el orden público y estos Términos.</li>
              <li>No realizar actividades que puedan dañar, inutilizar o sobrecargar el sitio, ni interferir con su normal funcionamiento.</li>
              <li>Proporcionar información veraz al completar formularios de contacto o solicitud de cotización.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8">3. Propiedad intelectual del sitio</h2>
            <p>
              El contenido de este sitio web (textos, logotipos, imágenes, diseño) es propiedad de {siteConfig.name} o de sus licenciantes, y está protegido por la normativa de propiedad intelectual vigente. Queda prohibida su reproducción total o parcial sin autorización previa y por escrito, salvo para uso personal no comercial.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">4. Cotizaciones y contratación de servicios</h2>
            <p>
              El envío de un formulario de contacto o la solicitud de una cotización no constituye, por sí solo, un contrato vinculante entre las partes. La relación contractual y las obligaciones de ambas partes nacen únicamente con la firma del contrato de prestación de servicios o de soporte correspondiente.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">5. Enlaces a sitios de terceros</h2>
            <p>
              Este sitio puede contener enlaces a sitios web de terceros. {siteConfig.shortName} no controla ni se responsabiliza por el contenido, políticas o prácticas de dichos sitios.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">6. Limitación de responsabilidad</h2>
            <p>
              {siteConfig.shortName} no garantiza que el sitio web esté libre de errores o interrupciones. El uso del sitio es responsabilidad exclusiva del usuario. La responsabilidad de {siteConfig.shortName} respecto de los servicios efectivamente contratados se rigen por lo establecido en el contrato de prestación de servicios respectivo.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">7. Modificaciones</h2>
            <p>
              {siteConfig.shortName} podrá modificar estos Términos y Condiciones en cualquier momento. Las modificaciones se entenderán vigentes desde su publicación en el sitio web.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">8. Legislación aplicable</h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la República de Chile. Para cualquier controversia derivada de su interpretación o aplicación, las partes se someten a la jurisdicción de los tribunales ordinarios de justicia de Santiago.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8">9. Contacto</h2>
            <p>
              Ante cualquier duda sobre estos Términos y Condiciones, puedes escribirnos a <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">{siteConfig.contact.email}</a>.
            </p>
          </div>
        </div>
      </main>
      </>
  );
}
