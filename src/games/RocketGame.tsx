
import { useEffect, useRef, useState } from "react";
import {
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import { say } from "../lib/voice";
import "./RocketGame.css";

type PieceId =
  | "body"
  | "nose"
  | "window"
  | "leftWing"
  | "rightWing"
  | "engine"
  | "flame";

type Piece = {
  id: PieceId;
  name: string;
  shape: string;
};

const PIECES: Piece[] = [
  { id: "nose", name: "Punta", shape: "Triángulo" },
  { id: "body", name: "Cuerpo", shape: "Rectángulo" },
  { id: "window", name: "Ventana", shape: "Círculo" },
  { id: "leftWing", name: "Aleta izquierda", shape: "Triángulo" },
  { id: "rightWing", name: "Aleta derecha", shape: "Triángulo" },
  { id: "engine", name: "Motor", shape: "Trapecio" },
  { id: "flame", name: "Llama", shape: "Gota" },
];

// Ubicación de cada pieza dentro del cohete.

const POSITIONS: Record<
  PieceId,
  {
    left: string;
    top: string;
    width: string;
    height: string;
    zIndex: number;
  }
> = {
  nose: {
    left: "36.5%",
    top: "11%",
    width: "27%",
    height: "19%",
    zIndex: 3
  },

  body: {
    left: "34%",
    top: "28%",
    width: "32%",
    height: "42%",
    zIndex: 2
  },

  window: {
    left: "42%",
    top: "38%",
    width: "16%",
    height: "13%",
    zIndex: 6
  },

  leftWing: {
    left: "21.5%",
    top: "46%",
    width: "20%",
    height: "25%",
    zIndex: 4
  },

  rightWing: {
    left: "58.5%",
    top: "46%",
    width: "20%",
    height: "25%",
    zIndex: 4
  },

  engine: {
    left: "39.5%",
    top: "68.5%",
    width: "21%",
    height: "12%",
    zIndex: 3
  },

  flame: {
    left: "43%",
    top: "79%",
    width: "14%",
    height: "14%",
    zIndex: 2
  }
};


// Dibujos vectoriales independientes.
function RocketShape({ id }: { id: PieceId }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {id === "nose" && (
        <>
          <path
            d="M12 96 Q23 37 50 5 Q77 37 88 96 Z"
            fill="#fa6a57"
            stroke="#a73b41"
            strokeWidth="4"
          />
          <path
            d="M50 10 Q32 39 27 83"
            fill="none"
            stroke="#ffb4a3"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "body" && (
        <>
          <rect
            x="12" y="1" width="76" height="98" rx="23"
            fill="#f7fbff"
            stroke="#8daec9"
            strokeWidth="4"
          />
          <path
            d="M27 17 V81"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M69 18 V81"
            stroke="#e2edf7"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "window" && (
        <>
          <circle
            cx="50" cy="50" r="38"
            fill="#546e88"
            stroke="#2f4a63"
            strokeWidth="5"
          />
          <circle
            cx="50" cy="50" r="28"
            fill="#a7e7fb"
            stroke="#7bbfd8"
            strokeWidth="4"
          />
          <path
            d="M31 41 Q40 27 52 29"
            fill="none"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "leftWing" && (
        <>
          <path
            d="M89 8 Q35 15 23 45 Q10 70 8 96 Q50 91 91 68 Z"
            fill="#ec594d"
            stroke="#9f3941"
            strokeWidth="4"
          />
          <path
            d="M71 36 Q43 54 33 83"
            fill="none"
            stroke="#ffaaa0"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "rightWing" && (
        <>
          <path
            d="M11 8 Q65 15 77 45 Q90 70 92 96 Q50 91 9 68 Z"
            fill="#ec594d"
            stroke="#9f3941"
            strokeWidth="4"
          />
          <path
            d="M29 36 Q57 54 67 83"
            fill="none"
            stroke="#ffaaa0"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "engine" && (
        <>
          <path
            d="M10 10 H90 L72 91 H28 Z"
            fill="#8ea1b4"
            stroke="#536b82"
            strokeWidth="5"
          />
          <path
            d="M33 22 H67"
            stroke="#dfe9f2"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      )}

      {id === "flame" && (
        <>
          <path
            d="M49 3 Q78 38 69 67 Q66 87 50 99 Q29 82 30 66 Q16 43 49 3 Z"
            fill="#ff7c38"
            stroke="#dc4e28"
            strokeWidth="4"
          />
          <path
            d="M50 28 Q64 58 52 88 Q36 70 50 28 Z"
            fill="#ffd553"
          />
        </>
      )}
    </svg>
  );
}

// Pieza que el niño puede arrastrar.
function PieceTile({
  piece,
  chosen,
  onChoose,
}: {
  piece: Piece;
  chosen: boolean;
  onChoose: (id: PieceId) => void;
}) {
  const { ref, isDragging } = useDraggable({
    id: `piece:${piece.id}`,
  });

  return (
    <button
      ref={ref}
      type="button"
      className={`rocket-piece ${
        chosen ? "rocket-piece--chosen" : ""
      } ${isDragging ? "rocket-piece--dragging" : ""}`}
      aria-pressed={chosen}
      onClick={() => onChoose(piece.id)}
    >
      <span className="rocket-piece__art">
        <RocketShape id={piece.id} />
      </span>

      <span className="rocket-piece__label">
        <strong>{piece.name}</strong>
        <small>{piece.shape}</small>
      </span>
    </button>
  );
}

// Espacio donde debe encajar cada pieza.
function RocketSlot({
  piece,
  filled,
  selected,
  onChoose,
}: {
  piece: Piece;
  filled: boolean;
  selected: boolean;
  onChoose: (id: PieceId) => void;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `slot:${piece.id}`,
    disabled: filled,
    collisionPriority: piece.id === "window" ? 2 : 0,
  });

  return (
    <button
      ref={ref}
      type="button"
      disabled={filled}
      aria-label={`Lugar para ${piece.name}`}
      onClick={() => onChoose(piece.id)}
      className={`rocket-slot ${
        filled ? "rocket-slot--filled" : ""
      } ${isDropTarget ? "rocket-slot--over" : ""
      } ${selected && !filled ? "rocket-slot--selected" : ""}`}
      style={POSITIONS[piece.id]}
    >
      <RocketShape id={piece.id} />
    </button>
  );
}

export default function RocketGame({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [placed, setPlaced] = useState<PieceId[]>([]);
  const [selected, setSelected] = useState<PieceId | null>(null);
  const [message, setMessage] = useState(
    "Arrastra una pieza a su silueta, o tócala y elige su lugar."
  );
  const [attempts, setAttempts] = useState(0);
  const celebrated = useRef(false);

  const finished = placed.length === PIECES.length;

  // Registra la misión cuando se arma el cohete.
  useEffect(() => {
    if (!finished || celebrated.current) return;

    celebrated.current = true;
    say("¡Excelente! Construiste tu cohete espacial.");
    onComplete();
  }, [finished, onComplete]);

  function tryPlace(pieceId: PieceId, slotId: PieceId) {
    if (placed.includes(pieceId)) return;

    if (pieceId !== slotId) {
      setAttempts((n) => n + 1);
      setMessage(
        "Esa figura no encaja aquí. ¡Busca una silueta con su misma forma!"
      );
      return;
    }

    const piece = PIECES.find((item) => item.id === pieceId)!;

    setPlaced((old) =>
      old.includes(pieceId) ? old : [...old, pieceId]
    );

    setSelected(null);

    setMessage(
      `¡Muy bien! Colocaste ${piece.name.toLowerCase()}: ${piece.shape.toLowerCase()}.`
    );

    say(`¡Muy bien! ${piece.shape}.`);
  }

  function reset() {
    setPlaced([]);
    setSelected(null);
    setAttempts(0);
    setMessage(
      "¡A construir! Arrastra o toca una pieza y colócala en su silueta."
    );
    celebrated.current = false;
  }

  return (
    <section className="rocket-game">
      <header className="rocket-game__header">
        <div>
          <strong>🚀 Taller espacial</strong>
          <p>Reconoce las figuras y arma tu cohete.</p>
        </div>

        <span className="rocket-game__count">
          {placed.length} / {PIECES.length} piezas
        </span>
      </header>

      <div
        className="rocket-game__progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PIECES.length}
        aria-valuenow={placed.length}
        aria-label="Piezas colocadas"
      >
        <span
          style={{
            width: `${(placed.length / PIECES.length) * 100}%`,
          }}
        />
      </div>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          const source = String(event.operation.source?.id ?? "");
          const target = String(event.operation.target?.id ?? "");

          if (
            source.startsWith("piece:") &&
            target.startsWith("slot:")
          ) {
            tryPlace(
              source.slice(6) as PieceId,
              target.slice(5) as PieceId
            );
          }
        }}
      >
        <div className="rocket-game__layout">
          {/* Escenario del cohete */}
          <div
            className="rocket-board"
            aria-label="Plano para armar el cohete"
          >
            <div className="rocket-board__planet" />

            {PIECES.map((piece) => (
              <RocketSlot
                key={piece.id}
                piece={piece}
                filled={placed.includes(piece.id)}
                selected={selected === piece.id}
                onChoose={(slotId) => {
                  if (selected) {
                    tryPlace(selected, slotId);
                  } else {
                    setMessage(
                      "Primero elige una pieza de la bandeja."
                    );
                  }
                }}
              />
            ))}

            {finished && (
              <div className="rocket-board__success">
                ✨ ¡Listo para despegar! ✨
              </div>
            )}
          </div>

          {/* Bandeja de piezas */}
          <aside className="rocket-tray">
            <h3>🧩 Piezas del cohete</h3>

            <p>
              Arrastra o toca una pieza y después su espacio
              en el dibujo.
            </p>

            <div className="rocket-tray__pieces">
              {PIECES.filter(
                (part) => !placed.includes(part.id)
              ).map((part) => (
                <PieceTile
                  key={part.id}
                  piece={part}
                  chosen={selected === part.id}
                  onChoose={setSelected}
                />
              ))}
            </div>

            <p
              className="rocket-game__feedback"
              role="status"
            >
              {message}
            </p>

            {finished && (
              <p className="rocket-game__win">
                🏆 ¡Misión completada!
              </p>
            )}

            <button
              className="rocket-game__reset"
              type="button"
              onClick={reset}
            >
              🔄 {finished
                ? "Construir otro cohete"
                : "Reiniciar"}
            </button>

            {attempts > 0 && !finished && (
              <small>
                Equivocarse también es aprender.
                ¡Puedes seguir intentando!
              </small>
            )}
          </aside>
        </div>
      </DragDropProvider>
    </section>
  );
}