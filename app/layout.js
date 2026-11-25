import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";

export const metadata = {
  title: "Leonida Log — Guia de GTA VI com tracker 100% e troféus PSN",
  description: "Guia fã-made de GTA VI: mapa, 91 missões, 55 troféus, todas as rádios, personagens, dicas e tracker 100% com sincronização PSN.",
};
export const viewport = { themeColor: "#120a1f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
