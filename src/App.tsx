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
import { JournalHistory, JournalWrite } from "./ui/JournalViews";
import { growthFromJournal, loadJournal, sampleJournal, saveJournal, type Journal } from "./lib/journal";
import { DevBar } from "./ui/DevBar";
import type { SceneId } from "./scene/palette";
import { GIFTS, enjoyLine, type GiftId } from "./lib/gifts";
import { CHATS, callName, isVisitDay, visitorFor } from "./lib/visits";
import { Settings } from "./ui/Settings";
import { Onboarding } from "./ui/Onboarding";
import { loadAccount, signOut, type Account } from "./lib/auth";


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
  // the gratitude journal drives the cloud's flowers (?days=N still fakes it for testing)
  const [journal, setJournal] = useState<Journal>(() => {
    const j = loadJournal();
    if (import.meta.env.VITE_PREVIEW && Object.keys(j).length === 0) {
      const sample = sampleJournal(new Date());
      saveJournal(sample);
      return sample;
    }
    return j;
  });
  const growth = useMemo(() => demoGrowth(search) ?? growthFromJournal(journal), [search, journal]);
  // one background for now: the meadow with the red sofa
  const scene: SceneId = "sofa";
  // sign-up: email + 6-digit code on first launch
  const [account, setAccount] = useState<Account | null>(() => loadAccount());
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
    const T = gift.t;
    later(0.3, () => setLine(phase === "night" ? "음냐..? 누구야..?" : gift.hello));
    later(T.give, () => setLine(enjoyLine(id)));
    later(T.drink + 0.2, () => setLine(gift.thanks));
    later(T.drink + 0.4, () => setCard({ caption: gift.caption, day: today }));
    later(T.leave + 0.3, () => setGiftShow(null));
    later(T.drink + 3.8, () => setCard(null));
  }, [today, phase]);

  const onSaveJournal = useCallback((day: string, lines: string[]) => {
    setJournal((j) => {
      const next = { ...j, [day]: lines.filter((l) => l.length > 0) };
      saveJournal(next);
      return next;
    });
    window.setTimeout(() => {
      setTab("home");
      setPokeAt(performance.now());
      setLine("고마워! 구름에 꽃이 소복이 피었어");
    }, 900);
  }, []);

  // ---- a friend visiting for the day ----
  type Visitor = { animal: AnimalId; travel: { at: number; dir: "in" | "out"; offX: number } };
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [line2, setLine2] = useState("");
  const [visitorPokeAt, setVisitorPokeAt] = useState(0);
  const chatTimers = useRef<number[]>([]);
  const chatLater = (s: number, fn: () => void) => chatTimers.current.push(window.setTimeout(fn, s * 1000));
  useEffect(() => () => chatTimers.current.forEach(clearTimeout), []);

  const startVisit = useCallback((guest: AnimalId, delay = 0) => {
    chatTimers.current.forEach(clearTimeout);
    chatTimers.current = [];
    setLine2("");
    setVisitor({ animal: guest, travel: { at: performance.now() + delay * 1000, dir: "in", offX: 3.4 } });
    const sleepy = phase === "night";
    chatLater(delay + 1.9, () => setLine2(sleepy ? "쉿, 나도 같이 잘래.." : "놀러 왔어!"));
    chatLater(delay + 3.4, () => setLine(sleepy ? "음냐.. 어서 와.." : `와, ${callName(ANIMALS[guest].name)}! 반가워!`));
    if (!sleepy) {
      // now and then they chat: the visitor says something, Minimi answers
      CHATS.forEach(([v, m], i) => {
        chatLater(delay + 12 + i * 14, () => setLine2(v));
        chatLater(delay + 14.2 + i * 14, () => setLine(m));
      });
    }
  }, [phase]);

  const endVisit = useCallback(() => {
    chatTimers.current.forEach(clearTimeout);
    chatTimers.current = [];
    setLine2("또 놀러 올게!");
    window.setTimeout(() => setVisitor((v) => (v ? { ...v, travel: { at: performance.now(), dir: "out", offX: 3.4 } } : v)), 900);
    window.setTimeout(() => { setVisitor(null); setLine2(""); }, 2800);
  }, []);

  // on a visit day, the friend shows up a moment after you open the app
  const visitChecked = useRef(false);
  useEffect(() => {
    if (visitChecked.current) return;
    visitChecked.current = true;
    if (isVisitDay(now, growth.days)) startVisit(visitorFor(animal, now), 1.5);
  }, [now, growth.days, animal, startVisit]);

  const onPokeVisitor = useCallback(() => {
    setVisitorPokeAt(performance.now());
    setLine2((l) => pokeLine(phase, new Date(), l));
  }, [phase]);

  // ---- settings ----
  const [settingsOpen, setSettingsOpen] = useState(false);
  const changeFriend = useCallback((a: AnimalId) => {
    setAnimal(a);
    if (visitor?.animal === a) {
      setVisitor(null);
      setLine2("");
    }
    setSettingsOpen(false);
    setPokeAt(performance.now());
    setLine("안녕! 오늘부터 잘 부탁해");
  }, [visitor]);

  const onSignedUp = useCallback((_email: string, friend: AnimalId) => {
    setAnimal(friend);
    setAccount(loadAccount());
    setPokeAt(performance.now());
    setLine("안녕! 만나서 반가워, 오늘부터 잘 부탁해");
  }, []);
  const onSignOut = useCallback(async () => {
    await signOut();
    setSettingsOpen(false);
    setAccount(null);
  }, []);

  const resetToday = useCallback(() => {
    setGifts((g) => {
      const next = g.filter((x) => x.day !== today);
      save("gifts", next);
      return next;
    });
  }, [today]);

  // the camera stays put (the scene is a fixed painting)
  const view = useRef({ yaw: 0, pitch: 0 });

  const bubble = useRef<HTMLDivElement>(null);
  const bubble2 = useRef<HTMLDivElement>(null);

  return (
    <div className={`app phase-${phase} scene-${scene}`}>
      <div className="stage">
        <Scene phase={phase} animal={animal} growth={growth} view={view} bubble={bubble} pokeAt={pokeAt} onPoke={onPoke} scene={scene} gift={giftShow}
          visitor={visitor} bubble2={bubble2} visitorPokeAt={visitorPokeAt} onPokeVisitor={onPokeVisitor} />
        <div className="bubble-anchor" ref={bubble} aria-live="polite">
          <div className="bubble" key={line}>{line}</div>
        </div>
        <div className="bubble-anchor" ref={bubble2} aria-live="polite" hidden={!visitor || !line2}>
          {line2 && <div className="bubble guest" key={line2}>{line2}</div>}
        </div>
      </div>
      <div className="grain" aria-hidden="true" />
      <Hud time={clockText(now)} label={PHASE_LABEL[phase]} flowers={growth.flowers} days={growth.days} onSettings={() => setSettingsOpen(true)} />
      <div className="bottom">
        {tab === "home" && !settingsOpen && <GiftPicker given={todaysGift} onGive={onGift} busy={giftShow !== null} />}
        <Tabs tab={tab} onTab={setTab} />
      </div>
      {card && (
        <button className="gift-card" onClick={() => setCard(null)}>
          <span className="gift-box" aria-hidden="true" />
          <span className="gc-text">
            <span className="gc-small">오늘의 선물 · {card.day.slice(5).replace("-", "월 ")}일</span>
            <span className="gc-title">{card.caption}</span>
          </span>
        </button>
      )}
      {tab === "journal" && <JournalWrite journal={journal} now={now} onSave={onSaveJournal} onClose={() => setTab("home")} />}
      {tab === "history" && <JournalHistory journal={journal} now={now} onClose={() => setTab("home")} />}
      {settingsOpen && <Settings animal={animal} email={account?.email ?? null} onAnimal={changeFriend} onSignOut={() => void onSignOut()} onClose={() => setSettingsOpen(false)} />}
      {!account && <Onboarding onDone={onSignedUp} />}
      {(params.has("dev") || import.meta.env.VITE_PREVIEW) && (
        <DevBar phase={phase} onPhase={setPhaseOverride} onResetGift={resetToday} visiting={!!visitor} onVisit={() => (visitor ? endVisit() : startVisit(visitorFor(animal, now)))} onRestart={() => void onSignOut()} />
      )}
    </div>
  );
}
