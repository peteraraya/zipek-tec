import {
  MonitorSmartphone,
  LucideIcon,
  ShieldCheck,
  HardDriveUpload,
  LaptopMinimal,
  Building2,
  Users,
} from "lucide-react";

export const siteConfig = {
  name: "ZIPEK Tecnología",
  shortName: "ZIPEK",
  domain: "zipek.cl",
  url: "https://zipek.cl",
  description:
    "Soporte informático legal, claro y cercano para hogares y pymes. Equipos funcionando, seguros y con software legal.",
  contact: {
    email: "contacto@zipek.cl",
    phone: "+56 9 5764 2162",
    location: "Quillota, Región de Valparaíso, Chile",
  },
  links: {
    linkedin: "https://www.linkedin.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    github: "https://github.com",
    portfolio: "https://pedroaraya.vercel.app/",
  },
  founder: {
    name: "ZIPEK Tecnología",
    role: "Soporte informático legal y cercano",
    location: "Quillota, Chile",
    image: "/logo/logo_zipek-tecnologia.png",
  },
};

export const features = {
  enablePortfolio: false,
  enableTestimonials: false,
  enableFAQ: false,
  enableTechStack: false,
  enableWhatsApp: true,
  enableAnimations: true,
  enablePricing: true,
  enableMethodology: false,
  enableContactWizard: true,
  enableCookieBanner: true,
  enableClientPortal: false,
  enableBlog: false,
  enableAboutUs: false,
  enableSecurityPage: false,
  enableROICalculator: false,
};

export const navLinks = [
  { title: "Inicio", href: "/#inicio" },
  { title: "Servicios", href: "/#servicios" },
  ...(features.enablePricing ? [{ title: "Planes", href: "/#planes" }] : []),
  { title: "Contacto", href: "/#contacto" },
];

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const servicesData: ServiceItem[] = [
  {
    icon: LaptopMinimal,
    title: "Puesta a punto legal",
    description:
      "Formateo, Windows con licencia o Linux, drivers, actualizaciones y programas libres para dejar tu equipo funcionando bien.",
  },
  {
    icon: HardDriveUpload,
    title: "Respaldos y recuperación",
    description:
      "Recuperamos fotos, documentos, WhatsApp y correo en la nube o disco externo para que tus recuerdos y archivos no se pierdan.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad y prevención",
    description:
      "Antivirus, contraseñas seguras, Wi‑Fi y prevención de estafas y phishing para que trabajes con tranquilidad.",
  },
  {
    icon: MonitorSmartphone,
    title: "Redes e impresoras",
    description:
      "Configuramos router, repetidor, impresora, escáner y cámaras para que tu entorno digital esté siempre operativo.",
  },
  {
    icon: Users,
    title: "Capacitación personalizada",
    description:
      "Te enseñamos a usar WhatsApp, correo, videollamadas, Excel y trámites en línea sin complicaciones.",
  },
  {
    icon: Building2,
    title: "Revisión de licencias y políticas",
    description:
      "Para empresas, revisamos licencias, respaldos, políticas y mantenimiento preventivo para evitar fallas y costos ocultos.",
  },
];

export const portfolioData = [
  {
    slug: "ecommerce-escala",
    title: "E-Commerce Escala",
    description: "Plataforma de ventas online para retail con +10k productos, integración con pasarelas de pago y ERP.",
    tags: ["Next.js", "Stripe", "Node.js"],
    challenge: "El cliente experimentaba caídas constantes en eventos de alta demanda (Cyber) y una sincronización manual de stock que tomaba horas.",
    solution: "Desarrollamos una arquitectura sin servidor (Serverless) con Next.js e integramos una sincronización bidireccional en tiempo real con su ERP corporativo vía API.",
    results: ["+300% en velocidad de carga", "Cero caídas en CyberDay 2025", "Reducción de 40 horas mensuales en tareas manuales"],
  },
  {
    slug: "dashboard-logistico",
    title: "Dashboard Logístico",
    description: "Sistema interno para control de flotas y despachos en tiempo real para empresa de transporte.",
    tags: ["React", "Firebase", "Google Maps"],
    challenge: "Falta de visibilidad de las rutas, lo que generaba demoras en entregas y altos costos en combustible y gestión de flota.",
    solution: "Creación de un panel de control con geolocalización en vivo, cálculo automatizado de rutas óptimas y reportes automatizados.",
    results: ["Disminución del 25% en costos de combustible", "Reducción del 50% en reclamos por atrasos"],
  },
  {
    slug: "app-medica",
    title: "App Médica de Agendamiento",
    description: "Aplicación para pacientes y doctores. Gestión de horas, telemedicina e historial clínico.",
    tags: ["React Native", "AWS", "PostgreSQL"],
    challenge: "Alto porcentaje de inasistencia médica y desorden en el manejo de fichas clínicas en formato físico.",
    solution: "Se desarrolló una app nativa con recordatorios automáticos por WhatsApp, integración de telemedicina por video y fichas electrónicas encriptadas.",
    results: ["Inasistencias bajaron de 30% a 5%", "Gestión centralizada para 50+ médicos simultáneos"],
  }
];

export const blogData = [
  {
    slug: "migrar-a-la-nube-pymes",
    title: "Por qué las PYMES chilenas deben migrar a la nube este 2026",
    excerpt: "La infraestructura local ya no es suficiente. Descubre cómo la computación en la nube (Cloud) está democratizando la tecnología para pequeñas empresas.",
    date: "10 de Agosto, 2026",
    readTime: "5 min"
  },
  {
    slug: "landing-page-vs-ecommerce",
    title: "¿Landing Page o E-commerce? Qué necesita realmente tu negocio",
    excerpt: "No todos los negocios necesitan un carro de compras complejo. Analizamos cuándo es mejor una página de captura de leads versus una tienda completa.",
    date: "25 de Julio, 2026",
    readTime: "4 min"
  },
  {
    slug: "importancia-ley-proteccion-datos",
    title: "Cómo la nueva Ley de Protección de Datos afecta a tu sitio web",
    excerpt: "El cumplimiento normativo no es opcional. Aprende qué debes modificar en tus formularios y banners para evitar multas del SERNAC y proteger a tus usuarios.",
    date: "15 de Junio, 2026",
    readTime: "6 min"
  }
];

export const testimonialsData = [
  {
    name: "María González",
    role: "CEO en RetailTech",
    content: `${siteConfig.shortName} transformó por completo nuestra operación. El e-commerce que desarrollaron cuadruplicó nuestras ventas en 6 meses.`,
  },
  {
    name: "Carlos Medina",
    role: "Director de Logística",
    content: "El sistema a medida que crearon nos ahorró cientos de horas de trabajo manual. Un equipo profesional y muy comprometido.",
  },
  {
    name: "Andrea Soto",
    role: "Fundadora de HealthApp",
    content: "Excelente comunicación y tiempos de entrega. Entendieron exactamente lo que necesitábamos desde el día uno.",
  }
];

export const faqData = [
  {
    question: "¿Cuánto tiempo toma desarrollar una solución a medida?",
    answer: "Depende de la complejidad. Una Landing Page puede tomar de 1 a 2 semanas, mientras que un sistema complejo (E-commerce o Dashboard) entre 1 a 3 meses. Hacemos entregas continuas para que veas avances desde la primera semana."
  },
  {
    question: "¿Tienen soporte técnico después del lanzamiento?",
    answer: "Sí, todos nuestros desarrollos incluyen un periodo de garantía. Además, ofrecemos planes de mantenimiento mensual para asegurar que tu software esté siempre actualizado y funcionando al 100%."
  },
  {
    question: "¿Cuáles son las formas de pago?",
    answer: "Trabajamos con hitos de proyecto. Usualmente un porcentaje al inicio, otro al revisar el prototipo, y el saldo al momento de salir a producción. Aceptamos transferencias y tarjetas."
  },
  {
    question: "¿Ustedes se encargan del hosting y dominios?",
    answer: "Sí, ofrecemos el servicio de despliegue en la nube (AWS, Vercel, etc.) y te asesoramos con la compra y configuración de tu dominio."
  },
  {
    question: "¿Tienen políticas de garantía (SERNAC) y contratos de confidencialidad?",
    answer: "Cumplimos estrictamente con las normativas chilenas. Todo proyecto va respaldado por un Contrato de Desarrollo y Acuerdos de Confidencialidad (NDA). Además, ofrecemos garantía técnica acorde a los derechos del consumidor, asegurando que el software entregado cumpla exactamente con lo especificado."
  }
];

export const techStackData = [
  "React", "Next.js", "Node.js", "TypeScript", "AWS", "PostgreSQL", "TailwindCSS", "Framer Motion", "Docker", "Figma"
];

export const methodologyData = [
  {
    step: "01",
    title: "Levantamiento de Requerimientos",
    description: "Completas nuestra ficha técnica para entender tu negocio, plazos y expectativas antes de cotizar."
  },
  {
    step: "02",
    title: "Propuesta y NDA",
    description: "Te enviamos una propuesta formal y firmamos un Acuerdo de Confidencialidad para proteger tus ideas."
  },
  {
    step: "03",
    title: "Desarrollo por Hitos",
    description: "Ejecutamos el proyecto en etapas aprobables (Hitos 1, 2 y 3) para asegurar visibilidad y control."
  },
  {
    step: "04",
    title: "Acta de Recepción",
    description: "Realizamos la entrega oficial con un Acta de Recepción Conforme, marcando el inicio de la garantía."
  },
  {
    step: "05",
    title: "Soporte y Mantención",
    description: "Ofrecemos planes mensuales con SLA (Niveles de Servicio) para que tu sistema nunca se detenga."
  }
];

export const pricingData = [
  {
    title: "Hogar Seguro",
    price: "A definir",
    description: "Diagnóstico, limpieza, antivirus, respaldo y 1 capacitación.",
    features: [
      "Diagnóstico inicial sin rodeos",
      "Limpieza y optimización del equipo",
      "Antivirus y seguridad básica",
      "Respaldo de fotos, documentos y WhatsApp",
      "1 sesión de capacitación personalizada",
    ],
    recommended: false,
    cta: "Agendar diagnóstico",
  },
  {
    title: "Puesta a Punto Legal",
    price: "A definir",
    description: "Formateo, sistema legal, programas libres, correo e impresora.",
    features: [
      "Formateo y reinstalación segura",
      "Windows con licencia o Linux",
      "Drivers, actualizaciones y software libre",
      "Configuración de correo e impresora",
      "Informe final y garantía del servicio",
    ],
    recommended: true,
    cta: "Solicitar soporte",
  },
];

export const supportPricingData = [
  {
    title: "Pyme Tranquila",
    price: "A definir",
    description: "Mensualidad con soporte remoto, 1 a 2 visitas, respaldo y revisión de licencias.",
    features: [
      "Soporte remoto mensual",
      "1 a 2 visitas programadas",
      "Respaldos y revisión de discos",
      "Revisión de licencias y software",
      "Capacitación de usuarios y políticas",
    ],
    recommended: true,
    cta: "Cotizar mensualidad",
  },
  {
    title: "Atención urgente",
    price: "Recargo",
    description: "Visita prioritaria sujeta a disponibilidad y tarifa de urgencia.",
    features: [
      "Prioridad de atención",
      "Visita según disponibilidad",
      "Cobertura adicional por urgencia",
      "Respuesta rápida por WhatsApp",
      "Se agrega sobre la tarifa normal",
    ],
    recommended: false,
    cta: "Solicitar prioridad",
  },
];
