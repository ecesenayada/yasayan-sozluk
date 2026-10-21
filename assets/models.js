// Yaşayan Sözlük — her kelime için kodla üretilmiş low-poly 3B modeller
import * as THREE from 'three';

const PI = Math.PI;
const cache = {};
export function mat(c, o = {}) {
  const k = c + JSON.stringify(o);
  if (!cache[k]) cache[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0, flatShading: true }, o));
  return cache[k];
}
const toM = (c) => (typeof c === 'string' ? mat(c) : c);
const metal = (c) => mat(c, { metalness: 0.55, roughness: 0.35 });
const glow = (c, i = 1.4) => mat(c, { emissive: c, emissiveIntensity: i });
const two = (c, o = {}) => mat(c, Object.assign({ side: THREE.DoubleSide }, o));
const clear = (c, op = 0.35) => mat(c, { transparent: true, opacity: op, roughness: 0.1, metalness: 0.1, flatShading: false });

const WOOD = '#9a5b2e', DWOOD = '#6b3a1a', LWOOD = '#c48a52', BRASS = '#d4a52c', COPPER = '#c56a32', STONE = '#a8a29a',
  DSTONE = '#7d776f', MARBLE = '#ece7de', RED = '#c0392b', TEAL = '#2f7f86', WATER = '#4fa3d1', LEAF = '#4f8f3a',
  SKIN = '#f0c08a', CREAM = '#f4ead2', IRON = '#4a4a50', GOLD = '#e8b33a';

function m(geo, material, p = [0, 0, 0], r = [0, 0, 0], s) {
  const me = new THREE.Mesh(geo, toM(material));
  me.position.set(...p); me.rotation.set(...r);
  if (s !== undefined) Array.isArray(s) ? me.scale.set(...s) : me.scale.setScalar(s);
  return me;
}
const B = (w, h, d, c, p, r, s) => m(new THREE.BoxGeometry(w, h, d), c, p, r, s);
const C = (rt, rb, h, c, p, r, seg = 16, s) => m(new THREE.CylinderGeometry(rt, rb, h, seg), c, p, r, s);
const S = (rad, c, p, s, seg = 14) => m(new THREE.SphereGeometry(rad, seg, Math.max(6, (seg * 0.7) | 0)), c, p, [0, 0, 0], s);
const K = (rad, h, c, p, r, seg = 12, s) => m(new THREE.ConeGeometry(rad, h, seg), c, p, r, s);
const T = (R, t, c, p, r, arc = PI * 2, s) => m(new THREE.TorusGeometry(R, t, 8, 28, arc), c, p, r, s);
const L = (pts, c, p, r, seg = 22, s) => m(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), c, p, r, s);
const tube = (pts, rad, c, seg = 40) => m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), seg, rad, 8), c);
function G(...kids) { const g = new THREE.Group(); kids.forEach((k) => k && g.add(k)); return g; }
function at(obj, p = [0, 0, 0], r = [0, 0, 0], s) { obj.position.set(...p); obj.rotation.set(...r); if (s !== undefined) Array.isArray(s) ? obj.scale.set(...s) : obj.scale.setScalar(s); return obj; }
function fx(obj) { obj.userData.fx = true; return obj; }
const frac = (x) => x - Math.floor(x);

function heartGeo(depth = 0.35) {
  const s = new THREE.Shape();
  s.moveTo(0, -1);
  s.bezierCurveTo(-0.25, -0.7, -1.05, -0.35, -1.05, 0.25);
  s.bezierCurveTo(-1.05, 0.8, -0.35, 1.0, 0, 0.55);
  s.bezierCurveTo(0.35, 1.0, 1.05, 0.8, 1.05, 0.25);
  s.bezierCurveTo(1.05, -0.35, 0.25, -0.7, 0, -1);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2, curveSegments: 10 });
  g.center();
  return g;
}

// Basit insan figürü
function person(body = TEAL, opt = {}) {
  const g = G();
  const skin = opt.skin || SKIN;
  g.add(C(0.2, 0.3, 0.75, body, [0, 0.42, 0], [0, 0, 0], 10));
  g.add(S(0.19, skin, [0, 0.98, 0], 1, 12));
  const armL = G(C(0.06, 0.06, 0.5, body, [0, -0.22, 0], [0, 0, 0], 6)); at(armL, [-0.26, 0.72, 0], [0, 0, 0.25]);
  const armR = G(C(0.06, 0.06, 0.5, body, [0, -0.22, 0], [0, 0, 0], 6)); at(armR, [0.26, 0.72, 0], [0, 0, -0.25]);
  g.add(armL, armR);
  if (opt.hat) g.add(C(0.13, 0.16, 0.18, opt.hat, [0, 1.2, 0], [0, 0, 0], 10));
  if (opt.scarf) g.add(S(0.21, opt.scarf, [0, 1.02, -0.03], [1, 1.02, 1]));
  // gözler
  g.add(S(0.025, '#222', [-0.07, 1.0, 0.17], 1, 6), S(0.025, '#222', [0.07, 1.0, 0.17], 1, 6));
  g.userData.armL = armL; g.userData.armR = armR;
  return g;
}

function flames(n = 5, scale = 1) {
  const g = fx(G());
  const list = [];
  const cols = ['#ff7a1a', '#ffb02e', '#ffd84d'];
  for (let i = 0; i < n; i++) {
    const f = K(0.16 * scale, 0.6 * scale, glow(cols[i % 3], 1.6), [Math.cos(i * 2.4) * 0.12 * scale, 0.3 * scale, Math.sin(i * 2.4) * 0.12 * scale], [0, 0, 0], 6);
    g.add(f); list.push(f);
  }
  g.update = (t) => list.forEach((f, i) => { const k = 0.75 + 0.35 * Math.abs(Math.sin(t * 7 + i * 1.7)); f.scale.set(1, k, 1); f.position.y = 0.3 * scale * k; });
  return g;
}

function rising(n, makeOne, opt = {}) {
  const g = fx(G());
  const list = [];
  for (let i = 0; i < n; i++) { const p = makeOne(i); g.add(p); list.push(p); }
  const sp = opt.speed || 0.5, h = opt.height || 1.5, spread = opt.spread || 0.2, grow = opt.grow ?? 1.5, sway = opt.sway ?? 0.15;
  g.update = (t) => list.forEach((p, i) => {
    const ph = frac(t * sp + i / n);
    p.position.set(Math.sin(ph * 6 + i) * sway + Math.cos(i * 2.1) * spread * ph, ph * h, Math.cos(ph * 5 + i) * sway * 0.6);
    p.scale.setScalar(0.4 + ph * grow);
    if (p.material.transparent) p.material.opacity = (opt.op || 0.6) * (1 - ph);
    p.visible = ph > 0.02;
  });
  return g;
}
function smokeBall(c = '#e8e4dc', r = 0.12) { return S(r, new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.5, roughness: 1, flatShading: true }), [0, 0, 0], 1, 8); }

function drops(n, from, opt = {}) {
  const g = fx(G());
  const list = [];
  for (let i = 0; i < n; i++) { const d = S(opt.r || 0.05, mat(opt.c || WATER, { roughness: 0.2 }), [0, 0, 0], [1, 1.5, 1], 8); g.add(d); list.push(d); }
  const len = opt.len || 1.2;
  g.update = (t) => list.forEach((d, i) => {
    const ph = frac(t * (opt.speed || 0.9) + i / n);
    d.position.set(from[0] + (opt.vx || 0) * ph, from[1] - ph * ph * len, from[2] + (opt.vz || 0) * ph);
  });
  return g;
}

function sparkles(n, radius, y, c = GOLD) {
  const g = fx(G());
  const list = [];
  for (let i = 0; i < n; i++) { const s = m(new THREE.OctahedronGeometry(0.07), glow(c, 1.2)); g.add(s); list.push(s); }
  g.update = (t) => list.forEach((s, i) => {
    const a = t * 0.6 + (i / n) * PI * 2;
    s.position.set(Math.cos(a) * radius, y + Math.sin(t * 1.3 + i) * 0.25, Math.sin(a) * radius);
    s.rotation.y = t * 2 + i; s.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(t * 3 + i)));
  });
  return g;
}

function note(c = '#2b2b2b') {
  const g = G(S(0.08, c, [0, 0, 0], [1.25, 0.9, 0.6], 10), B(0.025, 0.32, 0.025, c, [0.09, 0.16, 0]), B(0.1, 0.03, 0.025, c, [0.13, 0.31, 0], [0, 0, -0.5]));
  return g;
}

/* ----------------------------------------------------------------- */
export const MODELS = {
  ahilik() {
    const g = G();
    g.add(B(3, 0.12, 1.8, '#b9a58a', [0, 0.06, 0]));
    g.add(B(2.8, 2.1, 0.12, '#efe3c8', [0, 1.15, -0.8]));
    const jarCols = [COPPER, TEAL, BRASS, RED, LEAF];
    for (let i = 0; i < 2; i++) {
      g.add(B(2.4, 0.06, 0.32, WOOD, [0, 1.15 + i * 0.55, -0.6]));
      for (let j = 0; j < 5; j++) g.add(L([[0, 0], [0.1, 0], [0.13, 0.12], [0.07, 0.24], [0.09, 0.28], [0, 0.28]], jarCols[(i * 2 + j) % 5], [-0.9 + j * 0.45, 1.18 + i * 0.55, -0.6]));
    }
    [-1.35, 1.35].forEach((x) => g.add(C(0.06, 0.06, 2.4, DWOOD, [x, 1.2, 0.8], [0, 0, 0], 8)));
    for (let i = 0; i < 7; i++) g.add(B(0.41, 0.04, 1.3, i % 2 ? '#f4efe6' : RED, [-1.23 + i * 0.41, 2.3, 0.2], [0.35, 0, 0]));
    g.add(B(2.4, 0.8, 0.6, WOOD, [0, 0.52, 0.45]));
    g.add(B(2.55, 0.07, 0.72, DWOOD, [0, 0.95, 0.45]));
    g.add(B(0.7, 0.45, 0.03, BRASS, [0, 0.55, 0.76]));
    // terazi — dürüst tartı
    const sc = G(); sc.position.set(0.55, 0.99, 0.45);
    sc.add(C(0.16, 0.19, 0.07, metal(BRASS), [0, 0.035, 0]));
    sc.add(C(0.025, 0.025, 0.75, metal(BRASS), [0, 0.4, 0], [0, 0, 0], 8));
    const beam = G(B(1.0, 0.045, 0.045, metal(BRASS)), K(0.05, 0.12, metal(BRASS), [0, 0.07, 0], [0, 0, 0], 4)); beam.position.y = 0.76; sc.add(beam);
    const pans = [];
    [-0.47, 0.47].forEach((x, k) => {
      const p = G(C(0.006, 0.006, 0.4, '#555', [0, -0.2, 0], [0, 0, 0], 4),
        L([[0, 0], [0.18, 0.02], [0.2, 0.07]], two(BRASS, { metalness: 0.5, roughness: 0.4 }), [0, -0.44, 0]));
      if (k === 0) { p.add(S(0.07, '#e74c3c', [0, -0.36, 0]), S(0.07, '#f39c12', [0.06, -0.36, 0.05]), S(0.06, '#e74c3c', [-0.05, -0.35, 0.05])); }
      else p.add(C(0.06, 0.07, 0.1, IRON, [0, -0.37, 0], [0, 0, 0], 8));
      p.position.x = x; beam.add(p); pans.push(p);
    });
    g.add(sc);
    // çırak ile usta
    const usta = person('#7a4a2a', { hat: '#5b2c1a' }); at(usta, [-0.75, 0.12, -0.25], [0, 0.25, 0], 1.35); g.add(usta);
    return { g, update(t) { beam.rotation.z = Math.sin(t * 1.4) * 0.14; pans.forEach((p) => (p.rotation.z = -beam.rotation.z)); usta.userData.armR.rotation.z = -0.25 - Math.max(0, Math.sin(t * 1.4)) * 0.6; } };
  },

  asiyan() {
    const g = G();
    g.add(C(0.12, 0.16, 3.2, '#6b4a2e', [0, 0.5, 0], [0, 0, PI / 2 - 0.1], 7));
    g.add(C(0.05, 0.08, 1.0, '#6b4a2e', [1.0, 0.85, 0.1], [0.3, 0, -0.7], 6));
    for (let i = 0; i < 9; i++) { const a = i * 0.9; g.add(S(0.22, i % 2 ? LEAF : '#6aa84f', [-1.3 + i * 0.35, 0.65 + Math.sin(a) * 0.15, Math.cos(a) * 0.3], [1.3, 0.5, 0.8], 6)); }
    const nest = G();
    for (let i = 0; i < 4; i++) nest.add(T(0.42 - i * 0.03, 0.09, i % 2 ? '#8a6238' : '#a57a4a', [0, i * 0.07, 0], [PI / 2, 0, i], PI * 2, [1, 1, 1]));
    nest.add(C(0.38, 0.25, 0.12, '#6e4b2a', [0, -0.03, 0], [0, 0, 0], 12));
    [[-0.12, 0.06], [0.1, 0.1], [0.02, -0.12]].forEach(([x, z]) => nest.add(S(0.1, '#bfe3ec', [x, 0.12, z], [1, 1.3, 1], 10)));
    at(nest, [0, 0.62, 0]); g.add(nest);
    const bird = G();
    bird.add(S(0.22, '#e07a3f', [0, 0, 0], [1.3, 1, 1], 10));
    bird.add(S(0.15, '#e07a3f', [0.25, 0.17, 0], 1, 10));
    bird.add(S(0.14, '#f6d7b0', [0.05, -0.05, 0.1], [1.2, 0.9, 0.6], 8));
    bird.add(K(0.05, 0.14, '#f2b632', [0.42, 0.17, 0], [0, 0, -PI / 2], 6));
    bird.add(S(0.025, '#111', [0.33, 0.22, 0.09], 1, 6), S(0.025, '#111', [0.33, 0.22, -0.09], 1, 6));
    bird.add(B(0.3, 0.05, 0.16, '#b85a2a', [-0.33, 0.08, 0], [0, 0, 0.4]));
    const wing = B(0.3, 0.04, 0.18, '#b85a2a', [0, 0.05, 0.18], [0.3, 0, 0]); bird.add(wing);
    const wing2 = B(0.3, 0.04, 0.18, '#b85a2a', [0, 0.05, -0.18], [-0.3, 0, 0]); bird.add(wing2);
    at(bird, [0.15, 1.15, 0], [0, 0.4, 0]); g.add(bird);
    return { g, update(t) { bird.position.y = 1.15 + Math.abs(Math.sin(t * 2)) * 0.12; bird.rotation.z = Math.sin(t * 2) * 0.08; wing.rotation.x = 0.3 + Math.sin(t * 10) * 0.25; wing2.rotation.x = -wing.rotation.x; } };
  },

  avadanlik() {
    const g = G();
    g.add(B(2.2, 0.08, 1.0, WOOD, [0, 0.04, 0]));
    g.add(B(2.2, 0.7, 0.08, WOOD, [0, 0.39, 0.46]), B(2.2, 0.7, 0.08, WOOD, [0, 0.39, -0.46]));
    g.add(B(0.08, 1.3, 1.0, LWOOD, [-1.06, 0.65, 0]), B(0.08, 1.3, 1.0, LWOOD, [1.06, 0.65, 0]));
    g.add(C(0.06, 0.06, 2.2, DWOOD, [0, 1.2, 0], [0, 0, PI / 2], 8));
    g.add(B(2.22, 0.06, 0.1, BRASS, [0, 0.72, 0.47]), B(2.22, 0.06, 0.1, BRASS, [0, 0.12, 0.47]));
    const tools = G();
    const ham = G(C(0.04, 0.045, 1.1, LWOOD, [0, 0.55, 0], [0, 0, 0], 8), B(0.42, 0.13, 0.13, IRON, [0.05, 1.1, 0])); at(ham, [-0.6, 0.15, 0.1], [0.15, 0, 0.25]); tools.add(ham);
    const saw = G(B(0.5, 0.9, 0.02, metal('#c9ccd1'), [0, 0.6, 0]), B(0.14, 0.32, 0.08, RED, [0.0, 1.15, 0])); at(saw, [0.05, 0.1, -0.15], [0, 0.3, -0.1]); tools.add(saw);
    const scr = G(C(0.02, 0.02, 0.6, metal('#c9ccd1'), [0, 0.6, 0], [0, 0, 0], 6), C(0.07, 0.06, 0.32, '#e1a92b', [0, 1.0, 0], [0, 0, 0], 8)); at(scr, [0.55, 0.1, 0.15], [-0.15, 0, -0.2]); tools.add(scr);
    const wr = G(B(0.06, 0.9, 0.03, metal('#c9ccd1'), [0, 0.6, 0]), T(0.09, 0.03, metal('#c9ccd1'), [0, 1.08, 0], [0, 0, 0], PI * 1.5)); at(wr, [0.8, 0.1, -0.1], [0, 0, -0.3]); tools.add(wr);
    g.add(tools);
    return { g, update(t) { ham.position.y = 0.15 + Math.max(0, Math.sin(t * 2)) * 0.35; scr.rotation.y = t * 2; saw.position.y = 0.1 + Math.max(0, Math.sin(t * 2 + 2)) * 0.25; } };
  },

  bedesten() {
    const g = G();
    g.add(B(3.2, 0.15, 2.2, '#9c8f7c', [0, 0.075, 0]));
    g.add(B(2.8, 1.1, 1.8, '#d9c7a3', [0, 0.7, 0]));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = -0.93 + i * 0.93, z = -0.45 + j * 0.9;
      g.add(C(0.38, 0.4, 0.15, '#cdb894', [x, 1.32, z], [0, 0, 0], 8));
      g.add(m(new THREE.SphereGeometry(0.38, 12, 8, 0, PI * 2, 0, PI / 2), '#8f9aa3', [x, 1.39, z]));
      g.add(C(0.015, 0.015, 0.2, BRASS, [x, 1.85, z], [0, 0, 0], 4), S(0.04, BRASS, [x, 1.95, z], 1, 6));
    }
    for (let i = 0; i < 4; i++) {
      const x = -1.05 + i * 0.7;
      g.add(B(0.4, 0.55, 0.05, '#4a2f1d', [x, 0.43, 0.91]));
      g.add(m(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12, 1, false, 0, PI), '#4a2f1d', [x, 0.7, 0.91], [PI / 2, 0, PI / 2]));
      g.add(B(0.5, 0.05, 0.08, '#b89d6e', [x, 0.97, 0.92]));
    }
    // sergilenen kumaşlar
    const cols = [RED, '#2c5aa0', GOLD, '#7b2d8e'];
    for (let i = 0; i < 4; i++) g.add(B(0.3, 0.12, 0.25, cols[i], [-1.05 + i * 0.7, 0.21, 1.25]));
    g.add(B(3.0, 0.1, 0.4, WOOD, [0, 0.12, 1.25]));
    const sp = sparkles(8, 1.9, 1.3, '#7fdcff');
    const sp2 = sparkles(6, 1.6, 1.0, '#ff6b8a');
    g.add(sp, sp2);
    return { g, update(t) { sp.update(t); sp2.update(t * 0.8 + 3); } };
  },

  buhurdan() {
    const g = G();
    const brass = metal(BRASS);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2; g.add(C(0.04, 0.06, 0.5, brass, [Math.cos(a) * 0.35, 0.25, Math.sin(a) * 0.35], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3], 6)); }
    g.add(L([[0, 0.45], [0.42, 0.48], [0.6, 0.7], [0.62, 0.9], [0.5, 1.0], [0, 1.0]], brass));
    g.add(T(0.6, 0.04, brass, [0, 0.9, 0], [PI / 2, 0, 0]));
    g.add(L([[0, 1.62], [0.12, 1.6], [0.35, 1.4], [0.5, 1.15], [0.52, 1.0], [0, 1.0]], metal('#b98b2a')));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.add(S(0.05, '#3a2a12', [Math.cos(a) * 0.43, 1.2, Math.sin(a) * 0.43], 1, 6)); }
    g.add(K(0.1, 0.25, brass, [0, 1.75, 0], [0, 0, 0], 8), S(0.06, RED, [0, 1.92, 0], 1, 8));
    [-1, 1].forEach((sgn) => g.add(T(0.15, 0.03, brass, [sgn * 0.67, 0.85, 0], [0, 0, 0], PI * 2)));
    const smoke = rising(14, () => smokeBall('#efe9f5', 0.11), { speed: 0.25, height: 2.0, spread: 0.3, grow: 2.2, sway: 0.25, op: 0.55 });
    smoke.position.y = 1.8; g.add(smoke);
    return { g, update(t) { smoke.update(t); } };
  },

  cendere() {
    const g = G();
    g.add(B(2.0, 0.25, 1.0, DWOOD, [0, 0.125, 0]));
    [-0.8, 0.8].forEach((x) => g.add(B(0.22, 2.4, 0.3, WOOD, [x, 1.3, 0])));
    g.add(B(2.0, 0.3, 0.4, WOOD, [0, 2.45, 0]));
    g.add(L([[0, 0], [0.55, 0], [0.6, 0.2], [0.5, 0.35], [0, 0.35]], '#c4c48e', [0, 0.25, 0], [0, 0, 0], 16)); // ezilen zeytin sepeti
    for (let i = 0; i < 10; i++) g.add(S(0.07, '#4b5a1f', [Math.cos(i) * 0.35, 0.62, Math.sin(i * 1.3) * 0.25], 1, 6));
    const screw = G();
    screw.add(C(0.09, 0.09, 1.6, metal('#8c8c94'), [0, 0, 0], [0, 0, 0], 10));
    for (let i = 0; i < 12; i++) screw.add(T(0.1, 0.025, metal('#6c6c74'), [0, -0.7 + i * 0.13, 0], [PI / 2, 0, 0]));
    screw.add(C(0.04, 0.04, 1.2, DWOOD, [0, 0.62, 0], [0, 0, PI / 2], 8));
    screw.add(S(0.07, DWOOD, [0.6, 0.62, 0]), S(0.07, DWOOD, [-0.6, 0.62, 0]));
    g.add(screw);
    const plate = B(1.3, 0.15, 0.7, LWOOD); g.add(plate);
    const oil = drops(5, [0.62, 0.3, 0.3], { c: '#b5a23a', len: 0.3, speed: 0.6, r: 0.04 });
    g.add(oil);
    return { g, update(t) { const k = (Math.sin(t * 1.2) + 1) / 2; const y = 0.85 + k * 0.5; plate.position.y = y; screw.position.y = y + 0.85; screw.rotation.y = -t * 1.2 * 1.5; oil.update(t); } };
  },

  cumba() {
    const g = G();
    g.add(B(2.4, 0.1, 1.8, '#9d9488', [0, 0.05, 0]));
    g.add(B(2.0, 1.1, 1.3, '#efe1c4', [0, 0.65, 0]));
    g.add(B(0.4, 0.75, 0.05, WOOD, [0.45, 0.47, 0.66]));
    g.add(B(0.35, 0.35, 0.05, '#8fc3d9', [-0.5, 0.75, 0.66]), B(0.4, 0.05, 0.06, DWOOD, [-0.5, 0.95, 0.67]));
    g.add(B(2.2, 1.1, 1.4, '#c4703c', [0, 1.75, 0]));
    // cumba
    g.add(B(1.3, 0.9, 0.5, '#d98451', [0, 1.75, 0.92]));
    for (let i = 0; i < 3; i++) { g.add(B(0.32, 0.5, 0.04, '#9fd0e6', [-0.42 + i * 0.42, 1.8, 1.18])); g.add(B(0.04, 0.5, 0.05, '#f6f0e4', [-0.42 + i * 0.42, 1.8, 1.19])); }
    [-0.62, 0.62].forEach((x) => g.add(B(0.04, 0.5, 0.3, '#9fd0e6', [x + Math.sign(x) * 0.03, 1.8, 0.92])));
    for (let i = 0; i < 5; i++) g.add(B(0.05, 0.3, 0.05, DWOOD, [-0.55 + i * 0.275, 1.15, 1.08], [0.6, 0, 0]));
    g.add(B(1.4, 0.06, 0.6, DWOOD, [0, 1.29, 0.95]));
    g.add(B(1.45, 0.08, 0.15, '#f6f0e4', [0, 1.52, 1.22]));
    const flowers = [];
    for (let i = 0; i < 4; i++) {
      const x = -0.5 + i * 0.33;
      g.add(C(0.07, 0.05, 0.1, '#b5532c', [x, 1.61, 1.22], [0, 0, 0], 8));
      const f = G(C(0.01, 0.01, 0.16, LEAF, [0, 0.08, 0], [0, 0, 0], 4), S(0.06, ['#e8395b', '#f7c331', '#e8395b', '#ffffff'][i], [0, 0.18, 0], 1, 8));
      f.position.set(x, 1.66, 1.22); g.add(f); flowers.push(f);
    }
    const roof = K(1.85, 0.8, '#b0432a', [0, 2.7, 0.1], [0, PI / 4, 0], 4, [1, 1, 0.9]); g.add(roof);
    g.add(B(0.2, 0.4, 0.2, '#a9a097', [0.5, 2.9, -0.2]));
    return { g, update(t) { flowers.forEach((f, i) => (f.rotation.z = Math.sin(t * 2 + i) * 0.2)); } };
  },

  cerag() {
    const g = G();
    const clay = '#b8693c';
    g.add(L([[0, 0], [0.32, 0], [0.4, 0.06], [0.7, 0.18], [0.75, 0.35], [0.55, 0.45], [0.15, 0.45], [0.1, 0.5], [0, 0.5]], clay, [0, 0, 0], [0, 0, 0], 20, [1, 1, 0.8]));
    g.add(C(0.12, 0.22, 0.6, clay, [0.85, 0.32, 0], [0, 0, -PI / 2 + 0.35], 8, [1, 1, 0.7]));
    g.add(T(0.22, 0.06, clay, [-0.8, 0.35, 0], [0, 0, 0], PI * 1.2));
    g.add(T(0.17, 0.02, '#8a4b25', [0, 0.46, 0], [PI / 2, 0, 0], PI * 2));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; g.add(S(0.04, '#e3a565', [Math.cos(a) * 0.55, 0.33, Math.sin(a) * 0.45], 1, 6)); }
    g.add(C(0.02, 0.02, 0.15, '#333', [1.1, 0.48, 0], [0, 0, -0.3], 4));
    const fl = G(K(0.1, 0.45, glow('#ffb02e', 2), [0, 0.22, 0], [0, 0, 0], 8), K(0.05, 0.25, glow('#fff3b0', 2.5), [0, 0.15, 0], [0, 0, 0], 6));
    fl.position.set(1.13, 0.55, 0); g.add(fx(fl));
    const light = new THREE.PointLight('#ffb347', 3, 6); light.position.set(1.1, 1.0, 0.3); g.add(light);
    const halo = S(0.35, new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.25 }), [1.13, 0.8, 0], 1, 12); g.add(fx(halo));
    return { g, update(t) { const k = 0.85 + 0.25 * Math.sin(t * 13) * Math.sin(t * 7.3); fl.scale.set(1, k, 1); fl.rotation.z = Math.sin(t * 5) * 0.12; light.intensity = 2.4 + k; halo.scale.setScalar(0.9 + k * 0.2); } };
  },

  cikrik() {
    const g = G();
    g.add(C(0.8, 0.85, 0.8, STONE, [0, 0.4, 0], [0, 0, 0], 12));
    g.add(C(0.6, 0.6, 0.02, '#1d2b33', [0, 0.78, 0], [0, 0, 0], 12));
    g.add(T(0.7, 0.1, DSTONE, [0, 0.8, 0], [PI / 2, 0, 0]));
    [-0.85, 0.85].forEach((x) => g.add(B(0.14, 1.9, 0.14, WOOD, [x, 1.25, 0])));
    g.add(B(0.3, 0.06, 1.3, '#a33b26', [-0.5, 2.25, 0], [0, 0, 0.55]), B(0.3, 0.06, 1.3, '#a33b26', [0.5, 2.25, 0], [0, 0, -0.55]));
    g.add(B(1.7, 0.06, 1.35, '#8a2e1d', [0, 2.38, 0], [0, 0, 0], [0.12, 1, 1]));
    for (let i = -2; i <= 2; i++) g.add(B(0.62, 0.05, 1.3, '#b5452c', [i * 0.22, 2.2 + (2 - Math.abs(i)) * 0.1, 0], [0, 0, -Math.sign(i) * 0.5]));
    const axle = G(C(0.12, 0.12, 1.9, LWOOD, [0, 0, 0], [0, 0, PI / 2], 10));
    for (let i = 0; i < 5; i++) axle.add(T(0.13, 0.025, '#d8c79b', [-0.3 + i * 0.08, 0, 0], [0, PI / 2, 0]));
    const crank = G(B(0.06, 0.45, 0.06, IRON, [0, -0.22, 0]), C(0.04, 0.04, 0.3, DWOOD, [0.15, -0.42, 0], [0, 0, PI / 2], 6));
    crank.position.x = 1.0; axle.add(crank);
    axle.position.y = 1.65; g.add(axle);
    const rope = C(0.015, 0.015, 1, '#d8c79b', [-0.1, 0, 0], [0, 0, 0], 4); g.add(rope);
    const bucket = G(L([[0, 0], [0.17, 0], [0.22, 0.3], [0.2, 0.3], [0.15, 0.03], [0, 0.03]], two('#8a5a2c')), T(0.2, 0.015, IRON, [0, 0.33, 0], [0, 0, 0], PI), C(0.19, 0.19, 0.02, mat(WATER, { roughness: 0.2 }), [0, 0.25, 0], [0, 0, 0], 12));
    g.add(bucket);
    return { g, update(t) { axle.rotation.x = t * 1.5; const k = (Math.sin(t * 0.75) + 1) / 2; const by = 0.5 + k * 0.8; bucket.position.set(-0.1, by, 0); rope.position.y = (1.65 + by + 0.35) / 2; rope.scale.y = 1.65 - by - 0.35; } };
  },

  corten() {
    const g = G();
    g.add(B(2.2, 2.0, 0.8, '#c9b896', [0, 1.0, -0.4]));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) g.add(B(0.52, 0.02, 0.02, '#a8977a', [-0.82 + c * 0.55 + (r % 2) * 0.27, 0.2 + r * 0.4, 0.01]));
    g.add(B(2.4, 0.15, 1.1, '#8f7f63', [0, 2.07, -0.3]));
    g.add(B(2.5, 0.08, 1.2, '#a3402a', [0, 2.2, -0.35], [0.15, 0, 0]));
    // ejderha başlı oluk
    const dr = G();
    dr.add(B(0.3, 0.25, 0.9, '#8d8a7e', [0, 0, 0.35]));
    dr.add(B(0.38, 0.32, 0.4, '#9a978b', [0, 0.04, 0.9]));
    dr.add(B(0.3, 0.1, 0.35, '#8d8a7e', [0, -0.15, 0.95], [-0.25, 0, 0]));
    dr.add(K(0.06, 0.25, '#7d7a6f', [-0.12, 0.3, 0.8], [-0.4, 0, 0.2], 4), K(0.06, 0.25, '#7d7a6f', [0.12, 0.3, 0.8], [-0.4, 0, -0.2], 4));
    dr.add(S(0.05, glow('#e8b33a', 0.6), [-0.12, 0.13, 1.05], 1, 6), S(0.05, glow('#e8b33a', 0.6), [0.12, 0.13, 1.05], 1, 6));
    for (let i = 0; i < 4; i++) dr.add(K(0.025, 0.07, '#fff', [-0.12 + i * 0.08, -0.05, 1.12], [PI, 0, 0], 4));
    for (let i = 0; i < 4; i++) dr.add(K(0.06, 0.18, '#7d7a6f', [0, 0.15, 0.1 + i * 0.2], [-0.3, 0, 0], 4));
    at(dr, [0, 1.75, 0], [0.12, 0, 0]); g.add(dr);
    const d = drops(9, [0, 1.55, 1.15], { len: 1.5, speed: 1.0, vz: 0.35 }); g.add(d);
    g.rotation.y = -0.65;
    g.add(C(0.3, 0.35, 0.15, STONE, [0, 0.07, 1.5], [0, 0, 0], 10), C(0.25, 0.25, 0.02, mat(WATER, { roughness: 0.2 }), [0, 0.15, 1.5], [0, 0, 0], 10));
    return { g, update(t) { d.update(t); dr.rotation.x = 0.12 + Math.sin(t * 1.5) * 0.03; } };
  },

  dalyan() {
    const g = G();
    const sea = C(2.0, 2.0, 0.1, mat('#3d8fc4', { roughness: 0.3 }), [0, 0.05, 0], [0, 0, 0], 28); g.add(sea);
    const pts = [];
    for (let i = 0; i < 9; i++) pts.push([-1.6 + i * 0.25, -0.9 + i * 0.12]);
    for (let i = 0; i < 9; i++) pts.push([1.6 - i * 0.25, -0.9 + i * 0.12]);
    const chamber = [[-0.5, 0.3], [0.5, 0.3], [0.5, 1.2], [-0.5, 1.2], [0, 1.2], [-0.5, 0.75], [0.5, 0.75]];
    [...pts, ...chamber].forEach(([x, z], i) => g.add(C(0.035, 0.035, 0.8 + (i % 3) * 0.05, '#6b4a2e', [x, 0.4, z], [0, 0, 0], 5)));
    const net = mat('#e6dcc0', { wireframe: true });
    const addNet = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const len = Math.hypot(dx, dz); g.add(m(new THREE.PlaneGeometry(len, 0.55, 6, 3), net, [(a[0] + b[0]) / 2, 0.38, (a[1] + b[1]) / 2], [0, -Math.atan2(dz, dx), 0])); };
    addNet([-1.6, -0.9], [-0.5, 0.3]); addNet([1.6, -0.9], [0.5, 0.3]);
    addNet([-0.5, 0.3], [-0.5, 1.2]); addNet([0.5, 0.3], [0.5, 1.2]); addNet([-0.5, 1.2], [0.5, 1.2]);
    // kulübe
    const hut = G(B(0.05, 1.0, 0.05, DWOOD, [-0.2, 0.5, -0.2]), B(0.05, 1.0, 0.05, DWOOD, [0.2, 0.5, -0.2]), B(0.05, 1.0, 0.05, DWOOD, [-0.2, 0.5, 0.2]), B(0.05, 1.0, 0.05, DWOOD, [0.2, 0.5, 0.2]),
      B(0.6, 0.05, 0.6, WOOD, [0, 1.0, 0]), B(0.5, 0.4, 0.5, '#d9b27c', [0, 1.22, 0]), K(0.48, 0.35, '#a3402a', [0, 1.6, 0], [0, PI / 4, 0], 4));
    hut.position.set(1.2, 0, 0.9); g.add(hut);
    const boat = G(B(0.7, 0.12, 0.25, '#e9e1cf', [0, 0.14, 0]), B(0.7, 0.04, 0.27, '#2c5aa0', [0, 0.2, 0])); boat.position.set(-1.1, 0, 0.8); g.add(boat);
    const fish = [];
    for (let i = 0; i < 3; i++) { const f = G(S(0.1, metal('#b9c8d6'), [0, 0, 0], [1.8, 0.8, 0.6], 8), K(0.07, 0.12, metal('#9fb2c4'), [-0.2, 0, 0], [0, 0, PI / 2], 4)); g.add(fx(f)); fish.push(f); }
    return { g, update(t) { fish.forEach((f, i) => { const ph = frac(t * 0.45 + i / 3); const x = -0.3 + ph * 0.6; f.position.set(x, 0.1 + Math.sin(ph * PI) * 0.7, 0.6 + i * 0.2); f.rotation.z = Math.cos(ph * PI) * 0.9; f.visible = ph > 0.03 && ph < 0.97; }); boat.position.y = Math.sin(t * 1.5) * 0.03; boat.rotation.x = Math.sin(t * 1.3) * 0.05; } };
  },

  derbent() {
    const g = G();
    g.add(B(4.0, 0.12, 2.0, '#8fa96b', [0, 0.06, 0]));
    const mount = (x, h, r) => { g.add(K(r, h, '#8b8378', [x, h / 2, -0.2], [0, 0.3, 0], 6)); g.add(K(r * 0.38, h * 0.38, '#f5f5f5', [x, h * 0.81, -0.2], [0, 0.3, 0], 6)); };
    mount(-1.4, 2.4, 1.0); mount(1.45, 2.1, 0.95); mount(-0.9, 1.4, 0.7);
    g.add(B(0.5, 0.02, 2.0, '#cbb48c', [0.1, 0.13, 0]));
    const tower = G(C(0.32, 0.38, 1.4, '#c2b59b', [0, 0.7, 0], [0, 0, 0], 10));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; tower.add(B(0.1, 0.16, 0.1, '#b3a68b', [Math.cos(a) * 0.32, 1.47, Math.sin(a) * 0.32])); }
    tower.add(B(0.18, 0.28, 0.03, '#3a2a1a', [0, 0.14, 0.36]), B(0.08, 0.16, 0.03, '#3a2a1a', [0, 0.95, 0.33]));
    tower.add(C(0.015, 0.015, 0.8, IRON, [0, 1.8, 0], [0, 0, 0], 4));
    const flag = m(new THREE.PlaneGeometry(0.45, 0.28, 6, 2), two(RED), [0.23, 2.05, 0]); tower.add(flag);
    tower.position.set(0.1, 0.12, 0.2); g.add(tower);
    const pos = flag.geometry.attributes.position; const base = pos.array.slice();
    for (let i = 0; i < 4; i++) g.add(K(0.15, 0.4, '#3f7a3a', [-1.8 + i * 1.1, 0.3, 0.8], [0, 0, 0], 6));
    const walker = person('#5b6e9a', { hat: '#333' }); walker.scale.setScalar(0.35); g.add(walker);
    return { g, update(t) {
      for (let i = 0; i < pos.count; i++) { const x = base[i * 3]; pos.array[i * 3 + 2] = Math.sin(t * 6 + x * 12) * 0.05 * (x + 0.23); }
      pos.needsUpdate = true;
      const ph = frac(t * 0.12); walker.position.set(0.05, 0.13 + Math.abs(Math.sin(t * 8)) * 0.02, 0.95 - ph * 1.8); walker.rotation.y = PI;
    } };
  },

  dibek() {
    const g = G();
    g.add(L([[0, 0], [0.75, 0], [0.8, 0.15], [0.7, 0.4], [0.78, 0.9], [0.85, 1.0], [0.55, 1.0], [0.42, 0.8], [0.25, 0.55], [0, 0.5]], '#9e978c', [0, 0, 0], [0, 0, 0], 12));
    g.add(T(0.82, 0.06, '#8b8478', [0, 1.0, 0], [PI / 2, 0, 0]));
    g.add(C(0.4, 0.3, 0.02, '#4a2c17', [0, 0.75, 0], [0, 0, 0], 12));
    for (let i = 0; i < 12; i++) g.add(S(0.045, '#5a3418', [Math.cos(i * 2) * 0.25, 0.78, Math.sin(i * 1.7) * 0.25], [1, 0.7, 1.3], 6));
    const pestle = G(C(0.07, 0.07, 1.4, LWOOD, [0, 0.75, 0], [0, 0, 0], 8), C(0.16, 0.13, 0.5, WOOD, [0, 0.1, 0], [0, 0, 0], 8), S(0.16, WOOD, [0, -0.15, 0], [1, 0.6, 1], 8));
    g.add(pestle);
    for (let i = 0; i < 6; i++) { const a = i * 1.05; g.add(S(0.05, '#5a3418', [Math.cos(a) * 1.1, 0.04, Math.sin(a) * 0.9], [1, 0.7, 1.3], 6)); }
    g.add(L([[0, 0], [0.2, 0], [0.25, 0.15], [0.22, 0.17], [0, 0.03]], two('#e6e0d4'), [1.2, 0, 0.4]));
    const dust = rising(8, () => smokeBall('#7a5232', 0.05), { speed: 0.8, height: 0.6, spread: 0.6, grow: 1.5, sway: 0.2, op: 0.6 });
    dust.position.y = 0.9; g.add(dust);
    return { g, update(t) { const k = Math.abs(Math.sin(t * 2.2)); pestle.position.y = 0.75 + k * 0.7; pestle.rotation.z = Math.sin(t * 1.1) * 0.05; dust.visible = k < 0.4; dust.update(t); } };
  },

  'dokuma-tezgahi'() {
    const g = G();
    [-1.1, 1.1].forEach((x) => { g.add(B(0.14, 2.4, 0.14, WOOD, [x, 1.2, 0])); g.add(B(0.14, 0.14, 0.9, WOOD, [x, 0.07, 0])); });
    g.add(C(0.08, 0.08, 2.4, DWOOD, [0, 2.2, 0], [0, 0, PI / 2], 8), C(0.08, 0.08, 2.4, DWOOD, [0, 0.35, 0], [0, 0, PI / 2], 8));
    for (let i = 0; i < 31; i++) g.add(C(0.006, 0.006, 1.85, '#f3ead6', [-0.9 + i * 0.06, 1.27, 0], [0, 0, 0], 3));
    const cols = [RED, '#1f3f7a', GOLD, '#f3ead6', RED, '#2e6b3a', GOLD, '#1f3f7a'];
    for (let r = 0; r < 8; r++) g.add(B(1.85, 0.1, 0.03, cols[r], [0, 0.48 + r * 0.1, 0]));
    // motif
    for (let k = -1; k <= 1; k++) { g.add(B(0.18, 0.18, 0.035, '#f3ead6', [k * 0.6, 0.85, 0.005], [0, 0, PI / 4])); g.add(B(0.08, 0.08, 0.04, RED, [k * 0.6, 0.85, 0.01], [0, 0, PI / 4])); }
    const beater = G(B(2.0, 0.07, 0.08, LWOOD), B(0.05, 0.5, 0.05, LWOOD, [-0.95, 0.25, 0]), B(0.05, 0.5, 0.05, LWOOD, [0.95, 0.25, 0]));
    beater.position.set(0, 1.3, 0.1); g.add(beater);
    const shuttle = G(S(0.08, LWOOD, [0, 0, 0], [3.2, 0.7, 0.9], 8), S(0.05, RED, [0, 0.04, 0], [2, 0.6, 0.8], 6)); g.add(shuttle);
    const yarn = C(0.004, 0.004, 1, RED, [0, 0, 0], [0, 0, PI / 2], 3); g.add(fx(yarn));
    const balls = [RED, GOLD, '#1f3f7a'].map((c, i) => S(0.13, c, [-0.4 + i * 0.4, 0.13, 0.6], 1, 10)); g.add(...balls);
    return { g, update(t) {
      const x = Math.sin(t * 1.4) * 0.95; shuttle.position.set(x, 1.32 + 0.05, 0.03);
      yarn.position.set((x - 0.95) / 2, 1.37, 0.03); yarn.scale.y = Math.max(0.01, x + 0.95);
      beater.position.z = 0.1 + Math.max(0, Math.cos(t * 1.4)) * 0.12; beater.position.y = 1.15 + Math.max(0, -Math.cos(t * 2.8)) * 0.08;
    } };
  },

  'el-emegi'() {
    const g = G();
    const hoop = G(T(1.0, 0.07, LWOOD, [0, 0, 0], [0, 0, 0]), T(1.06, 0.05, WOOD, [0, 0, 0.02], [0, 0, 0]), B(0.12, 0.2, 0.18, BRASS, [0, 1.12, 0.02]));
    hoop.add(C(1.0, 1.0, 0.01, '#fbf6ea', [0, 0, 0], [PI / 2, 0, 0], 32));
    // nakış: lale
    const st = (x, y, c, r = 0) => hoop.add(B(0.07, 0.025, 0.02, c, [x, y, 0.015], [0, 0, r]));
    for (let i = 0; i < 14; i++) st(0, -0.7 + i * 0.05, '#2e7d32', PI / 2);
    for (let i = 0; i < 8; i++) { st(-0.05 - i * 0.03, -0.3 + i * 0.04, '#43a047', 0.8); st(0.05 + i * 0.03, -0.4 + i * 0.04, '#43a047', -0.8); }
    const petal = (cx, cy, rr, n, c) => { for (let i = 0; i < n; i++) { const a = (i / n) * PI * 2; st(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.3, c, a + PI / 2); } };
    petal(0, 0.3, 0.12, 12, '#d32f2f'); petal(-0.18, 0.25, 0.1, 10, '#e53935'); petal(0.18, 0.25, 0.1, 10, '#e53935');
    petal(0, 0.28, 0.05, 6, GOLD);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * PI * 2; st(Math.cos(a) * 0.82, Math.sin(a) * 0.82, i % 2 ? '#1565c0' : GOLD, a + PI / 2); }
    hoop.position.set(0, 1.25, 0); hoop.rotation.x = -0.2; g.add(hoop);
    const needle = G(C(0.012, 0.004, 0.5, metal('#d7d9dd'), [0, 0, 0], [0, 0, 0], 6), T(0.02, 0.006, metal('#d7d9dd'), [0, 0.24, 0], [0, PI / 2, 0]));
    g.add(fx(needle));
    const thread = tube([[0, 0, 0], [0.2, 0.3, 0.2], [0.5, 0.1, 0.3]], 0.008, '#d32f2f'); g.add(fx(thread));
    const spool = G(C(0.15, 0.15, 0.3, '#d32f2f', [0, 0.15, 0], [0, 0, 0], 12), C(0.2, 0.2, 0.04, LWOOD, [0, 0.02, 0], [0, 0, 0], 12), C(0.2, 0.2, 0.04, LWOOD, [0, 0.32, 0], [0, 0, 0], 12));
    spool.position.set(0.9, 0, 0.5); g.add(spool);
    g.add(at(G(C(0.15, 0.15, 0.3, '#1565c0', [0, 0.15, 0], [0, 0, 0], 12), C(0.2, 0.2, 0.04, LWOOD, [0, 0.02, 0], [0, 0, 0], 12), C(0.2, 0.2, 0.04, LWOOD, [0, 0.32, 0], [0, 0, 0], 12)), [-0.9, 0, 0.5]));
    g.add(C(0.06, 0.08, 0.6, LWOOD, [0, 0.3, -0.05], [0.2, 0, 0], 8));
    g.add(C(0.3, 0.35, 0.08, LWOOD, [0, 0.04, 0], [0, 0, 0], 12));
    return { g, update(t) { const k = Math.sin(t * 3); needle.position.set(0.12 + Math.sin(t * 0.7) * 0.15, 1.55 + 0.05, 0.05 + k * 0.25); needle.rotation.x = PI / 2 - 0.2; thread.position.copy(needle.position); thread.position.z += 0.25 * 0; } };
  },

  gonuldas() {
    const g = G();
    g.add(C(1.4, 1.5, 0.12, '#9fc47a', [0, 0.06, 0], [0, 0, 0], 20));
    const a = person('#e2703a', { scarf: '#c0392b' }); at(a, [-0.45, 0.12, 0], [0, 0.35, 0]);
    const b = person('#2f7f86', { hat: '#1b4d52' }); at(b, [0.45, 0.12, 0], [0, -0.35, 0]);
    a.userData.armR.rotation.z = -0.9; b.userData.armL.rotation.z = 0.9;
    g.add(a, b);
    const heart = m(heartGeo(0.3), mat('#e8395b', { flatShading: false, roughness: 0.4 }), [0, 1.85, 0], [0, 0, 0], 0.42); g.add(heart);
    const small = [];
    for (let i = 0; i < 5; i++) { const h = m(heartGeo(0.2), mat('#ff8fa8', { flatShading: false }), [0, 0, 0], [0, 0, 0], 0.12); g.add(fx(h)); small.push(h); }
    return { g, update(t) {
      const beat = 1 + 0.12 * Math.max(0, Math.sin(t * 5)) ** 3 + 0.06 * Math.max(0, Math.sin(t * 5 - 1.2)) ** 3;
      heart.scale.setScalar(0.42 * beat); heart.rotation.y = Math.sin(t) * 0.4;
      small.forEach((h, i) => { const ph = frac(t * 0.3 + i / 5); h.position.set(Math.sin(i * 2 + ph * 4) * 0.8, 1.2 + ph * 1.6, Math.cos(i * 3) * 0.3); h.scale.setScalar(0.12 * Math.sin(ph * PI)); });
      a.position.y = 0.12 + Math.abs(Math.sin(t * 2)) * 0.05; b.position.y = 0.12 + Math.abs(Math.sin(t * 2 + 0.5)) * 0.05;
    } };
  },

  'goz-nuru'() {
    const g = G();
    g.add(B(2.6, 0.1, 1.6, DWOOD, [0, 0.05, 0]));
    // çini karo
    const tile = G(B(1.1, 0.06, 1.1, '#f5f1e8'));
    tile.add(B(1.0, 0.065, 1.0, '#1d5fa8', [0, 0.002, 0], [0, 0, 0], [1, 1, 1]));
    tile.add(B(0.86, 0.07, 0.86, '#f5f1e8'));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; tile.add(S(0.07, i % 2 ? '#c0392b' : '#1d5fa8', [Math.cos(a) * 0.25, 0.04, Math.sin(a) * 0.25], [1, 0.3, 1.8], 6)); tile.children[tile.children.length - 1].rotation.y = -a; }
    tile.add(S(0.1, '#2e9e8f', [0, 0.04, 0], [1, 0.3, 1], 8));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => tile.add(S(0.06, '#2e9e8f', [x * 0.33, 0.04, z * 0.33], [1, 0.3, 1], 6)));
    tile.position.set(-0.15, 0.14, 0); g.add(tile);
    // fırça
    g.add(at(G(C(0.025, 0.02, 0.9, LWOOD, [0, 0, 0], [0, 0, 0], 6), K(0.03, 0.12, '#1d5fa8', [0, -0.5, 0], [PI, 0, 0], 6)), [0.85, 0.15, 0.5], [PI / 2 - 0.05, 0, 0.8]));
    // kandil
    const lamp = G(L([[0, 0], [0.2, 0], [0.25, 0.12], [0.15, 0.17], [0, 0.17]], '#b8693c'), K(0.05, 0.18, glow('#ffb02e', 2), [0.22, 0.25, 0], [0, 0, 0], 6));
    lamp.position.set(0.95, 0.1, -0.4); g.add(lamp);
    const pl = new THREE.PointLight('#ffcf80', 2, 5); pl.position.set(0.95, 0.8, -0.4); g.add(pl);
    // büyüteç
    const mag = G(T(0.38, 0.045, metal(BRASS), [0, 0, 0], [PI / 2, 0, 0]), C(0.37, 0.37, 0.02, clear('#cfefff', 0.3), [0, 0, 0], [0, 0, 0], 24), C(0.045, 0.05, 0.6, DWOOD, [0.62, 0, 0], [0, 0, PI / 2], 8));
    g.add(fx(mag));
    return { g, update(t) { mag.position.set(-0.15 + Math.cos(t * 0.8) * 0.25, 0.75 + Math.sin(t * 1.6) * 0.05, Math.sin(t * 0.8) * 0.25); mag.rotation.y = -t * 0.8 * 0.5; } };
  },

  hasbihal() {
    const g = G();
    g.add(C(1.6, 1.6, 0.06, '#b33a2a', [0, 0.03, 0], [0, 0, 0], 24));
    g.add(C(0.5, 0.6, 0.45, WOOD, [0, 0.25, 0], [0, 0, 0], 8));
    g.add(C(0.95, 0.95, 0.06, metal('#c8952b'), [0, 0.5, 0], [0, 0, 0], 28));
    g.add(T(0.95, 0.03, metal('#b8862a'), [0, 0.53, 0], [PI / 2, 0, 0]));
    // ince belli çay bardakları
    const glass = (x, z) => {
      const gg = G(L([[0, 0], [0.11, 0], [0.12, 0.05], [0.08, 0.17], [0.13, 0.32], [0.12, 0.33]], clear('#ffffff', 0.35)), L([[0, 0.01], [0.1, 0.01], [0.11, 0.05], [0.07, 0.17], [0.11, 0.27], [0, 0.27]], mat('#b3361f', { transparent: true, opacity: 0.85, flatShading: false })),
        C(0.17, 0.17, 0.02, metal('#e6e6e6'), [0, -0.01, 0], [0, 0, 0], 16));
      gg.position.set(x, 0.53, z); g.add(gg);
    };
    glass(-0.45, 0.35); glass(0.45, 0.35); glass(0.0, -0.5);
    // çaydanlık
    const pot = G(L([[0, 0], [0.32, 0], [0.38, 0.2], [0.3, 0.4], [0.14, 0.42], [0, 0.42]], metal('#d9d9de')),
      L([[0, 0.42], [0.2, 0.42], [0.25, 0.55], [0.2, 0.68], [0.08, 0.7], [0, 0.7]], metal('#e8e8ec')), S(0.05, IRON, [0, 0.74, 0], 1, 8),
      tube([[0.33, 0.15, 0], [0.5, 0.25, 0], [0.58, 0.4, 0]], 0.04, metal('#d9d9de')), tube([[-0.3, 0.35, 0], [-0.48, 0.3, 0], [-0.34, 0.05, 0]], 0.03, IRON));
    pot.position.set(0, 0.53, 0.05); g.add(pot);
    g.add(L([[0, 0], [0.18, 0], [0.22, 0.08], [0, 0.08]], metal('#c8952b'), [0.55, 0.53, -0.25]));
    for (let i = 0; i < 6; i++) g.add(B(0.07, 0.07, 0.07, '#ffffff', [0.5 + (i % 3) * 0.06, 0.6 + (i > 2) * 0.07, -0.25]));
    // minderler
    [[-1.3, 0, PI / 2], [1.3, 0, -PI / 2]].forEach(([x, z, r]) => { g.add(B(0.6, 0.18, 0.9, '#2c5aa0', [x, 0.15, z], [0, 0, 0])); g.add(B(0.18, 0.5, 0.9, '#c0392b', [x + Math.sign(x) * 0.25, 0.4, z])); });
    const steam = rising(8, () => smokeBall('#ffffff', 0.06), { speed: 0.4, height: 0.8, spread: 0.1, grow: 2, sway: 0.08, op: 0.5 });
    steam.position.set(0.58, 1.0, 0.05); g.add(steam);
    const steam2 = rising(6, () => smokeBall('#ffffff', 0.04), { speed: 0.5, height: 0.5, spread: 0.05, grow: 1.5, sway: 0.05, op: 0.4 });
    steam2.position.set(-0.45, 0.85, 0.35); g.add(steam2);
    return { g, update(t) { steam.update(t); steam2.update(t + 1); } };
  },

  heybe() {
    const g = G();
    [-0.9, 0.9].forEach((x) => { g.add(C(0.06, 0.06, 2.4, DWOOD, [x, 1.2, -0.3], [0, 0, 0], 8)); });
    g.add(C(0.07, 0.07, 2.2, DWOOD, [0, 2.3, -0.3], [0, 0, PI / 2], 8));
    const bag = G();
    const cols = [RED, '#1f3f7a', GOLD, '#f3ead6', '#2e6b3a', RED, '#1f3f7a'];
    [-1, 1].forEach((s) => {
      const side = G();
      for (let r = 0; r < 7; r++) side.add(B(0.85, 0.14, 0.32, cols[r], [0, -r * 0.14, 0]));
      side.add(B(0.87, 0.1, 0.34, '#5b2c1a', [0, 0.06, 0]));
      for (let k = 0; k < 3; k++) side.add(B(0.12, 0.12, 0.34, '#f3ead6', [-0.25 + k * 0.25, -0.42, 0], [0, 0, PI / 4]));
      for (let k = 0; k < 6; k++) side.add(C(0.015, 0.015, 0.18, cols[k % 3], [-0.36 + k * 0.145, -1.02, 0], [0, 0, 0], 4));
      side.add(B(0.85, 0.4, 0.04, cols[1], [0, -0.15, 0.17], [-0.12, 0, 0]));
      side.add(S(0.05, GOLD, [0, -0.3, 0.2], 1, 6));
      side.position.set(0, -0.25, s * 0.24); side.rotation.x = s * 0.1; bag.add(side);
    });
    bag.add(B(0.85, 0.06, 0.5, '#5b2c1a', [0, 0.02, 0]));
    bag.position.set(0, 2.38, -0.3); g.add(bag);
    return { g, update(t) { bag.rotation.z = Math.sin(t * 1.2) * 0.06; bag.rotation.x = Math.sin(t * 0.9) * 0.04; } };
  },

  ibrik() {
    const g = G();
    const cu = metal(COPPER);
    g.add(L([[0, 0], [0.38, 0], [0.42, 0.06], [0.33, 0.12], [0.55, 0.45], [0.62, 0.75], [0.5, 1.05], [0.25, 1.3], [0.2, 1.6], [0.28, 1.68], [0, 1.68]], cu, [0, 0, 0], [0, 0, 0], 24));
    g.add(T(0.62, 0.03, metal(BRASS), [0, 0.75, 0], [PI / 2, 0, 0]), T(0.34, 0.03, metal(BRASS), [0, 0.12, 0], [PI / 2, 0, 0]));
    g.add(L([[0, 1.68], [0.26, 1.68], [0.22, 1.78], [0.1, 1.85], [0, 1.85]], metal(BRASS)));
    g.add(S(0.06, metal(BRASS), [0, 1.92, 0], 1, 8));
    g.add(tube([[0.45, 0.55, 0], [0.75, 0.8, 0], [0.95, 1.25, 0], [1.1, 1.55, 0], [1.25, 1.62, 0]], 0.055, cu));
    g.add(tube([[-0.25, 1.55, 0], [-0.75, 1.55, 0], [-0.85, 1.1, 0], [-0.6, 0.6, 0]], 0.05, cu));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; g.add(S(0.04, metal(BRASS), [Math.cos(a) * 0.62, 0.62, Math.sin(a) * 0.62], [1, 1.6, 1], 6)); }
    g.add(L([[0, 0], [0.9, 0], [1.0, 0.12], [0.95, 0.14], [0.8, 0.05], [0, 0.05]], metal('#b87333'), [0, -0.12, 0]));
    const d = drops(5, [1.27, 1.55, 0], { len: 1.4, speed: 0.6, vx: 0.15 }); g.add(d);
    return { g, update(t) { d.update(t); } };
  },

  imece() {
    const g = G();
    g.add(B(3.6, 0.12, 2.0, '#9cc26b', [0, 0.06, 0]));
    // yapılan ev çatısı iskeleti
    const frame = G();
    [-0.6, 0.6].forEach((x) => [-0.4, 0.4].forEach((z) => frame.add(B(0.1, 1.2, 0.1, LWOOD, [x, 0.6, z]))));
    frame.add(B(1.4, 0.08, 0.1, LWOOD, [0, 1.2, 0.4]), B(1.4, 0.08, 0.1, LWOOD, [0, 1.2, -0.4]));
    frame.add(B(0.85, 0.08, 0.1, LWOOD, [-0.3, 1.45, 0.4], [0, 0, 0.6]), B(0.85, 0.08, 0.1, LWOOD, [0.3, 1.45, 0.4], [0, 0, -0.6]));
    frame.add(B(0.85, 0.08, 0.1, LWOOD, [-0.3, 1.45, -0.4], [0, 0, 0.6]), B(0.85, 0.08, 0.1, LWOOD, [0.3, 1.45, -0.4], [0, 0, -0.6]));
    for (let i = 0; i < 4; i++) frame.add(B(1.4, 0.4, 0.06, '#d6b98a', [0, 0.2 + i * 0.25, -0.43]));
    frame.position.set(0.9, 0.12, -0.3); g.add(frame);
    const cols = ['#e2703a', '#2f7f86', '#8e44ad', '#c0392b', '#27ae60'];
    const people = [];
    for (let i = 0; i < 5; i++) { const p = person(cols[i], { scarf: i % 2 ? '#f1c40f' : null, hat: i % 2 ? null : '#5b2c1a' }); at(p, [-1.5 + i * 0.5, 0.12, 0.55 - (i % 2) * 0.15], [0, 0.6 - i * 0.15, 0], 0.62); p.userData.armL.rotation.z = 1.2; p.userData.armR.rotation.z = -1.2; g.add(p); people.push(p); }
    const brick = B(0.25, 0.14, 0.18, '#c4703c'); g.add(fx(brick));
    g.add(B(0.6, 0.3, 0.4, '#c4703c', [-1.5, 0.27, -0.3]));
    return { g, update(t) {
      people.forEach((p, i) => { p.position.y = 0.12 + Math.abs(Math.sin(t * 3 + i)) * 0.04; p.rotation.y = 0.6 - i * 0.15 + Math.sin(t * 2 + i) * 0.2; });
      const ph = frac(t * 0.35); const idx = Math.min(4, Math.floor(ph * 5)); const f = ph * 5 - idx;
      const a = people[idx].position, b = idx < 4 ? people[idx + 1].position : new THREE.Vector3(0.9, 0.5, -0.3);
      brick.position.set(a.x + (b.x - a.x) * f, 0.78 + Math.sin(f * PI) * 0.25, a.z + (b.z - a.z) * f);
    } };
  },

  imaret() {
    const g = G();
    g.add(C(1.6, 1.6, 0.08, '#b9a58a', [0, 0.04, 0], [0, 0, 0], 20));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.add(S(0.14, '#8b8378', [Math.cos(a) * 0.6, 0.12, Math.sin(a) * 0.6], [1, 0.7, 1], 6)); }
    for (let i = 0; i < 3; i++) g.add(C(0.06, 0.06, 0.9, '#5b3a1f', [0, 0.15, 0], [PI / 2, (i / 3) * PI, 0], 6));
    const fire = flames(6, 0.9); fire.position.y = 0.1; g.add(fire);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2 + 0.5; g.add(C(0.04, 0.04, 1.2, IRON, [Math.cos(a) * 0.7, 0.55, Math.sin(a) * 0.7], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3], 6)); }
    g.add(L([[0, 0.55], [0.4, 0.58], [0.68, 0.8], [0.78, 1.1], [0.76, 1.35], [0.82, 1.4], [0.7, 1.4]], two('#3c3c42', { metalness: 0.5, roughness: 0.5 })));
    [-1, 1].forEach((sg) => g.add(T(0.12, 0.03, IRON, [sg * 0.8, 1.32, 0], [0, PI / 2, 0], PI)));
    g.add(C(0.72, 0.72, 0.02, mat('#e8a33c', { roughness: 0.4 }), [0, 1.3, 0], [0, 0, 0], 22));
    for (let i = 0; i < 9; i++) g.add(S(0.05, i % 2 ? '#f6d26a' : '#7cbf4a', [Math.cos(i * 2.3) * 0.45, 1.32, Math.sin(i * 1.9) * 0.45], [1, 0.4, 1], 6));
    g.add(tube([[0.2, 1.3, 0.1], [0.5, 1.8, 0.2], [0.65, 2.0, 0.25]], 0.025, metal('#b0b0b5')));
    // kaseler
    for (let i = 0; i < 4; i++) g.add(L([[0, 0], [0.12, 0], [0.22, 0.12], [0.2, 0.13], [0, 0.03]], two('#2c5aa0'), [1.25, 0.08 + i * 0.07, 0.5]));
    const bowl = G(L([[0, 0], [0.12, 0], [0.22, 0.12], [0.2, 0.13], [0, 0.03]], two('#2c5aa0')), C(0.18, 0.18, 0.02, '#e8a33c', [0, 0.09, 0], [0, 0, 0], 12)); bowl.position.set(-1.2, 0.08, 0.6); g.add(bowl);
    g.add(B(0.2, 0.08, 0.12, '#d9a95b', [-1.2, 0.12, 0.95]));
    const steam = rising(12, () => smokeBall('#ffffff', 0.09), { speed: 0.3, height: 1.4, spread: 0.5, grow: 2, sway: 0.3, op: 0.5 });
    steam.position.y = 1.4; g.add(steam);
    return { g, update(t) { fire.update(t); steam.update(t); } };
  },

  kaftan() {
    const g = G();
    g.add(C(0.6, 0.7, 0.1, DWOOD, [0, 0.05, 0], [0, 0, 0], 12));
    g.add(C(0.04, 0.04, 2.6, DWOOD, [0, 1.3, 0], [0, 0, 0], 8));
    const robe = G();
    const cr = mat('#8e1b3a', { roughness: 0.55 });
    robe.add(L([[0.95, 0], [0.85, 0.5], [0.65, 1.2], [0.48, 1.7], [0.42, 1.95], [0.2, 2.05], [0.0, 2.08]], two('#8e1b3a', { roughness: 0.55 }), [0, 0, 0], [0, 0, 0], 24, [1, 1, 0.6]));
    // altın sırma şeritler
    for (let i = 0; i < 2; i++) robe.add(B(0.06, 2.0, 0.02, metal(GOLD), [i ? 0.07 : -0.07, 1.0, 0.0], [0, 0, 0], [1, 1, 1]));
    const front = G(); robe.add(front);
    const zfront = (y) => { const rx = y < 0.5 ? 0.95 - y * 0.2 : y < 1.2 ? 0.85 - (y - 0.5) * 0.286 : 0.65 - (y - 1.2) * 0.34; return rx * 0.6; };
    for (let i = 0; i < 9; i++) { const y = 0.15 + i * 0.2; const z = zfront(y) + 0.01; robe.add(S(0.04, metal(GOLD), [0, y, z], 1, 6)); robe.add(B(0.3, 0.025, 0.02, metal(GOLD), [0, y, z])); }
    for (let i = 0; i < 6; i++) { const y = 0.25 + i * 0.32; const z = zfront(y); [-1, 1].forEach((s) => robe.add(m(new THREE.OctahedronGeometry(0.07), metal(GOLD), [s * 0.35, y, z * 0.9], [0, 0, 0], [1, 1.4, 0.4]))); }
    robe.add(B(1.7, 0.06, 1.0, metal(GOLD), [0, 0.03, 0], [0, 0, 0], [1, 1, 0.65]));
    // kollar
    [-1, 1].forEach((s) => { const arm = G(C(0.18, 0.28, 1.1, cr, [0, -0.55, 0], [0, 0, 0], 10), T(0.27, 0.035, metal(GOLD), [0, -1.08, 0], [PI / 2, 0, 0])); arm.position.set(s * 0.42, 1.9, 0); arm.rotation.z = s * 0.45; robe.add(arm); });
    robe.add(T(0.2, 0.05, metal(GOLD), [0, 2.03, 0], [PI / 2, 0, 0]));
    robe.add(B(0.9, 0.12, 0.62, metal(GOLD), [0, 1.18, 0], [0, 0, 0]));
    robe.position.y = 0.12; g.add(robe);
    g.add(C(0.1, 0.12, 0.25, '#e7d3b0', [0, 2.3, 0], [0, 0, 0], 8));
    g.add(L([[0, 0], [0.2, 0], [0.24, 0.2], [0.22, 0.45], [0.12, 0.6], [0, 0.62]], '#f2efe8', [0, 2.42, 0]));
    g.add(S(0.06, '#d63c5e', [0, 2.75, 0.18], 1, 8), C(0.01, 0.01, 0.25, '#fff', [0, 2.9, 0.15], [0.3, 0, 0], 4));
    const sp = sparkles(6, 1.0, 1.3); g.add(sp);
    return { g, update(t) { robe.rotation.y = Math.sin(t * 0.8) * 0.12; sp.update(t); } };
  },

  karakovan() {
    const g = G();
    g.add(C(0.9, 0.9, 0.12, WOOD, [0, 0.3, 0], [0, 0, 0], 16));
    [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([x, z]) => g.add(C(0.06, 0.06, 0.3, DWOOD, [x, 0.15, z], [0, 0, 0], 6)));
    const straw = ['#d9a441', '#c8912f'];
    for (let i = 0; i < 9; i++) { const y = 0.42 + i * 0.13; const r = 0.75 * Math.cos((i / 9) * PI / 2.1); g.add(T(Math.max(0.08, r), 0.08, straw[i % 2], [0, y, 0], [PI / 2, 0, 0])); }
    g.add(S(0.1, straw[0], [0, 1.6, 0], 1, 8));
    g.add(C(0.13, 0.13, 0.05, '#2a1a08', [0, 0.47, 0.76], [PI / 2, 0, 0], 10));
    for (let i = 0; i < 4; i++) g.add(T(0.62 * Math.cos(((i + 1) / 9) * PI / 2.1) + 0.07, 0.02, '#8a6224', [0, 0.5 + i * 0.26, 0], [PI / 2, 0, 0]));
    // bal damlası
    g.add(S(0.12, mat('#f0a500', { roughness: 0.2, transparent: true, opacity: 0.9 }), [0.6, 0.42, 0.5], [1, 0.6, 1], 10));
    for (let i = 0; i < 5; i++) g.add(K(0.15, 0.5, LEAF, [-1.0 + i * 0.5, 0.25, -0.9 + (i % 2) * 0.2], [0, 0, 0], 5));
    for (let i = 0; i < 5; i++) g.add(S(0.07, ['#f7f7f7', '#f7c331', '#e8395b'][i % 3], [-1.0 + i * 0.5, 0.55, -0.9 + (i % 2) * 0.2], 1, 6));
    const bees = [];
    for (let i = 0; i < 6; i++) {
      const b = G(S(0.07, '#f2c12e', [0, 0, 0], [1.4, 1, 1], 8), C(0.073, 0.073, 0.03, '#222', [0.02, 0, 0], [0, 0, PI / 2], 10), C(0.066, 0.066, 0.03, '#222', [-0.06, 0, 0], [0, 0, PI / 2], 10),
        S(0.06, clear('#ffffff', 0.7), [0, 0.07, 0.05], [1, 0.3, 1.4], 6), S(0.06, clear('#ffffff', 0.7), [0, 0.07, -0.05], [1, 0.3, 1.4], 6));
      g.add(fx(b)); bees.push(b);
    }
    return { g, update(t) { bees.forEach((b, i) => { const a = t * (0.8 + i * 0.12) + i; const r = 0.95 + Math.sin(t + i) * 0.25; b.position.set(Math.cos(a) * r, 0.8 + Math.sin(a * 2 + i) * 0.4 + i * 0.08, Math.sin(a) * r); b.rotation.y = -a; }); } };
  },

  karasaban() {
    const g = G();
    g.add(B(3.4, 0.15, 1.4, '#7a5232', [0, 0.075, 0]));
    for (let i = 0; i < 5; i++) g.add(B(1.6, 0.08, 0.12, '#5f3e24', [-0.8, 0.17, -0.5 + i * 0.25]));
    for (let i = 0; i < 6; i++) g.add(K(0.04, 0.2, LEAF, [-1.5 + (i % 3) * 0.3, 0.27, -0.5 + Math.floor(i / 3) * 0.5], [0, 0, 0], 4));
    const plow = G();
    plow.add(B(2.4, 0.13, 0.13, WOOD, [0.2, 0.75, 0], [0, 0, 0.32]));
    plow.add(B(0.14, 0.9, 0.12, DWOOD, [-0.7, 0.45, 0], [0, 0, -0.35]));
    plow.add(B(0.6, 0.12, 0.14, WOOD, [-0.65, 0.12, 0]));
    plow.add(K(0.1, 0.4, metal('#8c8c94'), [-1.05, 0.12, 0], [0, 0, PI / 2], 4));
    plow.add(B(0.12, 1.1, 0.12, WOOD, [-0.35, 0.95, 0], [0, 0, 0.5]));
    plow.add(C(0.04, 0.04, 0.5, LWOOD, [-0.62, 1.42, 0], [PI / 2, 0, 0], 6));
    plow.add(B(0.12, 0.7, 0.12, DWOOD, [1.55, 1.15, 0], [0, 0, 0]));
    plow.add(C(0.06, 0.06, 1.3, LWOOD, [1.55, 1.4, 0], [PI / 2, 0, 0], 8));
    [-0.4, 0.4].forEach((z) => plow.add(T(0.15, 0.025, LWOOD, [1.55, 1.27, z], [0, PI / 2, 0], PI)));
    plow.position.set(0.1, 0.15, 0.2); g.add(plow);
    const dirt = rising(6, () => S(0.05, '#5f3e24', [0, 0, 0], 1, 5), { speed: 0.7, height: 0.4, spread: 0.4, grow: 0.5, sway: 0.15 });
    dirt.position.set(-1.0, 0.2, 0.2); g.add(dirt);
    return { g, update(t) { plow.rotation.z = Math.sin(t * 2) * 0.03; plow.position.x = 0.1 + Math.sin(t * 0.8) * 0.15; dirt.update(t); dirt.position.x = plow.position.x - 1.1; } };
  },

  kirba() {
    const g = G();
    const lea = mat('#8b5a2b', { roughness: 0.9 });
    const bag = G(S(0.75, lea, [0, 0, 0], [1.25, 0.85, 0.6], 14));
    bag.add(S(0.25, lea, [0.95, 0.22, 0], [1, 0.7, 0.7], 10));
    bag.add(C(0.13, 0.17, 0.4, lea, [1.2, 0.45, 0], [0, 0, -0.9], 10));
    bag.add(T(0.15, 0.04, '#5c3a1a', [1.32, 0.56, 0], [0, PI / 2, -0.9]));
    bag.add(C(0.1, 0.12, 0.18, '#d9b27c', [1.42, 0.62, 0], [0, 0, -0.9], 8));
    [-1, 1].forEach((s) => { bag.add(C(0.12, 0.16, 0.35, lea, [s * 0.55, -0.55, 0.15], [0.3, 0, s * 0.4], 8)); });
    for (let i = 0; i < 12; i++) bag.add(B(0.02, 0.07, 0.02, '#e8d5a8', [-0.8 + i * 0.14, 0.02 + Math.sin(i * 0.4) * 0.05, 0.44]));
    bag.add(tube([[1.2, 0.42, 0.12], [1.0, 0.0, 0.5], [0.6, -0.6, 0.7], [0.2, -0.72, 0.9]], 0.03, '#5c3a1a'));
    bag.add(T(0.16, 0.035, '#d9b27c', [1.17, 0.4, 0], [0, PI / 2, -0.9]));
    bag.position.y = 0.75; g.add(bag);
    const d = drops(5, [1.5, 1.37, 0], { len: 1.4, speed: 0.7, vx: 0.2 }); g.add(d);
    g.add(C(0.28, 0.32, 0.03, mat(WATER, { roughness: 0.2, transparent: true, opacity: 0.8 }), [1.7, 0.02, 0], [0, 0, 0], 16));
    return { g, update(t) { bag.rotation.z = Math.sin(t * 1.3) * 0.05; bag.scale.set(1 + Math.sin(t * 2) * 0.015, 1 - Math.sin(t * 2) * 0.015, 1); d.update(t); } };
  },

  koruk() {
    const g = G();
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.15); shape.lineTo(0.9, -0.5); shape.quadraticCurveTo(1.45, -0.55, 1.45, 0); shape.quadraticCurveTo(1.45, 0.55, 0.9, 0.5); shape.lineTo(0, 0.15); shape.lineTo(0, -0.15);
    const paddleGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
    paddleGeo.rotateX(PI / 2);
    const bellows = G();
    const bottom = m(paddleGeo, WOOD); bottom.position.y = 0; bellows.add(bottom);
    const topP = G(m(paddleGeo, LWOOD)); bellows.add(topP);
    topP.add(B(0.4, 0.04, 0.1, BRASS, [0.85, 0.02, 0])); topP.add(S(0.06, metal(BRASS), [0.8, 0.06, 0], 1, 6));
    const handleT = G(B(0.6, 0.06, 0.14, DWOOD, [1.7, 0.0, 0])); topP.add(handleT);
    bellows.add(B(0.6, 0.06, 0.14, DWOOD, [1.7, -0.03, 0]));
    const leather = S(0.5, mat('#7a4a25', { roughness: 0.95 }), [0.85, 0.15, 0], [1.25, 0.3, 0.9], 12); bellows.add(leather);
    bellows.add(K(0.08, 0.6, metal(BRASS), [-0.28, 0.03, 0], [0, 0, PI / 2], 8));
    bellows.position.set(0, 0.9, 0); g.add(bellows);
    // ocak & ateş
    g.add(C(0.5, 0.6, 0.6, '#8b8378', [-1.25, 0.3, 0], [0, 0, 0], 8));
    g.add(C(0.4, 0.4, 0.02, '#2b2b2b', [-1.25, 0.61, 0], [0, 0, 0], 8));
    for (let i = 0; i < 6; i++) g.add(B(0.14, 0.1, 0.1, glow('#ff5a1a', 1.0), [-1.25 + Math.cos(i) * 0.2, 0.66, Math.sin(i * 1.7) * 0.2], [0, i, 0]));
    const fire = flames(5, 0.8); fire.position.set(-1.25, 0.62, 0); g.add(fire);
    const puffs = [];
    for (let i = 0; i < 5; i++) { const p = smokeBall('#ffffff', 0.06); g.add(fx(p)); puffs.push(p); }
    return { g, update(t) {
      const k = (Math.sin(t * 2.5) + 1) / 2; topP.position.y = 0.06 + k * 0.4; topP.rotation.z = k * 0.28; leather.scale.set(1.25, 0.3 + k * 0.9, 0.9); leather.position.y = 0.05 + k * 0.2;
      const blow = Math.max(0, -Math.cos(t * 2.5));
      fire.scale.setScalar(0.8 + blow * 0.7); fire.update(t);
      puffs.forEach((p, i) => { const ph = frac(t * 1.2 + i / 5); p.position.set(-0.6 - ph * 0.5, 0.92 - ph * 0.2, 0); p.material.opacity = 0.5 * (1 - ph) * blow; });
    } };
  },

  mihman() {
    const g = G();
    g.add(B(3.0, 0.1, 2.0, '#b9a58a', [0, 0.05, 0]));
    g.add(B(3.0, 2.6, 0.2, '#f0e2c6', [0, 1.35, -0.6]));
    g.add(B(1.2, 2.0, 0.22, glow('#ffd98a', 0.9), [0, 1.08, -0.6]));
    g.add(B(1.4, 0.12, 0.3, DWOOD, [0, 2.12, -0.55]), B(0.12, 2.1, 0.3, DWOOD, [-0.66, 1.08, -0.55]), B(0.12, 2.1, 0.3, DWOOD, [0.66, 1.08, -0.55]));
    g.add(m(new THREE.CylinderGeometry(0.66, 0.66, 0.3, 16, 1, false, 0, PI), DWOOD, [0, 2.12, -0.55], [PI / 2, 0, PI / 2], [1, 1, 0.45]));
    const door = G(B(1.15, 1.95, 0.08, WOOD, [0.575, 0, 0]));
    for (let i = 0; i < 2; i++) door.add(B(0.85, 0.7, 0.03, DWOOD, [0.575, -0.45 + i * 0.95, 0.05]));
    door.add(S(0.06, metal(BRASS), [1.0, 0, 0.08], 1, 8), T(0.08, 0.015, metal(BRASS), [0.575, 0.6, 0.08], [0, 0, 0]));
    door.position.set(-0.6, 1.08, -0.45); g.add(door);
    // hoş geldin paspası ve terlikler
    g.add(B(1.2, 0.03, 0.6, RED, [0, 0.12, 0.2]));
    for (let i = 0; i < 6; i++) g.add(B(0.1, 0.035, 0.5, GOLD, [-0.45 + i * 0.18, 0.12, 0.2]));
    const slipper = (x, c) => g.add(at(G(S(0.13, c, [0, 0, 0], [0.8, 0.25, 1.6], 8), S(0.1, c, [0, 0.05, -0.08], [0.9, 0.5, 1], 8)), [x, 0.14, 0.75]));
    slipper(-0.35, '#2c5aa0'); slipper(-0.1, '#2c5aa0'); slipper(0.25, '#c0392b'); slipper(0.5, '#c0392b');
    // içeride ikram
    g.add(C(0.35, 0.35, 0.04, metal('#c8952b'), [-0.95, 0.6, 0.3], [0, 0, 0], 16), C(0.06, 0.08, 0.5, DWOOD, [-0.95, 0.35, 0.3], [0, 0, 0], 8));
    for (let i = 0; i < 5; i++) g.add(B(0.08, 0.08, 0.08, i % 2 ? '#f6c1cf' : '#ffffff', [-1.05 + (i % 3) * 0.1, 0.66, 0.25 + (i > 2) * 0.1]));
    for (let i = 0; i < 2; i++) g.add(C(0.18, 0.2, 0.7, '#3f8a3a', [1.2, 0.45, -0.25 + i * 0.6], [0, 0, 0], 8), S(0.3, '#e8395b', [1.2, 0.95, -0.25 + i * 0.6], 1, 8));
    const pl = new THREE.PointLight('#ffcf80', 2.5, 5); pl.position.set(0, 1.2, 0); g.add(pl);
    return { g, update(t) { door.rotation.y = -(0.4 + (Math.sin(t * 0.7) + 1) * 0.55); } };
  },

  muhur() {
    const g = G();
    g.add(B(2.2, 0.04, 1.5, '#f2e6c9', [0, 0.02, 0], [0, 0.1, 0]));
    for (let i = 0; i < 6; i++) g.add(B(1.4 - (i % 3) * 0.3, 0.005, 0.03, '#6b5a45', [-0.2, 0.045, -0.55 + i * 0.13], [0, 0.1, 0]));
    const wax = G(C(0.33, 0.36, 0.06, mat('#b0182b', { roughness: 0.35 }), [0, 0.03, 0], [0, 0, 0], 14));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; wax.add(S(0.08, mat('#b0182b', { roughness: 0.35 }), [Math.cos(a) * 0.33, 0.02, Math.sin(a) * 0.33], [1, 0.4, 1], 6)); }
    const emblem = G(); for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; emblem.add(K(0.05, 0.18, mat('#8a0f20'), [Math.cos(a) * 0.12, 0.07, Math.sin(a) * 0.12], [PI / 2, 0, -a + PI / 2], 3, [1, 1, 0.3])); }
    emblem.add(C(0.05, 0.05, 0.02, mat('#8a0f20'), [0, 0.07, 0], [0, 0, 0], 8)); wax.add(emblem);
    wax.position.set(0.5, 0.04, 0.25); g.add(wax);
    const seal = G(C(0.3, 0.3, 0.12, metal(BRASS), [0, 0.06, 0], [0, 0, 0], 16), L([[0.0, 0.12], [0.2, 0.12], [0.1, 0.35], [0.12, 0.7], [0.22, 0.95], [0.18, 1.1], [0, 1.15]], WOOD));
    seal.add(T(0.2, 0.03, metal(BRASS), [0, 0.17, 0], [PI / 2, 0, 0]));
    g.add(seal);
    const candle = G(C(0.1, 0.1, 0.5, '#f4e6c4', [0, 0.25, 0], [0, 0, 0], 10), K(0.04, 0.12, glow('#ffb02e', 2), [0, 0.57, 0], [0, 0, 0], 6), C(0.2, 0.24, 0.05, metal(BRASS), [0, 0.02, 0], [0, 0, 0], 12));
    candle.position.set(-0.8, 0.04, 0.3); g.add(candle);
    return { g, update(t) {
      const ph = frac(t * 0.35);
      const lift = ph < 0.4 ? 1 - ph / 0.4 : ph < 0.55 ? 0 : (ph - 0.55) / 0.45;
      seal.position.set(0.5, 0.08 + lift * 1.0, 0.25); seal.rotation.y = lift * 0.6;
      emblem.visible = ph > 0.42 || ph < 0.02; wax.scale.set(1 + (ph > 0.4 && ph < 0.55 ? 0.08 : 0), 1, 1 + (ph > 0.4 && ph < 0.55 ? 0.08 : 0));
    } };
  },

  nal() {
    const g = G();
    const shoe = G();
    const geo = new THREE.TorusGeometry(0.8, 0.17, 6, 30, PI * 1.45);
    const st0 = PI * 0.775, arc = PI * 1.45;
    const ring = m(geo, metal('#7c7f87'), [0, 0, 0], [0, 0, st0], [1, 1, 0.55]); shoe.add(ring);
    for (let i = 0; i < 8; i++) { const a = st0 + 0.3 + (i / 7) * (arc - 0.6); shoe.add(B(0.1, 0.05, 0.2, '#2b2b2b', [Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0], [0, 0, a])); }
    [st0, st0 + arc].forEach((a) => shoe.add(B(0.2, 0.36, 0.22, metal('#6c6f77'), [Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0], [0, 0, a])));
    shoe.rotation.x = 0; shoe.position.y = 1.2; g.add(shoe);
    const nails = G();
    for (let i = 0; i < 4; i++) nails.add(at(G(C(0.02, 0.005, 0.35, metal('#9a9ca3'), [0, 0, 0], [0, 0, 0], 4), B(0.08, 0.04, 0.06, metal('#9a9ca3'), [0, 0.18, 0])), [-0.5 + i * 0.3, 0.05, 0.6], [PI / 2, 0, 0.3 * i]));
    g.add(nails);
    g.add(L([[0, 0], [0.5, 0], [0.55, 0.05], [0.5, 0.1], [0, 0.1]], '#c9b896', [0, 0, -0.2]));
    const sp = sparkles(7, 1.2, 1.2); g.add(sp);
    return { g, update(t) { shoe.rotation.y = Math.sin(t * 0.8) * 0.9; shoe.position.y = 1.25 + Math.sin(t * 2) * 0.12; sp.update(t); } };
  },

  ney() {
    const g = G();
    const ney = G();
    const reed = mat('#d8b26e', { roughness: 0.6 });
    ney.add(C(0.09, 0.1, 3.2, reed, [0, 0, 0], [0, 0, 0], 12));
    for (let i = 0; i < 9; i++) ney.add(T(0.1, 0.022, '#b8904e', [0, -1.5 + i * 0.36, 0], [PI / 2, 0, 0]));
    ney.add(C(0.085, 0.07, 0.25, '#2b2b2b', [0, 1.72, 0], [0, 0, 0], 12));
    ney.add(T(0.1, 0.03, metal('#c0c0c8'), [0, 1.58, 0], [PI / 2, 0, 0]), T(0.1, 0.03, metal('#c0c0c8'), [0, -1.58, 0], [PI / 2, 0, 0]));
    for (let i = 0; i < 6; i++) ney.add(C(0.03, 0.03, 0.04, '#3a2510', [0, -0.95 + i * 0.22 + (i > 2 ? 0.15 : 0), 0.085], [PI / 2, 0, 0], 8));
    ney.add(C(0.03, 0.03, 0.04, '#3a2510', [0, -0.6, -0.085], [PI / 2, 0, 0], 8));
    ney.rotation.z = -0.55; ney.position.y = 1.5; g.add(ney);
    const notes = [];
    for (let i = 0; i < 6; i++) { const n = note(i % 2 ? '#2f7f86' : '#8e1b3a'); g.add(fx(n)); notes.push(n); }
    return { g, update(t) {
      ney.rotation.y = Math.sin(t * 0.6) * 0.2;
      notes.forEach((n, i) => { const ph = frac(t * 0.3 + i / 6); n.position.set(-0.9 - ph * 0.8 + Math.sin(ph * 8 + i) * 0.15, 2.8 + ph * 0.9, Math.cos(i) * 0.3); n.rotation.z = Math.sin(t * 2 + i) * 0.3; n.scale.setScalar(Math.sin(ph * PI) * 1.4); });
    } };
  },

  ors() {
    const g = G();
    g.add(C(0.55, 0.65, 0.9, DWOOD, [0, 0.45, 0], [0, 0, 0], 10));
    const iron = metal('#3e4047');
    g.add(B(0.6, 0.3, 0.6, iron, [0, 1.05, 0]));
    g.add(B(0.4, 0.35, 0.4, iron, [0, 1.35, 0]));
    g.add(B(1.3, 0.3, 0.6, iron, [0, 1.65, 0]));
    g.add(K(0.28, 0.9, iron, [1.08, 1.68, 0], [0, 0, -PI / 2], 8, [1, 1, 0.8]));
    g.add(B(0.25, 0.25, 0.5, iron, [-0.75, 1.68, 0]));
    const bar = B(0.9, 0.08, 0.1, glow('#ff6a1a', 1.5), [0.1, 1.84, 0]); g.add(bar);
    const ham = G(C(0.04, 0.05, 1.0, LWOOD, [0.5, 0, 0], [0, 0, PI / 2], 8), B(0.18, 0.3, 0.18, metal('#55575e'), [0, 0, 0]));
    g.add(ham);
    const sparks = [];
    for (let i = 0; i < 14; i++) { const s = B(0.03, 0.03, 0.08, glow(i % 2 ? '#ffd84d' : '#ff8a1a', 2)); g.add(fx(s)); sparks.push(s); }
    const tong = G(B(0.9, 0.04, 0.04, IRON, [0.45, 0.02, 0.03]), B(0.9, 0.04, 0.04, IRON, [0.45, -0.02, -0.03])); tong.position.set(0.55, 1.84, 0); g.add(tong);
    g.add(C(0.3, 0.3, 0.5, '#4a4a4a', [-1.2, 0.25, 0.4], [0, 0, 0], 12), C(0.28, 0.28, 0.02, mat(WATER), [-1.2, 0.5, 0.4], [0, 0, 0], 12));
    return { g, update(t) {
      const ph = frac(t * 0.9);
      const lift = ph < 0.75 ? Math.sin((ph / 0.75) * PI / 2) : 1 - (ph - 0.75) / 0.25;
      ham.position.set(-0.1, 2.02 + lift * 0.9, 0); ham.rotation.z = lift * 0.6;
      const hit = ph < 0.35 ? ph / 0.35 : 2;
      sparks.forEach((s, i) => { const a = i * 2.4; const sp = 1.2 + (i % 4) * 0.3; s.position.set(-0.1 + Math.cos(a) * hit * sp * 0.5, 1.9 + hit * 0.9 - hit * hit * 0.7, Math.sin(a) * hit * sp * 0.4); s.visible = hit < 1; s.rotation.set(a, a, 0); });
    } };
  },

  parsomen() {
    const g = G();
    g.add(B(2.6, 0.08, 1.4, DWOOD, [0, 0.04, 0]));
    const parch = mat('#efdcae', { roughness: 0.9, side: THREE.DoubleSide });
    const roll = () => G(C(0.16, 0.16, 1.1, parch, [0, 0, 0], [PI / 2, 0, 0], 14), C(0.04, 0.04, 1.4, WOOD, [0, 0, 0], [PI / 2, 0, 0], 8), S(0.07, WOOD, [0, 0, 0.72], 1, 8), S(0.07, WOOD, [0, 0, -0.72], 1, 8));
    const left = roll(); left.position.set(-0.95, 0.24, 0); g.add(left);
    const right = roll(); g.add(right);
    const sheet = m(new THREE.PlaneGeometry(1, 1.05), parch, [0, 0.09, 0], [-PI / 2, 0, 0]); g.add(sheet);
    const lines = [];
    for (let i = 0; i < 7; i++) { const l = B(1, 0.005, 0.03, '#5b3a1f', [0, 0.1, -0.38 + i * 0.12]); g.add(l); lines.push(l); }
    // tüy kalem ve hokka
    g.add(L([[0, 0], [0.15, 0], [0.17, 0.2], [0.09, 0.26], [0, 0.26]], '#1d2a4a', [0.95, 0.08, -0.5]));
    const quill = G(C(0.012, 0.012, 1.0, '#f4f1ea', [0, 0, 0], [0, 0, 0], 4), S(0.12, '#f4f1ea', [0, 0.2, 0], [0.5, 2.6, 0.1], 8));
    quill.position.set(0.95, 0.65, -0.5); quill.rotation.set(0.1, 0, -0.35); g.add(quill);
    return { g, update(t) {
      const k = (Math.sin(t * 0.8) + 1) / 2; const w = 0.35 + k * 1.3;
      const x0 = -0.95 + 0.1, x1 = x0 + w;
      right.position.set(x1 + 0.1, 0.24, 0); right.rotation.z = -w * 5;
      left.rotation.z = 0;
      sheet.scale.x = w; sheet.position.x = x0 + w / 2;
      lines.forEach((l, i) => { const len = Math.max(0.01, Math.min(w - 0.15, (i % 3 === 2 ? 0.8 : 1.3))); l.scale.x = len; l.position.x = x0 + 0.08 + len / 2; l.visible = w > 0.3; });
    } };
  },

  pusula() {
    const g = G();
    const br = metal(BRASS);
    g.add(L([[0, 0], [0.95, 0], [1.05, 0.08], [1.05, 0.28], [0.98, 0.32], [0, 0.32]], br, [0, 0, 0], [0, 0, 0], 32));
    g.add(C(0.92, 0.92, 0.02, '#f6f0e1', [0, 0.32, 0], [0, 0, 0], 32));
    for (let i = 0; i < 32; i++) { const a = (i / 32) * PI * 2; const long = i % 4 === 0; g.add(B(0.015, 0.01, long ? 0.12 : 0.06, '#3a3a3a', [Math.cos(a) * (0.82 - (long ? 0.03 : 0)), 0.335, Math.sin(a) * (0.82 - (long ? 0.03 : 0))], [0, -a + PI / 2, 0])); }
    // gül
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; const len = i % 2 ? 0.35 : 0.62; g.add(K(0.07, len, i % 2 ? '#7aa6c2' : '#1d3f6a', [Math.cos(a) * len / 2, 0.335, Math.sin(a) * len / 2], [PI / 2, 0, -a - PI / 2], 3, [1, 1, 0.15])); }
    g.add(K(0.14, 0.25, mat(RED), [0, 0.335, -0.88], [-PI / 2, 0, 0], 3, [1, 1, 0.15]));
    g.add(T(1.0, 0.04, br, [0, 0.33, 0], [PI / 2, 0, 0]));
    const needle = G(K(0.06, 0.65, mat(RED, { metalness: 0.3 }), [0, 0, -0.325], [-PI / 2, 0, 0], 4, [1, 1, 0.4]), K(0.06, 0.65, mat('#e8e8e8', { metalness: 0.3 }), [0, 0, 0.325], [PI / 2, 0, 0], 4, [1, 1, 0.4]), C(0.05, 0.05, 0.05, br, [0, 0.02, 0], [0, 0, 0], 10));
    needle.position.y = 0.4; g.add(needle);
    g.add(m(new THREE.SphereGeometry(0.95, 24, 10, 0, PI * 2, 0, PI / 2), clear('#dff4ff', 0.18), [0, 0.32, 0], [0, 0, 0], [1, 0.25, 1]));
    g.add(at(G(T(0.15, 0.04, br, [0, 0, 0], [0, 0, 0]), C(0.08, 0.08, 0.15, br, [0, -0.15, 0], [0, 0, 0], 8)), [0, 0.2, 1.17], [0, 0, 0]));
    const lid = G(C(1.02, 1.02, 0.08, br, [0, 0, 0], [0, 0, 0], 32), C(0.8, 0.8, 0.09, metal('#b98b2a'), [0, 0, 0], [0, 0, 0], 8));
    lid.position.set(0, 0.95, -1.3); lid.rotation.x = PI / 2 - 0.35; g.add(lid);
    let last = 0;
    return { g, update(t) {
      const cyc = frac(t / 6); const tt = cyc * 6;
      needle.rotation.y = 1.6 * Math.exp(-tt * 0.8) * Math.cos(tt * 4.5);
    } };
  },

  'sadaka-tasi'() {
    const g = G();
    g.add(C(1.0, 1.1, 0.15, '#b9a58a', [0, 0.075, 0], [0, 0, 0], 8));
    g.add(C(0.55, 0.65, 0.25, '#cfc6b5', [0, 0.27, 0], [0, 0, 0], 8));
    g.add(C(0.38, 0.44, 1.7, '#ddd5c4', [0, 1.25, 0], [0, 0, 0], 8));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2 + PI / 8; g.add(B(0.02, 1.5, 0.04, '#c4bba8', [Math.cos(a) * 0.4, 1.25, Math.sin(a) * 0.4], [0, -a, 0])); }
    g.add(L([[0, 2.0], [0.42, 2.05], [0.55, 2.2], [0.55, 2.3], [0.45, 2.3], [0.35, 2.18], [0, 2.15]], '#cfc6b5', [0, 0, 0], [0, 0, 0], 8));
    g.add(T(0.3, 0.04, '#b5ab97', [0, 1.6, 0], [PI / 2, 0, 0]));
    g.add(B(0.3, 0.3, 0.03, '#b5ab97', [0, 1.15, 0.41], [0, 0, PI / 4]));
    for (let i = 0; i < 6; i++) g.add(C(0.06, 0.06, 0.02, metal(GOLD), [Math.cos(i * 2) * 0.2, 2.2 + i * 0.012, Math.sin(i * 1.5) * 0.2], [0.2 * i, 0, 0.1], 12));
    const coins = [];
    for (let i = 0; i < 3; i++) { const c = C(0.07, 0.07, 0.02, metal(GOLD), [0, 0, 0], [0, 0, 0], 12); g.add(fx(c)); coins.push(c); }
    
    return { g, update(t) {
      coins.forEach((c, i) => { const ph = frac(t * 0.35 + i / 3); const x = 0.7 * (1 - ph); c.position.set(x, 2.7 - ph * ph * 0.45, 0); c.rotation.x = t * 6 + i; c.visible = ph < 0.97; });
    } };
  },

  saka() {
    const g = G();
    g.add(C(1.4, 1.4, 0.1, '#c9b896', [0, 0.05, 0], [0, 0, 0], 8));
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) g.add(B(0.45, 0.02, 0.45, '#b8a682', [-0.9 + i * 0.45, 0.11, -0.5 + j * 0.5]));
    const man = person('#2f5f8a', { hat: '#b0182b' }); man.scale.setScalar(1.4);
    man.add(B(0.45, 0.1, 0.42, '#c49a52', [0, 0.45, 0])); // kuşak
    man.add(C(0.03, 0.04, 0.18, '#111', [0, 1.33, 0], [0, 0, 0], 4));
    const skin = G(S(0.4, mat('#7a4a25', { roughness: 0.9 }), [0, 0, 0], [0.7, 1.15, 0.6], 10), C(0.08, 0.1, 0.25, '#7a4a25', [0.12, 0.45, 0], [0, 0, -0.5], 8), C(0.06, 0.06, 0.12, metal(BRASS), [0.22, 0.6, 0], [0, 0, -0.5], 8));
    skin.position.set(0, 0.68, -0.32); man.add(skin);
    man.add(tube([[-0.18, 0.88, 0.12], [0, 0.95, -0.1], [0.18, 0.4, -0.2]], 0.025, '#5c3a1a'));
    const cup = G(L([[0, 0], [0.07, 0], [0.09, 0.08], [0, 0.06]], two(BRASS, { metalness: 0.55, roughness: 0.35 }), [0, 0, 0]), C(0.065, 0.065, 0.01, mat(WATER), [0, 0.06, 0], [0, 0, 0], 10)); cup.position.set(0.0, -0.48, 0.05); man.userData.armR.add(cup);
    man.userData.armR.rotation.set(-0.9, 0, -0.2);
    man.position.set(0, 0.12, 0); g.add(man);
    const d = drops(4, [0.4, 0.85, 0.75], { len: 0.7, speed: 0.8, r: 0.035 }); g.add(d);
    return { g, update(t) { man.position.y = 0.12 + Math.abs(Math.sin(t * 3)) * 0.05; man.rotation.y = Math.sin(t * 0.6) * 0.3; man.userData.armR.rotation.x = -0.9 + Math.sin(t * 1.5) * 0.25; d.update(t); } };
  },

  sarnic() {
    const g = G();
    g.add(B(3.2, 0.1, 2.4, '#5e5850', [0, 0.05, 0]));
    const water = B(3.2, 0.05, 2.4, mat('#2f7fa6', { transparent: true, opacity: 0.75, roughness: 0.1 }), [0, 0.3, 0]); g.add(water);
    const cols = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const x = -1.35 + i * 0.9, z = -0.9 + j * 0.9;
      g.add(C(0.1, 0.12, 1.8, '#c7bba5', [x, 0.95, z], [0, 0, 0], 10));
      g.add(B(0.3, 0.12, 0.3, '#b5a98f', [x, 1.9, z]), B(0.26, 0.08, 0.26, '#b5a98f', [x, 0.08, z]));
      if (i < 3) g.add(m(new THREE.TorusGeometry(0.45, 0.07, 6, 16, PI), '#a34e34', [x + 0.45, 1.95, z]));
      if (j < 2) g.add(m(new THREE.TorusGeometry(0.45, 0.07, 6, 16, PI), '#a34e34', [x, 1.95, z + 0.45], [0, PI / 2, 0]));
      cols.push([x, z]);
    }
    // medusa başı ipucu
    g.add(S(0.22, '#9a9384', [-1.35, 0.4, 0.9], [1, 1, 0.6], 8));
    g.add(C(0.24, 0.24, 0.15, '#9a9384', [-1.35, 0.28, 0.9], [PI / 2, 0, 0], 8));
    const ripples = [];
    for (let i = 0; i < 4; i++) { const r = T(0.3, 0.012, mat('#bfe6f7', { transparent: true, opacity: 0.8 }), [0, 0.34, 0], [PI / 2, 0, 0]); g.add(fx(r)); ripples.push(r); }
    const lights = [];
    for (let i = 0; i < 4; i++) { const l = S(0.06, glow('#ffb347', 2), [-1.35 + i * 0.9, 1.4, -0.9], 1, 6); g.add(l); lights.push(l); }
    const pl = new THREE.PointLight('#ffb347', 2, 5); pl.position.set(0, 1.5, 0); g.add(pl);
    const drip = drops(3, [0.45, 2.0, 0.45], { len: 1.65, speed: 0.4, r: 0.04 }); g.add(drip);
    return { g, update(t) { ripples.forEach((r, i) => { const ph = frac(t * 0.4 + i / 4); r.scale.setScalar(0.2 + ph * 2.5); r.material.opacity = 0.8 * (1 - ph); r.position.set(0.45, 0.34, 0.45); }); lights.forEach((l, i) => l.scale.setScalar(0.8 + 0.3 * Math.sin(t * 9 + i * 2))); drip.update(t); } };
  },

  sadirvan() {
    const g = G();
    const mar = mat(MARBLE, { roughness: 0.4 });
    g.add(C(1.6, 1.7, 0.12, '#b9b2a5', [0, 0.06, 0], [0, 0, 0], 8));
    g.add(C(1.05, 1.1, 0.9, mar, [0, 0.57, 0], [0, 0, 0], 8));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2 + PI / 8; g.add(B(0.5, 0.5, 0.03, '#d9cfbd', [Math.cos(a) * 1.0, 0.6, Math.sin(a) * 1.0], [0, -a + PI / 2, 0])); }
    g.add(C(0.85, 0.85, 0.05, mat('#4fa3d1', { roughness: 0.15, transparent: true, opacity: 0.85 }), [0, 1.0, 0], [0, 0, 0], 8));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.add(C(0.03, 0.03, 0.2, metal(BRASS), [Math.cos(a) * 1.08, 0.5, Math.sin(a) * 1.08], [0, 0, 0], 6)); g.add(C(0.025, 0.025, 0.18, metal(BRASS), [Math.cos(a) * 1.16, 0.55, Math.sin(a) * 1.16], [0, 0, 0], 6)); g.children[g.children.length - 1].rotation.set(Math.sin(a) * PI / 2, 0, -Math.cos(a) * PI / 2); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.add(B(0.25, 0.12, 0.35, '#c9bfae', [Math.cos(a) * 1.4, 0.18, Math.sin(a) * 1.4], [0, -a, 0])); }
    // revak
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2 + PI / 8; g.add(C(0.05, 0.06, 1.7, mar, [Math.cos(a) * 1.5, 0.95, Math.sin(a) * 1.5], [0, 0, 0], 8)); }
    g.add(C(1.65, 1.65, 0.12, '#d9cfbd', [0, 1.85, 0], [0, PI / 8, 0], 8));
    g.add(C(1.75, 1.65, 0.08, '#2c5a6e', [0, 1.95, 0], [0, PI / 8, 0], 8));
    g.add(m(new THREE.SphereGeometry(1.0, 16, 8, 0, PI * 2, 0, PI / 2), '#7f97a6', [0, 1.95, 0], [0, 0, 0], [1, 0.6, 1]));
    g.add(C(0.02, 0.02, 0.4, metal(GOLD), [0, 2.75, 0], [0, 0, 0], 4), S(0.07, metal(GOLD), [0, 2.82, 0], 1, 8));
    g.add(L([[0, 1.0], [0.25, 1.0], [0.18, 1.2], [0.25, 1.3], [0.1, 1.35], [0, 1.35]], mar));
    const streams = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; const d = drops(3, [Math.cos(a) * 1.22, 0.48, Math.sin(a) * 1.22], { len: 0.3, speed: 1.4, r: 0.025 }); g.add(d); streams.push(d); }
    const fount = drops(6, [0, 1.6, 0], { len: 0.6, speed: 0.8, r: 0.035 }); g.add(fount);
    return { g, update(t) { streams.forEach((s, i) => s.update(t + i * 0.13)); fount.update(t); } };
  },

  yadigar() {
    const g = G();
    const gold = metal(GOLD);
    const watch = G();
    watch.add(C(0.9, 0.9, 0.22, gold, [0, 0, 0], [PI / 2, 0, 0], 32));
    watch.add(T(0.9, 0.06, gold, [0, 0, 0], [0, 0, 0]));
    watch.add(C(0.82, 0.82, 0.02, '#fbf7ec', [0, 0, 0.115], [PI / 2, 0, 0], 32));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; watch.add(B(0.04, i % 3 ? 0.08 : 0.16, 0.01, '#2b2b2b', [Math.sin(a) * 0.68, Math.cos(a) * 0.68, 0.13], [0, 0, -a])); }
    watch.add(C(0.18, 0.18, 0.01, '#e7d8b0', [0, -0.35, 0.128], [PI / 2, 0, 0], 16));
    const hourH = G(B(0.05, 0.38, 0.01, '#1d2a4a', [0, 0.17, 0])); hourH.position.z = 0.14;
    const minH = G(B(0.035, 0.58, 0.01, '#1d2a4a', [0, 0.27, 0])); minH.position.z = 0.145;
    const secH = G(B(0.012, 0.15, 0.01, RED, [0, 0.06, 0])); secH.position.set(0, -0.35, 0.145);
    watch.add(hourH, minH, secH, C(0.04, 0.04, 0.04, gold, [0, 0, 0.15], [PI / 2, 0, 0], 8));
    watch.add(C(0.1, 0.1, 0.2, gold, [0, 1.0, 0], [0, 0, 0], 10), T(0.18, 0.04, gold, [0, 1.25, 0], [0, 0, 0]));
    const lid = G(C(0.9, 0.9, 0.06, gold, [0.9, 0, 0], [PI / 2, 0, 0], 32));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; lid.add(S(0.12, gold, [0.9 + Math.cos(a) * 0.45, Math.sin(a) * 0.45, -0.04], [1, 1, 0.3], 8)); }
    lid.add(S(0.2, mat('#2c5aa0', { metalness: 0.3, roughness: 0.2 }), [0.9, 0, -0.04], [1, 1, 0.3], 10));
    lid.position.set(-0.9, 0, -0.11); lid.rotation.y = -2.2; watch.add(lid);
    watch.position.set(0, 1.25, 0); watch.rotation.x = -0.15; g.add(watch);
    // zincir
    for (let i = 0; i < 16; i++) { const a = i / 16; g.add(T(0.06, 0.018, gold, [0.1 + a * 1.4, 2.45 - Math.sin(a * PI) * 1.6 + a * a * -0.5, 0.1], [0, i % 2 ? PI / 2 : 0, 0.5])); }
    g.add(B(2.2, 0.12, 1.4, '#6b1d2a', [0, 0.06, 0]));
    const sp = sparkles(5, 1.3, 1.2); g.add(sp);
    return { g, update(t) { secH.rotation.z = -t * 2; minH.rotation.z = -t * 0.25; hourH.rotation.z = -t * 0.02 - 1.2; watch.rotation.y = Math.sin(t * 0.7) * 0.25; sp.update(t); } };
  },

  yarenlik() {
    const g = G();
    g.add(C(1.9, 2.0, 0.1, '#6f9a4f', [0, 0.05, 0], [0, 0, 0], 20));
    for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2; g.add(S(0.14, '#8b8378', [Math.cos(a) * 0.5, 0.16, Math.sin(a) * 0.5], [1.1, 0.7, 1], 6)); }
    for (let i = 0; i < 4; i++) g.add(C(0.07, 0.08, 0.8, '#5b3a1f', [0, 0.25, 0], [PI / 2 - 0.4, (i / 4) * PI, 0], 6));
    const fire = flames(7, 1.0); fire.position.y = 0.15; g.add(fire);
    const pl = new THREE.PointLight('#ff9a3c', 3, 6); pl.position.set(0, 0.8, 0); g.add(pl);
    const embers = rising(10, () => S(0.025, glow('#ffb02e', 2), [0, 0, 0], 1, 4), { speed: 0.6, height: 1.6, spread: 0.3, grow: 0.3, sway: 0.25 });
    embers.position.y = 0.6; g.add(embers);
    const ppl = [];
    const cols = ['#c0392b', '#2f7f86', '#8e44ad', '#e2703a'];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2 + PI / 4; const p = person(cols[i], { hat: i % 2 ? '#3b2a1a' : null, scarf: i % 2 ? null : '#f1c40f' });
      p.scale.setScalar(0.7); p.position.set(Math.cos(a) * 1.35, 0.25, Math.sin(a) * 1.35); p.rotation.y = -a - PI / 2;
      g.add(B(0.45, 0.2, 0.45, '#7a5232', [Math.cos(a) * 1.4, 0.18, Math.sin(a) * 1.4], [0, -a, 0]));
      g.add(p); ppl.push(p);
    }
    // saz
    const saz = G(S(0.18, LWOOD, [0, 0, 0], [1, 1.3, 0.5], 10), B(0.05, 0.9, 0.04, DWOOD, [0, 0.6, 0])); ppl[0].add(at(saz, [0.1, 0.55, 0.25], [0, 0, -0.7]));
    const notes = [];
    for (let i = 0; i < 3; i++) { const n = note('#fff3c4'); g.add(fx(n)); notes.push(n); }
    return { g, update(t) {
      fire.update(t); embers.update(t); pl.intensity = 2.5 + Math.sin(t * 9) * 0.5;
      ppl.forEach((p, i) => { p.rotation.z = Math.sin(t * 2 + i * 1.3) * 0.06; p.userData.armR.rotation.z = -0.25 - Math.abs(Math.sin(t * 3 + i)) * (i === 1 ? 0.8 : 0.1); });
      const base = ppl[0].position;
      notes.forEach((n, i) => { const ph = frac(t * 0.35 + i / 3); n.position.set(base.x + ph * 0.3, 1.1 + ph * 1.0, base.z + Math.sin(ph * 6) * 0.2); n.scale.setScalar(Math.sin(ph * PI) * 0.9); });
    } };
  },
};

// Giriş sandığı (QR açıldığında görünen)
export function buildChest() {
  const g = G();
  const wood = mat('#9a5b2e'), wood2 = mat('#7a4420'), gold = metal('#e8b33a'), inner = mat('#3b1f0f');
  g.add(B(2.0, 1.0, 1.2, wood, [0, 0.5, 0]));
  g.add(B(1.84, 0.05, 1.04, inner, [0, 1.0, 0]));
  [0.33, 0.66].forEach((y) => g.add(B(2.01, 0.03, 1.21, wood2, [0, y, 0])));
  g.add(B(2.06, 0.1, 1.26, gold, [0, 0.98, 0]), B(2.06, 0.1, 1.26, gold, [0, 0.05, 0]));
  [-0.7, 0.7].forEach((x) => g.add(B(0.16, 1.0, 1.24, gold, [x, 0.5, 0])));
  g.add(B(0.3, 0.36, 0.06, gold, [0, 0.78, 0.62]), S(0.04, '#222', [0, 0.8, 0.66], 1, 6));
  const lid = G();
  lid.add(m(new THREE.CylinderGeometry(0.6, 0.6, 2.0, 16, 1, false, 0, PI), wood, [0, 0, 0.6], [0, 0, PI / 2]));
  lid.add(m(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 16, 1, false, 0, PI), gold, [-0.7, 0, 0.6], [0, 0, PI / 2]));
  lid.add(m(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 16, 1, false, 0, PI), gold, [0.7, 0, 0.6], [0, 0, PI / 2]));
  lid.add(m(new THREE.CircleGeometry(0.6, 16, 0, PI), wood2, [-1.0, 0, 0.6], [0, -PI / 2, PI / 2]));
  lid.add(m(new THREE.CircleGeometry(0.6, 16, 0, PI), wood2, [1.0, 0, 0.6], [0, PI / 2, PI / 2]));
  lid.position.set(0, 1.03, -0.6);
  g.add(lid);
  const light = S(0.7, new THREE.MeshBasicMaterial({ color: '#ffe9a3', transparent: true, opacity: 0 }), [0, 1.1, 0], [1.3, 0.3, 0.8], 16);
  g.add(light);
  return { g, lid, light };
}
