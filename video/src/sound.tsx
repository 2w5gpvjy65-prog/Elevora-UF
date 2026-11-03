import React from "react";
import { Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { EASE } from "./theme";
import { BUILD, CTA, CUES, OFFER, SHOP, START, TOTAL, len } from "./timeline";

// Musik (Eleven Music, instrumental) som sänks när rösten pratar och tonas ut i slutet.
const SPEECH = CUES.map((c) => [c.at, c.at + len(c.id)] as const);
const BED = 0.3; // när ingen pratar
const UNDER = 0.1; // under rösten (cirka 9 dB lägre), så att rösten alltid hörs tydligt
const RAMP = 6; // bildrutor för att glida mellan nivåerna

const musicVolume = (f: number) => {
  // Hur nära närmaste replik vi är: 1 = mitt i tal, 0 = långt från tal
  let talk = 0;
  for (const [a, b] of SPEECH) {
    if (f >= a && f <= b) talk = 1;
    else if (f < a) talk = Math.max(talk, interpolate(f, [a - RAMP, a], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    else talk = Math.max(talk, interpolate(f, [b, b + RAMP], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  const level = BED + (UNDER - BED) * talk;
  const fadeOut = interpolate(f, [TOTAL - 40, TOTAL - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.soft });
  return level * fadeOut;
};

// Ljudeffekter (ElevenLabs Sound Effects), lagda på rörelserna i bild.
type Fx = { file: string; at: number; vol: number; frames?: number; name: string };
const FX: Fx[] = [
  { name: "Svep DM -> bygget", file: "svep", at: START.swipe - 2, vol: 0.4 },
  { name: "Markering 1", file: "klick", at: START.build + BUILD.picks[0], vol: 0.16 },
  { name: "Markering 2", file: "klick", at: START.build + BUILD.picks[1], vol: 0.16 },
  { name: "Markering 3", file: "klick", at: START.build + BUILD.picks[2], vol: 0.16 },
  { name: "Kod skrivs", file: "tangenter", at: START.build + BUILD.v5 - 8, vol: 0.18 },
  { name: "Sidan framkallas", file: "skanna", at: START.build + BUILD.reveal + 8, vol: 0.26 },
  { name: "Publicerad", file: "pop", at: START.build + BUILD.reveal + 18, vol: 0.3 },
  { name: "Iris", file: "iris", at: START.show, vol: 0.35 },
  { name: "Ränder till köpet", file: "svep", at: START.shop, vol: 0.25 },
  { name: "Tryck: Lägg i kundvagnen", file: "klick", at: START.shop + SHOP.tapBuy - 1, vol: 0.4 },
  { name: "Swish", file: "klick", at: START.shop + SHOP.words[0], vol: 0.22 },
  { name: "Kort", file: "klick", at: START.shop + SHOP.words[1], vol: 0.22 },
  { name: "Klarna", file: "klick", at: START.shop + SHOP.words[2], vol: 0.22 },
  { name: "Tryck: Betala", file: "klick", at: START.shop + SHOP.tapPay - 1, vol: 0.4 },
  { name: "Betalt", file: "betalt", at: START.shop + SHOP.done, vol: 0.4 },
  { name: "Ny beställning", file: "notis", at: START.shop + SHOP.order, vol: 0.32 },
  { name: "Ränder till priser", file: "svep", at: START.offer, vol: 0.25 },
  { name: "Siffror rullar 1", file: "rakna", at: START.offer + OFFER.row1 - 8, vol: 0.3 },
  { name: "Siffror rullar 2", file: "rakna", at: START.offer + OFFER.row2 - 8, vol: 0.3 },
  { name: "Ridå", file: "rida", at: START.cta, vol: 0.4 },
  { name: "Loggan", file: "logga", at: START.cta + CTA.logo, vol: 0.42 },
  { name: "Adressen skrivs", file: "tangenter", at: START.cta + CTA.url - 7, vol: 0.22, frames: 24 },
];

export const SoundTrack: React.FC = () => (
  <>
    <Sequence name="Musik" durationInFrames={TOTAL} layout="none">
      <Audio src={staticFile("musik.mp3")} volume={musicVolume} />
    </Sequence>
    {FX.map((fx, i) => (
      <Sequence key={i} name={`Ljud: ${fx.name}`} from={fx.at} durationInFrames={fx.frames ?? 45} layout="none">
        <Audio src={staticFile(`sfx/${fx.file}.wav`)} volume={fx.vol} />
      </Sequence>
    ))}
  </>
);
