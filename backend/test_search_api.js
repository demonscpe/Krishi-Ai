const http = require('http');
const fs = require('fs');

function req(method, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 8080, path, method };
    const r = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    r.on('error', reject);
    r.end();
  });
}

(async () => {
  let out = '';
  const tests = [
    ['SMART SEARCH "Tomato"', '/api/nursery/smart-search?query=Tomato'],
    ['SMART SEARCH "Kuppam"', '/api/nursery/smart-search?query=Kuppam'],
    ['SMART SEARCH "Kuppam Tomato"', '/api/nursery/smart-search?query=Kuppam%20Tomato'],
    ['SUGGESTIONS "Kup"', '/api/nursery/suggestions?query=Kup'],
    ['HOME FEED', '/api/nursery/home'],
    ['CATEGORIES', '/api/nursery/categories'],
  ];
  for (const [label, path] of tests) {
    try {
      const res = await req('GET', path);
      let body = res.body;
      if (body.length > 800) body = body.slice(0, 800) + '... [TRUNCATED]';
      out += `\n=== ${label} (${res.status}) ===\n${body}\n`;
    } catch (e) {
      out += `\n=== ${label} ===\nERROR: ${e.message}\n`;
    }
  }
  fs.writeFileSync('search_api_result.txt', out);
  console.log('done');
})();
