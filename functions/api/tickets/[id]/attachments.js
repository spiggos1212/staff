import { json, uploadFilesToTicket } from "../../../_utils.js";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB ανά αρχείο
const MAX_FILES = 6;

// POST /api/tickets/:id/attachments?token=...
// -> ο ίδιος ο αιτών προσθέτει επιπλέον αρχεία στο ήδη υπάρχον ticket του,
//    ώστε να μη δημιουργούνται νέα ξεχωριστά tickets κάθε φορά που στέλνει κάτι.
export async function onRequestPost({ params, request, env }) {
  const id = Number(params.id);
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!id || !token) return json({ error: "not_found" }, { status: 404 });

  const ticket = await env.DB.prepare(`SELECT id FROM tickets WHERE id = ? AND access_token = ?`)
    .bind(id, token)
    .first();
  if (!ticket) return json({ error: "not_found" }, { status: 404 });

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_form" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f) => f && typeof f === "object" && "size" in f && f.size > 0);
  if (!files.length) return json({ error: "no_files" }, { status: 400 });

  const { error } = await uploadFilesToTicket(env, id, files, "staff", {
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });
  if (error) return json({ error }, { status: 400 });

  await env.DB.prepare(`UPDATE tickets SET updated_at = datetime('now') WHERE id = ?`).bind(id).run();

  return json({ ok: true });
}
