import React from "react";
import { C } from "../theme";

export const PHONE_RATIO = 2.16;

// Enkel, neutral mobil. Innehållet ritas i ett koordinatsystem som är 600 enheter brett.
export const Phone: React.FC<{
  readonly width: number;
  readonly style?: React.CSSProperties;
  readonly children: (u: number, screenH: number) => React.ReactNode;
}> = ({ width, style, children }) => {
  const height = Math.round(width * PHONE_RATIO);
  const bezel = Math.round(width * 0.026);
  const screenW = width - bezel * 2;
  const screenH = height - bezel * 2;
  const u = screenW / 600;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        borderRadius: width * 0.14,
        background: C.ink,
        boxShadow:
          "0 60px 120px -40px rgba(29,28,26,0.45), 0 24px 48px -24px rgba(29,28,26,0.35), inset 0 0 0 2px #3a3835",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: bezel,
          top: bezel,
          width: screenW,
          height: screenH,
          borderRadius: width * 0.115,
          overflow: "hidden",
          background: C.surface,
        }}
      >
        {children(u, screenH / u)}
        {/* Kamerahål */}
        <div
          style={{
            position: "absolute",
            left: (600 / 2 - 80) * u,
            top: 18 * u,
            width: 160 * u,
            height: 44 * u,
            borderRadius: 999,
            background: C.ink,
          }}
        />
      </div>
    </div>
  );
};
