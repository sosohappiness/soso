import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import type { SceneId } from "../scene/palette";
import { Panel } from "./JournalViews";

/** A tiny flat portrait of each friend: one-mass body, ears, dot eyes, nose. */
export function FriendPortrait({ id, size = 64 }: { id: AnimalId; size?: number }) {
  const a = ANIMALS[id];
  const body = "M-30 40 C-30 14 -26 -4 -22 -16 C-18 -30 -10 -36 0 -36 C10 -36 18 -30 22 -16 C26 -4 30 14 30 40 Z";
  return (
    <svg width={size} height={size} viewBox="-40 -48 80 90" aria-hidden="true">
      {a.ears === "round" && <><circle cx="-17" cy="-31" r="8" fill={a.ear} /><circle cx="17" cy="-31" r="8" fill={a.ear} /></>}
      {a.ears === "pointy" && <><path d="M-24 -22 L-23 -44 L-8 -32 Z" fill={a.ear} /><path d="M24 -22 L23 -44 L8 -32 Z" fill={a.ear} /></>}
      <path d={body} fill={a.body} stroke="#4a3b33" strokeWidth="2" />
      {a.muzzle && <ellipse cx="0" cy="-3" rx="11" ry="8" fill={a.muzzle} />}
      {a.ears === "floppy" && <><path d="M-17 -30 C-29 -28 -31 -8 -27 4 C-24 10 -18 8 -17 0 C-16 -10 -15 -20 -12 -28 Z" fill={a.ear} /><path d="M17 -30 C29 -28 31 -8 27 4 C24 10 18 8 17 0 C16 -10 15 -20 12 -28 Z" fill={a.ear} /></>}
      <circle cx="-8" cy="-12" r="2.6" fill="#151213" />
      <circle cx="8" cy="-12" r="2.6" fill="#151213" />
      <ellipse cx="0" cy="-4" rx="4" ry="3" fill="#151213" />
      <ellipse cx="-11" cy="38" rx="7" ry="4" fill={a.paw} stroke="#4a3b33" strokeWidth="1.5" />
      <ellipse cx="11" cy="38" rx="7" ry="4" fill={a.paw} stroke="#4a3b33" strokeWidth="1.5" />
    </svg>
  );
}

const SCENES: { id: SceneId; label: string; desc: string; sky: string; ground: string; accent: string }[] = [
  { id: "sofa", label: "소파 초원", desc: "몽실한 하늘, 초록 들판, 빨간 소파", sky: "#D3E3EC", ground: "#9DBA6E", accent: "#B3261E" },
  { id: "dusk", label: "노을 언덕", desc: "주황 하늘, 파란 언덕, 남색 달", sky: "#B4552F", ground: "#8EA6CC", accent: "#1E2456" },
];

/** 설정: change the friend (with a gentle check first) and the background. */
export function Settings({ animal, scene, onAnimal, onScene, onClose }: {
  animal: AnimalId; scene: SceneId; onAnimal: (a: AnimalId) => void; onScene: (s: SceneId) => void; onClose: () => void;
}) {
  const [asking, setAsking] = useState<AnimalId | null>(null);
  return (
    <Panel title="설정" onClose={onClose}>
      <h3 className="set-title">친구 바꾸기</h3>
      <div className="friend-cards">
        {(Object.keys(ANIMALS) as AnimalId[]).map((id) => {
          const a = ANIMALS[id];
          const mine = id === animal;
          return (
            <button key={id} className={`friend-card${mine ? " mine" : ""}${asking === id ? " asking" : ""}`} onClick={() => !mine && setAsking(id)} aria-pressed={mine}>
              <FriendPortrait id={id} />
              <span className="fc-name">{a.name}</span>
              <span className="fc-meta">{a.species} · {a.drink}</span>
              {mine && <span className="fc-tag">지금 내 친구</span>}
            </button>
          );
        })}
      </div>
      {asking && (
        <div className="set-confirm" role="alertdialog" aria-label="친구 바꾸기 확인">
          <p><b>{ANIMALS[asking].name}</b>와 함께할까요? 감사일기와 구름꽃, 함께한 날은 그대로 이어져요.</p>
          <p className="journal-hint">{ANIMALS[animal].name}는 가끔 놀러 올 거예요.</p>
          <div className="set-confirm-row">
            <button className="export-action" onClick={() => setAsking(null)}>그대로 둘래</button>
            <button className="export-action primary" onClick={() => { onAnimal(asking); setAsking(null); }}>바꾸기</button>
          </div>
        </div>
      )}

      <h3 className="set-title">배경 바꾸기</h3>
      <div className="scene-cards">
        {SCENES.map((s) => (
          <button key={s.id} className={`scene-card${scene === s.id ? " mine" : ""}`} onClick={() => onScene(s.id)} aria-pressed={scene === s.id}>
            <svg viewBox="0 0 120 80" width="100%" aria-hidden="true">
              <rect width="120" height="80" fill={s.sky} />
              <path d="M0 52 C 40 48 80 54 120 50 L120 80 L0 80 Z" fill={s.ground} />
              {s.id === "sofa"
                ? <><ellipse cx="34" cy="26" rx="22" ry="10" fill="#FFFBF4" /><rect x="64" y="40" width="40" height="18" rx="7" fill={s.accent} /></>
                : <><path d="M78 22 A12 12 0 0 1 102 22 Z" fill={s.accent} /><circle cx="90" cy="24" r="5" fill="#F2C230" /><ellipse cx="34" cy="26" rx="22" ry="10" fill="#FFFBF4" /></>}
            </svg>
            <span className="fc-name">{s.label}</span>
            <span className="fc-meta">{s.desc}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
