import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, serverTimestamp, query, orderByChild, equalTo, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const usersList = document.getElementById('users-list');
const userSearchInput = document.getElementById('user-search-input');
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatWith = document.getElementById('chat-with');

// Create a single timestamp tooltip
const timestampTooltip = document.createElement('div');
timestampTooltip.className = 'timestamp-tooltip';
document.body.appendChild(timestampTooltip);

let currentUser = null;
let selectedUser = null;
let messagesRef = null;

onAuthStateChanged(auth, user => {
    currentUser = user;
    if (!user) {
        sessionStorage.setItem('redirectTo', window.location.href);
        window.location.href = 'login.html';
    } else {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            if (!snapshot.exists()) {
                set(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    creationTime: user.metadata.creationTime
                });
            }
        });
        loadAllUsers();
    }
});

async function loadAllUsers() {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    usersList.innerHTML = '';
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.uid !== currentUser.uid) {
                const userElement = document.createElement('div');
                userElement.textContent = user.displayName || user.email;
                userElement.addEventListener('click', () => selectUser(user));
                usersList.appendChild(userElement);
            }
        });
    } else {
        usersList.innerHTML = 'No users found.';
    }
}

userSearchInput.addEventListener('input', searchUsers);

async function searchUsers() {
    const searchText = userSearchInput.value.trim().toLowerCase();
    const usersRef = ref(db, 'users');

    if (searchText === '') {
        loadAllUsers();
        return;
    }

    const snapshot = await get(usersRef);
    usersList.innerHTML = '';
    if (snapshot.exists()) {
        let found = false;
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const userEmail = user.email ? user.email.toLowerCase() : '';
            const displayName = user.displayName ? user.displayName.toLowerCase() : '';
            if (user.uid !== currentUser.uid && (userEmail.includes(searchText) || displayName.includes(searchText))) {
                const userElement = document.createElement('div');
                userElement.textContent = user.displayName || user.email;
                userElement.addEventListener('click', () => selectUser(user));
                usersList.appendChild(userElement);
                found = true;
            }
        });
        if (!found) {
            usersList.innerHTML = 'No users found.';
        }
    } else {
        usersList.innerHTML = 'No users found.';
    }
}

function selectUser(user) {
    selectedUser = user;
    chatWith.textContent = `Chat with ${user.displayName || user.email}`;
    chatContainer.style.display = 'flex';

    const conversationId = getConversationId(currentUser.uid, selectedUser.uid);
    messagesRef = ref(db, `dms/${conversationId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    onValue(messagesQuery, (snapshot) => {
        messagesDiv.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            displayMessage(childSnapshot.val());
        });
    });
}

function getConversationId(uid1, uid2) {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

function sendMessage() {
    if (currentUser && selectedUser && messageInput.value.trim() !== '') {
        push(messagesRef, {
            text: messageInput.value,
            sender: currentUser.uid,
            receiver: selectedUser.uid,
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
        messageElement.classList.add('sent');
        senderName = 'You';
        userInfo = { email: currentUser.email, creationTime: currentUser.metadata.creationTime };
    } else {
        messageElement.classList.add('received');
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
