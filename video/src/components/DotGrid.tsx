import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Diskret punktrutnät som glider sakta: ger en teknisk känsla utan att ta fokus.
export const DotGrid: React.FC<{ readonly color?: string; readonly opacity?: number; readonly size?: number }> = ({
  color = "#cdc3b4",
  opacity = 0.55,
  size = 36,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `radial-gradient(circle, ${color} 1.6px, transparent 2px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${(frame * 0.35) % size}px ${(frame * 0.6) % size}px`,
        maskImage: "radial-gradient(ellipse 75% 70% at 55% 50%, #000 30%, transparent 100%)",
      }}
    />
  );
};
