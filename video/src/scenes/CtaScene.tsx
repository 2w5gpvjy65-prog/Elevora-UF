import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Headline } from "../components/Headline";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";

export const CTA_DURATION = 130;

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const { h1, sup } = SPEC[fmt];

  const logoP = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const pillP = interpolate(frame, [26, 44], [0, 1], { ...clamp, easing: EASE.out });
  const footP = interpolate(frame, [34, 52], [0, 1], { ...clamp, easing: EASE.out });

  const logo = fmt === "wide" ? 124 : fmt === "reel" ? 136 : 120;
  const pillSize = fmt === "reel" ? 58 : 52;

  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <div
        style={{
          position: "absolute",
          left: s.l,
          right: s.r,
          top: s.t,
          bottom: s.b,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: logo * 0.18,
            marginBottom: logo * 0.5,
            opacity: logoP,
            translate: `0 ${(1 - logoP) * 24}px`,
          }}
        >
          <Img src={staticFile("logo-ljus.svg")} style={{ width: logo, height: logo }} />
          <span style={{ fontFamily: F.sans, fontWeight: 500, fontSize: logo * 0.42, color: C.bg, letterSpacing: "-0.03em" }}>
            Elevora UF
          </span>
        </div>

        <Headline
          text="Vi skissar er startsida *gratis*."
          size={h1}
          enterAt={8}
          color={C.bg}
          accentColor={C.navyAccent}
          align="center"
          style={{ maxWidth: fmt === "wide" ? 1100 : undefined }}
        />

        <div
          style={{
            marginTop: sup * 1.6,
            opacity: interpolate(pillP, [0, 0.5], [0, 1], clamp),
            translate: `0 ${(1 - pillP) * 30}px`,
            background: C.bg,
            color: C.ink,
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: pillSize,
            letterSpacing: "-0.02em",
            padding: `${pillSize * 0.42}px ${pillSize * 0.9}px`,
            borderRadius: 4,
          }}
        >
          elevorauf.se
        </div>

        <div
          style={{
            marginTop: sup * 0.9,
            opacity: interpolate(footP, [0, 0.5], [0, 1], clamp),
            translate: `0 ${(1 - footP) * 24}px`,
            fontFamily: F.sans,
            fontSize: sup,
            color: C.navyMuted,
          }}
        >
          Hemsidor och webbshoppar
        </div>
      </div>
    </AbsoluteFill>
  );
};
