type Props = { time: string; label: string; flowers: number; days: number };

export function Hud({ time, label, flowers, days }: Props) {
  return (
    <header className="hud">
      <div className="clock">
        <div className="time">{time}</div>
        <div className="label">{label}</div>
      </div>
      <div className="side">
        <div className="counts">
          <div>소복 <b>{flowers}</b></div>
          <div>함께한 날 <b>{days}</b></div>
        </div>
      </div>
    </header>
  );
}
