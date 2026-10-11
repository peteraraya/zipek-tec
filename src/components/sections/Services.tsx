import { Check } from "lucide-react";

const serviciosPersonas = [
  "Puesta a punto legal: formateo, Windows con licencia o Linux, drivers y actualizaciones.",
  "Alternativas legales y gratis a software pirata (LibreOffice, OnlyOffice, Thunderbird, GIMP, Inkscape).",
  "Respaldos y recuperación: fotos, documentos, WhatsApp y correo, en la nube o disco externo.",
  "Seguridad: antivirus, contraseñas seguras, Wi‑Fi y prevención de estafas y phishing.",
  "Redes e impresoras: router, repetidor, impresora, escáner y cámaras.",
  "Capacitación personalizada: WhatsApp, correo, videollamadas, Excel y trámites en línea.",
];

const serviciosEmpresas = [
  "Revisión de licencias: informe confidencial de qué software está al día y qué conviene regularizar.",
  "Regularización: cotización de licencias oficiales y migración a software libre donde sea posible.",
  "Mantenimiento preventivo mensual: limpieza, actualizaciones, respaldos y revisión de discos.",
  "Soporte remoto y visitas programadas con atención clara y definida.",
  "Inventario y políticas: equipos, usuarios, contraseñas y respaldos.",
  "Asesoría de compra de equipos, licencias y antivirus.",
];

export default function Services() {
  return (
    <section id="servicios" className="py-20 relative bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Servicios para <span className="text-gradient">hogares y pymes</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Soporte informático legal, cercano y sin rodeos: soluciones prácticas para que tus equipos funcionen bien y sigan seguros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Para personas</p>
              <h3 className="mt-3 text-2xl font-bold text-white">Hogar</h3>
            </div>
            <ul className="space-y-4">
              {serviciosPersonas.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary-light" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Para empresas</p>
              <h3 className="mt-3 text-2xl font-bold text-white">Pyme</h3>
            </div>
            <ul className="space-y-4">
              {serviciosEmpresas.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary-light" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
