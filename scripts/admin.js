import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB67q01HUssXeYo0A2MdpsVU9AOG_KLB3E",
    authDomain: "new-database-bc98a.firebaseapp.com",
    projectId: "new-database-bc98a",
    storageBucket: "new-database-bc98a.firebasestorage.app",
    messagingSenderId: "436686586315",
    appId: "1:436686586315:web:53350b51bcbcd52794764e",
    measurementId: "G-W8BR4WNQR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const adminSection = document.getElementById('admin-section');
const loginContainer = document.getElementById('login-container');
const adminContainer = document.getElementById('admin-container');
const userListDiv = document.getElementById('user-list');

// IMPORTANT: Replace this with your actual Firebase User ID
const ADMIN_UID = "KIY6D93ElRdMeCsRuZmtaAcsUtH3";

onAuthStateChanged(auth, user => {
    if (user && user.uid === ADMIN_UID) {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'block';
        loadContent();
        loadPages();
        loadMetadata();
        // Note: Listing users requires a backend function for security.
        // This is a placeholder for where you would display the users.
        userListDiv.innerHTML = "<p>User management functionality requires a secure backend to be implemented.</p>";
    } else {
        loginContainer.style.display = 'block';
        adminContainer.style.display = 'none';
    }
});

// Login functionality
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.username.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User signed in:', user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login failed:', errorCode, errorMessage);
            alert('Login failed: ' + errorMessage);
        });
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('User signed out');
    }).catch((error) => {
        console.error('Logout error:', error);
    });
});

// Tab functionality
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName + '-tab').style.display = 'block';
    event.target.classList.add('active');
}
window.showTab = showTab;

async function loadContent() {
    const homeDescRef = ref(db, 'content/home-description');
    const projectsDescRef = ref(db, 'content/projects-description');
    const awardsDescRef = ref(db, 'content/awards-description');
    const skillsDescRef = ref(db, 'content/skills-description');
    const certificationsDescRef = ref(db, 'content/certifications-description');
    const educationDescRef = ref(db, 'content/education-description');
    const versionRef = ref(db, 'content/version');
    const lastUpdatedRef = ref(db, 'content/last-updated');

    const homeDescSnap = await get(homeDescRef);
    const projectsDescSnap = await get(projectsDescRef);
    const awardsDescSnap = await get(awardsDescRef);
    const skillsDescSnap = await get(skillsDescRef);
    const certificationsDescSnap = await get(certificationsDescRef);
    const educationDescSnap = await get(educationDescRef);
    const versionSnap = await get(versionRef);
    const lastUpdatedSnap = await get(lastUpdatedRef);

    if (homeDescSnap.exists()) {
        document.getElementById('home-description').value = homeDescSnap.val();
    }
    if (projectsDescSnap.exists()) {
        document.getElementById('projects-description').value = projectsDescSnap.val();
    }
    if (awardsDescSnap.exists()) {
        document.getElementById('awards-description').value = awardsDescSnap.val();
    }
    if (skillsDescSnap.exists()) {
        document.getElementById('skills-description').value = skillsDescSnap.val();
    }
    if (certificationsDescSnap.exists()) {
        document.getElementById('certifications-description').value = certificationsDescSnap.val();
    }
    if (educationDescSnap.exists()) {
        document.getElementById('education-description').value = educationDescSnap.val();
    }
    if (versionSnap.exists()) {
        document.getElementById('version').value = versionSnap.val();
    }
    if (lastUpdatedSnap.exists()) {
        document.getElementById('last-updated').value = lastUpdatedSnap.val();
    }

    // Event listeners for saving
    document.getElementById('save-home-description').addEventListener('click', () => {
        const value = document.getElementById('home-description').value;
        set(homeDescRef, value).then(() => alert('Home description saved!'));
    });

    document.getElementById('save-projects-description').addEventListener('click', () => {
        const value = document.getElementById('projects-description').value;
        set(projectsDescRef, value).then(() => alert('Projects description saved!'));
    });

    document.getElementById('save-awards-description').addEventListener('click', () => {
        const value = document.getElementById('awards-description').value;
        set(awardsDescRef, value).then(() => alert('Awards description saved!'));
    });

    document.getElementById('save-skills-description').addEventListener('click', () => {
        const value = document.getElementById('skills-description').value;
        set(skillsDescRef, value).then(() => alert('Skills description saved!'));
    });

    document.getElementById('save-certifications-description').addEventListener('click', () => {
        const value = document.getElementById('certifications-description').value;
        set(certificationsDescRef, value).then(() => alert('Certifications description saved!'));
    });

    document.getElementById('save-education-description').addEventListener('click', () => {
        const value = document.getElementById('education-description').value;
        set(educationDescRef, value).then(() => alert('Education description saved!'));
    });

    document.getElementById('save-version').addEventListener('click', () => {
        const value = document.getElementById('version').value;
        set(versionRef, value).then(() => alert('Version saved!'));
    });

    document.getElementById('save-last-updated').addEventListener('click', () => {
        const value = document.getElementById('last-updated').value;
        set(lastUpdatedRef, value).then(() => alert('Last updated saved!'));
    });
}

async function loadPages() {
    const pageSelector = document.getElementById('page-selector');
    const searchInput = document.getElementById('search-input');
    const htmlEditor = document.getElementById('html-editor');

    // Fetch list of HTML files (this would need to be implemented server-side for security)
    // For now, we'll hardcode some pages
    const pages = ['index.html', 'projects.html', 'awards.html', 'skills.html', 'certifications.html', 'education.html', 'admin.html', 'test.html'];

    pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page;
        option.textContent = page;
        pageSelector.appendChild(option);
    });

    pageSelector.addEventListener('change', async () => {
        const selectedPage = pageSelector.value;
        if (selectedPage) {
            const htmlRef = ref(db, 'html/' + selectedPage);
            const htmlSnap = await get(htmlRef);
            if (htmlSnap.exists()) {
                htmlEditor.value = htmlSnap.val();
            } else {
                try {
                    const response = await fetch(selectedPage);
                    const html = await response.text();
                    htmlEditor.value = html;
                } catch (error) {
                    console.error('Error loading page:', error);
                    alert('Error loading page: ' + error.message);
                }
            }
        }
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const options = pageSelector.querySelectorAll('option');
        options.forEach(option => {
            if (option.value.toLowerCase().includes(searchTerm)) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    });

    document.getElementById('save-html').addEventListener('click', () => {
        const selectedPage = pageSelector.value;
        const htmlContent = htmlEditor.value;
        if (selectedPage) {
            set(ref(db, 'html/' + selectedPage), htmlContent).then(() => {
                alert('HTML saved to database!');
            }).catch((error) => {
                console.error('Error saving HTML:', error);
                alert('Error saving HTML: ' + error.message);
            });
        }
    });
}

async function loadMetadata() {
    const metadataEditor = document.getElementById('metadata-editor');

    try {
        const response = await fetch('metadata.json');
        const metadata = await response.json();
        metadataEditor.value = JSON.stringify(metadata, null, 2);
    } catch (error) {
        console.error('Error loading metadata:', error);
        alert('Error loading metadata: ' + error.message);
    }

    document.getElementById('save-metadata').addEventListener('click', () => {
        const metadataContent = metadataEditor.value;
        try {
            const metadata = JSON.parse(metadataContent);
            // Note: Saving metadata directly would require backend implementation
            alert('Saving metadata requires backend implementation for security reasons. The metadata is valid JSON.');
        } catch (error) {
            alert('Invalid JSON: ' + error.message);
        }
    });
}
