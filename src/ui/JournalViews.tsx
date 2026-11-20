import { useMemo, useState } from "react";
import { localDay } from "../lib/time";
import { dayLabel, journalText, linesOf, mailtoHref, shiftDay, type Journal } from "../lib/journal";

const PETALS = ["#F4B6C2", "#F6D46A", "#F29A7E", "#C9B6E8"];

/** The same little five-petal flower that blooms on the cloud. */
export function Flower({ size = 22, color = "#F4B6C2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={Math.cos(a) * 5.2} cy={Math.sin(a) * 5.2} r={5} fill={color} />;
      })}
      <circle r={3.2} fill="#F9E7A8" />
    </svg>
  );
}

function flowerColor(day: string) {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  return PETALS[Math.abs(h) % PETALS.length];
}

/** Full-height paper panel that sits above the tab bar. */
export function Panel({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="panel-wrap">
      <section className="panel" aria-label={title}>
        <header className="panel-head">
          <div>
            <h2>{title}</h2>
            {sub && <p className="panel-sub">{sub}</p>}
          </div>
          <button className="panel-close" onClick={onClose} aria-label="닫기">×</button>
        </header>
        <div className="panel-body">{children}</div>
      </section>
    </div>
  );
}

// ---- 감사일기: write today's three lines (or yesterday's, if it was missed) ----

const PROMPTS = ["오늘 고마웠던 일 하나", "작아도 좋아, 또 하나", "마지막 하나!"];

export function JournalWrite({ journal, now, onSave, onClose }: {
  journal: Journal; now: Date; onSave: (day: string, lines: string[]) => void; onClose: () => void;
}) {
  const today = localDay(now);
  const yesterday = localDay(shiftDay(now, -1));
  const canBackfill = linesOf(journal, yesterday).length === 0;
  const [day, setDay] = useState(today);
  const saved = linesOf(journal, day);
  const [editing, setEditing] = useState(saved.length === 0);
  const [lines, setLines] = useState<string[]>(() => [0, 1, 2].map((i) => journal[day]?.[i] ?? ""));
  const filled = lines.filter((l) => l.trim()).length;

  const switchTo = (d: string) => {
    setDay(d);
    setLines([0, 1, 2].map((i) => journal[d]?.[i] ?? ""));
    setEditing(linesOf(journal, d).length === 0);
  };

  return (
    <Panel title="감사일기" sub={dayLabel(day)} onClose={onClose}>
      {canBackfill && (
        <div className="day-switch" role="tablist">
          <button role="tab" aria-selected={day === today} className={day === today ? "on" : ""} onClick={() => switchTo(today)}>오늘</button>
          <button role="tab" aria-selected={day === yesterday} className={day === yesterday ? "on" : ""} onClick={() => switchTo(yesterday)}>어제 일기 쓰기</button>
        </div>
      )}
      {editing ? (
        <form
          className="journal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!filled) return;
            onSave(day, lines.map((l) => l.trim()));
            setEditing(false);
          }}
        >
          <p className="journal-hint">고마웠던 일 세 가지를 적으면, 한 줄마다 구름에 꽃이 한 송이씩 피어나요.</p>
          {lines.map((l, i) => (
            <label key={i} className="journal-line">
              <span className="jl-flower"><Flower size={24} color={l.trim() ? PETALS[i] : "#E3DCD0"} /></span>
              <input
                id={`gratitude-${i}`}
                value={l}
                maxLength={60}
                placeholder={PROMPTS[i]}
                onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? e.target.value : x)))}
                autoComplete="off"
              />
            </label>
          ))}
          <button type="submit" className="journal-save" disabled={!filled}>
            {saved.length ? "고쳐서 다시 피우기" : filled ? `구름에 꽃 ${filled}송이 피우기` : "구름에 꽃 피우기"}
          </button>
        </form>
      ) : (
        <div className="journal-done">
          <ul className="entry-lines">
            {saved.map((l, i) => (
              <li key={i}><Flower size={20} color={PETALS[i]} /><span>{l}</span></li>
            ))}
          </ul>
          <p className="journal-hint">구름에 꽃 {saved.length}송이가 피었어요. 내일 또 만나요!</p>
          <button className="journal-edit" onClick={() => setEditing(true)}>고치기</button>
        </div>
      )}
    </Panel>
  );
}

// ---- 기록: a calendar with a flower on every day written, and the past entries ----

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function JournalHistory({ journal, now, onClose }: { journal: Journal; now: Date; onClose: () => void }) {
  const days = useMemo(() => Object.keys(journal).filter((d) => linesOf(journal, d).length > 0).sort().reverse(), [journal]);
  const [month, setMonth] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const [picked, setPicked] = useState<string | null>(days[0] ?? null);
  const [exporting, setExporting] = useState(false);
  const today = localDay(now);

  const first = new Date(month.y, month.m, 1);
  const count = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: count }, (_, i) => localDay(new Date(month.y, month.m, i + 1))),
  ];
  const go = (by: number) => setMonth(({ y, m }) => {
    const d = new Date(y, m + by, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const inMonth = cells.filter((c) => c && linesOf(journal, c).length > 0).length;

  return (
    <Panel title="기록" sub={`지금까지 ${days.length}일 동안 꽃을 피웠어요`} onClose={onClose}>
      <div className="cal">
        <div className="cal-head">
          <button onClick={() => go(-1)} aria-label="지난달">‹</button>
          <span>{month.y}년 {month.m + 1}월 <small>· 꽃 {inMonth}송이</small></span>
          <button onClick={() => go(1)} aria-label="다음 달">›</button>
        </div>
        <div className="cal-grid">
          {WEEK.map((w) => <span key={w} className="cal-w">{w}</span>)}
          {cells.map((c, i) => {
            if (!c) return <span key={`e${i}`} />;
            const n = linesOf(journal, c).length;
            const d = Number(c.slice(8));
            return (
              <button
                key={c}
                className={`cal-day${c === today ? " today" : ""}${c === picked ? " picked" : ""}${n ? " has" : ""}`}
                onClick={() => n && setPicked(c)}
                aria-label={`${d}일${n ? `, 감사 ${n}개` : ""}`}
                disabled={!n}
              >
                {n ? <Flower size={14 + n * 5} color={flowerColor(c)} /> : null}
                <span className="cal-n">{d}</span>
              </button>
            );
          })}
        </div>
      </div>

      {picked && linesOf(journal, picked).length > 0 && (
        <article className="entry-card picked-card">
          <h3>{dayLabel(picked)}</h3>
          <ul className="entry-lines">
            {linesOf(journal, picked).map((l, i) => <li key={i}><Flower size={18} color={PETALS[i]} /><span>{l}</span></li>)}
          </ul>
        </article>
      )}

      <div className="list-row">
        <h3 className="list-title">지난 일기</h3>
        {days.length > 0 && <button className="export-btn" onClick={() => setExporting((x) => !x)} aria-expanded={exporting}>이메일로 보내기</button>}
      </div>
      {exporting && <ExportCard journal={journal} now={now} />}
      {days.length === 0 ? (
        <p className="journal-hint">아직 쓴 일기가 없어요. 감사일기 탭에서 첫 꽃을 피워 봐요.</p>
      ) : (
        <div className="entry-list">
          {days.map((d) => (
            <button key={d} className={`entry-card${d === picked ? " on" : ""}`} onClick={() => setPicked(d)}>
              <h3><Flower size={16} color={flowerColor(d)} /> {dayLabel(d)}</h3>
              <ul className="entry-lines small">
                {linesOf(journal, d).map((l, i) => <li key={i}><span>· {l}</span></li>)}
              </ul>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---- 내보내기: send everything written so far by email, copy it, or save it as a file ----

function ExportCard({ journal, now }: { journal: Journal; now: Date }) {
  const text = useMemo(() => journalText(journal, now), [journal, now]);
  const mail = useMemo(() => mailtoHref(text), [text]);
  const [note, setNote] = useState("");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setNote("복사했어요. 메일이나 메모에 붙여넣어 보세요.");
    } catch {
      setNote("이 화면에서는 복사가 막혀 있어요. 아래 글을 길게 눌러 직접 복사해 주세요.");
    }
  };
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `소소-감사일기-${now.toISOString().slice(0, 10)}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote("파일로 저장했어요. 메일에 첨부해서 보낼 수 있어요.");
    } catch {
      setNote("이 화면에서는 저장이 막혀 있어요. '복사하기'를 써 주세요.");
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title: "소소 감사일기", text });
    } catch {
      /* closed the share sheet */
    }
  };

  return (
    <div className="export-card">
      <p className="journal-hint">지금까지 쓴 감사일기 {text.split("\n").filter((l) => l.startsWith("·")).length}줄을 날짜순으로 정리했어요.</p>
      <div className="export-actions">
        <a className="export-action primary" href={mail.href}>메일로 보내기</a>
        {canShare && <button className="export-action" onClick={share}>공유하기</button>}
        <button className="export-action" onClick={copy}>복사하기</button>
        <button className="export-action" onClick={download}>파일로 저장</button>
      </div>
      {mail.trimmed && <p className="journal-hint">일기가 많아서 메일에는 최근 일기만 담겨요. 전체는 '파일로 저장'을 써 주세요.</p>}
      {note && <p className="export-note" role="status">{note}</p>}
      <pre className="export-preview">{text}</pre>
    </div>
  );
}
