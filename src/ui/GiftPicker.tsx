import { useState } from "react";
import { GIFTS, GIFT_ORDER, type GiftId } from "../lib/gifts";

export type GiftEntry = { day: string; text: string; at: number; label?: string; caption?: string; item?: GiftId };

/** Small flat icons for the five gifts. */
export function GiftIcon({ id, size = 30 }: { id: GiftId; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 32 32", "aria-hidden": true } as const;
  switch (id) {
    case "matcha":
      return (
        <svg {...common}>
          <ellipse cx="15" cy="26" rx="11" ry="2.4" fill="#F6F2EA" stroke="#4a3b33" strokeWidth="1.2" />
          <path d="M8 11h14l-2 12.5c-.3 1.4-1.6 2-3 2h-4c-1.4 0-2.7-.6-3-2z" fill="#F6F2EA" stroke="#4a3b33" strokeWidth="1.2" />
          <path d="M22 13.5c4 0 4 6 0 6" fill="none" stroke="#4a3b33" strokeWidth="1.4" />
          <ellipse cx="15" cy="11" rx="7" ry="1.8" fill="#9DB86A" />
          <path d="M13 8c-1-1.5 1-2.5 0-4M17 8c-1-1.5 1-2.5 0-4" stroke="#B8AFA3" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "tteok":
      return (
        <svg {...common}>
          <path d="M5 15h22c0 6-4.5 11-11 11S5 21 5 15z" fill="#F6F2EA" stroke="#4a3b33" strokeWidth="1.2" />
          <ellipse cx="16" cy="15" rx="11" ry="2.6" fill="#C8442E" />
          <rect x="9" y="11" width="7" height="3.2" rx="1.6" fill="#E86A45" transform="rotate(-15 12 12)" />
          <rect x="16" y="11.5" width="7" height="3.2" rx="1.6" fill="#E86A45" transform="rotate(12 19 13)" />
        </svg>
      );
    case "bath":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" fill="#fff" stroke="#9AB6CF" strokeWidth="1.2" />
          <circle cx="15" cy="6" r="2.2" fill="#fff" stroke="#9AB6CF" strokeWidth="1.2" />
          <circle cx="21" cy="9.5" r="2.6" fill="#fff" stroke="#9AB6CF" strokeWidth="1.2" />
          <path d="M3 15h26v2c0 5-3.5 8-8 8H11c-4.5 0-8-3-8-8z" fill="#F4B6C2" stroke="#4a3b33" strokeWidth="1.2" />
          <path d="M7 25l-1.5 3M25 25l1.5 3" stroke="#4a3b33" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "pack":
      return (
        <svg {...common}>
          <ellipse cx="16" cy="17" rx="11" ry="9" fill="#CFE3B4" stroke="#4a3b33" strokeWidth="1.2" />
          <circle cx="12" cy="15.5" r="1.6" fill="#151213" />
          <circle cx="20" cy="15.5" r="1.6" fill="#151213" />
          <ellipse cx="16" cy="20" rx="2" ry="1.4" fill="#151213" />
          <path d="M25 5l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#F6D46A" />
        </svg>
      );
    case "song":
      return (
        <svg {...common}>
          <path d="M7 19c0-7 4-12 9-12s9 5 9 12" fill="none" stroke="#E07A5F" strokeWidth="2.6" strokeLinecap="round" />
          <rect x="4" y="17" width="6" height="9" rx="3" fill="#C8604A" />
          <rect x="22" y="17" width="6" height="9" rx="3" fill="#C8604A" />
          <path d="M15 22v-7l5-1.5" stroke="#6B5CA5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="13.6" cy="22.4" rx="2" ry="1.5" fill="#6B5CA5" />
        </svg>
      );
  }
}

/**
 * Five gifts to choose from. Tap once to pick, tap the same one again to give it.
 * One gift a day, so the second tap keeps a stray touch from using it up.
 */
export function GiftPicker({ given, onGive, busy }: { given: GiftEntry | null; onGive: (id: GiftId) => void; busy: boolean }) {
  const [picked, setPicked] = useState<GiftId | null>(null);
  const hint = given
    ? "내일 또 줄 수 있어"
    : picked
      ? "한 번 더 누르면 선물해요"
      : "하루에 딱 하나";
  return (
    <section className="gift" aria-label="오늘의 선물">
      <div className="gift-head">
        <span className="gift-title">오늘의 선물</span>
        <span className="gift-rule">{hint}</span>
      </div>
      {given ? (
        <div className="gift-given">
          {given.item ? <GiftIcon id={given.item} size={26} /> : <span className="gift-box" aria-hidden="true" />}
          <span>{busy ? "선물을 전하는 중…" : `오늘은 ${given.caption ?? given.label ?? given.text}`}</span>
        </div>
      ) : (
        <div className="gift-choices" role="group">
          {GIFT_ORDER.map((id) => (
            <button
              key={id}
              className={`gift-choice${picked === id ? " on" : ""}`}
              aria-pressed={picked === id}
              onClick={() => {
                if (picked === id) {
                  onGive(id);
                  setPicked(null);
                } else setPicked(id);
              }}
            >
              <span className="gc-icon"><GiftIcon id={id} /></span>
              <span className="gc-label">{GIFTS[id].label}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
