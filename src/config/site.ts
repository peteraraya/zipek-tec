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
    "Soporte informático para hogares y pymes en Quillota: diagnóstico claro, precio acordado antes de empezar y alternativas de software legales.",
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
  enableFAQ: true,
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
  { title: "Seguimiento", href: "/seguimiento" },
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
    question: "¿La revisión o visita tiene un costo?",
    answer: "Puede depender del problema, la modalidad de atención y la ubicación. Consúltanos antes de coordinar; te informaremos si hay un costo de revisión o visita antes de que aceptes el servicio."
  },
  {
    question: "¿Cómo se calcula el precio?",
    answer: "Cotizamos según el equipo, las tareas necesarias y la modalidad. Si aplican repuestos, licencias o desplazamiento, te los informamos por separado. Antes de coordinar también confirmamos si la revisión tiene costo."
  },
  {
    question: "¿Me dicen el precio antes de reparar el equipo?",
    answer: "Sí. Primero revisamos el problema y te explicamos el trabajo recomendado y su precio. No hacemos trabajos adicionales sin consultarte y recibir tu autorización."
  },
  {
    question: "¿La atención es remota o presencial?",
    answer: "Depende del problema y de si puede resolverse de forma segura a distancia. La atención presencial se coordina según ubicación y disponibilidad; cualquier costo de visita o traslado se informa antes."
  },
  {
    question: "¿Qué pasa con mis archivos?",
    answer: "Antes de intervenir, conversamos contigo sobre el respaldo. Si decides no hacerlo, dejamos constancia de esa decisión y del riesgo de pérdida de datos."
  },
  {
    question: "¿Instalan programas sin licencia?",
    answer: "No instalamos ni activamos software sin licencia. Podemos revisar alternativas legales y gratuitas, como LibreOffice o Linux, según lo que necesites."
  },
  {
    question: "¿Atienden negocios con soporte mensual?",
    answer: "Podemos cotizar soporte periódico según tus equipos y necesidades. La propuesta define tareas, canales, horarios, visitas, exclusiones y condiciones; no hay un tiempo de respuesta estándar publicado."
  },
  {
    question: "¿Qué garantía tiene el trabajo?",
    answer: "Depende del trabajo acordado. Si corresponde una garantía, antes de autorizar te indicamos por escrito su alcance, duración y exclusiones. No hay una garantía universal para todos los servicios."
  },
  {
    question: "¿Hacen visitas fuera de Quillota o atención urgente?",
    answer: "La disponibilidad depende de la ubicación y la agenda. Escríbenos antes para confirmar si podemos ir y cuál sería el costo. La atención urgente también está sujeta a disponibilidad y su recargo se informa antes de confirmar."
  }
];

export const techStackData = [
  "React", "Next.js", "Node.js", "TypeScript", "AWS", "PostgreSQL", "TailwindCSS", "Framer Motion", "Docker", "Figma"
];

export const methodologyData = [
  {
    step: "01",
    title: "Entendemos el caso",
    description: "Conversamos sobre los equipos, el problema, la ubicación y lo que necesitas resolver."
  },
  {
    step: "02",
    title: "Evaluamos y cotizamos",
    description: "Definimos modalidad, revisión necesaria, costos y alcance antes de comenzar."
  },
  {
    step: "03",
    title: "Esperamos tu autorización",
    description: "Solo realizamos las tareas que apruebes; cualquier cambio se conversa antes."
  },
  {
    step: "04",
    title: "Probamos y entregamos",
    description: "Te explicamos el trabajo realizado y las condiciones acordadas para el servicio."
  },
  {
    step: "05",
    title: "Conversamos el seguimiento",
    description: "Si necesitas continuidad, cotizamos un alcance periódico según equipos y disponibilidad."
  }
];

export const pricingData = [
  {
    title: "Atención puntual para el hogar",
    price: "A cotizar",
    description: "Revisamos tu solicitud y te proponemos un alcance según el equipo y el problema.",
    features: [
      "Evaluación del problema y modalidad",
      "Puesta a punto o reinstalación, si corresponde",
      "Revisión de respaldo y archivos importantes",
      "Licencias, repuestos o tareas adicionales identificados por separado",
    ],
    cta: "Cotizar mi solicitud",
  },
  {
    title: "Configuración o reinstalación",
    price: "A cotizar",
    description: "Alternativa a evaluar según compatibilidad, accesos, respaldo y licencias.",
    features: [
      "Sistema operativo y compatibilidad del equipo",
      "Drivers, actualizaciones y aplicaciones acordadas",
      "Configuración de correo o periféricos, si se especifica",
      "Respaldo, licencias y recuperación se evalúan por separado",
    ],
    cta: "Consultar esta alternativa",
  },
];

export const supportPricingData = [
  {
    title: "Soporte periódico para pyme",
    price: "A cotizar",
    description: "Propuesta a medida del inventario, prioridades y modalidad que necesite el negocio.",
    features: [
      "Equipos, tareas y canales por definir en la propuesta",
      "Modalidad remota o visitas, sujetas a ubicación y agenda",
      "Mantenimiento, respaldos o licencias solo si se especifican",
      "Horarios, exclusiones y condiciones acordados antes de contratar",
    ],
    cta: "Diseñar una propuesta",
  },
  {
    title: "Consulta prioritaria",
    price: "A cotizar",
    description: "Consulta si es posible priorizar tu solicitud; confirmamos disponibilidad y costos antes de aceptar.",
    features: [
      "Disponibilidad revisada al recibir la solicitud",
      "Modalidad y zona confirmadas caso a caso",
      "Cualquier costo adicional informado antes de coordinar",
      "No representa un tiempo de respuesta garantizado",
    ],
    cta: "Consultar disponibilidad",
  },
];
