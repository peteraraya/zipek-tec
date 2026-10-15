import type { LucideIcon } from "lucide-react";
import { Building2, HardDrive, Laptop, ShieldCheck } from "lucide-react";

export interface ComplementaryService {
  title: string;
  description: string;
  topic: string;
  includes: string;
  confirm: string;
  delivery: string;
}

export interface ComplementaryServiceGroup {
  title: string;
  summary: string;
  icon: LucideIcon;
  services: ComplementaryService[];
}

export const complementaryServiceGroups: ComplementaryServiceGroup[] = [
  {
    title: "Equipos",
    summary: "Revisión, configuración y puesta en marcha",
    icon: Laptop,
    services: [
      {
        title: "Revisión preventiva",
        description: "Chequeo de actualizaciones, almacenamiento y estado general.",
        topic: "Revisión preventiva de equipos",
        includes: "Revisión visual y funcional acordada; observaciones sobre actualizaciones, almacenamiento y puntos de atención.",
        confirm: "Cantidad y tipo de equipos, modalidad y revisión requerida. Cualquier reparación, repuesto o licencia, si corresponde, se cotiza aparte.",
        delivery: "Resumen de hallazgos y recomendaciones según lo revisado.",
      },
      {
        title: "Configuración de equipo nuevo",
        description: "Preparación de equipo, correo, impresora y aplicaciones.",
        topic: "Configuración de equipo nuevo",
        includes: "Configuración de las cuentas, actualizaciones, aplicaciones y periféricos que queden indicados en la propuesta.",
        confirm: "Compatibilidad, licencias, traslado de datos, accesorios y asistencia presencial; solo se incluyen si se especifican.",
        delivery: "Equipo configurado dentro del alcance y lista de tareas realizadas.",
      },
    ],
  },
  {
    title: "Datos",
    summary: "Respaldos, recuperación y migración",
    icon: HardDrive,
    services: [
      {
        title: "Respaldo y recuperación",
        description: "Copia de archivos y prueba de recuperación, si es posible.",
        topic: "Respaldo y recuperación de archivos",
        includes: "Selección de archivos y origen/destino definidos contigo; copia o prueba de recuperación solo si el estado y acceso lo permiten.",
        confirm: "Accesos, capacidad del medio, costo de almacenamiento y límites técnicos. Un equipo con falla puede impedir recuperar datos.",
        delivery: "Registro de qué se copió y resultado de la comprobación acordada.",
      },
      {
        title: "Migración y orden digital",
        description: "Traslado planificado de archivos o cuentas entre equipos.",
        topic: "Migración y orden digital",
        includes: "Planificación y traslado de los archivos o cuentas identificados, si hay acceso y compatibilidad.",
        confirm: "Volumen de datos, claves/accesos, estado de origen y destino, licencias o espacio en la nube. No se garantiza recuperar información inaccesible.",
        delivery: "Resumen de elementos trasladados y de las limitaciones encontradas.",
      },
    ],
  },
  {
    title: "Seguridad digital",
    summary: "Prevención y configuración segura",
    icon: ShieldCheck,
    services: [
      {
        title: "Seguridad digital cotidiana",
        description: "Actualizaciones, autenticación multifactor y hábitos seguros.",
        topic: "Seguridad digital",
        includes: "Orientación y ajustes concretos acordados, como actualizaciones o autenticación multifactor cuando el servicio lo permita.",
        confirm: "Cuentas, dispositivos y permisos involucrados. No es una certificación, monitoreo permanente ni garantía de ausencia de incidentes.",
        delivery: "Resumen de ajustes realizados y recomendaciones pendientes.",
      },
    ],
  },
  {
    title: "Pymes y capacitación",
    summary: "Inventario, soporte periódico y talleres",
    icon: Building2,
    services: [
      {
        title: "Inventario y licencias",
        description: "Orden de equipos y software para planificar renovaciones.",
        topic: "Inventario y licencias para pyme",
        includes: "Levantamiento acordado de equipos y programas disponibles, con revisión básica del estado de licencias.",
        confirm: "Tamaño del inventario, documentación disponible y si necesitas una revisión o gestión adicional de licencias.",
        delivery: "Inventario revisado y lista de observaciones o prioridades.",
      },
      {
        title: "Soporte periódico para pymes",
        description: "Modalidad recurrente según equipos, tareas y cobertura.",
        topic: "Soporte periódico para pyme",
        includes: "Únicamente los equipos, tareas y modalidad que queden descritos en una propuesta aceptada.",
        confirm: "Canales y horarios, visitas, cobertura, agenda, costos, exclusiones y condiciones. No hay cantidad de visitas ni tiempo de respuesta estándar publicado.",
        delivery: "Resumen de trabajo según la periodicidad y formato que se acuerden.",
      },
      {
        title: "Acompañamiento y talleres",
        description: "Sesiones sobre herramientas, respaldos y prevención de fraudes.",
        topic: "Capacitación tecnológica",
        includes: "Sesión sobre tema, herramientas y participantes acordados previamente.",
        confirm: "Duración, lugar o modalidad remota, cantidad de asistentes y materiales requeridos.",
        delivery: "Orientación práctica; material adicional solo si se acuerda en la propuesta.",
      },
    ],
  },
];
