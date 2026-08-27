import { json, requireAdmin, uploadFilesToTicket } from "../../../../_utils.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB ανά αρχείο
const MAX_FILES = 6;

// POST /api/admin/tickets/:id/upload  (multipart/form-data, πεδίο "files")
// -> ο admin ανεβάζει το/τα έγγραφο(α) που ζητήθηκαν, ώστε ο αιτών να τα κατεβάσει
export async function onRequestPost({ params, request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  const ticket = await env.DB.prepare(`SELECT id FROM tickets WHERE id = ?`).bind(id).first();
  if (!ticket) return json({ error: "not_found" }, { status: 404 });

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_form" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f) => f && typeof f === "object" && "size" in f && f.size > 0);
  if (!files.length) return json({ error: "no_files" }, { status: 400 });

  const { error } = await uploadFilesToTicket(env, id, files, "admin", {
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });
  if (error) return json({ error }, { status: 400 });

  await env.DB.prepare(`UPDATE tickets SET updated_at = datetime('now') WHERE id = ?`).bind(id).run();

  return json({ ok: true });
}
