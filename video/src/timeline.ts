// Tidslinjen styrs av rösten: varje text dyker upp när den sägs.
// Längderna och ordens starttider kommer från voice.json (skapas av scripts/elevenlabs/),
// så byter ni röst eller manus flyttar sig allt automatiskt.
// Rösten säger mer än det som står på skärmen (en kort pitch), men varje replik hör till en text.
import voice from "./voice.json";

export const FPS = 30;

export type VoiceId = keyof typeof voice;
export const VOICE: Record<VoiceId, { text: string; seconds: number }> = voice;
export const len = (id: VoiceId) => Math.ceil(VOICE[id].seconds * FPS);
// När ett ord börjar i en replik (bildrutor från replikens start)
export const word = (id: VoiceId, w: string, fallback: number) => {
  const words = (voice[id] as unknown as { words?: [string, number][] }).words ?? [];
  const hit = words.find(([x]) => x.toLowerCase().startsWith(w.toLowerCase()));
  return hit ? Math.round(hit[1] * FPS) : fallback;
};
// Minsta tid en text måste synas: 0,3 s per ord, minst 1,2 s (eller repliken om den är längre)
export const hold = (id: VoiceId) =>
  Math.max(len(id), Math.ceil(Math.max(1.2, 0.3 * VOICE[id].text.split(" ").length) * FPS));

// Övergångar (bildrutor)
export const SWIPE = 20; // DM -> webbshop, den enda med motion blur
export const IRIS = 12; // bygget -> Artera i 3D
export const STRIPES = 12; // Artera -> köp, köp -> priser
export const WIPE = 18; // priser -> avslutning

// 1. Krok och DM-kaos
const dmV2 = len("01-krok") + 2 + 8 + 1;
export const DM = {
  v1: 0,
  h1Exit: len("01-krok") + 2,
  h2In: len("01-krok") + 2 + 8,
  v2: dmV2,
  duration: dmV2 + len("02-samma") + 4,
};

// 2. Bygget: design -> kod -> färdig sida
const bV3 = 1;
const bH4 = bV3 + len("03-skaffa") + 2;
const bV4 = bH4 + 1;
const bH5 = bV4 + hold("04-designar") + 4;
const bV5 = bH5 + 1;
const bH6 = bV5 + hold("05-bygger") + 4;
const bV6 = bH6 + 1;
export const BUILD = {
  v3: bV3,
  // Wireframen börjar ritas redan på "Skaffa er egen webbshop", så mobilen inte står tom
  design: bV3 + word("03-skaffa", "skaffa", 40) - 2,
  // Markeringsrutan hoppar under "Vi på Elevora designar den efter er stil"
  picks: [bV4 + 6, bV4 + Math.round(len("04-designar") * 0.4), bV4 + Math.round(len("04-designar") * 0.75)],
  h4: bH4,
  v4: bV4,
  h5: bH5,
  v5: bV5,
  h6: bH6,
  v6: bV6,
  reveal: bV6 + 2,
  duration: bV6 + len("06-klart") + 4 + IRIS,
};

// 3. Artera i 3D: dator och mobil
export const SHOW = {
  hIn: 6,
  v7: 8,
  duration: 8 + len("07-artera") + 4 + STRIPES,
};

// 4. Köpet i mobilen. Mobilen följer orden: scrollar på "hittar fatet",
// trycker på "kundvagnen" och kassan öppnas på "betalar".
const sV8 = 6;
const sV9 = sV8 + len("08-betalar") + 2;
const sTap = sV8 + word("08-betalar", "kundvagnen", 70) + 6;
const sSelect = sV9 + len("09-betalsatt") + 2;
export const SHOP = {
  v8: sV8,
  scrollStart: sV8 + word("08-betalar", "hittar", 24) - 4,
  scrollEnd: Math.min(sV8 + word("08-betalar", "fatet", 34) + 22, sTap - 8),
  tapBuy: sTap,
  sheetIn: sV8 + word("08-betalar", "betalar", 100) - 6,
  h9: sV9 - 1,
  v9: sV9,
  words: [word("09-betalsatt", "swish", 4), word("09-betalsatt", "kort", 22), word("09-betalsatt", "klarna", 40)].map((w) => sV9 + w),
  select: sSelect,
  tapPay: sSelect + 8,
  done: sSelect + 14,
  order: sSelect + 22,
  duration: sSelect + 14 + 40 + STRIPES,
};

// 5. Priser
const oV10 = 6;
const oRow1 = oV10 + len("10-uf") + 1;
const oV11 = oRow1 + 1;
const oRow2 = oV11 + len("11-webbshop") + 1;
const oV12 = oRow2 + 1;
const oFoot = oV12 + len("12-hemsida") + 1;
const oV13 = oFoot + 1;
export const OFFER = {
  hIn: 4,
  v10: oV10,
  row1: oRow1,
  v11: oV11,
  row2: oRow2,
  v12: oV12,
  foot: oFoot,
  v13: oV13,
  duration: oV13 + len("13-avgift") + 8 + WIPE,
};

// 6. Avslutning
const cV14 = 18;
const cUrl = cV14 + len("14-skiss") + 1;
export const CTA = {
  logo: 4,
  hIn: 16,
  v14: cV14,
  url: cUrl,
  v15: cUrl + 2,
  duration: cUrl + 2 + len("15-adress") + 40,
};

// Var varje scen börjar i hela videon
const sBuild = DM.duration + SWIPE;
const sShow = sBuild + BUILD.duration - IRIS;
const sShop = sShow + SHOW.duration - STRIPES;
const sOffer = sShop + SHOP.duration - STRIPES;
const sCta = sOffer + OFFER.duration - WIPE;
export const START = { dm: 0, swipe: DM.duration, build: sBuild, show: sShow, shop: sShop, offer: sOffer, cta: sCta };
export const TOTAL = sCta + CTA.duration;

// Rösten i hela videon
export const CUES: { id: VoiceId; at: number }[] = [
  { id: "01-krok", at: DM.v1 },
  { id: "02-samma", at: DM.v2 },
  { id: "03-skaffa", at: sBuild + BUILD.v3 },
  { id: "04-designar", at: sBuild + BUILD.v4 },
  { id: "05-bygger", at: sBuild + BUILD.v5 },
  { id: "06-klart", at: sBuild + BUILD.v6 },
  { id: "07-artera", at: sShow + SHOW.v7 },
  { id: "08-betalar", at: sShop + SHOP.v8 },
  { id: "09-betalsatt", at: sShop + SHOP.v9 },
  { id: "10-uf", at: sOffer + OFFER.v10 },
  { id: "11-webbshop", at: sOffer + OFFER.v11 },
  { id: "12-hemsida", at: sOffer + OFFER.v12 },
  { id: "13-avgift", at: sOffer + OFFER.v13 },
  { id: "14-skiss", at: sCta + CTA.v14 },
  { id: "15-adress", at: sCta + CTA.v15 },
];
