const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: 'localhost', port: 8080, path }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(`${path} => HTTP ${res.statusCode} :: ${data.slice(0, 150)}`));
    });
    req.on('error', (e) => resolve(`${path} => ERR ${e.message}`));
    req.setTimeout(8000, () => { req.destroy(); resolve(`${path} => TIMEOUT`); });
  });
}

(async () => {
  const paths = [
    '/api/nursery/categories',
    '/api/nursery/home',
    '/api/nursery/search?query=Kuppam',
    '/api/nursery/search?query=Tomato',
    '/api/nursery/suggestions?query=Kup',
  ];
  for (const p of paths) {
    console.log(await get(p));
  }
})();
