import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Headline } from "../components/Headline";
import { Phone } from "../components/Phone";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";

export const SHOP_DURATION = 150;

// Tidslinje i scenen (bildrutor)
const TAP_BUY = 58;
const SHEET_IN = 62;
const SELECT = 84;
const TAP_PAY = 100;
const DONE = 106;

const Tap: React.FC<{ readonly at: number; readonly x: number; readonly y: number; readonly u: number }> = ({
  at,
  x,
  y,
  u,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at - 4, at + 12], [0, 1], { ...clamp, easing: EASE.out });
  if (frame < at - 4 || frame > at + 14) return null;
  const size = 96 * u;
  return (
    <div
      style={{
        position: "absolute",
        left: x * u - size / 2,
        top: y * u - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(249,246,241,0.35)",
        border: `${3 * u}px solid rgba(249,246,241,0.9)`,
        scale: interpolate(p, [0, 1], [0.55, 1.35]),
        opacity: interpolate(p, [0, 0.25, 1], [0, 1, 0]),
      }}
    />
  );
};

const Check: React.FC<{ readonly size: number; readonly p: number }> = ({ size, p }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ scale: interpolate(p, [0, 1], [0.6, 1]) }}>
    <circle cx="50" cy="50" r="50" fill={C.accent} />
    <path
      d="M29 51 L44 65 L72 36"
      fill="none"
      stroke={C.bg}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="70"
      strokeDashoffset={interpolate(p, [0.2, 1], [70, 0], clamp)}
    />
  </svg>
);

const ShopScreen: React.FC<{ readonly u: number; readonly screenH: number }> = ({ u, screenH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const press = (at: number) => interpolate(frame, [at - 2, at + 2, at + 9], [1, 0.95, 1], clamp);
  const sheetP = interpolate(frame, [SHEET_IN, SHEET_IN + 20], [0, 1], { ...clamp, easing: EASE.out });
  const selectP = spring({ frame: frame - SELECT, fps, config: { damping: 200 } });
  const doneP = spring({ frame: frame - DONE, fps, config: { damping: 18, stiffness: 160 } });
  const badgeP = spring({ frame: frame - DONE - 8, fps, config: { damping: 12, stiffness: 220 } });
  const sheetTop = 250;

  const px = (n: number) => n * u;

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink }}>
      {/* Meny */}
      <div style={{ position: "absolute", left: px(40), right: px(40), top: px(78), height: px(48), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: px(34) }}>
          <div style={{ height: px(3), background: C.ink, marginBottom: px(9) }} />
          <div style={{ height: px(3), width: px(22), background: C.ink }} />
        </div>
        <div style={{ fontFamily: F.shop, fontSize: px(34), letterSpacing: "0.24em", paddingLeft: "0.24em" }}>NORRSKEN</div>
        <div style={{ position: "relative", width: px(34), height: px(36) }}>
          <svg viewBox="0 0 34 36" width={px(34)} height={px(36)}>
            <path d="M5 11 H29 L27 34 H7 Z" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M11 13 V8 a6 6 0 0 1 12 0 V13" fill="none" stroke={C.ink} strokeWidth="2.6" />
          </svg>
          <div
            style={{
              position: "absolute",
              right: px(-12),
              top: px(-10),
              width: px(26),
              height: px(26),
              borderRadius: "50%",
              background: C.accent,
              color: C.bg,
              fontSize: px(16),
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: frame < DONE + 8 ? 0 : badgeP,
            }}
          >
            1
          </div>
        </div>
      </div>

      {/* Produktbild i vit ram */}
      <div style={{ position: "absolute", left: 0, right: 0, top: px(150), height: px(400), background: C.stone, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: px(14), background: "#fff", boxShadow: "0 18px 30px -16px rgba(29,28,26,0.45)" }}>
          <div style={{ width: px(250), height: px(312), overflow: "hidden" }}>
            <Img
              src={staticFile("kvallsbris.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                scale: interpolate(frame, [0, SHOP_DURATION], [1.0, 1.07], { ...clamp, easing: EASE.soft }),
              }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ position: "absolute", left: px(40), right: px(40), top: px(568) }}>
        <div style={{ fontSize: px(24), color: C.muted, letterSpacing: "0.02em" }}>Fotoprint</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: px(4) }}>
          <div style={{ fontFamily: F.shop, fontSize: px(54), lineHeight: 1.15, letterSpacing: "-0.01em" }}>Kvällsbris</div>
          <div style={{ fontSize: px(36), fontWeight: 500 }}>449 kr</div>
        </div>
        <div style={{ display: "flex", gap: px(12), marginTop: px(14) }}>
          {["Swish", "Kort", "Klarna"].map((m) => (
            <div key={m} style={{ fontSize: px(24), padding: `${px(6)}px ${px(16)}px`, border: `${px(1.5)}px solid ${C.line}`, borderRadius: px(6), color: C.muted }}>
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Köp-knapp */}
      <div
        style={{
          position: "absolute",
          left: px(40),
          right: px(40),
          top: px(752),
          height: px(88),
          background: C.ink,
          color: C.bg,
          borderRadius: px(6),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: px(34),
          fontWeight: 500,
          scale: press(TAP_BUY),
        }}
      >
        Köp nu
      </div>
      <div style={{ position: "absolute", left: px(40), right: px(40), top: px(870), fontSize: px(26), color: C.muted, lineHeight: 1.9 }}>
        <div>Skickas inom 1–2 vardagar</div>
        <div>Fri retur i 30 dagar</div>
      </div>
      <Tap at={TAP_BUY} x={300} y={796} u={u} />

      {/* Kassa som glider upp */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(29,28,26,0.32)", opacity: sheetP }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: px(interpolate(sheetP, [0, 1], [screenH, sheetTop])),
          height: px(screenH - sheetTop + 40),
          background: "#fff",
          borderRadius: `${px(28)}px ${px(28)}px 0 0`,
          boxShadow: "0 -20px 40px -20px rgba(29,28,26,0.3)",
        }}
      >
        <div style={{ position: "absolute", left: px(270), top: px(14), width: px(60), height: px(6), borderRadius: 99, background: C.line }} />
        <div style={{ position: "absolute", left: px(40), right: px(40), top: px(44) }}>
          <div style={{ fontSize: px(24), color: C.muted }}>Kassa</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: px(6), fontSize: px(32), fontWeight: 500 }}>
            <span>Kvällsbris, 30 × 40</span>
            <span>449 kr</span>
          </div>
        </div>

        {/* Betalsätt, byts mot kvitto när köpet är klart */}
        <div style={{ position: "absolute", left: px(40), right: px(40), top: px(150), opacity: interpolate(doneP, [0, 0.4], [1, 0], clamp) }}>
          {["Swish", "Kort", "Klarna"].map((m, i) => {
            const on = i === 0 ? selectP : 0;
            return (
              <div
                key={m}
                style={{
                  height: px(84),
                  marginBottom: px(12),
                  borderRadius: px(12),
                  border: `${px(2)}px solid ${interpolate(on, [0, 1], [0, 1]) > 0.5 ? C.ink : C.line}`,
                  background: on > 0.5 ? C.surface : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: px(18),
                  padding: `0 ${px(24)}px`,
                  fontSize: px(32),
                  fontWeight: 500,
                }}
              >
                <div style={{ width: px(32), height: px(32), borderRadius: "50%", border: `${px(2.5)}px solid ${on > 0.5 ? C.ink : C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: px(16), height: px(16), borderRadius: "50%", background: C.ink, scale: on }} />
                </div>
                {m}
              </div>
            );
          })}
          <div
            style={{
              marginTop: px(20),
              height: px(88),
              background: C.ink,
              color: C.bg,
              borderRadius: px(6),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: px(34),
              fontWeight: 500,
              scale: press(TAP_PAY),
            }}
          >
            Betala 449 kr
          </div>
        </div>
        <Tap at={TAP_PAY} x={300} y={150 + 3 * 96 + 20 + 44} u={u} />

        {/* Kvitto */}
        {frame >= DONE ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: px(170), display: "flex", flexDirection: "column", alignItems: "center", opacity: interpolate(doneP, [0, 0.5], [0, 1], clamp) }}>
            <Check size={px(124)} p={doneP} />
            <div style={{ marginTop: px(32), fontSize: px(46), fontWeight: 500, letterSpacing: "-0.02em" }}>Tack för ditt köp!</div>
            <div style={{ marginTop: px(12), fontSize: px(30), color: C.muted }}>Betalt med Swish · 449 kr</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// bg kan sättas till transparent under svepet, då ligger bakgrunden utanför motion blur.
export const ShopScene: React.FC<{ readonly bg?: string }> = ({ bg = C.bg }) => {
  const { width } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const h1 = SPEC[fmt].h1;

  const headlines = (
    <>
      <Headline text="Skaffa er *egen* webbshop." size={h1} enterAt={null} exitAt={56} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Headline text="Kunden betalar *direkt* på sidan." size={h1} enterAt={70} />
      </div>
    </>
  );

  if (fmt === "wide") {
    const colW = 760;
    const phoneW = 560;
    return (
      <AbsoluteFill style={{ background: bg }}>
        <div style={{ position: "absolute", left: s.l, top: 0, bottom: 0, width: colW, display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: colW }}>{headlines}</div>
        </div>
        <Phone width={phoneW} style={{ left: width - s.r - phoneW - 60, top: 110 }}>
          {(u, screenH) => <ShopScreen u={u} screenH={screenH} />}
        </Phone>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06 * 2);
  const phoneW = fmt === "reel" ? 680 : 560;
  const phoneTop = s.t + headBlock + (fmt === "reel" ? 66 : 56);
  // Mobilen fortsätter ut under bildkanten: viktigt innehåll ligger högt upp.

  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW, height: headBlock }}>{headlines}</div>
      <Phone width={phoneW} style={{ left: s.l + contentW / 2 - phoneW / 2, top: phoneTop }}>
        {(u, screenH) => <ShopScreen u={u} screenH={screenH} />}
      </Phone>
    </AbsoluteFill>
  );
};
