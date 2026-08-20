// Κοινές συναρτήσεις για τα admin functions (rsvps/*).
// Το "_" στο όνομα το κρατάει έξω από το routing του Cloudflare Pages.

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
