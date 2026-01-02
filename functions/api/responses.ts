export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare(
    `SELECT id, payload, created_at FROM responses ORDER BY created_at DESC LIMIT 200`
  ).all();

  return new Response(JSON.stringify({ ok: true, rows: rows.results ?? [] }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json();

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO responses (id, payload, created_at) VALUES (?1, ?2, ?3)`
  )
    .bind(id, JSON.stringify(body), createdAt)
    .run();

  return new Response(JSON.stringify({ ok: true, id }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env }) => {
  await env.DB.prepare(
    'DELETE FROM responses'
  ).run();

  return new Response(
    JSON.stringify({ ok: true }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
};
