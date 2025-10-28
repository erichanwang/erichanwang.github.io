import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, serverTimestamp, query, orderByChild, set, get, onChildAdded, off } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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
let userCache = new Map(); // FIX: Cache to store user data

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
        // Load all users to populate the cache *before* any chat is selected
        loadAllUsers(); 
    }
});

// FIX: This function now also populates the userCache
async function loadAllUsers() {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    usersList.innerHTML = '';
    userCache.clear(); // Clear cache on reload

    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            // Populate the cache
            userCache.set(user.uid, {
                displayName: user.displayName || user.email,
                email: user.email,
                creationTime: user.creationTime
            });

            // Populate the user list
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
    // This function can also benefit from the cache, but we'll keep it simple
    // and re-query the database for now.
    const usersRef = ref(db, 'users'); 

    if (searchText === '') {
        loadAllUsers(); // Reloads all users and refills cache
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

    if (messagesRef) {
        off(messagesRef); 
    }
    
    // Use synchronous DOM removal
    while (messagesDiv.firstChild) {
        messagesDiv.removeChild(messagesDiv.firstChild);
    }
    
    const conversationId = getConversationId(currentUser.uid, selectedUser.uid);
    messagesRef = ref(db, `dms/${conversationId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    onChildAdded(messagesQuery, (snapshot) => {
        // This will now call the synchronous displayMessage
        displayMessage(snapshot.val());
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

// FIX: This function is no longer async and uses the userCache
function displayMessage(message) {
    
    if (!currentUser || typeof message.timestamp !== 'number') {
        return; 
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    const senderUid = message.sender;
    let senderName = 'Unknown User';
    let userInfo = null;

    if (senderUid === currentUser.uid) {
        // This branch is synchronous (fast)
        messageElement.classList.add('sent');
        senderName = 'You';
        userInfo = { email: currentUser.email, creationTime: currentUser.metadata.creationTime };
    } else {
        // FIX: This branch is now also synchronous (fast)
        messageElement.classList.add('received');
        
        if (userCache.has(senderUid)) {
            const userData = userCache.get(senderUid);
            senderName = userData.displayName || userData.email;
            userInfo = { email: userData.email, creationTime: userData.creationTime };
        } else {
            // Fallback for a user not in the cache (e.g., deleted user)
            senderName = 'Unknown User';
            userInfo = { email: 'Not found', creationTime: null };
        }
    }

    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender-name';
    senderSpan.textContent = senderName;

    if (userInfo) {
        const userInfoBox = document.createElement('div');
        userInfoBox.className = 'user-info-box';
        const creationDate = userInfo.creationTime ? new Date(userInfo.creationTime) : null;
        
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

    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper';
    messageWrapper.appendChild(senderSpan);
    messageWrapper.appendChild(textSpan);
    messageElement.appendChild(messageWrapper);


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

    // Both 'sent' and 'received' messages are now appended in the exact
    // order they arrive from onChildAdded, fixing the race condition.
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; 
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});