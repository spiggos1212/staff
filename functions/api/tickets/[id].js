import { json, CATEGORY_LABELS } from "../../_utils.js";

async function loadTicketPayload(env, id, token) {
  const ticket = await env.DB.prepare(
    `SELECT id, category, full_name, email, phone, details, fields_json, status, admin_note, created_at, updated_at
     FROM tickets WHERE id = ? AND access_token = ?`
  )
    .bind(id, token)
    .first();

  if (!ticket) return null;

  const { results: attachments } = await env.DB.prepare(
    `SELECT id, uploaded_by, filename, content_type, size, created_at
     FROM attachments WHERE ticket_id = ? ORDER BY created_at ASC`
  )
    .bind(id)
    .all();

  return {
    ...ticket,
    category_label: CATEGORY_LABELS[ticket.category] || ticket.category,
    attachments,
  };
}

// GET /api/tickets/:id?token=...  -> ο αιτών ελέγχει την κατάσταση του δικού του αιτήματος
export async function onRequestGet({ params, request, env }) {
  const id = Number(params.id);
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!id || !token) return json({ error: "not_found" }, { status: 404 });

  const payload = await loadTicketPayload(env, id, token);
  if (!payload) return json({ error: "not_found" }, { status: 404 });

  return json(payload);
}

// PATCH /api/tickets/:id?token=...  { full_name?, email?, phone?, details?, fields_json? }
// -> ο ίδιος ο αιτών επεξεργάζεται τα στοιχεία που είχε υποβάλει, χωρίς να χρειάζεται νέο αίτημα.
export async function onRequestPatch({ params, request, env }) {
  const id = Number(params.id);
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!id || !token) return json({ error: "not_found" }, { status: 404 });

  const exists = await env.DB.prepare(`SELECT id FROM tickets WHERE id = ? AND access_token = ?`)
    .bind(id, token)
    .first();
  if (!exists) return json({ error: "not_found" }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }

  const updates = [];
  const binds = [];
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
  binds.push(id, token);

  await env.DB.prepare(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ? AND access_token = ?`)
    .bind(...binds)
    .run();

  const payload = await loadTicketPayload(env, id, token);
  return json(payload);
}
