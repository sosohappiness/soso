import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scene } from "./scene/Scene";
import { ANIMALS, animalFromSearch, type AnimalId } from "./scene/animals";
import { PHASE_LABEL, clockText, localDay, phaseAt, timeOverride, type Phase } from "./lib/time";
import { LINES, MISSED_YOU, pick, pokeLine } from "./lib/lines";
import { demoGrowth } from "./lib/demo";
import { load, save } from "./lib/storage";
import { Hud } from "./ui/Hud";
import { GiftPicker, type GiftEntry } from "./ui/GiftPicker";
import { Tabs, type Tab } from "./ui/Tabs";
import { Sheet } from "./ui/Sheet";
import { DevBar } from "./ui/DevBar";
import type { SceneId } from "./scene/palette";
import { GIFT_T, GIFTS, enjoyLine, type GiftId } from "./lib/gifts";

const VIEWS = [0, 0.42, -0.42]; // rotate-view button cycles through these yaw angles (≈ ±24°)
const MAX_YAW = 0.52;
const MAX_PITCH = 0.1;

function useNow(frozen: Date | null) {
  const [now, setNow] = useState(() => frozen ?? new Date());
  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, [frozen]);
  return frozen ?? now;
}

export default function App() {
  const search = window.location.search;
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const frozen = useMemo(() => timeOverride(search), [search]);
  const now = useNow(frozen);
  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(() => {
    const p = params.get("phase");
    return p && p in PHASE_LABEL ? (p as Phase) : null;
  });
  const phase = phaseOverride ?? phaseAt(now);
  const [animal, setAnimal] = useState<AnimalId>(() => animalFromSearch(search) ?? load<AnimalId>("animal", "polar"));
  const growth = useMemo(() => demoGrowth(search), [search]);
  const [scene, setScene] = useState<SceneId>(() => (params.get("scene") === "dusk" ? "dusk" : load<SceneId>("scene", "sofa")));
  useEffect(() => save("scene", scene), [scene]);
  const [tab, setTab] = useState<Tab>("home");
  const [gifts, setGifts] = useState<GiftEntry[]>(() => load<GiftEntry[]>("gifts", []));
  const today = localDay(now);
  const todaysGift = gifts.find((g) => g.day === today) ?? null;

  // Greeting: "I missed you" after 2+ days away, otherwise a line for the time of day.
  const [line, setLine] = useState(() => {
    const last = load<number>("lastVisit", 0);
    return last && Date.now() - last > 2 * 86_400_000 ? MISSED_YOU : pick(LINES[phase]);
  });
  const firstPhase = useRef(true);
  useEffect(() => {
    if (firstPhase.current) {
      firstPhase.current = false;
      return;
    }
    setLine(pick(LINES[phase]));
  }, [phase]);
  useEffect(() => save("lastVisit", Date.now()), []);
  useEffect(() => save("animal", animal), [animal]);

  const [pokeAt, setPokeAt] = useState(0);
  const onPoke = useCallback(() => {
    setPokeAt(performance.now());
    setLine((l) => pokeLine(phase, new Date(), l));
  }, [phase]);

  // The gift scene: the helper brings it, Minimi enjoys it, then a card files it away.
  const [giftShow, setGiftShow] = useState<{ at: number; item: GiftId } | null>(null);
  const [card, setCard] = useState<{ caption: string; day: string } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (s: number, fn: () => void) => timers.current.push(window.setTimeout(fn, s * 1000));

  const onGift = useCallback((id: GiftId) => {
    const gift = GIFTS[id];
    const entry: GiftEntry = { day: today, text: gift.label, at: Date.now(), label: gift.label, caption: gift.caption, item: id };
    setGifts((g) => {
      const next = [entry, ...g.filter((x) => x.day !== today)];
      save("gifts", next);
      return next;
    });
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setCard(null);
    setGiftShow({ at: performance.now(), item: id });
    later(0.3, () => setLine(phase === "night" ? "음냐..? 누구야..?" : "어? 그거 나 주는 거야?"));
    later(GIFT_T.give, () => setLine(enjoyLine(id)));
    later(GIFT_T.drink + 0.2, () => setLine(gift.thanks));
    later(GIFT_T.drink + 0.4, () => setCard({ caption: gift.caption, day: today }));
    later(GIFT_T.leave + 0.3, () => setGiftShow(null));
    later(GIFT_T.drink + 3.8, () => setCard(null));
  }, [today, phase]);

  const resetToday = useCallback(() => {
    setGifts((g) => {
      const next = g.filter((x) => x.day !== today);
      save("gifts", next);
      return next;
    });
  }, [today]);

  // Rotate view: button cycles preset angles; dragging the scene turns it freely within limits.
  const view = useRef({ yaw: 0, pitch: 0 });
  const viewIdx = useRef(0);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const rotate = () => {
    viewIdx.current = (viewIdx.current + 1) % VIEWS.length;
    view.current = { yaw: VIEWS[viewIdx.current], pitch: viewIdx.current ? 0.04 : 0 };
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, ...view.current };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    view.current = {
      yaw: clamp(d.yaw - (e.clientX - d.x) * 0.004, MAX_YAW),
      pitch: clamp(d.pitch + (e.clientY - d.y) * 0.002, MAX_PITCH),
    };
  };
  const onUp = () => (drag.current = null);

  const bubble = useRef<HTMLDivElement>(null);

  return (
    <div className={`app phase-${phase} scene-${scene}`}>
      <div className="stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
        <Scene phase={phase} animal={animal} growth={growth} view={view} bubble={bubble} pokeAt={pokeAt} onPoke={onPoke} scene={scene} gift={giftShow} />
        <div className="bubble-anchor" ref={bubble} aria-live="polite">
          <div className="bubble" key={line}>{line}</div>
        </div>
      </div>
      <div className="grain" aria-hidden="true" />
      <Hud time={clockText(now)} label={PHASE_LABEL[phase]} flowers={growth.flowers} days={growth.days} onRotate={rotate} />
      <div className="bottom">
        <GiftPicker given={todaysGift} onGive={onGift} busy={giftShow !== null} />
        <Tabs tab={tab} onTab={setTab} />
      </div>
      {card && (
        <button className="gift-card" onClick={() => { setCard(null); setTab("gifts"); }}>
          <span className="gift-box" aria-hidden="true" />
          <span className="gc-text">
            <span className="gc-small">오늘의 선물 · {card.day.slice(5).replace("-", "월 ")}일</span>
            <span className="gc-title">{card.caption}</span>
            <span className="gc-link">선물기록에 담았어요 ›</span>
          </span>
        </button>
      )}
      {tab !== "home" && <Sheet tab={tab} gifts={gifts} animalName={ANIMALS[animal].name} onClose={() => setTab("home")} />}
      {(params.has("dev") || import.meta.env.VITE_PREVIEW) && (
        <DevBar phase={phase} animal={animal} scene={scene} onPhase={setPhaseOverride} onAnimal={setAnimal} onScene={setScene} onResetGift={resetToday} />
      )}
    </div>
  );
}
