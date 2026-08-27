import { json, clearSessionCookie } from "../../_utils.js";

// POST /api/admin/logout
export async function onRequestPost() {
  return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
}
