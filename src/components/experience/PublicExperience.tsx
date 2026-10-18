"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  Cpu,
  Eye,
  FileCheck2,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Video,
  VideoOff,
  Wifi,
} from "lucide-react";
import { getWhatsAppUrl, siteConfig } from "@/config/site";
import QuoteRequestForm from "@/components/experience/QuoteRequestForm";

const troubleshootingGuides = {
  startup: {
    title: "El equipo no inicia",
    icon: Laptop,
    steps: [
      "Comprueba que el cargador esté firme en ambos extremos y prueba otro enchufe.",
      "Desconecta accesorios USB y espera 30 segundos antes de volver a encender.",
      "Si escuchas ruidos inusuales, hay olor a quemado o el equipo se calienta mucho, apágalo y no insistas.",
    ],
    note: "No abras el equipo ni intentes recuperar archivos por tu cuenta si son importantes.",
  },
  slow: {
    title: "Está lento o se congela",
    icon: Cpu,
    steps: [
      "Guarda tu trabajo y reinicia el equipo una vez.",
      "Anota cuándo ocurre: al encender, abrir un programa o conectarte a internet.",
      "Evita instalar programas de limpieza desconocidos; pueden empeorar el problema.",
    ],
    note: "Una revisión permite distinguir problemas de almacenamiento, memoria, software o temperatura.",
  },
  internet: {
    title: "Falla internet o Wi-Fi",
    icon: Wifi,
    steps: [
      "Comprueba si otros equipos también perdieron conexión.",
      "Revisa si las luces del router están encendidas y espera un minuto.",
      "Si solo falla un equipo, prueba acercarte al router sin cambiar configuraciones avanzadas.",
    ],
    note: "No compartas la contraseña del Wi-Fi en el formulario público.",
  },
  security: {
    title: "Tengo una alerta o sospecha de estafa",
    icon: ShieldCheck,
    steps: [
      "No hagas clic en enlaces, no pagues y no entregues códigos de verificación.",
      "Cierra la ventana sospechosa sin llamar a los teléfonos que aparecen en ella.",
      "Si ingresaste una contraseña, cámbiala desde otro dispositivo confiable y activa la verificación en dos pasos.",
    ],
    note: "No envíes contraseñas, códigos ni capturas con datos personales.",
  },
} as const;

type SymptomKey = keyof typeof troubleshootingGuides;

const workOptions = [
  "Revisión y diagnóstico",
  "Respaldo o traslado de archivos",
  "Instalación o configuración de software",
  "Conectividad, Wi-Fi o impresora",
  "Orientación de seguridad",
];

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
      <h2 className="mt-3 text-3xl text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 leading-7 text-gray-400">{description}</p>
    </div>
  );
}

export default function PublicExperience() {
  const [symptom, setSymptom] = useState<SymptomKey | null>(null);
  const [device, setDevice] = useState("Notebook");
  const [modality, setModality] = useState("Por conversar");
  const [selectedWork, setSelectedWork] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeGuide = symptom ? troubleshootingGuides[symptom] : null;
  const summary = [
    `Equipo: ${device}`,
    `Modalidad preferida: ${modality}`,
    `Tareas a conversar: ${selectedWork.length ? selectedWork.join(", ") : "por definir"}`,
  ].join("\n");
  const quoteWhatsAppUrl = getWhatsAppUrl(
    `Hola, quiero solicitar una evaluación. ${summary} Entiendo que el precio, el alcance y la disponibilidad se confirman antes de comenzar.`,
  );
  const diagnosisWhatsAppUrl = getWhatsAppUrl(
    `Hola, necesito orientación inicial sobre: ${activeGuide?.title ?? "un problema con mi equipo"}. Quiero coordinar una evaluación; no incluiré contraseñas ni datos sensibles.`,
  );

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Este navegador no permite usar la cámara. Puedes seguir la guía visual sin activarla.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError("No se pudo iniciar la cámara. Revisa el permiso del navegador o usa la guía sin cámara.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  function toggleWork(option: string) {
    setSelectedWork((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  return (
    <div className="space-y-20 sm:space-y-28">
      <section id="orientacion" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Orientación inicial"
          title="Cuéntanos qué ocurre, sin tecnicismos."
          description="Elige el síntoma para ver pasos seguros que puedes probar. Esta guía es informativa: no realiza un diagnóstico automático ni reemplaza una evaluación técnica."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Object.entries(troubleshootingGuides).map(([key, guide]) => {
            const Icon = guide.icon;
            const active = symptom === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setSymptom(key as SymptomKey)}
                className={`flex min-h-16 items-center gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none ${
                  active
                    ? "border-primary-light/60 bg-primary-light/[0.09]"
                    : "border-white/10 bg-white/[0.025] hover:border-primary-light/30"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
                <span className="font-medium text-white">{guide.title}</span>
                {active && <Check className="ml-auto h-4 w-4 text-primary-light" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {activeGuide && (
          <section aria-live="polite" className="mt-5 rounded-2xl border border-primary-light/20 bg-primary-light/[0.04] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-1 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-white">Prueba estos pasos con cuidado</h3>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-gray-300">
                  {activeGuide.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <p className="mt-4 rounded-lg border border-white/10 bg-black/10 p-3 text-sm text-gray-300">{activeGuide.note}</p>
                <a
                  href={diagnosisWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Consultar por este problema
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        )}
        <p className="mt-4 text-xs leading-5 text-gray-500">
          La orientación se ejecuta en tu navegador; no enviamos tus selecciones a un servicio de IA ni guardamos un historial.
        </p>
      </section>

      <section id="cotizacion" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Preparar una cotización"
          title="Define qué necesitas conversar."
          description="Arma un resumen para solicitar una evaluación. No calculamos ni prometemos precios automáticamente: recibes una propuesta escrita antes de autorizar cualquier trabajo."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-200">
                Tipo de equipo
                <select value={device} onChange={(event) => setDevice(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white focus:border-primary-light focus:outline-none">
                  <option>Notebook</option>
                  <option>Computador de escritorio</option>
                  <option>Impresora o red</option>
                  <option>Otro equipo</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-200">
                Modalidad preferida
                <select value={modality} onChange={(event) => setModality(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white focus:border-primary-light focus:outline-none">
                  <option>Por conversar</option>
                  <option>Remota</option>
                  <option>Presencial en Quillota</option>
                  <option>Fuera de Quillota</option>
                </select>
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-200">¿Qué quieres revisar?</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {workOptions.map((option) => (
                  <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-primary-light/30">
                    <input type="checkbox" checked={selectedWork.includes(option)} onChange={() => toggleWork(option)} className="h-4 w-4 accent-primary" />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-5 text-gray-500">No incluyas contraseñas, RUT, códigos de acceso ni archivos personales en el mensaje.</p>
          </div>
          <aside className="flex flex-col rounded-2xl border border-primary-light/20 bg-primary-light/[0.045] p-5 sm:p-7">
            <ClipboardList className="h-6 w-6 text-primary-light" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-semibold text-white">Resumen para conversar</h3>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-gray-300">{summary}</pre>
            <p className="mt-auto pt-6 text-xs leading-5 text-gray-500">La revisión, repuestos, licencias, traslado y alcance se cotizan por separado cuando correspondan.</p>
            <a href={quoteWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Enviar resumen por WhatsApp
            </a>
            <Link href="/consultas?tema=Solicitud%20de%20cotizaci%C3%B3n" className="mt-3 text-center text-sm font-medium text-primary-light hover:text-white">
              Prefiero el formulario web
            </Link>
          </aside>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
          <QuoteRequestForm equipmentType={device} modality={modality} selectedWork={selectedWork} />
        </div>
      </section>

      <section id="identificar" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Guía visual"
          title="Encuentra el modelo de tu equipo."
          description="Una ayuda opcional para localizar la etiqueta del fabricante. La cámara solo se activa si tú lo decides; el video se muestra localmente y no se captura ni se envía."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(8,122,138,0.2),transparent_70%)] p-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              aria-label="Vista previa local de la cámara"
            />
            {cameraActive ? (
              <>
                <div aria-hidden="true" className="pointer-events-none absolute inset-[18%] rounded-xl border-2 border-primary-light/80 shadow-[0_0_0_999px_rgba(4,10,19,0.3)]">
                  <span className="absolute -top-2 -left-2 h-5 w-5 border-l-2 border-t-2 border-primary-light" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 border-r-2 border-t-2 border-primary-light" />
                  <span className="absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 border-primary-light" />
                  <span className="absolute -right-2 -bottom-2 h-5 w-5 border-r-2 border-b-2 border-primary-light" />
                </div>
                <span className="absolute bottom-4 rounded-full bg-black/70 px-3 py-1 text-xs text-white">Guía superpuesta · no detecta etiquetas</span>
              </>
            ) : (
              <div className="relative z-10 text-center">
                <div className="mx-auto grid h-24 w-36 place-items-center rounded-xl border border-primary-light/40 bg-slate-900 shadow-2xl">
                  <Laptop className="h-12 w-12 text-primary-light" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm text-gray-300">Revisa la parte inferior del notebook o la parte trasera del equipo.</p>
                <p className="mt-1 text-xs text-gray-500">Busca las palabras “Model”, “Modelo” o “Product”.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <h3 className="text-lg font-semibold text-white">Guía de identificación</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-gray-300">
              <li>Con el equipo apagado, revisa su base o parte trasera.</li>
              <li>Busca marca y modelo; el número de serie no es necesario para una consulta inicial.</li>
              <li>Si no encuentras la etiqueta, envíanos una consulta sin incluir información privada.</li>
            </ol>
            {cameraError && <p role="alert" className="mt-4 text-sm text-amber-200">{cameraError}</p>}
            <button type="button" onClick={cameraActive ? stopCamera : startCamera} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-primary-light/30 px-4 py-2.5 text-sm font-semibold text-primary-light hover:bg-primary-light/10">
              {cameraActive ? <VideoOff className="h-4 w-4" aria-hidden="true" /> : <Video className="h-4 w-4" aria-hidden="true" />}
              {cameraActive ? "Apagar cámara" : "Usar cámara opcional"}
            </button>
          </div>
        </div>
      </section>

      <section id="cobertura" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Atención local y remota"
          title="Cobertura clara, antes de coordinar."
          description="La modalidad depende del tipo de problema, la ubicación y la disponibilidad. Confirmamos cualquier visita y costo de traslado contigo."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <svg aria-hidden="true" viewBox="0 0 600 260" className="absolute inset-0 h-full w-full opacity-70">
              <path d="M30 182C100 152 106 208 173 166S272 190 318 138s79 31 126-17 87-30 126-75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" className="text-primary-light/60" />
              <path d="M-15 78c85 30 94-15 167 23s113-6 178 33 134-19 285 47M-5 223c90-41 127-8 205-45s101 4 167-37 135 13 240-48" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10" />
              <circle cx="280" cy="138" r="55" fill="currentColor" className="text-primary-light/5" />
              <circle cx="280" cy="138" r="29" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" className="text-primary-light/50" />
            </svg>
            <div className="relative z-10 flex min-h-52 flex-col items-center justify-center text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-primary-light/40 bg-background text-primary-light"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
              <p className="mt-3 font-semibold text-white">{siteConfig.contact.city}</p>
              <p className="mt-1 text-xs text-gray-400">Atención presencial sujeta a coordinación</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/80 px-3 py-1.5 text-xs text-gray-300"><Monitor className="h-3.5 w-3.5 text-primary-light" aria-hidden="true" /> Soporte remoto, cuando sea adecuado</span>
            </div>
            <p className="absolute bottom-3 left-3 text-[10px] text-gray-500">Esquema ilustrativo; no representa calles ni límites comunales.</p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-white">¿Estás fuera de Quillota?</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">Podemos conversar alternativas remotas o confirmar si es posible una atención presencial. No publicamos cobertura ni tarifas de traslado sin validarlas para cada caso.</p>
            <Link href="/consultas?tema=Consulta%20de%20cobertura" className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-primary-light/30 px-4 py-2.5 text-sm font-semibold text-primary-light hover:bg-primary-light/10">
              Consultar disponibilidad <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="datos" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Privacidad visible"
          title="Tus datos, con un propósito claro."
          description="Esta vista resume la información publicada en nuestra política de privacidad. Para ejercer derechos o revisar detalles, consulta la política completa."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: MessageCircle, title: "Consulta", text: "El tema y mensaje se usan para atender lo que nos pides. Puedes dejar una consulta anónima." },
            { icon: FileCheck2, title: "Servicio", text: "Los datos necesarios para cotizar y ejecutar un trabajo se usan para gestionar ese servicio y cumplir obligaciones aplicables." },
            { icon: ShieldCheck, title: "Control", text: "La analítica solo se activa con tu autorización. Puedes cambiarla desde las preferencias en el pie del sitio." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <Icon className="h-5 w-5 text-primary-light" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary-light/15 bg-primary-light/[0.04] p-4">
          <p className="text-sm text-gray-300">No envíes contraseñas, RUT, códigos de acceso ni contenido privado del equipo.</p>
          <Link href="/privacidad" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">Leer política de privacidad <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="preparar" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Antes de entregar o conectar"
          title="Prepara tu equipo con tranquilidad."
          description="Pequeñas medidas previas ayudan a proteger tu información y a que la evaluación sea más clara."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["Respaldo", "Si el equipo aún funciona, guarda una copia de los archivos importantes en un lugar seguro."],
            ["Accesos", "No envíes contraseñas por formularios o mensajería. Si se requiere acceso, se conversa durante la atención."],
            ["Accesorios", "Anota qué cargador, cables y accesorios entregas junto con el equipo."],
            ["Síntomas", "Describe cuándo comenzó el problema y qué cambios notaste, sin incluir datos personales."],
          ].map(([title, text]) => (
            <article key={title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
              <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-400">{text}</p></div>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
            <p className="text-sm leading-6 text-gray-300">En soporte remoto, confirma la herramienta, el alcance y el momento de conexión antes de iniciar. La sesión debe cerrarse al terminar.</p>
          </div>
          <Link href="/seguridad" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">Conocer las prácticas de seguridad <Eye className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="rounded-3xl border border-primary-light/20 bg-[radial-gradient(ellipse_at_top_right,rgba(8,122,138,0.14),transparent_45%),rgba(255,255,255,0.02)] p-6 sm:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">El siguiente paso</p>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">¿Quieres que revisemos tu caso?</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">Cuéntanos lo necesario. Acordaremos el alcance y el costo antes de empezar.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/consultas" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Enviar consulta <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/seguimiento" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Seguir un servicio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
