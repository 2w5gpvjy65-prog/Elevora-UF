import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { Headline } from "../components/Headline";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { CTA } from "../timeline";

export const CTA_DURATION = CTA.duration;
const URL = "elevorauf.se";

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const { h1, sup } = SPEC[fmt];

  // Loggan vrids fram ur en cirkel
  const logoP = spring({ frame: frame - CTA.logo, fps, config: { damping: 16, stiffness: 120 } });
  const pillP = interpolate(frame, [CTA.url - 4, CTA.url + 10], [0, 1], { ...clamp, easing: EASE.out });
  // Adressen skrivs bokstav för bokstav
  const typed = Math.floor(interpolate(frame, [CTA.url, CTA.url + 16], [0, URL.length], { ...clamp, easing: EASE.soft }));
  const blink = Math.floor(frame / 8) % 2 === 0;
  const sweep = interpolate(frame, [CTA.url + 26, CTA.url + 50], [-30, 130], { ...clamp, easing: EASE.inOut });

  const logo = fmt === "wide" ? 124 : fmt === "reel" ? 136 : 120;
  const pillSize = fmt === "reel" ? 60 : 54;

  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <DotGrid color="#33425a" opacity={0.7} />
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
        <div style={{ display: "flex", alignItems: "center", gap: logo * 0.18, marginBottom: logo * 0.5 }}>
          <Img
            src={staticFile("logo-ljus.svg")}
            style={{
              width: logo,
              height: logo,
              clipPath: `circle(${interpolate(logoP, [0, 1], [0, 75])}% at 50% 50%)`,
              rotate: `${interpolate(logoP, [0, 1], [-35, 0])}deg`,
              scale: interpolate(logoP, [0, 1], [0.7, 1]),
            }}
          />
          <span
            style={{
              fontFamily: F.sans,
              fontWeight: 500,
              fontSize: logo * 0.42,
              color: C.bg,
              letterSpacing: "-0.03em",
              opacity: interpolate(logoP, [0.3, 1], [0, 1], clamp),
              translate: `${(1 - logoP) * -20}px 0`,
            }}
          >
            Elevora UF
          </span>
        </div>

        <Headline
          text="Vi skissar er startsida *gratis*."
          size={h1}
          enterAt={CTA.hIn}
          color={C.bg}
          accentColor={C.navyAccent}
          align="center"
          style={{ maxWidth: fmt === "wide" ? 1100 : undefined }}
        />

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: sup * 1.6,
            opacity: interpolate(pillP, [0, 0.5], [0, 1], clamp),
            scale: interpolate(pillP, [0, 1], [0.92, 1]),
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
          {/* Osynlig full text håller bredden still medan adressen skrivs */}
          <span style={{ visibility: "hidden" }}>{URL}</span>
          <span style={{ position: "absolute", left: pillSize * 0.9, top: pillSize * 0.42, whiteSpace: "nowrap" }}>
            {URL.slice(0, typed)}
            {typed < URL.length || blink ? (
              <span style={{ display: "inline-block", width: "0.06em", height: "0.95em", background: C.accent, marginLeft: "0.04em", verticalAlign: "-0.12em" }} />
            ) : null}
          </span>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%)",
              backgroundSize: "300% 100%",
              backgroundPosition: `${100 - sweep}% 0`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
