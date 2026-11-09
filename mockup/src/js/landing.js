// Hero-сцена лендинга: пар над чашкой + парящие «слои» блюда.
// Декоративный канвас: aria-hidden, pointer-events:none, постер под ним — в CSS.

import * as THREE from "three";

export function initHeroScene(canvas) {
  if (!canvas) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return; // постер уже виден
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.1, 7.2);
  camera.lookAt(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffd9a0, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);

  // --- Парящие слои (мотив exploded view) ---
  const group = new THREE.Group();
  group.position.set(1.9, -0.5, 0);
  scene.add(group);

  const layerSpecs = [
    { y: 0.0, r: 1.05, h: 0.22, color: 0x3a2312, opacity: 1 },
    { y: 0.55, r: 1.1, h: 0.26, color: 0xe8dcc8, opacity: 1 },
    { y: 1.12, r: 1.06, h: 0.2, color: 0xc47b2b, opacity: 0.92 },
    { y: 1.62, r: 0.95, h: 0.14, color: 0xf5ecdc, opacity: 0.9 },
  ];
  const layerMeshes = [];
  for (const spec of layerSpecs) {
    const geo = new THREE.CylinderGeometry(spec.r, spec.r, spec.h, 48);
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      transparent: spec.opacity < 1,
      opacity: spec.opacity,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = spec.y;
    group.add(mesh);
    layerMeshes.push({ mesh, baseY: spec.y, phase: spec.y * 2.1 });
  }
  // Контур чашки — полупрозрачное «стекло»
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(1.16, 0.92, 1.7, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xd99a4e,
      transparent: true,
      opacity: 0.14,
      roughness: 0.2,
      side: THREE.DoubleSide,
    })
  );
  cup.position.y = 0.45;
  group.add(cup);

  // --- Пар: точки, поднимающиеся спиралью ---
  const COUNT = 260;
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 3); // радиус, угол, скорость
  for (let i = 0; i < COUNT; i++) {
    seeds[i * 3] = 0.15 + Math.random() * 0.9;
    seeds[i * 3 + 1] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 2] = 0.25 + Math.random() * 0.6;
    positions[i * 3 + 1] = Math.random() * 3.4;
  }
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const steam = new THREE.Points(
    steamGeo,
    new THREE.PointsMaterial({
      color: 0xf0dcbe,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  steam.position.set(1.9, 0.6, 0);
  scene.add(steam);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const pos = steamGeo.attributes.position;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.18;
    for (const { mesh, baseY, phase } of layerMeshes) {
      mesh.position.y = baseY + Math.sin(t * 0.9 + phase) * 0.045;
    }
    for (let i = 0; i < COUNT; i++) {
      const radius = seeds[i * 3];
      const angle = seeds[i * 3 + 1] + t * 0.35;
      const speed = seeds[i * 3 + 2];
      let y = pos.getY(i) + speed * 0.012;
      if (y > 3.4) y = 0;
      const spread = radius * (0.35 + y * 0.28);
      pos.setXYZ(i, Math.cos(angle + y) * spread, y, Math.sin(angle + y) * spread);
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  if (reduced) {
    renderer.render(scene, camera); // один статичный кадр
  } else {
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    });
  }
}
