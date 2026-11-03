import React from "react";
import { Img, staticFile } from "remotion";

// Arteras riktiga sida (Artera UF, byggd av Elevora), fotad i 393 px bredd.
// Mått i CSS-pixlar från skärmdumpen, se scripts/artera-skarmdump.js.
export const ARTERA = {
  bg: "#f0e8dd",
  pageW: 393,
  cardTop: 1327.5,
  buyBtn: { x: 196.5, y: 1763.4, w: 361, h: 46 },
};
export const STATUS = 54; // statusfältet överst i mobilen (enheter)
export const K = 600 / ARTERA.pageW; // enheter per CSS-pixel

// Startsidan i mobilen, scrollad `scroll` CSS-pixlar, med den fasta menyn ovanpå.
export const ArteraPage: React.FC<{ readonly u: number; readonly scroll: number }> = ({ u, scroll }) => {
  const px = (n: number) => n * u;
  return (
    <div style={{ position: "absolute", inset: 0, background: ARTERA.bg, overflow: "hidden" }}>
      <Img
        src={staticFile("artera/artera-mobil.jpg")}
        style={{ position: "absolute", left: 0, top: px(STATUS - scroll * K), width: px(600) }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, width: px(600), height: px(STATUS), background: ARTERA.bg }} />
      <Img src={staticFile("artera/artera-meny.jpg")} style={{ position: "absolute", left: 0, top: px(STATUS), width: px(600) }} />
    </div>
  );
};
