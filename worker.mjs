// Point d'entrée Cloudflare Worker : /api/* → serveur du jeu, le reste → fichiers du dossier public/
import { handle } from './lib/core.mjs';
import { d1Store } from './lib/d1store.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      if (!env.DB) return new Response(JSON.stringify({ error: 'Base de données non liée : vérifie database_id dans wrangler.jsonc' }), { status: 500, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      return handle(request, d1Store(env.DB), env);
    }
    return env.ASSETS.fetch(request);
  },
};
