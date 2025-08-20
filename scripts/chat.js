import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const messagesRef = ref(db, 'messages');

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let currentUser = null;

onAuthStateChanged(auth, user => {
    currentUser = user;
    if (!user) {
        // Redirect to login page or show a message
        window.location.href = 'login.html';
    }
});

function sendMessage() {
    if (currentUser && messageInput.value.trim() !== '') {
        push(messagesRef, {
            text: messageInput.value,
            sender: currentUser.displayName || currentUser.email,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
    }
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.sender}: ${message.text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

onValue(messagesRef, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        displayMessage(childSnapshot.val());
    });
});

if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}

if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}
