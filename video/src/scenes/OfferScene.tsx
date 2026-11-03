import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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

const PriceRow: React.FC<{
  readonly at: number;
  readonly name: string;
  readonly price: string;
  readonly size: number;
  readonly last?: boolean;
}> = ({ at, name, price, size, last }) => {
  const frame = useCurrentFrame();
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
    <div style={{ position: "relative", height: size * 2.3 }}>
      <div style={{ ...lineStyle, top: 0 }} />
      {last ? <div style={{ ...lineStyle, bottom: 0 }} /> : null}
      <Rise
        at={at}
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
        <span>{name}</span>
        <span style={{ color: C.accent, fontVariantNumeric: "tabular-nums", display: "inline-flex", alignItems: "flex-end", gap: "0.22em" }}>
          <Odometer value={price} at={at + 2} size={size} />
          <span style={{ lineHeight: `${size * 1.12}px` }}>kr</span>
        </span>
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

  const headline = <Headline text="Fasta *UF-priser*." size={h1} enterAt={OFFER.hIn} />;
  const list = (
    <>
      <PriceRow at={OFFER.row1} name="Webbshop" price="600" size={rowSize} />
      <PriceRow at={OFFER.row2} name="Hemsida" price="300" size={rowSize} last />
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
