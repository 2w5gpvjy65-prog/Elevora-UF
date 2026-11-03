import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { C, EASE, geist, mono, newsreader, serif } from "./theme";
import { BUILD, CTA, CUES, DM, IRIS, OFFER, SHOP, SHOW, STRIPES, SWIPE, VOICE, WIPE, len } from "./timeline";
import { iris, stripes, wipeUp } from "./transitions";
import { DmScene } from "./scenes/DmScene";
import { SwipeToShop } from "./scenes/SwipeToShop";
import { BuildScene } from "./scenes/BuildScene";
import { ShowcaseScene } from "./scenes/ShowcaseScene";
import { ShopScene } from "./scenes/ShopScene";
import { OfferScene } from "./scenes/OfferScene";
import { CtaScene } from "./scenes/CtaScene";

// Ingen bildruta renderas innan alla typsnitt är laddade.
const useFontsReady = () => {
  const [handle] = useState(() => delayRender("Väntar på typsnitt"));
  useEffect(() => {
    Promise.all([geist.waitUntilDone(), serif.waitUntilDone(), newsreader.waitUntilDone(), mono.waitUntilDone()])
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);
};

// Rösten läser texten i samma stund som den syns. Filerna ligger i public/voice/.
const VoiceTrack: React.FC = () => (
  <>
    {CUES.map((c) => (
      <Sequence key={c.id} name={`Röst: ${VOICE[c.id].text}`} from={c.at} durationInFrames={len(c.id) + 4} layout="none">
        <Audio src={staticFile(`voice/${c.id}.wav`)} />
      </Sequence>
    ))}
  </>
);

export const ElevoraAd: React.FC = () => {
  useFontsReady();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Krok: DM" durationInFrames={DM.duration}>
          <DmScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Svep (motion blur)" durationInFrames={SWIPE}>
          <SwipeToShop />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Design, kod, klar" durationInFrames={BUILD.duration}>
          <BuildScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: IRIS, easing: EASE.inOut })} />
        <TransitionSeries.Sequence name="Artera i 3D" durationInFrames={SHOW.duration}>
          <ShowcaseScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={stripes()} timing={linearTiming({ durationInFrames: STRIPES, easing: EASE.inOut })} />
        <TransitionSeries.Sequence name="Köpet" durationInFrames={SHOP.duration}>
          <ShopScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={stripes()} timing={linearTiming({ durationInFrames: STRIPES, easing: EASE.inOut })} />
        <TransitionSeries.Sequence name="Priser" durationInFrames={OFFER.duration}>
          <OfferScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipeUp()} timing={linearTiming({ durationInFrames: WIPE, easing: EASE.inOut })} />
        <TransitionSeries.Sequence name="Avslutning" durationInFrames={CTA.duration}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <VoiceTrack />
    </AbsoluteFill>
  );
};
