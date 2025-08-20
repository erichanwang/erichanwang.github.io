import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
    if (user) {
        notesSection.querySelector('p').style.display = 'none';
        notesContainer.style.display = 'block';
        if (!quill) {
            quill = new Quill('#notes-editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow'
            });
        }
        loadNotes(user.uid);
    } else {
        notesSection.querySelector('p').style.display = 'block';
        notesContainer.style.display = 'none';
    }
});

function loadNotes(userId) {
    const notes = localStorage.getItem(`notes_${userId}`);
    if (notes) {
        quill.setContents(JSON.parse(notes));
    }
}

function saveNotes() {
    const user = auth.currentUser;
    if (user) {
        localStorage.setItem(`notes_${user.uid}`, JSON.stringify(quill.getContents()));
        alert('Notes saved!');
    }
}

if (saveButton) {
    saveButton.addEventListener('click', saveNotes);
}
