// Korean font candidates from Google Fonts, for trying on the home screen (dev bar).
export type FontId = "noto" | "plex" | "gowun" | "nanum" | "jua";

export const FONTS: Record<FontId, { label: string; family: string; css: string }> = {
  noto: { label: "Noto Sans", family: "'Noto Sans KR'", css: "Noto+Sans+KR:wght@400;500;700" },
  plex: { label: "IBM Plex", family: "'IBM Plex Sans KR'", css: "IBM+Plex+Sans+KR:wght@400;500;700" },
  gowun: { label: "고운돋움", family: "'Gowun Dodum'", css: "Gowun+Dodum" },
  nanum: { label: "나눔고딕", family: "'Nanum Gothic'", css: "Nanum+Gothic:wght@400;700" },
  jua: { label: "주아", family: "'Jua'", css: "Jua" },
};

/** Load a font's stylesheet once, then return the CSS font stack to use. */
export function useFontStack(id: FontId): string {
  const f = FONTS[id];
  const linkId = `font-${id}`;
  if (typeof document !== "undefined" && !document.getElementById(linkId)) {
    const l = document.createElement("link");
    l.id = linkId;
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`;
    document.head.appendChild(l);
  }
  return `${f.family}, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`;
}
