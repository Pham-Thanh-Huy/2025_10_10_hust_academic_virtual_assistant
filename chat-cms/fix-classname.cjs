const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    if (file === 'node_modules' || file === 'dist') continue;

    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(tsx|jsx)$/.test(full)) {
      let code = fs.readFileSync(full, 'utf8');

      code = code.replace(/className="([\s\S]*?)"/g, (_, cls) => `className="${cls.replace(/\s+/g, ' ').trim()}"`);

      fs.writeFileSync(full, code);
      console.log(full);
    }
  }
}

walk('./src');
