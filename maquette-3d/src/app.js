// Scène, éclairage, vues d'architecte, coupes et rendu.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { initMaterials } from './materials.js';
import { buildBuilding } from './building.js';

// Modules optionnels (chacun exporte build() -> THREE.Object3D)
const MODULES = [
  ['./stair.js', 'buildStair'],
  ['./joinery.js', 'buildJoinery'],
  ['./furniture_rdc.js', 'buildFurnitureRdc'],
  ['./furniture_etage.js', 'buildFurnitureEtage'],
  ['./site.js', 'buildSite'],
];

// ---------------------------------------------------------------------------
// Vues prédéfinies
//   clip : liste de plans {n:[nx,ny,nz], c} — on garde n·p + c >= 0
//   hide : critères à masquer (level/kind)
// ---------------------------------------------------------------------------
export const VIEWS = {
  'ext-ouest': {
    label: 'Façade jardin', caption: 'Vue extérieure Ouest — enduit Weber 001, menuiseries RAL 7016',
    pos: [-4.6, 1.65, 13.6], target: [4.2, 2.45, 4.6], fov: 44, bg: 'sky', sun: [9, 13, 12],
  },
  'ext-est': {
    label: 'Façade entrée', caption: 'Vue extérieure Est — sas d\'entrée, fenêtre du WC, Velux',
    pos: [11.5, 2.4, -8.8], target: [3.9, 2.6, 1.4], fov: 44, bg: 'sky', sun: [10, 13, -9],
  },
  'axo-rdc': {
    label: 'Plan RDC 3D', caption: 'Axonométrie du rez-de-chaussée meublé (coupe à 1,60 m)',
    pos: [12.5, 13.5, 13.0], target: [4.1, 0.0, 2.5], fov: 34, bg: 'studio',
    clip: [{ n: [0, -1, 0], c: 1.60 }],
  },
  'coupe-escalier': {
    label: 'Coupe escalier / WC', caption: 'Coupe perspective : escalier quart-tournant, WC sous les dernières marches',
    pos: [7.4, 3.4, 11.8], target: [4.9, 2.45, 0.9], fov: 40, bg: 'studio', sun: [6, 14, 10],
    clip: [{ n: [0, 0, -1], c: 2.17 }],
  },
  'etage': {
    label: 'Étage 3D', caption: 'Axonométrie de l\'étage meublé (coupe à 1,35 m au-dessus du plancher)',
    pos: [12.0, 15.0, 13.0], target: [3.9, 2.6, 2.6], fov: 34, bg: 'studio',
    clip: [{ n: [0, -1, 0], c: 2.60 + 1.35 }],
  },
  'int-degagement': {
    label: 'Vue du sas', caption: 'Intérieur : depuis le sas vers le dégagement, l\'escalier et la porte du WC',
    pos: [8.05, 1.62, 2.85], target: [4.2, 1.30, 1.05], fov: 68, bg: 'sky', interior: true,
  },
  'detail-raccord': {
    label: 'Détail raccord', caption: 'Détail : fixation du limon métallique à travers le doublage placo, échiffre placo sous le limon',
    pos: [4.95, 1.05, 1.15], target: [6.31, 0.55, 0.62], fov: 45, bg: 'studio', sun: [6, 14, 10],
    clip: [{ n: [1, 0, 0], c: -6.31 }],
  },
  'int-wc': {
    label: 'Intérieur WC', caption: 'Intérieur WC : jonction avec l\'escalier, lave-mains sous les marches',
    pos: [5.15, 1.55, 2.05], target: [3.45, 1.45, 0.62], fov: 74, bg: 'sky', interior: true,
  },
};

export async function createApp(container, { interactive = true, quality = 'auto' } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !interactive, powerPreference: 'high-performance' });
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const hq = quality === 'high' || (quality === 'auto' && !isMobile);
  renderer.setPixelRatio(interactive ? Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2) : 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  // Ciel / fond studio
  const skyGeo = new THREE.SphereGeometry(400, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color('#6fa6dc') }, mid: { value: new THREE.Color('#cfe2f2') }, bottom: { value: new THREE.Color('#e9eef0') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h*1.6,0.0,1.0),0.8)) : mix(mid, bottom, clamp(-h*4.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }',
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.userData.noClip = true;
  scene.add(sky);
  const SKY = { top: '#6fa6dc', mid: '#cfe2f2', bottom: '#e9eef0' };
  const STUDIO = { top: '#e9e6df', mid: '#f4f2ed', bottom: '#f4f2ed' };

  // Lumières
  const hemi = new THREE.HemisphereLight('#e4eef8', '#8d7b62', 0.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3e2', 3.2);
  sun.position.set(-9, 15, 13);
  sun.target.position.set(4, 0, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hq || !interactive ? 4096 : 2048, hq || !interactive ? 4096 : 2048);
  const sc = sun.shadow.camera;
  sc.left = -11; sc.right = 11; sc.top = 11; sc.bottom = -11; sc.near = 1; sc.far = 50;
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  // Modèle
  initMaterials();
  const model = new THREE.Group();
  model.name = 'maquette';
  scene.add(model);
  model.add(buildBuilding());
  const loaded = [];
  for (const [path, fn] of MODULES) {
    try {
      const mod = await import(path);
      const obj = await mod[fn]();
      if (obj) { model.add(obj); loaded.push(path); }
    } catch (e) {
      console.warn('[maquette] module non chargé', path, e?.message || e);
    }
  }
  // Ombres par défaut sur tous les maillages, sauf verre
  model.traverse((o) => {
    if (o.isMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const transparent = mats.some((m) => m.transparent);
      if (o.userData.noShadow) { o.castShadow = false; }
      else if (transparent) { o.castShadow = false; o.receiveShadow = false; }
    }
  });

  // Caméra / contrôles
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.05, 900);
  let controls = null;
  if (interactive) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 60;
    controls.screenSpacePanning = true;
  }

  // Post-traitement (occlusion ambiante)
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, container.clientWidth, container.clientHeight);
  gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.5, thickness: 1.5, scale: 1.25, samples: 16 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  gtao.blendIntensity = 1.0;
  gtao.normalMaterial.side = THREE.DoubleSide;
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
  let useAO = hq || !interactive;

  // -------------------------------------------------------------------------
  // État d'affichage
  // -------------------------------------------------------------------------
  const state = { view: null, furniture: true, roof: true, etage: true, placo: false, clip: [] };

  const allMaterials = () => {
    const set = new Set();
    model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => set.add(m)); });
    return set;
  };

  function applyClip(planesDef = []) {
    const planes = planesDef.map((p) => new THREE.Plane(new THREE.Vector3(...p.n), p.c));
    state.clip = planes;
    for (const m of allMaterials()) {
      m.clippingPlanes = planes.length ? planes : null;
      m.clipShadows = true;
      m.needsUpdate = true;
    }
    gtao.normalMaterial.clippingPlanes = planes.length ? planes : null;
    gtao.normalMaterial.needsUpdate = true;
  }

  function applyVisibility() {
    model.traverse((o) => {
      const { level, kind } = o.userData;
      let vis = true;
      if (!state.furniture && kind === 'mobilier') vis = false;
      if (!state.roof && level === 'toit') vis = false;
      if (!state.etage && (level === 'etage' || level === 'toit')) vis = false;
      if (o.userData.hideInView && state.view && o.userData.hideInView.includes(state.view)) vis = false;
      o.visible = vis;
    });
  }

  const placoMats = () => ['placo', 'placoPlafond'].map((k) => import('./core.js').then((c) => c.MAT[k]));
  async function setPlacoHighlight(on) {
    state.placo = on;
    const [a, b] = await Promise.all(placoMats());
    a.color.set(on ? '#c9d9e6' : '#F3F2EE');
    b.color.set(on ? '#c9d9e6' : '#f7f6f3');
  }

  function setBackground(kind) {
    const c = kind === 'sky' ? SKY : STUDIO;
    skyMat.uniforms.top.value.set(c.top); skyMat.uniforms.mid.value.set(c.mid); skyMat.uniforms.bottom.value.set(c.bottom);
  }

  function setView(name, { animate = interactive } = {}) {
    const v = VIEWS[name];
    if (!v) return;
    state.view = name;
    applyClip(v.clip || []);
    applyVisibility();
    setBackground(v.bg);
    // pour les vues intérieures, lumière du jour un peu plus douce et lampes plus présentes
    hemi.intensity = v.interior ? 0.85 : 0.6;
    renderer.toneMappingExposure = v.interior ? 1.15 : 0.95;
    const sd = v.sun || [9, 14, 11];
    sun.position.set(sun.target.position.x + sd[0], sun.target.position.y + sd[1], sun.target.position.z + sd[2]);
    camera.fov = v.fov;
    camera.near = v.interior ? 0.05 : 0.2;
    camera.updateProjectionMatrix();
    const to = new THREE.Vector3(...v.pos), tg = new THREE.Vector3(...v.target);
    if (!animate || !controls) {
      camera.position.copy(to); camera.lookAt(tg);
      if (controls) { controls.target.copy(tg); controls.update(); }
      return;
    }
    const from = camera.position.clone(), fromT = controls.target.clone();
    const t0 = performance.now(), dur = 900;
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      camera.position.lerpVectors(from, to, e);
      controls.target.lerpVectors(fromT, tg, e);
      controls.update();
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  function resize(w = container.clientWidth, h = container.clientHeight) {
    renderer.setSize(w, h, interactive);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
    gtao.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }

  function renderOnce() {
    if (useAO) composer.render(); else renderer.render(scene, camera);
  }

  if (interactive) {
    window.addEventListener('resize', () => resize());
    renderer.setAnimationLoop(() => { controls?.update(); renderOnce(); });
  }

  // Rendu d'une image fixe (utilisé par tools/render.mjs)
  async function snapshot(name, w, h) {
    resize(w, h);
    setView(name, { animate: false });
    renderOnce(); renderOnce();
    return renderer.domElement.toDataURL('image/png');
  }

  return {
    THREE, scene, camera, renderer, model, controls, loaded, state,
    setView, resize, renderOnce, snapshot, applyVisibility, setPlacoHighlight,
    setAO: (on) => { useAO = on; },
    get ao() { return useAO; },
    setToggle: (key, val) => { state[key] = val; applyVisibility(); },
  };
}
