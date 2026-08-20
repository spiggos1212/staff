// Προστατεύει όλα τα /rsvps* με HTTP Basic Auth.
// Password: Cloudflare Pages secret RSVP_ADMIN_PASSWORD (username: οτιδήποτε).

export async function onRequest(context) {
  const { request, env, next } = context;

  const expected = env.RSVP_ADMIN_PASSWORD;
  if (!expected) {
    return new Response('Ο διαχειριστής δεν έχει ρυθμίσει ακόμα κωδικό πρόσβασης.', { status: 503 });
  }

  const auth = request.headers.get('Authorization') || '';
  const provided = auth.startsWith('Basic ') ? auth.slice(6) : '';
  let ok = false;
  try {
    const decoded = atob(provided);
    const idx = decoded.indexOf(':');
    const pass = idx === -1 ? decoded : decoded.slice(idx + 1);
    ok = timingSafeEqual(pass, expected);
  } catch (e) {
    ok = false;
  }

  if (!ok) {
    return new Response('Απαιτείται σύνδεση.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="RSVP", charset="UTF-8"' },
    });
  }

  return next();
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}
