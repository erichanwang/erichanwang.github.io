import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, serverTimestamp, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let currentUser = null;
const messagesRef = ref(db, 'global-chat');

onAuthStateChanged(auth, user => {
    currentUser = user;
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadMessages();
    }
});

function loadMessages() {
    onValue(messagesRef, (snapshot) => {
        messagesDiv.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            displayMessage(childSnapshot.val());
        });
    });
}

function sendMessage() {
    if (currentUser && messageInput.value.trim() !== '') {
        push(messagesRef, {
            text: messageInput.value,
            sender: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
    }
}

async function displayMessage(message) {
    const messageElement = document.createElement('div');
    let senderName = 'Unknown User';

    if (message.sender === currentUser.uid) {
        senderName = 'You';
    } else if (message.displayName) {
        senderName = message.displayName;
    } else {
        const userSnapshot = await get(ref(db, `users/${message.sender}`));
        if (userSnapshot.exists()) {
            senderName = userSnapshot.val().displayName || userSnapshot.val().email;
        }
    }

    messageElement.textContent = `${senderName}: ${message.text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
