import { json, requireAdmin, CATEGORIES, CATEGORY_LABELS, STATUSES } from "../../../_utils.js";

// GET /api/admin/tickets?category=&status=&archived=active|archived|all  -> λίστα αιτημάτων
export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "";
  const status = url.searchParams.get("status") || "";
  const archived = url.searchParams.get("archived") || "active";

  const conditions = [];
  const binds = [];
  if (CATEGORIES.has(category)) {
    conditions.push("category = ?");
    binds.push(category);
  }
  if (STATUSES.has(status)) {
    conditions.push("status = ?");
    binds.push(status);
  }
  if (archived === "active") {
    conditions.push("archived = 0");
  } else if (archived === "archived") {
    conditions.push("archived = 1");
  } // archived === "all" -> χωρίς φίλτρο
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(
    `SELECT t.id, t.category, t.full_name, t.email, t.phone, t.status, t.archived, t.created_at, t.updated_at,
            (SELECT COUNT(*) FROM attachments a WHERE a.ticket_id = t.id AND a.uploaded_by = 'staff') AS staff_files,
            (SELECT COUNT(*) FROM attachments a WHERE a.ticket_id = t.id AND a.uploaded_by = 'admin') AS admin_files
     FROM tickets t
     ${where}
     ORDER BY t.created_at DESC`
  )
    .bind(...binds)
    .all();

  const tickets = results.map((t) => ({ ...t, category_label: CATEGORY_LABELS[t.category] || t.category }));
  return json({ tickets });
}
