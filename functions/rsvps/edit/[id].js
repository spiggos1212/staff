// GET  /rsvps/edit/:id — φόρμα επεξεργασίας μιας δήλωσης συμμετοχής.
// POST /rsvps/edit/:id — αποθηκεύει τις αλλαγές και επιστρέφει στη λίστα.
// Προστατεύεται από το ίδιο Basic Auth με το /rsvps (βλ. ../_middleware.js).

import { escapeHtml } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return notFound();

  const row = await env.DB.prepare(
    'SELECT id, name, attending, guest_count, comment FROM rsvps WHERE id = ?'
  )
    .bind(id)
    .first();

  if (!row) return notFound();

  return new Response(renderForm(row, null), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return notFound();

  const existing = await env.DB.prepare('SELECT id FROM rsvps WHERE id = ?').bind(id).first();
  if (!existing) return notFound();

  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const attending = form.get('attending') === 'yes' ? 1 : 0;
  let guestCount = Number.parseInt(form.get('guestCount'), 10);
  const comment = String(form.get('comment') || '').trim().slice(0, 500);

  if (!name || name.length > 120) {
    const row = { id, name, attending, guest_count: guestCount, comment };
    return new Response(renderForm(row, 'Το όνομα είναι υποχρεωτικό (έως 120 χαρακτήρες).'), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) guestCount = 1;
  if (attending === 0) guestCount = 0;

  await env.DB.prepare(
    'UPDATE rsvps SET name = ?, attending = ?, guest_count = ?, comment = ? WHERE id = ?'
  )
    .bind(name, attending, guestCount, comment || null, id)
    .run();

  return Response.redirect(new URL('/rsvps', request.url).toString(), 303);
}

function notFound() {
  return new Response('Δεν βρέθηκε η δήλωση.', { status: 404 });
}

function renderForm(row, error) {
  return `<!doctype html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Επεξεργασία δήλωσης</title>
<style>
  body{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#faf9f5; color:#2b2a26; margin:0; padding:32px 20px; }
  .box{ max-width:440px; margin:0 auto; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.08); padding:28px 26px; }
  h1{ font-size:18px; margin:0 0 20px; }
  label{ display:block; font-size:13px; color:#746f64; margin:16px 0 5px; }
  input[type=text], input[type=number], textarea{ width:100%; padding:8px 10px; border:1px solid #d8d2c2; border-radius:5px; font-size:14px; font-family:inherit; box-sizing:border-box; }
  textarea{ min-height:70px; resize:vertical; }
  .toggle{ display:flex; gap:8px; margin-top:4px; }
  .toggle label{ flex:1; margin:0; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px; border:1px solid #d8d2c2; border-radius:5px; font-size:14px; color:#2b2a26; cursor:pointer; }
  .toggle input{ margin:0; }
  .actions{ display:flex; gap:10px; margin-top:22px; }
  button{ font-family:inherit; font-size:13px; font-weight:600; padding:10px 18px; border-radius:5px; border:1px solid #ad8a44; background:#8c6c30; color:#fff; cursor:pointer; }
  a.cancel{ font-size:13px; color:#746f64; align-self:center; text-decoration:none; }
  .error{ color:#b23b3b; font-size:13px; margin:0 0 14px; }
  #guests-field{ display:none; }
  #guests-field.show{ display:block; }
</style>
</head>
<body>
  <div class="box">
    <h1>Επεξεργασία δήλωσης</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST">
      <label for="name">Ονοματεπώνυμο</label>
      <input type="text" id="name" name="name" maxlength="120" required value="${escapeHtml(row.name || '')}">

      <label>Θα είναι μαζί μας;</label>
      <div class="toggle">
        <label><input type="radio" name="attending" value="yes" ${row.attending ? 'checked' : ''} onchange="document.getElementById('guests-field').classList.add('show')"> Ναι</label>
        <label><input type="radio" name="attending" value="no" ${row.attending ? '' : 'checked'} onchange="document.getElementById('guests-field').classList.remove('show')"> Όχι</label>
      </div>

      <div id="guests-field" class="${row.attending ? 'show' : ''}">
        <label for="guestCount">Αριθμός ατόμων</label>
        <input type="number" id="guestCount" name="guestCount" min="1" max="20" value="${row.guest_count || 1}">
      </div>

      <label for="comment">Σχόλιο</label>
      <textarea id="comment" name="comment" maxlength="500">${escapeHtml(row.comment || '')}</textarea>

      <div class="actions">
        <button type="submit">Αποθήκευση</button>
        <a class="cancel" href="/rsvps">Άκυρο</a>
      </div>
    </form>
  </div>
</body>
</html>`;
}
