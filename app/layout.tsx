import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font" });

export const metadata: Metadata = {
  title: "TERMO COM MAETHOR E AMIGOS",
  description: "Jogo de adivinhar palavras para jogar com os amigos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
