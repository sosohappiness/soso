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

// ---- another style: kraft paper, everything drawn in white chalky lines ----

const CHALK = "#FFF8EC";
const chalk = { stroke: CHALK, strokeWidth: 4.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/** 뽀송이 melted over the desk after a long day: monitor, keyboard, a tall stack of books, a mug. */
function DeskScene() {
  // a tall, slightly wobbly stack of books
  const books: [number, number, number][] = [
    [18, 104, 22], [24, 96, 20], [14, 108, 24], [22, 94, 18], [16, 102, 22], [26, 90, 20], [20, 98, 24], [28, 86, 18],
  ];
  let y = 262;
  return (
    <g filter="url(#chalk-wobble)">
      {/* desk */}
      <path d="M8 262 L 356 262 L 356 278 L 8 278 Z" {...chalk} />
      <path d="M24 278 L 24 372 M340 278 L 340 372 M24 326 L 340 326" {...chalk} />

      {/* books stacked high on the left */}
      {books.map(([x, w, h], i) => {
        y -= h;
        const top = y;
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={h} rx={3} {...chalk} />
            <path d={`M${x + 10} ${top + 5} L ${x + 10} ${top + h - 5}`} {...chalk} strokeWidth={2.4} />
            {i % 2 === 0 && <path d={`M${x + w - 24} ${top + h / 2} L ${x + w - 8} ${top + h / 2}`} {...chalk} strokeWidth={2.4} />}
          </g>
        );
      })}

      {/* monitor and keyboard */}
      <rect x="226" y="120" width="120" height="90" rx="9" {...chalk} />
      <path d="M242 148 L 304 148 M242 164 L 326 164 M242 180 L 286 180" {...chalk} strokeWidth={2.6} />
      <path d="M286 210 L 286 242 M262 250 C 266 240 306 240 310 250 Z" {...chalk} />
      <rect x="244" y="252" width="62" height="10" rx="3" {...chalk} />
      {/* mug with steam */}
      <path d="M318 234 L 342 234 L 339 262 L 321 262 Z" {...chalk} />
      <path d="M342 240 C 352 240 352 252 341 252" {...chalk} strokeWidth={3} />
      <path d="M325 224 q -5 -7 0 -14 M335 224 q -5 -7 0 -14" {...chalk} strokeWidth={2.6} />

      {/* 뽀송이 melted over the desk: head down, body pouring over the front edge */}
      <path
        d="M182 258 C 160 256 140 254 124 256 C 110 258 104 262 104 268 C 104 286 102 306 112 318 C 122 330 140 326 142 310 C 144 296 140 282 148 274 C 160 268 176 270 186 266 Z"
        {...chalk} fill="rgba(255,248,236,0.16)"
      />
      <path d="M128 304 q 6 4 10 0" {...chalk} strokeWidth={2.4} />
      {/* an arm dangling over the edge */}
      <path d="M160 270 C 164 288 164 306 158 322" {...chalk} />
      <path d="M150 322 C 152 332 168 332 166 322" {...chalk} />
      {/* head resting on the desk */}
      <circle cx="188" cy="212" r="11" {...chalk} fill="rgba(255,248,236,0.16)" />
      <circle cx="232" cy="212" r="11" {...chalk} fill="rgba(255,248,236,0.16)" />
      <path d="M176 262 C 168 234 186 206 210 206 C 234 206 250 232 242 262 Z" {...chalk} fill="rgba(255,248,236,0.16)" />
      <path d="M192 236 q 5 4 10 0 M218 236 q 5 4 10 0" {...chalk} strokeWidth={2.8} />
      <ellipse cx="210" cy="248" rx="5" ry="3.6" fill={CHALK} stroke="none" />
      {/* z z */}
      <path d="M248 214 l 12 0 l -12 12 l 12 0 M266 194 l 8 0 l -8 8 l 8 0" {...chalk} strokeWidth={2.8} />
    </g>
  );
}

export function HelloDesk({ onStart }: { onStart: () => void }) {
  return (
    <div className="hello desk">
      <header className="hello-head">
        <h1 className="hello-logo2 chalk-logo" aria-label="So So">
          <span>So</span>
          <span>So<i aria-hidden="true" /></span>
        </h1>
        <p className="desk-ask">지치셨나요?</p>
        <p className="desk-ko">지친 하루 끝, 친구가 기다리고 있어요.<br />소소한 행복을 함께 모아요.</p>
      </header>

      <svg className="hello-art2" viewBox="0 70 364 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="책상에 녹아내리듯 엎드린 뽀송이, 모니터와 높이 쌓인 책">
        <defs>
          <filter id="chalk-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" result="w" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g" />
            <feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="holes" />
            <feComposite in="w" in2="holes" operator="in" />
          </filter>
        </defs>
        <DeskScene />
      </svg>

      <div className="hello-bottom2">
        <button className="hello-start chalk" onClick={onStart}>소소한 행복 속으로 <b>Go</b></button>
      </div>
    </div>
  );
}
