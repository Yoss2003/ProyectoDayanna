import { useEffect, useMemo, useRef, useState } from "react";
import { say } from "../lib/voice";
import { publicUrl } from "../lib/publicUrl";
import "./SoundDetectiveGame.css";

type ZoneId = "parque" | "casa" | "calle";

type SoundItem = {
  id: string;
  label: string;
  emoji: string;
  sound: string;
  zone: ZoneId;
  description: string;
};

type Round = {
  soundId: string;
  options: string[];
};

const SOUND_ITEMS: SoundItem[] = [
  {
    id: "bird",
    label: "Pájaro",
    emoji: "🐦",
    sound: publicUrl("sounds/detectives/pajaro.mp3"),
    zone: "parque",
    description: "Los pájaros suelen escucharse en el parque."
  },
  {
    id: "dog",
    label: "Perro",
    emoji: "🐶",
    sound: publicUrl("sounds/detectives/perro.mp3"),
    zone: "parque",
    description: "El perro puede escucharse en el parque."
  },
  {
    id: "clock",
    label: "Reloj",
    emoji: "⏰",
    sound: publicUrl("sounds/detectives/reloj.mp3"),
    zone: "casa",
    description: "El reloj suele escucharse dentro de casa."
  },
  {
    id: "cry",
    label: "Bebé llorando",
    emoji: "👶",
    sound: publicUrl("sounds/detectives/llanto.mp3"),
    zone: "casa",
    description: "Ese sonido puede escucharse dentro de casa."
  },
  {
    id: "car",
    label: "Carro",
    emoji: "🚗",
    sound: publicUrl("sounds/detectives/carro.mp3"),
    zone: "calle",
    description: "Los carros se escuchan en la calle."
  },
  {
    id: "train",
    label: "Tren",
    emoji: "🚂",
    sound: publicUrl("sounds/detectives/tren.mp3"),
    zone: "calle",
    description: "El tren se escucha cerca de la vía o la ciudad."
  }
];


const ROUNDS: Round[] = [
  {
    soundId: "bird",
    options: ["bird", "car", "clock"]
  },
  {
    soundId: "dog",
    options: ["dog", "train", "cry"]
  },
  {
    soundId: "clock",
    options: ["clock", "bird", "car"]
  },
  {
    soundId: "cry",
    options: ["cry", "dog", "clock"]
  },
  {
    soundId: "car",
    options: ["car", "dog", "train"]
  },
  {
    soundId: "train",
    options: ["train", "car", "bird"]
  }
];


const ZONES: {
  id: ZoneId;
  title: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "parque",
    title: "Parque",
    emoji: "🌳",
    description: "Lugar con árboles, aves y animales."
  },
  {
    id: "casa",
    title: "Casa",
    emoji: "🏠",
    description: "Lugar donde vivimos y descansamos."
  },
  {
    id: "calle",
    title: "Calle",
    emoji: "🛣️",
    description: "Lugar donde pasan vehículos."
  }
];

function getItem(id: string) {
  return SOUND_ITEMS.find((item) => item.id === id)!;
}

export default function SoundDetectiveGame({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"guess" | "map" | "done">("guess");
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState(
    "Escucha con atención y elige la imagen correcta."
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [roundSolved, setRoundSolved] = useState(false);
  const [recognized, setRecognized] = useState<string[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<ZoneId, string[]>>({
    parque: [],
    casa: [],
    calle: [],
  });
  const [soundOn, setSoundOn] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completedRef = useRef(false);

  const round = ROUNDS[roundIndex];
  const currentSound = getItem(round.soundId);

  const placedIds = useMemo(() => {
    return [
      ...placed.parque,
      ...placed.casa,
      ...placed.calle,
    ];
  }, [placed]);

  const availableStickers = recognized.filter((id) => !placedIds.includes(id));

  useEffect(() => {
    if (phase === "done" && !completedRef.current) {
      completedRef.current = true;
      say("¡Excelente! Completaste tu mapa sonoro.");
      onComplete();
    }
  }, [phase, onComplete]);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  function playSound(src: string) {
    if (!soundOn) return;

    try {
      stopAudio();
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.play().catch(() => {
        setFeedback("No se pudo reproducir el sonido. Revisa si el archivo existe.");
      });
    } catch {
      setFeedback("No se pudo reproducir el sonido.");
    }
  }

  function playCurrentRoundSound() {
    playSound(currentSound.sound);
  }

  function chooseOption(id: string) {
    if (roundSolved) return;

    setSelectedOption(id);

    if (id === round.soundId) {
      setRoundSolved(true);

      if (!recognized.includes(id)) {
        setRecognized((prev) => [...prev, id]);
      }

      setFeedback(`¡Muy bien! Reconociste el sonido de ${getItem(id).label.toLowerCase()}.`);

      if (soundOn) {
        say(`Muy bien. Es ${getItem(id).label.toLowerCase()}.`);
      }
    } else {
      setFeedback("Esa opción no corresponde al sonido. Escucha otra vez e inténtalo.");
    }
  }

  function nextRound() {
    if (roundIndex === ROUNDS.length - 1) {
      setPhase("map");
      setFeedback("Ahora ubica cada sonido en el lugar donde normalmente se escucha.");
      setSelectedOption(null);
      setRoundSolved(false);
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setSelectedOption(null);
    setRoundSolved(false);
    setFeedback("Escucha con atención y elige la imagen correcta.");
  }

  function chooseZone(zoneId: ZoneId) {
    if (!selectedSticker) {
      setFeedback("Primero elige una ficha de sonido.");
      return;
    }

    const item = getItem(selectedSticker);

    if (item.zone !== zoneId) {
      setFeedback("Ese sonido no va en ese lugar. Piensa dónde se escucha normalmente.");
      return;
    }

    setPlaced((prev) => ({
      ...prev,
      [zoneId]: [...prev[zoneId], selectedSticker],
    }));

    setFeedback(item.description);
    setSelectedSticker(null);

    const remaining = availableStickers.filter((id) => id !== selectedSticker);

    if (remaining.length === 0) {
      setPhase("done");
    }
  }

  function restartAll() {
    stopAudio();
    setPhase("guess");
    setRoundIndex(0);
    setFeedback("Escucha con atención y elige la imagen correcta.");
    setSelectedOption(null);
    setRoundSolved(false);
    setRecognized([]);
    setSelectedSticker(null);
    setPlaced({
      parque: [],
      casa: [],
      calle: [],
    });
    completedRef.current = false;
  }

  return (
    <section className="sound-game">
      <header className="sound-game__header">
        <div>
          <strong>🔊 Detectives de sonidos</strong>
          <p>Escucha, identifica y ubica los sonidos en su lugar.</p>
        </div>

        <button
          type="button"
          className="sound-game__toggle"
          onClick={() => setSoundOn((v) => !v)}
        >
          {soundOn ? "🔊 Sonido activado" : "🔇 Sonido desactivado"}
        </button>
      </header>

      <div className="sound-game__progress">
        <span
          style={{
            width:
              phase === "guess"
                ? `${((roundIndex + (roundSolved ? 1 : 0)) / ROUNDS.length) * 100}%`
                : phase === "map"
                ? "80%"
                : "100%",
          }}
        />
      </div>

      {phase === "guess" && (
        <div className="sound-game__layout">
          <div className="sound-panel">
            <div className="sound-panel__illustration">
              <div className="sound-panel__big-icon">🎧</div>
              <p>Presiona el botón y escucha el sonido.</p>
            </div>

            <button
              type="button"
              className="sound-panel__play"
              onClick={playCurrentRoundSound}
            >
              ▶ Escuchar sonido
            </button>

            <div className="sound-panel__feedback" role="status">
              {feedback}
            </div>
          </div>

          <aside className="sound-options">
            <p className="sound-options__step">
              Ronda {roundIndex + 1} de {ROUNDS.length}
            </p>

            <h3>¿Qué sonido escuchaste?</h3>

            <div className="sound-options__grid">
              {round.options.map((optionId) => {
                const item = getItem(optionId);
                const active = selectedOption === optionId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sound-card ${active ? "sound-card--active" : ""}`}
                    onClick={() => chooseOption(item.id)}
                  >
                    <span className="sound-card__emoji">{item.emoji}</span>
                    <strong>{item.label}</strong>
                  </button>
                );
              })}
            </div>

            {roundSolved && (
              <button
                type="button"
                className="sound-options__next"
                onClick={nextRound}
              >
                {roundIndex === ROUNDS.length - 1
                  ? "🗺️ Ir al mapa sonoro"
                  : "➡️ Siguiente sonido"}
              </button>
            )}
          </aside>
        </div>
      )}

      {phase === "map" && (
        <div className="sound-game__layout">
          <div className="sound-map">
            <h3>🗺️ Mapa sonoro</h3>
            <p>Toca una ficha y luego el lugar donde se escucha ese sonido.</p>

            <div className="sound-map__zones">
              {ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  className="sound-zone"
                  onClick={() => chooseZone(zone.id)}
                >
                  <div className="sound-zone__title">
                    <span>{zone.emoji}</span>
                    <strong>{zone.title}</strong>
                  </div>

                  <p>{zone.description}</p>

                  <div className="sound-zone__stickers">
                    {placed[zone.id].map((soundId) => {
                      const item = getItem(soundId);

                      return (
                        <span
                          key={soundId}
                          className="sound-sticker sound-sticker--placed"
                        >
                          {item.emoji} {item.label}
                        </span>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="sound-tray">
            <h3>🎵 Fichas descubiertas</h3>
            <p>Elige una ficha y colócala en su lugar.</p>

            <div className="sound-tray__items">
              {availableStickers.map((soundId) => {
                const item = getItem(soundId);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sound-sticker ${
                      selectedSticker === item.id ? "sound-sticker--selected" : ""
                    }`}
                    onClick={() => setSelectedSticker(item.id)}
                  >
                    {item.emoji} {item.label}
                  </button>
                );
              })}

              {availableStickers.length === 0 && (
                <div className="sound-tray__empty">
                  ¡Ya colocaste todas las fichas!
                </div>
              )}
            </div>

            <div className="sound-panel__feedback" role="status">
              {feedback}
            </div>
          </aside>
        </div>
      )}

      {phase === "done" && (
        <div className="sound-complete">
          <h3>🏆 ¡Misión completada!</h3>
          <p>Escuchaste, reconociste y organizaste los sonidos del entorno.</p>

          <div className="sound-complete__summary">
            {ZONES.map((zone) => (
              <div key={zone.id} className="sound-complete__zone">
                <strong>
                  {zone.emoji} {zone.title}
                </strong>

                <div className="sound-zone__stickers">
                  {placed[zone.id].map((soundId) => {
                    const item = getItem(soundId);

                    return (
                      <span
                        key={soundId}
                        className="sound-sticker sound-sticker--placed"
                      >
                        {item.emoji} {item.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="sound-options__next"
            onClick={restartAll}
          >
            🔄 Volver a jugar
          </button>
        </div>
      )}
    </section>
  );
}