const fs = require('fs');
const path = require('path');

function normalize(str) {
  return str
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\$\{\s*/g, ' ${')
    .replace(/\s*\}\s*/g, '} ')
    .replace(/\s+/g, ' ')
    .trim();
}

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // className="..."
  code = code.replace(/className="([\s\S]*?)"/g, (_, cls) => `className="${normalize(cls)}"`);

  // className={`...`}
  code = code.replace(/className=\{`([\s\S]*?)`\}/g, (_, cls) => `className={\`${normalize(cls)}\`}`);

  // Gộp thuộc tính JSX về 1 dòng
  code = code.replace(/<([A-Za-z][\w.]*)((?:\s+[\w:-]+(?:=\{[^}]*\}|="[^"]*"|='[^']*'|=\{`[\s\S]*?`\})?)*)\s*\n\s*>/g, (_, tag, attrs) => {
    const cleaned = attrs.replace(/\s+/g, ' ').trim();
    return `<${tag}${cleaned ? ' ' + cleaned : ''}>`;
  });

  fs.writeFileSync(file, code);
  console.log('✔', file);
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', 'build', '.git'].includes(file)) continue;

    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(tsx|jsx)$/.test(full)) {
      processFile(full);
    }
  }
}

walk('./src');
