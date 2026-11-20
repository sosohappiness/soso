import type { Phase } from "../lib/time";
import { ANIMALS, type AnimalId } from "../scene/animals";
import type { SceneId } from "../scene/palette";
import { FONTS, type FontId } from "../lib/fonts";

const PHASES: Phase[] = ["morning", "day", "evening", "night"];
const NAMES: Record<Phase, string> = { morning: "아침", day: "낮", evening: "저녁", night: "밤" };

/** Shown with ?dev — flip time of day and animal without waiting for the clock. */
export function DevBar({ phase, animal, scene, font, onPhase, onAnimal, onScene, onFont, onResetGift }: { phase: Phase; animal: AnimalId; scene: SceneId; font: FontId; onPhase: (p: Phase) => void; onAnimal: (a: AnimalId) => void; onScene: (s: SceneId) => void; onFont: (f: FontId) => void; onResetGift: () => void }) {
  return (
    <div className="devbar">
      {PHASES.map((p) => (
        <button key={p} className={p === phase ? "on" : ""} onClick={() => onPhase(p)}>{NAMES[p]}</button>
      ))}
      <span className="sep" />
      {(Object.keys(ANIMALS) as AnimalId[]).map((a) => (
        <button key={a} className={a === animal ? "on" : ""} onClick={() => onAnimal(a)}>{ANIMALS[a].name}</button>
      ))}
      <span className="sep" />
      <button className={scene === "sofa" ? "on" : ""} onClick={() => onScene("sofa")}>소파 초원</button>
      <button className={scene === "dusk" ? "on" : ""} onClick={() => onScene("dusk")}>노을</button>
      <span className="sep" />
      {(Object.keys(FONTS) as FontId[]).map((f) => (
        <button key={f} className={f === font ? "on" : ""} onClick={() => onFont(f)}>{FONTS[f].label}</button>
      ))}
      <span className="sep" />
      <button onClick={onResetGift}>오늘 선물 다시 주기</button>
    </div>
  );
}
