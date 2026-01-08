export interface Env {
  // Cloudflare Pages > Settings > Environment variables kısmında tanımlayacağız (sonraki adım)
  GEMINI_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ ok: true, endpoint: "analyze" }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
