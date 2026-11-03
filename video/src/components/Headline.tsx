import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE, F, clamp } from "../theme";

type Segment = { t: string; accent: boolean };

// "Säljer ni i *DM*?" -> ord med segment. *ord* blir accentordet (blå serif).
const parse = (text: string): Segment[][] => {
  let accent = false;
  return text.split(" ").map((word) => {
    const segs: Segment[] = [];
    for (const [i, part] of word.split("*").entries()) {
      if (i > 0) accent = !accent;
      if (part) segs.push({ t: part, accent });
    }
    return segs;
  });
};

type Props = {
  readonly text: string;
  readonly size: number;
  // null = syns redan i första bildrutan (kroken)
  readonly enterAt: number | null;
  readonly exitAt?: number | null;
  readonly color?: string;
  readonly accentColor?: string;
  readonly align?: "left" | "center";
  readonly style?: React.CSSProperties;
};

export const Headline: React.FC<Props> = ({
  text,
  size,
  enterAt,
  exitAt = null,
  color = C.ink,
  accentColor = C.accent,
  align = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const words = parse(text);

  return (
    <h1
      style={{
        margin: 0,
        fontFamily: F.sans,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: "-0.035em",
        color,
        textAlign: align,
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((segs, i) => {
        // Orden glider upp ur en mask, ett i taget.
        const inP =
          enterAt === null
            ? 1
            : interpolate(frame, [enterAt + i * 2, enterAt + i * 2 + 16], [0, 1], {
                ...clamp,
                easing: EASE.out,
              });
        const outP =
          exitAt === null
            ? 0
            : interpolate(frame, [exitAt + i * 1.5, exitAt + i * 1.5 + 10], [0, 1], {
                ...clamp,
                easing: EASE.in,
              });
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "top",
                padding: "0.1em 0.02em 0.16em",
                margin: "-0.1em -0.02em -0.16em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: `0 ${(1 - inP) * 110 - outP * 135}%`,
                  opacity: interpolate(outP, [0.7, 1], [1, 0], clamp),
                }}
              >
                {segs.map((s, j) => (
                  <span
                    key={j}
                    style={
                      s.accent
                        ? {
                            fontFamily: F.serif,
                            color: accentColor,
                            letterSpacing: "-0.02em",
                          }
                        : undefined
                    }
                  >
                    {s.t}
                  </span>
                ))}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </h1>
  );
};
