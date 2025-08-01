// scripts/update-meta.js
const fs = require('fs');
const path = require('path');

// Read package.json to get the current version
const pkgPath = path.resolve(__dirname, '../package.json'); // Resolve path to root directory
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVersion = pkg.version;

// Read meta.json and update lastUpdated and lastModified
const metaPath = path.resolve(__dirname, 'meta.json'); // Resolve path to meta.json in scripts folder
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const now = new Date().toISOString();

meta.version = newVersion;
meta.lastUpdated = now;

meta.files.forEach(file => {
  file.lastModified = now;
});

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

console.log(`✅ meta.json updated → v${newVersion} | ${now}`);
