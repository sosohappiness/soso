/** Placeholder for the gratitude journal (week 3). */
export function Sheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <section className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="닫기">×</button>
        <h2>감사일기</h2>
        <p>오늘 고마웠던 일 세 가지를 적으면 구름에 소복이 꽃이 피어나요.</p>
        <ol className="lines-demo">
          <li>따뜻한 햇살</li>
          <li>친구의 안부 문자</li>
          <li>맛있는 저녁</li>
        </ol>
        <p className="soon">곧 열려요. 구름이 기다리고 있어!</p>
      </section>
    </div>
  );
}
