import { useEffect, useRef, useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { sendCode, testMode, validEmail, verifyCode } from "../lib/auth";
import { FriendPortrait } from "./Settings";
import { Hello, HelloDesk } from "./Hello";

type Step = "hello" | "email" | "code" | "friend";

/**
 * First launch: say hello → sign up with email → enter the 6-digit code → pick a friend.
 */
export function Onboarding({ onDone, hello = "desk" }: { onDone: (email: string, animal: AnimalId) => void; hello?: "desk" | "sketch" }) {
  const [step, setStep] = useState<Step>("hello");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [friend, setFriend] = useState<AnimalId>("polar");
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const send = async () => {
    if (!validEmail(email)) {
      setError("이메일 주소를 다시 확인해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    const err = await sendCode(email);
    setBusy(false);
    if (err) return setError(err);
    setStep("code");
    setResendIn(60);
    window.setTimeout(() => codeRef.current?.focus(), 50);
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    const err = await verifyCode(email, code);
    setBusy(false);
    if (err) return setError(err);
    setStep("friend");
  };

  if (step === "hello") return hello === "desk" ? <HelloDesk onStart={() => setStep("email")} /> : <Hello onStart={() => setStep("email")} />;

  return (
    <div className="onboard">
      <div className="ob-card">
        {step === "email" && (
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <h2>이메일로 시작해요</h2>
            <p className="ob-sub">비밀번호 없이, 이메일로 받은 6자리 코드만 입력하면 돼요. 다른 폰에서도 같은 이메일로 이어서 쓸 수 있어요.</p>
            <label className="ob-label" htmlFor="ob-email">이메일</label>
            <input id="ob-email" className="ob-input" type="email" inputMode="email" autoComplete="email" placeholder="me@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            {error && <p className="ob-error" role="alert">{error}</p>}
            <button type="submit" className="ob-primary" disabled={busy || !email.trim()}>{busy ? "보내는 중…" : "코드 받기"}</button>
          </form>
        )}

        {step === "code" && (
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); void verify(); }}>
            <h2>메일함을 확인해 주세요</h2>
            <p className="ob-sub"><b>{email}</b>로 6자리 코드를 보냈어요.</p>
            <label className="ob-label" htmlFor="ob-code">인증 코드</label>
            <input id="ob-code" ref={codeRef} className="ob-input ob-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            {testMode && <p className="ob-test">테스트 모드: 아직 메일 서버가 연결되지 않아서, 아무 6자리 숫자나 넣으면 돼요.</p>}
            {error && <p className="ob-error" role="alert">{error}</p>}
            <button type="submit" className="ob-primary" disabled={busy || code.length !== 6}>{busy ? "확인하는 중…" : "확인"}</button>
            <div className="ob-links">
              <button type="button" className="ob-link" onClick={() => { setStep("email"); setCode(""); setError(""); }}>이메일 바꾸기</button>
              <button type="button" className="ob-link" disabled={resendIn > 0 || busy} onClick={() => void send()}>
                {resendIn > 0 ? `다시 보내기 (${resendIn}초)` : "코드 다시 보내기"}
              </button>
            </div>
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
        {(["hello", "email", "code", "friend"] as Step[]).map((s) => <li key={s} className={s === step ? "on" : ""} />)}
      </ol>
    </div>
  );
}
