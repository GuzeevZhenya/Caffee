// Hero-сцена главной: процедурная 3D-модель активного напитка.
// Три типа посуды: керамическая чашка (cup), стакан со слоями (glass),
// десертная тарелка со слоёным куском (dessert). Смена напитка — setDrink().

import * as THREE from "three";

const CERAMIC = 0xe7d9c4;
const CERAMIC_DARK = 0xdccdb4;

// ---------- Текстуры через canvas ----------
function drinkSurfaceTexture(item, art) {
  // Вид сверху: крема → молочный кольцо → латте-арт
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const base = item.hue ?? "#8a5a33";
  const grad = g.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, art === "milky" ? "#d9b98a" : "#4a2a12");
  grad.addColorStop(0.55, art === "milky" ? "#c9a06b" : "#6b3d1c");
  grad.addColorStop(0.85, "#a06a38");
  grad.addColorStop(1, "#8a5a33");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);

  if (art === "rosetta") {
    // Розетта: россыпь листьев по оси
    g.strokeStyle = "rgba(245,232,214,0.9)";
    g.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const y = 150 + i * 24;
      const w = 30 + i * 9;
      g.lineWidth = 13 - i * 0.8;
      g.beginPath();
      g.moveTo(256 - w, y + 12);
      g.quadraticCurveTo(256 - w * 0.2, y - 10, 256, y + 4);
      g.quadraticCurveTo(256 + w * 0.2, y - 10, 256 + w, y + 12);
      g.stroke();
    }
    // Сердце-верхушка
    g.fillStyle = "rgba(245,232,214,0.9)";
    g.beginPath();
    g.moveTo(256, 118);
    g.bezierCurveTo(236, 96, 214, 106, 218, 128);
    g.bezierCurveTo(221, 144, 244, 152, 256, 164);
    g.bezierCurveTo(268, 152, 291, 144, 294, 128);
    g.bezierCurveTo(298, 106, 276, 96, 256, 118);
    g.fill();
  }
  if (art === "dust") {
    // Какао-пудра: шум точек
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 230;
      g.fillStyle = `rgba(60,36,18,${0.25 + Math.random() * 0.5})`;
      g.beginPath();
      g.arc(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 1 + Math.random() * 2.4, 0, 7);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function foamTexture(dusty) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#f0e6d2";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(120,80,40,${Math.random() * (dusty ? 0.5 : 0.12)})`;
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 2, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glassLayersTexture(item) {
  // Вертикальный градиент по слоям напитка (снизу — первый слой)
  const c = document.createElement("canvas");
  c.width = 16; c.height = 256;
  const g = c.getContext("2d");
  const layers = item.layers.filter((l) => l.isBase);
  const total = layers.reduce((s, l) => s + l.config.heightScale, 0) || 1;
  let y = 256;
  for (const l of layers) {
    const h = (l.config.heightScale / total) * 256;
    g.fillStyle = l.config.colorHex;
    g.fillRect(0, y - h, 16, h);
    y -= h;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Строители моделей ----------
function ceramicCup(item, art) {
  const g = new THREE.Group();
  // Чашка (латhe-профиль)
  const pts = [
    new THREE.Vector2(0.02, 0),
    new THREE.Vector2(0.52, 0),
    new THREE.Vector2(0.60, 0.05),
    new THREE.Vector2(0.66, 0.4),
    new THREE.Vector2(0.86, 1.18),
    new THREE.Vector2(0.92, 1.34),
  ];
  const cup = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 48),
    new THREE.MeshStandardMaterial({ color: CERAMIC, roughness: 0.42, side: THREE.DoubleSide })
  );
  g.add(cup);
  // Ручка
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.075, 16, 40, Math.PI),
    new THREE.MeshStandardMaterial({ color: CERAMIC, roughness: 0.42 })
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.95, 0.78, 0);
  g.add(handle);
  // Блюдце
  const saucerPts = [
    new THREE.Vector2(0.02, 0),
    new THREE.Vector2(0.55, 0.02),
    new THREE.Vector2(1.25, 0.06),
    new THREE.Vector2(1.45, 0.16),
    new THREE.Vector2(1.42, 0.2),
  ];
  const saucer = new THREE.Mesh(
    new THREE.LatheGeometry(saucerPts, 48),
    new THREE.MeshStandardMaterial({ color: CERAMIC_DARK, roughness: 0.35 })
  );
  g.add(saucer);
  // Поверхность напитка
  const surf = new THREE.Mesh(
    new THREE.CircleGeometry(0.82, 48),
    new THREE.MeshStandardMaterial({ map: drinkSurfaceTexture(item, art), roughness: 0.25 })
  );
  surf.rotation.x = -Math.PI / 2;
  surf.position.y = 1.24;
  g.add(surf);
  return { group: g, topY: 1.34, steamY: 1.35, radius: 1.45 };
}

function glassDrink(item, foamColor, foamDusty) {
  const g = new THREE.Group();
  // Стакан
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.62, 2.0, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.08, side: THREE.DoubleSide,
    })
  );
  glass.position.y = 1.0;
  g.add(glass);
  // Дно стакана
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.6, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.15 })
  );
  bottom.position.y = 0.04;
  g.add(bottom);
  // Жидкость со слоями
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.56, 1.7, 48),
    new THREE.MeshStandardMaterial({ map: glassLayersTexture(item), roughness: 0.3 })
  );
  liquid.position.y = 0.95;
  g.add(liquid);
  // Пена сверху
  const foam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.74, 0.72, 0.2, 48),
    new THREE.MeshStandardMaterial({ map: foamTexture(foamDusty), color: foamColor, roughness: 0.8 })
  );
  foam.position.y = 1.9;
  g.add(foam);
  // Подставка
  const coaster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.05, 48),
    new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: 0.7 })
  );
  coaster.position.y = -0.03;
  g.add(coaster);
  return { group: g, topY: 2.0, steamY: 2.0, radius: 0.95 };
}

function dessertPlate(item, speckleTop) {
  const g = new THREE.Group();
  const platePts = [
    new THREE.Vector2(0.02, 0),
    new THREE.Vector2(0.9, 0.02),
    new THREE.Vector2(1.5, 0.05),
    new THREE.Vector2(1.62, 0.14),
  ];
  const plate = new THREE.Mesh(
    new THREE.LatheGeometry(platePts, 48),
    new THREE.MeshStandardMaterial({ color: 0x2a201a, roughness: 0.4 })
  );
  g.add(plate);
  // Стопка слоёв
  let y = 0.06;
  const layers = item.layers.filter((l) => l.isBase);
  for (const l of layers) {
    const h = l.config.heightScale * 0.8;
    let mat = new THREE.MeshStandardMaterial({ color: l.config.colorHex, roughness: l.config.roughness });
    if (speckleTop && l === layers[layers.length - 1]) {
      mat = new THREE.MeshStandardMaterial({ map: foamTexture(true), color: 0xf0e6d2, roughness: 0.9 });
    }
    const geo =
      l.config.primitiveType === "SPHERE"
        ? new THREE.SphereGeometry(l.config.radiusScale * 0.5, 24, 16)
        : new THREE.BoxGeometry(l.config.radiusScale * 1.5, h, l.config.radiusScale * 1.05);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(0, y + h / 2, 0);
    m.rotation.y = (Math.random() - 0.5) * 0.2;
    g.add(m);
    y += h;
  }
  // Ягоды для чизкейка
  if (item.id === "cheesecake") {
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xa6274a, roughness: 0.25 });
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), i === 2 ? new THREE.MeshStandardMaterial({ color: 0x2c3a6e, roughness: 0.25 }) : berryMat);
      b.position.set((Math.random() - 0.5) * 0.7, y + 0.06, (Math.random() - 0.5) * 0.45);
      g.add(b);
    }
  }
  return { group: g, topY: y + 0.2, steamY: 0, radius: 1.62 };
}

// ---------- Сцена ----------
export function initHeroScene(canvas) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 2.1, 6.4);
  camera.lookAt(0, 1.0, 0);

  scene.add(new THREE.AmbientLight(0xfff2e0, 0.75));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.2);
  key.position.set(3.5, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd4a373, 1.1);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  const stage = new THREE.Group();
  scene.add(stage);

  // Пар
  const COUNT = 120;
  const sPos = new Float32Array(COUNT * 3);
  const sSeed = new Float32Array(COUNT * 2);
  for (let i = 0; i < COUNT; i++) {
    sSeed[i * 2] = Math.random() * Math.PI * 2;
    sSeed[i * 2 + 1] = 0.35 + Math.random() * 0.7;
    sPos[i * 3 + 1] = Math.random() * 2;
  }
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const steam = new THREE.Points(
    steamGeo,
    new THREE.PointsMaterial({ color: 0xf0dcbe, size: 0.06, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  stage.add(steam);

  let holder = null;
  let steamOn = true;
  let targetScale = 1;
  let curScale = 1;

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  let rotY = 0;
  let dragging = false, px = 0;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; px = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    rotY += (e.clientX - px) * 0.01;
    px = e.clientX;
  });
  const up = () => { dragging = false; };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();
    if (holder) {
      if (!dragging && !reduced) holder.group.rotation.y = t * 0.35;
      else holder.group.rotation.y = rotY;
      if (!reduced) holder.group.position.y = Math.sin(t * 1.1) * 0.06;
      curScale += (targetScale - curScale) * 0.14;
      holder.group.scale.setScalar(curScale);
    }
    // пар
    if (steamOn && holder?.steamY) {
      steam.visible = true;
      steam.position.y = holder.steamY;
      const p = steamGeo.attributes.position;
      for (let i = 0; i < COUNT; i++) {
        let y = p.getY(i) + sSeed[i * 2 + 1] * 0.008;
        if (y > 2) y = 0;
        const r = 0.12 + y * 0.16;
        const a = sSeed[i * 2] + t * 0.5 + y;
        p.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r);
      }
      p.needsUpdate = true;
    } else {
      steam.visible = false;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  return {
    /** meta: { type: 'cup'|'glass'|'dessert', art?: 'rosetta'|'milky'|'dust', foamDusty?: bool } */
    setDrink(item, meta = {}) {
      targetScale = 0.001;
      const prev = holder;
      setTimeout(() => {
        if (prev) stage.remove(prev.group);
        if (meta.type === "glass") {
          holder = glassDrink(item, item.id === "matcha-latte" ? 0xe6efe0 : 0xf5e9d6, item.id === "matcha-latte");
          steamOn = meta.steam !== false;
        } else if (meta.type === "dessert") {
          holder = dessertPlate(item, item.id === "tiramisu");
          steamOn = false;
        } else {
          holder = ceramicCup(item, meta.art ?? "rosetta");
          steamOn = meta.steam !== false;
        }
        stage.add(holder.group);
        // центрирование по высоте
        holder.group.position.y = -(holder.topY * 0.5) + 0.75;
        targetScale = 1;
        curScale = reduced ? 1 : 0.55;
        rotY = holder.group.rotation.y;
      }, reduced ? 0 : 160);
    },
    resize,
  };
}
