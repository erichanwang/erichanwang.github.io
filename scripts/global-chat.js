import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, serverTimestamp, get, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Create a single timestamp tooltip
const timestampTooltip = document.createElement('div');
timestampTooltip.className = 'timestamp-tooltip';
document.body.appendChild(timestampTooltip);

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
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    onValue(messagesQuery, (snapshot) => {
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
    messageElement.className = 'message';
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
        const userInfoBox = document.createElement('div');
        userInfoBox.className = 'user-info-box';
        const creationDate = userInfo.creationTime ? new Date(parseInt(userInfo.creationTime)) : null;
        
        if (!creationDate || creationDate.toString() === 'Invalid Date') {
            userInfoBox.innerHTML = `Email: ${userInfo.email}<br>Account Created: Beta Tester`;
        } else {
            userInfoBox.innerHTML = `Email: ${userInfo.email}<br>Account Created: ${creationDate.toLocaleDateString()}`;
        }
        
        userInfoBox.style.display = 'none';
        senderSpan.appendChild(userInfoBox);

        senderSpan.addEventListener('mouseover', (e) => {
            e.stopPropagation();
            userInfoBox.style.display = 'block';
        });
        senderSpan.addEventListener('mouseout', () => {
            userInfoBox.style.display = 'none';
        });
        senderSpan.addEventListener('mousemove', (e) => {
            userInfoBox.style.left = `${e.pageX + 10}px`;
            userInfoBox.style.top = `${e.pageY + 10}px`;
        });
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = `: ${message.text}`;

    messageElement.appendChild(senderSpan);
    messageElement.appendChild(textSpan);

    if (message.timestamp) {
        messageElement.addEventListener('mouseover', () => {
            timestampTooltip.textContent = new Date(message.timestamp).toLocaleString();
            timestampTooltip.style.display = 'block';
        });
        messageElement.addEventListener('mouseout', () => {
            timestampTooltip.style.display = 'none';
        });
        messageElement.addEventListener('mousemove', (e) => {
            timestampTooltip.style.left = `${e.pageX + 10}px`;
            timestampTooltip.style.top = `${e.pageY + 10}px`;
        });
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
