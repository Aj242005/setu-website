export const PORTAL = Object.freeze({ latitude: 32.3632307, longitude: 77.1331123, osmNode: 4082425413 });

export function projectIndia(longitude, latitude) {
  const mercator = value => Math.log(Math.tan(Math.PI / 4 + value * Math.PI / 360));
  return [(longitude - 64) / 37 * 900, (mercator(39) - mercator(latitude)) / (mercator(39) - mercator(5)) * 900];
}

const arrival = document.querySelector('#arrival');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const skipArrival = Boolean(location.hash && location.hash !== '#top') || reducedMotion.matches;
if (arrival && !skipArrival) startArrival();

function startArrival() {
  history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const world = document.querySelector('#arrival-world');
  const canvasContainer = document.querySelector('#scene-canvas');
  const map = document.querySelector('#arrival-map');
  const mapLayer = document.querySelector('.arrival-map');
  const marker = document.querySelector('#arrival-marker');
  const copy = document.querySelector('.arrival-copy');
  const caption = document.querySelector('.arrival-caption');
  const status = document.querySelector('#arrival-status');
  const clouds = document.querySelector('#arrival-clouds');
  const context = clouds.getContext('2d');
  const [targetX, targetY] = projectIndia(PORTAL.longitude, PORTAL.latitude);
  const texture = cloudTexture();
  let elapsed = 0;
  let lastTick = 0;
  let frame = 0;
  let finished = false;
  let cover = 0;
  let progress = 0;
  let width = 0;
  let height = 0;
  arrival.hidden = false;
  document.documentElement.classList.add('arrival-active');
  world.append(canvasContainer);
  marker.setAttribute('transform', `translate(${targetX} ${targetY})`);
  window.dispatchEvent(new Event('setu-arrival-start'));

  function ease(value) { const bounded = Math.min(1, Math.max(0, value)); return bounded * bounded * (3 - 2 * bounded); }
  function paint() {
    const advance = ease((progress - 0.14) / 0.68);
    const scale = Math.exp(advance * Math.log(65));
    const viewSize = 900 / scale;
    const centerX = targetX + (450 - targetX) * (1 - advance) / scale;
    const centerY = targetY + (450 - targetY) * (1 - advance) / scale;
    map.setAttribute('viewBox', `${centerX - viewSize / 2} ${centerY - viewSize / 2} ${viewSize} ${viewSize}`);
    for (const circle of marker.querySelectorAll('circle')) circle.setAttribute('r', Number(circle.dataset.radius) / scale);
    const scroll = Math.min(1, Math.max(0, -arrival.getBoundingClientRect().top / (arrival.offsetHeight - innerHeight)));
    const reveal = ease((scroll - 0.06) / 0.78);
    cover = ease((progress - 0.38) / 0.5) * (1 - reveal);
    mapLayer.style.opacity = String(1 - ease((scroll - 0.005) / 0.1));
    copy.style.opacity = String(1 - ease((progress - 0.12) / 0.3));
    caption.style.opacity = String(reveal);
    if (reveal > 0.9) {
      status.textContent = 'The south portal. Continue to the interactive journey.';
      document.querySelector('#arrival-continue').textContent = 'Explore the journey ↓';
    }
    if (context) {
      context.clearRect(0, 0, width, height);
      context.globalAlpha = cover;
      context.fillStyle = '#edf2f1';
      context.fillRect(0, 0, width, height);
      context.globalAlpha = cover * 0.72;
      context.drawImage(texture, -width * (0.12 + progress * 0.06), -height * 0.15, width * 1.4, height * 1.4);
      context.globalAlpha = cover * 0.32;
      context.drawImage(texture, -width * 0.45 + width * progress * 0.3, height * 0.04, width * 1.8, height * 1.2);
      context.globalAlpha = 1;
    }
    arrival.dataset.flight = progress.toFixed(3);
    arrival.dataset.reveal = reveal.toFixed(3);
    if (scroll >= 0.98) complete();
  }
  function resize() {
    width = clouds.width = Math.round(innerWidth * Math.min(devicePixelRatio, 1.25));
    height = clouds.height = Math.round(innerHeight * Math.min(devicePixelRatio, 1.25));
    if (!finished) paint();
  }
  function tick(timestamp) {
    if (finished || document.hidden) return;
    if (lastTick) elapsed += timestamp - lastTick;
    lastTick = timestamp;
    progress = Math.min(1, elapsed / 4800);
    paint();
    if (progress < 1) frame = requestAnimationFrame(tick);
    else status.textContent = 'Scroll to clear the mist and enter the valley.';
  }
  function complete() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    window.dispatchEvent(new Event('setu-arrival-complete'));
    document.documentElement.classList.remove('arrival-active');
    mapLayer.hidden = true; clouds.hidden = true; copy.hidden = true;
    caption.style.opacity = '1';
    status.textContent = 'Continue to the interactive journey.';
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('resize', resize);
  }
  function scroll() {
    if (finished) return;
    if (scrollY > 20 && progress < 1) { progress = 1; cancelAnimationFrame(frame); }
    status.textContent = 'Scroll to clear the mist and enter the valley.';
    paint();
  }
  document.querySelector('#arrival-skip').addEventListener('click', () => {
    complete(); arrival.hidden = true;
    document.querySelector('#simulation').scrollIntoView({ behavior: 'instant' });
    document.querySelector('#sim-play').focus({ preventScroll: true });
  });
  document.querySelector('#arrival-continue').addEventListener('click', () => {
    if (finished || Number(arrival.dataset.reveal) > 0.9) {
      complete(); document.querySelector('#simulation').scrollIntoView({ behavior: 'smooth' });
    }
    else { progress = 1; cancelAnimationFrame(frame); window.scrollTo({ top: arrival.offsetTop + innerHeight * 0.85, behavior: 'smooth' }); }
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); lastTick = 0;
    if (!document.hidden && !finished && progress < 1) frame = requestAnimationFrame(tick);
  });
  reducedMotion.addEventListener('change', event => { if (event.matches) { complete(); arrival.hidden = true; } });
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', resize);
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
