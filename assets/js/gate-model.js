// Pinned optional dependency. Loaded only after "Explore in 3D" is selected.
// Three.js MIT license: https://github.com/mrdoob/three.js/blob/r180/LICENSE
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function createGateModel(host, viewport, onContextLost) {
  const canvas = document.createElement('canvas');
  // Check availability before invoking Three.js, avoiding its noisy failure log.
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
  if (!gl) throw new Error('WebGL 2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x0d1118, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Illustrative 3D gate model. Use the labeled opening and view-angle controls.');
  host.append(canvas);

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
  world.add(new THREE.HemisphereLight(0xe8f3ff, 0x3e4530, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-4, 8, 5);
  world.add(key);
  const rim = new THREE.DirectionalLight(0xa977ff, 1.5);
  rim.position.set(4, 3, -4);
  world.add(rim);

  const materials = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x505d69, roughness: .95 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x95a3ad, roughness: .5, metalness: .6 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x242d37, roughness: .8 }),
    gate: new THREE.MeshStandardMaterial({ color: 0xc4df68, roughness: .45, metalness: .25 }),
    water: new THREE.MeshStandardMaterial({ color: 0x4a929e, roughness: .3, metalness: .25, transparent: true, opacity: .8 })
  };
  const geometries = new Set();
  const geometry = (g) => { geometries.add(g); return g; };
  function box(size, position, material, parent = world) {
    const mesh = new THREE.Mesh(geometry(new THREE.BoxGeometry(...size)), material);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }
  box([6, .28, 6.5], [0, -.28, 0], materials.dark);
  box([2.8, .12, 5.9], [0, -.06, 0], materials.concrete);
  box([.65, .85, 5.9], [-1.72, .31, 0], materials.concrete);
  box([.65, .85, 5.9], [1.72, .31, 0], materials.concrete);
  box([2.77, .18, 5.85], [0, .29, 0], materials.water);
  [-1.5, 1.5].forEach((x) => {
    box([.22, 4.6, .3], [x, 2.3, 0], materials.steel);
    box([.6, .15, .7], [x, .78, 0], materials.dark);
  });
  box([3.65, .32, .55], [0, 4.68, 0], materials.dark);
  const gate = new THREE.Group();
  world.add(gate);
  box([2.75, 2.3, .15], [0, 0, 0], materials.gate, gate);
  [-.95, -.32, .32, .95].forEach((y) => box([2.6, .1, .18], [0, y, .13], materials.steel, gate));
  [-1.15, 1.15].forEach((x) => box([.09, 2.17, .13], [x, 0, .16], materials.steel, gate));
  const stem = box([.09, 1, .09], [0, 3.8, 0], materials.steel);
  const wheel = new THREE.Mesh(geometry(new THREE.TorusGeometry(.4, .045, 8, 28)), materials.gate);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0, 5, 0);
  world.add(wheel);
  box([.8, .06, .06], [0, 5, 0], materials.gate);
  box([.06, .06, .8], [0, 5, 0], materials.gate);
  box([.26, .25, .26], [0, 4.9, 0], materials.steel);
  const grid = new THREE.GridHelper(8, 16, 0x445257, 0x28323b);
  grid.position.y = -.435;
  world.add(grid);
  geometries.add(grid.geometry);

  let frame = 0;
  let active = false;
  let visible = true;
  let disposed = false;
  // No continuous animation: a frame is requested only for a control or size change.
  function requestRender() {
    if (frame || disposed || !active || !visible || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed || !active || !visible || document.hidden) return;
      const { width, height } = viewport.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(world, camera);
    });
  }
  function update(value, angle) {
    gate.position.y = 1.18 + value / 100 * 2.3;
    const top = gate.position.y + 1.15;
    stem.scale.y = Math.max(.15, 4.9 - top);
    stem.position.y = top + stem.scale.y / 2;
    wheel.rotation.z = value * Math.PI / 50;
    const azimuth = THREE.MathUtils.degToRad(angle);
    camera.position.set(Math.sin(azimuth) * 12.8, 8, Math.cos(azimuth) * 12.8);
    camera.lookAt(0, 1.95, 0);
    requestRender();
  }
  const resize = new ResizeObserver(requestRender);
  resize.observe(viewport);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    requestRender();
  });
  intersection.observe(viewport);
  document.addEventListener('visibilitychange', requestRender);
  const lost = (event) => {
    event.preventDefault();
    onContextLost();
  };
  canvas.addEventListener('webglcontextlost', lost);
  return {
    update,
    setActive(value) { active = value; requestRender(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', requestRender);
      canvas.removeEventListener('webglcontextlost', lost);
      geometries.forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      if (Array.isArray(grid.material)) grid.material.forEach((m) => m.dispose());
      else grid.material.dispose();
      renderer.dispose();
      canvas.remove();
    }
  };
}

