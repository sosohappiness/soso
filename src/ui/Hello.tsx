import { PORTRAIT_ASPECT, portraitURL } from "../scene/portrait";

const PETALS = ["#F4B6C2", "#F6D46A", "#F29A7E", "#C9B6E8"];

function Bloom({ x, y, s = 1, c }: { x: number; y: number; s?: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={Math.cos(a) * 4.4} cy={Math.sin(a) * 4.4} r={4.2} fill={c} />;
      })}
      <circle r={2.6} fill="#F9E7A8" />
    </g>
  );
}

function Dandelion({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g className="hello-sway" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x} ${y} C ${x + 1} ${y - h * 0.4} ${x + 2} ${y - h * 0.7} ${x + 2} ${y - h}`} stroke="#5E8B45" strokeWidth="2" fill="none" />
      <path d={`M${x} ${y} l-11 -4 l4 -2 l-6 -4 l8 2 Z M${x} ${y} l11 -4 l-4 -2 l6 -4 l-8 2 Z`} fill="#6F9A4E" />
      <circle cx={x + 2} cy={y - h - 2} r="7" fill="#F3C73A" />
    </g>
  );
}

/**
 * The first screen: a big puffy cloud with the 소소 logo inside, three friends sitting
 * together on the red sofa, and one button to start.
 */
export function Hello({ onStart }: { onStart: () => void }) {
  // flowers sprinkled along the cloud's edge
  const blooms: [number, number, number][] = [
    [72, 196, 1.1], [104, 148, 0.9], [150, 116, 1.2], [214, 104, 1], [268, 120, 1.2], [312, 160, 0.9],
    [330, 206, 1.1], [92, 238, 0.8], [292, 246, 0.9], [184, 92, 0.8], [58, 228, 0.7], [244, 96, 0.7],
  ];
  return (
    <div className="hello">
      <svg className="hello-art" viewBox="0 0 390 560" preserveAspectRatio="xMidYMax meet" overflow="visible" role="img" aria-label="뭉게구름 속 소소 로고와, 빨간 소파에 나란히 앉은 세 친구">
        <defs>
          <linearGradient id="h-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440">
            <stop offset="0" stopColor="#CFE1EC" />
            <stop offset="0.78" stopColor="#F4ECE0" />
          </linearGradient>
          <linearGradient id="h-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="#FFFBF4" />
            <stop offset="1" stopColor="#E6DFEF" />
          </linearGradient>
        </defs>
        <rect x="-600" y="-900" width="1590" height="1460" fill="url(#h-sky)" />
        <circle cx="338" cy="58" r="20" fill="#F2C230" />
        <g fill="#F6E9DA" opacity="0.9">
          <ellipse cx="34" cy="64" rx="44" ry="13" /><ellipse cx="54" cy="55" rx="24" ry="13" />
        </g>

        {/* the big cloud, floating, with the logo inside */}
        <g className="hello-float">
          <g fill="url(#h-cloud)" stroke="#4a3b33" strokeWidth="3">
            <path d="M58 236 C 26 236 26 186 62 182 C 56 140 104 122 128 146 C 138 104 196 92 214 124 C 236 92 292 104 290 146 C 330 136 352 182 324 206 C 352 226 330 266 298 254 C 284 282 236 280 224 262 C 206 284 160 284 146 262 C 126 282 76 276 82 252 C 66 256 52 248 58 236 Z" />
          </g>
          <ellipse cx="150" cy="150" rx="40" ry="12" fill="#FFFFFF" opacity="0.8" />
          {blooms.map(([x, y, s], i) => <Bloom key={i} x={x} y={y} s={s} c={PETALS[i % PETALS.length]} />)}
          <g className="hello-logo">
            <text className="hl-1" x="160" y="226" textAnchor="middle">소</text>
            <text className="hl-2" x="232" y="222" textAnchor="middle">소</text>
            <Bloom x={268} y={150} s={1.5} c="#F4B6C2" />
          </g>
        </g>

        {/* meadow */}
        <path d="M-600 444 L0 440 C 120 432 270 446 390 436 L990 440 L990 900 L-600 900 Z" fill="#9DBA6E" />
        <path d="M-600 520 L0 520 C 130 514 260 524 390 516 L990 516 L990 900 L-600 900 Z" fill="#8EAD62" />
        <Dandelion x={34} y={500} h={34} />
        <Dandelion x={60} y={520} h={26} />
        <Dandelion x={356} y={512} h={36} />
        <g transform="translate(30 538)">
          <ellipse rx="16" ry="5" fill="#D8C9B4" />
          <circle cx="-4" cy="-8" r="10" fill="#E5A877" stroke="#4a3b33" strokeWidth="1.5" />
          <path d="M-4 -8 m -6 0 a 6 6 0 1 1 6 6 a 4 4 0 1 1 -3 -5" stroke="#B87648" strokeWidth="1.6" fill="none" />
          <path d="M12 -2 l2 -9 M9 -2 l0 -8" stroke="#D8C9B4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="-11" r="1.6" fill="#151213" /><circle cx="9" cy="-10" r="1.5" fill="#151213" />
        </g>

        {/* the red sofa with all three friends */}
        <ellipse cx="195" cy="508" rx="148" ry="8" fill="#000" opacity="0.08" />
        <g stroke="#4a3b33" strokeWidth="2.5">
          <rect x="70" y="396" width="128" height="80" rx="34" fill="#B3261E" />
          <rect x="190" y="396" width="128" height="80" rx="34" fill="#B3261E" />
          <rect x="58" y="462" width="274" height="44" rx="18" fill="#B3261E" />
          <rect x="40" y="446" width="50" height="62" rx="24" fill="#B3261E" />
          <rect x="300" y="446" width="50" height="62" rx="24" fill="#B3261E" />
        </g>
        <ellipse cx="134" cy="410" rx="40" ry="8" fill="#C8402F" />
        <ellipse cx="254" cy="410" rx="40" ry="8" fill="#C8402F" />
        {([["fox", 118, 1, 92], ["dog", 272, 3, 92], ["polar", 196, 2, 104]] as const).map(([id, x, n, h]) => (
          <g key={id} className={`hello-bob b${n}`}>
            <image href={portraitURL(id)} x={x - (h * PORTRAIT_ASPECT) / 2} y={474 - h} width={h * PORTRAIT_ASPECT} height={h} />
          </g>
        ))}
      </svg>

      <div className="hello-bottom">
        <p className="hello-lead">작고 지친 친구에게 하루 하나, 좋아하는 걸 선물해요.<br />고마운 일 세 가지를 적으면 뭉게구름에 꽃이 소복이 피어나요.</p>
        <button className="ob-primary" onClick={onStart}>시작하기</button>
        <p className="hello-note">이메일만 있으면 1분이면 시작할 수 있어요</p>
      </div>
    </div>
  );
}
