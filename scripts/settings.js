document.addEventListener('DOMContentLoaded', () => {
    // Create settings button with gear icon
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Settings
    `;
    //document.body.appendChild(settingsButton);

    // Create settings overlay and popup
    const settingsOverlay = document.createElement('div');
    settingsOverlay.className = 'settings-overlay';
    
    const settingsPopup = document.createElement('div');
    settingsPopup.className = 'settings-popup';
    
    // Create settings header
    const settingsHeader = document.createElement('div');
    settingsHeader.className = 'settings-header';
    
    const settingsTitle = document.createElement('h2');
    settingsTitle.textContent = 'Settings';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-settings';
    closeButton.innerHTML = '&times;';
    
    settingsHeader.appendChild(settingsTitle);
    settingsHeader.appendChild(closeButton);
    
    // Create theme section
    const themeSection = document.createElement('div');
    themeSection.className = 'settings-section';
    
    const themeTitle = document.createElement('h3');
    themeTitle.textContent = 'Theme';
    
    const themeOption = document.createElement('div');
    themeOption.className = 'settings-option';
    
    const themeLabel = document.createElement('label');
    themeLabel.textContent = 'Select theme:';
    
    const themeButtons = document.createElement('div');
    themeButtons.className = 'theme-buttons';
    
    // Theme options
    const themes = ['styles/style.css', 'styles/tnstyle.css'];
    const themeNames = ['Dark Theme', 'Light Theme'];
    let currentThemeIndex = +localStorage.getItem('themeIndex') || 0;
    
    // Create theme buttons
    themes.forEach((theme, index) => {
        const button = document.createElement('button');
        button.className = 'theme-button';
        button.textContent = themeNames[index];
        if (index === currentThemeIndex) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => {
            // Update theme
            document.getElementById('theme-style').href = theme;
            localStorage.setItem('themeIndex', index);
            currentThemeIndex = index;
            
            // Update active button
            document.querySelectorAll('.theme-button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
        
        themeButtons.appendChild(button);
    });
    
    themeOption.appendChild(themeLabel);
    themeOption.appendChild(themeButtons);
    
    themeSection.appendChild(themeTitle);
    themeSection.appendChild(themeOption);
    
    // Assemble the popup
    settingsPopup.appendChild(settingsHeader);
    settingsPopup.appendChild(themeSection);
    
    // Add a note about future settings
    const noteSection = document.createElement('div');
    noteSection.className = 'settings-section';
    noteSection.innerHTML = '<p style="font-size: 0.9rem; color: #7aa2f7;">More settings coming soon!</p>';
    settingsPopup.appendChild(noteSection);
    
    settingsOverlay.appendChild(settingsPopup);
    document.body.appendChild(settingsOverlay);
    
    // Event listeners
    settingsButton.addEventListener('click', () => {
        settingsOverlay.style.display = 'flex';
    });
    
    closeButton.addEventListener('click', () => {
        settingsOverlay.style.display = 'none';
    });
    
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.style.display = 'none';
        }
    });
});