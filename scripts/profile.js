import { auth } from './firebase-config.js';
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const displayNameInput = document.getElementById('displayNameInput');
const updateProfileButton = document.getElementById('updateProfileButton');
const currentDisplayNameElement = document.getElementById('current-display-name');

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentDisplayNameElement.textContent = `Current Display Name: ${user.displayName || 'Not set'}`;
    } else {
        window.location.href = 'login.html';
    }
});

updateProfileButton.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        const newDisplayName = displayNameInput.value;
        updateProfile(user, {
            displayName: newDisplayName
        }).then(() => {
            alert('Profile updated successfully!');
            currentDisplayNameElement.textContent = `Current Display Name: ${newDisplayName}`;
        }).catch((error) => {
            console.error('Error updating profile:', error);
        });
    }
});
