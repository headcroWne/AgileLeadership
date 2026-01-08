export interface Env {
  // Cloudflare Pages > Settings > Environment variables kısmında tanımlayacağız (sonraki adım)
  GEMINI_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ ok: true, endpoint: "analyze" }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json().catch(() => null);
    const responses = body?.responses;

    if (!Array.isArray(responses) || responses.length === 0) {
      return new Response(JSON.stringify({ ok: true, text: "Analiz edilecek veri yok." }), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Geri bildirimleri tek metinde topla
    const lines: string[] = [];
    for (const r of responses) {
      const fb = r?.feedback;
      if (!fb) continue;
      if (fb.stopDoing) lines.push(`Stop Doing: ${fb.stopDoing}`);
      if (fb.startDoing) lines.push(`Start Doing: ${fb.startDoing}`);
      if (fb.keepDoing) lines.push(`Keep Doing: ${fb.keepDoing}`);
    }

    const feedbackText = lines.length ? lines.join("\n") : "Geri bildirim metni bulunamadı.";

    const prompt = `
Aşağıdaki geri bildirimleri Türkçe olarak analiz et.
- Tekrarlayan temaları gruplandır.
- En kritik 5 bulguyu madde madde yaz.
- "Stop Doing / Start Doing / Keep Doing" için ayrı başlıklar aç.
- Kısa, yönetici özeti formatında yaz.

Geri bildirimler:
${feedbackText}
`.trim();

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(env.GEMINI_API_KEY);

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      }),
    });

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text().catch(() => "");
      return new Response(
        JSON.stringify({ ok: false, error: `Gemini API error: ${geminiRes.status} ${errTxt}` }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const data = await geminiRes.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Analiz raporu oluşturulamadı.";

    return new Response(JSON.stringify({ ok: true, text }), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
