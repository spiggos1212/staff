// POST /api/rsvp — αποθηκεύει μια δήλωση συμμετοχής στο D1.
// Αναμενόμενο JSON body: { name, attending, guestCount, comment, hp }
// "hp" = honeypot πεδίο (πρέπει να είναι κενό· αν είναι γεμάτο, είναι bot).

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError('Μη έγκυρο αίτημα.', 400);
  }

  // Honeypot: bots συνήθως γεμίζουν κάθε πεδίο φόρμας.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    // Δεν αποκαλύπτουμε στο bot ότι απορρίφθηκε — απαντάμε σαν να πέτυχε.
    return jsonOk();
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const attending = body.attending === true || body.attending === 'yes' ? 1 : 0;
  let guestCount = Number.parseInt(body.guestCount, 10);
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : '';

  if (!name || name.length > 120) {
    return jsonError('Το όνομα είναι υποχρεωτικό (έως 120 χαρακτήρες).', 400);
  }
  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) {
    guestCount = 1;
  }
  if (attending === 0) {
    guestCount = 0;
  }

  try {
    await env.DB.prepare(
      'INSERT INTO rsvps (name, attending, guest_count, comment) VALUES (?, ?, ?, ?)'
    )
      .bind(name, attending, guestCount, comment || null)
      .run();
  } catch (e) {
    return jsonError('Αποτυχία αποθήκευσης. Δοκίμασε ξανά.', 500);
  }

  return jsonOk();
}

function jsonOk() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
