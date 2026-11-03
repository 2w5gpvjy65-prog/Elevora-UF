import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARTERA, ArteraPage, K, STATUS } from "../components/Artera";
import { DotGrid } from "../components/DotGrid";
import { Headline } from "../components/Headline";
import { Phone } from "../components/Phone";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { SHOP } from "../timeline";

export const SHOP_DURATION = SHOP.duration;

// Scrolla så att Vika-kortet ligger högt upp, knappen långt från TikToks textzon.
const SCROLL_TO = ARTERA.cardTop - 20;
const METHODS = ["Swish", "Kort", "Klarna"];

const Tap: React.FC<{ readonly at: number; readonly x: number; readonly y: number; readonly u: number }> = ({ at, x, y, u }) => {
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

const Screen: React.FC<{ readonly u: number; readonly screenH: number }> = ({ u, screenH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const px = (n: number) => n * u;

  const scroll = interpolate(frame, [SHOP.scrollStart, SHOP.scrollEnd], [0, SCROLL_TO], {
    ...clamp,
    easing: Easing.bezier(0.6, 0, 0.1, 1),
  });
  const btnY = STATUS + (ARTERA.buyBtn.y - scroll) * K;
  const btnTop = btnY - (ARTERA.buyBtn.h / 2) * K;
  const pressed = interpolate(frame, [SHOP.tapBuy - 2, SHOP.tapBuy + 1, SHOP.tapBuy + 8], [0, 1, 0], clamp);

  const sheetP = interpolate(frame, [SHOP.sheetIn, SHOP.sheetIn + 16], [0, 1], { ...clamp, easing: EASE.out });
  const selectP = spring({ frame: frame - SHOP.select, fps, config: { damping: 200 } });
  const payPress = interpolate(frame, [SHOP.tapPay - 2, SHOP.tapPay + 2, SHOP.tapPay + 9], [1, 0.95, 1], clamp);
  const doneP = spring({ frame: frame - SHOP.done, fps, config: { damping: 18, stiffness: 160 } });
  const sheetTop = 230;

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink }}>
      <ArteraPage u={u} scroll={scroll} />
      {/* "Lägg i kundvagnen" trycks in */}
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

        {/* Betalsätten lyser upp i takt med rösten, sedan väljs Swish */}
        <div style={{ position: "absolute", left: px(40), right: px(40), top: px(168), opacity: interpolate(doneP, [0, 0.4], [1, 0], clamp) }}>
          {METHODS.map((m, i) => {
            const at = SHOP.words[i];
            const pulse = interpolate(frame, [at - 1, at + 3, at + 14], [0, 1, 0.25], clamp);
            const on = i === 0 ? selectP : 0;
            const active = Math.max(pulse, on);
            return (
              <div
                key={m}
                style={{
                  height: px(84),
                  marginBottom: px(12),
                  borderRadius: px(12),
                  border: `${px(2)}px solid ${active > 0.5 ? C.ink : C.line}`,
                  background: active > 0.5 ? C.surface : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: px(18),
                  padding: `0 ${px(24)}px`,
                  fontSize: px(32),
                  fontWeight: 500,
                  scale: 1 + interpolate(frame, [at - 1, at + 3, at + 10], [0, 0.035, 0], clamp),
                  boxShadow: `0 ${px(10)}px ${px(24)}px -${px(14)}px rgba(29,28,26,${0.35 * pulse})`,
                }}
              >
                <div style={{ width: px(32), height: px(32), borderRadius: "50%", border: `${px(2.5)}px solid ${active > 0.5 ? C.ink : C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

// "Swish, kort eller Klarna." där varje betalsätt blir blått och understruket när det sägs.
const KaraokeLine: React.FC<{ readonly size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const words = [
    { t: "Swish,", at: SHOP.words[0], key: true },
    { t: "kort", at: SHOP.words[1], key: true },
    { t: "eller", at: SHOP.words[1] + 6, key: false },
    { t: "Klarna.", at: SHOP.words[2], key: true },
  ];
  return (
    <h1 style={{ margin: 0, fontFamily: F.sans, fontWeight: 500, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.035em", color: C.ink, textWrap: "balance" }}>
      {words.map((w, i) => {
        const inP = interpolate(frame, [SHOP.h9 + i * 2, SHOP.h9 + i * 2 + 14], [0, 1], { ...clamp, easing: EASE.out });
        const hit = interpolate(frame, [w.at - 1, w.at + 6], [0, 1], { ...clamp, easing: EASE.out });
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.1em 0.02em 0.2em", margin: "-0.1em -0.02em -0.2em" }}>
              <span style={{ display: "inline-block", position: "relative", translate: `0 ${(1 - inP) * 110}%`, color: w.key && hit > 0.5 ? C.accent : C.ink }}>
                {w.t}
                {w.key ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: w.t.endsWith(",") || w.t.endsWith(".") ? "0.3em" : 0,
                      bottom: "-0.04em",
                      height: "0.07em",
                      background: C.accent,
                      scale: `${hit} 1`,
                      transformOrigin: "0 50%",
                    }}
                  />
                ) : null}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </h1>
  );
};

const OrderToast: React.FC<{ readonly size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - SHOP.order, fps, config: { damping: 15, stiffness: 190 } });
  if (frame < SHOP.order) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.6,
        background: "#fff",
        borderRadius: size * 0.7,
        padding: `${size * 0.6}px ${size * 0.9}px`,
        boxShadow: "0 30px 60px -24px rgba(29,28,26,0.5), 0 8px 16px -8px rgba(29,28,26,0.25)",
        fontFamily: F.sans,
        transform: `perspective(900px) translateY(${(1 - p) * 40}px) rotateX(${(1 - p) * 35}deg) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width={size * 0.9} height={size * 0.9} viewBox="0 0 34 36">
          <path d="M5 11 H29 L27 34 H7 Z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <path d="M11 13 V8 a6 6 0 0 1 12 0 V13" fill="none" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: size, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>Ny beställning</div>
        <div style={{ fontSize: size * 0.82, color: C.muted, marginTop: size * 0.1 }}>Vika · 388 kr</div>
      </div>
    </div>
  );
};

export const ShopScene: React.FC = () => {
  const { width } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const h1 = SPEC[fmt].h1;

  const headlines = (
    <>
      <Headline text="Kunden betalar *direkt* på sidan." size={h1} enterAt={2} exitAt={SHOP.h9 - 9} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        <KaraokeLine size={h1} />
      </div>
    </>
  );

  if (fmt === "wide") {
    const colW = 760;
    const phoneW = 560;
    const phoneX = width - s.r - phoneW - 60;
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        <DotGrid />
        <div style={{ position: "absolute", left: s.l, top: 0, bottom: 0, width: colW, display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: colW, height: h1 * 1.06 * 3 }}>{headlines}</div>
        </div>
        <Phone width={phoneW} style={{ left: phoneX, top: 110 }}>
          {(u, screenH) => <Screen u={u} screenH={screenH} />}
        </Phone>
        <div style={{ position: "absolute", right: s.r + phoneW - 10, top: 760 }}>
          <OrderToast size={36} />
        </div>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06 * 2);
  const phoneW = fmt === "reel" ? 640 : 560;
  const phoneTop = s.t + headBlock + (fmt === "reel" ? 50 : 40);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DotGrid />
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW, height: headBlock }}>{headlines}</div>
      <Phone width={phoneW} style={{ left: s.l + contentW / 2 - phoneW / 2, top: phoneTop }}>
        {(u, screenH) => <Screen u={u} screenH={screenH} />}
      </Phone>
      <div style={{ position: "absolute", right: s.r, top: phoneTop + (fmt === "reel" ? 120 : 90) }}>
        <OrderToast size={fmt === "reel" ? 38 : 34} />
      </div>
    </AbsoluteFill>
  );
};
