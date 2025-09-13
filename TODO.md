# TODO: Rewrite Website in React with npm and Node.js

- [ ] Set up a new React application using Create React App or Vite
  - Install Node.js and npm if not already installed
  - Run `npx create-react-app portfolio-website` or `npm create vite@latest portfolio-website -- --template react`
  - Navigate to the new project directory

- [ ] Install necessary dependencies
  - `npm install react-router-dom` for routing between pages
  - `npm install react-helmet` for managing document head (titles, meta tags)
  - Any other libraries for specific features (e.g., Firebase for auth, if needed)

- [ ] Set up project structure
  - Create folders: `src/components`, `src/pages`, `src/styles`, `src/assets`
  - Move existing images, music, etc., to `src/assets`

- [ ] Create React components for each page
  - Convert `index.html` to `Home.js` component
  - Convert `awards.html` to `Awards.js`
  - Convert `skills.html` to `Skills.js`
  - Convert `certifications.html` to `Certifications.js`
  - Convert `education.html` to `Education.js`
  - Convert `projects.html` to `Projects.js`
  - And so on for all HTML pages (admin, chat, database, games, login, music, notes, profile, signup, etc.)

- [ ] Implement routing with React Router
  - Set up `BrowserRouter` in `App.js`
  - Define routes for each page component
  - Update navigation links to use `Link` or `NavLink`

- [ ] Migrate styles and scripts
  - Convert CSS files to modules or global styles
  - Migrate JavaScript logic to React hooks or components
  - Handle dynamic content (e.g., time display, auth status) using React state and effects

- [ ] Handle special features
  - Firebase authentication (login, signup, profile)
  - Chat functionality
  - Games (tetris, snake, etc.) - convert to React components
  - Music player
  - Notes, database, etc.

- [ ] Update content and translations if needed
  - Ensure all text is properly translated or kept as is
  - Add any new features like the Chinese teaching page if desired

- [ ] Test the application
  - Run `npm start` to start the development server
  - Test all routes and functionality
  - Check responsiveness and styling

- [ ] Build for production
  - Run `npm run build` to create optimized build
  - Deploy to GitHub Pages or other hosting service

- [ ] Clean up old files
  - Remove or archive old HTML, CSS, JS files after migration
