type Props = { time: string; label: string; flowers: number; days: number; onSettings: () => void };

export function Hud({ time, label, flowers, days, onSettings }: Props) {
  return (
    <header className="hud">
      <div className="clock">
        <div className="time">{time}</div>
        <div className="label">{label}</div>
      </div>
      <div className="side">
        <button className="settings-btn" onClick={onSettings} aria-label="설정">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14.1 2h-4.2l-.4 3a7.5 7.5 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.4 3h4.2l.4-3a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="counts">
          <div>소복 <b>{flowers}</b></div>
          <div>함께한 날 <b>{days}</b></div>
        </div>
      </div>
    </header>
  );
}
