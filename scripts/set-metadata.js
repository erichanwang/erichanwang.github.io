fetch('metadata.json')
  .then(response => response.json())
  .then(data => {
    if (data.title) {
      document.title = data.title;
    }
    if (data.icon) {
      const iconLink = document.querySelector('link[rel="icon"]');
      if (iconLink) {
        iconLink.href = data.icon;
      }
    }
    if (data.backgroundImage) {
      document.body.style.backgroundImage = `url(${data.backgroundImage})`;
    }
    const versionEl = document.getElementById('version-display');
    if (versionEl) {
      versionEl.textContent = `Version ${data.version}`;
    }
    const updatedEl = document.getElementById('last-updated');
    if (updatedEl) {
      updatedEl.textContent = `Last updated ${data.lastUpdated}`;
    }
  })
  .catch(error => console.error('Error loading metadata:', error));
