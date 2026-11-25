import {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  getUserTitles,
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
  getProfileFromAccountId,
} from "psn-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// O NPSSO nunca é salvo no servidor: é usado só nesta requisição.
export async function POST(req) {
  try {
    const { npsso } = await req.json();
    if (!npsso || typeof npsso !== "string" || npsso.length < 40) {
      return Response.json({ error: "Token NPSSO inválido." }, { status: 400 });
    }

    const code = await exchangeNpssoForAccessCode(npsso.trim());
    const auth = await exchangeAccessCodeForAuthTokens(code);

    let onlineId = null;
    try {
      const p = await getProfileFromAccountId(auth, "me");
      onlineId = p?.onlineId ?? null;
    } catch {}

    // Procura o GTA VI na lista de jogos com troféus do usuário
    let title = null;
    let offset = 0;
    for (let page = 0; page < 6 && !title; page++) {
      const res = await getUserTitles(auth, "me", { limit: 200, offset });
      title = res.trophyTitles.find((t) =>
        /grand theft auto vi\b|gta vi\b|grand theft auto 6/i.test(t.trophyTitleName)
      );
      if (!res.nextOffset) break;
      offset = res.nextOffset;
    }

    if (!title) {
      return Response.json({ onlineId, found: false });
    }

    const svc = { npServiceName: title.npServiceName || "trophy2" };
    const [{ trophies: all }, { trophies: earned }] = await Promise.all([
      getTitleTrophies(auth, title.npCommunicationId, "all", svc),
      getUserTrophiesEarnedForTitle(auth, "me", title.npCommunicationId, "all", svc),
    ]);

    const earnedMap = new Map(earned.map((t) => [t.trophyId, t]));
    const trophies = all.map((t) => {
      const e = earnedMap.get(t.trophyId);
      return {
        name: t.trophyName,
        type: t.trophyType,
        earned: !!e?.earned,
        earnedAt: e?.earnedDateTime ?? null,
      };
    });

    return Response.json({
      onlineId,
      found: true,
      title: title.trophyTitleName,
      progress: title.progress,
      earnedCounts: title.earnedTrophies,
      trophies,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = String(err?.message || err);
    const status = /npsso|auth|401|invalid/i.test(msg) ? 401 : 500;
    return Response.json(
      { error: status === 401 ? "Não foi possível autenticar na PSN. Gere um NPSSO novo e tente de novo." : "Falha ao consultar a PSN.", detail: msg.slice(0, 200) },
      { status }
    );
  }
}
