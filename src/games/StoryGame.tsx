
import { useEffect, useRef, useState } from "react";
import { STORIES } from "../data/stories";
import { publicUrl } from "../lib/publicUrl";
import type { Question, Story } from "../data/stories";
import "./StoryGame.css";

// ==========================================
// TIPOS
// ==========================================

type Phase = "welcome" | "scenes" | "questions" | "finished";

type PreparedQuestion = Question & {
  shuffledChoices: string[];
};

// ==========================================
// FUNCIONES PARA MEZCLAR
// ==========================================

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function prepareQuestions(story: Story): PreparedQuestion[] {
  return shuffle(story.questions).map((question) => ({
    ...question,
    shuffledChoices: shuffle(question.choices)
  }));
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function StoryGame({
  onComplete
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");

  const [story, setStory] = useState<Story | null>(null);

  const [sceneIndex, setSceneIndex] = useState(0);

  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);

  const [questionIndex, setQuestionIndex] = useState(0);

  const [correct, setCorrect] = useState(false);

  const [hintVisible, setHintVisible] = useState(false);

  const [feedback, setFeedback] = useState("");

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [voiceAvailable] = useState(
    () =>
      typeof window !== "undefined" &&
      "speechSynthesis" in window
  );

  const unusedIds = useRef<string[]>([]);
  const awarded = useRef(false);

  // ==========================================
  // LIMPIAR LA NARRACIÓN
  // ==========================================

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ==========================================
  // VOZ EN OFF
  // ==========================================

  function stopNarration() {
    if (voiceAvailable) {
      window.speechSynthesis.cancel();
    }
  }

  function narrate(text: string) {
    if (!voiceEnabled || !voiceAvailable) return;

    stopNarration();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "es-PE";
    speech.rate = 0.88;
    speech.pitch = 1.03;
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const spanishVoice =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "es-pe"
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("es-")
      );

    if (spanishVoice) {
      speech.voice = spanishVoice;
    }

    window.speechSynthesis.speak(speech);
  }

  function toggleVoice() {
    if (voiceEnabled) {
      stopNarration();
    }

    setVoiceEnabled(!voiceEnabled);
  }

  // ==========================================
  // SELECCIÓN ALEATORIA DE HISTORIAS
  // ==========================================

  function chooseRandomStory() {
    stopNarration();

    const options = unusedIds.current.length
      ? [...unusedIds.current]
      : shuffle(STORIES.map((item) => item.id));

    // Evita repetir inmediatamente la última historia.
    if (
      options.length > 1 &&
      options[0] === story?.id
    ) {
      [options[0], options[1]] = [options[1], options[0]];
    }

    const selectedId = options.shift();

    if (!selectedId) return;

    unusedIds.current = options;

    const nextStory = STORIES.find(
      (item) => item.id === selectedId
    );

    if (!nextStory) return;

    setStory(nextStory);

    setSceneIndex(0);
    setQuestionIndex(0);

    setQuestions(prepareQuestions(nextStory));

    setCorrect(false);
    setHintVisible(false);
    setFeedback("");

    setPhase("scenes");

    narrate(
      `${nextStory.title}. ${nextStory.scenes[0].narration}`
    );
  }

  // ==========================================
  // AVANZAR ESCENAS
  // ==========================================

  function nextScene() {
    if (!story) return;

    stopNarration();

    if (sceneIndex < story.scenes.length - 1) {
      const nextIndex = sceneIndex + 1;

      setSceneIndex(nextIndex);

      narrate(story.scenes[nextIndex].narration);
    } else {
      setPhase("questions");

      if (questions.length > 0) {
        narrate(
          `Vamos a recordar la historia. ${questions[0].text}`
        );
      }
    }
  }

  // ==========================================
  // VALIDAR RESPUESTAS
  // ==========================================

  function selectAnswer(answer: string) {
    if (correct) return;

    const question = questions[questionIndex];

    if (!question) return;

    if (answer === question.answer) {
      setCorrect(true);
      setHintVisible(false);

      setFeedback(
        "¡Muy bien! Esa es la respuesta correcta."
      );

      narrate(
        "¡Muy bien! Esa es la respuesta correcta."
      );
    } else {
      setHintVisible(true);

      setFeedback(
        "Todavía no. Escucha la pista y vuelve a intentarlo."
      );

      narrate(
        `Inténtalo otra vez. ${question.hint}`
      );
    }
  }

  // ==========================================
  // SIGUIENTE PREGUNTA
  // ==========================================

  function nextQuestion() {
    if (!correct) return;

    stopNarration();

    if (questionIndex === questions.length - 1) {
      setPhase("finished");

      narrate(
        "¡Felicitaciones! Respondiste las tres preguntas. ¡Misión superada!"
      );

      if (!awarded.current) {
        awarded.current = true;
        onComplete();
      }

      return;
    }

    const nextIndex = questionIndex + 1;

    setQuestionIndex(nextIndex);

    setCorrect(false);
    setHintVisible(false);
    setFeedback("");

    narrate(questions[nextIndex].text);
  }

  // ==========================================
  // DATOS ACTUALES
  // ==========================================

  const scene = story?.scenes[sceneIndex];
  const question = questions[questionIndex];

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <section className="story-game">

      {/* CABECERA */}

      <header className="story-game__header">

        <div>
          <strong>
            📖 Historias para ayudar
          </strong>

          <p>
            Escucha, recuerda y aprende a convivir con amabilidad.
          </p>
        </div>

        <button
          type="button"
          className="story-game__sound"
          disabled={!voiceAvailable}
          onClick={toggleVoice}
        >
          {!voiceAvailable
            ? "Voz no disponible"
            : voiceEnabled
            ? "🔊 Voz activada"
            : "🔇 Voz desactivada"}
        </button>

      </header>

      {/* ==================================
          PANTALLA DE BIENVENIDA
      ================================== */}

      {phase === "welcome" && (

        <div className="story-game__welcome">

          <div
            className="story-game__welcome-art"
            aria-hidden="true"
          >
            📚🚀
          </div>

          <h2>
            ¡Hora de escuchar una historia sorpresa!
          </h2>

          <p>
            Escucharás una aventura con tres momentos.
            Después responderás tres preguntas sobre
            lo que sucedió.
          </p>

          <p>
            ¡Puedes pedir pistas si necesitas ayuda!
          </p>

          <button
            type="button"
            className="story-game__primary"
            onClick={chooseRandomStory}
          >
            ✨ Descubrir historia
          </button>

          <small>
            Las historias aparecen al azar.
            Descubre las tres aventuras.
          </small>

        </div>

      )}

      {/* ==================================
          ESCENAS ILUSTRADAS
      ================================== */}

      {phase === "scenes" && story && scene && (

        <div className="story-game__content">

          <div className="story-game__heading">

            <span className="story-game__eyebrow">
              Escena {sceneIndex + 1} de {story.scenes.length}
            </span>

            <h2>{story.title}</h2>

            <p>{story.lesson}</p>

          </div>

          {/* PROGRESO */}

          <div
            className="story-game__progress"
            aria-label="Progreso de la historia"
          >

            {story.scenes.map((_, index) => (

              <span
                key={index}
                className={
                  index <= sceneIndex ? "active" : ""
                }
              />

            ))}

          </div>

          <div className="story-game__scene">

            {/* IMAGEN DE LA HISTORIA */}

            <div className="story-game__art">

              <img
                key={`${story.id}-${sceneIndex}`}
                src={publicUrl(scene.image)}
                alt={scene.alt}
                className="story-game__image"
                draggable={false}
                loading="eager"
              />

            </div>

            {/* NARRACIÓN */}

            <div className="story-game__narration">

              <h3>{scene.title}</h3>

              <p>
                {scene.narration}
              </p>

              <div className="story-game__controls">

                <button
                  type="button"
                  className="story-game__secondary"
                  disabled={!voiceAvailable}
                  onClick={() =>
                    narrate(scene.narration)
                  }
                >
                  🔊 Escuchar otra vez
                </button>

                <button
                  type="button"
                  className="story-game__primary"
                  onClick={nextScene}
                >
                  {sceneIndex === story.scenes.length - 1
                    ? "Ir a las preguntas →"
                    : "Siguiente escena →"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================
          PREGUNTAS DE COMPRENSIÓN
      ================================== */}

      {phase === "questions" && story && question && (

        <div className="story-game__quiz">

          <span className="story-game__eyebrow">
            {story.title} · Pregunta {questionIndex + 1} de {questions.length}
          </span>

          {/* PROGRESO */}

          <div
            className="story-game__progress"
            aria-label="Progreso de preguntas"
          >

            {questions.map((_, index) => (

              <span
                key={index}
                className={
                  index <= questionIndex ? "active" : ""
                }
              />

            ))}

          </div>

          <div
            className="story-game__quiz-symbol"
            aria-hidden="true"
          >
            🧠🌟
          </div>

          <h2>
            {question.text}
          </h2>

          <button
            type="button"
            className="story-game__secondary"
            disabled={!voiceAvailable}
            onClick={() =>
              narrate(question.text)
            }
          >
            🔊 Escuchar pregunta
          </button>

          {/* RESPUESTAS */}

          <div className="story-game__choices">

            {question.shuffledChoices.map((answer) => (

              <button
                key={answer}
                type="button"
                disabled={correct}
                className={
                  correct &&
                  answer === question.answer
                    ? "correct"
                    : ""
                }
                onClick={() =>
                  selectAnswer(answer)
                }
              >
                {answer}
              </button>

            ))}

          </div>

          {/* PISTAS */}

          <div className="story-game__hint">

            <button
              type="button"
              onClick={() => {

                setHintVisible(!hintVisible);

                if (!hintVisible) {
                  narrate(question.hint);
                }

              }}
            >
              💡 {hintVisible
                ? "Ocultar pista"
                : "Necesito una pista"}
            </button>

            {hintVisible && (

              <p>
                {question.hint}
              </p>

            )}

          </div>

          {/* RESULTADO */}

          <p
            className={`story-game__feedback ${
              correct ? "success" : ""
            }`}
            role="status"
          >
            {feedback}
          </p>

          {/* AVANZAR */}

          {correct && (

            <button
              type="button"
              className="story-game__primary"
              onClick={nextQuestion}
            >
              {questionIndex === questions.length - 1
                ? "🏆 Terminar la misión"
                : "Siguiente pregunta →"}
            </button>

          )}

        </div>

      )}

      {/* ==================================
          MISIÓN COMPLETADA
      ================================== */}

      {phase === "finished" && story && (

        <div className="story-game__finish">

          <div
            className="story-game__trophy"
            aria-hidden="true"
          >
            🏆
          </div>

          <h2>
            ¡Misión completada!
          </h2>

          <p>
            ¡Recordaste los tres momentos de{" "}
            <strong>{story.title}</strong>
            {" "}y respondiste correctamente
            las tres preguntas!
          </p>

          <p>
            Lo aprendido: {story.lesson.toLowerCase()}.
          </p>

          <button
            type="button"
            className="story-game__primary"
            onClick={chooseRandomStory}
          >
            📚 Descubrir otra historia
          </button>

        </div>

      )}

    </section>
  );
}