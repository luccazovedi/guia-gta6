import { allPaths } from "../lib/routes";
import { SITE_URL } from "../lib/seo";

export default function sitemap() {
  const now = new Date();
  return allPaths().map((p) => ({
    url: SITE_URL + p,
    lastModified: now,
    changeFrequency: p === "/" || p === "/novidades" ? "daily" : "weekly",
    priority: p === "/" ? 1 : p.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
