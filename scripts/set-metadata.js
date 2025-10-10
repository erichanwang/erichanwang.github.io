fetch('metadata.json')
  .then(response => response.json())
  .then(data => {
    // Global settings
    if (data.icon) {
      const iconLink = document.querySelector('link[rel="icon"]');
      if (iconLink) {
        iconLink.href = data.icon;
      }
    }
    const versionEl = document.getElementById('version-display');
    if (versionEl) {
      versionEl.textContent = `Version ${data.version}`;
    }
    const updatedEl = document.getElementById('last-updated');
    if (updatedEl) {
      updatedEl.textContent = `Last updated ${data.lastUpdated}`;
    }

    // Per-page metadata
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    const pageData = data.pages && data.pages[filename];

    if (pageData) {
      if (pageData.title) {
        document.title = pageData.title;
      }
      if (pageData.og) {
        setMetaTag('og:title', pageData.og.title);
        setMetaTag('og:image', pageData.og.image);
        setMetaTag('og:description', pageData.og.description);
      }
    } else {
      // Fallback to global if no page-specific
      if (data.title) {
        document.title = data.title;
      }
      if (data.og) {
        setMetaTag('og:title', data.og.title);
        setMetaTag('og:image', data.og.image);
        setMetaTag('og:description', data.og.description);
      }
    }
  })
  .catch(error => console.error('Error loading metadata:', error));

function setMetaTag(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}
