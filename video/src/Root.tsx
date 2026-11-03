import React from "react";
import { Composition, Folder } from "remotion";
import { ElevoraAd, TOTAL_DURATION } from "./ElevoraAd";

// Samma video i tre format. Layouten anpassar sig efter bildformatet.
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Elevora">
      {/* TikTok, Reels och Stories */}
      <Composition
        id="Reel"
        component={ElevoraAd}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Instagram-flödet */}
      <Composition
        id="Feed"
        component={ElevoraAd}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1350}
      />
      {/* Hemsidan, YouTube och LinkedIn */}
      <Composition
        id="Wide"
        component={ElevoraAd}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
