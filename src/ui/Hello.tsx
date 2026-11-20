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
          <span>So</span>
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
 * A worn-out person on a stool, folded forward with the face down on the desk in front of the
 * monitor, both arms hanging straight down. Pens lie on the desk and on the floor.
 */
function DeskScene() {
  const fill = "#BB8D65";
  return (
    <g filter="url(#chalk-wobble)">
      {/* desk running off to the right */}
      <path d="M140 238 L 362 238 L 362 252 L 140 252 Z" {...chalk} />
      <path d="M150 252 C 190 290 250 330 300 352" {...chalk} strokeWidth={2.6} />
      {/* big monitor with a thick bezel */}
      <path d="M244 96 L 352 92 L 356 184 L 248 190 Z" {...chalk} fill={CHALK} />
      <path d="M256 106 L 342 103 L 345 174 L 259 178 Z" {...chalk} fill={fill} />
      <path d="M300 190 L 304 222 M284 232 L 322 230" {...chalk} />
      {/* pens: two on the desk, one on the floor */}
      <path d="M204 246 L 232 250 M236 244 L 266 246" {...chalk} strokeWidth={5} />
      <path d="M180 356 L 214 358" {...chalk} strokeWidth={5} />

      {/* stool */}
      <ellipse cx="74" cy="274" rx="38" ry="8" {...chalk} fill={fill} />
      <path d="M74 282 L 74 350" {...chalk} />
      <ellipse cx="74" cy="356" rx="28" ry="6" {...chalk} />
      {/* legs: thighs forward, shins down, shoes on the floor */}
      <path d="M70 266 L 124 266 L 128 346 M84 280 L 112 280 L 112 346" {...chalk} fill={fill} />
      <path d="M110 346 C 108 356 136 358 146 354 C 146 348 136 344 128 344" {...chalk} />
      {/* the jumper: torso folded forward from the hips to the desk */}
      <path d="M46 268 C 42 246 64 226 96 216 C 120 208 140 206 156 212 L 160 232 C 140 236 118 246 104 262 C 96 270 74 274 46 268 Z" {...chalk} fill={CHALK} />
      {/* an arm hanging straight down */}
      <path d="M146 214 L 160 214 L 162 316 L 150 318 Z" {...chalk} fill={CHALK} />
      <path d="M150 318 C 148 330 162 332 162 318" {...chalk} />
      {/* head face-down on the desk, hair spilling forward, eyes closed */}
      <path d="M156 226 C 156 214 172 208 190 210 C 206 212 212 222 208 232 C 198 238 166 238 156 226 Z" {...chalk} fill={fill} />
      <path d="M172 222 q -3 4 0 8 M180 220 q -3 4 0 8" {...chalk} strokeWidth={2.4} />
      <path d="M200 216 C 214 220 228 226 240 232 M204 224 C 216 228 228 234 236 238 M198 212 C 212 214 226 218 236 222" {...chalk} strokeWidth={2} />
    </g>
  );
}

export function HelloDesk({ onStart, logoFont = "poppins" }: { onStart: () => void; logoFont?: LogoFontId }) {
  return (
    <div className="hello desk" style={{ backgroundImage: `url(${kraftURL()})` }}>
      <header className="hello-head">
        <h1 className="hello-logo2 chalk-logo" aria-label="So So" style={logoStyle(logoFont)}>
          <span>So</span>
          <span>So</span>
        </h1>
        <p className="desk-ask">지치셨나요?</p>
        <p className="desk-ko">지친 하루 끝, 친구가 기다리고 있어요.<br />소소한 행복을 함께 모아요.</p>
      </header>

      <svg className="hello-art2" viewBox="0 70 364 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="의자에 앉아 모니터 앞 책상에 얼굴을 묻고 팔을 늘어뜨린 지친 사람">
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
