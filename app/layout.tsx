import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import AuthGate from "@/components/AuthGate";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["jogo de palavras", "adivinhar palavras", "jogo de palavras em português", "jogo multiplayer", "jogar com amigos", "palavra do dia", "jogo online grátis"],
  authors: [{ name: SITE_NAME }],
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE_NAME, title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  // Padrão: não indexar. Só a home, "Como jogar" e "Sobre" liberam a indexação (cada uma no próprio arquivo).
  robots: { index: false, follow: false },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "hcpmaaz3nhmxsR0MVtou9OBrrwOD80eGf_kPHMq7qpU",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#272727" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={font.variable}>
      <body>
        <AuthGate>{children}</AuthGate>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
