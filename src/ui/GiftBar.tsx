import { useState } from "react";

export type GiftEntry = { day: string; text: string; at: number };

const MAX = 60;

export function GiftBar({ given, onGive }: { given: GiftEntry | null; onGive: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || given) return;
    onGive(t);
    setText("");
  };
  return (
    <form className="gift" onSubmit={submit}>
      <div className="gift-head">
        <span className="gift-title">오늘의 선물</span>
        <span className="gift-rule">{given ? "내일 또 줄 수 있어" : "하루에 딱 하나"}</span>
      </div>
      {given ? (
        <div className="gift-given">
          <span className="gift-box" aria-hidden="true" />
          <span>{given.text}</span>
        </div>
      ) : (
        <div className="gift-row">
          <input
            id="gift-input"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="예) 말차라떼를 주고 싶어"
            aria-label="오늘의 선물"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="send" disabled={!text.trim()} aria-label="선물하기">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </form>
  );
}
