const http = require('http');

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
    };
    const r = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  try {
    const health = await req('GET', '/');
    console.log('HEALTH:', health.status, health.body);
  } catch (e) {
    console.log('SERVER NOT REACHABLE:', e.message);
    process.exit(1);
  }

  try {
    const seed = await req('POST', '/api/nursery/seed');
    console.log('SEED status:', seed.status);
    console.log('SEED body:', seed.body.slice(0, 500));
  } catch (e) {
    console.log('SEED error:', e.message);
  }
})();
