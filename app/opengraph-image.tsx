import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = "TERMO COM MAETHOR E AMIGOS: jogo de palavras em português para jogar com amigos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mesmas três dicas do jogo: certa (escuro), posição errada (médio), ausente (claro).
const TILES: [string, string, string][] = [
  ["T", "#272727", "#ffffff"], ["E", "#545454", "#ffffff"], ["R", "#eaeaea", "#808080"],
  ["M", "#eaeaea", "#808080"], ["O", "#272727", "#ffffff"],
];

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fbfbfb", color: "#272727" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {TILES.map(([letter, bg, fg], i) => (
            <div key={i} style={{ width: 120, height: 120, borderRadius: 24, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 800 }}>{letter}</div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 32, color: "#545454" }}>Jogo de palavras em português para jogar com amigos</div>
      </div>
    ),
    { ...size },
  );
}
