import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { MIN_PASSWORD, enter, localOnly, validEmail } from "../lib/auth";
import { FriendPortrait } from "./Settings";
import { Hello, HelloDesk } from "./Hello";
import { kraftURL } from "./kraft";
import type { LogoFontId } from "./logoFonts";

type Step = "hello" | "email" | "friend";

/**
 * First launch: say hello → email + password (signs in, or makes the account the first time)
 * → pick a friend (new accounts only; a returning account already has one).
 */
export function Onboarding({ onDone, hello = "desk", logoFont = "poppins" }: {
  onDone: (how: { email: string; isNew: boolean; animal?: AnimalId }) => void; hello?: "desk" | "nap" | "mine" | "sketch"; logoFont?: LogoFontId;
}) {
  const [step, setStep] = useState<Step>("hello");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [friend, setFriend] = useState<AnimalId>("polar");

  const submit = async () => {
    if (!validEmail(email)) return setError("이메일 주소를 다시 확인해 주세요.");
    if (password.length < MIN_PASSWORD) return setError(`비밀번호는 ${MIN_PASSWORD}자 이상으로 해 주세요.`);
    setBusy(true);
    setError("");
    const r = await enter(email, password);
    setBusy(false);
    if ("error" in r) return setError(r.error);
    if (r.isNew) setStep("friend");
    else onDone({ email, isNew: false });
  };

  if (step === "hello") return hello !== "sketch" ? <HelloDesk pose={hello} logoFont={logoFont} onStart={() => setStep("email")} /> : <Hello logoFont={logoFont} onStart={() => setStep("email")} />;

  return (
    <div className="onboard" style={{ backgroundImage: `url(${kraftURL()})` }}>
      <div className="ob-card">
        {step === "email" && (
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <h2>이메일로 시작해요</h2>
            <p className="ob-sub">처음이면 바로 가입되고, 전에 가입했다면 바로 들어가요. 같은 이메일과 비밀번호로 들어오면 쓴 일기가 그대로 있어요.</p>
            <label className="ob-label" htmlFor="ob-email">이메일 (아이디)</label>
            <input id="ob-email" className="ob-input" type="email" inputMode="email" autoComplete="username" placeholder="me@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <label className="ob-label" htmlFor="ob-pw">비밀번호</label>
            <input id="ob-pw" className="ob-input" type="password" autoComplete="current-password"
              placeholder={`${MIN_PASSWORD}자 이상`} value={password} onChange={(e) => setPassword(e.target.value)} />
            {localOnly && <p className="ob-note">지금은 이 휴대폰에만 저장돼요. 같은 휴대폰에서 다시 들어오면 쓴 일기가 그대로 있어요.</p>}
            {error && <p className="ob-error" role="alert">{error}</p>}
            <button type="submit" className="ob-primary" disabled={busy || !email.trim() || !password}>{busy ? "잠시만요…" : "들어가기"}</button>
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
            <button className="ob-primary" onClick={() => onDone({ email, isNew: true, animal: friend })}>{ANIMALS[friend].name}와 시작하기</button>
          </div>
        )}
      </div>
      <ol className="ob-steps" aria-label="진행 단계">
        {(["hello", "email", "friend"] as Step[]).map((s) => <li key={s} className={s === step ? "on" : ""} />)}
      </ol>
    </div>
  );
}
