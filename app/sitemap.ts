import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Só as páginas públicas. Perfil, salas, desafios, ranking e amigos exigem login e não entram aqui.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/como-jogar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
