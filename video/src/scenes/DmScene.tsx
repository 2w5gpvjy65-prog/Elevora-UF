import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Headline } from "../components/Headline";
import { C, EASE, F, SPEC, clamp, useFmt } from "../theme";
import { DM } from "../timeline";

export const DM_DURATION = DM.duration;

// Påhittade kunder som frågar samma saker om och om igen.
// "at" = bildrutan när meddelandet kommer in. Negativa finns redan vid start.
const MESSAGES = [
  { at: -84, user: "molly.r", text: "Hur lång leveranstid?" },
  { at: -70, user: "ella.uf", text: "Hej! Finns den kvar?" },
  { at: -56, user: "linnea.k", text: "Vad kostar frakten?" },
  { at: -40, user: "majastil", text: "Kan jag swisha dig?" },
  { at: -12, user: "theo.w", text: "Finns den kvar?" },
  { at: 6, user: "noah.b", text: "Finns den i silver?" },
  { at: 14, user: "saga.lund", text: "Finns den kvar?" },
  { at: 22, user: "wilma.e", text: "Hallå? Svarar ni?" },
  { at: 30, user: "alva.uf", text: "Vad kostar frakten?" },
  { at: 38, user: "tilde.b", text: "Kan jag betala med kort?" },
  { at: 46, user: "elin.k", text: "Skickar ni till Umeå?" },
  { at: 54, user: "siri.m", text: "Finns den kvar?" },
  // Andra rubriken: allt fler, allt tätare
  ...[
    { user: "hugo.n", text: "Finns den kvar?" },
    { user: "elsa.m", text: "Har ni Klarna?" },
    { user: "olivia.s", text: "Vad kostar frakten?" },
    { user: "leo.a", text: "Är den såld?" },
    { user: "ines.v", text: "Finns den kvar?" },
    { user: "vera.h", text: "Kan jag swisha?" },
    { user: "nora.l", text: "Hallå??" },
    { user: "juni.p", text: "Finns den kvar?" },
    { user: "ebba.r", text: "Svara snälla" },
    { user: "liam.j", text: "Vad kostar frakten?" },
    { user: "stella.f", text: "Finns den kvar?" },
    { user: "alice.n", text: "Kan jag swisha?" },
    { user: "max.b", text: "Finns den i guld?" },
    { user: "tyra.k", text: "Hallå?" },
    { user: "isak.l", text: "Vad kostar frakten?" },
    { user: "freja.h", text: "Finns den kvar?" },
  ].map((m, i, all) => ({
    ...m,
    // Andra rubriken: meddelandena kommer allt tätare under hela repliken
    at: Math.round(DM.h2In + 4 + (DM.duration - DM.h2In - 14) * Math.pow(i / (all.length - 1), 0.8)),
  })),
];

const AVATARS = ["#d9cfc2", "#cfd5dc", "#d4cdc2", "#c8c1b6", "#dcd4c9", "#c5ccd6"];

const ROW = {
  reel: { avatar: 76, name: 30, msg: 40, padY: 24, padX: 28, gap: 16, radius: 24 },
  feed: { avatar: 70, name: 28, msg: 38, padY: 22, padX: 26, gap: 14, radius: 22 },
  wide: { avatar: 70, name: 28, msg: 38, padY: 20, padX: 26, gap: 14, radius: 22 },
};

const Inbox: React.FC<{ readonly width: number; readonly height: number }> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fmt = useFmt();
  const r = ROW[fmt];
  const rowH = r.padY * 2 + Math.round(r.name * 1.25) + 6 + Math.round(r.msg * 1.25);
  const step = rowH + r.gap;

  const progress = MESSAGES.map((m) =>
    spring({ frame: frame - m.at, fps, config: { damping: 200, stiffness: 170 } }),
  );
  const arrived = MESSAGES.filter((m) => m.at <= frame).length;
  const lastAt = Math.max(...MESSAGES.filter((m) => m.at <= frame).map((m) => m.at));
  const pop = spring({ frame: frame - lastAt, fps, config: { damping: 14, stiffness: 260 } });

  const headerH = Math.round(r.msg * 1.8);

  return (
    <div style={{ position: "absolute", inset: 0, width, height }}>
      {/* Inkorgens rubrik med antal olästa */}
      <div
        style={{
          height: headerH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: F.sans,
          color: C.ink,
        }}
      >
        <span style={{ fontSize: r.msg, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Meddelanden
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: r.name * 0.4,
            background: C.accent,
            color: C.bg,
            fontSize: r.name,
            fontWeight: 600,
            padding: `${r.name * 0.3}px ${r.name * 0.7}px`,
            borderRadius: 999,
            scale: interpolate(pop, [0, 1], [1.12, 1]),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {6 + arrived} olästa
        </span>
      </div>

      {/* Meddelandelistan, nyaste överst */}
      <div
        style={{
          position: "absolute",
          top: headerH + r.gap * 1.5,
          left: 0,
          width,
          bottom: 0,
          overflow: "hidden",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%)",
        }}
      >
        {MESSAGES.map((m, i) => {
          if (m.at > frame) return null;
          let y = 0;
          for (let j = i + 1; j < MESSAGES.length; j++) {
            if (MESSAGES[j].at <= frame) y += step * progress[j];
          }
          if (y > height) return null;
          const p = progress[i];
          const tone = AVATARS[Math.floor(random(`avatar-${m.user}`) * AVATARS.length)];
          return (
            <div
              key={m.user}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width,
                height: rowH,
                // Nya meddelanden tonas in först när de andra har flyttat undan.
                translate: `0 ${y + (1 - p) * -14}px`,
                scale: interpolate(p, [0, 1], [0.94, 1]),
                opacity: interpolate(p, [0.3, 0.8], [0, 1], clamp),
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: r.padX * 0.8,
                padding: `${r.padY}px ${r.padX}px`,
                background: C.card,
                borderRadius: r.radius,
                border: "1px solid rgba(29,28,26,0.06)",
                boxShadow: "0 1px 0 rgba(29,28,26,0.04), 0 14px 28px -18px rgba(29,28,26,0.35)",
                fontFamily: F.sans,
              }}
            >
              <div
                style={{
                  width: r.avatar,
                  height: r.avatar,
                  flex: "none",
                  borderRadius: "50%",
                  background: tone,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: r.avatar * 0.42,
                  fontWeight: 500,
                  color: C.ink,
                }}
              >
                {m.user[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: r.name, lineHeight: 1.25, color: C.muted, fontWeight: 500 }}>
                  {m.user}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: r.msg,
                    lineHeight: 1.25,
                    color: C.ink,
                    fontWeight: 500,
                    letterSpacing: "-0.015em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.text}
                </div>
              </div>
              <div
                style={{
                  width: r.name * 0.5,
                  height: r.name * 0.5,
                  borderRadius: "50%",
                  background: C.accent,
                  flex: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// bg kan sättas till transparent under svepet, då ligger bakgrunden utanför motion blur.
export const DmScene: React.FC<{ readonly bg?: string }> = ({ bg = C.bg }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fmt = useFmt();
  const s = SPEC[fmt].safe;
  const h1 = SPEC[fmt].h1;

  const headlines = (
    <>
      <Headline text="Säljer ni fortfarande i *DM*?" size={h1} enterAt={null} exitAt={DM.h1Exit} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Headline text="Samma frågor. *Varje* dag." size={h1} enterAt={DM.h2In} />
      </div>
    </>
  );

  // Långsam inzoomning på inkorgen så att bilden lever från första bildrutan.
  const push = interpolate(frame, [0, DM_DURATION], [1, 1.035], { ...clamp, easing: EASE.soft });

  if (fmt === "wide") {
    const colW = 720;
    const inboxW = 820;
    return (
      <AbsoluteFill style={{ background: bg }}>
        <div
          style={{
            position: "absolute",
            left: s.l,
            top: 0,
            bottom: 0,
            width: colW,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: colW }}>{headlines}</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: width - s.r - inboxW,
            top: s.t,
            width: inboxW,
            height: height - s.t - s.b,
            transform: `perspective(1600px) rotateX(${interpolate(frame, [0, DM_DURATION], [8, 3], { ...clamp, easing: EASE.soft })}deg) rotateY(${interpolate(frame, [0, DM_DURATION], [-12, -5], { ...clamp, easing: EASE.soft })}deg) scale(${push})`,
          }}
        >
          <Inbox width={inboxW} height={height - s.t - s.b} />
        </div>
      </AbsoluteFill>
    );
  }

  const contentW = width - s.l - s.r;
  const headBlock = Math.round(h1 * 1.06 * 2);
  const inboxTop = s.t + headBlock + (fmt === "reel" ? 76 : 56);
  const inboxH = height - s.b - inboxTop;

  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: s.l, top: s.t, width: contentW, height: headBlock }}>
        {headlines}
      </div>
      <div
        style={{
          position: "absolute",
          left: s.l,
          top: inboxTop,
          width: contentW,
          height: inboxH,
          // Inkorgen lutar lite i 3D och rätar upp sig medan stressen ökar
          transform: `perspective(1600px) rotateX(${interpolate(frame, [0, DM_DURATION], [9, 3], { ...clamp, easing: EASE.soft })}deg) rotateY(${interpolate(frame, [0, DM_DURATION], [-7, -2], { ...clamp, easing: EASE.soft })}deg) scale(${push})`,
          transformOrigin: "50% 0%",
        }}
      >
        <Inbox width={contentW} height={inboxH} />
      </div>
    </AbsoluteFill>
  );
};
