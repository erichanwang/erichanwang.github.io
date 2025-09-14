# Eric Wang's Portfolio Website Wiki

Welcome to the wiki for Eric Wang's personal portfolio website. This document provides detailed information about the website's structure, features, technologies, and how to view it.

---

## Table of Contents

1. [Overview](#overview)
2. [Website Structure](#website-structure)
3. [Features](#features)
4. [Technologies Used](#technologies-used)
5. [How to Run Locally](#how-to-run-locally)
6. [Adding New Content](#adding-new-content)
7. [License](#license)

---

## Overview

This website is a personal portfolio showcasing Eric Wang's skills, projects, education, certifications, awards, and more. It serves as a comprehensive introduction to his work and interests in computer science and related fields.

---

## Website Structure

The website consists of multiple HTML pages, CSS stylesheets, JavaScript scripts, and media assets organized as follows:

- **HTML Pages:**
  - `index.html`: Home page with introduction and contact info.
  - `skills.html`: Lists programming languages, frameworks, and tools.
  - `projects.html`: Displays coding projects with images and GitHub links.
  - `certifications.html`: IT and programming certifications.
  - `awards.html`: Academic and extracurricular awards.
  - `education.html`: Educational background.

- **Stylesheets:** Located in the `styles/` directory, including `style.css` and page-specific CSS files.

- **JavaScript:** Located in the `scripts/` directory, handling UI interactions, Firebase integration, authentication, and game logic.

- **Images:** Stored in the `images/` directory, including icons and project screenshots.

---

## Features

- Responsive navigation menu across all pages.
- Real-time clock display on the home page.
- Interactive project gallery with modal image zoom.
- Firebase Authentication for login and signup.
- Global chat and notes apps using Firebase Realtime Database and Firestore.
- Multiple programming projects showcased with descriptions and media.

---

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase Authentication, Firestore, Realtime Database
- **Frameworks/Libraries:** React (for Tetris game), Pygame (Python projects)
- **Languages:** JavaScript, Python, Java, C++, HTML, CSS, PHP
- **Tools:** Git, GitHub, VS Code, Firebase CLI
- **Hosting:** GitHub Pages

---

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/erichanwang/erichanwang.github.io.git
   ```
2. Open `index.html` in your preferred web browser.
3. For full Firebase functionality (authentication, database), set up Firebase configuration:
   - Create a Firebase project.
   - Add your Firebase config to `scripts/firebase-config.js`.
   - Enable Authentication and Firestore/Realtime Database in Firebase console.

---

## Adding New Content

- **Adding Projects:**
  - Add project details and images to `projects.html`.
  - Upload images to `images/project images/`.
  - Update links and descriptions accordingly.

- **Adding Skills, Certifications, Awards, Education:**
  - Edit respective HTML pages to add new entries.
  - Follow existing markup and styling conventions.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for your interest in Eric Wang's portfolio website!
