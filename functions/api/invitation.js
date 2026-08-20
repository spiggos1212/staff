// GET /api/invitation — δημόσια στοιχεία της πρόσκλησης (ονόματα, ημερομηνία, κτήμα, κουμπάροι).
// Διαβάζεται από το index.html για να γεμίσει τη σελίδα αντί για hardcoded τιμές.

export async function onRequestGet(context) {
  const { env } = context;

  const row = await env.DB.prepare(
    'SELECT groom_name, groom_surname, bride_name, bride_surname, event_date, event_time, venue, kb_bride, kb_groom FROM invitation WHERE id = 1'
  ).first();

  if (!row) {
    return new Response(JSON.stringify({ ok: false, error: 'Δεν έχουν οριστεί ακόμα στοιχεία.' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const invitation = {
    groomName: row.groom_name,
    groomSurname: row.groom_surname,
    brideName: row.bride_name,
    brideSurname: row.bride_surname,
    date: row.event_date,
    time: row.event_time,
    venue: row.venue,
    kbBride: row.kb_bride,
    kbGroom: row.kb_groom,
  };

  return new Response(JSON.stringify({ ok: true, invitation }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
