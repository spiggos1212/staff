import { isAdminAuthenticated } from "../../_utils.js";

// GET /api/files/:fileId?token=...  -> κατέβασμα συνημμένου.
// Επιτρέπεται είτε σε συνδεδεμένο admin, είτε σε αιτούντα με το σωστό access_token του ticket.
export async function onRequestGet({ params, request, env }) {
  const id = Number(params.fileId);
  if (!id) return new Response("Not found", { status: 404 });

  const attachment = await env.DB.prepare(
    `SELECT a.filename, a.r2_key, a.content_type, t.access_token
     FROM attachments a JOIN tickets t ON t.id = a.ticket_id
     WHERE a.id = ?`
  )
    .bind(id)
    .first();

  if (!attachment) return new Response("Not found", { status: 404 });

  const token = new URL(request.url).searchParams.get("token") || "";
  const isAdmin = await isAdminAuthenticated(request, env);
  const isOwner = token && token === attachment.access_token;

  if (!isAdmin && !isOwner) {
    return new Response("Forbidden", { status: 403 });
  }

  const object = await env.FILES.get(attachment.r2_key);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "content-type": attachment.content_type || "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
    },
  });
}
