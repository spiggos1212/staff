// GET /api/weather — τρέχων καιρός στην Αθήνα, μέσω Open-Meteo (χωρίς κλειδί).
// Cache στο edge για 30 λεπτά (cf.cacheTtl) ώστε να μη χτυπάμε το Open-Meteo σε κάθε επίσκεψη.

const ATHENS_LAT = 37.9838;
const ATHENS_LON = 23.7275;

// WMO weather codes -> ελληνική περιγραφή + emoji.
// https://open-meteo.com/en/docs (βλ. "WMO Weather interpretation codes")
const WEATHER_CODES = {
  0: { description: 'Αίθριος', icon: '☀️' },
  1: { description: 'Κυρίως αίθριος', icon: '🌤️' },
  2: { description: 'Μερική συννεφιά', icon: '⛅' },
  3: { description: 'Συννεφιά', icon: '☁️' },
  45: { description: 'Ομίχλη', icon: '🌫️' },
  48: { description: 'Ομίχλη με πάχνη', icon: '🌫️' },
  51: { description: 'Ψιλόβροχο', icon: '🌦️' },
  53: { description: 'Ψιλόβροχο', icon: '🌦️' },
  55: { description: 'Ψιλόβροχο', icon: '🌦️' },
  56: { description: 'Παγωμένο ψιλόβροχο', icon: '🌧️' },
  57: { description: 'Παγωμένο ψιλόβροχο', icon: '🌧️' },
  61: { description: 'Βροχή', icon: '🌧️' },
  63: { description: 'Βροχή', icon: '🌧️' },
  65: { description: 'Δυνατή βροχή', icon: '🌧️' },
  66: { description: 'Παγωμένη βροχή', icon: '🌧️' },
  67: { description: 'Παγωμένη βροχή', icon: '🌧️' },
  71: { description: 'Χιόνι', icon: '❄️' },
  73: { description: 'Χιόνι', icon: '❄️' },
  75: { description: 'Δυνατό χιόνι', icon: '❄️' },
  77: { description: 'Χιονόκοκκοι', icon: '❄️' },
  80: { description: 'Μπόρες', icon: '🌦️' },
  81: { description: 'Μπόρες', icon: '🌦️' },
  82: { description: 'Ισχυρές μπόρες', icon: '🌦️' },
  85: { description: 'Χιονόπτωση', icon: '🌨️' },
  86: { description: 'Χιονόπτωση', icon: '🌨️' },
  95: { description: 'Καταιγίδα', icon: '⛈️' },
  96: { description: 'Καταιγίδα με χαλάζι', icon: '⛈️' },
  99: { description: 'Καταιγίδα με χαλάζι', icon: '⛈️' },
};

function describeWeather(code) {
  return WEATHER_CODES[code] || { description: 'Καιρός', icon: '🌡️' };
}

export async function onRequestGet() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${ATHENS_LAT}&longitude=${ATHENS_LON}` +
      `&current=temperature_2m,weather_code&timezone=Europe%2FAthens`;

    const res = await fetch(url, {
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    if (!res.ok) throw new Error('upstream error');

    const data = await res.json();
    const current = data.current;
    if (!current || typeof current.temperature_2m !== 'number') {
      throw new Error('bad upstream data');
    }

    const { description, icon } = describeWeather(current.weather_code);
    const weather = {
      temp: Math.round(current.temperature_2m),
      description,
      icon,
    };

    return new Response(JSON.stringify({ ok: true, weather }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Ο καιρός δεν είναι διαθέσιμος αυτή τη στιγμή.' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
