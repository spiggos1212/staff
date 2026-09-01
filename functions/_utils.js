// Κοινές βοηθητικές συναρτήσεις για όλα τα Functions.

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

export function randomToken(bytes = 24) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 μέρες

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionCookie(env) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = await hmac(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

// Επιστρέφει true/false αν το αίτημα έχει έγκυρο admin session cookie.
export async function isAdminAuthenticated(request, env) {
  const cookies = parseCookies(request);
  const value = cookies[COOKIE_NAME];
  if (!value) return false;
  const dotIdx = value.indexOf(".");
  if (dotIdx === -1) return false;
  const payload = value.slice(0, dotIdx);
  const sig = value.slice(dotIdx + 1);
  const expected = await hmac(env.SESSION_SECRET, payload);
  if (sig !== expected) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

export function requireAdmin(request, env) {
  return isAdminAuthenticated(request, env).then((ok) =>
    ok ? null : json({ error: "unauthorized" }, { status: 401 })
  );
}

export const CATEGORIES = new Set(["proslipseis", "adeies", "bebaioseis", "ergasia"]);
export const CATEGORY_LABELS = {
  proslipseis: "Προσλήψεις",
  adeies: "Άδειες",
  bebaioseis: "Βεβαιώσεις",
  ergasia: "Αίτηση Εργασίας / Βιογραφικό",
};

// 'approved'/'rejected' χρησιμοποιούνται κυρίως από τις Άδειες (κουμπιά Έγκριση/Απόρριψη),
// αλλά επιτρέπονται σε όλες τις κατηγορίες για ευελιξία.
export const STATUSES = new Set(["pending", "in_progress", "done", "approved", "rejected"]);

// Ανεβάζει ένα σύνολο αρχείων στο R2 και καταχωρεί τα αντίστοιχα attachments στη D1.
// Επιστρέφει { error } — error === null σημαίνει επιτυχία. Χρησιμοποιείται και από τον
// αιτούντα (uploadedBy: 'staff') και από τον admin (uploadedBy: 'admin').
export async function uploadFilesToTicket(env, ticketId, files, uploadedBy, { maxSize, maxFiles }) {
  if (files.length > maxFiles) {
    return { error: "too_many_files" };
  }
  for (const file of files) {
    if (file.size > maxSize) {
      return { error: "file_too_large", filename: file.name };
    }
  }
  for (const file of files) {
    const key = `tickets/${ticketId}/${randomToken(8)}-${file.name}`;
    await env.FILES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    await env.DB.prepare(
      `INSERT INTO attachments (ticket_id, uploaded_by, filename, r2_key, content_type, size)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(ticketId, uploadedBy, file.name, key, file.type || null, file.size)
      .run();
  }
  return { error: null };
}
