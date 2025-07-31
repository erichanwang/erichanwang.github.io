/* ===== script.js (single file) ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1)  META (version + last-updated) ---------- */
  fetch('meta.json')
    .then(r => r.json())
    .then(data => {
      // Version in <p> inside <header>
      const vEl = document.querySelector('header p');
      if (vEl) vEl.textContent = `Version ${data.version}`;

      // Most-recent file date
      const latest = new Date(
        Math.max(...data.files.map(f => new Date(f.lastModified)))
      );
      const luEl = document.getElementById('last-updated');
      if (luEl) {
        luEl.textContent = `Last updated ${latest.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`;
      }
    })
    .catch(console.error);

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