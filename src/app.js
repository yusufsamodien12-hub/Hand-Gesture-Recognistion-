import { dist, fingerThumbProximity } from './proximity.js';

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const gestureText = document.getElementById('gestureText');
const fpsVal = document.getElementById('fpsVal');
const proximityText = document.getElementById('proximityText');

// controls
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const detectToggle = document.getElementById('detectToggle');
const confidenceInput = document.getElementById('confidence');
const maxHandsInput = document.getElementById('maxHands');
const clearLogBtn = document.getElementById('clearLogBtn');
const downloadLogBtn = document.getElementById('downloadLogBtn');
const logEl = document.getElementById('log');
const indicator = document.getElementById('indicator');

let lastTime = performance.now();
let camera = null;
let detectionEnabled = true;
let lastGesture = null;
let lastLogTime = 0;
const logs = [];
let lastProximitySet = '';

function resizeCanvasToDisplaySize() {
  const rect = canvasElement.getBoundingClientRect();
  canvasElement.width = rect.width;
  canvasElement.height = rect.height;
}

function countExtendedFingers(landmarks) {
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];
  let count = 0;
  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[pips[i]].y) count++;
  }
  return count;
}

function detectGesture(landmarks) {
  if (!landmarks) return '—';
  const wristY = landmarks[0].y;
  const thumbTipY = landmarks[4].y;
  const extended = countExtendedFingers(landmarks);
  const thumbUp = thumbTipY < wristY - 0.05;

  if (extended >= 4) return 'Open Palm';
  if (extended <= 1 && thumbUp) return 'Thumbs Up';
  if (extended <= 1) return 'Fist';
  return 'Unknown';
}

// proximity helpers are provided by src/proximity.js

function setIndicator(gesture) {
  if (!gesture || gesture === 'No hand' || gesture === '—') {
    indicator.style.background = '#6b7280';
    return;
  }
  if (gesture === 'Open Palm') indicator.style.background = '#0ea5a5';
  else if (gesture === 'Thumbs Up') indicator.style.background = '#10b981';
  else if (gesture === 'Fist') indicator.style.background = '#ef4444';
  else indicator.style.background = '#60a5fa';
}

function logEvent(text) {
  const t = new Date();
  const stamp = t.toLocaleTimeString();
  const entry = `${stamp} — ${text}`;
  logs.push(entry);
  const div = document.createElement('div');
  div.className = 'log-entry';
  div.textContent = entry;
  logEl.prepend(div);
  // keep size limited
  if (logs.length > 500) {
    logs.shift();
    if (logEl.children.length > 500) logEl.removeChild(logEl.lastChild);
  }
}

function onResults(results) {
  resizeCanvasToDisplaySize();
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#00FFF0', lineWidth: 2});
      window.drawLandmarks(canvasCtx, landmarks, {color: '#FF6B6B', lineWidth: 1});
      const g = detectGesture(landmarks);
      gestureText.textContent = g;
      setIndicator(g);

      // proximity
      const prox = fingerThumbProximity(landmarks);
      const names = prox.near.map(p => p.finger).join(', ') || 'None';
      proximityText.textContent = names;

      const now = performance.now();
      if (g !== lastGesture || now - lastLogTime > 1000) {
        logEvent(`Detected: ${g}`);
        lastGesture = g;
        lastLogTime = now;
      }
      // log proximity changes
      if (names !== lastProximitySet) {
        logEvent(`Thumb near: ${names}`);
        lastProximitySet = names;
      }
    }
  } else {
    gestureText.textContent = 'No hand';
    setIndicator('No hand');
    const now = performance.now();
    if (lastGesture !== 'No hand' && now - lastLogTime > 800) {
      logEvent('No hand');
      lastGesture = 'No hand';
      lastLogTime = now;
    }
    proximityText.textContent = '—';
    lastProximitySet = '';
  }

  const now = performance.now();
  const fps = 1000 / (now - lastTime);
  lastTime = now;
  fpsVal.textContent = Math.round(fps);

  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

function applyOptions() {
  hands.setOptions({
    maxNumHands: Number(maxHandsInput.value) || 1,
    modelComplexity: 1,
    minDetectionConfidence: Number(confidenceInput.value) || 0.7,
    minTrackingConfidence: 0.5
  });
}

applyOptions();
hands.onResults(onResults);

function ensureCamera() {
  if (camera) return;
  camera = new Camera(videoElement, {
    onFrame: async () => {
      if (detectionEnabled) {
        await hands.send({image: videoElement});
      } else {
        // draw raw video to canvas when detection disabled
        resizeCanvasToDisplaySize();
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.restore();
      }
    },
    width: 1280,
    height: 720
  });
}

async function startCamera() {
  try {
    ensureCamera();
    await camera.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    logEvent('Camera started');
  } catch (err) {
    console.error('Camera start failed:', err);
    alert('Could not start camera. Check permissions and that you are on HTTPS or localhost.');
  }
}

function stopCamera() {
  try {
    if (camera) camera.stop();
    // stop media tracks
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoElement.srcObject = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    logEvent('Camera stopped');
  } catch (err) {
    console.warn('Error stopping camera', err);
  }
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
detectToggle.addEventListener('change', (e) => {
  detectionEnabled = e.target.checked;
  logEvent(`Detection ${detectionEnabled ? 'enabled' : 'disabled'}`);
});
confidenceInput.addEventListener('input', () => { applyOptions(); });
maxHandsInput.addEventListener('change', () => { applyOptions(); logEvent(`Max hands set to ${maxHandsInput.value}`); });
clearLogBtn.addEventListener('click', () => { logs.length = 0; logEl.innerHTML = ''; logEvent('Log cleared'); });
downloadLogBtn.addEventListener('click', () => {
  const blob = new Blob([logs.join('\n')], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gesture-log-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// auto-start camera on load if user wants
startCamera();
