/* ===== script.js (single file) ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1)  META (version + last-updated) ---------- */
  // scripts/update-meta.js
  // scripts/update-meta.js
  const fs = require('fs');
  const path = require('path');

  // Read package.json and bump the version
  const pkgPath = path.resolve(__dirname, '..', 'package.json'); // Resolve path to root directory
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const newVersion = pkg.version.split('.').map((part, i) => i === 2 ? (+part + 1) : part).join('.');
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // Read meta.json and update lastUpdated and lastModified
  const metaPath = path.resolve(__dirname, '..', 'meta.json'); // Resolve path to root directory
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const now = new Date().toISOString();

  meta.version = newVersion;
  meta.lastUpdated = now;

  meta.files.forEach(file => {
    file.lastModified = now;
  });

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`✅ meta.json updated → v${newVersion} | ${now}`);

  /* ---------- 2)  THEME SWITCHER (unchanged) ---------- */
  const toggle = document.createElement('button');
  toggle.textContent = 'Change Theme';
  Object.assign(toggle.style, {
    position: 'fixed', top: '10px', right: '10px', padding: '10px',
    background: '#002945', color: '#fff', border: 'none',
    borderRadius: '5px', cursor: 'pointer',
    boxShadow: '2px 2px 10px rgba(0,0,0,.2)', zIndex: 1000,
    fontFamily: '"Courier New", monospace', fontSize: '12px'
  });

  //off for now
  //document.body.appendChild(toggle);

  const themes = ['styles/style1.css', 'styles/tnstyle.css'];
  let idx = +localStorage.getItem('themeIndex') || 0;
  document.getElementById('theme-style').href = themes[idx];

  toggle.addEventListener('click', () => {
    idx = (idx + 1) % themes.length;
    document.getElementById('theme-style').href = themes[idx];
    localStorage.setItem('themeIndex', idx);
  });
});