export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  if (method === 'GET') {
    try {
      const { results } = await env.DB.prepare("SELECT * FROM reviews ORDER BY id DESC").all();
      return Response.json(results || []);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (method === 'POST') {
    try {
      const { name, rating, comment, date } = await request.json();
      await env.DB.prepare(
        "INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, ?)"
      ).bind(name, rating, comment, date).run();
      return Response.json({ success: true }, { status: 201 });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
