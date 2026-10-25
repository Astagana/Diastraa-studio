export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  if (method === 'GET') {
    try {
      const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
      return Response.json(results || []);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (method === 'POST') {
    try {
      const { title, img, price, category, desc } = await request.json();
      await env.DB.prepare(
        "INSERT INTO products (title, img, price, category, desc) VALUES (?, ?, ?, ?, ?)"
      ).bind(title, img, price, category, desc).run();
      return Response.json({ success: true }, { status: 201 });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
