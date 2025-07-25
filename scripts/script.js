document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.createElement("button");
    toggle.textContent = "Change Theme";
    toggle.style.position = "fixed";
    toggle.style.top = "10px";
    toggle.style.right = "10px";
    toggle.style.padding = "10px";
    toggle.style.background = "#002945"; // BUTTON COLOR
    toggle.style.color = "#ffffff"; 
    toggle.style.border = "none";
    toggle.style.borderRadius = "5px";
    toggle.style.cursor = "pointer";
    toggle.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
    toggle.style.zIndex = "1000"; // Ensure the button is on top
    toggle.style.fontFamily = "'Courier New', Courier, monospace";
    toggle.style.fontSize = "12px";
    //document.body.appendChild(toggle);

    // Define the available theme files
    const themes = ["styles/style1.css", "styles/tnstyle.css"];
    // add other themes here to make it an option

    // Retrieve current theme index from localStorage (if set) or default to 0.
    let currentThemeIndex = localStorage.getItem("themeIndex") ? parseInt(localStorage.getItem("themeIndex"), 10) : 0;
    
    // set the theme on page load
    document.getElementById("theme-style").setAttribute("href", themes[currentThemeIndex]);

    toggle.addEventListener("click", () => {
        // Increment the theme index and wrap around if necessary
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        console.log(`Current theme index: ${currentThemeIndex}`); // Debugging line

        // Update the link element's href to the new theme file
        document.getElementById("theme-style").setAttribute("href", themes[currentThemeIndex]);

        // Store the current theme index in localStorage
        localStorage.setItem("themeIndex", currentThemeIndex);
    });
});
