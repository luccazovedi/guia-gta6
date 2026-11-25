export default function manifest() {
  return {
    name: "Leonida Log — Guia de GTA VI",
    short_name: "Leonida Log",
    description: "Mapa, missões, troféus, rádios e tracker 100% de GTA VI.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2a1650",
    theme_color: "#8e6cf0",
    lang: "pt-BR",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mapa", url: "/mapa" },
      { name: "Missões", url: "/missoes" },
      { name: "Troféus", url: "/trofeus" },
      { name: "Tracker 100%", url: "/100" },
    ],
  };
}
