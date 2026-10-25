export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Endpoint API Products ---
    if (url.pathname === '/api/products') {
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
          return new Response(JSON.stringify(results || []), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { title, img, price, category, desc } = body;
          await env.DB.prepare(
            "INSERT INTO products (title, img, price, category, desc) VALUES (?, ?, ?, ?, ?)"
          ).bind(title, img, price, category, desc).run();
          return new Response(JSON.stringify({ success: true }), { status: 201 });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }

      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          const { id, title, img, price, category, desc } = body;
          await env.DB.prepare(
            "UPDATE products SET title = ?, img = ?, price = ?, category = ?, desc = ? WHERE id = ?"
          ).bind(title, img, price, category, desc, id).run();
          return new Response(JSON.stringify({ success: true }));
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }

      if (request.method === 'DELETE') {
        try {
          const id = url.searchParams.get("id");
          if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
          await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
          return new Response(JSON.stringify({ success: true }));
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }
    }

    // --- Endpoint API Reviews ---
    if (url.pathname === '/api/reviews') {
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM reviews ORDER BY id DESC").all();
          return new Response(JSON.stringify(results || []), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { name, rating, comment, date } = body;
          await env.DB.prepare(
            "INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, ?)"
          ).bind(name, rating, comment, date).run();
          return new Response(JSON.stringify({ success: true }), { status: 201 });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }
    }

    // Mengalirkan file statis (HTML, CSS, JS) jika request bukan ke API
    return env.ASSETS.fetch(request);
  }
};
        
