import { Easing, useVideoConfig } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";

// Samma färger som elevorauf.se
export const C = {
  bg: "#f2ede6",
  stone: "#e7e2dc",
  surface: "#f9f6f1",
  card: "#fbf9f6",
  ink: "#1d1c1a",
  muted: "#6d675f",
  line: "#d8d0c3",
  accent: "#1b2a40",
  navy: "#18212d",
  navyAccent: "#a9bdd8",
  navyMuted: "#a3abb8",
};

export const geist = loadGeist("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});
export const serif = loadSerif("normal", {
  weights: ["500"],
  subsets: ["latin"],
});
export const newsreader = loadNewsreader("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const F = {
  sans: geist.fontFamily,
  serif: serif.fontFamily,
  shop: newsreader.fontFamily,
};

// Egna kurvor: inget rör sig linjärt.
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // snabb start, mjuk landning
  in: Easing.bezier(0.7, 0, 0.84, 0), // tar fart ut ur bild
  inOut: Easing.bezier(0.83, 0, 0.17, 1), // ridån till avslutningen
  swipe: Easing.bezier(0.65, 0, 0.35, 1), // den stora svepningen
  soft: Easing.bezier(0.33, 1, 0.68, 1), // lugna rörelser
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type Fmt = "reel" | "feed" | "wide";

export const useFmt = (): Fmt => {
  const { width, height } = useVideoConfig();
  if (width > height) return "wide";
  return height / width > 1.5 ? "reel" : "feed";
};

// Säkra ytor. Reel: håll undan från TikTok/Instagrams knappar till höger,
// texten längst ner och flikarna längst upp.
export const SPEC = {
  reel: {
    safe: { l: 120, r: 160, t: 270, b: 440 },
    h1: 96,
    sup: 44,
  },
  feed: {
    safe: { l: 96, r: 96, t: 96, b: 96 },
    h1: 84,
    sup: 40,
  },
  wide: {
    safe: { l: 150, r: 150, t: 110, b: 110 },
    h1: 112,
    sup: 40,
  },
} as const;
