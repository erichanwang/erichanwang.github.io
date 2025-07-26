document.addEventListener('DOMContentLoaded', () => {
    const game1Button = document.getElementById('game1-button');
    const game2Button = document.getElementById('game2-button');
    const game3Button = document.getElementById('game3-button');
    const gameContainers = document.querySelectorAll('.game-mode');
    let activeTimerInterval = null;

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

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Generates a derangement of an array, ensuring it's always a valid starting state.
    // For games requiring even permutations (3-item and 4-item swaps), it enforces that rule.
    function generateDerangement(sourceArray, mustBeEven) {
        let deranged;
        let attempts = 0;
        const isDerangement = (arr) => !arr.some((val, i) => val === sourceArray[i]);

        do {
            // Fisher-Yates shuffle
            deranged = sourceArray.slice();
            for (let i = deranged.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deranged[i], deranged[j]] = [deranged[j], deranged[i]];
            }
            attempts++;
            if (attempts > 200) { // Failsafe for very unlikely scenarios
                // Fallback to a cyclic shift, which is always a derangement.
                deranged = sourceArray.map((_, i, arr) => arr[(i + 1) % arr.length]);
                const n = sourceArray.length;
                const isCyclicEven = (n % 2) !== 0; // A cycle of length n is even if n is odd

                if (mustBeEven && !isCyclicEven) {
                    // If we need an even permutation and the cycle is odd (e.g., n=6),
                    // one extra swap will make it even. This keeps it a derangement if n > 2.
                    if (n > 2) {
                       [deranged[0], deranged[1]] = [deranged[1], deranged[0]];
                    }
                }
                break; // Exit loop
            }
        } while (
            !isDerangement(deranged) ||
            (mustBeEven && !isEvenPermutation(deranged, sourceArray))
        );
        return deranged;
    }

    function isEvenPermutation(arr, target) {
        // Count the number of inversions
        let count = 0;
        let pos = target.map(v => arr.indexOf(v));
        for (let i = 0; i < pos.length; i++) {
            for (let j = i + 1; j < pos.length; j++) {
                if (pos[i] > pos[j]) count++;
            }
        }
        return count % 2 === 0;
    }

    const switchGameMode = (gameId) => {
        if (activeTimerInterval) {
            clearInterval(activeTimerInterval);
            activeTimerInterval = null;
        }
        gameContainers.forEach(container => {
            container.classList.remove('active');
        });
        const activeContainer = document.getElementById(gameId);
        activeContainer.classList.add('active');
        // Automatically start the game when switching modes
        const resetButton = activeContainer.querySelector('button[id$="reset-button"]');
        if (resetButton) {
            resetButton.click();
        }
    };

    const createGame = (gameConfig) => {
        const { gameId, dbRef, itemGenerator, clickHandler, hintGenerator, itemSize, rotateSize } = gameConfig;
        const itemList = document.getElementById(`${gameId}-item-list`);
        const message = document.getElementById(`${gameId}-message`);
        const resetButton = document.getElementById(`${gameId}-reset-button`);
        const timerDisplay = document.getElementById(`${gameId}-timer`);
        const leaderboard = document.getElementById(`${gameId}-leaderboard`);
        const hintButton = document.getElementById(`${gameId}-hint-button`);
        const easyModeButton = document.getElementById(`${gameId}-easy-mode-button`);
        const sortTimeButton = document.getElementById(`${gameId}-sort-time`);
        const sortMovesButton = document.getElementById(`${gameId}-sort-moves`);
        const setCorrectOrder = (arr) => { correctOrder = arr; };
        
        let correctOrder = [];
        let selectedItems = [];
        let seconds = 0.0, usedHint = false, isGameOver = false, easyModeOn = false, easyModeUsed = false, moves = 0;
        let scores = [];

        const startTimer = () => {
            if (activeTimerInterval) clearInterval(activeTimerInterval);
            const startTime = Date.now();
            timerDisplay.textContent = "Time: 0.000s";
            activeTimerInterval = setInterval(() => {
                seconds = (Date.now() - startTime) / 1000;
                timerDisplay.textContent = `Time: ${seconds.toFixed(3)}s`;
            }, 50);
        };

        const stopTimer = () => {
            clearInterval(activeTimerInterval);
            activeTimerInterval = null;
        };

        const initGame = () => {
            const items = itemGenerator(itemSize, setCorrectOrder);
            itemList.innerHTML = "";

            items.forEach(itemText => {
                const item = document.createElement("li");
                item.textContent = itemText;
                item.classList.add("item");
                item.addEventListener("click", () => handleItemClick(item));
                itemList.appendChild(item);
            });

            selectedItems = [];
            message.textContent = `0 out of ${correctOrder.length} are correct.`;
            message.style.color = "red";
            stopTimer();
            startTimer();
            moves = 0;
            isGameOver = false;
            usedHint = false;
            easyModeUsed = easyModeOn; // If easy mode is on at the start, it counts as used.

            if (easyModeButton) {
                if (easyModeOn) {
                    easyModeButton.classList.add("active-easy");
                    highlightCorrectPositions();
                } else {
                    easyModeButton.classList.remove("active-easy");
                    clearCorrectHighlights();
                }
            }
            
            // Call checkOrder which will handle highlighting if easy mode is on
            // Only call checkOrder if not game over and blocks are loaded
            if (itemList.children.length === correctOrder.length) {
                checkOrder();
            }
        };

        const handleItemClick = (item) => {
            if (isGameOver) return;
            clickHandler(item, selectedItems, rotateSize, checkOrder, rotateItems);
        };
        
        const rotateItems = (itemsToRotate) => {
            moves++;
            if (rotateSize === 4) {
                // Sort selected items by their DOM order
                const sorted = [...itemsToRotate].sort(
                    (a, b) => Array.from(a.parentNode.children).indexOf(a) - Array.from(b.parentNode.children).indexOf(b)
                );
                // Rotate left
                const values = sorted.map(item => item.textContent);
                const rotated = values.slice(1).concat(values[0]);
                sorted.forEach((item, i) => item.textContent = rotated[i]);
            } else if (rotateSize === 3) {
                // Same logic for 3: sort and rotate left
                const sorted = [...itemsToRotate].sort(
                    (a, b) => Array.from(a.parentNode.children).indexOf(a) - Array.from(b.parentNode.children).indexOf(b)
                );
                const values = sorted.map(item => item.textContent);
                const rotated = values.slice(1).concat(values[0]);
                sorted.forEach((item, i) => item.textContent = rotated[i]);
            } else if (rotateSize === 2) {
                // For 2, just swap
                const sorted = [...itemsToRotate].sort(
                    (a, b) => Array.from(a.parentNode.children).indexOf(a) - Array.from(b.parentNode.children).indexOf(b)
                );
                const values = sorted.map(item => item.textContent);
                const rotated = values.reverse();
                sorted.forEach((item, i) => item.textContent = rotated[i]);
            }
        };

        const checkOrder = () => {
            if (isGameOver) return; // Prevent win logic if already over
            const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
            let correctCount = currentOrder.reduce((acc, val, i) => acc + (val === correctOrder[i] ? 1 : 0), 0);

            if (easyModeOn) highlightCorrectPositions();

            if (correctCount === correctOrder.length) {
                stopTimer();
                isGameOver = true;
                message.textContent = `Congratulations! You won in ${seconds.toFixed(3)}s and ${moves} moves!`;
                message.style.color = "green";
                if (!usedHint && !easyModeUsed) {
                    const userName = prompt("Enter your name for the leaderboard:");
                    if (userName) {
                        // const timestamp = new Date().toISOString(); // Timestamp can be added here
                        firebase.database().ref(dbRef).push({
                            name: userName.trim().substring(0, 20),
                            time: parseFloat(seconds.toFixed(3)),
                            moves: moves,
                            // date: timestamp // And saved here
                        });
                    }
                }
            } else {
                message.textContent = `${correctCount} out of ${correctOrder.length} are correct. Moves: ${moves}`;
                message.style.color = "red";
            }
        };

        const highlightCorrectPositions = () => {
            const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
            itemList.childNodes.forEach((item, index) => {
                item.classList.toggle("correct", currentOrder[index] === correctOrder[index]);
            });
        };

        const clearCorrectHighlights = () => {
            itemList.childNodes.forEach(item => item.classList.remove("correct"));
        };

        resetButton.addEventListener("click", initGame);
        if (hintButton) hintButton.addEventListener("click", () => { usedHint = true; hintGenerator(correctOrder); });
        if (easyModeButton) {
            easyModeButton.addEventListener("click", () => {
                easyModeOn = !easyModeOn;
                easyModeUsed = true;
                easyModeButton.classList.toggle("active-easy", easyModeOn);
                if (easyModeOn) highlightCorrectPositions();
                else clearCorrectHighlights();
            });
        }

        const renderLeaderboard = (sortBy = 'time') => {
            leaderboard.innerHTML = "";

            // Filter scores first, especially for 'moves' sort
            let filteredScores = scores;
            if (sortBy === 'moves') {
                filteredScores = scores.filter(score => score.moves !== undefined);
            }

            // Sort the filtered scores
            filteredScores.sort((a, b) => a[sortBy] - b[sortBy]);
            
            let rank = 1;
            filteredScores.forEach((score) => {
                const { name, time, moves } = score; // Removed 'date'
                const li = document.createElement("li");
                li.className = "leaderboard-entry";

                let scoreDisplay = '';
                if (sortBy === 'time') {
                    scoreDisplay = `${time.toFixed(3)}s`;
                } else {
                    scoreDisplay = `${moves} moves`;
                }

                // const dateString = date ? new Date(date).toLocaleString() : ''; // Date display logic commented out

                li.innerHTML = `<span class="rank-name">${rank}. ${name}</span><span class="time">${scoreDisplay}</span>`; // Changed class to 'time' for styling
                leaderboard.appendChild(li);
                rank++;
            });
        };

        sortTimeButton.addEventListener('click', () => renderLeaderboard('time'));
        sortMovesButton.addEventListener('click', () => renderLeaderboard('moves'));

        firebase.database().ref(dbRef).on("value", (snapshot) => {
            scores = [];
            snapshot.forEach((child) => {
                scores.push(child.val());
            });
            renderLeaderboard();
        });

        initGame();
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    createGame({
        gameId: 'game1',
        dbRef: 'scores',
        itemSize: 5, // 5 blocks
        itemGenerator: (size, setCorrectOrder) => {
            const correct = shuffle(Array.from({ length: size }, (_, i) => i + 1));
            setCorrectOrder([...correct]);
            // Game 1 (2-swaps) can be any permutation, so no need to check for evenness.
            return generateDerangement(correct, false);
        },

        clickHandler: (item, selected, size, callback, rotate) => {
            if (selected.includes(item)) {
                item.classList.remove('selected');
                selected.splice(selected.indexOf(item), 1);
            } else {
                item.classList.add('selected');
                selected.push(item);
            }
            if (selected.length === size) {
                rotate(selected);
                selected.forEach(i => i.classList.remove('selected'));
                selected.length = 0;
                callback();
            }
        },
        hintGenerator: function(correctOrder) {
            const currentOrder = Array.from(document.getElementById('game1-item-list').children).map(item => parseInt(item.textContent));
            for (let i = 0; i < currentOrder.length; i++) {
                if (currentOrder[i] !== correctOrder[i]) {
                    // Find where the correct value is
                    const swapIdx = currentOrder.indexOf(correctOrder[i]);
                    alert(`Hint: Swap ${currentOrder[i]} and ${currentOrder[swapIdx]}.`);
                    return;
                }
            }
            alert("Everything is already in order!");
        },
        rotateSize: 2
    });

    createGame({
        gameId: 'game2',
        dbRef: 'scores2',
        itemSize: 5, // 5 blocks
        itemGenerator: (size, setCorrectOrder) => {
            const correct = shuffle(Array.from({ length: size }, (_, i) => i + 1));
            setCorrectOrder([...correct]);
            // Game 2 (3-rotations) is an even permutation, so the starting state must be solvable.
            return generateDerangement(correct, true);
        },
        clickHandler: (item, selected, size, callback, rotate) => {
            if (selected.includes(item)) {
                item.classList.remove('selected');
                selected.splice(selected.indexOf(item), 1);
            } else {
                item.classList.add('selected');
                selected.push(item);
            }
            if (selected.length === size) {
                rotate(selected);
                selected.forEach(i => i.classList.remove('selected'));
                selected.length = 0;
                callback();
            }
        },
        hintGenerator: function(correctOrder) {
            const itemList = document.getElementById('game2-item-list');
            const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));
            // Try all groups of 3
            for (let i = 0; i <= currentOrder.length - 3; i++) {
                const group = currentOrder.slice(i, i + 3);
                // Try rotating left
                const rotated = group.slice(1).concat(group[0]);
                const testOrder = currentOrder.slice();
                for (let j = 0; j < 3; j++) testOrder[i + j] = rotated[j];
                // See if this improves the number of correct positions
                const before = currentOrder.reduce((acc, val, idx) => acc + (val === correctOrder[idx] ? 1 : 0), 0);
                const after = testOrder.reduce((acc, val, idx) => acc + (val === correctOrder[idx] ? 1 : 0), 0);
                if (after > before) {
                    alert(`Hint: Swap ${group.join(', ')}.`);
                    return;
                }
            }
            alert("No helpful rotation found. Try another move!");
        },
        rotateSize: 3
    });

    createGame({
        gameId: 'game3',
        dbRef: 'scores3',
        itemSize: 6, // 6 blocks
        itemGenerator: (size, setCorrectOrder) => {
            const correct = shuffle(Array.from({ length: size }, (_, i) => i + 1));
            setCorrectOrder([...correct]);
            // Game 3 (4-rotations) is an even permutation, so the starting state must be solvable.
            return generateDerangement(correct, true);
        },

        clickHandler: (item, selected, size, callback, rotate) => {
            if (selected.includes(item)) {
                item.classList.remove('selected');
                selected.splice(selected.indexOf(item), 1);
            } else {
                item.classList.add('selected');
                selected.push(item);
            }
            if (selected.length === size) {
                rotate(selected);
                selected.forEach(i => i.classList.remove('selected'));
                selected.length = 0;
                callback();
            }
        },
        hintGenerator: function(correctOrder) {
            const itemList = document.getElementById('game3-item-list');
            const currentOrder = Array.from(itemList.children).map(item => parseInt(item.textContent));

            const indices = [0, 1, 2, 3, 4, 5];

            function combinations(arr, k) {
                if (k === 0) return [[]];
                if (arr.length < k) return [];
                const [first, ...rest] = arr;
                const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
                const withoutFirst = combinations(rest, k);
                return withFirst.concat(withoutFirst);
            }

            const allCombos = combinations(indices, 4);

            let bestCombo = null;
            let bestAfter = -1;

            for (const combo of allCombos) {
                const values = combo.map(i => currentOrder[i]);
                const rotated = [values[1], values[2], values[3], values[0]];
                const testOrder = [...currentOrder];
                for (let i = 0; i < 4; i++) testOrder[combo[i]] = rotated[i];

                const correctCount = testOrder.reduce((acc, val, idx) => acc + (val === correctOrder[idx] ? 1 : 0), 0);

                if (correctCount > bestAfter) {
                    bestAfter = correctCount;
                    bestCombo = combo;
                }
            }

            if (bestCombo) {
                const rotated = bestCombo.map(i => currentOrder[i]);
                alert(`best move: rotate positions ${bestCombo.join(', ')} → [${rotated.join(', ')}]`);
            } else {
                alert("no valid moves found. \n the correct order is: " + correctOrder.join(', '));
            }
        },
        rotateSize: 4
    });

    let keyboardBuffer = [];
    let currentGame = 1; // 1, 2, or 3

    const getActiveGame = () => {
        if (document.getElementById('game1-container').classList.contains('active')) return 1;
        if (document.getElementById('game2-container').classList.contains('active')) return 2;
        if (document.getElementById('game3-container').classList.contains('active')) return 3;
        return 1;
    };

    document.addEventListener('keydown', (e) => {
        const activeGameId = getActiveGame();
        const gameContainer = document.getElementById(`game${activeGameId}-container`);
        if (!gameContainer) return;

        // Handle number keys for item selection
        if (/^[1-9]$/.test(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            const itemList = gameContainer.querySelector('.item-list');
            const items = Array.from(itemList.children);
            if (idx < items.length) {
                const item = items[idx];
                if (item) {
                    item.click();
                }
            }
        }

        // Handle 'r' key for reset
        if (e.key.toLowerCase() === 'r') {
            const resetButton = gameContainer.querySelector('button[id$="reset-button"]');
            if (resetButton) {
                resetButton.click();
            }
        }
    });

    game1Button.addEventListener('click', () => switchGameMode('game1-container'));
    game2Button.addEventListener('click', () => switchGameMode('game2-container'));
    game3Button.addEventListener('click', () => switchGameMode('game3-container'));

    switchGameMode('game1-container'); // Start with game 1
});
