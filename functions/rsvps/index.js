// GET /rsvps — λίστα δηλώσεων συμμετοχής (πίσω από Basic Auth, βλ. _middleware.js).

export async function onRequestGet(context) {
  const { env } = context;

  const { results } = await env.DB.prepare(
    'SELECT id, name, attending, guest_count, comment, created_at FROM rsvps ORDER BY created_at DESC'
  ).all();

  const totalYes = results.filter((r) => r.attending).length;
  const totalGuests = results.filter((r) => r.attending).reduce((sum, r) => sum + (r.guest_count || 0), 0);
  const totalNo = results.length - totalYes;

  const rows = results
    .map(
      (r) => `
        <tr>
          <td>${escapeHtml(r.name)}</td>
          <td class="${r.attending ? 'yes' : 'no'}">${r.attending ? 'Ναι' : 'Όχι'}</td>
          <td>${r.attending ? r.guest_count : '—'}</td>
          <td>${escapeHtml(r.comment || '')}</td>
          <td class="ts">${escapeHtml(r.created_at)}</td>
          <td><a class="edit" href="/rsvps/edit/${r.id}">Επεξεργασία</a></td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Δηλώσεις συμμετοχής</title>
<style>
  body{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#faf9f5; color:#2b2a26; margin:0; padding:32px 20px; }
  h1{ font-size:20px; margin:0 0 4px; }
  .stats{ color:#746f64; font-size:14px; margin-bottom:8px; }
  .top-link{ display:inline-block; font-size:13px; color:#8c6c30; text-decoration:none; margin-bottom:20px; }
  .top-link:hover{ text-decoration:underline; }
  table{ border-collapse:collapse; width:100%; max-width:900px; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
  th, td{ text-align:left; padding:9px 12px; border-bottom:1px solid #eee; font-size:14px; }
  th{ background:#f3f1ec; font-weight:600; }
  td.yes{ color:#3a7d44; font-weight:600; }
  td.no{ color:#b23b3b; }
  td.ts{ color:#999; font-size:12px; white-space:nowrap; }
  a.edit{ color:#8c6c30; font-size:13px; text-decoration:none; white-space:nowrap; }
  a.edit:hover{ text-decoration:underline; }
  .empty{ color:#999; padding:20px 0; }
</style>
</head>
<body>
  <h1>Δηλώσεις συμμετοχής</h1>
  <p class="stats">${results.length} απαντήσεις &middot; ${totalYes} έρχονται (${totalGuests} άτομα) &middot; ${totalNo} δεν έρχονται</p>
  <a class="top-link" href="/rsvps/invitation">&#9998; Επεξεργασία στοιχείων πρόσκλησης (ονόματα, ημερομηνία, κτήμα...)</a>
  ${
    results.length
      ? `<table>
    <thead><tr><th>Όνομα</th><th>Έρχεται</th><th>Άτομα</th><th>Σχόλιο</th><th>Ημερομηνία</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
      : '<p class="empty">Δεν υπάρχουν ακόμα απαντήσεις.</p>'
  }
</body>
</html>`;

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
