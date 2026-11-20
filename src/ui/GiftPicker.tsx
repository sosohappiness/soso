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
          <ellipse cx="16" cy="21" rx="13" ry="5" fill="#F6F2EA" stroke="#4a3b33" strokeWidth="1.2" />
          <ellipse cx="16" cy="20" rx="8" ry="2.6" fill="#C8442E" />
          <rect x="9" y="15.5" width="7" height="3.2" rx="1.6" fill="#E86A45" transform="rotate(-15 12 17)" />
          <rect x="16" y="16" width="7" height="3.2" rx="1.6" fill="#E86A45" transform="rotate(12 19 17.5)" />
          <path d="M13 12c-1-1.5 1-2.5 0-4M19 12c-1-1.5 1-2.5 0-4" stroke="#B8AFA3" strokeWidth="1.2" fill="none" strokeLinecap="round" />
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
    case "song":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="22" height="15" rx="3" fill="#B07A4F" stroke="#4a3b33" strokeWidth="1.2" />
          <path d="M11 11c0-3 10-3 10 0" fill="none" stroke="#4a3b33" strokeWidth="1.6" />
          <circle cx="11.5" cy="19" r="3.6" fill="#3B2B2E" />
          <circle cx="20.5" cy="19" r="3.6" fill="#3B2B2E" />
          <circle cx="11.5" cy="19" r="1.4" fill="#8B7B75" />
          <circle cx="20.5" cy="19" r="1.4" fill="#8B7B75" />
          <path d="M25 4v6l3-1" stroke="#6B5CA5" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <ellipse cx="24" cy="10.4" rx="1.6" ry="1.2" fill="#6B5CA5" />
        </svg>
      );
  }
}

/**
 * "선물 주기": tap it and the gift emoticons pop out; tap one and it's on its way.
 * One gift a day; once given the button says so until tomorrow.
 */
export function GiftPicker({ given, onGive, busy }: { given: GiftEntry | null; onGive: (id: GiftId) => void; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const done = !!given;
  return (
    <div className="gift-picker">
      {open && !done && (
        <>
          <button className="gift-scrim" aria-label="닫기" onClick={() => setOpen(false)} />
          <div className="gift-pop" role="menu" aria-label="선물 고르기">
            {GIFT_ORDER.map((id, i) => (
              <button
                key={id}
                role="menuitem"
                className="gift-emo"
                style={{ "--i": i } as React.CSSProperties}
                onClick={() => {
                  setOpen(false);
                  onGive(id);
                }}
              >
                <span className="ge-icon"><GiftIcon id={id} size={40} /></span>
                <span className="ge-label">{GIFTS[id].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <button className={`gift-btn${done ? " done" : ""}${open ? " open" : ""}`} disabled={done} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {done && given?.item ? <GiftIcon id={given.item} size={24} /> : <span className="gift-box" aria-hidden="true" />}
        <span>{busy ? "선물을 전하는 중…" : done ? "오늘 선물 완료 · 내일 또 줄 수 있어" : open ? "무엇을 줄까?" : "선물 주기"}</span>
      </button>
    </div>
  );
}
