
import type { Mission } from "../types";

export const missions: Mission[] = [
  // =====================================
  // MISIÓN 1: CULTIVA UNA PLANTA
  // =====================================
  {
    id: "planta",
    number: 1,
    title: "¡Cultiva una planta!",
    area: "Ciencia y ambiente",
    icon: "🌱",
    description:
      "Aprende cómo cuidar una semilla, regarla y ayudarla a crecer hasta convertirse en una hermosa flor.",
    ready: true
  },

  // =====================================
  // MISIÓN 2: CONSTRUYE TU NAVE
  // =====================================
  {
    id: "nave",
    number: 2,
    title: "Construye tu nave espacial",
    area: "Matemática",
    icon: "🚀",
    description:
      "Reconoce las figuras geométricas y coloca cada pieza en su lugar para construir un cohete espacial.",
    ready: true
  },

  // =====================================
  // MISIÓN 3: DETECTIVES DE SONIDOS
  // =====================================
  {
    id: "sonidos",
    number: 3,
    title: "Detectives de sonidos",
    area: "Comunicación",
    icon: "🔊",
    description:
      "Escucha, identifica y descubre diferentes sonidos del entorno para construir tu propio mapa sonoro.",
    ready: true
  },

  // =====================================
  // MISIÓN 4: LONCHERA SALUDABLE
  // =====================================
  {
    id: "lonchera",
    number: 4,
    title: "Nutricionistas espaciales",
    area: "Hábitos saludables",
    icon: "🍎",
    description:
      "Selecciona alimentos variados y prepara una lonchera saludable para comenzar una nueva aventura.",
    ready: true
  },

  // =====================================
  // MISIÓN 5: HISTORIAS PARA AYUDAR
  // =====================================
  {
    id: "historia",
    number: 5,
    title: "Historias para ayudar",
    area: "Comunicación y convivencia",
    icon: "📖",
    description:
      "Escucha historias ilustradas, responde preguntas y descubre la importancia de ayudar y compartir.",
    ready: true
  }
];