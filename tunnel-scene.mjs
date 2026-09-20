import * as THREE from './vendor/three.module.js';
import { DURATION, ENTRY, EXIT, STEP, roadAt } from './simulation-model.mjs';

export function createScene(container, frames, signalPosition, availability) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e1ebd7');
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 600);
  const ambient = new THREE.HemisphereLight('#f4fff0', '#71806b', 2.2);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#fff8de', 3);
  sun.position.set(-40, 75, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 65, bottom: -65, far: 200 });
  sun.shadow.normalBias = 0.08;
  scene.add(sun);
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
  const groundMaterial = material('#b7cd97');
  const roadMaterial = material('#717d78');
  const shoulderMaterial = material('#d9ded1');
  const concrete = material('#8b9993', { side: THREE.DoubleSide });
  const portalMaterial = material('#d5dccd', { side: THREE.DoubleSide });
  const trunkMaterial = material('#81765a');
  const foliageMaterial = material('#477856', { flatShading: true });
  const foliageLight = material('#739a61', { flatShading: true });
  const roadPoints = Array.from({ length: 201 }, (_, index) => roadAt(index / 200));

  function ribbon(points, width, elevation, surface) {
    const positions = [];
    const indices = [];
    points.forEach((point, index) => {
      const normalX = -Math.sin(point.heading);
      const normalZ = Math.cos(point.heading);
      for (const side of [-1, 1]) positions.push(point.x + side * width / 2 * normalX,
        elevation, point.z + side * width / 2 * normalZ);
      if (index < points.length - 1) {
        const offset = index * 2;
        indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  const terrain = new THREE.Mesh(new THREE.CylinderGeometry(92, 94, 3, 64), groundMaterial);
  terrain.position.y = -1.6;
  terrain.scale.z = 0.64;
  terrain.receiveShadow = true;
  scene.add(terrain);
  for (const [positionX, positionZ, scaleX, scaleY, scaleZ] of [
    [0, -24, 35, 16, 20], [-40, -27, 23, 8, 17], [46, -29, 26, 11, 17], [47, 30, 18, 4, 12],
  ]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), foliageLight);
    hill.position.set(positionX, -1.8, positionZ);
    hill.scale.set(scaleX, scaleY, scaleZ);
    hill.receiveShadow = true;
    scene.add(hill);
  }
  ribbon(roadPoints, 10, 0.02, shoulderMaterial);
  ribbon(roadPoints, 8, 0.08, roadMaterial);
  const dashGeometry = new THREE.BoxGeometry(1.8, 0.025, 0.12);
  const dashMaterial = material('#f2eed1');
  for (let index = 0; index < 36; index++) {
    const point = roadAt((index + 0.5) / 36);
    const dash = new THREE.Mesh(dashGeometry, dashMaterial);
    dash.position.set(point.x, 0.12, point.z);
    dash.rotation.y = -point.heading;
    scene.add(dash);
  }

  function arch(start, end, cutaway, surface) {
    const positions = [];
    const indices = [];
    const sections = 40;
    const ribs = 20;
    for (let section = 0; section <= sections; section++) {
      const point = roadAt(start + (end - start) * section / sections);
      for (let rib = 0; rib <= ribs; rib++) {
        const angle = (cutaway ? Math.PI / 2 : 0) + rib / ribs * (cutaway ? Math.PI / 2 : Math.PI);
        const across = Math.cos(angle) * 5.4;
        positions.push(point.x - Math.sin(point.heading) * across,
          1.8 + Math.sin(angle) * 5.4, point.z + Math.cos(point.heading) * across);
        if (section < sections && rib < ribs) {
          const offset = section * (ribs + 1) + rib;
          indices.push(offset, offset + ribs + 1, offset + 1,
            offset + 1, offset + ribs + 1, offset + ribs + 2);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
  }

  const tunnelStart = ENTRY / DURATION;
  const tunnelEnd = EXIT / DURATION;
  const roof = arch(tunnelStart, tunnelEnd, false, concrete);
  const cutRoof = arch(tunnelStart, tunnelEnd, true, concrete);
  cutRoof.visible = false;
  arch(tunnelStart - 0.012, tunnelStart + 0.008, false, portalMaterial);
  arch(tunnelEnd - 0.008, tunnelEnd + 0.012, false, portalMaterial);
  const nearWall = new THREE.Group();
  scene.add(nearWall);
  for (let index = 0; index < 32; index++) {
    const point = roadAt(tunnelStart + (tunnelEnd - tunnelStart) * (index + 0.5) / 32);
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 0.45), concrete);
      wall.position.set(point.x - Math.sin(point.heading) * 5.4 * side,
        0.95, point.z + Math.cos(point.heading) * 5.4 * side);
      wall.rotation.y = -point.heading;
      wall.receiveShadow = true;
      if (side > 0) nearWall.add(wall); else scene.add(wall);
    }
    if (index % 4 === 0) {
      const light = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.3),
        new THREE.MeshBasicMaterial({ color: '#fff3c1' }));
      light.position.set(point.x + Math.sin(point.heading) * 4.6, 3.6,
        point.z - Math.cos(point.heading) * 4.6);
      scene.add(light);
    }
  }
  let cutaway = true;

  const treeCount = 46;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.4, 2.5, 6), trunkMaterial, treeCount);
  const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(2.2, 6, 7), foliageMaterial, treeCount);
  const tips = new THREE.InstancedMesh(new THREE.ConeGeometry(1.65, 4.4, 7), foliageLight, treeCount);
  const transform = new THREE.Object3D();
  for (let index = 0; index < treeCount; index++) {
    const positionX = -76 + (index * 29.7 % 150);
    const positionZ = index % 3 ? 16 + (index * 7.3 % 24) : -42 + (index * 2.1 % 7);
    const scale = 0.65 + (index * 0.37 % 0.7);
    transform.scale.setScalar(scale);
    transform.position.set(positionX, 1.15 * scale, positionZ);
    transform.updateMatrix(); trunks.setMatrixAt(index, transform.matrix);
    transform.position.y = 4.2 * scale;
    transform.updateMatrix(); crowns.setMatrixAt(index, transform.matrix);
    transform.position.y = 6 * scale;
    transform.updateMatrix(); tips.setMatrixAt(index, transform.matrix);
  }
  for (const trees of [trunks, crowns, tips]) { trees.castShadow = true; scene.add(trees); }

  const car = new THREE.Group();
  scene.add(car);
  const paint = material('#f5f5e9', { roughness: 0.35, metalness: 0.12 });
  const glass = material('#345955', { roughness: 0.25, metalness: 0.25 });
  function carBox(width, height, depth, positionX, positionY, positionZ, surface) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), surface);
    mesh.position.set(positionX, positionY, positionZ);
    mesh.castShadow = true;
    car.add(mesh);
  }
  carBox(4.8, 0.95, 2.2, 0, 0.7, 0, paint);
  carBox(2.4, 0.85, 1.85, -0.35, 1.5, 0, glass);
  carBox(2.1, 0.08, 1.9, -0.4, 1.97, 0, paint);
  const rubber = material('#28342d');
  const wheels = [];
  for (const positionX of [-1.5, 1.5]) {
    for (const positionZ of [-1.12, 1.12]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.35, 16), rubber);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(positionX, 0.35, positionZ);
      wheel.castShadow = true;
      car.add(wheel); wheels.push(wheel);
    }
  }
  const lamps = new THREE.MeshBasicMaterial({ color: '#fff7d0' });
  const rearLamps = new THREE.MeshBasicMaterial({ color: '#b35132' });
  for (const positionZ of [-0.75, 0.75]) {
    carBox(0.06, 0.22, 0.42, 2.43, 0.72, positionZ, lamps);
    carBox(0.06, 0.2, 0.42, -2.43, 0.72, positionZ, rearLamps);
  }
  const beacon = new THREE.Group();
  car.add(beacon);
  for (let index = 0; index < 3; index++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65 + index * 0.48, 0.065, 6, 32),
      new THREE.MeshBasicMaterial({ color: '#195a40', transparent: true, opacity: 0.85 - index * 0.15 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4.7 + index * 0.7;
    beacon.add(ring);
  }
  const uncertainty = new THREE.Mesh(new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: '#2374bc', transparent: true, opacity: 0.18, depthWrite: false }));
  uncertainty.rotation.x = -Math.PI / 2;
  scene.add(uncertainty);
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 8),
    new THREE.MeshBasicMaterial({ color: '#2374bc' }));
  scene.add(marker);
  const trail = ribbon(frames.map(frame => frame.estimate), 0.18, 0.21,
    new THREE.MeshBasicMaterial({ color: '#2374bc', side: THREE.DoubleSide }));
  const anchor = new THREE.Vector3();
  let current = frames[0];
  let sensorBridge = true;
  let follow = false;
  let lost = false;

  function render() {
    if (lost) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (follow) {
      camera.position.set(current.truth.x - 16, 19, current.truth.z + 25);
      camera.lookAt(current.truth.x + 8, 1.5, current.truth.z);
    } else {
      const distance = Math.max(1, 1.3 / camera.aspect);
      camera.position.set(-60 * distance, 60 * distance, 90 * distance);
      camera.lookAt(-3, 0, 0);
    }
    renderer.render(scene, camera);
    anchor.set(current.truth.x, width < 600 ? 4 : 9, current.truth.z).project(camera);
    signalPosition((anchor.x * 0.5 + 0.5) * width, (-anchor.y * 0.5 + 0.5) * height);
  }

  const observer = new ResizeObserver(() => {
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    render();
  });
  observer.observe(container);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; availability(false);
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    lost = false; availability(true); render();
  });
  return {
    update(frame, enabled) {
      current = frame; sensorBridge = enabled;
      const reveal = cutaway && frame.phase === 'imu';
      roof.visible = !reveal; cutRoof.visible = reveal; nearWall.visible = !reveal;
      car.position.set(frame.truth.x, 0.45, frame.truth.z);
      car.rotation.y = -frame.truth.heading;
      for (const wheel of wheels) wheel.rotation.y = -frame.time * 7;
      beacon.visible = frame.gps !== null;
      const position = sensorBridge ? frame.estimate : frame.lastFix;
      marker.position.set(position.x, 0.6, position.z);
      marker.material.color.set(frame.gps ? '#195a40' : sensorBridge ? '#2374bc' : '#a56820');
      uncertainty.position.set(position.x, 0.17, position.z);
      uncertainty.scale.setScalar(frame.radius);
      uncertainty.visible = sensorBridge && frame.time >= ENTRY;
      trail.visible = sensorBridge;
      const start = Math.round(ENTRY / STEP);
      trail.geometry.setDrawRange(start * 6, Math.max(0, Math.round(frame.time / STEP) - start) * 6);
      render();
    },
    setCutaway(enabled) {
      cutaway = enabled;
      const reveal = cutaway && current.phase === 'imu';
      roof.visible = !reveal; cutRoof.visible = reveal; nearWall.visible = !reveal; render();
    },
    setFollow(enabled) { follow = enabled; render(); },
  };
}
