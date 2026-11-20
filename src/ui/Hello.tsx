// The first screen: a watercolour sketchbook page with a big "So So", and the three friends
// painted exactly as on the home screen, gathered around a watercolour cloud.
import { PORTRAIT_ASPECT, portraitURL } from "../scene/portrait";
import type { AnimalId } from "../scene/animals";

const PETALS = ["#F4B6C2", "#F6D46A", "#F29A7E", "#C9B6E8"];

function Bloom({ x, y, s = 1, c }: { x: number; y: number; s?: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wc-edge)">
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={Math.cos(a) * 4.6} cy={Math.sin(a) * 4.6} r={4.4} fill={c} opacity={0.92} />;
      })}
      <circle r={2.6} fill="#F6D46A" />
    </g>
  );
}

function Friend({ id, x, base, h, cls }: { id: AnimalId; x: number; base: number; h: number; cls: string }) {
  const w = h * PORTRAIT_ASPECT;
  return (
    <g className={`hello-bob ${cls}`}>
      <ellipse cx={x} cy={base - 2} rx={w * 0.42} ry={5} fill="#6E7F5A" opacity={0.18} />
      <image href={portraitURL(id)} x={x - w / 2} y={base - h} width={w} height={h} />
    </g>
  );
}

/** The watercolour paper itself: soft washes of colour that bleed at the edges, plus paper tooth. */
function Paper() {
  return (
    <svg className="wc-paper" preserveAspectRatio="none" viewBox="0 0 400 860" aria-hidden="true">
      <defs>
        <filter id="wc-bleed" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="38" result="d" />
          <feGaussianBlur in="d" stdDeviation="6" />
        </filter>
        <filter id="wc-tooth">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .55 -.08" />
        </filter>
      </defs>
      <rect width="400" height="860" fill="#FAF5EC" />
      <g filter="url(#wc-bleed)">
        <ellipse cx="310" cy="150" rx="150" ry="110" fill="#BFDCEB" opacity="0.55" />
        <ellipse cx="60" cy="320" rx="120" ry="90" fill="#F6CFD6" opacity="0.45" />
        <ellipse cx="220" cy="430" rx="190" ry="120" fill="#D6E7F2" opacity="0.5" />
        <ellipse cx="200" cy="700" rx="260" ry="110" fill="#CFE2B5" opacity="0.6" />
        <ellipse cx="340" cy="620" rx="90" ry="60" fill="#F7E3A8" opacity="0.45" />
      </g>
      <rect width="400" height="860" filter="url(#wc-tooth)" opacity="0.5" />
    </svg>
  );
}

export function Hello({ onStart }: { onStart: () => void }) {
  const blooms: [number, number, number][] = [
    [84, 268, 1], [104, 240, 0.9], [138, 222, 1.1], [258, 214, 1], [292, 234, 0.9], [318, 268, 1], [112, 300, 0.8], [300, 300, 0.8],
  ];
  return (
    <div className="hello sketchbook">
      <Paper />
      <div className="sb-rings" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
      </div>

      <header className="hello-head">
        <h1 className="hello-logo2" aria-label="So So">
          <span>So</span>
          <span>So<i aria-hidden="true" /></span>
        </h1>
        <p className="hello-ko">지친 하루 끝, 작은 친구가 기다리고 있어요<br />오늘의 소소한 행복을 함께 모아요</p>
        <span className="hello-pill">하루 하나</span>
      </header>

      <svg className="hello-art2" viewBox="40 120 320 320" preserveAspectRatio="xMidYMax meet" role="img" aria-label="수채화 뭉게구름 쿠션에 앉은 뽀송이와 양옆에 앉은 살랑이, 토닥이">
        <defs>
          <filter id="wc-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
          <linearGradient id="wc-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E3DDF0" />
          </linearGradient>
        </defs>
        {/* a soft watercolour cloud cushion, with flowers along its edge */}
        <g className="hello-float">
          <path filter="url(#wc-edge)" fill="url(#wc-cloud)" opacity="0.95"
            d="M92 300 C 64 300 64 262 94 258 C 90 226 128 212 150 230 C 160 200 214 194 228 222 C 248 200 296 210 294 242 C 326 240 340 286 310 300 C 300 322 112 324 92 300 Z" />
          {blooms.map(([x, y, s], i) => <Bloom key={i} x={x} y={y} s={s} c={PETALS[i % PETALS.length]} />)}
        </g>
        {/* thought bubble: 뽀송이 is dreaming of a flower */}
        <g filter="url(#wc-edge)" opacity="0.9">
          <ellipse cx="292" cy="150" rx="34" ry="24" fill="#FFFFFF" />
          <circle cx="262" cy="186" r="6" fill="#FFFFFF" />
          <circle cx="250" cy="200" r="3.5" fill="#FFFFFF" />
        </g>
        <Bloom x={292} y={150} s={1.8} c="#F4B6C2" />
        <Friend id="polar" x={200} base={276} h={128} cls="b2" />
        <Friend id="fox" x={92} base={432} h={118} cls="b1" />
        <Friend id="dog" x={310} base={432} h={118} cls="b3" />
      </svg>

      <div className="hello-bottom2">
        <p className="hello-lead2">작고 지친 친구에게 하루 하나, 좋아하는 걸 선물해요.<br />고마운 일 세 가지를 적으면 뭉게구름에 꽃이 소복이 피어나요.</p>
        <button className="hello-start" onClick={onStart}>소소한 행복 속으로 <b>Go</b></button>
      </div>
    </div>
  );
}
