import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, rtdb, db } from './firebase-config.js';
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const notesSection = document.getElementById('notes-section');
const notesContainer = document.getElementById('notes-container');
const saveButton = document.getElementById('save-notes');


let quill;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['clean']
];

onAuthStateChanged(auth, user => {
    const loginMsg = Array.from(notesSection.querySelectorAll('p')).find(p => p.textContent.includes('You must be logged in'));
    if (user) {
        if (loginMsg) loginMsg.style.display = 'none';
        notesContainer.style.display = 'block';
        if (!quill) {
            quill = new Quill('#notes-editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow'
            });
            // Autosave on text change
            quill.on('text-change', function() {
                saveNotes(false);
            });
        }
        loadNotes(user.uid);
    } else {
        if (loginMsg) loginMsg.style.display = 'block';
        notesContainer.style.display = 'none';
    }
});

async function loadNotes(userId) {
    try {
        const notesRef = ref(rtdb, `users/${userId}/notes`);
        const snapshot = await get(notesRef);
        if (snapshot.exists()) {
            quill.setContents(snapshot.val());
        } else {
            quill.setContents([]); // Empty if no notes
        }
    } catch (e) {
        console.error("Error loading notes from Realtime Database:", e);
        alert("Failed to load notes from database. Please check your connection and permissions.");
    }
}

async function saveNotes(showAlert = true) {
    const user = auth.currentUser;
    if (user) {
        const content = quill.getContents();
        try {
            await set(ref(rtdb, `users/${user.uid}/notes`), content);
            if (showAlert) alert('Notes saved!');
        } catch (e) {
            console.error("Error saving notes to Realtime Database:", e);
            alert("Failed to save notes to database. Please check your connection and permissions.");
        }
    }
}

if (saveButton) {
    saveButton.addEventListener('click', saveNotes);
}
