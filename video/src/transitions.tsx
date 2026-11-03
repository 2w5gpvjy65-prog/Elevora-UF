import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { C, clamp } from "./theme";

type NoProps = Record<string, never>;

// Lugn övertoning: gamla scenen tonas ut först, sedan lyfts den nya in.
const FadeThrough: React.FC<TransitionPresentationComponentProps<NoProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ opacity: interpolate(p, [0, 0.5], [1, 0], clamp), translate: `0 ${-p * 40}px` }}>
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ opacity: interpolate(p, [0.45, 1], [0, 1], clamp) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const fadeThrough = (): TransitionPresentation<NoProps> => ({
  component: FadeThrough,
  props: {},
});

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
