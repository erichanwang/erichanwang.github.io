import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login failed:', errorCode, errorMessage);
            alert('Login failed: ' + errorMessage);
        });
});
