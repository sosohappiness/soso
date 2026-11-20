import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { Panel } from "./JournalViews";

/** A tiny flat portrait of each friend: one-mass body, ears, dot eyes, nose. */
export function FriendPortrait({ id, size = 64 }: { id: AnimalId; size?: number }) {
  const a = ANIMALS[id];
  const body = "M-30 40 C-30 14 -26 -4 -22 -16 C-18 -30 -10 -36 0 -36 C10 -36 18 -30 22 -16 C26 -4 30 14 30 40 Z";
  return (
    <svg width={size} height={size} viewBox="-40 -48 80 90" aria-hidden="true">
      {a.ears === "round" && <><circle cx="-17" cy="-31" r="8" fill={a.ear} stroke="#4a3b33" strokeWidth="2" /><circle cx="17" cy="-31" r="8" fill={a.ear} stroke="#4a3b33" strokeWidth="2" /></>}
      {a.ears === "pointy" && <><path d="M-24 -22 L-23 -44 L-8 -32 Z" fill={a.ear} stroke="#4a3b33" strokeWidth="2" strokeLinejoin="round" /><path d="M24 -22 L23 -44 L8 -32 Z" fill={a.ear} stroke="#4a3b33" strokeWidth="2" strokeLinejoin="round" /></>}
      <path d={body} fill={a.body} stroke="#4a3b33" strokeWidth="2" />
      {a.muzzle && <ellipse cx="0" cy="-3" rx="11" ry="8" fill={a.muzzle} />}
      {a.ears === "floppy" && <><path d="M-17 -30 C-29 -28 -31 -8 -27 4 C-24 10 -18 8 -17 0 C-16 -10 -15 -20 -12 -28 Z" fill={a.ear} /><path d="M17 -30 C29 -28 31 -8 27 4 C24 10 18 8 17 0 C16 -10 15 -20 12 -28 Z" fill={a.ear} /></>}
      <circle cx="-8" cy="-12" r="2.6" fill="#151213" />
      <circle cx="8" cy="-12" r="2.6" fill="#151213" />
      <ellipse cx="0" cy="-4" rx="4" ry="3" fill="#151213" />
      <ellipse cx="-11" cy="38" rx="7" ry="4" fill={a.paw} stroke="#4a3b33" strokeWidth="1.5" />
      <ellipse cx="11" cy="38" rx="7" ry="4" fill={a.paw} stroke="#4a3b33" strokeWidth="1.5" />
    </svg>
  );
}

/** The invite message friends receive, with the app's link. */
function inviteText(link: string) {
  return `소소에서 같이 감사일기 써요! 작은 친구에게 하루 하나 선물하고, 고마운 일을 적으면 구름에 꽃이 피어요.\n${link}`;
}

/** 설정: change the friend (with a gentle check first), invite friends, and the account. */
export function Settings({ animal, email, onAnimal, onSignOut, onClose }: {
  animal: AnimalId; email: string | null; onAnimal: (a: AnimalId) => void; onSignOut: () => void; onClose: () => void;
}) {
  const [asking, setAsking] = useState<AnimalId | null>(null);
  const [inviteNote, setInviteNote] = useState("");
  const link = typeof location !== "undefined" ? location.origin + "/" : "";
  const invite = async () => {
    const text = inviteText(link);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "소소", text, url: link });
        return;
      } catch {
        /* closed the share sheet, fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setInviteNote("초대 메시지를 복사했어요. 카카오톡이나 문자에 붙여넣어 보내 주세요.");
    } catch {
      setInviteNote("이 화면에서는 복사가 막혀 있어요. 아래 링크를 길게 눌러 복사해 주세요.");
    }
  };
  return (
    <Panel title="설정" onClose={onClose}>
      <h3 className="set-title">친구 바꾸기</h3>
      <div className="friend-cards">
        {(Object.keys(ANIMALS) as AnimalId[]).map((id) => {
          const a = ANIMALS[id];
          const mine = id === animal;
          return (
            <button key={id} className={`friend-card${mine ? " mine" : ""}${asking === id ? " asking" : ""}`} onClick={() => !mine && setAsking(id)} aria-pressed={mine}>
              <FriendPortrait id={id} />
              <span className="fc-name">{a.name}</span>
              <span className="fc-meta">{a.species} · {a.drink}</span>
              {mine && <span className="fc-tag">지금 내 친구</span>}
            </button>
          );
        })}
      </div>
      {asking && (
        <div className="set-confirm" role="alertdialog" aria-label="친구 바꾸기 확인">
          <p><b>{ANIMALS[asking].name}</b>와 함께할까요? 감사일기와 구름꽃, 함께한 날은 그대로 이어져요.</p>
          <p className="journal-hint">{ANIMALS[animal].name}는 가끔 놀러 올 거예요.</p>
          <div className="set-confirm-row">
            <button className="export-action" onClick={() => setAsking(null)}>그대로 둘래</button>
            <button className="export-action primary" onClick={() => { onAnimal(asking); setAsking(null); }}>바꾸기</button>
          </div>
        </div>
      )}

      <h3 className="set-title">친구 초대</h3>
      <div className="set-box">
        <p className="journal-hint">소소를 친구에게 소개해 보세요. 링크를 받은 친구도 자기만의 미니미와 구름을 키울 수 있어요.</p>
        <button className="export-action primary" onClick={invite}>친구 초대하기</button>
        {inviteNote && <p className="export-note" role="status">{inviteNote}</p>}
        {inviteNote && <p className="invite-link">{link}</p>}
      </div>

      <h3 className="set-title">계정</h3>
      <div className="set-box">
        <p className="set-account">{email ?? "로그인하지 않았어요"}</p>
        {email && <button className="export-action" onClick={onSignOut}>로그아웃</button>}
      </div>
    </Panel>
  );
}
