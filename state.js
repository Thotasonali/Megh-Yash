// Shared state API for the Yash & Megh DSA tracker.
// Storage: one private JSON blob (state.json) in the linked Vercel Blob store.
// The store is linked to the project so Vercel injects BLOB_READ_WRITE_TOKEN.
// If the token is missing (store not linked yet) the API reports
// { configured:false } and the frontend falls back to per-device storage
// with a visible banner — it never pretends shared sync is working.
import { put, list } from '@vercel/blob';

const EMPTY = { logs: { yash: {}, megh: {} }, topics: { yash: {}, megh: {} }, weekend: [], qa: [] };

function ok(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

async function readState(token) {
  const { blobs } = await list({ prefix: 'state.json', limit: 1, token });
  if (!blobs.length) return { ...EMPTY, logs: { yash: {}, megh: {} }, topics: { yash: {}, megh: {} }, weekend: [], qa: [] };
  const res = await fetch(blobs[0].url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) return { ...EMPTY, logs: { yash: {}, megh: {} }, topics: { yash: {}, megh: {} }, weekend: [], qa: [] };
  const data = await res.json();
  return {
    logs: { yash: (data.logs && data.logs.yash) || {}, megh: (data.logs && data.logs.megh) || {} },
    topics: { yash: (data.topics && data.topics.yash) || {}, megh: (data.topics && data.topics.megh) || {} },
    weekend: Array.isArray(data.weekend) ? data.weekend : [],
    qa: Array.isArray(data.qa) ? data.qa : [],
  };
}

export default async function handler(req) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return ok({ configured: false, ...EMPTY, note: 'Blob store not linked yet. Link the dsa-progress Blob store to this project in the Vercel dashboard, then redeploy.' });

  try {
    if (req.method === 'GET') {
      const state = await readState(token);
      return ok({ configured: true, ...state });
    }
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const state = await readState(token);
      const person = body.person === 'megh' ? 'megh' : 'yash';

      if (body.action === 'toggleDay' && typeof body.dayId === 'string') {
        const cur = state.logs[person][body.dayId] || {};
        if (cur.done) delete state.logs[person][body.dayId];
        else state.logs[person][body.dayId] = { done: true, note: cur.note || '', at: new Date().toISOString() };
      } else if (body.action === 'setNote' && typeof body.dayId === 'string') {
        const cur = state.logs[person][body.dayId] || {};
        state.logs[person][body.dayId] = { ...cur, done: !!cur.done, note: String(body.note || '').slice(0, 1000), at: new Date().toISOString() };
      } else if (body.action === 'setTopic' && typeof body.topicId === 'string') {
        state.topics[person][body.topicId] = body.status === 'done' ? 'done' : body.status === 'learning' ? 'learning' : 'not_started';
      } else if (body.action === 'logWeekend' && body.entry && typeof body.entry === 'object') {
        state.weekend.unshift({ id: 'w' + Date.now(), person, ...body.entry, at: new Date().toISOString() });
        state.weekend = state.weekend.slice(0, 100);
      } else if (body.action === 'saveQa' && body.entry && typeof body.entry === 'object') {
        state.qa.unshift({ id: 'q' + Date.now(), person, ...body.entry, at: new Date().toISOString() });
        state.qa = state.qa.slice(0, 100);
      } else if (body.action === 'deleteQa' && typeof body.id === 'string') {
        state.qa = state.qa.filter((q) => q.id !== body.id);
      } else if (body.action === 'deleteWeekend' && typeof body.id === 'string') {
        state.weekend = state.weekend.filter((w) => w.id !== body.id);
      } else {
        return ok({ error: 'unknown action' }, 400);
      }

      await put('state.json', JSON.stringify(state), { access: 'private', addRandomSuffix: false, contentType: 'application/json', token });
      return ok({ configured: true, ...state });
    }
    return ok({ error: 'method not allowed' }, 405);
  } catch (e) {
    return ok({ configured: true, error: 'state store error: ' + (e && e.message ? e.message : 'unknown') }, 500);
  }
}
