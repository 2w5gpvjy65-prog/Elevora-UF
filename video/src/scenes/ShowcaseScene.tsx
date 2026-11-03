import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArteraPage } from "../components/Artera";
import { DotGrid } from "../components/DotGrid";
import { Headline } from "../components/Headline";
import { Phone } from "../components/Phone";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { SHOW } from "../timeline";

export const SHOW_DURATION = SHOW.duration;

// Webbläsarfönster med Arteras sida i datorn
const Browser: React.FC<{ readonly width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const bar = width * 0.05;
  const imgH = width * 0.625;
  // Ljusreflex som glider över glaset
  const sweep = interpolate(frame, [10, 70], [-60, 160], { ...clamp, easing: EASE.inOut });
  return (
    <div
      style={{
        width,
        borderRadius: width * 0.014,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 60px 120px -40px rgba(29,28,26,0.55), 0 20px 40px -20px rgba(29,28,26,0.35)",
        position: "relative",
      }}
    >
      <div style={{ height: bar, background: "#ebe4da", display: "flex", alignItems: "center", gap: bar * 0.18, padding: `0 ${bar * 0.4}px` }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: bar * 0.24, height: bar * 0.24, borderRadius: "50%", background: "#cfc5b7" }} />
        ))}
        <div
          style={{
            margin: "0 auto",
            height: bar * 0.56,
            width: width * 0.34,
            borderRadius: 999,
            background: "#f7f3ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: bar * 0.12,
            fontFamily: F.sans,
            fontSize: bar * 0.3,
            color: C.muted,
          }}
        >
          <svg width={bar * 0.24} height={bar * 0.28} viewBox="0 0 12 14">
            <rect x="1" y="6" width="10" height="7.5" rx="1.5" fill={C.muted} />
            <path d="M3.3 6V4.2a2.7 2.7 0 0 1 5.4 0V6" fill="none" stroke={C.muted} strokeWidth="1.5" />
          </svg>
          Artera UF
        </div>
        <div style={{ width: bar * 1.1 }} />
      </div>
      <Img src={staticFile("artera/artera-dator.jpg")} style={{ display: "block", width, height: imgH, objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)",
          backgroundSize: "300% 100%",
          backgroundPosition: `${sweep}% 0`,
        }}
      />
    </div>
  );
};

const Stage: React.FC<{ readonly browserW: number; readonly phoneW: number }> = ({ browserW, phoneW }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [0, SHOW.duration], [0, 1], { ...clamp, easing: EASE.soft });
  const inP = spring({ frame: frame - 2, fps, config: { damping: 200, stiffness: 120 } });
  const phoneP = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 140 } });
  const browserH = browserW * 0.675;
  return (
    <div style={{ position: "relative", width: browserW, height: browserH, perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          // Kameran glider runt datorn: tydlig 3D-känsla men lugn
          transform: `translateY(${(1 - inP) * 80}px) rotateX(${interpolate(t, [0, 1], [12, 5])}deg) rotateY(${interpolate(t, [0, 1], [-26, -12])}deg) scale(${interpolate(t, [0, 1], [0.94, 1.02])})`,
          opacity: interpolate(inP, [0, 0.4], [0, 1], clamp),
        }}
      >
        <Browser width={browserW} />
        <div
          style={{
            position: "absolute",
            right: -phoneW * 0.32,
            top: browserH * 0.32,
            transform: `translateZ(${interpolate(phoneP, [0, 1], [40, 160])}px) translate(${(1 - phoneP) * 140}px, ${(1 - phoneP) * 90}px) rotateY(18deg)`,
            opacity: interpolate(phoneP, [0, 0.3], [0, 1], clamp),
          }}
        >
          <div style={{ position: "relative", width: phoneW, height: phoneW * 2.16 }}>
            <Phone width={phoneW} style={{ left: 0, top: 0 }}>
              {(u) => <ArteraPage u={u} scroll={0} />}
            </Phone>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShowcaseScene: React.FC = () => {
  const { width } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const h1 = SPEC[fmt].h1;
  const sub = fmt === "feed" ? 46 : 44;

  const headlines = (
    <>
      <Headline text="Som *Artera* UF." size={h1} enterAt={SHOW.hIn} />
      <div style={{ height: Math.round(sub * 0.5) }} />
      <Headline
        text="Vi byggde deras sida."
        size={sub}
        enterAt={SHOW.hIn + 22}
        color="#3f3b36"
        style={{ letterSpacing: "-0.015em", lineHeight: 1.25, whiteSpace: "nowrap" }}
      />
    </>
  );

  if (fmt === "wide") {
    const colW = 640;
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        <DotGrid />
        <div style={{ position: "absolute", left: s.l, top: 0, bottom: 0, width: colW, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {headlines}
        </div>
        <div style={{ position: "absolute", left: 770, top: 190 }}>
          <Stage browserW={940} phoneW={280} />
        </div>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06) + Math.round(sub * 0.5) + Math.round(sub * 1.25);
  const top = s.t + headBlock + (fmt === "reel" ? 150 : 80);
  const browserW = fmt === "reel" ? 740 : 800;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DotGrid />
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW }}>{headlines}</div>
      <div style={{ position: "absolute", left: s.l - (fmt === "reel" ? 80 : 50), top }}>
        <Stage browserW={browserW} phoneW={fmt === "reel" ? 265 : 260} />
      </div>
    </AbsoluteFill>
  );
};
