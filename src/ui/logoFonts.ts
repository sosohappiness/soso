// Font options for the "So So" logo on the first screen (chosen in the preview's dev bar).
export type LogoFontId = "poppins" | "fredoka" | "bagel" | "courier" | "caveat" | "shrikhand";

export const LOGO_FONTS: Record<LogoFontId, { label: string; family: string; css: string; weight: number; spacing: string; scale: number }> = {
  poppins: { label: "Poppins", family: "'Poppins'", css: "Poppins:wght@800", weight: 800, spacing: "-0.045em", scale: 1 },
  fredoka: { label: "Fredoka", family: "'Fredoka'", css: "Fredoka:wght@700", weight: 700, spacing: "-0.02em", scale: 1.05 },
  bagel: { label: "Bagel Fat One", family: "'Bagel Fat One'", css: "Bagel+Fat+One", weight: 400, spacing: "-0.01em", scale: 1 },
  courier: { label: "Courier Prime", family: "'Courier Prime'", css: "Courier+Prime:wght@700", weight: 700, spacing: "-0.02em", scale: 0.95 },
  caveat: { label: "Caveat Brush", family: "'Caveat Brush'", css: "Caveat+Brush", weight: 400, spacing: "0", scale: 1.15 },
  shrikhand: { label: "Shrikhand", family: "'Shrikhand'", css: "Shrikhand", weight: 400, spacing: "0", scale: 0.95 },
};

export const LOGO_ORDER: LogoFontId[] = ["poppins", "fredoka", "bagel", "courier", "caveat", "shrikhand"];

/** Load the font's stylesheet once and return the inline style for the logo. */
export function logoStyle(id: LogoFontId): React.CSSProperties {
  const f = LOGO_FONTS[id];
  const linkId = `logo-font-${id}`;
  if (typeof document !== "undefined" && !document.getElementById(linkId)) {
    const l = document.createElement("link");
    l.id = linkId;
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`;
    document.head.appendChild(l);
  }
  return {
    fontFamily: `${f.family}, "Poppins", "Jua", sans-serif`,
    fontWeight: f.weight,
    letterSpacing: f.spacing,
    ["--logo-scale" as string]: String(f.scale),
  } as React.CSSProperties;
}
