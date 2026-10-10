// Cloudflare Pages Function : toutes les requêtes /api/* arrivent ici
import { handle } from '../../lib/core.mjs';
import { d1Store } from '../../lib/d1store.mjs';

export async function onRequest({ request, env }) {
  if (!env.DB) return new Response(JSON.stringify({ error: 'Base de données non liée : ajoute la liaison D1 « DB » dans les réglages du projet Cloudflare' }), { status: 500, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
  return handle(request, d1Store(env.DB), env);
}
