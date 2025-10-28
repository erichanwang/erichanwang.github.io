import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Import 'off' for listener cleanup
import { getDatabase, ref, push, onValue, serverTimestamp, get, query, orderByChild, off } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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
let messagesListener = null; // To hold the listener function
let userCache = new Map(); // FIX: Cache for synchronous user data lookups

// FIX: Made the auth listener async to await the user cache
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (!user) {
        window.location.href = 'login.html';
        // If user signs out, turn off the database listener
        if (messagesListener) {
            off(messagesRef, 'value', messagesListener);
        }
    } else {
        // FIX: Wait for the user cache to be populated *before* loading messages
        await loadUserCache();
        loadMessages();
    }
});

/**
 * FIX: New function to fetch all user data and store it in the cache
 * before any messages are rendered.
 */
async function loadUserCache() {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    userCache.clear();
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            userCache.set(user.uid, {
                displayName: user.displayName || user.email,
                email: user.email,
                creationTime: user.creationTime
            });
        });
    }
    // Also add the current user to the cache
    if (currentUser && !userCache.has(currentUser.uid)) {
        userCache.set(currentUser.uid, {
            displayName: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            creationTime: currentUser.metadata.creationTime
        });
    }
}

function loadMessages() {
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    // Store the listener function so we can detach it on sign-out
    messagesListener = onValue(messagesQuery, (snapshot) => {
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
                    displayMessage(message); // Now calls the synchronous function
                }
            } else {
                // Display messages that might not have a timestamp (e.g., still saving)
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
            // FIX: Save the displayName with the message
            displayName: currentUser.displayName || currentUser.email, 
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
    }
}

/**
 * FIX: This function is no longer async.
 * It now pulls user data from the local 'userCache' synchronously,
 * which solves the race condition and chronological order.
 */
function displayMessage(message) {
    // FIX: Add a check for unresolved timestamps
    if (typeof message.timestamp !== 'number') {
        return; // Don't render messages that are still saving
    }

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
        
        // FIX: Get user data from the cache instead of 'await get()'
        if (userCache.has(senderUid)) {
            const userData = userCache.get(senderUid);
            senderName = userData.displayName;
            userInfo = { email: userData.email, creationTime: userData.creationTime };
        } else {
            // Fallback: Use the displayName saved with the message
            senderName = message.displayName || 'Unknown User';
            userInfo = { email: '?', creationTime: null };
        }
    }

    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender-name';
    senderSpan.textContent = senderName;

    if (userInfo) {
        const userInfoBox = document.createElement('div');
        userInfoBox.className = 'user-info-box';
        // Note: creationTime from Auth (currentUser) is a string, 
        // but from the DB (cache) it might be a number. parseInt is safer.
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

    messagesDiv.appendChild(messageElement);
    // Only scroll if the user isn't scrolled up looking at old messages
    if (messagesDiv.scrollTop + messagesDiv.clientHeight + 100 >= messagesDiv.scrollHeight) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});