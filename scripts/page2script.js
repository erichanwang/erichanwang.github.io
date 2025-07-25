document.addEventListener("DOMContentLoaded", () => {
  // vars
  const startScreen = document.getElementById("startScreen")
  const gameScreen = document.getElementById("gameScreen")
  const endScreen = document.getElementById("endScreen")

  const canvas = document.getElementById("snakeCanvas")
  const ctx = canvas.getContext("2d")
  const scoreDisplay = document.getElementById("score")
  const finalScoreDisplay = document.getElementById("finalScore")

  const startButton = document.getElementById("startButton")
  const playAgainButton = document.getElementById("playAgainButton")

  const playerColorInput = document.getElementById("playerColor")
  const gameSpeedInput = document.getElementById("gameSpeed")

  const grid = 20
  const canvasSize = canvas.width
  let count = 0
  let score = 0
  let gameRunning = false

  // user settings
  let snakeColor = "#008000"
  let speedFactor = 4

  // snake
  let snake = {
    x: grid * 5,
    y: grid * 5,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  }

  // icd
  let apple = { x: 0, y: 0 }

  // lock scroll
  document.addEventListener("keydown", (e) => {
    const keys = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"," "]
    if (keys.includes(e.key)) {
      e.preventDefault()
    }
  })

  // random int min max
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }

  // place apple random
  function placeApple() {
    apple.x = getRandomInt(0, canvasSize / grid) * grid
    apple.y = getRandomInt(0, canvasSize / grid) * grid
  }

  // reset game
  function resetGame() {
    snake.x = grid * 5
    snake.y = grid * 5
    snake.dx = grid
    snake.dy = 0
    snake.cells = []
    snake.maxCells = 4
    score = 0
    scoreDisplay.textContent = "score " + score
    placeApple()
  }

  // endscreen
  function endGame() {
    gameRunning = false
    gameScreen.style.display = "none"
    endScreen.style.display = "block"
    finalScoreDisplay.textContent = "your score was " + score
  }

  // game loop
  function gameLoop() {
    requestAnimationFrame(gameLoop)
    if (!gameRunning) return

    // slow using speedfactor
    if (++count < speedFactor) return
    count = 0

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // move snake
    snake.x += snake.dx
    snake.y += snake.dy

    // check walls
    if (
      snake.x < 0 ||
      snake.x >= canvas.width ||
      snake.y < 0 ||
      snake.y >= canvas.height
    ) {
      endGame()
      return
    }

    // new head
    snake.cells.unshift({ x: snake.x, y: snake.y })

    // pop tail
    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop()
    }

    // apple
    ctx.fillStyle = "red"
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1)

    // snake
    ctx.fillStyle = snakeColor
    snake.cells.forEach((cell, index) => {
      ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1)

      // eat apple
      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++
        score++
        scoreDisplay.textContent = "score " + score
        placeApple()
      }

      // collide self
      for (let i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          endGame()
          return
        }
      }
    })
  }

  // handle keys
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        if (snake.dx === 0) {
          snake.dx = -grid
          snake.dy = 0
        }
        break
      case "ArrowUp":
        if (snake.dy === 0) {
          snake.dy = -grid
          snake.dx = 0
        }
        break
      case "ArrowRight":
        if (snake.dx === 0) {
          snake.dx = grid
          snake.dy = 0
        }
        break
      case "ArrowDown":
        if (snake.dy === 0) {
          snake.dy = grid
          snake.dx = 0
        }
        break
    }
  })

  // start
  startButton.addEventListener("click", () => {
    snakeColor = playerColorInput.value || "#008000"
    speedFactor = parseInt(gameSpeedInput.value, 10)
    if (isNaN(speedFactor) || speedFactor < 1) {
      speedFactor = 4
    }
    startScreen.style.display = "none"
    gameScreen.style.display = "block"
    endScreen.style.display = "none"

    resetGame()
    gameRunning = true
  })

  // again
  playAgainButton.addEventListener("click", () => {
    endScreen.style.display = "none"
    startScreen.style.display = "block"
  })

  // run loop
  requestAnimationFrame(gameLoop)

  // show start screen
  startScreen.style.display = "block"
})