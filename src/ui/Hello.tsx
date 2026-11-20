// The first screen: kraft paper, a big bold "So So", and the three friends drawn in simple
// black line art (white bodies, black accents).

const INK = "#1C1A17";
const PAPER = "#FFFAF2";
const line = { stroke: INK, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** 뽀송이: sitting on a puffy cloud cushion, looking up at a thought about a flower. */
function Bear() {
  return (
    <g>
      {/* the cloud cushion */}
      <path d="M150 316 C 126 316 122 282 148 278 C 144 252 178 238 196 254 C 206 228 252 226 264 250 C 284 236 318 248 312 276 C 340 278 342 316 314 318 C 300 336 168 336 150 316 Z" fill={PAPER} {...line} />
      <path d="M176 300 C 200 308 262 308 286 298" fill="none" {...line} strokeWidth={2.2} />
      {/* bear, head tilted up */}
      <g transform="translate(232 262) rotate(-6)">
        <circle cx="-22" cy="-82" r="11" fill={PAPER} {...line} />
        <circle cx="22" cy="-82" r="11" fill={PAPER} {...line} />
        <path d="M-40 0 C -40 -30 -34 -54 -28 -68 C -22 -84 -12 -90 0 -90 C 12 -90 22 -84 28 -68 C 34 -54 40 -30 40 0 Z" fill={PAPER} {...line} />
        <circle cx="-10" cy="-62" r="3.4" fill={INK} />
        <circle cx="10" cy="-62" r="3.4" fill={INK} />
        <ellipse cx="0" cy="-50" rx="6.5" ry="4.8" fill={INK} />
        <path d="M-30 -30 C -40 -18 -38 -6 -28 -4" fill="none" {...line} />
        <path d="M30 -30 C 40 -18 38 -6 28 -4" fill="none" {...line} />
        <ellipse cx="-16" cy="2" rx="12" ry="7" fill={PAPER} {...line} />
        <ellipse cx="16" cy="2" rx="12" ry="7" fill={PAPER} {...line} />
      </g>
      {/* thought bubble with a little flower */}
      <ellipse cx="318" cy="96" rx="44" ry="28" fill="none" {...line} strokeDasharray="70 10" />
      <circle cx="288" cy="138" r="5" fill="none" {...line} strokeWidth={2.6} />
      <circle cx="274" cy="154" r="3" fill="none" {...line} strokeWidth={2.4} />
      <g transform="translate(318 96)">
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={Math.cos(a) * 8} cy={Math.sin(a) * 8} r={7} fill={PAPER} {...line} strokeWidth={2.4} />;
        })}
        <circle r="4.5" fill={INK} />
      </g>
    </g>
  );
}

/** 살랑이: standing, holding a cup of tea, tail swishing. */
function Fox() {
  return (
    <g transform="translate(92 412)">
      <path d="M30 -24 C 70 -30 78 -70 58 -92 C 70 -60 52 -44 28 -40" fill={PAPER} {...line} />
      <path d="M58 -92 C 64 -84 66 -76 64 -70 C 58 -76 54 -82 52 -88 Z" fill={INK} {...line} strokeWidth={2} />
      <path d="M78 -86 q 6 4 6 10 M86 -94 q 7 5 7 13" fill="none" {...line} strokeWidth={2.4} />
      <path d="M-26 -104 L -30 -138 L -6 -116 Z" fill={PAPER} {...line} />
      <path d="M26 -104 L 30 -138 L 6 -116 Z" fill={PAPER} {...line} />
      <path d="M-25 -112 L -27 -128 L -15 -118 Z" fill={INK} />
      <path d="M25 -112 L 27 -128 L 15 -118 Z" fill={INK} />
      <path d="M-36 -2 C -36 -40 -32 -72 -26 -90 C -20 -110 -10 -118 0 -118 C 10 -118 20 -110 26 -90 C 32 -72 36 -40 36 -2 Z" fill={PAPER} {...line} />
      <circle cx="-9" cy="-90" r="3.2" fill={INK} />
      <circle cx="9" cy="-90" r="3.2" fill={INK} />
      <ellipse cx="0" cy="-79" rx="5.6" ry="4.2" fill={INK} />
      <path d="M-16 -2 L -16 10 M16 -2 L 16 10" fill="none" {...line} />
      <path d="M-24 10 L -10 10 M10 10 L 24 10" fill="none" {...line} />
      <path d="M-28 -60 C -18 -50 -4 -48 6 -52" fill="none" {...line} />
      <path d="M28 -60 C 22 -50 18 -48 12 -50" fill="none" {...line} />
      <path d="M-4 -64 L 24 -64 L 21 -44 C 20 -40 0 -40 -1 -44 Z" fill={PAPER} {...line} />
      <path d="M24 -60 C 32 -60 32 -50 22 -50" fill="none" {...line} strokeWidth={2.6} />
      <path d="M4 -72 q -4 -6 0 -12 M14 -72 q -4 -6 0 -12" fill="none" {...line} strokeWidth={2.2} />
    </g>
  );
}

/** 토닥이: lying on its tummy, floppy black ears, tail wagging. */
function Dog() {
  return (
    <g transform="translate(276 404)">
      <path d="M44 -26 C 58 -40 62 -56 56 -66" fill="none" {...line} />
      <path d="M66 -60 q 6 4 5 11 M72 -70 q 7 5 6 13" fill="none" {...line} strokeWidth={2.4} />
      <path d="M-34 0 C -40 -22 -30 -40 -6 -40 L 34 -40 C 56 -40 60 -12 50 0 Z" fill={PAPER} {...line} />
      <path d="M-20 0 L -20 8 L -8 8 M 30 0 L 30 8 L 42 8" fill="none" {...line} />
      <circle cx="-38" cy="-46" r="24" fill={PAPER} {...line} />
      <path d="M-56 -60 C -70 -56 -72 -30 -62 -20 C -56 -16 -52 -24 -52 -32 C -52 -42 -54 -52 -50 -62 Z" fill={INK} />
      <path d="M-24 -64 C -10 -62 -6 -40 -12 -30 C -18 -26 -22 -32 -22 -40 C -22 -48 -24 -56 -28 -64 Z" fill={INK} />
      <circle cx="-44" cy="-50" r="3" fill={INK} />
      <circle cx="-32" cy="-50" r="3" fill={INK} />
      <ellipse cx="-38" cy="-38" rx="5.4" ry="4" fill={INK} />
    </g>
  );
}

export function Hello({ onStart }: { onStart: () => void }) {
  return (
    <div className="hello kraft">
      <header className="hello-head">
        <h1 className="hello-logo2" aria-label="So So">
          <span>So</span>
          <span>So<i aria-hidden="true" /></span>
        </h1>
        <p className="hello-en">A Tiny Friend Waits For One Gift A Day<br />Write Three Thank-Yous, Grow A Cloud Of Flowers</p>
        <span className="hello-pill">하루 하나</span>
      </header>

      <svg className="hello-art2" viewBox="40 40 330 400" preserveAspectRatio="xMidYMax meet" role="img" aria-label="구름 쿠션에 앉은 뽀송이, 찻잔을 든 살랑이, 엎드려 꼬리를 흔드는 토닥이">
        <Bear />
        <Fox />
        <Dog />
        <path d="M70 160 l0 12 M64 166 l12 0" {...line} strokeWidth={2.4} />
        <path d="M352 210 l0 10 M347 215 l10 0" {...line} strokeWidth={2.4} />
      </svg>

      <div className="hello-bottom2">
        <p className="hello-lead2">작고 지친 친구에게 하루 하나, 좋아하는 걸 선물해요.<br />고마운 일 세 가지를 적으면 뭉게구름에 꽃이 소복이 피어나요.</p>
        <button className="hello-start" onClick={onStart}>소소한 행복 속으로 <b>Go</b></button>
      </div>
    </div>
  );
}
