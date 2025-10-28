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
            const message = childSnapshot.val();
            const messageTimestamp = message.timestamp;
            if (messageTimestamp) {
                const messageDate = new Date(messageTimestamp);
                const now = new Date();
                const diffTime = now - messageDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays <= 7) {
                    displayMessage(message);
                }
            } else {
                displayMessage(message);
            }
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
    const senderUid = message.sender;
    let senderName = 'Unknown User';
    let userInfo = null;

    if (senderUid === currentUser.uid) {
        senderName = 'You';
        userInfo = { email: currentUser.email, creationTime: currentUser.metadata.creationTime };
    } else {
        const userSnapshot = await get(ref(db, `users/${senderUid}`));
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            senderName = userData.displayName || userData.email;
            userInfo = { email: userData.email, creationTime: userData.creationTime };
        }
    }

    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender-name';
    senderSpan.textContent = senderName;
    if (userInfo) {
        const creationDate = userInfo.creationTime ? new Date(parseInt(userInfo.creationTime)).toLocaleDateString() : 'Unknown';
        senderSpan.title = `Email: ${userInfo.email}\nAccount Created: ${creationDate}`;
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = `: ${message.text}`;

    messageElement.appendChild(senderSpan);
    messageElement.appendChild(textSpan);

    if (message.timestamp) {
        const timestamp = new Date(message.timestamp).toLocaleString();
        messageElement.title = timestamp; // Tooltip on hover for timestamp
    }

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
