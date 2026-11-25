# Leonida Log — Guia de GTA VI

Web app fã-made de GTA VI: mapa estilizado de Leonida com pins, 91 missões por capítulo (modo sem spoiler), 55 troféus, tracker das 35 linhas de 100%, as 23 estações de rádio, personagens e dicas. Progresso salvo no navegador.

## Conexão PSN
`POST /api/psn` recebe o NPSSO do usuário, autentica via [psn-api](https://github.com/achievements-app/psn-api), encontra o GTA VI na lista de troféus e devolve os troféus conquistados. O token não é salvo em lugar nenhum. A API da PSN usada é não oficial.

## Rodar
```bash
npm install
npm run dev
```

Projeto de fã, sem vínculo com Rockstar Games, Take-Two ou Sony.
