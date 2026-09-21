import * as THREE from './vendor/three.module.js';
import { roadAt, ENTRY, EXIT, DURATION } from './simulation-model.mjs';

const seed = value => { const result = Math.sin(value * 127.1 + 311.7) * 43758.5453; return result - Math.floor(result); };

export async function landscapeMaterials() {
  const loader = new THREE.TextureLoader();
  const materials = {};
  async function loadTexture(path) {
    let timer;
    try {
      return await Promise.race([loader.loadAsync(path), new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Texture timeout')), 8000);
      })]);
    } catch { return null; } finally { clearTimeout(timer); }
  }
  await Promise.all([
    ['rock', 'rocky_terrain_02', '#d5d6d0'], ['earth', 'aerial_grass_rock', '#aac58f'],
    ['road', 'asphalt_02', '#a6aaa8'], ['concrete', 'concrete_wall_001', '#e3e5dc'],
  ].map(async ([name, asset, color]) => {
    const textures = await Promise.all(['color', 'normal', 'roughness'].map(async channel => {
      const texture = await loadTexture(`assets/landscape/${asset}-${channel}.webp`);
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 4;
        if (channel === 'color') texture.colorSpace = THREE.SRGBColorSpace;
      }
      return texture;
    }));
    materials[name] = new THREE.MeshStandardMaterial({ color, map: textures[0], normalMap: textures[1], roughnessMap: textures[2],
      roughness: 0.92, normalScale: new THREE.Vector2(0.5, 0.5) });
  }));
  materials.wood = new THREE.MeshStandardMaterial({ color: '#6a4633', roughness: 0.8 });
  materials.metal = new THREE.MeshStandardMaterial({ color: '#77827e', metalness: 0.7, roughness: 0.48 });
  const foliage = await loadTexture('assets/landscape/fir-tree.webp');
  if (foliage) foliage.colorSpace = THREE.SRGBColorSpace;
  materials.foliage = new THREE.MeshBasicMaterial({ map: foliage, side: THREE.DoubleSide, alphaTest: 0.35, color: '#d0ddc3' });
  materials.foliage.visible = Boolean(foliage);
  return materials;
}

function terrainHeight(horizontal, depth) {
  const road = roadAt(Math.max(0, Math.min(1, (horizontal + 62) / 124)));
  const shoulder = Math.max(0, Math.abs(depth - road.z) - 10);
  const ridge = Math.max(0, Math.sin(horizontal * 0.018 + 1.2) * 0.35 + 0.72);
  const rise = shoulder * (depth > road.z ? 0.13 : 0.6) * ridge;
  const detail = Math.sin(horizontal * 0.23 + depth * 0.17) * 1.5 + Math.sin(depth * 0.67) * 0.45;
  return Math.max(-0.18, rise + detail * Math.min(1, shoulder / 12) - 0.2);
}

export function createLandscape(scene, materials) {
  const terrain = new THREE.PlaneGeometry(650, 650, 160, 160);
  terrain.rotateX(-Math.PI / 2);
  const positions = terrain.attributes.position;
  for (let index = 0; index < positions.count; index++) positions.setY(index, terrainHeight(positions.getX(index), positions.getZ(index)));
  terrain.attributes.uv.array.forEach((value, index, values) => { values[index] = value * 55; });
  terrain.computeVertexNormals();
  const ground = new THREE.Mesh(terrain, materials.earth);
  ground.receiveShadow = true;
  scene.add(ground);

  for (let ridge = 0; ridge < 3; ++ridge) {
    const mountain = new THREE.PlaneGeometry(1050, 480, 150, 72);
    mountain.rotateX(-Math.PI / 2);
    const points = mountain.attributes.position;
    const colors = [];
    for (let index = 0; index < points.count; index++) {
      const horizontal = points.getX(index), depth = points.getZ(index);
      const envelope = Math.pow(Math.max(0, 1 - Math.abs(depth) / 240), 0.65);
      const peaks = 110 + 135 * (1 - Math.abs(Math.sin(horizontal * 0.011 + ridge))) ** 2 + 75 * (1 - Math.abs(Math.sin(horizontal * 0.027 + ridge * 2))) ** 3;
      const fracture = (1 - Math.abs(Math.sin(horizontal * 0.036 + depth * 0.024))) * 32 + Math.sin(horizontal * 0.071 - depth * 0.047) * 14;
      const height = envelope * (peaks + fracture);
      points.setY(index, height);
      const snow = Math.min(1, Math.max(0, (height - 200 + 32 * Math.sin(horizontal * 0.19 + depth * 0.11)) / 28));
      const color = new THREE.Color('#767f76').lerp(new THREE.Color('#edf1e9'), snow);
      colors.push(color.r, color.g, color.b);
    }
    mountain.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    mountain.attributes.uv.array.forEach((value, index, values) => { values[index] = value * 32; });
    mountain.computeVertexNormals();
    const surface = materials.rock.clone(); surface.vertexColors = true;
    surface.map = null; surface.color.set('#ffffff');
    const mesh = new THREE.Mesh(mountain, surface);
    mesh.position.set(200 + ridge * 100, -15, -420 - ridge * 200);
    if (ridge === 2) { mesh.rotation.y = Math.PI / 2; mesh.position.set(630, -12, -100); }
    scene.add(mesh);
  }

  const cover = new THREE.Group();
  const coverGeometry = new THREE.PlaneGeometry(1, 84, 64, 48);
  coverGeometry.rotateX(-Math.PI / 2);
  const coverPositions = coverGeometry.attributes.position;
  function mountainPoint(progress, depth) {
    const road = roadAt((ENTRY + 0.8 + (EXIT - ENTRY - 1.6) * progress) / DURATION);
    const horizontal = road.x - Math.sin(road.heading) * depth;
    const across = road.z + Math.cos(road.heading) * depth;
    const envelope = Math.pow(Math.max(0, 1 - Math.abs(depth) / 42), 0.7);
    const detail = (Math.sin(depth * 0.3 + progress * 8) * 1.4 + Math.sin(depth * 0.8 - progress * 20) * 0.7) * Math.sin(progress * Math.PI);
    const height = Math.max(terrainHeight(horizontal, across), (11.6 + 9 * Math.sin(progress * Math.PI) + detail) * envelope);
    return [horizontal, height, across];
  }
  for (let index = 0; index < coverPositions.count; index++) {
    const progress = coverPositions.getX(index) + 0.5, depth = coverPositions.getZ(index);
    coverPositions.setXYZ(index, ...mountainPoint(progress, depth));
  }
  coverGeometry.attributes.uv.array.forEach((value, index, values) => { values[index] = value * 7; });
  coverGeometry.computeVertexNormals();
  const coverMesh = new THREE.Mesh(coverGeometry, materials.earth);
  coverMesh.receiveShadow = true; coverMesh.castShadow = true;
  cover.add(coverMesh); scene.add(cover);
  for (const end of [0, 1]) {
    const points = [], coordinates = [], indices = [];
    for (let index = 0; index <= 84; index++) {
      const depth = index - 42;
      const [horizontal, height, across] = mountainPoint(end, depth);
      const bottom = Math.abs(depth) <= 6 ? 7 : terrainHeight(horizontal, across);
      points.push(horizontal, bottom, across, horizontal, height, across);
      coordinates.push(index / 6, 0, index / 6, height / 6);
      if (index < 84) { const offset = index * 2; indices.push(offset,offset+1,offset+2,offset+1,offset+3,offset+2); }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const material = materials.rock.clone(); material.side = THREE.DoubleSide;
    const face = new THREE.Mesh(geometry, material); face.receiveShadow = true; cover.add(face);
  }

  const boulders = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), materials.rock, 110);
  const transform = new THREE.Object3D();
  for (let index = 0; index < 110; index++) {
    const horizontal = (seed(index + 4) - 0.5) * 270;
    const depth = (index % 2 ? 1 : -1) * (16 + seed(index + 46) * 80);
    const size = 0.7 + seed(index + 61) * 3;
    transform.position.set(horizontal, terrainHeight(horizontal, depth) + size * 0.28, depth);
    transform.rotation.set(seed(index + 200), seed(index + 44) * 6, seed(index + 28));
    transform.scale.set(size * 1.5, size * 0.8, size);
    transform.updateMatrix(); boulders.setMatrixAt(index, transform.matrix);
  }
  boulders.castShadow = true; boulders.receiveShadow = true; scene.add(boulders);
  addForest(scene, materials, cover, mountainPoint);
  return { setCutaway: enabled => { cover.visible = !enabled; } };
}

function addForest(scene, materials, cover, mountainPoint) {
  const positions = [], coordinates = [], normals = [];
    for (let branch = 0; branch < 3; branch++) {
      const angle = branch / 3 * Math.PI;
      const horizontalX = Math.cos(angle) * 2.3, horizontalZ = Math.sin(angle) * 2.3;
      const corners = [[-horizontalX,0,-horizontalZ],[horizontalX,0,horizontalZ],
        [horizontalX,13,horizontalZ],[-horizontalX,13,-horizontalZ]];
      for (const vertex of [0,1,2,0,2,3]) {
        positions.push(...corners[vertex]);
        coordinates.push(...[[0,0],[1,0],[1,1],[0,1]][vertex]);
        normals.push(Math.cos(angle),0.4,Math.sin(angle));
      }
    }
  const branches = new THREE.BufferGeometry();
  branches.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  branches.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2));
  branches.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  const count = 220;
  const forest = new THREE.InstancedMesh(branches, materials.foliage, count);
  const transform = new THREE.Object3D();
  for (let index = 0; index < count; index++) {
    const horizontal = (seed(index + 10) - 0.5) * 300;
    const depth = -(22 + seed(index + 100) * 130);
    const size = 0.65 + seed(index + 700) * 0.85;
    transform.position.set(horizontal, terrainHeight(horizontal, depth), depth);
    transform.rotation.set(0, seed(index + 25) * 6, 0);
    transform.scale.setScalar(size); transform.updateMatrix(); forest.setMatrixAt(index, transform.matrix);
  }
  forest.castShadow = true; scene.add(forest);
  const hillTrees = new THREE.InstancedMesh(branches, materials.foliage, 64);
  for (let index = 0; index < 64; index++) {
    const progress = 0.1 + seed(index + 311) * 0.8;
    const depth = (index % 3 ? 1 : -1) * (12 + seed(index + 413) * 22);
    transform.position.set(...mountainPoint(progress, depth));
    transform.rotation.y = seed(index + 512) * Math.PI;
    transform.scale.setScalar(0.5 + seed(index + 223) * 0.7);
    transform.updateMatrix(); hillTrees.setMatrixAt(index, transform.matrix);
  }
  hillTrees.castShadow = true; cover.add(hillTrees);
}

export function createPortal(scene, materials, progress, south) {
  const point = roadAt(progress);
  const group = new THREE.Group(); group.position.set(point.x, 0, point.z); group.rotation.y = -point.heading;
  const box = (width, height, depth, horizontal, vertical, across, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(horizontal, vertical, across); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  for (const side of [-1,1]) {
    const height = side > 0 ? 8.6 : 6.9;
    box(2.8, height, 1.3, 0, height / 2, side * 6.4, materials.concrete);
    for (let row = 0; row < 10; row++) box(0.1, 0.13, 1.35, -1.46, row * 0.7 + 0.2, side * 6.4, materials.rock);
    box(12, 9.3, 0.6, 5, 4.6, side * 10, materials.concrete);
    const retainingHeight = side > 0 ? 12 : 8;
    box(2.5, retainingHeight, side > 0 ? 10 : 6, 3.5, retainingHeight / 2, side * 10.7, materials.concrete);
  }
  const retaining = box(2.5, 3.6, 22, 3.5, 8.7, 0, materials.concrete);
  const vertices = retaining.geometry.attributes.position;
  for (let index = 0; index < vertices.count; index++) {
    if (vertices.getY(index) > 0) vertices.setY(index, vertices.getY(index) + vertices.getZ(index) * 0.22);
  }
  retaining.geometry.computeVertexNormals();
  box(5, 0.45, 11.8, 2, 6.95, 0, materials.concrete);
  for (const side of [-1,1]) box(5, 6.9, 0.65, 2, 3.45, side * 5.8, materials.concrete);
  const fascia = box(2.9, 1.7, 17.5, 0, 8.3, 0, materials.wood); fascia.rotation.x = -0.11;
  const canopy = box(5, 0.28, 19, -0.5, 9.25, 0, materials.wood); canopy.rotation.x = -0.11;
  for (let panel = 0; panel < 27; panel++) {
    const across = -8 + panel * 0.6;
    box(0.06, 1.5, 0.045, -1.48, 8.3 + across * 0.11, across, materials.wood);
  }
  if (south) {
    box(4, 4.4, 8, 1, 2.2, -11.2, materials.wood);
    const annexRoof = box(6, 0.18, 9.7, -0.5, 4.7, -11.2, materials.wood); annexRoof.rotation.x = 0.1;
    for (let window = 0; window < 3; window++) box(0.05, 2.2, 1.7, -1.05, 2.7, -13.8 + window * 2.5,
      new THREE.MeshStandardMaterial({ color: '#718782', metalness: 0.3, roughness: 0.5 }));
  }
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#e5e7de'; context.textAlign = 'center'; context.font = 'bold 106px sans-serif';
  context.fillText(south ? 'ATAL TUNNEL, ROHTANG' : 'ATAL TUNNEL', 1024, 185);
  context.font = 'bold 43px sans-serif'; context.fillText(south ? 'SOUTH PORTAL' : 'NORTH PORTAL', 1630, 55);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 1.55), new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.6, depthWrite: false }));
  sign.rotation.set(-0.11, -Math.PI / 2, 0); sign.position.set(-1.53, 8.3, 0); group.add(sign);
  for (const side of [-1,1]) {
    const signal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: '#72dc9b' }));
    signal.position.set(-1.7, 2.7, side * 5.8); group.add(signal);
  }
  scene.add(group);
  return group;
}
