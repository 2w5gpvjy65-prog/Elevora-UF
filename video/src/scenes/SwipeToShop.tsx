import React from "react";
import { AbsoluteFill, Freeze, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import { C, EASE, clamp } from "../theme";
import { DM_DURATION, DmScene } from "./DmScene";
import { ShopScene } from "./ShopScene";

export const SWIPE_DURATION = 26;

// Den stora övergången: inkorgen sveps bort uppåt och webbshoppen tar dess plats,
// som när man scrollar vidare i flödet. Bara här används motion blur.
const Swipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const p = interpolate(frame, [0, SWIPE_DURATION - 1], [0, 1], { ...clamp, easing: EASE.swipe });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ translate: `0 ${-p * height}px` }}>
        <Freeze frame={DM_DURATION - 1}>
          <DmScene bg="transparent" />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{ translate: `0 ${(1 - p) * height}px` }}>
        <Freeze frame={0}>
          <ShopScene bg="transparent" />
        </Freeze>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SwipeToShop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Slutaren öppnas bara när det går fort, så att start och slut är knivskarpa.
  const shutter = interpolate(frame, [2, 4, SWIPE_DURATION - 5, SWIPE_DURATION - 3], [0, 180, 180, 0], clamp);
  return (
    // Bakgrunden ligger utanför oskärpan så att färgen aldrig skiftar.
    // 15 samples: 255/15 går jämnt ut i 8 bitar, så färgerna förskjuts minst.
    <AbsoluteFill style={{ background: C.bg }}>
      <HtmlInCanvasMotionBlur width={width} height={height} samples={15} shutterAngle={Math.round(shutter)}>
        <Swipe />
      </HtmlInCanvasMotionBlur>
    </AbsoluteFill>
  );
};
