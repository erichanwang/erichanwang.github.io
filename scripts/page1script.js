document.addEventListener("DOMContentLoaded", function() {
    const startButton = document.getElementById("startButton");
    const reactionButton = document.getElementById("reactionButton");
    const result = document.getElementById("result");

    let reactionTime = 0;
    let timeoutID;

    // Function to change the button color randomly after a random time
    function changeButtonColor() {
        const randomDelay = Math.floor(Math.random() * 5000) + 2000; // Delay between 2-7 seconds
        timeoutID = setTimeout(() => {
            reactionButton.disabled = false;
            reactionButton.style.backgroundColor = 'green';
            const startTime = Date.now();
            reactionButton.onclick = () => {
                reactionTime = Date.now() - startTime;
                result.textContent = `Your reaction time is ${reactionTime} milliseconds!`;
                reactionButton.disabled = true;
                reactionButton.style.backgroundColor = '';
            };
        }, randomDelay);
    }

    // Start game when "Start" button is clicked
    startButton.addEventListener("click", function() {
        result.textContent = '';
        reactionButton.disabled = true;
        reactionButton.style.backgroundColor = '';
        startButton.disabled = true;
        changeButtonColor();
    });
});
