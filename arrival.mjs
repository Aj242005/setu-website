import { PORTAL } from './simulation-model.mjs';
export { PORTAL };

export function projectIndia(longitude, latitude) {
  const mercator = value => Math.log(Math.tan(Math.PI / 4 + value * Math.PI / 360));
  return [(longitude - 64) / 37 * 900, (mercator(39) - mercator(latitude)) / (mercator(39) - mercator(5)) * 900];
}

const arrival = document.querySelector('#arrival');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const skipArrival = () => Boolean(location.hash && location.hash !== '#top') || reducedMotion.matches;
if (arrival && !skipArrival()) startArrival();

async function startArrival() {
  history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const mapImage = new Image();
  mapImage.src = 'assets/india-region.svg';
  let timeout;
  try {
    await Promise.race([mapImage.decode(), new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Map unavailable')), 3000);
    })]);
  } catch { return; }
  finally { clearTimeout(timeout); }
  if (skipArrival() || scrollY > 20) return;
  const map = document.querySelector('#arrival-map');
  const mapLayer = document.querySelector('.arrival-map');
  const marker = document.querySelector('#arrival-marker');
  const copy = document.querySelector('.arrival-copy');
  const location = document.querySelector('.arrival-location');
  const status = document.querySelector('#arrival-status');
  const clouds = document.querySelector('#arrival-clouds');
  const context = clouds.getContext('2d');
  const [targetX, targetY] = projectIndia(PORTAL.longitude, PORTAL.latitude);
  const texture = context ? cloudTexture() : null;
  const listeners = new AbortController();
  let elapsed = 0;
  let lastTick = 0;
  let frame = 0;
  let finished = false;
  let width = 0;
  let height = 0;
  arrival.hidden = false;
  document.documentElement.classList.add('arrival-active');
  marker.setAttribute('transform', `translate(${targetX} ${targetY})`);
  window.dispatchEvent(new Event('setu-arrival-start'));

  function ease(value) { const bounded = Math.min(1, Math.max(0, value)); return bounded * bounded * (3 - 2 * bounded); }
  function demoTop() { return Math.max(0, document.querySelector('#simulation-stage').getBoundingClientRect().top + scrollY - 24); }
  function paint() {
    const flight = Math.min(1, Math.max(0, (elapsed - 1500) / 2400));
    const advance = ease(flight);
    const scale = Math.exp(advance * Math.log(65));
    const viewSize = 900 / scale;
    const centerX = targetX + (450 - targetX) * (1 - advance) / scale;
    const centerY = targetY + (450 - targetY) * (1 - advance) / scale;
    map.setAttribute('viewBox', `${centerX - viewSize / 2} ${centerY - viewSize / 2} ${viewSize} ${viewSize}`);
    for (const circle of marker.querySelectorAll('circle')) circle.setAttribute('r', Number(circle.dataset.radius) / scale);
    const cover = ease((flight - 0.42) / 0.5);
    const reveal = ease((elapsed - 4250) / 850);
    copy.style.opacity = String(1 - ease(flight / 0.4));
    location.style.opacity = String(1 - ease((flight - 0.6) / 0.4));
    mapLayer.style.opacity = elapsed >= 3900 ? '0' : '1';
    arrival.style.opacity = String(1 - reveal);
    if (elapsed >= 3900) window.scrollTo({ top: demoTop() * ease((elapsed - 3900) / 350), behavior: 'instant' });
    if (context) {
      context.clearRect(0, 0, width, height);
      context.globalAlpha = cover;
      context.fillStyle = '#f7f9f8';
      context.fillRect(0, 0, width, height);
      context.globalAlpha = cover * 0.35;
      context.drawImage(texture, -width * (0.12 + flight * 0.06), -height * 0.15, width * 1.4, height * 1.4);
      context.globalAlpha = cover * 0.18;
      context.drawImage(texture, -width * 0.45 + width * flight * 0.3, height * 0.04, width * 1.8, height * 1.2);
      context.globalAlpha = 1;
    } else clouds.style.background = `rgba(247,249,248,${cover})`;
    const phase = elapsed < 1500 ? 'map' : elapsed < 3900 ? 'flight' : elapsed < 4250 ? 'transfer' : 'reveal';
    if (arrival.dataset.phase !== phase) {
      status.textContent = phase === 'map' ? 'India → Atal Tunnel → interactive demo. Sit back; no scrolling needed.' :
        phase === 'flight' ? 'Flying to the south portal. The demo follows automatically.' : 'Opening the interactive sensor demo.';
    }
    arrival.dataset.phase = phase;
    arrival.dataset.elapsed = elapsed.toFixed(0);
    arrival.dataset.flight = flight.toFixed(3);
    arrival.dataset.cover = cover.toFixed(3);
    arrival.dataset.reveal = reveal.toFixed(3);
  }
  function resize() {
    width = clouds.width = Math.round(innerWidth * Math.min(devicePixelRatio, 1.25));
    height = clouds.height = Math.round(innerHeight * Math.min(devicePixelRatio, 1.25));
    if (!finished) paint();
  }
  function tick(timestamp) {
    if (finished || document.hidden) return;
    if (lastTick) elapsed += Math.min(timestamp - lastTick, 100);
    lastTick = timestamp;
    paint();
    if (elapsed < 5100) frame = requestAnimationFrame(tick);
    else complete(true, true);
  }
  function complete(scrollToDemo = false, autoplay = false) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    listeners.abort();
    const focusInside = arrival.contains(document.activeElement);
    arrival.hidden = true;
    arrival.dataset.phase = 'complete';
    document.documentElement.classList.remove('arrival-active');
    if (scrollToDemo) window.scrollTo({ top: demoTop(), behavior: 'instant' });
    if (focusInside) document.querySelector('#sim-play').focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('setu-arrival-complete', { detail: { autoplay } }));
  }
  document.querySelector('#arrival-skip').addEventListener('click', () => {
    complete(true); document.querySelector('#sim-play').focus({ preventScroll: true });
  }, { signal: listeners.signal });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') { complete(true); document.querySelector('#sim-play').focus({ preventScroll: true }); }
    else if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) complete();
  }, { signal: listeners.signal });
  window.addEventListener('wheel', () => complete(), { passive: true, signal: listeners.signal });
  window.addEventListener('touchmove', () => complete(), { passive: true, signal: listeners.signal });
  window.addEventListener('hashchange', () => complete(), { signal: listeners.signal });
  document.addEventListener('focusin', event => {
    if (!arrival.contains(event.target)) complete();
  }, { signal: listeners.signal });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); lastTick = 0;
    if (!document.hidden && !finished) frame = requestAnimationFrame(tick);
  }, { signal: listeners.signal });
  reducedMotion.addEventListener('change', event => { if (event.matches) complete(); }, { signal: listeners.signal });
  window.addEventListener('resize', resize, { signal: listeners.signal });
  resize(); frame = requestAnimationFrame(tick);
}

function cloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 320;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const pixels = context.createImageData(512, 320);
  const random = (horizontal, vertical) => {
    const value = Math.sin(horizontal * 127.1 + vertical * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (horizontal, vertical) => {
    const baseX = Math.floor(horizontal), baseY = Math.floor(vertical);
    const deltaX = horizontal - baseX, deltaY = vertical - baseY;
    const blendX = deltaX * deltaX * (3 - 2 * deltaX), blendY = deltaY * deltaY * (3 - 2 * deltaY);
    return (random(baseX, baseY) * (1 - blendX) + random(baseX + 1, baseY) * blendX) * (1 - blendY) +
      (random(baseX, baseY + 1) * (1 - blendX) + random(baseX + 1, baseY + 1) * blendX) * blendY;
  };
  for (let vertical = 0; vertical < 320; vertical++) {
    for (let horizontal = 0; horizontal < 512; horizontal++) {
      let density = 0, amplitude = 0.55, frequency = 0.012;
      for (let octave = 0; octave < 6; octave++) {
        density += noise(horizontal * frequency + octave * 12, vertical * frequency) * amplitude;
        amplitude *= 0.5; frequency *= 2;
      }
      const shade = 174 + 78 * Math.min(1, density * 1.2);
      const offset = (vertical * 512 + horizontal) * 4;
      pixels.data[offset] = shade; pixels.data[offset + 1] = shade + 5; pixels.data[offset + 2] = shade + 5;
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}
