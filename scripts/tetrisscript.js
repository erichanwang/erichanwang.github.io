/* ---------- CONFIG ---------- */
const ROWS  = 20;
const COLS  = 10;
const BLOCK = 40;   // px

const colors = [
  null,
  '#7aa2f7', // I – cyan
  '#f7768e', // J – red
  '#ff9e64', // L – orange
  '#e0af68', // O – yellow
  '#9ece6a', // S – green
  '#bb9af7', // T – purple
  '#f7768e'  // Z – red
];

const PIECES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[2,0,0],[2,2,2],[0,0,0]],
  L: [[0,0,3],[3,3,3],[0,0,0]],
  O: [[4,4],[4,4]],
  S: [[0,5,5],[5,5,0],[0,0,0]],
  T: [[0,6,0],[6,6,6],[0,0,0]],
  Z: [[7,7,0],[0,7,7],[0,0,0]],
};

/* ---------- STATE ---------- */
const state = {
  arena  : [],
  player : { x:0, y:0, matrix:null, type:null },
  held   : null,
  canHold: true,
  bag    : [],
  next   : [],
  dropTimer: 0,
  dropInterval: 500,
  running: false
};

/* ---------- CANVAS & CONTEXTS ---------- */
const main  = document.getElementById('tetris');
const ctx   = main.getContext('2d');
const hold  = document.getElementById('hold').getContext('2d');
const nexts = [...document.querySelectorAll('.next')].map(c => c.getContext('2d'));

/* ---------- UTILITIES ---------- */
const createMatrix = (w,h) => Array.from({length:h}, () => new Array(w).fill(0));

function drawMatrix(ctx, m, dx=0, dy=0, ghost=false) {
  ctx.fillStyle = ghost ? '#ffffff30' : '';
  m.forEach((row,y)=>row.forEach((v,x)=>{
    if(v){
      ctx.fillStyle = colors[v];
      ctx.fillRect(dx+x, dy+y, 1, 1);
      ctx.strokeStyle='#00000030';
      ctx.lineWidth=.05;
      ctx.strokeRect(dx+x, dy+y, 1, 1);
    }
  }));
}

function drawGrid() {
  ctx.strokeStyle='#333';
  ctx.lineWidth=.05;
  for(let y=0;y<ROWS;y++)
    for(let x=0;x<COLS;x++)
      ctx.strokeRect(x,y,1,1);
}

/* ---------- DRAW FUNCTIONS ---------- */
function draw() {
  ctx.clearRect(0,0,COLS,ROWS);
  drawGrid();
  drawMatrix(ctx, state.arena);
  if(state.player.matrix){
    drawMatrix(ctx, state.player.matrix, state.player.x, state.player.y);
    // ghost
    let gy = state.player.y;
    while(!collide(state.player.matrix, state.player.x, gy+1)) gy++;
    drawMatrix(ctx, state.player.matrix, state.player.x, gy, true);
  }
}

function drawHold() {
  hold.clearRect(0,0,120,120);
  if(!state.held) return;
  const m = PIECES[state.held];
  const s = 20;
  const ox = (120-m[0].length*s)/2;
  const oy = (120-m.length*s)/2;
  m.forEach((row,y)=>row.forEach((v,x)=>{
    if(v){ hold.fillStyle=colors[v]; hold.fillRect(ox+x*s,oy+y*s,s,s); }
  }));
}

function drawNext() {
  state.next.forEach((type,i)=>{
    const ctx = nexts[i];
    ctx.clearRect(0,0,120,120);
    if(!type) return;
    const m = PIECES[type];
    const s = 15;
    const ox = (120-m[0].length*s)/2;
    const oy = (120-m.length*s)/2;
    m.forEach((row,y)=>row.forEach((v,x)=>{
      if(v){ ctx.fillStyle=colors[v]; ctx.fillRect(ox+x*s,oy+y*s,s,s); }
    }));
  });
}

/* ---------- GAME LOGIC ---------- */
function collide(matrix,x,y){
  for(let r=0;r<matrix.length;r++)
    for(let c=0;c<matrix[r].length;c++)
      if(matrix[r][c] && (state.arena[y+r]?.[x+c]!==0)) return true;
  return false;
}
function merge(){
  state.player.matrix.forEach((row,y)=>row.forEach((v,x)=>{
    if(v) state.arena[y+state.player.y][x+state.player.x]=v;
  }));
}
function clearLines(){
  outer: for(let y=ROWS-1;y>=0;y--){
    for(let x=0;x<COLS;x++) if(state.arena[y][x]===0) continue outer;
    state.arena.splice(y,1);
    state.arena.unshift(new Array(COLS).fill(0));
  }
}
function shuffleBag(){
  const bag=['I','J','L','O','S','T','Z'];
  for(let i=bag.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [bag[i],bag[j]]=[bag[j],bag[i]];
  }
  return bag;
}
function nextPiece(){
  if(state.bag.length===0) state.bag=shuffleBag();
  return state.bag.pop();
}
function spawn(){
  const t = nextPiece();
  state.player={
    type:t,
    matrix:PIECES[t],
    x:Math.floor(COLS/2-PIECES[t][0].length/2),
    y:0
  };
  if(collide(state.player.matrix,state.player.x,state.player.y)){
    state.arena.forEach(r=>r.fill(0)); // game over
  }
  while(state.next.length<5) state.next.push(nextPiece());
  drawNext();
}
function rotate(dir){
  const m=state.player.matrix.map(r=>r.slice());
  // 90°
  for(let y=0;y<m.length;y++)
    for(let x=0;x<y;x++) [m[x][y],m[y][x]]=[m[y][x],m[x][y]];
  dir>0?m.forEach(r=>r.reverse()):m.reverse();
  if(!collide(m,state.player.x,state.player.y)) state.player.matrix=m;
}
function move(dx){
  if(!collide(state.player.matrix,state.player.x+dx,state.player.y)) state.player.x+=dx;
}
function softDrop(on){
  state.dropInterval = on?50:500;
}
function hardDrop(){
  while(!collide(state.player.matrix,state.player.x,state.player.y+1)) state.player.y++;
  lock();
}
function lock(){
  merge();
  clearLines();
  spawn();
  state.canHold=true;
}
function gameLoop(ts){
  if(!state.running) return;
  if(ts-state.dropTimer>state.dropInterval){
    if(!collide(state.player.matrix,state.player.x,state.player.y+1)){
      state.player.y++;
    }else{
      lock();
    }
    state.dropTimer=ts;
  }
  draw();
  requestAnimationFrame(gameLoop);
}

/* ---------- INPUT ---------- */
window.addEventListener('keydown',e=>{
  if(!state.running) return;
  switch(e.code){
    case 'ArrowLeft': move(-1); break;
    case 'ArrowRight': move(1); break;
    case 'ArrowDown': softDrop(true); break;
    case 'Space': e.preventDefault(); hardDrop(); break;
    case 'KeyZ': rotate(-1); break;
    case 'KeyX': rotate(1); break;
    case 'ShiftLeft':
      if(!state.canHold||!state.player.type) break;
      [state.held,state.player.type]=[state.player.type,state.held||nextPiece()];
      state.player.matrix=PIECES[state.player.type];
      state.player.x=Math.floor(COLS/2-PIECES[state.player.type][0].length/2);
      state.player.y=0;
      state.canHold=false;
      spawn();
      break;
  }
});
window.addEventListener('keyup',e=>{
  if(e.code==='ArrowDown') softDrop(false);
});

/* ---------- INIT ---------- */
state.arena = createMatrix(COLS, ROWS);
state.bag   = shuffleBag();
draw(); drawHold(); drawNext();

main.width  = COLS * BLOCK;
main.height = ROWS * BLOCK;
ctx.scale(BLOCK, BLOCK);

/* ---------- START BUTTON ---------- */
document.getElementById('startButton').addEventListener('click', () => {
  state.running = !state.running;
  document.getElementById('startButton').textContent = state.running ? 'Restart' : 'Start';

  if (state.running) {
    state.arena.forEach(r => r.fill(0));
    state.bag = shuffleBag();
    state.next.length = 0;
    spawn();
    state.dropTimer = performance.now();
    requestAnimationFrame(gameLoop);
  }
});