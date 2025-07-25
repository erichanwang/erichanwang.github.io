console.clear();

const width = 620;
const height = 534;

const multipliers = [50, 20, 7, 4, 3, 1, 1, 0, 0, 0, 1, 1, 3, 4, 7, 20, 50];

// update notes with multiplier text
multipliers.forEach((m, i) => {
  const note = document.getElementById(`note-${i}`);
  if (note) note.textContent = m;
});

// create Tone.js Notes (requires Tone.js loaded)
class Note {
  constructor(note) {
    this.synth = new Tone.PolySynth().toDestination();
    this.synth.set({ volume: -6 });
    this.note = note;
  }
  play() {
    return this.synth.triggerAttackRelease(this.note, "32n", Tone.now());
  }
}

const notes = [
  "C#5", "C5", "B5", "A#5", "A5", "G#4", "G4",
  "F#4", "F4", "F#4", "G4", "G#4", "A5", "A#5", "B5", "C5", "C#5"
].map(noteName => new Note(noteName));

let balls = 10;
const ballsEl = document.getElementById("balls");

// noise synth for drop sound
const clickSynth = new Tone.NoiseSynth({ volume: -26 }).toDestination();

const dropButton = document.getElementById("drop-button");
const autoDropCheckbox = document.getElementById("checkbox");
let autoDropEnabled = false;
let autoDroppingInterval = null;

dropButton.addEventListener("click", () => {
  if (autoDropEnabled) {
    if (autoDroppingInterval) {
      dropButton.textContent = "Start";
      clearInterval(autoDroppingInterval);
      autoDroppingInterval = null;
    } else {
      dropButton.textContent = "Stop";
      dropABall();
      autoDroppingInterval = setInterval(dropABall, 600);
    }
  } else {
    dropABall();
  }
});

autoDropCheckbox.addEventListener("input", e => {
  autoDropEnabled = e.target.checked;
  if (autoDropEnabled) {
    dropButton.textContent = "Start";
  } else {
    dropButton.textContent = "Drop";
  }
  if (autoDroppingInterval) {
    clearInterval(autoDroppingInterval);
    autoDroppingInterval = null;
  }
});

// Matter.js aliases
const { Engine, Events, Render, Runner, Bodies, Composite } = Matter;

const BALL_RAD = 7;
const GAP = 32;
const PEG_RAD = 4;

// create engine and world
const engine = Engine.create({
  gravity: { scale: 0.0007 }
});

const canvas = document.getElementById("canvas");
const render = Render.create({
  canvas,
  engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "#14151f"
  }
});

// create pegs
const pegs = [];
for (let r = 0; r < 16; r++) {
  const pegsInRow = r + 3;
  for (let c = 0; c < pegsInRow; c++) {
    const x = width / 2 + (c - (pegsInRow - 1) / 2) * GAP;
    const y = GAP + r * GAP;
    const peg = Bodies.circle(x, y, PEG_RAD, {
      isStatic: true,
      label: "Peg",
      render: { fillStyle: "#fff" }
    });
    pegs.push(peg);
  }
}
Composite.add(engine.world, pegs);

// create ground
const ground = Bodies.rectangle(width / 2, height + 22, width * 2, 40, {
  isStatic: true,
  label: "Ground"
});
Composite.add(engine.world, [ground]);

// track peg animations (for glow effect)
const pegAnims = new Array(pegs.length).fill(null);

function checkCollision(event, label1, label2, callback) {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    let body1, body2;
    if (bodyA.label === label1 && bodyB.label === label2) {
      body1 = bodyA;
      body2 = bodyB;
    } else if (bodyA.label === label2 && bodyB.label === label1) {
      body1 = bodyB;
      body2 = bodyA;
    }
    if (body1 && body2) {
      callback(body1, body2);
    }
  });
}

Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    // ball hits ground
    checkCollision(event, "Ball", "Ground", ball => {
      Composite.remove(engine.world, ball);
      const index = Math.floor((ball.position.x - width / 2) / GAP + 17 / 2);
      if (index >= 0 && index < 17) {
        const ballsWon = Math.floor(multipliers[index]);
        balls += ballsWon;
        ballsEl.textContent = balls;
        const el = document.getElementById(`note-${index}`);
        if (el.dataset.pressed !== "true") {
          notes[index].play();
          el.dataset.pressed = "true";
          setTimeout(() => {
            el.dataset.pressed = "false";
          }, 500);
        }
      }
    });

    // ball hits peg
    checkCollision(event, "Peg", "Ball", peg => {
      const index = pegs.findIndex(p => p === peg);
      if (index === -1) throw new Error("peg not found");
      if (!pegAnims[index]) pegAnims[index] = Date.now();
    });
  });
});

Render.run(render);

const ctx = canvas.getContext("2d");
function run() {
  const now = Date.now();

  // draw peg animations
  pegAnims.forEach((anim, index) => {
    if (!anim) return;
    const delta = now - anim;
    if (delta > 1200) {
      pegAnims[index] = null;
      return;
    }
    const peg = pegs[index];
    const pct = delta / 1200;
    const expandProgression = 1 - Math.abs(pct * 2 - 1);
    const expandRadius = expandProgression * 12;
    ctx.fillStyle = "#fff2";
    ctx.beginPath();
    ctx.arc(peg.position.x, peg.position.y, expandRadius, 0, 2 * Math.PI);
    ctx.fill();
  });

  Engine.update(engine, 1000 / 60);

  requestAnimationFrame(run);
}

run();

// drop a ball function
function dropABall() {
  if (balls <= 0) return;
  balls--;
  ballsEl.textContent = balls;

  const dropLeft = width / 2 - GAP;
  const dropRight = width / 2 + GAP;
  const dropWidth = dropRight - dropLeft;
  const x = Math.random() * dropWidth + dropLeft;
  const y = -PEG_RAD;

  const ball = Bodies.circle(x, y, BALL_RAD, {
    label: "Ball",
    restitution: 0.6,
    render: { fillStyle: "#f23" }
  });
  Composite.add(engine.world, [ball]);

  clickSynth.triggerAttackRelease("32n", Tone.now());
}
