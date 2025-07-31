// update-meta.js
const fs = require('fs');
const path = require('path');

// Read package.json and bump the version
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVersion = pkg.version.split('.').map((part, i) => i === 2 ? (+part + 1) : part).join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Read meta.json and update lastUpdated and lastModified
const metaPath = path.join(__dirname, 'meta.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const now = new Date().toISOString();

meta.version = newVersion;
meta.lastUpdated = now;

meta.files.forEach(file => {
  file.lastModified = now;
});

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

console.log(`✅ meta.json updated → v${newVersion} | ${now}`);