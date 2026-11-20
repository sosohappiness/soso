// The first screen: a watercolour sketchbook page with a big "So So", and the three friends
// painted exactly as on the home screen, gathered around a watercolour cloud.
import { PORTRAIT_ASPECT, portraitURL } from "../scene/portrait";
import type { AnimalId } from "../scene/animals";
import { kraftURL } from "./kraft";
import { logoStyle, type LogoFontId } from "./logoFonts";

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

export function Hello({ onStart, logoFont = "poppins" }: { onStart: () => void; logoFont?: LogoFontId }) {
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
        <h1 className="hello-logo2" aria-label="So So" style={logoStyle(logoFont)}>
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

/**
 * A tired person, like the "Lay." sketch: a round head resting at the foot of a tall reclined
 * office chair, the body poured out long and flat down to the floor, one arm hugging the armrest.
 * Beside it, a small desk with books piled high, a monitor and a mug.
 */
function DeskScene() {
  const fill = "#BB8D65";
  const books: [number, number, number][] = [
    [244, 50, 18], [248, 44, 16], [242, 52, 20], [250, 40, 14], [244, 48, 18], [252, 38, 16], [246, 46, 20],
  ];
  let y = 252;
  return (
    <g filter="url(#chalk-wobble)">
      {/* small desk on the right with a tall book stack, monitor and mug */}
      <path d="M234 252 L 362 252 L 362 264 L 234 264 Z" {...chalk} />
      <path d="M244 264 L 244 368 M352 264 L 352 368" {...chalk} />
      {books.map(([x, w, h], i) => {
        y -= h;
        const top = y;
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={h} rx={3} {...chalk} />
            <path d={`M${x + 8} ${top + 4} L ${x + 8} ${top + h - 4}`} {...chalk} strokeWidth={2.2} />
          </g>
        );
      })}
      <rect x="298" y="178" width="60" height="46" rx="6" {...chalk} />
      <path d="M306 192 L 340 192 M306 204 L 350 204" {...chalk} strokeWidth={2.4} />
      <path d="M328 224 L 328 244 M314 250 C 316 242 340 242 342 250 Z" {...chalk} />

      {/* the chair: a tall backrest leaning back to the upper right, seat, post, star base */}
      <path d="M148 262 L 196 162 C 200 150 236 150 240 160 L 178 262 Z" {...chalk} fill={fill} />
      <path d="M200 166 L 234 168" {...chalk} strokeWidth={2.6} />
      <path d="M160 272 L 160 316" {...chalk} />
      <path d="M118 334 L 160 316 L 202 334 M136 340 L 160 316 L 184 340" {...chalk} />
      <circle cx="116" cy="338" r="5" {...chalk} strokeWidth={3} />
      <circle cx="204" cy="338" r="5" {...chalk} strokeWidth={3} />
      <circle cx="134" cy="344" r="4.5" {...chalk} strokeWidth={3} />
      <circle cx="186" cy="344" r="4.5" {...chalk} strokeWidth={3} />

      {/* the body, poured out long and flat from the chair to the floor */}
      <path
        d="M186 226 C 160 222 120 232 90 250 C 60 270 30 300 4 322 L 4 346 C 40 344 80 322 116 300 C 140 286 160 278 176 274 C 196 270 204 248 186 226 Z"
        {...chalk} fill={fill}
      />
      <path d="M150 248 C 116 260 76 286 40 316" {...chalk} strokeWidth={2.6} />
      {/* armrest, with the arm wrapped over it */}
      <path d="M168 250 L 222 244 M214 244 L 214 262" {...chalk} />
      <path d="M140 244 C 156 256 190 256 214 248 C 220 246 222 238 214 236 C 196 240 170 242 150 236" {...chalk} fill={fill} />
      {/* round head with a sleepy smile */}
      <path d="M150 222 C 146 204 160 192 176 192 C 194 192 204 206 200 222 C 196 236 156 238 150 222 Z" {...chalk} fill={fill} />
      <path d="M164 210 q 3 3 6 0 M180 210 q 3 3 6 0" {...chalk} strokeWidth={2.6} />
      <path d="M170 220 q 5 4 10 0" {...chalk} strokeWidth={2.6} />
      {/* z z */}
      <path d="M128 186 l 10 0 l -10 10 l 10 0 M112 168 l 7 0 l -7 7 l 7 0" {...chalk} strokeWidth={2.6} />
    </g>
  );
}

export function HelloDesk({ onStart, logoFont = "poppins" }: { onStart: () => void; logoFont?: LogoFontId }) {
  return (
    <div className="hello desk" style={{ backgroundImage: `url(${kraftURL()})` }}>
      <header className="hello-head">
        <h1 className="hello-logo2 chalk-logo" aria-label="So So" style={logoStyle(logoFont)}>
          <span>So</span>
          <span>So<i aria-hidden="true" /></span>
        </h1>
        <p className="desk-ask">지치셨나요?</p>
        <p className="desk-ko">지친 하루 끝, 친구가 기다리고 있어요.<br />소소한 행복을 함께 모아요.</p>
      </header>

      <svg className="hello-art2" viewBox="0 70 364 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="뒤로 젖힌 사무용 의자에 몸을 길게 늘어뜨리고 누운 지친 사람, 옆 책상에 높이 쌓인 책과 모니터">
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
