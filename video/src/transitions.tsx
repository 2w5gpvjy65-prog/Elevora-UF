import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { clamp } from "./theme";

type NoProps = Record<string, never>;

// Den mörkblå avslutningen dras upp underifrån som en ridå.
const WipeUp: React.FC<TransitionPresentationComponentProps<NoProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ translate: `0 ${-p * 6}%` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>{children}</AbsoluteFill>;
};

export const wipeUp = (): TransitionPresentation<NoProps> => ({
  component: WipeUp,
  props: {},
});

// Iris: nästa scen öppnar sig ur en växande cirkel, den gamla zoomar in lite.
const Iris: React.FC<TransitionPresentationComponentProps<NoProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 1.08]) }}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{ clipPath: `circle(${interpolate(p, [0, 1], [0, 120])}% at 50% 55%)` }}>{children}</AbsoluteFill>
  );
};

export const iris = (): TransitionPresentation<NoProps> => ({ component: Iris, props: {} });

// Ränder: nästa scen sveper in i sex lodräta band med liten fördröjning mellan banden.
const BANDS = 6;
const Stripes: React.FC<TransitionPresentationComponentProps<NoProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const stops: string[] = [];
  for (let i = 0; i < BANDS; i++) {
    const a = (i / BANDS) * 100;
    const b = ((i + 1) / BANDS) * 100;
    const f = interpolate(p, [i * 0.07, i * 0.07 + 0.65], [0, 1], clamp);
    const edge = a + (b - a) * f;
    stops.push(`#000 ${a}%`, `#000 ${edge}%`, `transparent ${edge}%`, `transparent ${b}%`);
  }
  const mask = `linear-gradient(90deg, ${stops.join(", ")})`;
  return <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>{children}</AbsoluteFill>;
};

export const stripes = (): TransitionPresentation<NoProps> => ({ component: Stripes, props: {} });
