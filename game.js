const canvas = document.getElementById('game');const ctx = canvas.getContext('2d');let W=canvas.width,H=canvas.height;
let playerScore=0,aiScore=0,coins=0,state='idle';
const WIN_POINTS=5;
const paddle={w:120,h:12,x:(W-120)/2,y:H-40,speed:12};
const ai={w:120,h:12,x:(W-120)/2,y:28,speed:4};
const ball={r:8,x:W/2,y:H/2,vx:0,vy:0,speed:6};
function resetBall(servingTo='player'){ball.x=W/2;ball.y=H/2;const angle=(Math.random()*Math.PI/3)+Math.PI/6;const dir=(servingTo==='player')?1:-1;ball.vx=Math.cos(angle)*ball.speed*(Math.random()*0.5+0.75);ball.vy=Math.sin(angle)*ball.speed*dir;}
function startMatch(){playerScore=0;aiScore=0;updateHUD();state='playing';resetBall('player');}
function endMatch(winner){state='ended';if(winner==='player'){coins+=50;updateCoins();alert('فزت! +50 عملة')}else{alert('خسرت!')}}
canvas.addEventListener('mousemove',(e)=>{const rect=canvas.getBoundingClientRect();const mx=e.clientX-rect.left;paddle.x=Math.max(0,Math.min(W-paddle.w,mx-paddle.w/2));});
canvas.addEventListener('touchmove',(e)=>{e.preventDefault();const rect=canvas.getBoundingClientRect();const t=e.touches[0];const mx=t.clientX-rect.left;paddle.x=Math.max(0,Math.min(W-paddle.w,mx-paddle.w/2));},{passive:false});
function update(){if(state==='playing'){ball.x+=ball.vx;ball.y+=ball.vy;if(ball.x-ball.r<0){ball.x=ball.r;ball.vx*=-1}if(ball.x+ball.r>W){ball.x=W-ball.r;ball.vx*=-1}const targetX=ball.x-ai.w/2;if(targetX>ai.x+4)ai.x+=ai.speed;else if(targetX<ai.x-4)ai.x-=ai.speed;ai.x=Math.max(0,Math.min(W-ai.w,ai.x));if(ball.vy>0&&ball.y+ball.r>=paddle.y&&ball.x>paddle.x&&ball.x<paddle.x+paddle.w){ball.y=paddle.y-ball.r;ball.vy*=-1;const hitPos=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);ball.vx+=hitPos*3;ball.vx=Math.max(-12,Math.min(12,ball.vx));}if(ball.vy<0&&ball.y-ball.r<=ai.y+ai.h&&ball.x>ai.x&&ball.x<ai.x+ai.w){ball.y=ai.y+ai.h+ball.r;ball.vy*=-1;const hitPos=(ball.x-(ai.x+ai.w/2))/(ai.w/2);ball.vx+=hitPos*3;ball.vx=Math.max(-12,Math.min(12,ball.vx));}if(ball.y-ball.r>H){aiScore+=1;updateHUD();if(aiScore>=WIN_POINTS)endMatch('ai');else resetBall('ai');}if(ball.y+ball.r<0){playerScore+=1;updateHUD();if(playerScore>=WIN_POINTS)endMatch('player');else resetBall('player');}ball.vx*=0.999;ball.vy*=0.999;}draw();requestAnimationFrame(update);}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#1aa';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(0,H/2-2,W,4);ctx.fillStyle='#ffde59';ctx.fillRect(ai.x,ai.y,ai.w,ai.h);ctx.fillStyle='#ff6b6b';ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);ctx.beginPath();ctx.fillStyle='#fff';ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();}
function updateHUD(){document.getElementById('coins-count').innerText=coins;}
document.getElementById('btn-watch').addEventListener('click',()=>{coins+=100;updateHUD();alert('شاهدت الإعلان وحصلت على 100 عملة!');});
document.getElementById('btn-start').addEventListener('click',()=>{startMatch();});
update();
updateHUD();
