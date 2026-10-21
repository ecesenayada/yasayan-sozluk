import * as THREE from 'three';
import { OrbitControls } from './jsm/OrbitControls.js';
import { MODELS, buildChest } from './models.js';
import { WORDS } from './words.js';

const slug = document.body.dataset.slug;
const idx = WORDS.findIndex((w) => w.slug === slug);
const W = WORDS[idx];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- 3B sahne ---------------- */
const canvas = document.getElementById('c');
const stage = canvas.parentElement;
const hint = document.getElementById('hint');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  stage.classList.add('no3d');
  hint.textContent = 'Bu cihaz 3B görüntüyü desteklemiyor.';
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  cam.position.set(0, 2.1, 5.9);
  const controls = new OrbitControls(cam, canvas);
  controls.target.set(0, 1.1, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 11;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.autoRotateSpeed = 1.5;
  controls.enabled = false;

  scene.add(new THREE.HemisphereLight('#fff6e5', '#6b5a45', 1.5));
  const sun = new THREE.DirectionalLight('#ffffff', 2.1); sun.position.set(3, 6, 4); scene.add(sun);
  const rim = new THREE.DirectionalLight('#a8d4ff', 0.8); rim.position.set(-4, 3, -3); scene.add(rim);

  // yumuşak zemin gölgesi
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d'); const grd = sx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, 'rgba(60,35,15,0.38)'); grd.addColorStop(1, 'rgba(60,35,15,0)'); sx.fillStyle = grd; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);

  // kelimenin modeli
  const built = MODELS[slug]();
  const model = built.g;
  built.update(0);
  const box = bounds(model);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const s = Math.min(2.7 / size.x, 2.35 / size.y, 2.7 / size.z);
  model.scale.setScalar(s);
  model.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  const holder = new THREE.Group(); holder.add(model); scene.add(holder);

  // sandık
  const chest = buildChest();
  scene.add(chest.g);

  // açılış parıltıları
  const burst = new THREE.Group(); scene.add(burst);
  const burstMat = new THREE.MeshStandardMaterial({ color: '#ffd34d', emissive: '#ffb000', emissiveIntensity: 1.2, flatShading: true });
  const bits = [];
  for (let i = 0; i < 36; i++) {
    const b = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), burstMat);
    const a = Math.random() * Math.PI * 2, up = 2.5 + Math.random() * 2.5, out = 0.8 + Math.random() * 1.6;
    b.userData.v = new THREE.Vector3(Math.cos(a) * out, up, Math.sin(a) * out);
    burst.add(b); bits.push(b);
  }
  burst.visible = false;

  let state = 'closed', tOpen = 0;
  const clock = new THREE.Clock();
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
  const easeBack = (x) => { x = Math.min(1, Math.max(0, x)); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  function resetClosed() {
    state = 'closed'; controls.enabled = false; controls.autoRotate = false;
    holder.visible = false; chest.g.visible = true; chest.g.scale.setScalar(1); chest.g.position.set(0, 0, 0);
    chest.lid.rotation.x = 0; chest.light.material.opacity = 0; burst.visible = false;
    cam.position.set(0, 2.1, 5.9); controls.target.set(0, 1.1, 0); controls.update();
    hint.textContent = 'Sandığa dokun, kelime çıksın!'; hint.classList.remove('gone');
  }
  function open() {
    if (state !== 'closed') return;
    state = 'opening'; tOpen = clock.getElapsedTime(); hint.classList.add('gone');
    bits.forEach((b) => b.position.set(0, 1.0, 0)); burst.visible = true;
  }
  function finish() {
    state = 'open'; chest.g.visible = false; holder.visible = true; holder.scale.setScalar(1); holder.position.y = 0; holder.rotation.y = 0;
    burst.visible = false; controls.enabled = true; controls.autoRotate = !reduced;
    hint.textContent = 'Parmağınla çevir, iki parmakla yakınlaştır.'; hint.classList.remove('gone');
    setTimeout(() => hint.classList.add('gone'), 3500);
  }
  canvas.addEventListener('pointerdown', () => { if (state === 'closed') open(); else controls.autoRotate = false; });
  document.getElementById('replay').addEventListener('click', () => { resetClosed(); setTimeout(open, 350); });
  resetClosed();
  if (reduced) finish(); else setTimeout(() => { if (state === 'closed') open(); }, 3800);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = w / h < 0.8 ? 46 : 36; cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  let visible = true;
  new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(stage);

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    if (!visible) return;
    built.update(t);
    if (state === 'closed') {
      chest.g.position.y = Math.abs(Math.sin(t * 2.2)) * 0.06;
      chest.g.rotation.y = Math.sin(t * 0.9) * 0.35;
      const peek = Math.max(0, Math.sin(t * 3)) ** 8;
      chest.lid.rotation.x = -peek * 0.18; chest.light.material.opacity = peek * 0.6;
    } else if (state === 'opening') {
      const a = t - tOpen;
      chest.g.rotation.y *= 0.9;
      chest.lid.rotation.x = -ease(a / 0.6) * 1.9;
      chest.light.material.opacity = Math.min(0.85, a * 1.5) * (1 - ease((a - 1.4) / 0.6));
      const p = easeBack((a - 0.45) / 1.25);
      holder.visible = a > 0.45;
      holder.scale.setScalar(0.12 + 0.88 * p);
      holder.position.y = 0.55 * (1 - Math.min(1, p)) + Math.sin(Math.min(1, p) * Math.PI) * 0.6;
      holder.rotation.y = (1 - Math.min(1, p)) * Math.PI * 2;
      const q = ease((a - 1.0) / 0.8);
      chest.g.scale.setScalar(Math.max(0.001, 1 - q)); chest.g.position.y = -q * 0.4;
      const ba = a - 0.35;
      bits.forEach((b) => { const v = b.userData.v; b.position.set(v.x * ba, 1.0 + v.y * ba - 4.5 * ba * ba, v.z * ba); b.rotation.x = ba * 8; b.scale.setScalar(Math.max(0.001, 1 - ba / 1.6)); });
      burst.visible = ba > 0 && ba < 1.6;
      if (a > 2.0) finish();
    }
    controls.update();
    renderer.render(scene, cam);
  });

  function bounds(root) {
    const b = new THREE.Box3(); root.updateMatrixWorld(true);
    (function walk(o) {
      if (o.userData.fx) return;
      if (o.isMesh) { o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); }
      o.children.forEach(walk);
    })(root);
    return b;
  }
}

/* ---------------- Mini oyunlar ---------------- */
const rnd = (n) => Math.floor(Math.random() * n);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function confetti(el) {
  const r = el.getBoundingClientRect();
  const cols = ['#e8b33a', '#2f7f86', '#c0392b', '#7b2d8e', '#27ae60'];
  for (let i = 0; i < 32; i++) {
    const d = document.createElement('i'); d.className = 'cf';
    d.style.left = r.left + r.width / 2 + 'px'; d.style.top = r.top + window.scrollY + 20 + 'px';
    d.style.background = cols[i % cols.length];
    d.style.setProperty('--dx', (Math.random() * 2 - 1) * 180 + 'px');
    d.style.setProperty('--dy', -(80 + Math.random() * 160) + 'px');
    d.style.setProperty('--rot', Math.random() * 720 + 'deg');
    document.body.appendChild(d); setTimeout(() => d.remove(), 1400);
  }
}

// Oyun 1: doğru anlamı bul
(function meaningGame() {
  const box = document.getElementById('g1opts'), msg = document.getElementById('g1msg');
  function build() {
    box.innerHTML = ''; msg.textContent = ''; msg.className = 'msg';
    const others = shuffle(WORDS.filter((w) => w.slug !== slug)).slice(0, 2);
    const opts = shuffle([{ def: W.def, ok: true }, ...others.map((o) => ({ def: o.def, ok: false }))]);
    opts.forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'opt';
      b.innerHTML = `<b>${'ABC'[i]}</b><span>${o.def}</span>`;
      b.onclick = () => {
        if (box.dataset.done) return;
        if (o.ok) { b.classList.add('ok'); msg.textContent = 'Harika! Doğru anlamı buldun.'; msg.className = 'msg ok'; box.dataset.done = 1; confetti(b); }
        else { b.classList.add('no'); msg.textContent = 'Bu başka bir kelimenin anlamı. Bir daha dene!'; msg.className = 'msg no'; }
      };
      box.appendChild(b);
    });
    delete box.dataset.done;
  }
  document.getElementById('g1again').onclick = build;
  build();
})();

// Oyun 2: harfleri sırala
(function letterGame() {
  const slotsEl = document.getElementById('g2slots'), tilesEl = document.getElementById('g2tiles'), msg = document.getElementById('g2msg');
  const target = Array.from(W.word.toLocaleUpperCase('tr-TR'));
  function build() {
    slotsEl.innerHTML = ''; tilesEl.innerHTML = ''; msg.textContent = ''; msg.className = 'msg';
    const slots = target.map((ch) => { const s = document.createElement('span'); s.className = ch === ' ' ? 'slot gap' : 'slot'; slotsEl.appendChild(s); return s; });
    let pos = 0; const skip = () => { while (target[pos] === ' ') pos++; }; skip();
    const letters = target.filter((c) => c !== ' ');
    let order = shuffle(letters); let tries = 0;
    while (order.join('') === letters.join('') && tries++ < 10) order = shuffle(letters);
    order.forEach((ch) => {
      const b = document.createElement('button'); b.className = 'tile'; b.textContent = ch;
      b.onclick = () => {
        if (b.disabled) return;
        if (ch === target[pos]) {
          slots[pos].textContent = ch; slots[pos].classList.add('fill'); b.disabled = true; pos++; skip();
          if (pos >= target.length) { msg.textContent = `Süper! “${W.word}” kelimesini tamamladın.`; msg.className = 'msg ok'; confetti(slotsEl); }
        } else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); msg.textContent = 'Sıradaki harf bu değil, tekrar dene.'; msg.className = 'msg no'; }
      };
      tilesEl.appendChild(b);
    });
  }
  document.getElementById('g2again').onclick = build;
  build();
})();
