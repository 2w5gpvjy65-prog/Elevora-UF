import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { C, EASE, geist, newsreader, serif } from "./theme";
import { CUES, FADE, VOICE, WIPE, len } from "./timeline";
import { fadeThrough, wipeUp } from "./transitions";
import { DM_DURATION, DmScene } from "./scenes/DmScene";
import { SWIPE_DURATION, SwipeToShop } from "./scenes/SwipeToShop";
import { SHOP_DURATION, ShopScene } from "./scenes/ShopScene";
import { OFFER_DURATION, OfferScene } from "./scenes/OfferScene";
import { CTA_DURATION, CtaScene } from "./scenes/CtaScene";

// Ingen bildruta renderas innan alla typsnitt är laddade.
const useFontsReady = () => {
  const [handle] = useState(() => delayRender("Väntar på typsnitt"));
  useEffect(() => {
    Promise.all([geist.waitUntilDone(), serif.waitUntilDone(), newsreader.waitUntilDone()])
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
        <TransitionSeries.Sequence name="Krok: DM" durationInFrames={DM_DURATION}>
          <DmScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Svep till webbshop" durationInFrames={SWIPE_DURATION}>
          <SwipeToShop />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Webbshop (Artera UF)" durationInFrames={SHOP_DURATION}>
          <ShopScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fadeThrough()}
          timing={linearTiming({ durationInFrames: FADE, easing: EASE.soft })}
        />
        <TransitionSeries.Sequence name="Priser" durationInFrames={OFFER_DURATION}>
          <OfferScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipeUp()}
          timing={linearTiming({ durationInFrames: WIPE, easing: EASE.inOut })}
        />
        <TransitionSeries.Sequence name="Avslutning" durationInFrames={CTA_DURATION}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <VoiceTrack />
    </AbsoluteFill>
  );
};
