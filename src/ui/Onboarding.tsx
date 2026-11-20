import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { MIN_PASSWORD, localOnly, signIn, signUp, validEmail } from "../lib/auth";
import { FriendPortrait } from "./Settings";
import { Hello, HelloDesk } from "./Hello";
import { kraftURL } from "./kraft";
import type { LogoFontId } from "./logoFonts";

type Step = "hello" | "email" | "friend";
type Mode = "new" | "back";

/**
 * First launch: say hello → sign up (email + password) or sign back in → pick a friend
 * (new accounts only; a returning account already has one).
 */
export function Onboarding({ onDone, hello = "desk", logoFont = "poppins" }: {
  onDone: (how: { email: string; isNew: boolean; animal?: AnimalId }) => void; hello?: "desk" | "nap" | "mine" | "sketch"; logoFont?: LogoFontId;
}) {
  const [step, setStep] = useState<Step>("hello");
  const [mode, setMode] = useState<Mode>("new");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [friend, setFriend] = useState<AnimalId>("polar");

  const submit = async () => {
    if (!validEmail(email)) return setError("이메일 주소를 다시 확인해 주세요.");
    if (password.length < MIN_PASSWORD) return setError(`비밀번호는 ${MIN_PASSWORD}자 이상으로 해 주세요.`);
    if (mode === "new" && password !== password2) return setError("두 비밀번호가 서로 달라요.");
    setBusy(true);
    setError("");
    const err = mode === "new" ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (err) return setError(err);
    if (mode === "new") setStep("friend");
    else onDone({ email, isNew: false });
  };
  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setPassword2("");
  };

  if (step === "hello") return hello !== "sketch" ? <HelloDesk pose={hello} logoFont={logoFont} onStart={() => setStep("email")} /> : <Hello logoFont={logoFont} onStart={() => setStep("email")} />;

  return (
    <div className="onboard" style={{ backgroundImage: `url(${kraftURL()})` }}>
      <div className="ob-card">
        {step === "email" && (
          <form className="ob-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <div className="ob-modes" role="tablist">
              <button type="button" role="tab" aria-selected={mode === "new"} className={mode === "new" ? "on" : ""} onClick={() => switchMode("new")}>처음이에요</button>
              <button type="button" role="tab" aria-selected={mode === "back"} className={mode === "back" ? "on" : ""} onClick={() => switchMode("back")}>다시 왔어요</button>
            </div>
            <h2>{mode === "new" ? "이메일로 가입해요" : "다시 만나서 반가워요"}</h2>
            <p className="ob-sub">{mode === "new"
              ? "이메일이 아이디가 돼요. 다음에 같은 이메일과 비밀번호로 들어오면 쓴 일기가 그대로 있어요."
              : "가입할 때 쓴 이메일과 비밀번호를 넣어 주세요."}</p>
            <label className="ob-label" htmlFor="ob-email">이메일 (아이디)</label>
            <input id="ob-email" className="ob-input" type="email" inputMode="email" autoComplete="username" placeholder="me@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <label className="ob-label" htmlFor="ob-pw">비밀번호</label>
            <input id="ob-pw" className="ob-input" type="password" autoComplete={mode === "new" ? "new-password" : "current-password"}
              placeholder={`${MIN_PASSWORD}자 이상`} value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === "new" && (
              <>
                <label className="ob-label" htmlFor="ob-pw2">비밀번호 확인</label>
                <input id="ob-pw2" className="ob-input" type="password" autoComplete="new-password" placeholder="한 번 더"
                  value={password2} onChange={(e) => setPassword2(e.target.value)} />
              </>
            )}
            {localOnly && <p className="ob-note">지금은 이 휴대폰에만 저장돼요. 같은 휴대폰에서 다시 로그인하면 쓴 일기가 그대로 있어요.</p>}
            {error && <p className="ob-error" role="alert">{error}</p>}
            <button type="submit" className="ob-primary" disabled={busy || !email.trim() || !password}>
              {busy ? "잠시만요…" : mode === "new" ? "가입하기" : "로그인"}
            </button>
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
