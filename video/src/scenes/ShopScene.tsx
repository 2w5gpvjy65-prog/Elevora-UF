import React from "react";
import {
  AbsoluteFill,
  Easing,
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
import { SHOP } from "../timeline";

export const SHOP_DURATION = SHOP.duration;

// Arteras riktiga sida (Artera UF, byggd av Elevora), fotad i 393 px bredd.
// Mått i CSS-pixlar från skärmdumpen, se scripts/artera-skarmdump.js.
const ARTERA = {
  bg: "#f0e8dd",
  pageW: 393,
  cardTop: 1327.5,
  buyBtn: { x: 196.5, y: 1763.4, w: 361, h: 46 },
};
const STATUS = 54; // statusfältet överst i mobilen (enheter)
const K = 600 / ARTERA.pageW; // enheter per CSS-pixel
// Scrolla så att Vika-kortet ligger högt upp, knappen långt från TikToks textzon.
const SCROLL_TO = ARTERA.cardTop - 20;

const Tap: React.FC<{ readonly at: number; readonly x: number; readonly y: number; readonly u: number }> = ({
  at,
  x,
  y,
  u,
}) => {
  const frame = useCurrentFrame();
  if (frame < at - 4 || frame > at + 14) return null;
  const p = interpolate(frame, [at - 4, at + 12], [0, 1], { ...clamp, easing: EASE.out });
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
        background: "rgba(29,28,26,0.12)",
        border: `${3 * u}px solid rgba(255,255,255,0.95)`,
        boxShadow: "0 2px 10px rgba(29,28,26,0.25)",
        scale: interpolate(p, [0, 1], [0.55, 1.3]),
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

const ArteraScreen: React.FC<{ readonly u: number; readonly screenH: number }> = ({ u, screenH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const px = (n: number) => n * u;

  const scroll = interpolate(frame, [SHOP.scrollStart, SHOP.scrollEnd], [0, SCROLL_TO], {
    ...clamp,
    easing: Easing.bezier(0.5, 0, 0.1, 1),
  });
  const btnY = STATUS + (ARTERA.buyBtn.y - scroll) * K;
  const btnTop = btnY - (ARTERA.buyBtn.h / 2) * K;
  const pressed = interpolate(frame, [SHOP.tapBuy - 2, SHOP.tapBuy + 1, SHOP.tapBuy + 8], [0, 1, 0], clamp);

  const sheetP = interpolate(frame, [SHOP.sheetIn, SHOP.sheetIn + 20], [0, 1], { ...clamp, easing: EASE.out });
  const selectP = spring({ frame: frame - SHOP.select, fps, config: { damping: 200 } });
  const payPress = interpolate(frame, [SHOP.tapPay - 2, SHOP.tapPay + 2, SHOP.tapPay + 9], [1, 0.95, 1], clamp);
  const doneP = spring({ frame: frame - SHOP.done, fps, config: { damping: 18, stiffness: 160 } });
  const sheetTop = 230;

  return (
    <div style={{ position: "absolute", inset: 0, background: ARTERA.bg, fontFamily: F.sans, color: C.ink }}>
      {/* Sidan (skärmdump) som scrollar under den fasta menyn */}
      <Img
        src={staticFile("artera/artera-mobil.jpg")}
        style={{ position: "absolute", left: 0, top: px(STATUS - scroll * K), width: px(600) }}
      />
      {/* Knappen "Lägg i kundvagnen" trycks in */}
      <div
        style={{
          position: "absolute",
          left: px(300 - (ARTERA.buyBtn.w / 2) * K),
          top: px(btnTop),
          width: px(ARTERA.buyBtn.w * K),
          height: px(ARTERA.buyBtn.h * K),
          borderRadius: px(4),
          background: C.ink,
          opacity: pressed * 0.16,
        }}
      />
      <Tap at={SHOP.tapBuy} x={300} y={btnY} u={u} />

      {/* Statusfält och fast meny */}
      <div style={{ position: "absolute", left: 0, top: 0, width: px(600), height: px(STATUS), background: ARTERA.bg }} />
      <Img
        src={staticFile("artera/artera-meny.jpg")}
        style={{ position: "absolute", left: 0, top: px(STATUS), width: px(600) }}
      />

      {/* Kassan glider upp */}
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
        <div style={{ position: "absolute", left: px(40), right: px(40), top: px(40) }}>
          <div style={{ fontSize: px(24), color: C.muted }}>Kassa</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: px(6), fontSize: px(32), fontWeight: 500 }}>
            <span>Vika, rosa marmor</span>
            <span>349 kr</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: px(6), fontSize: px(24), color: C.muted }}>
            <span>Frakt</span>
            <span>39 kr</span>
          </div>
        </div>

        {/* Betalsätt, byts mot kvitto när köpet är klart */}
        <div style={{ position: "absolute", left: px(40), right: px(40), top: px(168), opacity: interpolate(doneP, [0, 0.4], [1, 0], clamp) }}>
          {["Swish", "Kort", "Klarna"].map((m, i) => {
            const on = i === 0 ? selectP : 0;
            return (
              <div
                key={m}
                style={{
                  height: px(84),
                  marginBottom: px(12),
                  borderRadius: px(12),
                  border: `${px(2)}px solid ${on > 0.5 ? C.ink : C.line}`,
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
              scale: payPress,
            }}
          >
            Betala 388 kr
          </div>
        </div>
        <Tap at={SHOP.tapPay} x={300} y={168 + 3 * 96 + 20 + 44} u={u} />

        {/* Kvitto */}
        {frame >= SHOP.done ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: px(190), display: "flex", flexDirection: "column", alignItems: "center", opacity: interpolate(doneP, [0, 0.5], [0, 1], clamp) }}>
            <Check size={px(124)} p={doneP} />
            <div style={{ marginTop: px(32), fontSize: px(46), fontWeight: 500, letterSpacing: "-0.02em" }}>Tack för ditt köp!</div>
            <div style={{ marginTop: px(12), fontSize: px(30), color: C.muted }}>Betalt med Swish · 388 kr</div>
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
  // Underraden får plats på en rad i alla format (reel ca 660 px av 800).
  const sub = fmt === "feed" ? 46 : 44;
  const subGap = Math.round(sub * 0.6);

  const headlines = (
    <>
      <Headline text="Så skaffa er *egen* webbshop." size={h1} enterAt={null} exitAt={SHOP.h1Exit} />
      <div style={{ height: subGap }} />
      <Headline
        text="Som Artera UF. Vi byggde deras sida."
        size={sub}
        enterAt={SHOP.subIn}
        exitAt={SHOP.h1Exit}
        color="#3f3b36"
        style={{ letterSpacing: "-0.015em", lineHeight: 1.25, whiteSpace: "nowrap" }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <Headline text="Kunden betalar *direkt* på sidan." size={h1} enterAt={SHOP.h2In} />
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
          {(u, screenH) => <ArteraScreen u={u} screenH={screenH} />}
        </Phone>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06 * 2) + subGap + Math.round(sub * 1.25);
  const phoneW = fmt === "reel" ? 640 : 560;
  const phoneTop = s.t + headBlock + (fmt === "reel" ? 50 : 40);

  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW, height: headBlock }}>{headlines}</div>
      {/* Mobilen fortsätter ut under bildkanten: viktigt innehåll ligger högt upp. */}
      <Phone width={phoneW} style={{ left: s.l + contentW / 2 - phoneW / 2, top: phoneTop }}>
        {(u, screenH) => <ArteraScreen u={u} screenH={screenH} />}
      </Phone>
    </AbsoluteFill>
  );
};
