type Props = { time: string; label: string; leaves: number; flowers: number; onRotate: () => void };

export function Hud({ time, label, leaves, flowers, onRotate }: Props) {
  return (
    <header className="hud">
      <div className="clock">
        <div className="time">{time}</div>
        <div className="label">{label}</div>
      </div>
      <div className="side">
        <div className="counts">
          <div>잎 <b>{leaves}</b></div>
          <div>꽃 <b>{flowers}</b></div>
        </div>
        <button className="rotate" onClick={onRotate} aria-label="시점 돌리기">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M17.5 3.5v4h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
