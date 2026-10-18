import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ClipboardCheck,
  FileCheck2,
  HardDrive,
  Laptop,
  LockKeyhole,
  MessageCircle,
  ScanSearch,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import CopyPostButton from "@/components/resources/CopyPostButton";
import { getWhatsAppUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Recursos, herramientas y transparencia",
  description: `Conoce el proceso de soporte, las herramientas de referencia, alternativas de software y guías de ${siteConfig.name} en Quillota.`,
  alternates: { canonical: "/recursos" },
};

const toolGroups = [
  {
    icon: ScanSearch,
    title: "Diagnóstico",
    description: "Revisiones de almacenamiento, memoria, rendimiento y eventos del sistema para orientar el siguiente paso.",
    tools: ["Utilidades integradas de Windows", "CrystalDiskInfo y MemTest86+", "HWiNFO, según licencia y necesidad"],
  },
  {
    icon: HardDrive,
    title: "Instalación y respaldo",
    description: "Medios oficiales y herramientas de copia; la recuperación depende del estado del dispositivo y los datos.",
    tools: ["Medios oficiales de Microsoft", "Robocopy y Clonezilla", "TestDisk / PhotoRec para evaluación de casos"],
  },
  {
    icon: Wrench,
    title: "Software y controladores",
    description: "Instaladores obtenidos desde fuentes oficiales y controladores del fabricante o Windows Update.",
    tools: ["Winget para consultar e instalar paquetes", "Drivers oficiales del fabricante", "Alternativas libres cuando correspondan"],
  },
  {
    icon: LockKeyhole,
    title: "Soporte remoto y redes",
    description: "El acceso remoto se coordina contigo y requiere autorización. Las pruebas de red se limitan a sistemas autorizados.",
    tools: ["Asistencia rápida de Windows o RustDesk", "AnyDesk / TeamViewer solo con licencia comercial aplicable", "Herramientas de red según alcance autorizado"],
  },
];

const softwareCatalog = [
  { name: "LibreOffice", use: "Documentos, planillas y presentaciones", license: "Alternativa libre; compatibilidad de formatos puede variar." },
  { name: "Microsoft 365", use: "Ofimática y colaboración", license: "Requiere una licencia válida del cliente o contratada por separado." },
  { name: "Firefox o Chrome", use: "Navegación web", license: "Se instala desde la fuente oficial y según preferencia del cliente." },
  { name: "7-Zip", use: "Comprimir y extraer archivos", license: "Software libre; se confirma versión y origen de descarga." },
  { name: "VLC", use: "Reproducción de audio y video", license: "Software libre; se instala si resulta adecuado para el equipo." },
  { name: "SumatraPDF o Acrobat Reader", use: "Lectura de documentos PDF", license: "Opciones con condiciones de licencia distintas; se elige según necesidad." },
];

const serviceSteps = [
  ["01", "Recepción", "Registramos el equipo y las observaciones que nos compartes."],
  ["02", "Evaluación", "Revisamos los síntomas y aclaramos qué se puede comprobar."],
  ["03", "Cotización", "Recibes alcance, exclusiones, costos y condiciones por escrito."],
  ["04", "Autorización", "Esperamos tu aprobación; los adicionales se consultan aparte."],
  ["05", "Ejecución", "Realizamos solo el trabajo autorizado y acordado."],
  ["06", "Pruebas", "Comprobamos las funciones relacionadas con el servicio."],
  ["07", "Informe", "Te explicamos lo realizado y las observaciones de entrega."],
];

const posts = [
  {
    week: "Semana 1 · Publicación 1",
    title: "Equipo lento: revisa antes de cambiar piezas",
    copy: `¿Tu computador está lento, se congela o demora en iniciar? El mismo síntoma puede tener distintas causas: almacenamiento, memoria, programas al inicio o temperatura. Una revisión ayuda a decidir con información y cotizar antes de autorizar un cambio.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 1 · Publicación 2",
    title: "Un proceso claro antes de intervenir",
    copy: `Así trabajamos en ZIPEK: recibimos el equipo, evaluamos el problema, enviamos una cotización con alcance, esperamos tu autorización, ejecutamos lo aprobado, probamos y entregamos un informe. Si aparece un adicional, primero lo conversamos contigo.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 2 · Publicación 1",
    title: "Qué revisar antes de reinstalar",
    copy: `Antes de reinstalar, haz una lista de las carpetas que necesitas conservar y revisa Escritorio, Documentos, Descargas y Fotos. Confirma también qué cuenta sincroniza tus archivos e informa si el equipo presenta fallas de disco. La posibilidad de respaldar depende del estado del equipo y se acuerda antes de intervenir.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 2 · Publicación 2",
    title: "Revisión de compatibilidad con Windows 11",
    copy: `¿Tu computador sigue usando Windows 10? Su soporte estándar terminó el 14 de octubre de 2025. Antes de cambiar, conviene revisar el modelo, la compatibilidad con Windows 11, el estado del equipo y tus archivos. No todos los computadores cumplen los requisitos; conversamos alternativas antes de instalar.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 3 · Publicación 1",
    title: "Microsoft 365 o LibreOffice",
    copy: `¿Necesitas crear documentos y planillas? Microsoft 365 puede convenir si dependes de sus aplicaciones o colaboración y tienes una licencia adecuada. LibreOffice es una alternativa libre para muchas tareas habituales. La compatibilidad puede variar; la opción depende de lo que necesitas y de la licencia disponible.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 3 · Publicación 2",
    title: "Plantilla para compartir un caso real anónimo",
    copy: `Caso anónimo: un equipo presentaba [síntoma verificado]. Se autorizó [alcance específico]. Después del trabajo, se comprobó [resultado observable]. Recomendación: [consejo de cuidado pertinente].\n\nPublica este caso solo si corresponde a un servicio real y tienes autorización. Elimina nombres, archivos, pantallas, datos personales y números de serie. No publiques contraseñas ni información privada en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
    isTemplate: true,
  },
  {
    week: "Semana 4 · Publicación 1",
    title: "Señales que pueden justificar revisar un disco",
    copy: `¿Aparecen errores al abrir archivos, el equipo se congela o escuchas ruidos inusuales? Son señales que ameritan revisar, pero no confirman por sí solas que el disco deba cambiarse. Evaluamos el equipo, conversamos el riesgo para los datos y cotizamos antes de autorizar. La recuperación no se puede garantizar si el almacenamiento está dañado.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
  {
    week: "Semana 4 · Publicación 2",
    title: "Software legal y alternativas libres",
    copy: `¿Necesitas navegador, lector PDF, compresor o suite de oficina? Hay alternativas libres y opciones comerciales con licencia. Revisamos qué necesitas, descargamos desde fuentes oficiales y acordamos cualquier licencia de pago antes de instalar. En ZIPEK no usamos cracks ni activadores.\n\nNo publiques datos personales, contraseñas ni números de serie en los comentarios.\nEscríbeme el modelo y qué problema presenta para coordinar una evaluación`,
  },
];

export default function ResourcesPage() {
  return (
    <main className="flex-grow pt-20">
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(ellipse_at_top,rgba(12,150,170,0.14),transparent_60%)] px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-light/20 bg-primary-light/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-light">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Guías · herramientas · transparencia
              </p>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Tecnología explicada con claridad.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
                Conoce cómo evaluamos los equipos, qué alternativas de software podemos revisar y qué puedes preparar antes de solicitar soporte en Quillota.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/consultas?tema=Diagnóstico%20informático" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
                  Consultar por un diagnóstico <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#guias" className="inline-flex min-h-12 items-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/[0.05]">
                  Explorar guías
                </a>
              </div>
            </div>
            <aside className="rounded-2xl border border-white/10 bg-background/70 p-5 backdrop-blur sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary-light/20 bg-primary-light/[0.08] text-primary-light">
                  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-white">Primero claridad. Después, autorización.</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Recibes el alcance y los costos antes de empezar. No realizamos extras sin consultarte.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-gray-500">
                <MessageCircle className="h-4 w-4 text-primary-light" aria-hidden="true" />
                Atención local en {siteConfig.contact.city}; modalidad y disponibilidad se coordinan caso a caso.
              </div>
            </aside>
          </div>

          <nav aria-label="Secciones de recursos" className="mt-12 flex gap-2 overflow-x-auto border-t border-white/10 pt-5 text-sm">
            {[
              ["Proceso", "#proceso"],
              ["Herramientas", "#herramientas"],
              ["Software", "#software"],
              ["Transparencia", "#transparencia"],
              ["Guías", "#guias"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-gray-300 transition hover:border-primary-light/30 hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section id="proceso" className="scroll-mt-24 border-b border-white/[0.07] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Una ruta simple" title="De la consulta a una entrega clara." description="Cada etapa ayuda a saber qué sigue y quién debe aprobarlo." />
          <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {serviceSteps.map(([number, title, description]) => (
              <li key={number} className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-5">
                <span className="font-mono text-xs font-semibold tracking-widest text-primary-light">{number}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="herramientas" className="scroll-mt-24 border-b border-white/[0.07] bg-white/[0.015] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Criterio técnico" title="Herramientas elegidas para cada caso." description="Lo importante no es instalar muchas utilidades, sino revisar con métodos adecuados y explicarte qué se comprobó." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {toolGroups.map(({ icon: Icon, title, description, tools }) => (
              <article key={title} className="rounded-2xl border border-white/[0.09] bg-background/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-light/[0.08] text-primary-light">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-400">{description}</p>
                <ul className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
                  {tools.map((tool) => (
                    <li key={tool} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
                      {tool}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-4 text-sm leading-6 text-gray-400">
            <strong className="text-gray-200">Transparencia:</strong> estos son ejemplos de referencia, no un inventario exhaustivo ni una promesa de disponibilidad. La herramienta concreta se define según el equipo, el servicio autorizado y las condiciones de licencia vigentes; si requiere una licencia comercial o un costo adicional, se informa antes.
          </p>
        </div>
      </section>

      <section id="software" className="scroll-mt-24 border-b border-white/[0.07] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Catálogo orientativo" title="Programas según lo que necesitas hacer." description="La selección se conversa contigo. La instalación depende de compatibilidad, origen oficial y licencia aplicable." />
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[0.8fr_1.15fr_1.6fr] gap-5 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid">
              <span>Programa</span><span>Uso habitual</span><span>Licencia y observaciones</span>
            </div>
            <div className="divide-y divide-white/[0.08]">
              {softwareCatalog.map((item) => (
                <article key={item.name} className="grid gap-2 px-5 py-4 sm:grid-cols-[0.8fr_1.15fr_1.6fr] sm:gap-5">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-300">{item.use}</p>
                  <p className="text-sm leading-6 text-gray-500">{item.license}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            No usamos cracks ni activadores. Las licencias comerciales y compras de software no están incluidas salvo que la propuesta lo indique expresamente.
          </p>
        </div>
      </section>

      <section id="transparencia" className="scroll-mt-24 border-b border-white/[0.07] bg-white/[0.015] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Compromisos de servicio" title="Lo que acordamos antes del trabajo." description="La confianza se construye con condiciones entendibles, autorización y comunicación directa." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { icon: FileCheck2, title: "Alcance por escrito", text: "La propuesta detalla las tareas incluidas, exclusiones, costos, vigencia y condiciones aplicables." },
              { icon: ShieldCheck, title: "Sin extras no autorizados", text: "Si la evaluación revela otro trabajo, se pausa y se consulta antes de ejecutarlo." },
              { icon: HardDrive, title: "Respaldos conversados", text: "Definimos qué se intentará respaldar y dónde. La recuperación de archivos no se garantiza y depende del estado de los datos y el equipo." },
              { icon: LockKeyhole, title: "Acceso con consentimiento", text: "El acceso remoto o a archivos se coordina previamente con alcance y método acordados. No envíes contraseñas por formularios." },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="flex gap-4 rounded-xl border border-white/[0.09] bg-background/70 p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
                <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-400">{text}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm">
            <Link href="/seguridad" className="inline-flex items-center gap-2 text-primary-light hover:text-white"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Seguridad del servicio</Link>
            <Link href="/privacidad" className="inline-flex items-center gap-2 text-primary-light hover:text-white"><LockKeyhole className="h-4 w-4" aria-hidden="true" /> Política de privacidad</Link>
            <Link href="/terminos" className="inline-flex items-center gap-2 text-primary-light hover:text-white"><FileCheck2 className="h-4 w-4" aria-hidden="true" /> Términos del servicio</Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-gray-500">
            Esta página describe prácticas de atención y no constituye asesoría legal ni tributaria. Las condiciones específicas se confirman en cada propuesta; la normativa y las licencias deben verificarse con profesionales y fuentes oficiales.
          </p>
        </div>
      </section>

      <section id="guias" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Guías para compartir" title="Consejos prácticos para cuidar tus equipos." description="Textos listos para reutilizar en Google Business, estados de WhatsApp y redes locales. Puedes copiarlos y adaptarlos al formato." />
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 px-3 py-2 text-xs text-gray-400 sm:self-auto">
              <BookOpen className="h-4 w-4 text-primary-light" aria-hidden="true" /> 2 ideas por semana · 4 semanas
            </span>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {posts.map((post) => (
              <article key={post.title} className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-light">{post.week}</span>
                  {post.isTemplate && <span className="rounded-full border border-amber-200/20 bg-amber-100/[0.05] px-2.5 py-1 text-[11px] font-medium text-amber-100">Plantilla · completar con caso real</span>}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{post.title}</h3>
                <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-6 text-gray-300">{post.copy}</p>
                <CopyPostButton content={post.copy} />
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-gray-500">
            Revisa cada texto antes de publicarlo. Los casos se comparten solo si son reales, verificables y autorizados; elimina cualquier dato o imagen que permita identificar a una persona o equipo.
          </p>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-[#0a1120] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl border border-primary-light/15 bg-primary-light/[0.035] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-light"><Laptop className="h-4 w-4" aria-hidden="true" /> Atención en Quillota</p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Cuéntanos qué resultado necesitas.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">No hace falta conocer el nombre técnico de la falla. Conversamos el siguiente paso y confirmamos alcance, modalidad y costos antes de coordinar.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/consultas?tema=Soporte%20informático" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Enviar consulta
            </Link>
            <a href={getWhatsAppUrl("Hola, necesito coordinar una evaluación de mi equipo.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.05]">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-gray-400">{description}</p>
    </div>
  );
}
