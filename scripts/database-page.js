import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const database = getDatabase(app);

const dataForm = document.getElementById('data-form');
const dataInput = document.getElementById('data-input');
const dataList = document.getElementById('data-list');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const dbRef = ref(database, 'users/' + user.uid);

        dataForm.addEventListener('submit', (e) => {
            e.preventDefault();
            push(dbRef, {
                text: dataInput.value
            });
            dataInput.value = '';
        });

        onValue(dbRef, (snapshot) => {
            dataList.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val();
                const li = document.createElement('li');
                li.textContent = childData.text;
                dataList.appendChild(li);
            });
        });

    } else {
        window.location.href = 'login.html';
    }
});
