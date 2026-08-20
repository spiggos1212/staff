// GET  /rsvps/invitation — φόρμα επεξεργασίας των στοιχείων της πρόσκλησης.
// POST /rsvps/invitation — αποθηκεύει τις αλλαγές (μονή γραμμή, id = 1).
// Προστατεύεται από το ίδιο Basic Auth με το /rsvps (βλ. _middleware.js).

import { escapeHtml } from '../_utils.js';

export async function onRequestGet(context) {
  const { env } = context;
  const row = await env.DB.prepare(
    'SELECT groom_name, groom_surname, bride_name, bride_surname, event_date, event_time, venue, kb_bride, kb_groom FROM invitation WHERE id = 1'
  ).first();

  return new Response(renderForm(row || {}, null, null), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const form = await request.formData();

  const fields = {
    groom_name: String(form.get('groom_name') || '').trim(),
    groom_surname: String(form.get('groom_surname') || '').trim(),
    bride_name: String(form.get('bride_name') || '').trim(),
    bride_surname: String(form.get('bride_surname') || '').trim(),
    event_date: String(form.get('event_date') || '').trim(),
    event_time: String(form.get('event_time') || '').trim(),
    venue: String(form.get('venue') || '').trim(),
    kb_bride: String(form.get('kb_bride') || '').trim(),
    kb_groom: String(form.get('kb_groom') || '').trim(),
  };

  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.length > 200) {
      return new Response(renderForm(fields, `Το πεδίο "${key}" είναι υποχρεωτικό (έως 200 χαρακτήρες).`, null), {
        status: 400,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.event_date)) {
    return new Response(renderForm(fields, 'Μη έγκυρη ημερομηνία.', null), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  if (!/^\d{2}:\d{2}$/.test(fields.event_time)) {
    return new Response(renderForm(fields, 'Μη έγκυρη ώρα.', null), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  await env.DB.prepare(
    `UPDATE invitation SET
       groom_name = ?, groom_surname = ?, bride_name = ?, bride_surname = ?,
       event_date = ?, event_time = ?, venue = ?, kb_bride = ?, kb_groom = ?,
       updated_at = datetime('now')
     WHERE id = 1`
  )
    .bind(
      fields.groom_name,
      fields.groom_surname,
      fields.bride_name,
      fields.bride_surname,
      fields.event_date,
      fields.event_time,
      fields.venue,
      fields.kb_bride,
      fields.kb_groom
    )
    .run();

  return new Response(renderForm(fields, null, 'Αποθηκεύτηκε!'), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function renderForm(f, error, success) {
  return `<!doctype html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Στοιχεία πρόσκλησης</title>
<style>
  body{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#faf9f5; color:#2b2a26; margin:0; padding:32px 20px; }
  .box{ max-width:520px; margin:0 auto; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.08); padding:28px 26px; }
  h1{ font-size:18px; margin:0 0 20px; }
  .row{ display:flex; gap:12px; }
  .row > div{ flex:1; }
  label{ display:block; font-size:13px; color:#746f64; margin:16px 0 5px; }
  input[type=text], input[type=date], input[type=time]{ width:100%; padding:8px 10px; border:1px solid #d8d2c2; border-radius:5px; font-size:14px; font-family:inherit; box-sizing:border-box; }
  .actions{ display:flex; gap:10px; margin-top:22px; align-items:center; }
  button{ font-family:inherit; font-size:13px; font-weight:600; padding:10px 18px; border-radius:5px; border:1px solid #ad8a44; background:#8c6c30; color:#fff; cursor:pointer; }
  a.back{ font-size:13px; color:#746f64; text-decoration:none; }
  .error{ color:#b23b3b; font-size:13px; margin:0 0 14px; }
  .success{ color:#3a7d44; font-size:13px; margin:0 0 14px; }
</style>
</head>
<body>
  <div class="box">
    <h1>Στοιχεία πρόσκλησης</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    ${success ? `<p class="success">${escapeHtml(success)}</p>` : ''}
    <form method="POST">
      <div class="row">
        <div>
          <label for="groom_name">Όνομα γαμπρού</label>
          <input type="text" id="groom_name" name="groom_name" maxlength="200" required value="${escapeHtml(f.groom_name || '')}">
        </div>
        <div>
          <label for="groom_surname">Επώνυμο γαμπρού</label>
          <input type="text" id="groom_surname" name="groom_surname" maxlength="200" required value="${escapeHtml(f.groom_surname || '')}">
        </div>
      </div>

      <div class="row">
        <div>
          <label for="bride_name">Όνομα νύφης</label>
          <input type="text" id="bride_name" name="bride_name" maxlength="200" required value="${escapeHtml(f.bride_name || '')}">
        </div>
        <div>
          <label for="bride_surname">Επώνυμο νύφης</label>
          <input type="text" id="bride_surname" name="bride_surname" maxlength="200" required value="${escapeHtml(f.bride_surname || '')}">
        </div>
      </div>

      <div class="row">
        <div>
          <label for="event_date">Ημερομηνία</label>
          <input type="date" id="event_date" name="event_date" required value="${escapeHtml(f.event_date || '')}">
        </div>
        <div>
          <label for="event_time">Ώρα τελετής</label>
          <input type="time" id="event_time" name="event_time" required value="${escapeHtml(f.event_time || '')}">
        </div>
      </div>

      <label for="venue">Κτήμα / τοποθεσία</label>
      <input type="text" id="venue" name="venue" maxlength="200" required value="${escapeHtml(f.venue || '')}">

      <div class="row">
        <div>
          <label for="kb_bride">Κουμπάρα</label>
          <input type="text" id="kb_bride" name="kb_bride" maxlength="200" required value="${escapeHtml(f.kb_bride || '')}">
        </div>
        <div>
          <label for="kb_groom">Κουμπάρος</label>
          <input type="text" id="kb_groom" name="kb_groom" maxlength="200" required value="${escapeHtml(f.kb_groom || '')}">
        </div>
      </div>

      <div class="actions">
        <button type="submit">Αποθήκευση</button>
        <a class="back" href="/rsvps">&larr; Πίσω στις δηλώσεις</a>
      </div>
    </form>
  </div>
</body>
</html>`;
}
