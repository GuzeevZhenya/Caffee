// 3D-сцена блюда: exploded view слоёв, HTML-пины, поворот drag'ом, день/вечер.
// Конфиги слоёв повторяют MenuItemLayerConfig из packages/shared.

import * as THREE from "three";

export function initItemScene(canvas, pinsRoot, item) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = canvas.parentElement;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const key = new THREE.DirectionalLight(0xffe0b0, 1.8);
  key.position.set(4, 6, 5);
  const rim = new THREE.DirectionalLight(0x88a0ff, 0.35);
  rim.position.set(-4, 2, -3);
  scene.add(ambient, key, rim);

  // Группа блюда (вращается drag'ом)
  const dish = new THREE.Group();
  scene.add(dish);

  // Основание: чашка для напитков, тарелка для десертов
  const isDessert = item.category === "dessert";
  if (isDessert) {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.2, 0.08, 64),
      new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.35 })
    );
    plate.position.y = -0.09;
    dish.add(plate);
  } else {
    const maxH = Math.max(...item.layers.map((l) => l.config.basePositionY + l.config.heightScale));
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 0.82, maxH + 0.35, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xd99a4e, transparent: true, opacity: 0.13, roughness: 0.15, side: THREE.DoubleSide,
      })
    );
    cup.position.y = (maxH + 0.35) / 2 - 0.18;
    dish.add(cup);
  }

  // Слои
  const layerNodes = item.layers.map((layer) => {
    const c = layer.config;
    let geo;
    if (c.primitiveType === "BOX") {
      geo = new THREE.BoxGeometry(c.radiusScale * 1.7, c.heightScale, c.radiusScale * 1.15);
    } else if (c.primitiveType === "SPHERE") {
      geo = new THREE.SphereGeometry(c.radiusScale * 0.55, 32, 20);
      geo.scale(1, Math.max(c.heightScale / (c.radiusScale * 0.8), 0.5), 1);
    } else {
      geo = new THREE.CylinderGeometry(c.radiusScale, c.radiusScale * 0.98, c.heightScale, 48);
    }
    const mat = new THREE.MeshStandardMaterial({
      color: c.colorHex,
      transparent: c.opacity < 1,
      opacity: c.opacity,
      roughness: c.roughness,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const node = new THREE.Group();
    node.add(mesh);
    node.userData = { baseY: c.basePositionY, offY: c.explodeOffsetY, radius: c.radiusScale, layer };
    dish.add(node);
    return node;
  });

  // Пины: по одному на слой, чередование влево/вправо
  const pins = item.layers.map((layer, i) => {
    const el = document.createElement("div");
    el.className = `pin ${i % 2 === 0 ? "left" : "right"}`;
    el.innerHTML = `
      <span class="dot"></span><span class="stem"></span>
      <span class="pin-card">
        <strong>${layer.title}</strong>
        <span>${layer.grams} г · ${layer.kcal} ккал${layer.priceModifier ? ` · +${layer.priceModifier} ₽` : ""}</span>
      </span>`;
    pinsRoot.append(el);
    return el;
  });

  // Состояние
  let explode = 1;
  let rotY = 0.5;
  let rotX = 0.12;
  let autoRotate = !reduced;
  let activeIds = new Set(item.layers.map((l) => l.id));

  // Камера под высоту блюда
  const maxY = Math.max(...item.layers.map((l) => l.config.basePositionY + l.config.explodeOffsetY + l.config.heightScale));
  const dist = Math.max(5.2, maxY * 1.55);

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  function applyTransforms() {
    for (const node of layerNodes) {
      const { baseY, offY } = node.userData;
      node.position.y = baseY + 0.1 + offY * explode;
      const on = activeIds.has(node.userData.layer.id);
      node.visible = on;
    }
    dish.rotation.y = rotY;
    dish.rotation.x = rotX;
    const cy = maxY * 0.42;
    camera.position.set(0, cy + 1.6, dist);
    camera.lookAt(0, cy, 0);
  }

  const v = new THREE.Vector3();
  function updatePins() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const show = explode > 0.35;
    layerNodes.forEach((node, i) => {
      const pin = pins[i];
      const visible = show && node.visible;
      pin.classList.toggle("show", visible);
      if (!visible) return;
      const { radius } = node.userData;
      node.getWorldPosition(v);
      v.x += node.userData.layer.config.primitiveType === "BOX" ? radius * 0.9 : radius;
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      pin.style.transform =
        pin.classList.contains("left")
          ? `translate(${x}px, ${y}px) translate(-100%, -50%)`
          : `translate(${x}px, ${y}px) translate(0, -50%)`;
    });
  }

  // Drag-поворот
  let dragging = false;
  let px = 0, py = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    autoRotate = false;
    px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    rotY += (e.clientX - px) * 0.008;
    rotX = Math.min(0.9, Math.max(-0.2, rotX + (e.clientY - py) * 0.004));
    px = e.clientX; py = e.clientY;
  });
  const stop = () => { dragging = false; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  const clock = new THREE.Clock();
  function frame() {
    const dt = clock.getDelta();
    if (autoRotate) rotY += dt * 0.25;
    applyTransforms();
    renderer.render(scene, camera);
    updatePins();
    requestAnimationFrame(frame);
  }
  frame();

  return {
    setExplode(value) { explode = value; },
    setActiveLayers(ids) { activeIds = new Set(ids); },
    setLighting(mode) {
      if (mode === "evening") {
        key.color.set(0xff9a4d);
        key.intensity = 1.15;
        ambient.intensity = 0.32;
        rim.color.set(0xffc27a);
        rim.intensity = 0.6;
        stage.style.background =
          "radial-gradient(50% 60% at 50% 45%, oklch(0.3 0.07 45 / 0.85), transparent 75%), var(--bg-2)";
      } else {
        key.color.set(0xffe0b0);
        key.intensity = 1.8;
        ambient.intensity = 0.6;
        rim.color.set(0x88a0ff);
        rim.intensity = 0.35;
        stage.style.background = "";
      }
    },
  };
}
