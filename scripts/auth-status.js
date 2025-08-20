import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from './firebase-config.js';

const authStatusContainer = document.createElement('div');
authStatusContainer.id = 'auth-status-container';
document.body.prepend(authStatusContainer);

onAuthStateChanged(auth, (user) => {
    authStatusContainer.innerHTML = '';
    if (user) {
        const userDisplayName = document.createElement('span');
        userDisplayName.textContent = user.displayName || user.email;
        authStatusContainer.appendChild(userDisplayName);

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            });
        });
        authStatusContainer.appendChild(logoutButton);
    } else {
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => {
            sessionStorage.setItem('redirectTo', window.location.href);
            window.location.href = 'login.html';
        });
        authStatusContainer.appendChild(loginButton);
    }
});

const style = document.createElement('style');
style.textContent = `
    #auth-status-container {
        position: fixed;
        top: 10px;
        left: 10px;
        background-color: #161821;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    #auth-status-container button {
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 8px 18px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
    }
    #auth-status-container button:hover {
        background: #1e40af;
    }
    #auth-status-container span {
        font-size: 12px;
        opacity: 0.7;
        color: #fff;
    }
`;
document.head.appendChild(style);
