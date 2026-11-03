import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ArteraPage, K, STATUS } from "../components/Artera";
import { DotGrid } from "../components/DotGrid";
import { Headline } from "../components/Headline";
import { Phone } from "../components/Phone";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { BUILD } from "../timeline";

export const BUILD_DURATION = BUILD.duration;

// Arteras startsida som wireframe, i CSS-pixlar (uppmätt i 393 px bredd).
type Box = { x: number; y: number; w: number; h: number; img?: boolean; tone?: string };
const BOXES: Box[] = [
  { x: 16, y: 12, w: 149, h: 40 }, // logga
  { x: 333, y: 20, w: 44, h: 24 }, // meny
  { x: 16, y: 82, w: 300, h: 38 }, // rubrik rad 1
  { x: 16, y: 128, w: 330, h: 38 },
  { x: 16, y: 174, w: 236, h: 38 },
  { x: 0, y: 249, w: 393, h: 393, img: true }, // stor bild
  { x: 16, y: 672, w: 361, h: 14 }, // ingress
  { x: 16, y: 698, w: 352, h: 14 },
  { x: 16, y: 724, w: 240, h: 14 },
  { x: 16, y: 768, w: 118, h: 55, tone: "#1d1c1a" }, // knapp
  { x: 162, y: 788, w: 117, h: 14 }, // textlänk
];
// Markeringsrutan hoppar mellan rubriken, bilden och knappen, som i ett designverktyg.
const PICKS = [
  { x: 16, y: 76, w: 345, h: 142 },
  { x: 0, y: 249, w: 393, h: 393 },
  { x: 16, y: 768, w: 118, h: 55 },
];

// Kod som skrivs (förenklad), med färger per del.
const T = { tag: "#a9bdd8", attr: "#d6c3a8", str: "#e8dcc9", txt: "#f2ede6", dim: "#7d8796" };
const CODE: [string, string][][] = [
  [["<header ", T.tag], ["class=", T.attr], ['"meny"', T.str], [">", T.tag]],
  [["  <a ", T.tag], ["class=", T.attr], ['"logga"', T.str], [">", T.tag], ["Artera UF", T.txt], ["</a>", T.tag]],
  [["</header>", T.tag]],
  [["<section ", T.tag], ["class=", T.attr], ['"hero"', T.str], [">", T.tag]],
  [["  <h1>", T.tag], ["Handgjorda keramikfat", T.txt], ["</h1>", T.tag]],
  [["  <img ", T.tag], ["src=", T.attr], ['"vika.webp"', T.str], [">", T.tag]],
  [["  <a ", T.tag], ["class=", T.attr], ['"knapp"', T.str], [">", T.tag], ["Se faten", T.txt], ["</a>", T.tag]],
  [["</section>", T.tag]],
  [[".hero ", T.tag], ["{ ", T.dim], ["display", T.attr], [": ", T.dim], ["grid", T.str], [" }", T.dim]],
  [[".knapp ", T.tag], ["{ ", T.dim], ["background", T.attr], [": ", T.dim], ["#1d1c1a", T.str], [" }", T.dim]],
  [["// Swish, kort, Klarna", T.dim]],
  [["kassa", T.txt], [".", T.dim], ["oppna", T.attr], ["(", T.dim], ["kundvagn", T.txt], [")", T.dim]],
];
const CODE_LEN = CODE.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1, 0);

const Screen: React.FC<{ readonly u: number; readonly screenH: number }> = ({ u, screenH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const px = (n: number) => n * u;
  const cy = (y: number) => px(STATUS + y * K); // CSS-y -> skärm
  const cx = (x: number) => px(x * K);

  const gridP = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE.out });
  const reveal = interpolate(frame, [BUILD.reveal, BUILD.reveal + 24], [0, 1], { ...clamp, easing: EASE.inOut });

  // Markeringsruta
  const pickT = BUILD.picks;
  const pickP = pickT.map((t) => spring({ frame: frame - t, fps, config: { damping: 18, stiffness: 180 } }));
  const lerp = (k: "x" | "y" | "w" | "h") =>
    PICKS[0][k] + (PICKS[1][k] - PICKS[0][k]) * pickP[1] + (PICKS[2][k] - PICKS[1][k]) * pickP[2];
  const sel = { x: lerp("x"), y: lerp("y"), w: lerp("w"), h: lerp("h") };
  const selOn = interpolate(frame, [pickT[0], pickT[0] + 6, BUILD.h5 + 6, BUILD.h5 + 12], [0, 1, 1, 0], clamp);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#f6f1ea", overflow: "hidden" }}>
      {/* Kolumnrutnät som i ett designverktyg */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.6, display: "flex", gap: px(16), padding: `0 ${px(24)}px` }}>
        {new Array(4).fill(true).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: "rgba(27,42,64,0.05)",
              borderLeft: "1px solid rgba(27,42,64,0.1)",
              borderRight: "1px solid rgba(27,42,64,0.1)",
              scale: `1 ${interpolate(frame, [2 + i * 4, 18 + i * 4], [0, 1], { ...clamp, easing: EASE.out })}`,
              transformOrigin: "50% 0%",
            }}
          />
        ))}
      </div>
      {/* Tom sida som väntar: "Ny sida" med blinkande markör */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: px(screenH * 0.36),
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: px(30),
          color: C.accent,
          opacity: gridP * interpolate(frame, [BUILD.design - 2, BUILD.design + 6], [1, 0], clamp),
        }}
      >
        <div
          style={{
            width: px(84),
            height: px(84),
            margin: `0 auto ${px(22)}px`,
            borderRadius: px(18),
            border: `${px(2.5)}px dashed ${C.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: px(46),
            fontFamily: F.sans,
          }}
        >
          +
        </div>
        Ny sida{Math.floor(frame / 8) % 2 === 0 ? "_" : "\u00a0"}
      </div>

      {/* Wireframe: ritas med streck, fylls sedan i */}
      <svg width={px(600)} height={px(screenH)} style={{ position: "absolute", inset: 0 }}>
        {BOXES.map((b, i) => {
          const per = 2 * (cx(b.w) + (cy(b.y + b.h) - cy(b.y)));
          const draw = interpolate(frame, [BUILD.design + i * 3, BUILD.design + i * 3 + 14], [0, 1], { ...clamp, easing: EASE.out });
          const fill = interpolate(frame, [BUILD.v5 + i * 2, BUILD.v5 + i * 2 + 10], [0, 1], { ...clamp, easing: EASE.out });
          const x = cx(b.x) + 1;
          const y = cy(b.y) + 1;
          const w = Math.max(cx(b.w) - 2, 1);
          const h = Math.max(cy(b.y + b.h) - cy(b.y) - 2, 1);
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx={px(b.img ? 0 : 4)} fill={b.tone ?? (b.img ? "#d9cbb9" : "#e6dccf")} opacity={fill} />
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={px(b.img ? 0 : 4)}
                fill="none"
                stroke={C.accent}
                strokeWidth={px(2.2)}
                strokeDasharray={per}
                strokeDashoffset={per * (1 - draw)}
                opacity={1 - fill * 0.7}
              />
              {b.img ? (
                <g stroke={C.accent} strokeWidth={px(1.6)} opacity={draw * (1 - fill) * 0.6}>
                  <line x1={x} y1={y} x2={x + w * draw} y2={y + h * draw} />
                  <line x1={x + w} y1={y} x2={x + w - w * draw} y2={y + h * draw} />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Skimmer över platshållarna medan koden skrivs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [BUILD.v5, BUILD.v5 + 6, BUILD.reveal, BUILD.reveal + 6], [0, 0.5, 0.5, 0], clamp),
          background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)",
          backgroundSize: "250% 100%",
          backgroundPosition: `${interpolate(frame, [BUILD.v5, BUILD.reveal], [120, -60])}% 0`,
        }}
      />

      {/* Markeringsruta med mått */}
      <div
        style={{
          position: "absolute",
          left: cx(sel.x) - px(3),
          top: cy(sel.y) - px(3),
          width: cx(sel.w) + px(6),
          height: cy(sel.y + sel.h) - cy(sel.y) + px(6),
          border: `${px(2.5)}px solid ${C.accent}`,
          opacity: selOn,
        }}
      >
        {[
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ].map(([a, b], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(${a * 100}% - ${px(7)}px)`,
              top: `calc(${b * 100}% - ${px(7)}px)`,
              width: px(12),
              height: px(12),
              background: "#fff",
              border: `${px(2.5)}px solid ${C.accent}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -px(44),
            translate: "-50% 0",
            background: C.accent,
            color: "#fff",
            fontFamily: F.mono,
            fontSize: px(20),
            padding: `${px(4)}px ${px(10)}px`,
            borderRadius: px(5),
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(sel.w)} × {Math.round(sel.h)}
        </div>
      </div>

      {/* Den riktiga sidan framkallas uppifrån, med en skanningslinje */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}>
        <ArteraPage u={u} scroll={0} />
      </div>
      {reveal > 0 && reveal < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: px(screenH * reveal) - px(2),
            height: px(4),
            background: "#fff",
            boxShadow: `0 0 ${px(16)}px ${px(4)}px rgba(169,189,216,0.9)`,
          }}
        />
      ) : null}
    </div>
  );
};

const CodePanel: React.FC<{ readonly width: number; readonly height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const fs = width / 25;
  const lineH = fs * 1.55;
  const typed = interpolate(frame, [BUILD.v5 - 2, BUILD.h6 + 6], [0, CODE_LEN], { ...clamp, easing: EASE.soft });
  const inP = interpolate(frame, [BUILD.v5 - 6, BUILD.v5 + 8], [0, 1], { ...clamp, easing: EASE.out });
  const outP = interpolate(frame, [BUILD.reveal + 10, BUILD.reveal + 24], [0, 1], { ...clamp, easing: EASE.in });

  let left = typed;
  let cursorLine = 0;
  const lines = CODE.map((line, li) => {
    const parts: React.ReactNode[] = [];
    for (const [i, [t, color]] of line.entries()) {
      if (left <= 0) break;
      const shown = t.slice(0, Math.max(0, Math.floor(left)));
      left -= t.length;
      parts.push(
        <span key={i} style={{ color }}>
          {shown}
        </span>,
      );
    }
    if (parts.length) cursorLine = li;
    left -= 1;
    return parts;
  });
  const bodyH = height - fs * 2.6;
  const scrollY = Math.max(0, (cursorLine + 1) * lineH - bodyH + lineH * 0.5);
  const blink = Math.floor(frame / 7) % 2 === 0;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: fs * 0.8,
        background: C.navy,
        boxShadow: "0 40px 80px -30px rgba(24,33,45,0.6), 0 12px 24px -12px rgba(24,33,45,0.4)",
        overflow: "hidden",
        opacity: inP * (1 - outP),
        // Lite snett i 3D, som om panelen svävar framför mobilen
        transform: `perspective(1400px) translate(${(1 - inP) * -60}px, ${outP * 40}px) rotateY(16deg) rotateX(5deg)`,
      }}
    >
      <div style={{ height: fs * 2.2, display: "flex", alignItems: "center", gap: fs * 0.45, padding: `0 ${fs}px`, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {["#5b6677", "#5b6677", "#5b6677"].map((c, i) => (
          <div key={i} style={{ width: fs * 0.6, height: fs * 0.6, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ marginLeft: fs * 0.6, fontFamily: F.mono, fontSize: fs * 0.8, color: T.dim }}>index.html</div>
      </div>
      <div style={{ position: "relative", height: bodyH, overflow: "hidden", padding: `${fs * 0.5}px ${fs}px` }}>
        <div style={{ translate: `0 ${-scrollY}px`, fontFamily: F.mono, fontSize: fs, lineHeight: `${lineH}px`, whiteSpace: "pre" }}>
          {lines.map((parts, li) => (
            <div key={li} style={{ display: "flex" }}>
              <span style={{ color: "#4a5566", width: fs * 1.6, flex: "none" }}>{li + 1}</span>
              <span>
                {parts}
                {li === cursorLine && blink ? <span style={{ background: T.tag, color: C.navy }}>&nbsp;</span> : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Published: React.FC<{ readonly size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - BUILD.reveal - 18, fps, config: { damping: 14, stiffness: 200 } });
  const ring = interpolate(Math.max(0, frame - BUILD.reveal) % 30, [0, 30], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.45,
        background: "#fff",
        color: C.ink,
        fontFamily: F.sans,
        fontWeight: 500,
        fontSize: size,
        padding: `${size * 0.45}px ${size * 0.8}px`,
        borderRadius: 999,
        boxShadow: "0 18px 40px -16px rgba(29,28,26,0.45)",
        scale: interpolate(p, [0, 1], [0.6, 1]),
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      <span style={{ position: "relative", width: size * 0.55, height: size * 0.55 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.accent }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.accent}`, scale: 1 + ring * 1.4, opacity: 1 - ring }} />
      </span>
      Publicerad
    </div>
  );
};

// bg kan sättas till transparent under svepet, då ligger bakgrunden utanför motion blur.
export const BuildScene: React.FC<{ readonly bg?: string }> = ({ bg = C.bg }) => {
  const { width } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const h1 = SPEC[fmt].h1;

  const headlines = (
    <>
      <Headline text="Skaffa er *egen* webbshop." size={h1} enterAt={null} exitAt={BUILD.h4 - 8} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <Headline text="Vi *designar* den." size={h1} enterAt={BUILD.h4 + 1} exitAt={BUILD.h5 - 8} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <Headline text="Vi *bygger* den." size={h1} enterAt={BUILD.h5 + 1} exitAt={BUILD.h6 - 8} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <Headline text="Klart på *1–2* veckor." size={h1} enterAt={BUILD.h6 + 1} />
      </div>
    </>
  );

  if (fmt === "wide") {
    const colW = 740;
    const phoneW = 470;
    const phoneX = width - s.r - phoneW - 40;
    return (
      <AbsoluteFill style={{ background: bg }}>
        <DotGrid />
        <div style={{ position: "absolute", left: s.l, top: 0, bottom: 0, width: colW, display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: colW, height: h1 * 1.06 * 3 }}>{headlines}</div>
        </div>
        <Phone width={phoneW} style={{ left: phoneX, top: 96 }}>
          {(u, screenH) => <Screen u={u} screenH={screenH} />}
        </Phone>
        <div style={{ position: "absolute", left: phoneX - 470, top: 600 }}>
          <CodePanel width={520} height={340} />
        </div>
        <div style={{ position: "absolute", left: phoneX + phoneW - 150, top: 150 }}>
          <Published size={30} />
        </div>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06 * 2);
  const phoneW = fmt === "reel" ? 560 : 470;
  const phoneTop = s.t + headBlock + (fmt === "reel" ? 60 : 44);
  const phoneX = s.l + contentW / 2 - phoneW / 2 + (fmt === "reel" ? 60 : 90);
  const panelW = fmt === "reel" ? 600 : 500;

  return (
    <AbsoluteFill style={{ background: bg }}>
      <DotGrid />
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW, height: headBlock }}>{headlines}</div>
      <Phone width={phoneW} style={{ left: phoneX, top: phoneTop }}>
        {(u, screenH) => <Screen u={u} screenH={screenH} />}
      </Phone>
      <div style={{ position: "absolute", left: s.l - 10, top: phoneTop + (fmt === "reel" ? 470 : 380) }}>
        <CodePanel width={panelW} height={fmt === "reel" ? 390 : 330} />
      </div>
      <div style={{ position: "absolute", right: s.r - 10, top: phoneTop + 80 }}>
        <Published size={fmt === "reel" ? 34 : 30} />
      </div>
    </AbsoluteFill>
  );
};
