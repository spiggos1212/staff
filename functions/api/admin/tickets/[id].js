import { json, requireAdmin, CATEGORY_LABELS, STATUSES } from "../../../_utils.js";

// GET /api/admin/tickets/:id  -> λεπτομέρειες αιτήματος + συνημμένα
export async function onRequestGet({ params, request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
  if (!ticket) return json({ error: "not_found" }, { status: 404 });

  const { results: attachments } = await env.DB.prepare(
    `SELECT id, uploaded_by, filename, content_type, size, created_at
     FROM attachments WHERE ticket_id = ? ORDER BY created_at ASC`
  )
    .bind(id)
    .all();

  return json({ ...ticket, category_label: CATEGORY_LABELS[ticket.category] || ticket.category, attachments });
}

// PATCH /api/admin/tickets/:id  { status?, admin_note?, archived?, full_name?, email?, phone?, details?, fields_json? }
// -> ενημέρωση κατάστασης/σημείωσης/αρχειοθέτησης, ή επεξεργασία των ίδιων των στοιχείων του αιτήματος
// (χρήσιμο π.χ. στις Προσλήψεις, όπου ο admin συχνά συμπληρώνει ο ίδιος κάποια πεδία).
export async function onRequestPatch({ params, request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }

  const updates = [];
  const binds = [];
  if (body.status && STATUSES.has(body.status)) {
    updates.push("status = ?");
    binds.push(body.status);
  }
  if (typeof body.admin_note === "string") {
    updates.push("admin_note = ?");
    binds.push(body.admin_note);
  }
  if (typeof body.archived === "boolean") {
    updates.push("archived = ?");
    binds.push(body.archived ? 1 : 0);
  }
  if (typeof body.full_name === "string" && body.full_name.trim()) {
    updates.push("full_name = ?");
    binds.push(body.full_name.trim());
  }
  if (typeof body.email === "string" && body.email.trim()) {
    updates.push("email = ?");
    binds.push(body.email.trim());
  }
  if (typeof body.phone === "string") {
    updates.push("phone = ?");
    binds.push(body.phone.trim() || null);
  }
  if (typeof body.details === "string") {
    updates.push("details = ?");
    binds.push(body.details.trim() || null);
  }
  if (typeof body.fields_json === "string") {
    try {
      JSON.parse(body.fields_json);
    } catch {
      return json({ error: "invalid_fields_json" }, { status: 400 });
    }
    updates.push("fields_json = ?");
    binds.push(body.fields_json);
  }
  if (!updates.length) return json({ error: "nothing_to_update" }, { status: 400 });

  updates.push("updated_at = datetime('now')");
  binds.push(id);

  const result = await env.DB.prepare(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();
  if (!result.meta.changes) return json({ error: "not_found" }, { status: 404 });

  return json({ ok: true });
}

// DELETE /api/admin/tickets/:id  -> οριστική διαγραφή ticket + συνημμένων (D1 + R2)
export async function onRequestDelete({ params, request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  const ticket = await env.DB.prepare(`SELECT id FROM tickets WHERE id = ?`).bind(id).first();
  if (!ticket) return json({ error: "not_found" }, { status: 404 });

  const { results: attachments } = await env.DB.prepare(`SELECT r2_key FROM attachments WHERE ticket_id = ?`)
    .bind(id)
    .all();
  for (const a of attachments) {
    await env.FILES.delete(a.r2_key);
  }

  await env.DB.prepare(`DELETE FROM attachments WHERE ticket_id = ?`).bind(id).run();
  await env.DB.prepare(`DELETE FROM tickets WHERE id = ?`).bind(id).run();

  return json({ ok: true });
}
