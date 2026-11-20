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

// messy hair: short strands sticking out around the top of the head, plus a few stray curls
const FRIZZ = (() => {
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: string[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (-190 + (170 * k) / 11 + (r() - 0.5) * 8) * (Math.PI / 180);
    const x = 482 + Math.cos(a) * 140, y = 444 + Math.sin(a) * 120;
    const len = 10 + r() * 16, tw = (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6);
    const ex = x + Math.cos(a + tw) * len, ey = y + Math.sin(a + tw) * len;
    const cx = x + Math.cos(a - tw) * len * 0.6, cy = y + Math.sin(a - tw) * len * 0.6;
    out.push(`M${x.toFixed(1)} ${y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }
  return out.join(" ");
})();

/**
 * Option 2: head down on the desk, cheek on the table, eyes shut, a big mop of messy hair, a mug
 * still steaming and the phone face-down, the monitor still on in front. Drawn at the
 * reference's scale and shrunk into the scene.
 */
function NapScene() {
  const paper = "#BB8D65";
  const ink = "#3A2717";
  const line = { ...chalk, strokeWidth: 11 };
  const thin = { ...chalk, strokeWidth: 6 };
  const hair = { stroke: ink, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g filter="url(#chalk-wobble)">
      <g transform="translate(26 50) scale(0.38)">
        {/* monitor on the desk in front, still on */}
        <path d="M-58 196 L 222 178 L 228 418 L -52 434 Z" {...line} />
        <path d="M-34 220 L 200 204 L 204 394 L -28 408 Z" {...thin} />
        <path d="M2 254 L 118 246 M 2 284 L 158 274 M 2 314 L 88 308" {...thin} />
        <path d="M86 432 L 88 498" {...line} />
        <path d="M26 504 L 150 496" {...line} />

        {/* steam curling up from the mug */}
        <path d="M312 556 C 300 524 262 508 270 476 C 278 444 330 432 322 394 C 316 364 284 352 294 318" {...line} />
        {/* mug */}
        <path d="M282 600 L 288 690 C 304 704 340 704 354 690 L 364 600" {...line} />
        <ellipse cx="323" cy="600" rx="41" ry="14" {...line} />
        <ellipse cx="323" cy="602" rx="28" ry="7" fill={ink} />
        <path d="M282 620 C 248 618 248 670 286 664" {...line} />

        {/* the desk's front edge, running under the arm */}
        <path d="M596 516 L 815 765" {...line} />
        {/* phone, face down */}
        <path d="M498 712 L 576 656 C 588 648 606 656 612 670 L 538 734 C 524 744 502 732 498 712 Z" {...thin} fill={ink} />
        <path d="M504 724 L 540 740 L 616 680" {...thin} />

        {/* the hoodie: hood bunched up behind the neck, drawstrings, rounded back, folded arm */}
        <path d="M600 436 C 594 386 652 358 714 366 C 776 374 812 414 796 454 C 778 484 718 486 664 472" {...line} fill={paper} />
        <path d="M636 410 C 680 394 744 404 774 446" {...thin} />
        <path d="M664 474 C 662 494 660 512 658 528 M 694 480 C 694 498 692 516 690 532" {...thin} />
        <circle cx="658" cy="536" r="7" {...thin} /><circle cx="690" cy="540" r="7" {...thin} />
        <path d="M720 484 L 676 572" {...line} />
        <path d="M796 454 C 842 494 868 540 874 600 C 878 660 880 700 880 745" {...line} />
        <path d="M662 590 C 666 520 696 488 738 482" {...line} />
        <path d="M752 484 C 782 490 798 536 798 600 L 798 708" {...line} />

        <g transform="rotate(10 480 470)">
          {/* face peeking out under the fringe, cheek on the desk, eyes shut */}
          <path d="M404 462 C 428 438 470 432 510 452 C 548 474 556 524 540 570 C 506 580 462 576 432 560 C 402 544 390 500 404 462 Z" fill={paper} />
          <path d="M398 520 C 410 550 440 568 486 574" {...line} />
          <path d="M470 478 L 472 504" {...line} />
          <path d="M514 488 L 516 512" {...line} />
          <path d="M488 524 L 490 536" {...thin} />
          {/* a big messy mop of hair */}
          <path d="M335 452 C 318 372 380 318 462 316 C 556 314 622 366 628 446 C 632 498 622 540 604 568 C 584 578 556 576 540 570 C 556 524 548 474 510 452 C 470 432 428 438 404 462 C 392 478 390 500 396 524 C 366 514 340 490 335 452 Z" fill={ink} />
          <path d={FRIZZ} {...hair} strokeWidth={6} />
          <path d="M470 314 C 462 280 494 268 506 292 M 336 432 C 304 430 302 460 326 464" {...hair} strokeWidth={6} />
          {/* ponytail: tied at the back of the head, flopping over the hood */}
          <g transform="translate(600 364) scale(0.72) translate(-600 -364)">
            <path d="M588 352 C 622 300 704 286 744 330 C 774 364 770 420 742 446 C 730 456 716 452 722 438 C 740 402 728 364 694 354 C 660 346 626 362 606 384 Z" fill={ink} />
            <path d="M742 446 C 754 458 756 474 746 482 M 726 444 C 730 462 724 476 712 480" {...hair} strokeWidth={7} />
          </g>
          <ellipse cx="598" cy="370" rx="12" ry="20" transform="rotate(-40 598 370)" {...thin} fill={CHALK} />
          {/* stray hairs falling across the cheek */}
          <path d="M506 450 C 528 476 534 506 528 532" {...hair} strokeWidth={5} />
        </g>
      </g>
    </g>
  );
}

export function HelloDesk({ onStart, logoFont = "poppins", pose = "desk" }: { onStart: () => void; logoFont?: LogoFontId; pose?: "desk" | "nap" }) {
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

      <svg className="hello-art2" viewBox="0 70 364 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label={pose === "nap" ? "모니터 앞 책상에 볼을 대고 눈을 감은 지친 사람, 옆에는 김이 나는 머그잔과 엎어 둔 휴대폰" : "의자에 앉아 모니터 앞 책상에 얼굴을 묻고 팔을 늘어뜨린 지친 사람"}>
        <defs>
          <filter id="chalk-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" result="w" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g" />
            <feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="holes" />
            <feComposite in="w" in2="holes" operator="in" />
          </filter>
        </defs>
        {pose === "nap" ? <NapScene /> : <DeskScene />}
      </svg>

      <div className="hello-bottom2">
        <button className="hello-start chalk" onClick={onStart}>소소한 행복 속으로 <b>Go</b></button>
      </div>
    </div>
  );
}
