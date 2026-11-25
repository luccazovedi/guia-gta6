# Leonida Log — Guia de GTA VI

Web app fã-made de GTA VI: mapa de Leonida com camadas e pontos, 91 missões por capítulo (modo sem spoiler), 55 troféus com ficha e roteiro da platina, Tracker 100% com as 35 linhas do menu Progresso, as 23 rádios, personagens, glossário e dicas.

## Recursos
- **Cada tela tem URL própria** (`/missoes/12-buck-me`, `/trofeus/you-wainker`, `/mapa/flamingo`, `/radio/flash`…): o voltar do navegador funciona, links podem ser compartilhados e todas as páginas são geradas estáticas com título, descrição, canonical e Open Graph (SEO). `sitemap.xml` e `robots.txt` são gerados no build.
- **Tudo conectado:** marcar um ponto no mapa soma na linha do Tracker; troféus mostram progresso e levam à camada do mapa, à missão ou ao personagem; a busca encontra lugares do mapa.
- **Perdíveis:** avisos na missão e na ficha do troféu, e filtro "perdíveis" na lista.
- **PWA:** instalável no celular, abre offline (service worker em `public/sw.js`), atalhos para Mapa, Missões, Troféus e Tracker.
- **Progresso:** salvo no navegador; fotos do mapa ficam no IndexedDB (não lotam o armazenamento do progresso). Se o salvamento falhar, o app avisa. Backup por arquivo JSON no Perfil.
- **Conta (Supabase):** login por link no e-mail e progresso na nuvem. A sincronização mescla item a item pela alteração mais recente (inclui desmarcações e remoções), e lê a nuvem antes de enviar, para um aparelho com dados antigos não apagar o que foi feito em outro.
- **PSN (premium):** a Edge Function `psn-sync` do Supabase recebe o NPSSO, autentica pela API não oficial da PSN e devolve os troféus. O NPSSO não é salvo; o servidor guarda só um token de renovação, apagado ao desvincular.

## Estrutura
- `app/[[...slug]]/page.js` — rota única que gera todas as páginas estáticas e os metadados
- `components/App.js` — app (navegação, estado) · `components/views/*` — telas · `components/ui.js` — janela acessível, barras, listas
- `components/LeonidaMap.js` — mapa Leaflet com tiles em `public/tiles`
- `lib/data.js`, `lib/mapdata.js`, `lib/glossary.js` — conteúdo · `lib/links.js` — ligações troféu/missão/mapa/tracker e perdíveis
- `lib/progress.js` — lógica pura (estatísticas, PSN, mesclagem da nuvem) · `lib/store.js` — hooks · `lib/photos.js` — fotos no IndexedDB
- `lib/routes.js`, `lib/seo.js` — URLs e títulos

## Rodar
```bash
npm install
npm run dev
npm test          # testes de mesclagem, PSN, rotas e ligações
npm run icons     # regenera ícones do app e public/og.png
```

Defina `NEXT_PUBLIC_SITE_URL` (ex.: `https://seudominio.com`) para canonical, sitemap e Open Graph usarem o domínio certo. Na Vercel, sem essa variável, é usado o domínio de produção do projeto.

Projeto de fã, sem vínculo com Rockstar Games, Take-Two ou Sony.
