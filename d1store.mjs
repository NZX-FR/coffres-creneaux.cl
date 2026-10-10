// Stockage clé → JSON au-dessus de Cloudflare D1 (SQLite), même interface que Netlify Blobs
export function d1Store(db) {
  let ready = null;
  const init = () => (ready ??= db.prepare('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, e INTEGER NOT NULL DEFAULT 1)').run());
  const parse = (r, o) => (o && o.type === 'json' ? JSON.parse(r.v) : r.v);
  return {
    async get(k, o) { await init(); const r = await db.prepare('SELECT v FROM kv WHERE k = ?').bind(k).first(); return r ? parse(r, o) : null; },
    async getWithMetadata(k, o) { await init(); const r = await db.prepare('SELECT v, e FROM kv WHERE k = ?').bind(k).first(); return r ? { data: parse(r, o), etag: String(r.e), metadata: {} } : null; },
    async setJSON(k, val, o = {}) {
      await init(); const v = JSON.stringify(val); let res;
      if (o.onlyIfMatch) res = await db.prepare('UPDATE kv SET v = ?, e = e + 1 WHERE k = ? AND e = ?').bind(v, k, +o.onlyIfMatch).run();
      else if (o.onlyIfNew) res = await db.prepare('INSERT OR IGNORE INTO kv (k, v, e) VALUES (?, ?, 1)').bind(k, v).run();
      else res = await db.prepare('INSERT INTO kv (k, v, e) VALUES (?, ?, 1) ON CONFLICT(k) DO UPDATE SET v = excluded.v, e = kv.e + 1').bind(k, v).run();
      return { modified: ((res && res.meta && res.meta.changes) || 0) > 0 };
    },
    async delete(k) { await init(); await db.prepare('DELETE FROM kv WHERE k = ?').bind(k).run(); },
  };
}
