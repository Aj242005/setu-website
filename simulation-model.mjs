export const DURATION = 30;
export const ENTRY = 9;
export const EXIT = 21;
export const STEP = 0.05;
export const MAP_SCALE = 200 / 124;

export function mapPoint(position) {
  return [20 + (position.x + 62) * MAP_SCALE, 66 + position.z * MAP_SCALE];
}

export function roadAt(progress) {
  const phase = progress * Math.PI * 2 - 0.7;
  const slope = 18 * Math.PI * Math.cos(phase) / 124;
  return { x: -62 + 124 * progress, z: 9 * Math.sin(phase), heading: Math.atan(slope) };
}

function angleDifference(first, second) {
  return Math.atan2(Math.sin(first - second), Math.cos(first - second));
}

function truthAt(time) {
  const progress = time / DURATION;
  const position = roadAt(progress);
  const speed = 124 / DURATION / Math.cos(position.heading);
  return { ...position, speed };
}

export function phaseAt(time) {
  if (time < ENTRY) return 'gps';
  if (time < EXIT) return 'imu';
  if (time < EXIT + 4.5) return 'recovery';
  return 'restored';
}

export function buildSimulation() {
  const frames = [];
  let previous = truthAt(0);
  let estimate = { ...previous };
  let lastFix = { x: previous.x, z: previous.z };
  for (let index = 0; index <= Math.round(DURATION / STEP); index++) {
    const time = index * STEP;
    const truth = truthAt(time);
    const phase = phaseAt(time);
    const gpsAvailable = phase !== 'imu';
    const acceleration = index ? (truth.speed - previous.speed) / STEP : 0;
    const gyro = index ? angleDifference(truth.heading, previous.heading) / STEP : 0;
    const sensorAcceleration = acceleration + 0.024 + 0.008 * Math.sin(time * 3.1);
    const sensorGyro = gyro + 0.007 + 0.002 * Math.sin(time * 1.3);
    if (index) {
      estimate.heading += sensorGyro * STEP;
      estimate.speed = Math.max(0, estimate.speed + sensorAcceleration * STEP);
      estimate.x += Math.cos(estimate.heading) * estimate.speed * STEP;
      estimate.z += Math.sin(estimate.heading) * estimate.speed * STEP;
    }
    if (gpsAvailable) {
      lastFix = { x: truth.x + 0.12 * Math.sin(time * 1.7), z: truth.z + 0.12 * Math.cos(time) };
      const gain = time < ENTRY ? 1 : 1 - Math.exp(-STEP / 1.1);
      estimate.x += (lastFix.x - estimate.x) * gain;
      estimate.z += (lastFix.z - estimate.z) * gain;
      estimate.speed += (truth.speed - estimate.speed) * gain;
      estimate.heading += angleDifference(truth.heading, estimate.heading) * gain;
    }
    const elapsed = Math.max(0, Math.min(time, EXIT) - ENTRY);
    const peakRadius = 0.8 + elapsed * 0.16 + elapsed ** 2 * 0.025;
    const radius = time < ENTRY ? 0.8 : time < EXIT ? peakRadius :
      0.8 + (peakRadius - 0.8) * Math.exp(-(time - EXIT) / 1.5);
    frames.push({ time, phase, truth, estimate: { ...estimate }, gps: gpsAvailable ? { ...lastFix } : null,
      lastFix: { ...lastFix }, radius, acceleration: sensorAcceleration, gyro: sensorGyro,
      error: Math.hypot(estimate.x - truth.x, estimate.z - truth.z) });
    previous = truth;
  }
  return frames;
}

export function frameAt(frames, time) {
  return frames[Math.min(frames.length - 1, Math.max(0, Math.round(time / STEP)))];
}
