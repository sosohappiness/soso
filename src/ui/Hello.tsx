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
 * A worn-out person on a stool, folded forward with one cheek on the desk in front of a big
 * monitor, eyes closed, hair spilling over the desk, one arm hanging limp. The jumper and the
 * monitor's bezel are solid chalk; everything else is drawn in line.
 */
function DeskScene() {
  const paper = "#BB8D65";
  const thin = { ...chalk, strokeWidth: 2.2 };
  return (
    <g filter="url(#chalk-wobble)">
      {/* the desk, seen from the corner: back edge, and the front edge running away diagonally */}
      <path d="M150 250 L 362 222" {...chalk} />
      <path d="M150 250 C 196 284 248 322 304 366" {...chalk} />
      {/* a sheet of paper and two pens on the desk */}
      <path d="M214 262 L 262 254 L 272 276 L 224 284 Z" {...thin} />
      <path d="M268 286 L 300 292" {...chalk} strokeWidth={5.5} />
      <path d="M284 268 L 314 270" {...chalk} strokeWidth={5.5} />

      {/* big monitor: thick solid bezel, chin, neck and foot */}
      <path d="M232 82 L 352 70 L 358 182 L 240 194 Z" {...chalk} fill={CHALK} />
      <path d="M244 94 L 340 84 L 344 162 L 248 172 Z" {...thin} fill={paper} />
      <path d="M352 70 L 360 76 L 364 186 L 358 182" {...thin} />
      <path d="M294 192 L 296 222 L 312 220 L 308 190" {...chalk} />
      <path d="M278 228 L 330 222" {...chalk} />

      {/* stool: saddle seat, post, round foot */}
      <path d="M30 284 C 30 274 64 270 92 272 C 112 274 120 280 116 286 C 98 292 46 292 30 284 Z" {...chalk} fill={paper} />
      <circle cx="46" cy="282" r="2.6" fill={CHALK} /><circle cx="70" cy="284" r="2.6" fill={CHALK} /><circle cx="94" cy="282" r="2.6" fill={CHALK} />
      <path d="M72 290 L 72 350" {...chalk} />
      <path d="M38 360 C 40 350 104 350 106 360 C 96 366 48 366 38 360 Z" {...chalk} />

      {/* trousers: thighs forward over the seat, shins straight down, shoes on the floor */}
      <path d="M56 274 C 80 270 112 268 128 270 C 134 272 134 280 130 286 L 134 344 L 120 344 L 116 290 C 96 290 72 288 58 284 Z" {...chalk} fill={paper} />
      <path d="M112 346 C 108 352 112 358 124 358 C 136 358 150 358 152 352 C 150 344 138 342 132 342 Z" {...chalk} fill={paper} />
      <path d="M180 352 L 210 354" {...chalk} strokeWidth={5.5} />

      {/* the jumper: back curving from the hips up and over to the desk */}
      <path d="M46 282 C 38 254 60 228 98 216 C 124 208 148 210 164 220 C 170 226 168 236 160 238 C 140 240 120 252 106 272 C 90 280 64 284 46 282 Z" {...chalk} fill={CHALK} />
      {/* the arm hanging straight down, limp hand */}
      <path d="M140 222 L 160 226 L 160 322 L 146 322 Z" {...chalk} fill={CHALK} />
      <path d="M146 322 C 142 334 146 344 154 344 C 160 344 162 336 160 322" {...chalk} fill={paper} />
      <path d="M150 330 L 150 340" {...thin} />

      {/* head: cheek on the desk, face turned to us, eyes closed; hair over the top and across the desk */}
      <path d="M164 236 C 162 220 176 210 194 210 C 214 210 226 222 224 236 C 222 248 206 254 192 252 C 176 250 166 246 164 236 Z" {...chalk} fill={paper} />
      <path d="M176 238 q 5 5 10 0" {...thin} strokeWidth={2.6} />
      <path d="M196 236 q 5 5 10 0" {...thin} strokeWidth={2.6} />
      <path d="M190 244 q 2 2 4 0" {...thin} />
      <path d="M166 230 C 168 216 182 208 198 208 C 214 208 224 216 226 226 C 216 222 206 220 196 222 C 184 224 174 228 166 230 Z" {...chalk} fill={CHALK} />
      <path d="M222 220 C 236 222 252 228 266 238" {...thin} />
      <path d="M224 228 C 238 232 252 238 262 248" {...thin} />
      <path d="M220 214 C 236 214 250 220 262 228" {...thin} />
      <path d="M216 234 C 230 240 242 248 250 256" {...thin} />
    </g>
  );
}

/**
 * Option 2: a worn-out person flat on the floor, legs out, a laptop propped on the belly, staring
 * at the ceiling with big round eyes. Line drawing on kraft; only the eyes are solid chalk.
 */
function LieScene() {
  const paper = "#BB8D65";
  const ink = "#3B2818";
  const body = { ...chalk, fill: paper };
  const thin = { ...chalk, strokeWidth: 2.2 };
  return (
    <g filter="url(#chalk-wobble)">
      {/* a soft floor shadow */}
      <ellipse cx="178" cy="300" rx="150" ry="34" fill="#8E6440" opacity="0.28" />
      {/* the far arm, reaching out behind the laptop */}
      <path d="M184 206 L 122 222 L 124 238 L 188 224 Z" {...body} />
      <path d="M122 222 C 110 218 104 228 110 233 C 102 236 106 246 116 244 C 118 246 122 242 124 238" {...body} />
      {/* legs out flat, feet tipped up */}
      <path d="M178 248 L 66 286 L 70 310 L 184 274 Z" {...body} />
      <path d="M66 286 C 58 270 42 276 44 294 C 44 308 58 316 70 310" {...body} />
      <path d="M186 268 L 110 330 L 124 348 L 204 288 Z" {...body} />
      <path d="M110 330 C 96 324 86 340 96 352 C 104 360 118 358 124 348" {...body} />
      {/* torso */}
      <path d="M204 192 C 236 192 266 218 266 248 C 266 280 236 298 198 298 C 168 298 152 278 158 252 C 164 224 180 194 204 192 Z" {...body} />
      {/* near arm lying by the side, limp hand */}
      <path d="M252 238 L 268 232 L 300 312 L 284 318 Z" {...body} />
      <path d="M284 318 C 280 330 290 338 298 334 C 304 330 304 320 300 312" {...body} />
      <path d="M290 326 L 288 334 M 296 324 L 296 332" {...thin} />
      {/* laptop on the belly: keyboard base, then the lid seen from behind */}
      <path d="M164 256 L 226 244 L 272 290 L 218 304 Z" {...body} />
      <path d="M188 262 L 232 254 M 196 272 L 244 264 M 204 282 L 254 274 M 212 292 L 238 287" {...thin} />
      <path d="M164 256 L 136 166 L 190 214 L 218 304 Z" {...body} />
      <circle cx="177" cy="236" r="6" {...thin} />
      {/* head: a big round blob, face turned up to the ceiling */}
      <ellipse cx="266" cy="172" rx="56" ry="47" transform="rotate(-28 266 172)" {...body} />
      {/* big blank eyes and a tiny mouth */}
      <ellipse cx="236" cy="150" rx="16" ry="12" transform="rotate(-28 236 150)" {...chalk} fill={CHALK} />
      <circle cx="231" cy="149" r="8" fill={ink} />
      <ellipse cx="282" cy="180" rx="18" ry="13" transform="rotate(-28 282 180)" {...chalk} fill={CHALK} />
      <circle cx="276" cy="178" r="9" fill={ink} />
      <path d="M252 170 q -5 4 1 8" {...thin} />
      {/* droopy lids: tired */}
      <path d="M222 148 C 228 138 244 134 252 140" {...chalk} />
      <path d="M266 176 C 272 166 290 164 300 172" {...chalk} />
    </g>
  );
}

export function HelloDesk({ onStart, logoFont = "poppins", pose = "desk" }: { onStart: () => void; logoFont?: LogoFontId; pose?: "desk" | "lie" }) {
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

      <svg className="hello-art2" viewBox="0 70 364 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label={pose === "lie" ? "바닥에 대자로 누워 배 위에 노트북을 올려놓고 천장을 멍하니 보는 지친 사람" : "의자에 앉아 모니터 앞 책상에 얼굴을 묻고 팔을 늘어뜨린 지친 사람"}>
        <defs>
          <filter id="chalk-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" result="w" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g" />
            <feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="holes" />
            <feComposite in="w" in2="holes" operator="in" />
          </filter>
        </defs>
        {pose === "lie" ? <LieScene /> : <DeskScene />}
      </svg>

      <div className="hello-bottom2">
        <button className="hello-start chalk" onClick={onStart}>소소한 행복 속으로 <b>Go</b></button>
      </div>
    </div>
  );
}
