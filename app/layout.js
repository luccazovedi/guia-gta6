import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";
import { SITE_URL } from "../lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Leonida Log — Guia de GTA VI com tracker 100% e troféus PSN", template: "%s · Leonida Log" },
  description: "Guia fã-made de GTA VI: mapa, missões, troféus, todas as rádios, personagens, dicas e tracker 100% com sincronização PSN.",
  applicationName: "Leonida Log",
  appleWebApp: { capable: true, title: "Leonida Log", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};
export const viewport = { themeColor: "#8e6cf0", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}
