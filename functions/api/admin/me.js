import { json, isAdminAuthenticated } from "../../_utils.js";

// GET /api/admin/me  -> ελέγχει αν το τρέχον session cookie είναι έγκυρο
export async function onRequestGet({ request, env }) {
  const authenticated = await isAdminAuthenticated(request, env);
  return json({ authenticated });
}
