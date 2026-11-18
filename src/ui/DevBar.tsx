import type { Phase } from "../lib/time";
import { ANIMALS, type AnimalId } from "../scene/animals";

const PHASES: Phase[] = ["morning", "day", "evening", "night"];
const NAMES: Record<Phase, string> = { morning: "아침", day: "낮", evening: "저녁", night: "밤" };

/** Shown with ?dev — flip time of day and animal without waiting for the clock. */
export function DevBar({ phase, animal, onPhase, onAnimal }: { phase: Phase; animal: AnimalId; onPhase: (p: Phase) => void; onAnimal: (a: AnimalId) => void }) {
  return (
    <div className="devbar">
      {PHASES.map((p) => (
        <button key={p} className={p === phase ? "on" : ""} onClick={() => onPhase(p)}>{NAMES[p]}</button>
      ))}
      <span className="sep" />
      {(Object.keys(ANIMALS) as AnimalId[]).map((a) => (
        <button key={a} className={a === animal ? "on" : ""} onClick={() => onAnimal(a)}>{ANIMALS[a].name}</button>
      ))}
    </div>
  );
}
