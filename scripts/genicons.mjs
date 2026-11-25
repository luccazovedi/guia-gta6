// Gera ícones do app (PWA/iOS) e a imagem de compartilhamento (Open Graph) a partir de SVG.
// Uso: node scripts/genicons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

const icon = readFileSync("public/icon.svg");
const out = (buf, size, file) => sharp(buf, { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
await out(icon, 192, "public/icons/icon-192.png");
await out(icon, 512, "public/icons/icon-512.png");
await out(icon, 180, "public/icons/apple-touch-icon.png");

// maskable: ícone com margem de segurança e fundo cheio
const inner = await sharp(icon, { density: 300 }).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#8e6cf0" } })
  .composite([{ input: inner, top: 76, left: 76 }]).png().toFile("public/icons/maskable-512.png");

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8e6cf0"/><stop offset=".45" stop-color="#e58bd6"/><stop offset="1" stop-color="#f9bf98"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1010" cy="170" r="120" fill="#fff" opacity=".25"/>
  <g transform="translate(90 70) scale(.36)">${icon.toString().replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="90" y="400" font-family="Inter Display, Inter" font-weight="800" font-size="96" fill="#2a1650">Leonida Log</text>
  <text x="92" y="470" font-family="Inter" font-weight="600" font-size="40" fill="#3b1a5c">Guia de GTA VI: mapa, missões, troféus e tracker 100%</text>
  <text x="92" y="560" font-family="Inter" font-size="26" fill="#3b1a5c" opacity=".8">Projeto de fã, sem vínculo com Rockstar Games</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile("public/og.png");
console.log("ok");
