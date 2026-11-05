import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Rastreadores de IA liberados (busca e treinamento), como combinado. Para bloquear os de treinamento,
// troque "allow" por "disallow" para GPTBot, Google-Extended, Applebot-Extended, CCBot e Meta-ExternalAgent.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot",
  "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Amazonbot", "Meta-ExternalAgent", "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_BOTS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
