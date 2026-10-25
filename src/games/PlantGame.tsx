import { useEffect, useRef, useState } from "react";
import "./PlantGame.css";

type Choice = {
  id: string;
  label: string;
  symbol: string;
  image: string;
  correct: boolean;
  explanation: string;
};
type Stage = {
  title: string;
  question: string;
  idleImage: string;
  hint: string;
  choices: Choice[];
};

const img = (name: string) => `/plant/${name}.png`;
const sound = (id: string) => `/sounds/plant/${id}.wav`;

const stages: Stage[] = [
  {
    title: "¡Vamos a sembrar!",
    question: "¿Qué debemos poner en la tierra?",
    idleImage: img("00-maceta-vacia"),
    hint: "Las plantas nacen de las semillas.",
    choices: [
      { id: "seed", label: "Semilla", symbol: "🌰", image: img("01-semilla-enterrada"), correct: true, explanation: "¡Muy bien! La semilla puede germinar dentro de la tierra." },
      { id: "stone", label: "Piedra", symbol: "🪨", image: img("02-piedra"), correct: false, explanation: "Una piedra no puede germinar. Necesitamos una semilla para comenzar." },
      { id: "candy", label: "Caramelo", symbol: "🍬", image: img("03-caramelo"), correct: false, explanation: "Un caramelo no puede convertirse en planta. Vamos a elegir una semilla." }
    ]
  },
  {
    title: "¡Nuestra semilla está sembrada!",
    question: "¿Qué necesita para germinar?",
    idleImage: img("01-semilla-enterrada"),
    hint: "Para germinar, una semilla necesita agua.",
    choices: [
      { id: "water", label: "Agua", symbol: "💧", image: img("04-agua"), correct: true, explanation: "¡Correcto! El agua ayuda a que la semilla germine." },
      { id: "soda", label: "Gaseosa", symbol: "🥤", image: img("05-gaseosa"), correct: false, explanation: "La gaseosa contiene azúcar y otros ingredientes que pueden perjudicar a la planta. Es mejor regar con agua." },
      { id: "paint", label: "Pintura", symbol: "🎨", image: img("06-pintura"), correct: false, explanation: "La pintura puede contaminar la tierra y perjudicar el crecimiento. Usemos agua." }
    ]
  },
  {
    title: "¡Ha nacido una plantita!",
    question: "¿Qué necesita para seguir creciendo?",
    idleImage: img("04-agua"),
    hint: "La planta usa la luz para fabricar su alimento.",
    choices: [
      { id: "sun", label: "Luz solar", symbol: "☀️", image: img("07-luz-solar"), correct: true, explanation: "¡Muy bien! La luz del sol ayuda a la planta a fabricar su alimento y crecer." },
      { id: "dark", label: "Oscuridad", symbol: "🌙", image: img("08-oscuridad-sin-planta"), correct: false, explanation: "Si pasa mucho tiempo sin luz, la planta se debilita. Necesita luz para crecer sana." },
      { id: "ice", label: "Mucho hielo", symbol: "🧊", image: img("09-hielo-sin-planta"), correct: false, explanation: "El frío extremo puede dañar esta plantita. Necesita un ambiente adecuado." }
    ]
  },
  {
    title: "¡Nuestra planta está creciendo!",
    question: "¿Qué debemos hacer para que florezca?",
    idleImage: img("07-luz-solar"),
    hint: "Debemos continuar dándole los cuidados que necesita.",
    choices: [
      { id: "care", label: "Seguir cuidándola", symbol: "💚", image: img("10-florece"), correct: true, explanation: "¡Fantástico! Con agua, luz y buenos cuidados, nuestra planta ha florecido." },
      { id: "neglect", label: "Dejar de cuidarla", symbol: "🚫", image: img("11-marchita"), correct: false, explanation: "Si dejamos de cuidarla, puede faltarle agua y terminar marchitándose." },
      { id: "cut", label: "Arrancar sus hojas", symbol: "✂️", image: img("12-hojas-arrancadas"), correct: false, explanation: "Las hojas ayudan a fabricar su alimento. Arrancarlas puede debilitar a la planta." }
    ]
  }
];

type Props = { onComplete: () => void };

export default function PlantGame({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stage = stages[step];
  const won = step === stages.length - 1 && choice?.correct === true;
  const failed = choice?.correct === false;
  const currentImage = choice?.image ?? stage.idleImage;

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function playSound(id: string) {
    audioRef.current?.pause();
    audioRef.current = null;
    if (!soundEnabled) return;
    const audio = new Audio(sound(id));
    audio.volume = 0.85;
    audioRef.current = audio;
    void audio.play().catch(() => {
      // Algunos navegadores deshabilitan audio; el juego continúa funcionando.
    });
  }

  function choose(value: Choice) {
    if (choice) return;
    setChoice(value);
    setShowHint(false);
    playSound(value.id); // reproducir al seleccionar: permitido por los navegadores móviles
    if (value.correct && step === stages.length - 1) onComplete();
  }

  function nextStage() {
    if (!choice?.correct || won) return;
    setStep((value) => value + 1);
    setChoice(null);
  }

  function restart() {
    audioRef.current?.pause();
    setStep(0);
    setChoice(null);
    setShowHint(false);
  }

  return (
    <div className="plant-game">
      <div className="plant-game__toolbar">
        <div>
          <strong>🪴 Laboratorio de plantas</strong>
          <span className="plant-game__step-label">
            {won ? "¡Misión superada!" : failed ? "Intento terminado" : `Etapa ${step + 1} de 4`}
          </span>
        </div>
        <button
          type="button"
          className="plant-game__sound-toggle"
          onClick={() => {
            audioRef.current?.pause();
            setSoundEnabled((value) => !value);
          }}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? "🔊 Sonido activado" : "🔇 Sonido desactivado"}
        </button>
      </div>

      <div className="plant-game__progress" aria-label={`Etapa ${step + 1} de 4`}>
        {stages.map((item, index) => (
          <span key={item.title} className={index < step || (won && index === step) ? "completed" : index === step && !failed ? "current" : ""} />
        ))}
      </div>

      <div className="plant-game__layout">
        <div className="plant-game__visual">
          <img key={currentImage} src={currentImage} alt={choice ? `Resultado: ${choice.label}. ${choice.explanation}` : `Escenario de la etapa ${step + 1} de la planta`} />
          <div className="plant-game__visual-footer">
            <span>{choice ? "Resultado de tu elección" : "Mira la escena y elige una opción"}</span>
            {choice && (
              <button type="button" onClick={() => playSound(choice.id)} disabled={!soundEnabled} aria-label="Volver a escuchar el sonido">
                🔁 Escuchar sonido
              </button>
            )}
          </div>
        </div>

        <section className="plant-game__panel" aria-live="polite">
          <span className="plant-game__eyebrow">🌱 Misión 1 · Ciencia y ambiente</span>
          <h2>{won ? "¡La planta floreció!" : failed ? "¡Podemos aprender y reintentar!" : stage.title}</h2>
          <p className="plant-game__question">{choice ? choice.explanation : stage.question}</p>

          {!choice ? (
            <>
              <div className="plant-game__choices">
                {stage.choices.map((option) => (
                  <button type="button" key={option.id} onClick={() => choose(option)} className="plant-game__choice">
                    <span className="plant-game__choice-icon" aria-hidden="true">{option.symbol}</span>
                    <span>{option.label}</span>
                    <span aria-hidden="true" className="plant-game__choice-arrow">→</span>
                  </button>
                ))}
              </div>
              <button type="button" className="plant-game__hint-trigger" onClick={() => setShowHint((value) => !value)}>
                💡 {showHint ? "Ocultar pista" : "Necesito una pista"}
              </button>
              {showHint && <p className="plant-game__hint">{stage.hint}</p>}
            </>
          ) : (
            <div className="plant-game__feedback">
              <div className={choice.correct ? "plant-game__status success" : "plant-game__status error"}>
                {choice.correct ? "✓ Buena elección" : "↻ Esa no era la mejor opción"}
              </div>
              {won ? (
                <>
                  <div className="plant-game__prize">🏆 ¡Ganaste una estrella!</div>
                  <button type="button" className="plant-game__primary" onClick={restart}>🌱 Volver a jugar</button>
                </>
              ) : failed ? (
                <button type="button" className="plant-game__primary" onClick={restart}>🔄 Reintentar desde el inicio</button>
              ) : (
                <button type="button" className="plant-game__primary" onClick={nextStage}>Continuar a la etapa {step + 2} →</button>
              )}
            </div>
          )}
        </section>
      </div>
      <p className="plant-game__fineprint">Los efectos muestran qué podría pasar con cuidados incorrectos prolongados; equivocarse una vez no siempre destruye una planta real.</p>
    </div>
  );
}
