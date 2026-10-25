
export type Scene = {
  title: string;
  narration: string;
  image: string;
  alt: string;
};

export type Question = {
  text: string;
  choices: string[];
  answer: string;
  hint: string;
};

export type Story = {
  id: string;
  title: string;
  lesson: string;
  scenes: Scene[];
  questions: Question[];
};

export const STORIES: Story[] = [

  // ==========================================
  // HISTORIA 1: LOS COLORES DE LUNA
  // ==========================================

  {
    id: "colores",
    title: "Los colores de Luna",
    lesson: "Compartir y respetar los turnos",

    scenes: [
      {
        title: "Un lápiz muy especial",
        narration:
          "En la escuela espacial, Luna dibujaba un planeta. Nico quería pintar su cohete, pero el lápiz azul estaba ocupado. Nico se puso triste.",

        image: "/historias/colores/01-lapiz-ocupado.png",

        alt: "Luna dibuja un planeta mientras Nico está triste porque necesita el lápiz azul."
      },

      {
        title: "Una idea amable",
        narration:
          "Luna vio que Nico estaba triste y le dijo: Podemos usar el lápiz por turnos. Primero termino mi planeta y después te lo presto. Nico sonrió.",

        image: "/historias/colores/02-compartir-lapiz.png",

        alt: "Luna comparte amablemente su lápiz azul con Nico."
      },

      {
        title: "Dos dibujos maravillosos",
        narration:
          "Luna terminó su planeta y le pasó el lápiz a Nico. Después colocaron sus dibujos juntos en la pared de la nave. ¡Ambos estaban felices!",

        image: "/historias/colores/03-dibujos-terminados.png",

        alt: "Luna y Nico muestran sus dibujos terminados en el aula espacial."
      }
    ],

    questions: [
      {
        text: "¿Qué necesitaba Nico para su dibujo?",

        choices: [
          "Un lápiz azul",
          "Una pelota",
          "Una cuchara"
        ],

        answer: "Un lápiz azul",

        hint: "Recuerda el color que Nico necesitaba para pintar su cohete."
      },

      {
        text: "¿Qué propuso Luna para ayudar a Nico?",

        choices: [
          "Esconder el lápiz",
          "Usarlo por turnos",
          "Romper el dibujo"
        ],

        answer: "Usarlo por turnos",

        hint: "Luna quería que los dos pudieran utilizar el mismo lápiz."
      },

      {
        text: "¿Cómo terminó la historia?",

        choices: [
          "Se fueron enojados",
          "Perdieron sus dibujos",
          "Los dos terminaron sus dibujos"
        ],

        answer: "Los dos terminaron sus dibujos",

        hint: "Recuerda qué colocaron juntos en la pared de la nave."
      }
    ]
  },

  // ==========================================
  // HISTORIA 2: EL ROBOT PERDIDO
  // ==========================================

  {
    id: "robot",
    title: "El robot perdido",
    lesson: "Ayudar y trabajar en equipo",

    scenes: [
      {
        title: "Una rueda desaparece",
        narration:
          "Timo construía un pequeño robot en su nave. De pronto, una rueda se soltó y rodó debajo de una mesa. Timo no podía encontrarla.",

        image: "/historias/robot/01-rueda-perdida.png",

        alt: "Timo busca una rueda que se desprendió de su robot."
      },

      {
        title: "Busquemos juntos",
        narration:
          "Mara vio lo que pasaba y le preguntó: ¿Quieres que te ayude? Buscaron con calma y encontraron la rueda detrás de una caja.",

        image: "/historias/robot/02-buscan-la-rueda.png",

        alt: "Mara ayuda a Timo a buscar la rueda perdida del robot."
      },

      {
        title: "El robot vuelve a andar",
        narration:
          "Mara sostuvo el robot mientras Timo colocaba la rueda en su sitio. El robot volvió a avanzar y ambos celebraron. ¡Trabajar juntos fue una gran idea!",

        image: "/historias/robot/03-robot-reparado.png",

        alt: "Timo y Mara reparan su robot y celebran juntos."
      }
    ],

    questions: [
      {
        text: "¿Qué pieza perdió el robot?",

        choices: [
          "Una rueda",
          "Una ventana",
          "Una antena"
        ],

        answer: "Una rueda",

        hint: "Es una pieza redonda que ayuda al robot a avanzar."
      },

      {
        text: "¿Qué hizo Mara cuando Timo necesitó ayuda?",

        choices: [
          "Se escondió",
          "Lo ayudó a buscar",
          "Se llevó el robot"
        ],

        answer: "Lo ayudó a buscar",

        hint: "Mara y Timo buscaron la rueda juntos."
      },

      {
        text: "¿Qué ocurrió cuando trabajaron juntos?",

        choices: [
          "El robot volvió a andar",
          "El robot se perdió",
          "Dejaron de jugar"
        ],

        answer: "El robot volvió a andar",

        hint: "Recuerda qué pasó después de colocar nuevamente la rueda."
      }
    ]
  },

  // ==========================================
  // HISTORIA 3: UN NUEVO AMIGO EN MARTE
  // ==========================================

  {
    id: "marte",
    title: "Un nuevo amigo en Marte",
    lesson: "Incluir a otros y jugar con amabilidad",

    scenes: [
      {
        title: "Alguien se quedó solo",
        narration:
          "En el recreo espacial, varios niños jugaban a construir una base en Marte. Sam estaba sentado solo. Quería participar, pero le daba vergüenza preguntar.",

        image: "/historias/marte/01-sam-solo.png",

        alt: "Un grupo de niños juega en Marte mientras Sam se encuentra solo."
      },

      {
        title: "Una invitación especial",
        narration:
          "Alma se acercó a Sam y le dijo: ¿Quieres jugar con nosotros? Sam respondió que sí. Alma le explicó las reglas con paciencia.",

        image: "/historias/marte/02-invitacion-a-jugar.png",

        alt: "Alma invita a Sam a participar en el juego de sus compañeros."
      },

      {
        title: "Todos forman un equipo",
        narration:
          "Sam ayudó a construir la base espacial. Todos se turnaron y jugaron juntos. Sam sonrió porque ahora se sentía parte del equipo.",

        image: "/historias/marte/03-equipo-en-marte.png",

        alt: "Sam y sus compañeros construyen juntos una base espacial en Marte."
      }
    ],

    questions: [
      {
        text: "¿Quién estaba sentado solo?",

        choices: [
          "Alma",
          "Sam",
          "Un astronauta adulto"
        ],

        answer: "Sam",

        hint: "Es el niño que quería participar, pero le daba vergüenza preguntar."
      },

      {
        text: "¿Cómo ayudó Alma a Sam?",

        choices: [
          "Lo invitó a jugar",
          "Le dijo que se fuera",
          "Escondió los juguetes"
        ],

        answer: "Lo invitó a jugar",

        hint: "Alma se acercó y le hizo una pregunta amable."
      },

      {
        text: "¿Cómo se sintió Sam al final?",

        choices: [
          "Excluido",
          "Asustado",
          "Parte del equipo"
        ],

        answer: "Parte del equipo",

        hint: "Al final, Sam jugaba con todos y estaba sonriendo."
      }
    ]
  }
];