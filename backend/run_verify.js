const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('node test_seed_verify.js', { encoding: 'utf8', timeout: 60000 });
  fs.writeFileSync('verify_result.txt', 'OUTPUT:\n' + out);
} catch (e) {
  fs.writeFileSync('verify_result.txt', 'ERROR:\n' + (e.stdout || '') + '\n' + (e.stderr || '') + '\n' + e.message);
}
console.log('written');
