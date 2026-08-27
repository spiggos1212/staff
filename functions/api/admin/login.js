import { json, createSessionCookie } from "../../_utils.js";

// POST /api/admin/login  { password }
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }

  const password = String(body.password || "");
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return json({ error: "invalid_password" }, { status: 401 });
  }

  const cookie = await createSessionCookie(env);
  return json({ ok: true }, { headers: { "set-cookie": cookie } });
}
