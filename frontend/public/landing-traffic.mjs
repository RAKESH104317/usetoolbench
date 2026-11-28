const script = document.querySelector('script[src="/landing-traffic.mjs"]');
const total = document.getElementById('traffic-total');

async function showVisitCount() {
  try {
    const response = await fetch(script.dataset.api + '/api/traffic/landing', {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Visitor count unavailable');

    const { total: value } = await response.json();
    if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
      throw new Error('Invalid visitor count');
    }
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid visitor count');

    total.textContent = String(count).padStart(6, '0');
  } catch {
    total.textContent = 'Unavailable';
  }
}

if (total && script) showVisitCount();
