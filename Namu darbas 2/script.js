// Traffic light controller demo
const lights = {
  north: document.getElementById('light-north'),
  east: document.getElementById('light-east'),
  south: document.getElementById('light-south'),
  west: document.getElementById('light-west')
};

const getBulb = (el, color) => el.querySelector(`.bulb.${color}`);

const phaseLabel = document.getElementById('phase-label');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const nextBtn = document.getElementById('next-btn');
const pedBtn = document.getElementById('ped-button');
const pedStatus = document.getElementById('ped-status');

let timer = null;
let running = false;
let pedestrianRequested = false;

// Phase durations (ms)
const durations = {
  NS_GREEN: 6000,
  NS_YELLOW: 2000,
  EW_GREEN: 6000,
  EW_YELLOW: 2000,
  ALL_RED: 800,
  PEDESTRIAN: 5000
};

let phases = ['NS_GREEN','NS_YELLOW','ALL_RED','EW_GREEN','EW_YELLOW','ALL_RED'];
let idx = 0;

function resetAll(){
  Object.values(lights).forEach(l=>{
    ['red','yellow','green'].forEach(c=> getBulb(l,c).classList.remove('on'))
  })
}

function setPhase(phase){
  resetAll();
  phaseLabel.textContent = phase;
  switch(phase){
    case 'NS_GREEN':
      getBulb(lights.north,'green').classList.add('on');
      getBulb(lights.south,'green').classList.add('on');
      getBulb(lights.east,'red').classList.add('on');
      getBulb(lights.west,'red').classList.add('on');
      break;
    case 'NS_YELLOW':
      getBulb(lights.north,'yellow').classList.add('on');
      getBulb(lights.south,'yellow').classList.add('on');
      getBulb(lights.east,'red').classList.add('on');
      getBulb(lights.west,'red').classList.add('on');
      break;
    case 'EW_GREEN':
      getBulb(lights.east,'green').classList.add('on');
      getBulb(lights.west,'green').classList.add('on');
      getBulb(lights.north,'red').classList.add('on');
      getBulb(lights.south,'red').classList.add('on');
      break;
    case 'EW_YELLOW':
      getBulb(lights.east,'yellow').classList.add('on');
      getBulb(lights.west,'yellow').classList.add('on');
      getBulb(lights.north,'red').classList.add('on');
      getBulb(lights.south,'red').classList.add('on');
      break;
    case 'ALL_RED':
      ['north','south','east','west'].forEach(k=> getBulb(lights[k],'red').classList.add('on'));
      break;
    case 'PEDESTRIAN':
      // disable only north/south lights; keep east/west red
      getBulb(lights.north,'red').classList.add('on');
      getBulb(lights.south,'red').classList.add('on');
      getBulb(lights.east,'red').classList.add('on');
      getBulb(lights.west,'red').classList.add('on');
      phaseLabel.textContent = 'PEDESTRIAN WALK';
      break;
  }
}

function advancePhase(){
  idx = (idx + 1) % phases.length;
  const next = phases[idx];
  // if entering ALL_RED, check pedestrian request
  if(next === 'ALL_RED' && pedestrianRequested){
    // schedule pedestrian phase
    setPhase('ALL_RED');
    pedestrianRequested = false;
    updatePedUI();
    clearTimer();
    timer = setTimeout(()=>{
      setPhase('PEDESTRIAN');
      startPedTimer();
      timer = setTimeout(()=>{
        // after pedestrian, go to next phase after ALL_RED
        stopPedTimer();
        idx = (idx + 1) % phases.length; // move past this ALL_RED
        runCurrentPhase();
      }, durations.PEDESTRIAN);
    }, durations.ALL_RED);
    return;
  }
  runCurrentPhase();
}

function runCurrentPhase(){
  const current = phases[idx];
  setPhase(current);
  clearTimer();
  timer = setTimeout(()=>{
    advancePhase();
  }, durations[current]);
}

function clearTimer(){ if(timer) { clearTimeout(timer); timer = null; } }

startBtn.addEventListener('click', ()=>{
  if(running) return;
  running = true; startBtn.disabled = true; stopBtn.disabled = false;
  idx = 0; setPhase('ALL_RED');
  // small delay then start cycle
  timer = setTimeout(()=> runCurrentPhase(), durations.ALL_RED);
});

stopBtn.addEventListener('click', ()=>{
  running = false; startBtn.disabled = false; stopBtn.disabled = true; clearTimer(); stopPedTimer(); setPhase('ALL_RED'); phaseLabel.textContent='stopped';
});

nextBtn.addEventListener('click', ()=>{ clearTimer(); advancePhase(); });

pedBtn.addEventListener('click', ()=>{
  pedestrianRequested = true; updatePedUI(); pedBtn.setAttribute('aria-pressed','true');
});

let pedCountdown = null;
function startPedTimer() {
  let timeRemaining = durations.PEDESTRIAN / 1000; // convert to seconds
  pedStatus.textContent = `${timeRemaining}s`;
  pedCountdown = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      clearInterval(pedCountdown);
      pedCountdown = null;
      updatePedUI();
    } else {
      pedStatus.textContent = `${timeRemaining}s`;
    }
  }, 1000);
}

function stopPedTimer() {
  if (pedCountdown) {
    clearInterval(pedCountdown);
    pedCountdown = null;
  }
}

function updatePedUI(){ pedStatus.textContent = pedestrianRequested ? 'Requested' : 'No request'; }

// Initialize with all red
setPhase('ALL_RED');
updatePedUI();
