import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { Headline } from "../components/Headline";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { OFFER } from "../timeline";

export const OFFER_DURATION = OFFER.duration;

const Rise: React.FC<{
  readonly at: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <div style={{ translate: `0 ${(1 - p) * 36}px`, opacity: interpolate(p, [0, 0.6], [0, 1], clamp), ...style }}>
      {children}
    </div>
  );
};

// Siffror som rullar fram som en mätare, varje siffra med egen fördröjning.
const Odometer: React.FC<{ readonly value: string; readonly at: number; readonly size: number }> = ({ value, at, size }) => {
  const frame = useCurrentFrame();
  const h = size * 1.12;
  return (
    <span style={{ display: "inline-flex", height: h, overflow: "hidden", verticalAlign: "bottom" }}>
      {value.split("").map((ch, i) => {
        // Mellanslag i "2 500" står still, smalare än en siffra
        if (ch === " ") return <span key={i} style={{ display: "inline-block", width: "0.26em" }} />;
        const d = Number(ch);
        const spins = 10 + d; // ett varv plus målsiffran
        const p = interpolate(frame, [at + i * 3, at + i * 3 + 22], [0, 1], { ...clamp, easing: EASE.out });
        return (
          <span key={i} style={{ display: "inline-block", width: "0.62em", textAlign: "center" }}>
            <span style={{ display: "block", translate: `0 ${-p * spins * h}px` }}>
              {new Array(spins + 1).fill(true).map((_, k) => (
                <span key={k} style={{ display: "block", height: h, lineHeight: `${h}px` }}>
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// Liten etikett med UF-priset som dyker upp när rösten viskar det.
const UfTag: React.FC<{ readonly price: string; readonly at: number; readonly size: number }> = ({ price, at, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 170 } });
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.35em",
        padding: "0.3em 0.75em 0.32em",
        borderRadius: 999,
        background: C.accent,
        fontFamily: F.sans,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: C.bg,
        whiteSpace: "nowrap",
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `0 ${(1 - p) * size * 0.5}px`,
        scale: `${interpolate(p, [0, 1], [0.86, 1])}`,
        transformOrigin: "100% 50%",
      }}
    >
      <span style={{ fontWeight: 400, color: C.navyAccent }}>UF-pris</span>
      <span style={{ fontWeight: 600 }}>{price} kr</span>
    </span>
  );
};

const PriceRow: React.FC<{
  readonly at: number;
  readonly name: string;
  readonly price: string;
  readonly size: number;
  readonly uf: { readonly price: string; readonly at: number };
  readonly last?: boolean;
}> = ({ at, name, price, size, uf, last }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Raden har plats för UF-etiketten från början. När den kommer växer en lika hög lucka under
  // namnet och priset, så att namn, pris och etikett står centrerade tillsammans i raden.
  const tagSize = Math.round(size * 0.46);
  const lift = spring({ frame: frame - uf.at, fps, config: { damping: 200, stiffness: 160 } });
  const gap = Math.round(size * 0.16);
  const room = lift * (Math.round(tagSize * 1.62) + gap);
  const line = interpolate(frame, [at - 4, at + 16], [0, 1], { ...clamp, easing: EASE.out });
  const lineStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    background: C.line,
    scale: `${line} 1`,
    transformOrigin: "0 50%",
  };
  return (
    <div style={{ position: "relative", height: size * 2.9 }}>
      <div style={{ ...lineStyle, top: 0 }} />
      {last ? <div style={{ ...lineStyle, bottom: 0 }} /> : null}
      <Rise at={at} style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: F.sans,
            fontSize: size,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: C.ink,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ lineHeight: `${size * 1.12}px` }}>{name}</span>
            <div style={{ height: room }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: C.accent, fontVariantNumeric: "tabular-nums", display: "inline-flex", alignItems: "flex-end", gap: "0.22em", height: size * 1.12 }}>
              <Odometer value={price} at={at + 2} size={size} />
              <span style={{ lineHeight: `${size * 1.12}px` }}>kr</span>
            </span>
            <div style={{ height: room, paddingTop: gap, display: "flex", alignItems: "flex-start" }}>
              <UfTag price={uf.price} at={uf.at} size={tagSize} />
            </div>
          </div>
        </div>
      </Rise>
    </div>
  );
};

export const OfferScene: React.FC = () => {
  const { width } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const { h1, sup } = SPEC[fmt];
  const rowSize = fmt === "feed" ? 58 : 66;

  const headline = <Headline text="Fasta *priser*." size={h1} enterAt={OFFER.hIn} />;
  const list = (
    <>
      <PriceRow at={OFFER.row1} name="Webbshop" price="2 500" size={rowSize} uf={{ price: "800", at: OFFER.uf1 }} />
      <PriceRow at={OFFER.row2} name="Hemsida" price="1 800" size={rowSize} uf={{ price: "400", at: OFFER.uf2 }} last />
      <Rise at={OFFER.foot} style={{ marginTop: sup * 1.1 }}>
        <span style={{ fontFamily: F.sans, fontSize: sup, color: C.muted, letterSpacing: "-0.01em" }}>
          Inga månadsavgifter till oss.
        </span>
      </Rise>
    </>
  );

  if (fmt === "wide") {
    const colW = (width - s.l - s.r - 140) / 2;
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        <DotGrid />
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: `0 ${s.r}px 0 ${s.l}px`, gap: 140 }}>
          <div style={{ width: colW }}>{headline}</div>
          <div style={{ width: colW }}>{list}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DotGrid />
      <div
        style={{
          position: "absolute",
          left: s.l,
          right: s.r,
          top: s.t,
          bottom: s.b,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {headline}
        <div style={{ height: fmt === "reel" ? 110 : 70 }} />
        {list}
      </div>
    </AbsoluteFill>
  );
};
