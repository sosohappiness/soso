// Free gift reader: turns "말차라떼를 주고 싶어" into the data an animation template needs.
// It returns the same shape an LLM would (see plan), so Claude can replace it later.
import { pick } from "./lines";

export type GiftItem = "matcha_latte" | "generic";

export type ParsedGift = {
  category: "drink" | "food" | "activity" | "care" | "object" | "unknown";
  item: GiftItem;
  label: string;   // name for the tag and the collection card
  helper: "polar_apron";
  reaction: "cozy" | "happy" | "delighted";
  line: string;    // what Minimi says while enjoying it
  caption: string; // the card at the end
};

type Entry = { words: RegExp; category: ParsedGift["category"]; item: GiftItem; label: string; reaction: ParsedGift["reaction"]; lines: string[]; caption?: string };

// Seeded from docs/gifts.md. Only the matcha latte has its own animation so far;
// the rest are recognised (for the label and the line) and arrive as a gift box.
const DICTIONARY: Entry[] = [
  { words: /말차|녹차\s*라떼|matcha/i, category: "drink", item: "matcha_latte", label: "말차라떼", reaction: "cozy",
    lines: ["따뜻하다… 몸이 사르르 녹아", "음~ 쌉싸름하고 달콤해", "말차라떼 최고야…"], caption: "따뜻한 말차라떼" },
  { words: /커피|아메리카노|라떼|카페/i, category: "drink", item: "generic", label: "커피", reaction: "cozy",
    lines: ["커피 향이 좋다~", "한 모금 마시니 눈이 번쩍!"] },
  { words: /떡볶이/, category: "food", item: "generic", label: "떡볶이", reaction: "delighted",
    lines: ["매콤달콤! 너무 맛있어", "후후 불면서 먹을게!"] },
  { words: /파스타|스파게티/, category: "food", item: "generic", label: "파스타", reaction: "happy",
    lines: ["후루룩~ 파스타 맛있다", "오늘은 파스타 데이야!"] },
  { words: /목욕|반신욕|입욕/, category: "care", item: "generic", label: "따뜻한 목욕", reaction: "cozy",
    lines: ["으아~ 몸이 노곤노곤해", "따뜻한 물에 풍덩!"] },
  { words: /팩|마스크/, category: "care", item: "generic", label: "얼굴 팩", reaction: "happy",
    lines: ["피부가 촉촉해졌어!", "팩 하고 뽀송뽀송~"] },
  { words: /산책|걷기|걸어/, category: "activity", item: "generic", label: "산책", reaction: "happy",
    lines: ["바람이 시원하다~", "같이 걸으니까 좋다"] },
  { words: /노래|음악|플레이리스트/, category: "activity", item: "generic", label: "노래", reaction: "delighted",
    lines: ["랄라~ 신난다!", "이 노래 좋아!"] },
  { words: /소파|늘어지|뒹굴|낮잠/, category: "activity", item: "generic", label: "소파에 늘어지기", reaction: "cozy",
    lines: ["으아~ 이대로 녹아버릴래", "아무것도 안 하는 게 최고야"] },
];

/** "말차라떼를 주고 싶어" → "말차라떼". Strips the polite giving phrase around the thing itself. */
export function giftName(text: string): string {
  const t = text.trim().replace(/[.!~?…]+$/g, "");
  const m = /^(.*?)(?:\s*(?:을|를))?\s*(?:주고\s*싶어|줄게|주고\s*싶다|선물할게|선물하고\s*싶어|해\s*주고\s*싶어|해\s*줄게)$/.exec(t);
  const name = (m ? m[1] : t).trim();
  return name.length > 0 && name.length <= 20 ? name : t.slice(0, 20);
}

export function readGift(text: string): ParsedGift {
  const hit = DICTIONARY.find((d) => d.words.test(text));
  if (hit) {
    return {
      category: hit.category, item: hit.item, label: hit.label, helper: "polar_apron", reaction: hit.reaction,
      line: pick(hit.lines), caption: hit.caption ?? hit.label,
    };
  }
  const label = giftName(text);
  return {
    category: "unknown", item: "generic", label, helper: "polar_apron", reaction: "happy",
    line: pick(["우와, 이게 뭐야? 너무 좋아!", "선물이다! 소중히 간직할게", "열어 봐도 돼? 두근두근"]),
    caption: label,
  };
}

/** How long the whole gift scene lasts, and its beats, in seconds. */
export const GIFT_T = { walkIn: 1.8, give: 2.6, drink: 5.4, leave: 7.0 };
