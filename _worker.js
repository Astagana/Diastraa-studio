export default {
  async fetch(request, env) {
    const { results } = await env.DB.prepare("SELECT * FROM users LIMIT 10").all();
    return Response.json(results);
  },
};
