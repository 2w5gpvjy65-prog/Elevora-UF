// Tidslinjen styrs av rösten: varje text dyker upp när den sägs.
// Längderna kommer från voice.json (skapas av scripts/rost/), så byter ni
// till en egen inspelning flyttar sig allt automatiskt.
import voice from "./voice.json";

export const FPS = 30;

export type VoiceId = keyof typeof voice;
export const VOICE: Record<VoiceId, { text: string; seconds: number }> = voice;
export const len = (id: VoiceId) => Math.ceil(VOICE[id].seconds * FPS);

export const SWIPE = 26; // svepet DM -> webbshop (motion blur)
export const FADE = 14; // webbshop -> priser
export const WIPE = 18; // priser -> avslutning

// 1. Krok och DM-kaos
const dmV1 = 0;
const dmH1Exit = dmV1 + len("01-krok") + 2;
const dmH2In = dmH1Exit + 10;
const dmV2 = dmH2In + 2;
export const DM = {
  v1: dmV1,
  h1Exit: dmH1Exit,
  h2In: dmH2In,
  v2: dmV2,
  duration: dmV2 + len("02-samma") + 8,
};

// 2. Webbshop (Arteras riktiga sida i mobilen)
const shV3 = 2;
const shSubIn = shV3 + len("03-skaffa") + 1;
const shV4 = shSubIn + 2;
const shTapBuy = shV4 + len("04-artera") - 16;
const shH1Exit = shV4 + len("04-artera") + 2;
const shH2In = shH1Exit + 10;
const shV5 = shH2In + 2;
const shTapPay = shV5 + 36;
const shDone = shTapPay + 6;
export const SHOP = {
  v3: shV3,
  subIn: shSubIn,
  v4: shV4,
  scrollStart: shV4 + 4,
  scrollEnd: shV4 + 52,
  tapBuy: shTapBuy,
  sheetIn: shTapBuy + 4,
  h1Exit: shH1Exit,
  h2In: shH2In,
  v5: shV5,
  select: shV5 + 12,
  tapPay: shTapPay,
  done: shDone,
  duration: Math.max(shV5 + len("05-betalar"), shDone + 28) + FADE + 2,
};

// 3. Priser
const ofV6 = 6;
const ofLabel = ofV6 + len("06-klart") + 2;
const ofV7a = ofLabel + 2;
const ofRow1 = ofV7a + len("07a-uf") + 1;
const ofV7b = ofRow1 + 2;
const ofRow2 = ofV7b + len("07b-webbshop") + 1;
const ofV7c = ofRow2 + 2;
const ofFoot = ofV7c + len("07c-hemsida") + 1;
const ofV8 = ofFoot + 2;
export const OFFER = {
  hIn: 4,
  v6: ofV6,
  label: ofLabel,
  v7a: ofV7a,
  row1: ofRow1,
  v7b: ofV7b,
  row2: ofRow2,
  v7c: ofV7c,
  foot: ofFoot,
  v8: ofV8,
  duration: ofV8 + len("08-avgift") + 10 + WIPE,
};

// 4. Avslutning
const ctV9 = 18;
const ctPill = ctV9 + len("09-skiss") + 2;
const ctV10 = ctPill + 2;
export const CTA = {
  hIn: 16,
  v9: ctV9,
  pill: ctPill,
  v10: ctV10,
  duration: ctV10 + len("10-adress") + 36,
};

// Var varje scen börjar i hela videon
export const START = {
  dm: 0,
  swipe: DM.duration,
  shop: DM.duration + SWIPE,
  offer: DM.duration + SWIPE + SHOP.duration - FADE,
  cta: DM.duration + SWIPE + SHOP.duration - FADE + OFFER.duration - WIPE,
};
export const TOTAL = START.cta + CTA.duration;

// Rösten i hela videon
export const CUES: { id: VoiceId; at: number }[] = [
  { id: "01-krok", at: START.dm + DM.v1 },
  { id: "02-samma", at: START.dm + DM.v2 },
  { id: "03-skaffa", at: START.shop + SHOP.v3 },
  { id: "04-artera", at: START.shop + SHOP.v4 },
  { id: "05-betalar", at: START.shop + SHOP.v5 },
  { id: "06-klart", at: START.offer + OFFER.v6 },
  { id: "07a-uf", at: START.offer + OFFER.v7a },
  { id: "07b-webbshop", at: START.offer + OFFER.v7b },
  { id: "07c-hemsida", at: START.offer + OFFER.v7c },
  { id: "08-avgift", at: START.offer + OFFER.v8 },
  { id: "09-skiss", at: START.cta + CTA.v9 },
  { id: "10-adress", at: START.cta + CTA.v10 },
];
