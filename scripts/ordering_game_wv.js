// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDygWqMrzUSzpcfVrjvq-q5SRBPzzIuwt8",
  authDomain: "ordering-game-leaderboard.firebaseapp.com",
  databaseURL: "https://ordering-game-leaderboard-default-rtdb.firebaseio.com",
  projectId: "ordering-game-leaderboard",
  storageBucket: "ordering-game-leaderboard.appspot.com",
  messagingSenderId: "93449966970",
  appId: "1:93449966970:web:9ac3955d53656be5a5f2c3",
  measurementId: "G-S9WTX3E8YS"
};

firebase.initializeApp(firebaseConfig);

// main game logic
const itemList = document.getElementById("item-list");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset-button");
const instruction = document.querySelector("#game-container p");
const timerDisplay = document.getElementById("timer");
const leaderboard = document.getElementById("leaderboard");

let items = [];
let correctOrder = [];
let selectedItem = null;
let timerInterval;
let startTime;
let seconds = 0.0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ensure no element is in its original position (derangement)
function derangedShuffle(arr) {
  let shuffled = [...arr];
  do {
    shuffled = shuffle([...arr]);
  } while (shuffled.some((val, i) => val === arr[i]));
  return shuffled;
}

function startTimer() {
  startTime = Date.now();
  timerDisplay.textContent = "Time: 0.000s";
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    seconds = elapsed / 1000;
    timerDisplay.textContent = `Time: ${seconds.toFixed(3)}s`;
  }, 50);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function initGame() {
  instruction.textContent = "Click two items to swap them. Get them in order!";
  items = [1, 2, 3, 4, 5];
  correctOrder = [...items];
  const shuffledItems = derangedShuffle(correctOrder);

  itemList.innerHTML = "";
  shuffledItems.forEach((itemText) => {
    const item = document.createElement("li");
    item.textContent = itemText;
    item.classList.add("item");
    item.addEventListener("click", () => handleItemClick(item));
    itemList.appendChild(item);
  });

  selectedItem = null;
  message.textContent = `0 out of ${correctOrder.length} are in the correct position.`;
  message.style.color = "red";
  stopTimer();
  startTimer();
}

function handleItemClick(item) {
  if (!selectedItem) {
    selectedItem = item;
    item.classList.add("selected");
  } else {
    const temp = selectedItem.textContent;
    selectedItem.textContent = item.textContent;
    item.textContent = temp;

    selectedItem.classList.remove("selected");
    selectedItem = null;

    checkOrder();
  }
}

function checkOrder() {
  const currentOrder = Array.from(itemList.children).map((item) =>
    parseInt(item.textContent)
  );
  let correctCount = 0;
  for (let i = 0; i < correctOrder.length; i++) {
    if (currentOrder[i] === correctOrder[i]) {
      correctCount++;
    }
  }

  if (correctCount === correctOrder.length) {
    stopTimer();
    message.textContent = `Congratulations! You got the order right in ${seconds.toFixed(3)} seconds!`;
    message.style.color = "green";

    const userName = prompt("Enter your name for the leaderboard:");
    if (userName && userName.trim() !== "") {
      firebase.database().ref("scores").push({
        name: userName.trim().substring(0, 20),
        time: parseFloat(seconds.toFixed(3))
      });
    }
  } else {
    message.textContent = `${correctCount} out of ${correctOrder.length} are in the correct position.`;
    message.style.color = "red";
  }
}

resetButton.addEventListener("click", initGame);

// display all leaderboard scores, sorted by time
firebase
  .database()
  .ref("scores")
  .orderByChild("time")
  .on("value", (snapshot) => {
    leaderboard.innerHTML = "";
    let rank = 1;
    snapshot.forEach((child) => {
      const { name, time } = child.val();
      const li = document.createElement("li");
      li.className = "leaderboard-entry";
      li.innerHTML = `
        <span class="rank-name">${rank}. ${name}</span>
        <span class="time">${time.toFixed(3)}s</span>
      `;
      leaderboard.appendChild(li);
      rank++;
    });
  });

initGame();
