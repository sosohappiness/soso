import { useState } from "react";
import { ANIMALS, type AnimalId } from "../scene/animals";
import { PORTRAIT_ASPECT, portraitURL } from "../scene/portrait";
import { Panel } from "./JournalViews";

/** The friend exactly as on the home screen (same painted body, ears, eyes, nose, paws). */
export function FriendPortrait({ id, size = 64 }: { id: AnimalId; size?: number }) {
  return <img className="friend-portrait" src={portraitURL(id)} width={Math.round(size * PORTRAIT_ASPECT)} height={size} alt="" draggable={false} />;
}

/** The invite message friends receive, with the app's link. */
function inviteText(link: string) {
  return `함께 더 행복해져요. 감사일기를 쓰면 뭉게구름에 꽃이 소복소복 피어나요.\n${link}`;
}

/** 설정: change the friend (with a gentle check first), invite friends, and the account. */
export function Settings({ animal, email, onAnimal, onSignOut, onClose }: {
  animal: AnimalId; email: string | null; onAnimal: (a: AnimalId) => void; onSignOut: () => void; onClose: () => void;
}) {
  const [asking, setAsking] = useState<AnimalId | null>(null);
  const [inviteNote, setInviteNote] = useState("");
  // the link friends open: set VITE_INVITE_URL when the app lives somewhere other than where it runs
  // (e.g. shared as a claude.ai link); otherwise this page's own address
  const link = (import.meta.env.VITE_INVITE_URL as string | undefined) || (typeof location !== "undefined" ? location.origin + "/" : "");
  const invite = async () => {
    const text = inviteText(link);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "So So", text, url: link });
        return;
      } catch {
        /* closed the share sheet, fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setInviteNote("초대 메시지를 복사했어요. 카카오톡이나 문자에 붙여넣어 보내 주세요.");
    } catch {
      setInviteNote("이 화면에서는 자동 복사가 막혀 있어요. 아래 링크를 길게 눌러 복사해서 보내 주세요.");
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
              <FriendPortrait id={id} size={84} />
              <span className="fc-name">{a.name}</span>
              <span className="fc-meta">{a.species}</span>
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
        <p className="journal-hint">So So를 친구에게 소개해 보세요. 링크를 받은 친구도 자기만의 미니미와 구름을 키울 수 있어요.</p>
        <button className="export-action primary" onClick={invite}>친구 초대하기</button>
        {inviteNote && <p className="export-note" role="status">{inviteNote}</p>}
        <input className="invite-link" readOnly value={link} aria-label="초대 링크" onFocus={(e) => e.currentTarget.select()} onClick={(e) => e.currentTarget.select()} />
      </div>

      <h3 className="set-title">계정</h3>
      <div className="set-box">
        <p className="set-account">{email ?? "로그인하지 않았어요"}</p>
        {email && <button className="export-action" onClick={onSignOut}>로그아웃</button>}
      </div>
    </Panel>
  );
}
