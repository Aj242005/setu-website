import * as THREE from './vendor/three.module.js';
import { DURATION, ENTRY, EXIT, STEP, roadAt } from './simulation-model.mjs';
import { landscapeMaterials, createLandscape, createPortal } from './landscape.mjs';

export async function createScene(container, frames, signalPosition, availability) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const materials = await landscapeMaterials();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b4ceda');
  scene.fog = new THREE.Fog('#bbced0', 180, 1000);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1600);
  const ambient = new THREE.HemisphereLight('#e8f3ff', '#91a483', 2.5);
  scene.add(ambient);
  const sunlight = new THREE.DirectionalLight('#fffaf0', 2.5);
  sunlight.position.set(-60, 110, -45); sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(innerWidth > 700 ? 2048 : 1024, innerWidth > 700 ? 2048 : 1024);
  Object.assign(sunlight.shadow.camera, { left: -95, right: 95, top: 90, bottom: -90, far: 240 });
  sunlight.shadow.bias = -0.00015; sunlight.shadow.normalBias = 0.12;
  scene.add(sunlight);
  const landscape = createLandscape(scene, materials);
  const roadPoints = Array.from({ length: 241 }, (_, index) => roadAt(index / 240));

  function ribbon(points, width, elevation, surface) {
    const positions = [], coordinates = [], indices = [];
    points.forEach((point, index) => {
      const normalX = -Math.sin(point.heading), normalZ = Math.cos(point.heading);
      for (const side of [-1, 1]) {
        positions.push(point.x + side * width / 2 * normalX, elevation, point.z + side * width / 2 * normalZ);
        coordinates.push((side + 1) / 2 * width / 4, index / (points.length - 1) * 32);
      }
      if (index < points.length - 1) {
        const offset = index * 2;
        indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, surface); mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  ribbon(roadPoints, 12, 0.01, materials.concrete);
  ribbon(roadPoints, 9, 0.04, materials.road);
  const paint = new THREE.MeshStandardMaterial({ color: '#e9e5d4', roughness: 0.9 });
  for (const side of [-1, 1]) {
    ribbon(roadPoints.map(point => ({ ...point, x: point.x - Math.sin(point.heading) * side * 4.3,
      z: point.z + Math.cos(point.heading) * side * 4.3 })), 0.11, 0.065, paint);
  }
  for (let index = 0; index < 42; index++) {
    const point = roadAt((index + 0.5) / 42);
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.015, 0.13), paint);
    dash.position.set(point.x, 0.065, point.z); dash.rotation.y = -point.heading; scene.add(dash);
  }

  const tunnelStart = ENTRY / DURATION, tunnelEnd = EXIT / DURATION;
  function tunnelRoof(cutaway) {
    const positions = [], coordinates = [], indices = [];
    const sections = 64, ribs = 28;
    for (let section = 0; section <= sections; section++) {
      const innerStart = tunnelStart + 0.8 / DURATION, innerEnd = tunnelEnd - 0.8 / DURATION;
      const point = roadAt(innerStart + (innerEnd - innerStart) * section / sections);
      for (let rib = 0; rib <= ribs; rib++) {
        const angle = (cutaway ? Math.PI / 2 : 0) + rib / ribs * (cutaway ? Math.PI / 2 : Math.PI);
        const across = Math.cos(angle) * 5.6;
        positions.push(point.x - Math.sin(point.heading) * across, 2.6 + Math.sin(angle) * 4.3,
          point.z + Math.cos(point.heading) * across);
        coordinates.push(section / sections * 18, rib / ribs * 5);
        if (section < sections && rib < ribs) {
          const offset = section * (ribs + 1) + rib;
          indices.push(offset, offset + ribs + 1, offset + 1, offset + 1, offset + ribs + 1, offset + ribs + 2);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const concrete = materials.concrete.clone(); concrete.side = THREE.DoubleSide; concrete.color.set('#71756d');
    const roof = new THREE.Mesh(geometry, concrete); roof.castShadow = true; scene.add(roof); return roof;
  }
  const fullRoof = tunnelRoof(false), cutRoof = tunnelRoof(true);
  const nearWalls = new THREE.Group(); scene.add(nearWalls);
  const fixtures = new THREE.Group(); scene.add(fixtures);
  const lamps = new THREE.MeshBasicMaterial({ color: '#fff6cc' });
  for (let index = 0; index < 36; index++) {
    const point = roadAt(tunnelStart + (tunnelEnd - tunnelStart) * (index + 0.5) / 36);
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.6), materials.concrete);
      wall.position.set(point.x - Math.sin(point.heading) * 5.45 * side, 1.4, point.z + Math.cos(point.heading) * 5.45 * side);
      wall.rotation.y = -point.heading; wall.receiveShadow = true;
      if (side > 0) nearWalls.add(wall); else scene.add(wall);
      if (index % 3 === 0) {
        const light = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.18), lamps);
        light.position.set(point.x - Math.sin(point.heading) * 4.5 * side, 5.1, point.z + Math.cos(point.heading) * 4.5 * side);
        light.rotation.y = -point.heading; fixtures.add(light);
      }
    }
    if (index % 10 === 0) {
      const light = new THREE.PointLight('#fff0c8', 18, 15, 1.7); light.position.set(point.x, 5.8, point.z); scene.add(light);
    }
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.65, 8), new THREE.MeshStandardMaterial({ color: '#ba5f31', roughness: 0.8 }));
    const side = index % 2 ? 1 : -1;
    bollard.position.set(point.x - Math.sin(point.heading) * side * 4, 0.35, point.z + Math.cos(point.heading) * side * 4); scene.add(bollard);
  }
  const entryPortal = createPortal(scene, materials, tunnelStart, true);
  const exitPortal = createPortal(scene, materials, tunnelEnd, false);
  exitPortal.rotation.y += Math.PI;

  for (const side of [-1, 1]) {
    for (let index = 0; index < 36; index++) {
      const progress = (index + 0.5) / 36;
      if (progress > tunnelStart - 0.03 && progress < tunnelEnd + 0.03) continue;
      const point = roadAt(progress);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), materials.metal);
      pole.position.set(point.x - Math.sin(point.heading) * side * 5.8, 0.44, point.z + Math.cos(point.heading) * side * 5.8);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.25, 0.08), materials.metal);
      rail.position.copy(pole.position); rail.position.y = 0.8; rail.rotation.y = -point.heading;
      scene.add(pole, rail);
    }
  }

  const { car, wheels } = createCar(scene);
  const beacon = new THREE.Group(); car.add(beacon);
  for (let index = 0; index < 3; index++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45 + index * 0.28, 0.035, 6, 32),
      new THREE.MeshBasicMaterial({ color: '#23734d', transparent: true, opacity: 0.8 - index * 0.2 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 3.2 + index * 0.5; beacon.add(ring);
  }
  const uncertainty = new THREE.Mesh(new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: '#297ed1', transparent: true, opacity: 0.2, depthWrite: false }));
  uncertainty.rotation.x = -Math.PI / 2; scene.add(uncertainty);
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: '#2374bc' })); scene.add(marker);
  const trail = ribbon(frames.map(frame => frame.estimate), 0.2, 0.13, new THREE.MeshBasicMaterial({ color: '#2b91e1', side: THREE.DoubleSide }));
  const birds = [];
  for (let index = 0; index < 7; index++) {
    const bird = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: '#36413a', side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.22), material);
      wing.position.x = side * 0.35; wing.rotation.x = -Math.PI / 2; bird.add(wing);
    }
    birds.push(bird); scene.add(bird);
  }

  let current = frames[0], cutaway = true, follow = false, zoom = 1, lost = false;
  const anchor = new THREE.Vector3();
  function render() {
    if (lost || !container.clientWidth || !container.clientHeight) return;
    const width = container.clientWidth, height = container.clientHeight;
    camera.aspect = width / height; camera.zoom = zoom; camera.updateProjectionMatrix();
    if (follow) {
      const distance = Math.max(1, 1.2 / camera.aspect);
      camera.position.set(current.truth.x - 19 * distance, 1.2 + 8 * distance, current.truth.z + 9.5 * distance);
      camera.lookAt(current.truth.x + (zoom > 1 ? 0 : 4), 1.2, current.truth.z);
    } else {
      const distance = Math.max(1, 1.1 / camera.aspect);
      const focusX = zoom > 1 ? current.truth.x : -8, focusZ = zoom > 1 ? current.truth.z : 0;
      camera.position.set(focusX - 60 * distance, 64 * distance, focusZ + 90 * distance);
      camera.lookAt(focusX, 1.5, focusZ);
    }
    renderer.render(scene, camera);
    anchor.set(current.truth.x, 1.95 + 1.5 / zoom, current.truth.z).project(camera);
    signalPosition((anchor.x * 0.5 + 0.5) * width, (-anchor.y * 0.5 + 0.5) * height);
  }
  function reveal() {
    const enabled = cutaway && current.time >= ENTRY;
    fullRoof.visible = !enabled; cutRoof.visible = enabled; nearWalls.visible = !enabled;
    fixtures.visible = !enabled;
    entryPortal.visible = !enabled; exitPortal.visible = !enabled;
    landscape.setCutaway(enabled);
  }
  container.append(renderer.domElement);
  const observer = new ResizeObserver(() => { renderer.setSize(container.clientWidth, container.clientHeight, false); render(); });
  observer.observe(container);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; availability(false); });
  renderer.domElement.addEventListener('webglcontextrestored', () => { lost = false; availability(true); render(); });
  return {
    update(frame, enabled) {
      current = frame; reveal();
      car.position.set(frame.truth.x, 0.1, frame.truth.z); car.rotation.y = -frame.truth.heading;
      for (const wheel of wheels) wheel.rotation.z = -frame.time * 7;
      beacon.visible = frame.gps !== null;
      const position = enabled ? frame.estimate : frame.lastFix;
      marker.position.set(position.x, 0.4, position.z);
      marker.material.color.set(frame.gps ? '#195a40' : enabled ? '#2374bc' : '#a56820');
      uncertainty.position.set(position.x, 0.09, position.z); uncertainty.scale.setScalar(frame.radius);
      uncertainty.visible = enabled && frame.time >= ENTRY; trail.visible = enabled;
      const start = Math.round(ENTRY / STEP);
      trail.geometry.setDrawRange(start * 6, Math.max(0, Math.round(frame.time / STEP) - start) * 6);
      birds.forEach((bird, index) => {
        const phase = frame.time * 0.25 + index;
        bird.position.set(10 + Math.sin(phase) * 45, 42 + Math.sin(phase * 0.7) * 8 + index, -22 + Math.cos(phase) * 25);
        bird.rotation.y = phase;
        bird.children.forEach((wing, side) => { wing.rotation.z = Math.sin(frame.time * 5 + index) * 0.3 * (side ? 1 : -1); });
      });
      render();
    },
    setCutaway(value) { if (cutaway === value) return; cutaway = value; reveal(); render(); },
    setFollow(value) { if (follow === value) return; follow = value; render(); },
    setZoom(value) { const next = Math.min(4, Math.max(1, value)); if (zoom === next) return; zoom = next; render(); },
  };
}

function createCar(scene) {
  const car = new THREE.Group(); scene.add(car);
  const paint = new THREE.MeshPhysicalMaterial({ color: '#dce2df', metalness: 0.5, roughness: 0.28, clearcoat: 0.8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#233437', metalness: 0.35, roughness: 0.12, clearcoat: 1 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#171c1a', roughness: 0.88 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#b9c3c1', metalness: 0.85, roughness: 0.23 });
  function profile(points, depth, surface) {
    const shape = new THREE.Shape(); shape.moveTo(...points[0]); for (const point of points.slice(1)) shape.lineTo(...point); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.09, bevelThickness: 0.08, curveSegments: 12 });
    geometry.translate(0, 0, -depth / 2);
    const mesh = new THREE.Mesh(geometry, surface); mesh.castShadow = true; car.add(mesh); return mesh;
  }
  profile([[-2.1,0.45],[-2.2,0.9],[-1.9,1.04],[1.75,1.03],[2.15,0.84],[2.2,0.45]], 1.72, paint);
  profile([[-1.35,1.02],[-0.96,1.64],[0.35,1.67],[1.05,1.02]], 1.42, glass);
  profile([[-1.08,1.59],[-0.96,1.7],[0.35,1.73],[0.48,1.62]], 1.49, paint);
  const wheels = [];
  for (const horizontal of [-1.4, 1.35]) {
    for (const side of [-1,1]) {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.28, 24), rubber); tire.rotation.x = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.295, 16), chrome); rim.rotation.x = Math.PI / 2;
      wheel.add(tire, rim); wheel.position.set(horizontal, 0.41, side * 0.88); wheels.push(wheel); car.add(wheel);
    }
  }
  for (const side of [-1,1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.65, 0.04), paint); pillar.position.set(-0.35,1.33,side*0.75); car.add(pillar);
    const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), paint); mirror.scale.set(1.2,0.6,0.9); mirror.position.set(0.55,1.12,side*1.01); car.add(mirror);
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.17,0.45), new THREE.MeshBasicMaterial({color:'#f9f4cd'})); headlight.position.set(2.17,0.78,side*0.56); car.add(headlight);
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.18,0.35), new THREE.MeshBasicMaterial({color:'#a53425'})); taillight.position.set(-2.19,0.82,side*0.59); car.add(taillight);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.23,0.85), rubber); grille.position.set(2.21,0.55,0); car.add(grille);
  return { car, wheels };
}
