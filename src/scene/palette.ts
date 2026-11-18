import type { Phase } from "../lib/time";

export type Palette = {
  sky: string;
  sky2?: string;  // bottom of the sky gradient (defaults to sky)
  cloud?: string; // the flower cloud
  cloudShade?: string;
  hill: string;   // far ground flat
  ground: string; // near ground flat (under the UI)
  tint: string;   // multiplied onto every cutout except sky and moon
  canopy: string;
  canopyLight: string;
  trunk: string;
  shadow: number; // shadow opacity
};

export const PALETTES: Record<Phase, Palette> = {
  morning: {
    sky: "#D98B5E", hill: "#A2B8D8", ground: "#93AACF", tint: "#FFFFFF",
    canopy: "#F4C83A", canopyLight: "#F8DA74", trunk: "#1E2456", shadow: 0.13,
  },
  day: {
    sky: "#C86539", hill: "#94ABCF", ground: "#87A0C8", tint: "#FFFFFF",
    canopy: "#F2C230", canopyLight: "#F7D768", trunk: "#1E2456", shadow: 0.15,
  },
  evening: {
    sky: "#B4552F", hill: "#8EA6CC", ground: "#829BC3", tint: "#FFF6EC",
    canopy: "#EFB72C", canopyLight: "#F3CB62", trunk: "#1E2456", shadow: 0.16,
  },
  night: {
    sky: "#1E2456", hill: "#47578C", ground: "#3D4C80", tint: "#9AA3CF",
    canopy: "#E9B42E", canopyLight: "#EEC65C", trunk: "#141A44", shadow: 0.25,
  },
};

export type SceneId = "sofa" | "dusk";

/** 초원 위 빨간 소파: cream sky like a painted wall, green meadow, deep red sofa. */
export const MEADOW: Record<Phase, Palette> = {
  morning: {
    sky: "#F4DCD8", sky2: "#F5EEDF", hill: "#A9C27E", ground: "#9AB671", tint: "#FFFFFF",
    canopy: "#F4C83A", canopyLight: "#F8DA74", trunk: "#5A3E2E", shadow: 0.1,
    cloud: "#FFF9F1", cloudShade: "#EEDCE4",
  },
  day: {
    sky: "#D3E3EC", sky2: "#F3EDE0", hill: "#9DBA6E", ground: "#8EAD62", tint: "#FFFFFF",
    canopy: "#F2C230", canopyLight: "#F7D768", trunk: "#5A3E2E", shadow: 0.12,
    cloud: "#FFFBF4", cloudShade: "#E3E1EE",
  },
  evening: {
    sky: "#C8B5D8", sky2: "#F1C3A3", hill: "#8FA673", ground: "#819966", tint: "#FFF2EA",
    canopy: "#EFB72C", canopyLight: "#F3CB62", trunk: "#4E3428", shadow: 0.14,
    cloud: "#FFF1E8", cloudShade: "#DCC6DE",
  },
  night: {
    sky: "#151A45", sky2: "#3A3F7A", hill: "#2F4A45", ground: "#29403D", tint: "#A7AFD8",
    canopy: "#E9B42E", canopyLight: "#EEC65C", trunk: "#2A2030", shadow: 0.2,
    cloud: "#F4F0FF", cloudShade: "#BDB6DE",
  },
};

export function paletteFor(scene: SceneId, phase: Phase): Palette {
  return scene === "sofa" ? MEADOW[phase] : PALETTES[phase];
}
