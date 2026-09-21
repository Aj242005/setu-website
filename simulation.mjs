import { DURATION, ENTRY, EXIT, STEP, MAP_SCALE, buildSimulation, frameAt, mapPoint } from './simulation-model.mjs';

const stage = document.querySelector('#simulation-stage');
const play = document.querySelector('#sim-play');
const restart = document.querySelector('#sim-restart');
const timeline = document.querySelector('#sim-time');
const sensorToggle = document.querySelector('#sim-sensors');
const cutawayToggle = document.querySelector('#sim-cutaway');
const cameraButton = document.querySelector('#sim-camera');
const loading = document.querySelector('#scene-loading');
const signal = document.querySelector('#car-signal');
const frames = buildSimulation();
const phases = {
  gps: ['GPS connected', 'Satellite fixes anchor the position before the tunnel.', 'GPS fixes'],
  imu: ['GPS unavailable', 'Synthetic IMU readings carry the estimate. Uncertainty and drift grow.', 'IMU integration'],
  recovery: ['GPS reacquiring', 'Returning fixes gradually correct the estimate. The earlier drift stays in the trail.', 'GPS + correction'],
  restored: ['GPS restored', 'The estimate has converged toward GPS again. Small residual error can remain.', 'GPS fixes'],
};
let time = 0;
let playing = false;
let lastTick = 0;
let animation = 0;
let scene;
let sceneRequested = false;
let lastPhase = '';
let playbackSpeed = 1;
let viewZoom = 1;
if (window.matchMedia('(max-width: 700px)').matches) {
  cameraButton.setAttribute('aria-pressed', 'true');
  cameraButton.textContent = 'Overview';
}

function path(points) {
  let drawing = false;
  return points.map(point => {
    if (!point) { drawing = false; return ''; }
    const coordinates = mapPoint(point).map(value => value.toFixed(2)).join(' ');
    const command = drawing ? 'L' : 'M'; drawing = true;
    return `${command}${coordinates}`;
  }).join(' ');
}
function moveCircle(selector, position) {
  const [horizontal, vertical] = mapPoint(position);
  const element = document.querySelector(selector);
  element.setAttribute('cx', horizontal); element.setAttribute('cy', vertical);
  return element;
}

document.querySelector('#mini-road').setAttribute('d', path(frames.map(frame => frame.truth)));
document.querySelector('#mini-tunnel').setAttribute('d', path(frames.filter(frame => frame.time >= ENTRY && frame.time <= EXIT).map(frame => frame.truth)));

function render() {
  if (!playing) play.textContent = time >= DURATION ? 'Replay journey ↻' : 'Play journey ▶';
  const frame = frameAt(frames, time);
  const enabled = sensorToggle.checked;
  const phase = phases[frame.phase];
  const current = enabled ? frame.estimate : frame.lastFix;
  const until = Math.round(frame.time / STEP) + 1;
  stage.dataset.phase = frame.phase;
  stage.dataset.time = frame.time.toFixed(2);
  stage.dataset.sensors = String(enabled);
  timeline.value = time;
  timeline.setAttribute('aria-valuetext', `${time.toFixed(1)} seconds, ${phase[0]}`);
  document.querySelector('#sim-time-label').textContent = `${time.toFixed(1)} / ${DURATION} s`;
  document.querySelector('#sim-phase').textContent = phase[0];
  const stateKey = `${frame.phase}-${enabled}`;
  if (stateKey !== lastPhase) {
    document.querySelector('#sim-description').textContent = !enabled && !frame.gps ?
      'Sensor bridge is off. The map stays at the last GPS fix while the car continues.' :
      !enabled && frame.time >= EXIT ?
        'GPS fixes are available again. With the sensor bridge off, the map follows those fixes directly.' : phase[1];
    lastPhase = stateKey;
  }
  document.querySelector('#sim-source').textContent = !enabled ? frame.gps ? 'GPS fixes' : 'Last GPS fix' : phase[2];
  document.querySelector('#sim-gyro').textContent = (frame.gyro * 180 / Math.PI).toFixed(1);
  document.querySelector('#sim-acceleration').textContent = frame.acceleration.toFixed(2);
  document.querySelector('#sim-error').textContent = Math.hypot(current.x - frame.truth.x, current.z - frame.truth.z).toFixed(1);
  document.querySelector('#mini-gps').setAttribute('d', path(frames.slice(0, until).map(sample => sample.gps)));
  document.querySelector('#mini-imu').setAttribute('d', enabled ? path(frames.slice(Math.round(ENTRY / STEP), until).map(sample => sample.estimate)) : '');
  const marker = moveCircle('#mini-position', current);
  marker.setAttribute('fill', frame.gps ? '#195a40' : enabled ? '#2374bc' : '#a56820');
  moveCircle('#mini-last-fix', frame.lastFix).setAttribute('visibility', frame.gps ? 'hidden' : 'visible');
  moveCircle('#mini-uncertainty', current).setAttribute('r', enabled ? frame.radius * MAP_SCALE : 0);
  for (const button of document.querySelectorAll('[data-time]')) {
    const selected = frame.phase === 'gps' ? button.dataset.time === '3' :
      frame.phase === 'imu' ? button.dataset.time === '15' : button.dataset.time === '22.5';
    button.setAttribute('aria-pressed', String(selected));
  }
  signal.textContent = frame.gps ? 'GPS' : enabled ? 'IMU estimate' : 'GPS lost';
  scene?.update(frame, enabled);
}

function pause() {
  if (playing && time < DURATION) {
    time = Math.min(DURATION, time + (performance.now() - lastTick) / 1000 * playbackSpeed);
    render();
  }
  playing = false; cancelAnimationFrame(animation);
  play.textContent = time >= DURATION ? 'Replay journey ↻' : 'Play journey ▶';
  stage.dataset.playing = 'false';
}
function tick(timestamp) {
  if (!playing) return;
  const delta = (timestamp - lastTick) / 1000;
  if (delta >= 1 / 30) {
    time = Math.min(DURATION, time + delta * playbackSpeed);
    lastTick = timestamp; render();
  }
  if (time >= DURATION) { pause(); return; }
  animation = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (playing) { pause(); return; }
  if (time >= DURATION) time = 0;
  playing = true; lastTick = performance.now(); play.textContent = 'Pause journey Ⅱ';
  stage.dataset.playing = 'true'; animation = requestAnimationFrame(tick);
});
restart.addEventListener('click', () => { pause(); time = 0; render(); });
timeline.addEventListener('input', () => { pause(); time = Number(timeline.value); render(); });
for (const button of document.querySelectorAll('[data-time]')) {
  button.addEventListener('click', () => { pause(); time = Number(button.dataset.time); render(); });
}
sensorToggle.addEventListener('change', render);
for (const button of document.querySelectorAll('button[data-speed]')) {
  button.addEventListener('click', () => {
    if (playing) time = Math.min(DURATION, time + (performance.now() - lastTick) / 1000 * playbackSpeed);
    playbackSpeed = Number(button.dataset.speed);
    stage.dataset.speed = String(playbackSpeed);
    lastTick = performance.now();
    for (const option of document.querySelectorAll('button[data-speed]')) option.setAttribute('aria-pressed', String(option === button));
  });
}
for (const button of document.querySelectorAll('button[data-zoom]')) {
  button.addEventListener('click', () => {
    viewZoom = Number(button.dataset.zoom);
    stage.dataset.zoom = String(viewZoom);
    for (const option of document.querySelectorAll('button[data-zoom]')) option.setAttribute('aria-pressed', String(option === button));
    scene?.setZoom(viewZoom);
  });
}
cutawayToggle.addEventListener('change', () => scene?.setCutaway(cutawayToggle.checked));
cameraButton.addEventListener('click', () => {
  const follow = cameraButton.getAttribute('aria-pressed') !== 'true';
  cameraButton.setAttribute('aria-pressed', String(follow));
  cameraButton.textContent = follow ? 'Overview' : 'Follow car';
  scene?.setFollow(follow);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', pause);

async function loadScene() {
  if (sceneRequested) return;
  sceneRequested = true;
  try {
    const { createScene } = await import('./tunnel-scene.mjs');
    scene = await createScene(document.querySelector('#scene-canvas'), frames, (horizontal, vertical) => {
      signal.style.left = `${horizontal}px`; signal.style.top = `${vertical}px`;
    }, available => {
      stage.dataset.renderer = available ? 'webgl' : 'unavailable';
      document.querySelector('#scene-canvas').hidden = !available;
      cutawayToggle.disabled = !available; cameraButton.disabled = !available;
      for (const button of document.querySelectorAll('button[data-zoom]')) button.disabled = !available;
      document.querySelector('.arrival-caption').textContent = available
        ? 'Interactive 3D reconstruction. Photo-referenced; not a surveyed digital twin.'
        : '3D graphics paused. Reference photograph of Atal Tunnel’s south portal.';
      signal.hidden = !available; loading.hidden = available;
      loading.textContent = '3D graphics paused. The map and controls still work.';
    });
    stage.dataset.renderer = 'webgl'; loading.hidden = true; signal.hidden = false;
    scene.setCutaway(cutawayToggle.checked);
    scene.setFollow(cameraButton.getAttribute('aria-pressed') === 'true');
    scene.setZoom(viewZoom);
    scene.setArrival(document.documentElement.classList.contains('arrival-active'));
    document.querySelector('.arrival-caption').textContent = 'Interactive 3D reconstruction. Photo-referenced; not a surveyed digital twin.';
    render();
  } catch {
    stage.dataset.renderer = 'unavailable';
    cutawayToggle.disabled = true; cameraButton.disabled = true;
    for (const button of document.querySelectorAll('button[data-zoom]')) button.disabled = true;
    document.querySelector('.arrival-caption').textContent = '3D is unavailable. Showing the reference photograph of Atal Tunnel’s south portal.';
    loading.textContent = '3D is unavailable. The tracking map and controls still work.';
  }
}
const visibility = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) loadScene(); else pause();
  }
}, { threshold: 0.05 });
visibility.observe(stage);
const arrival = document.querySelector('#arrival');
if (arrival && !arrival.hidden) loadScene();
window.addEventListener('setu-arrival-start', loadScene);
window.addEventListener('setu-arrival-complete', () => {
  const world = document.querySelector('#arrival-world');
  if (scene && stage.dataset.renderer === 'webgl') {
    try {
      const snapshot = new Image(); snapshot.src = scene.snapshot();
      snapshot.alt = 'Rendered view of the photo-referenced Atal Tunnel reconstruction.';
      world.append(snapshot);
    } catch { document.querySelector('.arrival-caption').textContent = 'Reference photograph of Atal Tunnel’s south portal.'; }
  }
  stage.prepend(document.querySelector('#scene-canvas'));
  scene?.setArrival(false);
  render();
});
play.disabled = false; restart.disabled = false; timeline.disabled = false;
render();
