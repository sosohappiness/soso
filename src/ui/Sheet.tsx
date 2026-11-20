import type { GiftEntry } from "./GiftBar";
import type { Tab } from "./Tabs";

/** Week 1 placeholder sheets. The journal arrives in week 3; gifts already list what you gave. */
export function Sheet({ tab, gifts, animalName, onClose }: { tab: Tab; gifts: GiftEntry[]; animalName: string; onClose: () => void }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <section className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="닫기">×</button>
        {tab === "journal" ? (
          <>
            <h2>감사일기</h2>
            <p>오늘 고마웠던 일 세 가지를 적으면 나무에 잎이 돋아나요.</p>
            <ol className="lines-demo">
              <li>따뜻한 햇살</li>
              <li>친구의 안부 문자</li>
              <li>맛있는 저녁</li>
            </ol>
            <p className="soon">곧 열려요. 나무가 기다리고 있어!</p>
          </>
        ) : (
          <>
            <h2>선물기록</h2>
            {gifts.length === 0 ? (
              <p>아직 {animalName}에게 준 선물이 없어요. 홈에서 오늘의 선물을 건네 보세요.</p>
            ) : (
              <ul className="gift-list">
                {gifts.map((g) => (
                  <li key={g.day}>
                    <span className="gift-box" aria-hidden="true" />
                    <span className="g-text">{g.caption ?? g.label ?? g.text}</span>
                    <span className="g-day">{g.day.slice(5).replace("-", ".")}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
