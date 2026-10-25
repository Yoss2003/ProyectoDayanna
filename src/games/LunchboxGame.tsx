
import { useRef, useState } from "react";
import {
  DragDropProvider,
  useDraggable,
  useDroppable
} from "@dnd-kit/react";
import { say } from "../lib/voice";
import "./LunchboxGame.css";

type ZoneId = "principal" | "colorido" | "bebida";

type FoodGroup =
  | "fruta"
  | "verdura"
  | "principal"
  | "acompanamiento"
  | "bebida"
  | "ocasional";

type Food = {
  id: string;
  name: string;
  group: FoodGroup;
};

type Layout = Record<ZoneId, string[]>;

const FOODS: Food[] = [
  { id: "manzana", name: "Manzana", group: "fruta" },
  { id: "platano", name: "Plátano", group: "fruta" },
  { id: "uvas", name: "Uvas", group: "fruta" },
  { id: "zanahoria", name: "Zanahoria", group: "verdura" },
  { id: "brocoli", name: "Brócoli", group: "verdura" },
  { id: "sandwich", name: "Sándwich", group: "principal" },
  { id: "agua", name: "Agua", group: "bebida" },
  { id: "yogur", name: "Yogur", group: "acompanamiento" },
  { id: "queso", name: "Queso", group: "acompanamiento" },
  { id: "galleta", name: "Galleta", group: "ocasional" },
  { id: "caramelo", name: "Caramelo", group: "ocasional" },
  { id: "gaseosa", name: "Gaseosa", group: "ocasional" }
];

const ZONES: {
  id: ZoneId;
  label: string;
  max: number;
  clue: string;
}[] = [
  {
    id: "principal",
    label: "Alimento principal",
    max: 1,
    clue: "Coloca algo que aporte energía"
  },
  {
    id: "colorido",
    label: "Frutas y verduras",
    max: 2,
    clue: "Elige dos alimentos coloridos"
  },
  {
    id: "bebida",
    label: "Bebida",
    max: 1,
    clue: "¿Qué bebida nos hidrata?"
  }
];

const emptyLayout = (): Layout => ({
  principal: [],
  colorido: [],
  bebida: []
});

const imageFor = (id: string) =>
  `/lonchera/alimentos/${id}.png`;

const objectFor = (id: string) =>
  `/lonchera/objetos/${id}.png`;

const foodFor = (id: string) =>
  FOODS.find((food) => food.id === id)!;

// Tarjeta de alimento arrastrable
function FoodTile({
  food,
  chosen,
  onSelect
}: {
  food: Food;
  chosen: boolean;
  onSelect: (id: string) => void;
}) {
  const { ref, isDragging } = useDraggable({
    id: `food:${food.id}`
  });

  return (
    <button
      ref={ref}
      type="button"
      className={`lbx-food ${
        chosen ? "lbx-food--chosen" : ""
      } ${isDragging ? "lbx-food--dragging" : ""}`}
      aria-pressed={chosen}
      onClick={() => onSelect(food.id)}
      title={`Seleccionar ${food.name}`}
    >
      <img
        src={imageFor(food.id)}
        alt=""
        draggable={false}
      />
      <span>{food.name}</span>
    </button>
  );
}

// Compartimentos de la lonchera
function LunchZone({
  zone,
  placed,
  selectedFood,
  finished,
  onDropFood,
  onRemove
}: {
  zone: (typeof ZONES)[number];
  placed: string[];
  selectedFood: string | null;
  finished: boolean;
  onDropFood: (id: string, zone: ZoneId) => void;
  onRemove: (zone: ZoneId, id: string) => void;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `zone:${zone.id}`,
    disabled: finished
  });

  const activate = () => {
    if (selectedFood && !finished) {
      onDropFood(selectedFood, zone.id);
    }
  };

  return (
    <div
      ref={ref}
      className={`lbx-zone lbx-zone--${zone.id} ${
        isDropTarget ? "lbx-zone--over" : ""
      } ${selectedFood ? "lbx-zone--ready" : ""}`}
      role="button"
      tabIndex={finished ? -1 : 0}
      aria-label={`${zone.label}: ${placed.length} de ${zone.max} alimentos`}
      onClick={activate}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          activate();
        }
      }}
    >
      <span className="lbx-zone__title">
        {zone.label}
      </span>

      <div className="lbx-zone__contents">
        {placed.map((id) => (
          <button
            type="button"
            key={id}
            disabled={finished}
            className="lbx-zone__item"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(zone.id, id);
            }}
            aria-label={`Retirar ${foodFor(id).name}`}
            title={`Quitar ${foodFor(id).name}`}
          >
            <img
                src={objectFor(id)}
                alt={foodFor(id).name}
                draggable={false}
            />

            {!finished && (
              <span aria-hidden="true">×</span>
            )}
          </button>
        ))}
      </div>

      {placed.length === 0 && (
        <small>{zone.clue}</small>
      )}
    </div>
  );
}

// Juego principal
export default function LunchboxGame({
  onComplete
}: {
  onComplete: () => void;
}) {
  const [layout, setLayout] = useState<Layout>(emptyLayout);
  const [selected, setSelected] = useState<string | null>(null);

  const [feedback, setFeedback] = useState(
    "Elige un alimento y arrástralo a la lonchera, o toca su compartimento."
  );

  const [feedbackType, setFeedbackType] = useState<
    "normal" | "hint" | "success"
  >("normal");

  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);

  const placedIds = [
    ...layout.principal,
    ...layout.colorido,
    ...layout.bebida
  ];

  const available = FOODS.filter(
    (food) => !placedIds.includes(food.id)
  );

  const total = placedIds.length;

  // Colocar alimento
  function placeFood(id: string, zoneId: ZoneId) {
    if (finished || placedIds.includes(id)) return;

    const zone = ZONES.find(
      (item) => item.id === zoneId
    )!;

    if (layout[zoneId].length >= zone.max) {
      setFeedback(
        `El compartimento «${zone.label}» está lleno. Retira un alimento para cambiarlo.`
      );
      setFeedbackType("hint");
      return;
    }

    setLayout((old) => ({
      ...old,
      [zoneId]: [...old[zoneId], id]
    }));

    setSelected(null);

    setFeedback(
      `Colocaste ${foodFor(id).name.toLowerCase()} en la lonchera. ¡Puedes seguir eligiendo!`
    );

    setFeedbackType("normal");
  }

  // Retirar alimento
  function removeFood(zoneId: ZoneId, id: string) {
    if (finished) return;

    setLayout((old) => ({
      ...old,
      [zoneId]: old[zoneId].filter(
        (item) => item !== id
      )
    }));

    setFeedback(
      `Retiraste ${foodFor(id).name.toLowerCase()}. Ahora puedes escoger otro alimento.`
    );

    setFeedbackType("normal");
  }

  // Evaluar la lonchera
  function evaluate() {
    if (finished) return;

    const principal = layout.principal[0];
    const coloridos = layout.colorido.map(foodFor);
    const bebida = layout.bebida[0];

    let advice = "";

    if (principal !== "sandwich") {
      advice =
        "En el compartimento principal prueba colocar un sándwich para tener energía.";
    } else if (layout.colorido.length < 2) {
      advice =
        "Agrega dos alimentos en el compartimento de frutas y verduras.";
    } else if (
      !coloridos.every(
        (food) =>
          food.group === "fruta" ||
          food.group === "verdura"
      )
    ) {
      advice =
        "En el compartimento morado elige frutas o verduras. Las golosinas pueden reservarse para ocasiones especiales.";
    } else if (
      !coloridos.some(
        (food) => food.group === "fruta"
      )
    ) {
      advice =
        "¡Casi listo! Incluye al menos una fruta en el compartimento morado.";
    } else if (bebida !== "agua") {
      advice =
        "Para esta lonchera, elige agua como bebida para hidratarte.";
    }

    if (advice) {
      setFeedback(
        `💡 ${advice} Puedes retirar y cambiar alimentos. ¡Sigue intentando!`
      );
      setFeedbackType("hint");
      return;
    }

    setFinished(true);
    setSelected(null);

    setFeedback(
      "¡Excelente! Elegiste un sándwich, frutas o verduras y agua. Preparaste una lonchera variada."
    );

    setFeedbackType("success");

    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }

  // Reiniciar
  function reset() {
    setLayout(emptyLayout());
    setSelected(null);
    setFinished(false);
    completedRef.current = false;
    setFeedback(
      "¡Nueva aventura! Escoge los alimentos para tu lonchera."
    );
    setFeedbackType("normal");
  }

  return (
    <section className="lbx-game">
      <header className="lbx-header">
        <div>
          <strong>
            🍎 Nutricionistas espaciales
          </strong>
          <p>
            ¡Ayuda a preparar una lonchera saludable y variada!
          </p>
        </div>

        <span className="lbx-count">
          {total} / 4 alimentos
        </span>
      </header>

      <div
        className="lbx-progress"
        role="progressbar"
        aria-label="Alimentos colocados"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={total}
      >
        <span
          style={{
            width: `${(total / 4) * 100}%`
          }}
        />
      </div>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled || finished) return;

          const source = String(
            event.operation.source?.id ?? ""
          );

          const target = String(
            event.operation.target?.id ?? ""
          );

          if (
            source.startsWith("food:") &&
            target.startsWith("zone:")
          ) {
            placeFood(
              source.slice(5),
              target.slice(5) as ZoneId
            );
          }
        }}
      >
        <div className="lbx-layout">
          {/* Lonchera */}
          <div className="lbx-scene">
            <div className="lbx-board">
              <img
                src="/lonchera/lonchera-vacia.png"
                alt="Lonchera azul abierta, con tres compartimentos vacíos"
                className="lbx-board__background"
                draggable={false}
              />

              {ZONES.map((zone) => (
                <LunchZone
                  key={zone.id}
                  zone={zone}
                  placed={layout[zone.id]}
                  selectedFood={selected}
                  finished={finished}
                  onDropFood={placeFood}
                  onRemove={removeFood}
                />
              ))}
            </div>

            <p className="lbx-scene__help">
              Toca cualquier alimento colocado para retirarlo de la lonchera.
            </p>
          </div>

          {/* Bandeja de alimentos */}
          <aside className="lbx-tray">
            <h3>🧩 Alimentos disponibles</h3>

            <p>
              Arrastra los alimentos o selecciónalos
              y toca un compartimento.
            </p>

            <div className="lbx-tray__grid">
              {available.map((food) => (
                <FoodTile
                  key={food.id}
                  food={food}
                  chosen={selected === food.id}
                  onSelect={(id) => {
                    setSelected((old) =>
                      old === id ? null : id
                    );

                    setFeedback(
                      `Elegiste ${food.name.toLowerCase()}. Ahora toca un compartimento de la lonchera.`
                    );

                    setFeedbackType("normal");
                  }}
                />
              ))}
            </div>

            {available.length === 0 && (
              <p>
                Todos los alimentos están en la lonchera.
              </p>
            )}
          </aside>
        </div>
      </DragDropProvider>

      {/* Retroalimentación */}
      <div
        className={`lbx-feedback lbx-feedback--${feedbackType}`}
        role="status"
        aria-live="polite"
      >
        {finished && (
          <strong>
            🏆 ¡Misión completada!
          </strong>
        )}

        <p>{feedback}</p>

        {feedbackType === "hint" && (
          <button
            type="button"
            onClick={() => say(feedback)}
          >
            🔊 Escuchar consejo
          </button>
        )}
      </div>

      <div className="lbx-actions">
        {!finished && (
          <button
            type="button"
            className="lbx-verify"
            onClick={evaluate}
          >
            ✅ Revisar mi lonchera
          </button>
        )}

        <button
          type="button"
          className="lbx-reset"
          onClick={reset}
        >
          🔄 {finished
            ? "Preparar otra lonchera"
            : "Vaciar lonchera"}
        </button>
      </div>

      <p className="lbx-note">
        No hay alimentos «prohibidos»: en esta misión
        practicamos cómo preparar una lonchera variada
        para un día de clases.
      </p>
    </section>
  );
}