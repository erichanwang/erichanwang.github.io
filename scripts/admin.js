import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const adminSection = document.getElementById('admin-section');
const adminContainer = document.getElementById('admin-container');
const userListDiv = document.getElementById('user-list');

// IMPORTANT: Replace this with your actual Firebase User ID
const ADMIN_UID = "YOUR_ADMIN_UID_HERE";

onAuthStateChanged(auth, user => {
    if (user && user.uid === ADMIN_UID) {
        adminSection.querySelector('p').style.display = 'none';
        adminContainer.style.display = 'block';
        // Note: Listing users requires a backend function for security.
        // This is a placeholder for where you would display the users.
        userListDiv.innerHTML = "<p>User management functionality requires a secure backend to be implemented.</p>";
    } else {
        adminSection.querySelector('p').style.display = 'block';
        adminContainer.style.display = 'none';
    }
});
