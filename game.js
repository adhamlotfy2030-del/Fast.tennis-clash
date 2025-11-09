// Simple 2D tennis-like demo
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;

let playerScore = 0, aiScore = 0, coins = 0;
let state = 'idle'; // idle, playing, ended
const WIN_POINTS = 5;

// Game objects
const paddle = { w: 120, h: 12, x: (W-120)/2, y: H-40, speed: 12 };
const ai = { w: 120, h: 12, x: (W-120)/2, y: 28, speed: 4 };
const ball = { r: 8, x: W/2, y: H/2, vx: 0, vy: 0, speed: 6 };

function resetBall(servingTo='player') {
  ball.x = W/2; ball.y = H/2;
  const angle = (Math.random()*Math.PI/3)+Math.PI/6;
  const dir = (servingTo === 'player') ? 1 : -1;
  ball.vx = Math.cos(angle)*ball.speed*(Math.random()*0.5+0.75);
  ball.vy = Math.sin(angle)*ball.speed*dir;
}

function startMatch(){
  playerScore = 0; aiScore = 0; updateHUD();
  state = 'playing'; document.getElementById('status').innerText = 'قيد اللعب';
  resetBall('player');
}

function endMatch(winner){
  state = 'ended';
  document.getElementById('status').innerText = winner === 'player' ? 'فزت!': 'خسرت';
  if(winner === 'player'){ coins += 50; updateCoins(); }
}

// Input (mouse/touch)
let dragging = false;
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(W-paddle.w, mx - paddle.w/2));
});
canvas.addEventListener('touchmove',(e)=>{
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  const mx = t.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(W-paddle.w, mx - paddle.w/2));
},{passive:false});

// Game loop
function update(){
  if(state === 'playing'){
    // move ball
    ball.x += ball.vx; ball.y += ball.vy;
    // wall bounce
    if(ball.x - ball.r < 0){ ball.x = ball.r; ball.vx *= -1; }
    if(ball.x + ball.r > W){ ball.x = W-ball.r; ball.vx *= -1; }

    // AI movement simple
    const targetX = ball.x - ai.w/2;
    if(targetX > ai.x+4) ai.x += ai.speed;
    else if(targetX < ai.x-4) ai.x -= ai.speed;
    ai.x = Math.max(0, Math.min(W-ai.w, ai.x));

    // collision with paddles
    if(ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w){
      ball.y = paddle.y - ball.r; ball.vy *= -1; // invert
      // add spin depending on where hit
      const hitPos = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
      ball.vx += hitPos * 3;
      ball.vx = Math.max(-12, Math.min(12, ball.vx));
    }
    if(ball.vy < 0 && ball.y - ball.r <= ai.y + ai.h && ball.x > ai.x && ball.x < ai.x + ai.w){
      ball.y = ai.y + ai.h + ball.r; ball.vy *= -1;
      const hitPos = (ball.x - (ai.x + ai.w/2)) / (ai.w/2);
      ball.vx += hitPos * 3;
      ball.vx = Math.max(-12, Math.min(12, ball.vx));
    }

    // score
    if(ball.y - ball.r > H){
      // AI point
      aiScore += 1; updateHUD();
      if(aiScore >= WIN_POINTS) endMatch('ai');
      else { resetBall('ai'); document.getElementById('status').innerText = 'نقطة للمنافس'; }
    }
    if(ball.y + ball.r < 0){
      // Player point
      playerScore += 1; updateHUD();
      if(playerScore >= WIN_POINTS) endMatch('player');
      else { resetBall('player'); document.getElementById('status').innerText = 'نقطة لك'; }
    }

    // slow down small velocities slightly
    ball.vx *= 0.999;
    ball.vy *= 0.999;
  }
  draw();
  requestAnimationFrame(update);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // court
  ctx.fillStyle = '#1aa'; ctx.fillRect(0,0,W,H);
  // net line
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0,H/2-2,W,4);
  // ai paddle
  ctx.fillStyle = '#ffde59'; ctx.fillRect(ai.x, ai.y, ai.w, ai.h);
  // player paddle
  ctx.fillStyle = '#ff6b6b'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  // ball
  ctx.beginPath(); ctx.fillStyle = '#fff'; ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
  // scoreboard small
}

function updateHUD(){
  document.getElementById('score-player').innerText = playerScore;
  document.getElementById('score-ai').innerText = aiScore;
}

function updateCoins(){ document.getElementById('coins-count').innerText = coins; }

// Simulated rewarded ad flow
document.getElementById('btn-watch').addEventListener('click', ()=>{
  // If we had preloaded a real ad, we'd show it. Here we simulate a rewarded ad.
  showSimulatedAd().then(()=>{
    coins += 100; updateCoins();
    alert('شاهدت الإعلان وحصلت على 100 عملة!');
  });
});

function showSimulatedAd(){
  return new Promise((res)=>{
    // show a modal-like fake ad for 4 seconds
    const overlay = document.createElement('div');
    overlay.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;color:white;flex-direction:column';
    overlay.innerHTML = '<div style="background:#222;padding:20px;border-radius:8px;text-align:center;max-width:90%"><h3>إعلان تجريبي</h3><p>سيظهر إعلان حقيقي هنا بعد دمجه</p><div id="ad-countdown">4</div></div>';
    document.body.appendChild(overlay);
    let t = 4;
    const iv = setInterval(()=>{
      t--; overlay.querySelector('#ad-countdown').innerText = t;
      if(t<=0){ clearInterval(iv); document.body.removeChild(overlay); res(); }
    },1000);
  });
}

// Start button
document.getElementById('btn-start').addEventListener('click', ()=>{
  startMatch();
});

// responsive canvas
function resize(){
  const wrapW = Math.min(900, window.innerWidth-40);
  canvas.style.width = wrapW + 'px';
}
window.addEventListener('resize', resize);
resize();

update(); // start loop
updateCoins();
