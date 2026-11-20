import type { Phase } from "../lib/time";

const PHASES: Phase[] = ["morning", "day", "evening", "night"];
const NAMES: Record<Phase, string> = { morning: "아침", day: "낮", evening: "저녁", night: "밤" };

/** Shown with ?dev and in preview builds: flip time of day, replay today's gift, call a friend over. */
export function DevBar({ phase, onPhase, onResetGift, visiting, onVisit, onRestart, hello, onHello, logoFont, onLogoFont }: {
  phase: Phase; onPhase: (p: Phase) => void; onResetGift: () => void; visiting: boolean; onVisit: () => void; onRestart: () => void;
  hello: "desk" | "lie" | "sketch"; onHello: () => void; logoFont: string; onLogoFont: () => void;
}) {
  return (
    <div className="devbar">
      {PHASES.map((p) => (
        <button key={p} className={p === phase ? "on" : ""} onClick={() => onPhase(p)}>{NAMES[p]}</button>
      ))}
      <span className="sep" />
      <button onClick={onResetGift}>오늘 선물 다시 주기</button>
      <span className="sep" />
      <button className={visiting ? "on" : ""} onClick={onVisit}>{visiting ? "친구 돌려보내기" : "친구 놀러오기"}</button>
      <span className="sep" />
      <button onClick={onRestart}>가입 처음부터</button>
      <button onClick={onLogoFont}>로고 폰트: {logoFont}</button>
      <button onClick={onHello}>첫 화면: {hello === "desk" ? "책상 → 누운 사람" : hello === "lie" ? "누운 사람 → 스케치북" : "스케치북 → 책상"}</button>
    </div>
  );
}
