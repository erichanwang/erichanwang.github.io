// firebase config - make sure your firebase sdk scripts are loaded on the page
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

const itemList = document.getElementById("item-list");
const message = document.getElementById("message");

const resetButton = document.getElementById("reset-button");
const hintButton = document.getElementById("hint-button");
const easyModeButton = document.getElementById("easy-mode-button");

const instruction = document.querySelector("#game-container p");
const timerDisplay = document.getElementById("timer");
const leaderboard = document.getElementById("leaderboard");

let items = [];
let correctOrder = [];
let selectedItems = [];
let timerInterval;
let startTime;
let seconds = 0.0;
let usedHint = false;
let isGameOver = false;
let easyModeOn = false;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

function isUnsolvableTripleOnly(start, target) {
  const visited = new Set();
  const queue = [{ arr: [...start], steps: 0 }];
  const key = arr => arr.join(",");

  while (queue.length) {
    const { arr } = queue.shift();
    if (key(arr) === key(target)) return false;
    visited.add(key(arr));

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        for (let k = j + 1; k < arr.length; k++) {
          const newArr = [...arr];
          const tmp = [newArr[i], newArr[j], newArr[k]];
          newArr[i] = tmp[1];
          newArr[j] = tmp[2];
          newArr[k] = tmp[0];
          const newKey = key(newArr);
          if (!visited.has(newKey)) {
            queue.push({ arr: newArr, steps: 0 });
            visited.add(newKey);
          }
        }
      }
    }
  }
  return true;
}

function generateSolvablePuzzle() {
  items = [1, 2, 3, 4, 5];
  correctOrder = shuffle([...items]);
  let shuffledItems;
  do {
    shuffledItems = shuffle([...items]);
  } while (
    countCorrectPositions(shuffledItems, correctOrder) !== 0 ||
    isUnsolvableTripleOnly(shuffledItems, correctOrder) ||
    correctOrder.join() === items.join()
  );
  return shuffledItems;
}

function initGame() {
  instruction.textContent = "Click exactly three items to rotate them left by one!";
  const shuffledItems = generateSolvablePuzzle();

  itemList.innerHTML = "";
  shuffledItems.forEach((itemText, index) => {
    const item = document.createElement("li");
    item.textContent = itemText;
    item.classList.add("item");
    item.dataset.index = index;
    item.addEventListener("click", () => handleItemClick(item));
    itemList.appendChild(item);
  });

  selectedItems = [];
  message.textContent = `0 out of ${correctOrder.length} are in the correct position.`;
  message.style.color = "red";

  stopTimer();
  startTimer();
  usedHint = false;
  isGameOver = false;

  clearCorrectHighlights();
}

function handleItemClick(clickedItem) {
  if (isGameOver) return; // prevent moves after win

  if (selectedItems.includes(clickedItem)) {
    selectedItems = selectedItems.filter(el => el !== clickedItem);
    clickedItem.classList.remove("selected");
  } else {
    if (selectedItems.length < 3) {
      selectedItems.push(clickedItem);
      clickedItem.classList.add("selected");
    }
  }

  if (selectedItems.length === 3) {
    rotateSelectedItemsLeft(selectedItems);
    clearSelection();
    checkOrder();
  }
}

function rotateSelectedItemsLeft(itemsToRotate) {
  const parent = itemList;
  const sorted = itemsToRotate.slice().sort((a, b) => Array.prototype.indexOf.call(parent.children, a) - Array.prototype.indexOf.call(parent.children, b));
  const indices = sorted.map(node => Array.prototype.indexOf.call(parent.children, node));
  const values = sorted.map(node => node.textContent);
  const rotatedValues = [values[1], values[2], values[0]];

  for (let i = 0; i < 3; i++) {
    parent.children[indices[i]].textContent = rotatedValues[i];
  }
}

function clearSelection() {
  selectedItems.forEach(el => el.classList.remove("selected"));
  selectedItems = [];
}

function countCorrectPositions(current, target) {
  let count = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i] === target[i]) count++;
  }
  return count;
}

function highlightCorrectPositions() {
  const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
  itemList.childNodes.forEach((item, index) => {
    if (currentOrder[index] === correctOrder[index]) {
      item.classList.add("correct");
    } else {
      item.classList.remove("correct");
    }
  });
}

function clearCorrectHighlights() {
  itemList.childNodes.forEach(item => {
    item.classList.remove("correct");
  });
}

function checkOrder() {
  const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
  let correctCount = countCorrectPositions(currentOrder, correctOrder);

  if (easyModeOn) {
    highlightCorrectPositions();
  }

  if (correctCount === correctOrder.length) {
    stopTimer();
    isGameOver = true;
    message.textContent = `congratulations! you got the order right in ${seconds.toFixed(3)} seconds!`;
    message.style.color = "green";

    document.querySelectorAll('#item-list li').forEach(item => {
      item.style.pointerEvents = 'none';
    });

    if (!usedHint && !easyModeOn) {
      const userName = prompt("Enter your name for the leaderboard:");
      if (userName && userName.trim() !== "") {
        firebase.database().ref("scores2").push({
          name: userName.trim().substring(0, 20),
          time: parseFloat(seconds.toFixed(3))
        });
      }
    } else {
      alert("score not eligible for leaderboard.");
    }
  } else {
    message.textContent = `${correctCount} out of ${correctOrder.length} are in the correct position.`;
    message.style.color = "red";
  }
}

function generateHint() {
  if (isGameOver) {
    alert("game already solved");
    return;
  }
  usedHint = true;
  const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
  for (let i = 0; i < currentOrder.length; i++) {
    for (let j = i + 1; j < currentOrder.length; j++) {
      for (let k = j + 1; k < currentOrder.length; k++) {
        const attempt = [...currentOrder];
        const rotated = [attempt[j], attempt[k], attempt[i]];
        attempt[i] = rotated[0];
        attempt[j] = rotated[1];
        attempt[k] = rotated[2];
        if (countCorrectPositions(attempt, correctOrder) > countCorrectPositions(currentOrder, correctOrder)) {
          alert(`try rotating: ${currentOrder[i]}, ${currentOrder[j]}, ${currentOrder[k]}`);
          return;
        }
      }
    }
  }
  alert("none available.");
}

function resetGame() {
  clearInterval(timerInterval);
  startTime = null;
  seconds = 0.0;
  usedHint = false;
  isGameOver = false;

  message.textContent = '';
  timerDisplay.textContent = 'Time: 0.000s';

  initGame();

  document.querySelectorAll('#item-list li').forEach(item => {
    item.classList.remove('selected', 'correct');
    item.style.pointerEvents = 'auto';
  });
}

resetButton.addEventListener('click', resetGame);
hintButton.addEventListener('click', generateHint);
easyModeButton.addEventListener('click', () => {
  easyModeOn = !easyModeOn;
  if (easyModeOn) {
    easyModeButton.classList.add("active-easy");
    highlightCorrectPositions();
  } else {
    easyModeButton.classList.remove("active-easy");
    clearCorrectHighlights();
  }
});

firebase
  .database()
  .ref("scores2")
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
