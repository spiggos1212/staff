import { json, randomToken, CATEGORIES, uploadFilesToTicket } from "../../_utils.js";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB ανά αρχείο
const MAX_FILES = 6;

// POST /api/tickets  -> δημιουργεί νέο αίτημα (multipart/form-data)
export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_form" }, { status: 400 });
  }

  const category = String(form.get("category") || "");
  const fullName = String(form.get("full_name") || "").trim();
  const email = String(form.get("email") || "").trim() || null;
  const phone = String(form.get("phone") || "").trim() || null;
  const details = String(form.get("details") || "").trim() || null;
  const fieldsRaw = String(form.get("fields_json") || "");

  if (!CATEGORIES.has(category)) {
    return json({ error: "invalid_category" }, { status: 400 });
  }
  if (!fullName) {
    return json({ error: "missing_full_name" }, { status: 400 });
  }
  if (!email) {
    return json({ error: "missing_email" }, { status: 400 });
  }

  let fieldsJson = null;
  if (fieldsRaw) {
    try {
      JSON.parse(fieldsRaw); // validation only
      fieldsJson = fieldsRaw;
    } catch {
      return json({ error: "invalid_fields_json" }, { status: 400 });
    }
  }

  const accessToken = randomToken(24);

  const insert = await env.DB.prepare(
    `INSERT INTO tickets (category, full_name, email, phone, details, fields_json, access_token)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(category, fullName, email, phone, details, fieldsJson, accessToken)
    .run();

  const ticketId = insert.meta.last_row_id;

  const files = form.getAll("files").filter((f) => f && typeof f === "object" && "size" in f && f.size > 0);
  const { error } = await uploadFilesToTicket(env, ticketId, files, "staff", {
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });
  if (error) return json({ error }, { status: 400 });

  return json({ id: ticketId, access_token: accessToken });
}
