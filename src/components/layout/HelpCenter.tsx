"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  LifeBuoy,
  Map,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { faqData, getWhatsAppUrl, siteConfig } from "@/config/site";

type HelpAction = {
  label: string;
  href: string;
  external?: boolean;
};

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: HelpAction[];
};

type HelpEntry = {
  question: string;
  answer: string;
  keywords: string[];
  actions?: HelpAction[];
};

const contactActions: HelpAction[] = [
  { label: "Enviar una consulta", href: "/consultas" },
  {
    label: "WhatsApp",
    href: getWhatsAppUrl(),
    external: true,
  },
];

const helpEntries: HelpEntry[] = [
  ...faqData.map(({ question, answer }) => ({
    question,
    answer,
    keywords: [question, answer],
    actions: [{ label: "Ver preguntas frecuentes", href: "/#faq" }, ...contactActions],
  })),
  {
    question: "¿Qué servicios ofrecen?",
    answer:
      `Atendemos a hogares y pymes en ${siteConfig.contact.city} y coordinamos soporte remoto. Podemos revisar computadores, respaldos, instalaciones legales, seguridad, impresoras, redes y mantenimiento para negocios. El alcance y el precio se confirman antes de empezar.`,
    keywords: [
      "servicios",
      "ayuda",
      "computador",
      "computadora",
      "lento",
      "reparar",
      "impresora",
      "wifi",
      "red",
      "pyme",
      "negocio",
      "hogar",
      "soporte",
      "instalar",
      "respaldo",
    ],
    actions: [
      { label: "Ver servicios", href: "/#servicios" },
      ...contactActions,
    ],
  },
  {
    question: `¿Cómo contacto a ${siteConfig.shortName}?`,
    answer:
      "Puedes escribirnos por WhatsApp o enviar una consulta desde el sitio. Si quieres que respondamos el formulario, indica un teléfono o correo y autoriza su uso para esa consulta. Una consulta anónima no puede recibir respuesta.",
    keywords: [
      "contacto",
      "contactar",
      "hablar",
      "whatsapp",
      "consulta",
      "formulario",
      "respuesta",
      "responder",
      "anónima",
      "anonima",
    ],
    actions: contactActions,
  },
  {
    question: "¿Cómo sigo el estado de una reparación?",
    answer:
      `Abre la sección Seguimiento e ingresa desde el enlace privado que te compartió ${siteConfig.shortName}. El código de referencia de una consulta web no sirve para consultar órdenes de servicio.`,
    keywords: [
      "seguimiento",
      "estado",
      "reparación",
      "reparacion",
      "orden",
      "equipo",
      "tracking",
      "revisar",
      "código",
      "codigo",
    ],
    actions: [{ label: "Ir a seguimiento", href: "/seguimiento" }, ...contactActions],
  },
  {
    question: "¿Dónde están y hasta dónde atienden?",
    answer:
      `La atención es en ${siteConfig.contact.location} y también coordinamos soporte remoto. Las visitas fuera de la zona y la disponibilidad se confirman caso a caso antes de coordinar.`,
    keywords: [
      "ubicación",
      "ubicacion",
      "dirección",
      "direccion",
      "quillota",
      "valparaíso",
      "valparaiso",
      "zona",
      "visita",
      "remoto",
      "presencial",
      "atienden",
    ],
    actions: contactActions,
  },
];

const suggestedQuestions = [
  "¿Qué servicios ofrecen?",
  "¿Me dicen el precio antes de reparar?",
  "¿Cómo sigo el estado de una reparación?",
];

const tourSteps = [
  {
    target: "#inicio h1",
    title: "Empieza aquí",
    description:
      `Conoce la propuesta de ${siteConfig.shortName} y elige si prefieres escribir por WhatsApp o enviar una consulta.`,
  },
  {
    target: "#servicios",
    title: "Encuentra tu servicio",
    description:
      "Revisa la ayuda disponible para tu hogar o negocio y entra directo a consultar por un servicio.",
  },
  {
    target: "#como-trabajamos",
    title: "Así trabajamos",
    description:
      "El proceso explica cómo revisamos, cotizamos y esperamos tu autorización antes de comenzar.",
  },
  {
    target: "#planes",
    title: "Conoce los planes",
    description:
      "Compara la atención puntual y las opciones para pymes. El alcance y el precio se confirman para cada caso.",
  },
  {
    target: "#faq",
    title: "Resuelve tus dudas",
    description:
      "Encuentra respuestas sobre precios, respaldo, licencias, visitas y soporte mensual.",
  },
  {
    target: "#contacto",
    title: "Hablemos",
    description:
      "Cuando estés listo, cuéntanos qué ocurre. No necesitas conocer el nombre técnico de la falla.",
  },
];

const stopWords = new Set([
  "que",
  "como",
  "cual",
  "cuanto",
  "cuesta",
  "para",
  "por",
  "con",
  "una",
  "uno",
  "los",
  "las",
  "del",
  "de",
  "el",
  "la",
  "me",
  "mi",
  "se",
  "un",
  "en",
  "y",
  "o",
  "hay",
  "puedo",
  "quiero",
  "necesito",
]);

function normalizeWords(text: string) {
  return text
    .toLocaleLowerCase("es-CL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((word) => word.length > 2 && !stopWords.has(word)) ?? [];
}

function findHelpAnswer(query: string): HelpEntry | undefined {
  const queryWords = [...new Set(normalizeWords(query))];
  if (!queryWords.length) return undefined;

  const ranked = helpEntries
    .map((entry) => {
      const searchableText = [entry.question, entry.answer, ...entry.keywords].join(" ");
      const searchableWords = new Set(normalizeWords(searchableText));
      const matchedWords = queryWords.filter((word) => searchableWords.has(word));
      const score =
        matchedWords.length / queryWords.length +
        (normalizeWords(entry.question).some((word) => queryWords.includes(word)) ? 0.15 : 0);

      return { entry, score, matchedCount: matchedWords.length };
    })
    .sort((first, second) => second.score - first.score);

  const bestMatch = ranked[0];
  if (!bestMatch || bestMatch.matchedCount === 0 || bestMatch.score < 0.34) return undefined;
  return bestMatch.entry;
}

export default function HelpCenter() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "tour">("chat");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: `Hola. Soy el asistente de ayuda de ${siteConfig.shortName}. Puedo orientarte sobre nuestros servicios y cómo usar el sitio.`,
    },
  ]);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isTouring, setIsTouring] = useState(false);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tourPanelRef = useRef<HTMLElement>(null);
  const nextMessageId = useRef(1);
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (isOpen) questionInputRef.current?.focus();
  }, [activeTab, isOpen]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isTouring) return;
    const step = tourSteps[tourStepIndex];
    const target = step ? document.querySelector<HTMLElement>(step.target) : null;

    if (!target) return;

    target.classList.add("help-tour-target");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    tourPanelRef.current?.focus();
    return () => target.classList.remove("help-tour-target");
  }, [isTouring, tourStepIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isTouring) return;
    const closeTourOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTouring(false);
        window.requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };

    document.addEventListener("keydown", closeTourOnEscape);
    return () => document.removeEventListener("keydown", closeTourOnEscape);
  }, [isTouring]);

  function closePanel() {
    setIsOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusableItems = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled])',
    );
    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem?.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem?.focus();
    }
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedQuestion = question.trim();
    if (!submittedQuestion) return;

    const matchedEntry = findHelpAnswer(submittedQuestion);
    const answer: ChatMessage = matchedEntry
      ? {
          id: nextMessageId.current + 1,
          role: "assistant",
          text: matchedEntry.answer,
          actions: matchedEntry.actions,
        }
      : {
          id: nextMessageId.current + 1,
          role: "assistant",
          text:
            "No encontré una respuesta clara para eso en la información del sitio. Puedes revisar las preguntas frecuentes o contactarnos directamente; no quiero darte información imprecisa.",
          actions: [
            { label: "Ver preguntas frecuentes", href: "/#faq" },
            ...contactActions,
          ],
        };

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: nextMessageId.current, role: "user", text: submittedQuestion },
      answer,
    ]);
    nextMessageId.current += 2;
    setQuestion("");
  }

  function askSuggestedQuestion(suggestedQuestion: string) {
    const matchedEntry = findHelpAnswer(suggestedQuestion);
    if (!matchedEntry) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: nextMessageId.current, role: "user", text: suggestedQuestion },
      {
        id: nextMessageId.current + 1,
        role: "assistant",
        text: matchedEntry.answer,
        actions: matchedEntry.actions,
      },
    ]);
    nextMessageId.current += 2;
  }

  function startTour() {
    if (!isHomePage) return;
    setIsOpen(false);
    setTourStepIndex(0);
    setIsTouring(true);
  }

  function finishTour() {
    setIsTouring(false);
    launcherRef.current?.focus();
  }

  const activeTourStep = tourSteps[tourStepIndex];
  const progress = `${tourStepIndex + 1} de ${tourSteps.length}`;

  return (
    <>
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar centro de ayuda"
            className="fixed inset-0 z-[60] cursor-default bg-black/45"
            onClick={closePanel}
          />
          <section
            id="help-center-dialog"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-center-title"
            onKeyDown={handlePanelKeyDown}
            className="fixed inset-x-2 bottom-[4.5rem] z-[61] flex max-h-[min(76dvh,640px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.9)] sm:inset-x-auto sm:bottom-24 sm:left-6 sm:w-[min(420px,calc(100vw-3rem))]"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-light/20 bg-primary-light/10 text-primary-light">
                  <LifeBuoy className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="help-center-title" className="font-semibold text-white">Centro de ayuda</h2>
                  <p className="text-xs text-gray-400">Respuestas para orientarte</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Cerrar centro de ayuda"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="flex gap-1 border-b border-white/10 px-4 pt-2">
              <button
                type="button"
                role="tab"
                id="help-chat-tab"
                aria-selected={activeTab === "chat"}
                aria-controls="help-chat-panel"
                onClick={() => setActiveTab("chat")}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium transition ${
                  activeTab === "chat"
                    ? "border-primary-light text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Pregunta
              </button>
              <button
                type="button"
                role="tab"
                id="help-tour-tab"
                aria-selected={activeTab === "tour"}
                aria-controls="help-tour-panel"
                onClick={() => setActiveTab("tour")}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium transition ${
                  activeTab === "tour"
                    ? "border-primary-light text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Map className="h-4 w-4" aria-hidden="true" />
                Recorrido
              </button>
            </div>

            {activeTab === "chat" ? (
              <div
                id="help-chat-panel"
                role="tabpanel"
                aria-labelledby="help-chat-tab"
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  ref={messageListRef}
                  role="log"
                  aria-label="Conversación de ayuda"
                  aria-live="polite"
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
                          <Bot className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                      <div className={`max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                        <p
                          className={`inline-block rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6 ${
                            message.role === "user"
                              ? "rounded-br-md bg-primary text-white"
                              : "rounded-bl-md border border-white/[0.07] bg-white/[0.04] text-gray-200"
                          }`}
                        >
                          {message.text}
                        </p>
                        {message.actions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.actions.map((action) =>
                              action.external ? (
                                <a
                                  key={action.label}
                                  href={action.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-primary-light transition hover:border-primary-light/40 hover:bg-white/[0.03]"
                                >
                                  {action.label}
                                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                </a>
                              ) : (
                                <Link
                                  key={action.label}
                                  href={action.href}
                                  onClick={closePanel}
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-primary-light transition hover:border-primary-light/40 hover:bg-white/[0.03]"
                                >
                                  {action.label}
                                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                </Link>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 pl-9">
                      {suggestedQuestions.map((suggestedQuestion) => (
                        <button
                          key={suggestedQuestion}
                          type="button"
                          onClick={() => askSuggestedQuestion(suggestedQuestion)}
                          className="min-h-9 rounded-lg border border-white/10 px-3 text-left text-xs text-gray-300 transition hover:border-primary-light/40 hover:text-white"
                        >
                          {suggestedQuestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={submitQuestion} className="border-t border-white/10 p-3">
                  <label className="sr-only" htmlFor="help-question">Escribe tu pregunta</label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-1.5 focus-within:border-primary-light/50">
                    <input
                      ref={questionInputRef}
                      id="help-question"
                      name="question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Escribe tu pregunta…"
                      maxLength={500}
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!question.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Enviar pregunta"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Respuestas automáticas basadas en la información del sitio.
                  </p>
                </form>
              </div>
            ) : (
              <div
                id="help-tour-panel"
                role="tabpanel"
                aria-labelledby="help-tour-tab"
                className="flex flex-1 flex-col justify-between p-5"
              >
                <div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary-light/20 bg-primary-light/10 text-primary-light">
                    <Map className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">Recorre el sitio a tu ritmo</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Un recorrido breve te muestra servicios, proceso de atención, planes, preguntas frecuentes y contacto.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-gray-500">
                    Puedes avanzar o retroceder, y salir del recorrido cuando quieras. No guardamos tu progreso.
                  </p>
                </div>
                {isHomePage ? (
                  <button
                    type="button"
                    onClick={startTour}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-white transition hover:bg-primary-hover"
                  >
                    Comenzar recorrido
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    href="/#inicio"
                    onClick={closePanel}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-white transition hover:bg-primary-hover"
                  >
                    Ir a la página principal
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {isTouring && activeTourStep && (
        <aside
          id="help-tour-dialog"
          ref={tourPanelRef}
          tabIndex={-1}
          aria-labelledby="help-tour-title"
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 z-[62] mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-light">
                Recorrido · {progress}
              </p>
              <h2 id="help-tour-title" className="mt-2 text-lg font-semibold text-white">
                {activeTourStep.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-gray-400">{activeTourStep.description}</p>
            </div>
            <button
              type="button"
              onClick={finishTour}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Finalizar recorrido"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setTourStepIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              disabled={tourStepIndex === 0}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            {tourStepIndex === tourSteps.length - 1 ? (
              <button
                type="button"
                onClick={finishTour}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
              >
                Terminar
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTourStepIndex((currentIndex) => currentIndex + 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </aside>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          setIsTouring(false);
          setIsOpen((currentState) => !currentState);
        }}
        aria-label={isOpen ? "Cerrar centro de ayuda" : "Abrir centro de ayuda"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fixed bottom-2 left-4 z-50 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:left-6 sm:h-14 sm:px-5"
      >
        <CircleHelp className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Ayuda</span>
        <ChevronDown className={`hidden h-4 w-4 transition-transform sm:inline ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </>
  );
}
