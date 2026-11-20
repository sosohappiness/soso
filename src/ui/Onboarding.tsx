import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { validEmail } from "../lib/auth";
import { FriendPortrait } from "./Settings";
import { Hello, HelloDesk } from "./Hello";
import type { LogoFontId } from "./logoFonts";

type Step = "hello" | "email" | "friend";

/**
 * First launch: say hello → type your email → pick a friend. No code to check for now: the
 * email just names the account on this device.
 */
export function Onboarding({ onDone, hello = "desk", logoFont = "poppins" }: { onDone: (email: string, animal: AnimalId) => void; hello?: "desk" | "nap" | "mine" | "sketch"; logoFont?: LogoFontId }) {
  const [step, setStep] = useState<Step>("hello");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [friend, setFriend] = useState<AnimalId>("polar");

  const next = () => {
    if (!validEmail(email)) {
      setError("이메일 주소를 다시 확인해 주세요.");
      return;
    }
    setError("");
    setStep("friend");
  };

  if (step === "hello") return hello !== "sketch" ? <HelloDesk pose={hello} logoFont={logoFont} onStart={() => setStep("email")} /> : <Hello logoFont={logoFont} onStart={() => setStep("email")} />;

  return (
    <div className="onboard">
      <div className="ob-card">
        {step === "email" && (
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); next(); }}>
            <h2>이메일로 시작해요</h2>
            <p className="ob-sub">비밀번호 없이 이메일만 적으면 바로 시작해요.</p>
            <label className="ob-label" htmlFor="ob-email">이메일</label>
            <input id="ob-email" className="ob-input" type="email" inputMode="email" autoComplete="email" placeholder="me@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            {error && <p className="ob-error" role="alert">{error}</p>}
            <button type="submit" className="ob-primary" disabled={!email.trim()}>다음</button>
          </form>
        )}

        {step === "friend" && (
          <div className="ob-form">
            <h2>함께할 친구를 골라 주세요</h2>
            <p className="ob-sub">나중에 설정에서 바꿀 수 있어요. 다른 친구들은 가끔 놀러 와요.</p>
            <div className="friend-cards">
              {(Object.keys(ANIMALS) as AnimalId[]).map((id) => (
                <button key={id} className={`friend-card${friend === id ? " mine" : ""}`} onClick={() => setFriend(id)} aria-pressed={friend === id}>
                  <FriendPortrait id={id} size={84} />
                  <span className="fc-name">{ANIMALS[id].name}</span>
                  <span className="fc-meta">{ANIMALS[id].species}</span>
                </button>
              ))}
            </div>
            <button className="ob-primary" onClick={() => onDone(email, friend)}>{ANIMALS[friend].name}와 시작하기</button>
          </div>
        )}
      </div>
      <ol className="ob-steps" aria-label="진행 단계">
        {(["hello", "email", "friend"] as Step[]).map((s) => <li key={s} className={s === step ? "on" : ""} />)}
      </ol>
    </div>
  );
}
