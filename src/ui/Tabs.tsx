export type Tab = "home" | "journal" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "journal", label: "감사일기" },
  { id: "history", label: "기록" },
];

export function Tabs({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <button key={t.id} className={t.id === tab ? "on" : ""} onClick={() => onTab(t.id)} aria-current={t.id === tab ? "page" : undefined}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
