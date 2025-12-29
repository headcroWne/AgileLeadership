export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/responses") {
      const body = await request.json();

      // minimal doğrulama
      if (!body || typeof body !== "object") {
        return new Response("Invalid body", { status: 400 });
      }

      // Tablo yoksa hata alacağız; birazdan migration ile kuracağız.
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO responses (id, payload, created_at) VALUES (?1, ?2, ?3)`
      )
        .bind(id, JSON.stringify(body), createdAt)
        .run();

      return Response.json({ ok: true, id });
    }

    if (request.method === "GET" && url.pathname === "/api/responses") {
      const rows = await env.DB.prepare(
        `SELECT id, payload, created_at FROM responses ORDER BY created_at DESC LIMIT 200`
      ).all();

      return Response.json({ ok: true, rows: rows.results ?? [] });
    }

    return new Response("Not found", { status: 404 });
  },
};
