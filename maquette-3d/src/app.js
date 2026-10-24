// Scène, éclairage HDR (ciel physique + soleil), rendu progressif, vues d'architecte, coupes.
//
// Chaîne de rendu (une "image" = un échantillon) :
//   1. scène -> cible flottante (HalfFloat, linéaire HDR), caméra décalée d'une fraction de pixel
//      (anticrénelage) et soleil légèrement déplacé dans son disque (pénombre des ombres) ;
//   2. occlusion ambiante GTAO (cible séparée, accumulée à part) ;
//   3. moyenne glissante des échantillons (ping-pong flottant) ;
//   4. sortie : AO x couleur, exposition, tone mapping (ACES), sRGB, fond "studio" composité en
//      espace écran pour les coupes / axonométries (l'éclairage reste le ciel).
// Interactif : 1 image nette pendant le mouvement, puis affinage progressif après ~0,3 s d'immobilité,
// arrêt du rendu quand l'image a convergé (économie de batterie).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { initMaterials } from './materials.js';
import { buildBuilding } from './building.js';
import { MAT } from './core.js';
import { LV, ROOF } from './spec.js';

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
//   bg   : 'sky' (ciel physique) | 'studio' (fond clair uni, éclairage toujours par le ciel)
//   sun  : direction du soleil (vecteur vers le soleil, non normé) ; le ciel est recalculé pour cette direction
//   ev   : correction d'exposition (IL, 0 = exposition de base calée sur un mur blanc au soleil)
//   inside : part de la lumière du ciel conservée à l'intérieur de l'enveloppe (pas d'éclairage global :
//            sans cela l'intérieur serait éclairé comme le dehors) — 0,35 extérieur, 0,55 intérieur, 0,85 coupe
//   lamps : lampes du modèle allumées (défaut : vues intérieures ; userData.alwaysOn sur une lampe = toujours)
//   ao   : intensité de l'occlusion ambiante
//   interior : vue intérieure (plan proche serré, lumière du ciel atténuée, exposition relevée)
// ---------------------------------------------------------------------------
const SUN_AFTERNOON = [9, 13, 12];   // sud-ouest, ~41° : soleil d'après-midi sur la façade jardin
export const VIEWS = {
  'ext-ouest': {
    label: 'Façade jardin', caption: 'Vue extérieure Ouest — enduit Weber 001, menuiseries RAL 7016',
    pos: [-0.9, 1.50, 13.7], target: [4.3, 2.30, 4.6], fov: 48, bg: 'sky', sun: SUN_AFTERNOON, ev: -0.05,
  },
  'ext-est': {
    label: 'Façade entrée', caption: 'Vue extérieure Est — sas d\'entrée, fenêtre du WC, Velux',
    pos: [-5.6, 5.4, -9.8], target: [4.0, 2.2, 1.6], fov: 45, bg: 'sky', sun: [10, 13, -9], ev: -0.05,
  },
  'axo-rdc': {
    label: 'Plan RDC 3D', caption: 'Axonométrie du rez-de-chaussée meublé (coupe à 1,60 m)',
    pos: [12.5, 13.5, 13.0], target: [4.1, 0.0, 2.5], fov: 34, bg: 'studio', sun: [6, 14, 10], ev: 0.1, ao: 0.9,
    clip: [{ n: [0, -1, 0], c: 1.60 }],
  },
  'coupe-escalier': {
    label: 'Coupe escalier / WC', caption: 'Coupe perspective le long du limon côté jour : escalier quart-tournant complet, échiffre placo, WC sous les dernières marches',
    pos: [9.3, 3.0, 9.8], target: [4.55, 2.05, 0.75], fov: 44, bg: 'studio', sun: [6, 14, 10], ev: 0.15, ao: 0.9,
    clip: [{ n: [0, 0, -1], c: 1.235 }],
  },
  'etage': {
    label: 'Étage 3D', caption: 'Axonométrie de l\'étage meublé (coupe à 1,35 m au-dessus du plancher)',
    pos: [12.0, 15.0, 13.0], target: [3.9, 2.6, 2.6], fov: 34, bg: 'studio', sun: [6, 14, 10], ev: 0.1, ao: 0.9,
    clip: [{ n: [0, -1, 0], c: 2.60 + 1.35 }],
  },
  'int-degagement': {
    label: 'Vue du sas', caption: 'Intérieur : depuis le sas vers le dégagement, l\'escalier et la porte du WC',
    pos: [8.15, 1.60, 1.98], target: [5.0, 1.20, 1.28], fov: 62, bg: 'sky', interior: true, sun: [10, 13, -9],
  },
  'detail-raccord': {
    label: 'Détail raccord', caption: 'Détail : fixation du limon métallique à travers le doublage placo, échiffre placo sous le limon',
    pos: [4.92, 1.08, 1.18], target: [6.31, 0.52, 0.62], fov: 45, bg: 'studio', sun: [6, 14, 10], ev: 0.2, ao: 1.0, sunSoft: 1.0,
    clip: [{ n: [1, 0, 0], c: -6.31 }],
  },
  'int-wc': {
    label: 'Intérieur WC', caption: 'Intérieur WC : jonction avec l\'escalier, lave-mains sous les marches',
    pos: [4.05, 1.45, 2.10], target: [3.60, 1.62, 0.45], fov: 72, bg: 'sky', interior: true, sun: [10, 13, -9],
  },
  'detail-fixation': {
    label: 'Fixation limon', caption: 'Gros plan : tige M12 scellée dans le bloc, entretoise à travers le doublage, joint creux de 10 mm',
    pos: [5.60, 0.95, 0.80], target: [6.31, 0.62, 0.33], fov: 40, bg: 'studio', sun: [6, 14, 10], ev: 0.2, ao: 1.0, sunSoft: 1.0,
    clip: [{ n: [1, 0, 0], c: -6.31 }],
  },
  'detail-echiffre': {
    label: 'Échiffre placo', caption: 'Gros plan : échiffre placo 72/48 indépendante, arrêtée 10 mm sous le limon côté jour',
    pos: [5.35, 0.85, 1.95], target: [6.31, 0.45, 1.24], fov: 40, bg: 'studio', sun: [6, 14, 10], ev: 0.2, ao: 1.0, sunSoft: 1.0,
    clip: [{ n: [1, 0, 0], c: -6.31 }],
  },
  'visite': {
    label: 'Visite', caption: 'Visite libre à hauteur d\'œil (1,60 m) — entrée par le sas',
    pos: [8.15, 1.60, 1.98], target: [5.2, 1.50, 1.45], fov: 62, bg: 'sky', interior: true, sun: [10, 13, -9],
  },
};

// Réglages de rendu
const SKY_PARAMS = { turbidity: 2.4, rayleigh: 1.35, mieCoefficient: 0.0042, mieDirectionalG: 0.8 };
const SUN_INTENSITY = 3.2;          // éclairement du soleil (normal au rayon), unités three.js
const SUN_SKY_RATIO = 2.7;          // éclairement horizontal soleil / ciel (ciel ≈ 27 % du total : ombres lisibles)
const SUN_RADIUS_DEG = 0.45;        // demi-angle apparent pour la pénombre (soleil réel 0,27° + halo)
const GROUND_ALBEDO = [0.19, 0.19, 0.16];   // sol moyen (pelouse + terrasse) presque neutre : pas d'ombres vertes
const STUDIO_TOP = '#ebe8e1', STUDIO_BOTTOM = '#f6f4ef';
const SKY_SAT = 1.9;                // saturation du ciel affiché
const ENV_SAT = 0.6;                // ciel d'éclairage partiellement "équilibré des blancs" (ombres moins bleues)
const ENV_SAT_STUDIO = 0.3;         // coupes / axonométries : lumière plus neutre sur fond clair
const AO_PARAMS = { radius: 0.65, distanceExponent: 1.6, thickness: 1.0, scale: 1.0, samples: 16 };
const PD_PARAMS = { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 };

// ---------------------------------------------------------------------------
// Ciel de Preetham (copie JS du shader de three/addons/objects/Sky.js) : sert à caler le soleil,
// sa couleur et l'éclairement du ciel sur la même atmosphère que le fond affiché.
// ---------------------------------------------------------------------------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function skyModel(sunDir, P = SKY_PARAMS) {
  const totalRayleigh = [5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5];
  const MieConst = [1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14];
  const sy = clamp(sunDir.y, -1, 1);
  const sunE = 1000 * Math.max(0, 1 - Math.exp(-((1.6110731556870734 - Math.acos(sy)) / 1.5)));
  const sunfade = 1 - clamp(1 - Math.exp(sunDir.y / 450000), 0, 1);
  const betaR = totalRayleigh.map((v) => v * (P.rayleigh - (1 - sunfade)));
  const betaM = MieConst.map((v) => 0.434 * (0.2 * P.turbidity) * 10E-18 * v * P.mieCoefficient);
  const g = P.mieDirectionalG, g2 = g * g;
  const optical = (dy) => {
    const zen = Math.acos(Math.max(0, dy));
    const inv = 1 / (Math.cos(zen) + 0.15 * Math.pow(93.885 - (zen * 180) / Math.PI, -1.253));
    return [8.4E3 * inv, 1.25E3 * inv];
  };
  const radiance = (d) => {
    const [sR, sM] = optical(d.y);
    const cosT = d.x * sunDir.x + d.y * sunDir.y + d.z * sunDir.z;
    const rPhase = 0.05968310365946075 * (1 + Math.pow(cosT * 0.5 + 0.5, 2));
    const mPhase = 0.07957747154594767 * (1 - g2) / Math.pow(1 - 2 * g * cosT + g2, 1.5);
    const k = clamp(Math.pow(1 - sunDir.y, 5), 0, 1);
    const out = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const Fex = Math.exp(-(betaR[i] * sR + betaM[i] * sM));
      const ratio = (betaR[i] * rPhase + betaM[i] * mPhase) / (betaR[i] + betaM[i]);
      let Lin = Math.pow(sunE * ratio * (1 - Fex), 1.5);
      Lin *= (1 - k) + k * Math.pow(sunE * ratio * Fex, 0.5);
      const tex = (Lin + 0.1 * Fex) * 0.04 + [0, 0.0003, 0.00075][i];
      out[i] = Math.pow(tex, 1 / (1.2 + 1.2 * sunfade));
    }
    return out;
  };
  // transmittance vers le soleil -> couleur du soleil
  const [sR, sM] = optical(sunDir.y);
  const fex = [0, 1, 2].map((i) => Math.exp(-(betaR[i] * sR + betaM[i] * sM)));
  // éclairement du ciel sur un plan horizontal (intégration en cosinus)
  const E = [0, 0, 0];
  const NT = 16, NP = 32, d = new THREE.Vector3();
  for (let i = 0; i < NT; i++) {
    const th = ((i + 0.5) / NT) * (Math.PI / 2);
    for (let j = 0; j < NP; j++) {
      const ph = ((j + 0.5) / NP) * Math.PI * 2;
      d.set(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      const L = radiance(d);
      const w = Math.cos(th) * Math.sin(th) * (Math.PI / 2 / NT) * (Math.PI * 2 / NP);
      for (let c = 0; c < 3; c++) E[c] += L[c] * w;
    }
  }
  return { radiance, fex, E };
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// ---------------------------------------------------------------------------
// Tone mapping en JS (copie des fonctions GLSL de three r170) : sert à garder les couleurs de
// poché (faces de coupe) identiques quelle que soit l'exposition.
// ---------------------------------------------------------------------------
function toneMapJS(kind, c, exposure) {
  let [r, g, b] = c.map((v) => v * exposure);
  if (kind === THREE.ACESFilmicToneMapping) {
    r /= 0.6; g /= 0.6; b /= 0.6;
    const a0 = 0.59719 * r + 0.35458 * g + 0.04823 * b;
    const a1 = 0.07600 * r + 0.90834 * g + 0.01566 * b;
    const a2 = 0.02840 * r + 0.13383 * g + 0.83777 * b;
    const fit = (v) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.4329510) + 0.238081);
    const f0 = fit(a0), f1 = fit(a1), f2 = fit(a2);
    return [
      clamp(1.60475 * f0 - 0.53108 * f1 - 0.07367 * f2, 0, 1),
      clamp(-0.10208 * f0 + 1.10813 * f1 - 0.00605 * f2, 0, 1),
      clamp(-0.00327 * f0 - 0.07276 * f1 + 1.07602 * f2, 0, 1),
    ];
  }
  if (kind === THREE.AgXToneMapping) {
    const m3 = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
    const SRGB_2020 = [0.6274, 0.0691, 0.0164, 0.3293, 0.9195, 0.0880, 0.0433, 0.0113, 0.8956];
    const R2020_SRGB = [1.6605, -0.1246, -0.0182, -0.5876, 1.1329, -0.1006, -0.0728, -0.0083, 1.1187];
    const INSET = [0.856627153315983, 0.137318972929847, 0.11189821299995, 0.0951212405381588, 0.761241990602591, 0.0767994186031903, 0.0482516061458583, 0.101439036467562, 0.811302368396859];
    const OUTSET = [1.1271005818144368, -0.1413297634984383, -0.14132976349843826, -0.11060664309660323, 1.157823702216272, -0.11060664309660294, -0.016493938717834573, -0.016493938717834257, 1.2519364065950405];
    let v = m3(INSET, m3(SRGB_2020, [r, g, b]));
    v = v.map((x) => clamp((Math.log2(Math.max(x, 1e-10)) + 12.47393) / (4.026069 + 12.47393), 0, 1));
    v = v.map((x) => { const x2 = x * x, x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; });
    v = m3(OUTSET, v).map((x) => Math.pow(Math.max(0, x), 2.2));
    return m3(R2020_SRGB, v).map((x) => clamp(x, 0, 1));
  }
  if (kind === THREE.NeutralToneMapping) {
    const x = Math.min(r, g, b), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
    r -= off; g -= off; b -= off;
    const peak = Math.max(r, g, b), S = 0.76;
    if (peak < S) return [r, g, b];
    const d = 1 - S, np = 1 - (d * d) / (peak + d - S), k = np / peak;
    const gg = 1 - 1 / (0.15 * (peak - np) + 1);
    return [r, g, b].map((v) => v * k * (1 - gg) + np * gg);
  }
  return [r, g, b].map((v) => clamp(v, 0, 1));
}
// valeur HDR à envoyer pour obtenir la couleur affichée "target" (linéaire) après tone mapping
function invToneMap(kind, target, exposure) {
  let x = target.map((t) => Math.max(t, 1e-4) / exposure);
  for (let it = 0; it < 24; it++) {
    const y = toneMapJS(kind, x, exposure);
    x = x.map((v, i) => clamp(v * Math.max(target[i], 1e-4) / Math.max(y[i], 1e-5), 0, 64));
  }
  return x;
}

function halton(i, b) { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }

// ---------------------------------------------------------------------------
// Shaders plein écran
// ---------------------------------------------------------------------------
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
function blendMaterial() {
  return new THREE.ShaderMaterial({
    name: 'Accumulate',
    uniforms: { tPrev: { value: null }, tNew: { value: null }, uWeight: { value: 1 } },
    vertexShader: VS,
    fragmentShader: `uniform sampler2D tPrev; uniform sampler2D tNew; uniform float uWeight; varying vec2 vUv;
      void main(){ vec4 n = texture2D(tNew, vUv); vec4 p = uWeight >= 1.0 ? n : texture2D(tPrev, vUv); gl_FragColor = mix(p, n, uWeight); }`,
    depthTest: false, depthWrite: false, blending: THREE.NoBlending, toneMapped: false,
  });
}
function outputMaterial() {
  return new THREE.ShaderMaterial({
    name: 'OutputHDR',
    uniforms: {
      tColor: { value: null }, tAO: { value: null }, uAO: { value: 0 },
      uStudio: { value: 0 }, uStudioTop: { value: new THREE.Vector3() }, uStudioBottom: { value: new THREE.Vector3() },
    },
    vertexShader: VS,
    fragmentShader: `
      #include <common>
      uniform sampler2D tColor; uniform sampler2D tAO; uniform float uAO;
      uniform float uStudio; uniform vec3 uStudioTop; uniform vec3 uStudioBottom;
      varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tColor, vUv);
        float a = clamp(c.a, 0.0, 1.0);
        float cov = mix(1.0, a, uStudio);
        vec3 col = c.rgb / max(cov, 1e-4);
        float ao = mix(1.0, texture2D(tAO, vUv).r, uAO);
        gl_FragColor = vec4(max(col * ao, vec3(0.0)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        vec3 studio = mix(uStudioBottom, uStudioTop, smoothstep(0.0, 1.0, vUv.y));
        gl_FragColor.rgb = mix(studio, gl_FragColor.rgb, cov);
        gl_FragColor.rgb += (rand(gl_FragCoord.xy) - 0.5) / 255.0;   // tramage : pas de bandes dans le ciel
      }`,
    depthTest: false, depthWrite: false, blending: THREE.NoBlending,
  });
}
function skyMaterial() {
  const S = Sky.SkyShader;
  const m = new THREE.ShaderMaterial({
    name: 'SkyHDR',
    uniforms: { ...THREE.UniformsUtils.clone(S.uniforms), uIntensity: { value: 1 }, uSat: { value: 1 } },
    vertexShader: S.vertexShader,
    fragmentShader: S.fragmentShader
      .replace('uniform vec3 up;', 'uniform vec3 up;\nuniform float uIntensity;\nuniform float uSat;')
      .replace('gl_FragColor = vec4( retColor, 1.0 );',
        'float sl = dot( retColor, vec3( 0.2126, 0.7152, 0.0722 ) );\n\t\t\tretColor = max( vec3( 0.0 ), mix( vec3( sl ), retColor, uSat ) );\n\t\t\tgl_FragColor = vec4( retColor * uIntensity, 1.0 );'),
    side: THREE.BackSide, depthWrite: false,
  });
  m.uniforms.turbidity.value = SKY_PARAMS.turbidity;
  m.uniforms.rayleigh.value = SKY_PARAMS.rayleigh;
  m.uniforms.mieCoefficient.value = SKY_PARAMS.mieCoefficient;
  m.uniforms.mieDirectionalG.value = SKY_PARAMS.mieDirectionalG;
  return m;
}

export async function createApp(container, { interactive = true, quality = 'auto' } = {}) {
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const hq = quality === 'high' || (quality === 'auto' && !isMobile);
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: !interactive, powerPreference: 'high-performance' });
  renderer.setPixelRatio(interactive ? Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2) : 1);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;          // carte d'ombre recalculée une fois par image (pas pour la passe AO)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  // opaques triés d'avant en arrière (test de profondeur précoce : moins de pixels ombrés pour rien)
  renderer.setOpaqueSort((a, b) => (a.groupOrder - b.groupOrder) || (a.renderOrder - b.renderOrder) || (a.z - b.z) || (a.id - b.id));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);

  // ----- Ciel physique (fond) -----------------------------------------------------------------
  const skyMat = skyMaterial();
  const sky = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), skyMat);
  sky.name = 'ciel'; sky.scale.setScalar(600); sky.frustumCulled = false; sky.renderOrder = 1e6;
  sky.userData.noClip = true;
  scene.add(sky);
  // brume de l'horizon (pelouse lointaine fondue dans le ciel) ; jamais retirée (évite les recompilations)
  scene.fog = new THREE.Fog(0xffffff, 1e5, 1e6);

  // Scène de capture de l'environnement : même ciel + sol (pelouse éclairée) -> PMREM
  const envScene = new THREE.Scene();
  const envSky = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), skyMat);
  envSky.scale.setScalar(50);
  const envGroundMat = new THREE.MeshBasicMaterial({ color: '#556644', side: THREE.DoubleSide });
  const envGround = new THREE.Mesh(new THREE.CircleGeometry(45, 48), envGroundMat);
  envGround.rotation.x = -Math.PI / 2; envGround.position.y = -1.0;
  envScene.add(envSky, envGround);
  const envCache = new Map();

  // ----- Lumières ------------------------------------------------------------------------------
  const sun = new THREE.DirectionalLight('#ffffff', SUN_INTENSITY);
  sun.castShadow = true;
  const shadowSize = (hq && interactive) ? 4096 : 2048;   // caméra d'ombre ajustée au champ visible
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  scene.add(sun, sun.target);
  const light = {
    dir: new THREE.Vector3(0.5, 0.7, 0.5).normalize(), skyScale: 1, key: '',
    tmpCam: new THREE.OrthographicCamera(), soft: SUN_RADIUS_DEG,
  };

  // ----- Modèle --------------------------------------------------------------------------------
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

  // Emprise des objets qui portent ombre (hors site) : cadrage serré de la caméra d'ombre
  const casterBox = new THREE.Box3();
  function computeCasterBox() {
    casterBox.makeEmpty();
    for (const c of model.children) if (c.userData.level !== 'site') casterBox.expandByObject(c);
    if (casterBox.isEmpty()) casterBox.set(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(9, 7, 7));
  }
  computeCasterBox();

  // ----- Sol de secours (si aucun module "site" n'a fourni de terrain) ------------------------
  const hasSite = () => { let s = false; model.traverse((o) => { if (o.userData.level === 'site') s = true; }); return s; };
  const fallback = new THREE.Group();
  fallback.name = 'sol-de-secours';
  scene.add(fallback);
  const lawnGrp = new THREE.Group(), catcher = new THREE.Group();
  fallback.add(lawnGrp, catcher);
  if (!hasSite()) {
    const lawnGeo = new THREE.CircleGeometry(400, 96);
    lawnGeo.rotateX(-Math.PI / 2);
    const p = lawnGeo.attributes.position, uv = lawnGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), -p.getZ(i));
    const lawn = new THREE.Mesh(lawnGeo, MAT.herbe || new THREE.MeshStandardMaterial({ color: '#5f8a3a', roughness: 1 }));
    lawn.position.y = LV.ground; lawn.receiveShadow = true; lawn.name = 'pelouse';
    lawnGrp.add(lawn);
    // terrasse bois le long de la façade jardin (ambiance du photo-montage client)
    if (MAT.terrasse) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(8.9, LV.ground * -1, 2.45), MAT.terrasse);
      deck.position.set(4.05, LV.ground / 2, 5.25 + 2.45 / 2);
      const g = deck.geometry, gp = g.attributes.position, guv = g.attributes.uv, gn = g.attributes.normal;
      for (let i = 0; i < gp.count; i++) {
        const x = gp.getX(i) + deck.position.x, y = gp.getY(i) + deck.position.y, z = gp.getZ(i) + deck.position.z;
        if (Math.abs(gn.getY(i)) > 0.5) guv.setXY(i, x, z); else if (Math.abs(gn.getX(i)) > 0.5) guv.setXY(i, z, y); else guv.setXY(i, x, y);
      }
      deck.castShadow = true; deck.receiveShadow = true; deck.name = 'terrasse';
      lawnGrp.add(deck);
    }
    // vues "studio" : sol invisible qui ne garde que les ombres
    const sc = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.ShadowMaterial({ opacity: 0.22, depthWrite: false }));
    sc.rotation.x = -Math.PI / 2; sc.position.y = LV.ground + 0.002; sc.receiveShadow = true; sc.name = 'ombre-au-sol';
    catcher.add(sc);
  }

  // ----- Caméra / contrôles ------------------------------------------------------------------
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.05, 900);
  let controls = null;
  if (interactive) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 60;
    controls.screenSpacePanning = true;
  }

  // ----- Cibles de rendu -------------------------------------------------------------------------
  const ext = renderer.extensions;
  const floatOK = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float');
  const RT_TYPE = floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const rtOpts = { type: RT_TYPE, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false };
  const rtFrame = new THREE.WebGLRenderTarget(1, 1, { type: RT_TYPE, samples: interactive ? 4 : 0, depthBuffer: true });
  const rtAcc = [new THREE.WebGLRenderTarget(1, 1, rtOpts), new THREE.WebGLRenderTarget(1, 1, rtOpts)];
  const aoOpts = { ...rtOpts, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const rtAO = [new THREE.WebGLRenderTarget(1, 1, aoOpts), new THREE.WebGLRenderTarget(1, 1, aoOpts)];
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
  const blendMat = blendMaterial(), outMat = outputMaterial();
  const quadBlend = new FullScreenQuad(blendMat), quadOut = new FullScreenQuad(outMat);

  // Occlusion ambiante GTAO (calcul seul, la composition est faite dans la passe de sortie)
  const gtao = new GTAOPass(scene, camera, 1, 1);
  gtao.output = GTAOPass.OUTPUT.Off;
  gtao.updateGtaoMaterial(AO_PARAMS);
  gtao.updatePdMaterial(PD_PARAMS);
  gtao.normalMaterial.side = THREE.DoubleSide;
  let useAO = hq || !interactive;

  // -------------------------------------------------------------------------
  // État d'affichage
  // -------------------------------------------------------------------------
  const state = { view: null, furniture: true, roof: true, etage: true, placo: false, clip: [], bg: 'sky', frames: 0, lamps: false };
  const acc = { n: 0, aoN: 0, ping: 0, aoPing: 0 };
  const view = { ev: 0, env: 1, ao: 0.8, baseFov: 45, interior: false };
  const aoScale = () => (rtFrame.width * rtFrame.height > 1.3e6 ? 0.5 : 1);   // AO en demi-résolution sur les grandes images
  let transparentMeshes = [];
  const refreshTransparent = () => {
    transparentMeshes = [];
    model.traverse((o) => { if (o.isMesh && (Array.isArray(o.material) ? o.material : [o.material]).some((m) => m.transparent)) transparentMeshes.push(o); });
  };
  refreshTransparent();

  const allMaterials = () => {
    const set = new Set();
    model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => set.add(m)); });
    return set;
  };

  // ----- Lumière du ciel atténuée dans l'enveloppe du bâtiment ------------------------------
  // (enveloppe extérieure réduite de 5 cm, haut = sous-face de toiture + 20 cm ; fondu de 25 cm au
  // droit des parois : tableaux de baies et menuiseries reçoivent une part intermédiaire)
  const envU = { value: 0.35 };
  const ENV_GLSL = `
    varying vec3 vEnvWPos;
    uniform float uEnvInside;
    float envBoxDepth( vec3 p, vec3 mn, vec3 mx ) { vec3 a = p - mn, b = mx - p; return min( min( min( a.x, b.x ), min( a.y, b.y ) ), min( a.z, b.z ) ); }
    float envMask( vec3 p ) {
      float yTop = ${ROOF.ridgeTop.toFixed(3)} - ${ROOF.slope.toFixed(3)} * abs( p.z - ${ROOF.ridgeZ.toFixed(3)} ) - ${ROOF.thick.toFixed(3)} + 0.20;
      float d1 = min( envBoxDepth( p, vec3( 0.05, -0.6, 0.05 ), vec3( 7.25, 99.0, 5.20 ) ), yTop - p.y );
      float d2 = envBoxDepth( p, vec3( 7.25, -0.6, 0.05 ), vec3( 8.45, 2.75, 3.45 ) );
      return mix( 1.0, uEnvInside, smoothstep( 0.0, 0.25, max( d1, d2 ) ) );
    }
  `;
  const envPatched = new WeakSet();
  function patchEnvMask(m) {
    if (envPatched.has(m) || !m.isMeshStandardMaterial || m.transparent) return;
    envPatched.add(m);
    const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (shader, r) {
      if (prev) prev.call(this, shader, r);
      shader.uniforms.uEnvInside = envU;
      shader.vertexShader = 'varying vec3 vEnvWPos;\n' + shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        { vec4 ewp = vec4( transformed, 1.0 );
          #ifdef USE_BATCHING
            ewp = batchingMatrix * ewp;
          #endif
          #ifdef USE_INSTANCING
            ewp = instanceMatrix * ewp;
          #endif
          vEnvWPos = ( modelMatrix * ewp ).xyz; }`);
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', ENV_GLSL + '\nvoid main() {')
        .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
          { float em = envMask( vEnvWPos );
            #if defined( RE_IndirectDiffuse )
              iblIrradiance *= em;
            #endif
            #if defined( RE_IndirectSpecular )
              radiance *= em;
            #endif
          }`);
    };
    m.customProgramCacheKey = function () { return (prevKey ? prevKey.call(this) : '') + '|envmask'; };
    m.needsUpdate = true;
  }
  const patchAllEnv = () => { for (const m of allMaterials()) patchEnvMask(m); };
  patchAllEnv();

  // Plans de coupe : toujours le même nombre de plans (un plan neutre quand la vue n'en a pas) pour
  // que changer de vue ne recompile pas les ~110 shaders (secondes de blocage sur téléphone).
  // (images fixes : nombre réel de plans, sans "discard" inutile dans les vues sans coupe)
  let clipPlanes = interactive ? [new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e4)] : [];
  const clipped = new WeakSet();
  function bindClip() {
    const cp = clipPlanes.length ? clipPlanes : null;
    for (const m of allMaterials()) {
      if (m.clippingPlanes === cp && clipped.has(m)) continue;
      m.clippingPlanes = cp; m.clipShadows = true; m.needsUpdate = true; clipped.add(m);
    }
    patchAllEnv();
    if (gtao.normalMaterial.clippingPlanes !== cp) { gtao.normalMaterial.clippingPlanes = cp; gtao.normalMaterial.needsUpdate = true; }
  }
  function applyClip(planesDef = []) {
    const n = interactive ? Math.max(clipPlanes.length, planesDef.length, 1) : planesDef.length;
    if (n !== clipPlanes.length) clipPlanes = Array.from({ length: n }, () => new THREE.Plane());
    clipPlanes.forEach((pl, i) => {
      const d = planesDef[i];
      if (d) pl.set(new THREE.Vector3(...d.n), d.c); else pl.set(new THREE.Vector3(0, 1, 0), 1e4);
    });
    state.clip = clipPlanes.slice(0, planesDef.length);
    bindClip();
    requestRender();
  }

  function applyVisibility() {
    model.traverse((o) => {
      const { level, kind } = o.userData;
      let vis = true;
      if (!state.furniture && kind === 'mobilier') vis = false;
      if (!state.roof && level === 'toit') vis = false;
      if (!state.etage && (level === 'etage' || level === 'toit')) vis = false;
      if (o.userData.hideInView && state.view && o.userData.hideInView.includes(state.view)) vis = false;
      if (o.isLight && !state.lamps && !o.userData.alwaysOn) vis = false;   // lampes : vues intérieures seulement (jour)
      o.visible = vis;
    });
    requestRender();
  }

  async function setPlacoHighlight(on) {
    state.placo = on;
    MAT.placo?.color.set(on ? '#c9d9e6' : '#F3F2EE');
    MAT.placoPlafond?.color.set(on ? '#c9d9e6' : '#f7f6f3');
    requestRender();
  }

  // ----- Soleil, ciel, environnement -----------------------------------------------------------
  // couleurs du fond studio en espace écran (sRGB), composées après le tone mapping
  const srgb = (hex) => { const o = {}; new THREE.Color(hex).getRGB(o, THREE.SRGBColorSpace); return [o.r, o.g, o.b]; };
  outMat.uniforms.uStudioTop.value.set(...srgb(STUDIO_TOP));
  outMat.uniforms.uStudioBottom.value.set(...srgb(STUDIO_BOTTOM));

  function setSun(sunVec, envSat = ENV_SAT) {
    const dir = new THREE.Vector3(...sunVec).normalize();
    const key = dir.toArray().map((v) => v.toFixed(3)).join(',') + '|' + envSat;
    light.dir.copy(dir);
    if (key === light.key) return;
    light.key = key;
    const sm = skyModel(dir);
    const sinEl = Math.max(0.1, dir.y);
    // ciel recalé pour que l'éclairement horizontal du ciel = soleil horizontal / SUN_SKY_RATIO
    const eSky = lum(sm.E);
    light.skyScale = (SUN_INTENSITY * sinEl / SUN_SKY_RATIO) / Math.max(eSky, 1e-6);
    skyMat.uniforms.sunPosition.value.copy(dir);
    skyMat.uniforms.uIntensity.value = light.skyScale;
    // couleur du soleil = transmittance de l'atmosphère (adoucie de moitié vers le blanc)
    const f = sm.fex, fm = Math.max(...f);
    sun.color.setRGB(...f.map((v) => 0.5 + 0.5 * v / fm), THREE.LinearSRGBColorSpace);
    // sol de l'environnement : pelouse éclairée par le soleil et le ciel (luminance lambertienne)
    const eTot = f.map((v, i) => (SUN_INTENSITY * sinEl * sun.color.toArray()[i] + sm.E[i] * light.skyScale));
    envGroundMat.color.setRGB(...eTot.map((e, i) => GROUND_ALBEDO[i] * e / Math.PI), THREE.LinearSRGBColorSpace);
    // environnement HDR (PMREM) depuis ce ciel
    light.sm = sm;
    let rt = envCache.get(key);
    if (!rt) {
      skyMat.uniforms.uSat.value = envSat;          // balance des blancs partielle de la lumière du ciel
      rt = pmrem.fromScene(envScene, 0, 0.1, 100);
      skyMat.uniforms.uSat.value = SKY_SAT;
      envCache.set(key, rt);
      if (envCache.size > 4) { const [k0, r0] = envCache.entries().next().value; if (k0 !== key) { r0.dispose(); envCache.delete(k0); } }
    }
    scene.environment = rt.texture;
    skyMat.uniforms.uSat.value = SKY_SAT;
  }

  // Brume : la pelouse lointaine prend la couleur de l'horizon dans la direction regardée
  function setHaze(on, from, to) {
    if (!on || !light.sm) { scene.fog.near = 1e5; scene.fog.far = 1e6; return; }
    const d = new THREE.Vector3().subVectors(to, from); d.y = 0;
    if (d.lengthSq() < 1e-6) d.set(0, 0, -1);
    d.normalize(); d.y = 0.035; d.normalize();
    const L = light.sm.radiance(d).map((v) => v * light.skyScale);
    const l = lum(L);
    scene.fog.color.setRGB(...L.map((v) => Math.max(0, l + (v - l) * SKY_SAT)), THREE.LinearSRGBColorSpace);
    scene.fog.near = 20; scene.fog.far = 320;
  }

  // Cadrage de la caméra d'ombre (repère lumière) : emprise des objets ∩ champ de la caméra,
  // arrondi au texel (pas de scintillement en mouvement) ; biais en unités monde (~1 texel)
  const _corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  const _fr = Array.from({ length: 8 }, () => new THREE.Vector3());
  const _bc = new THREE.Box3(), _bf = new THREE.Box3();
  function fitShadow(dir) {
    const c = casterBox.getCenter(new THREE.Vector3());
    const r = casterBox.getBoundingSphere(new THREE.Sphere()).radius;
    sun.position.copy(c).addScaledVector(dir, r + 2);
    sun.target.position.copy(c);
    sun.updateMatrixWorld(); sun.target.updateMatrixWorld();
    const t = light.tmpCam;
    t.position.copy(sun.position); t.lookAt(c); t.updateMatrixWorld();
    const inv = t.matrixWorldInverse;
    const { min, max } = casterBox;
    let i = 0;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) _corners[i++].set(x, y, z).applyMatrix4(inv);
    _bc.setFromPoints(_corners);
    // champ visible jusqu'au coin le plus éloigné de l'emprise
    camera.updateMatrixWorld();
    const cp = camera.position;
    let dFar = 0;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) dFar = Math.max(dFar, Math.hypot(x - cp.x, y - cp.y, z - cp.z));
    const th = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tw = th * camera.aspect;
    i = 0;
    for (const dd of [camera.near, dFar]) for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      _fr[i++].set(sx * tw * dd, sy * th * dd, -dd).applyMatrix4(camera.matrixWorld).applyMatrix4(inv);
    }
    _bf.setFromPoints(_fr);
    const pad = 0.15;
    let x0 = Math.max(_bc.min.x, _bf.min.x) - pad, x1 = Math.min(_bc.max.x, _bf.max.x) + pad;
    let y0 = Math.max(_bc.min.y, _bf.min.y) - pad, y1 = Math.min(_bc.max.y, _bf.max.y) + pad;
    if (x1 - x0 < 0.5 || y1 - y0 < 0.5) { x0 = _bc.min.x - pad; x1 = _bc.max.x + pad; y0 = _bc.min.y - pad; y1 = _bc.max.y + pad; }
    // carré, taille arrondie à 25 cm, origine calée sur la grille des texels
    const size = Math.ceil(Math.max(x1 - x0, y1 - y0) / 0.25) * 0.25;
    const texel = size / sun.shadow.mapSize.x;
    const cx = Math.round(((x0 + x1) / 2) / texel) * texel, cy = Math.round(((y0 + y1) / 2) / texel) * texel;
    const sc = sun.shadow.camera;
    sc.left = cx - size / 2; sc.right = cx + size / 2; sc.bottom = cy - size / 2; sc.top = cy + size / 2;
    sc.near = Math.max(0.05, -_bc.max.z - pad);
    sc.far = -_bc.min.z + 14;     // au-delà de l'objet : le sol qui reçoit l'ombre portée
    sc.updateProjectionMatrix();
    sun.shadow.normalBias = 1.5 * texel;
    sun.shadow.bias = -(0.8 * texel) / (sc.far - sc.near);
  }

  // Couleurs de poché indépendantes de l'exposition (on compense le tone mapping)
  function compensateCaps() {
    const e = renderer.toneMappingExposure, k = renderer.toneMapping;
    for (const m of allMaterials()) {
      const cap = m.userData?.capColor;
      if (!cap || !cap.isColor) continue;
      if (!m.userData.capColorRef) m.userData.capColorRef = cap.clone();
      const ref = m.userData.capColorRef;
      cap.setRGB(...invToneMap(k, [ref.r, ref.g, ref.b], e), THREE.LinearSRGBColorSpace);
    }
  }

  function setBackground(kind) {
    state.bg = kind;
    sky.visible = kind === 'sky';
    lawnGrp.visible = kind === 'sky';
    catcher.visible = kind !== 'sky';
    outMat.uniforms.uStudio.value = kind === 'sky' ? 0 : 1;
  }

  // Champ vertical adapté au format : en portrait (téléphone), on élargit pour garder le sujet
  function fovFor(fov, aspect) {
    if (aspect >= 1.5) return fov;
    const t = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * Math.pow(1.5 / aspect, 0.65);
    return Math.min(100, THREE.MathUtils.radToDeg(2 * Math.atan(t)));
  }

  let anim = null;
  function setView(name, { animate = interactive } = {}) {
    const v = VIEWS[name];
    if (!v) return;
    state.view = name;
    state.lamps = v.lamps ?? !!v.interior;
    applyClip(v.clip || []);
    applyVisibility();
    setBackground(v.bg || 'sky');
    view.interior = !!v.interior;
    view.ev = v.ev ?? (v.interior ? 0.75 : 0);
    view.env = v.env ?? 1;
    envU.value = v.inside ?? (v.interior ? 0.55 : (v.bg === 'studio' ? 0.85 : 0.35));
    view.ao = v.ao ?? (v.interior ? 1.0 : 0.75);
    light.soft = v.sunSoft ?? SUN_RADIUS_DEG;
    scene.environmentIntensity = view.env;
    renderer.toneMappingExposure = Math.pow(2, view.ev);
    setSun(v.sun || [9, 14, 11], v.envSat ?? (v.bg === 'studio' ? ENV_SAT_STUDIO : ENV_SAT));
    compensateCaps();
    view.baseFov = v.fov;
    camera.fov = fovFor(v.fov, camera.aspect);
    camera.near = v.interior ? 0.05 : 0.2;
    camera.updateProjectionMatrix();
    requestRender();
    const to = new THREE.Vector3(...v.pos), tg = new THREE.Vector3(...v.target);
    setHaze(v.bg !== 'studio', to, tg);
    anim = null;
    if (!animate || !controls) {
      camera.position.copy(to); camera.lookAt(tg);
      if (controls) controls.target.copy(tg);
      return;
    }
    anim = { from: camera.position.clone(), fromT: controls.target.clone(), to, tg, t0: performance.now(), dur: 900 };
  }

  function stepAnim() {
    if (!anim) return;
    const k = Math.min(1, (performance.now() - anim.t0) / anim.dur);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(anim.from, anim.to, e);
    if (controls) controls.target.lerpVectors(anim.fromT, anim.tg, e);
    camera.lookAt(controls ? controls.target : anim.tg);
    if (k >= 1) anim = null;
  }

  function resize(w = container.clientWidth, h = container.clientHeight) {
    renderer.setSize(w, h, interactive);
    camera.aspect = w / h;
    camera.fov = fovFor(view.baseFov, camera.aspect);
    camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    const W = Math.max(1, Math.floor(w * pr)), H = Math.max(1, Math.floor(h * pr));
    rtFrame.setSize(W, H);
    for (const t of rtAcc) t.setSize(W, H);
    const k = aoScale(), aw = Math.max(1, Math.round(W * k)), ah = Math.max(1, Math.round(H * k));
    for (const t of rtAO) t.setSize(aw, ah);
    gtao.setSize(aw, ah);
    requestRender();
  }

  // -------------------------------------------------------------------------
  // Rendu d'un échantillon
  // -------------------------------------------------------------------------
  const _u = new THREE.Vector3(), _v = new THREE.Vector3();
  function sunSample(i) {
    const d = light.dir.clone();
    if (i > 0 && light.soft > 0) {
      const r = Math.tan(THREE.MathUtils.degToRad(light.soft)) * Math.sqrt(halton(i, 5));
      const a = 2 * Math.PI * halton(i, 7);
      _u.set(0, 1, 0).cross(d).normalize(); _v.copy(d).cross(_u).normalize();
      d.addScaledVector(_u, r * Math.cos(a)).addScaledVector(_v, r * Math.sin(a)).normalize();
    }
    return d;
  }

  function renderSample(i, { jitter = true, ao = false } = {}) {
    const W = rtFrame.width, H = rtFrame.height;
    fitShadow(sunSample(jitter ? i : 0));
    camera.updateProjectionMatrix();
    if (jitter && i > 0) {
      const jx = halton(i, 2) - 0.5, jy = halton(i, 3) - 0.5;
      const e = camera.projectionMatrix.elements;
      e[8] += (2 * jx) / W; e[9] += (2 * jy) / H;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    }
    camera.updateMatrixWorld();
    sky.position.copy(camera.position);
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(rtFrame);
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    // couleur -> accumulation
    const src = rtAcc[acc.ping], dst = rtAcc[1 - acc.ping];
    blendMat.uniforms.tPrev.value = src.texture;
    blendMat.uniforms.tNew.value = rtFrame.texture;
    blendMat.uniforms.uWeight.value = 1 / (acc.n + 1);
    renderer.setRenderTarget(dst);
    quadBlend.render(renderer);
    acc.ping = 1 - acc.ping; acc.n++;
    // occlusion ambiante -> accumulation séparée
    if (ao) {
      const skyVis = sky.visible, catVis = catcher.visible;
      sky.visible = false; catcher.visible = false;
      const hidden = transparentMeshes.filter((m) => m.visible);
      hidden.forEach((m) => { m.visible = false; });
      gtao.render(renderer, null, null);
      hidden.forEach((m) => { m.visible = true; });
      sky.visible = skyVis; catcher.visible = catVis;
      const s2 = rtAO[acc.aoPing], d2 = rtAO[1 - acc.aoPing];
      blendMat.uniforms.tPrev.value = s2.texture;
      blendMat.uniforms.tNew.value = gtao.gtaoMap;
      blendMat.uniforms.uWeight.value = 1 / (acc.aoN + 1);
      renderer.setRenderTarget(d2);
      quadBlend.render(renderer);
      acc.aoPing = 1 - acc.aoPing; acc.aoN++;
    }
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(null);
  }

  function output() {
    outMat.uniforms.tColor.value = rtAcc[acc.ping].texture;
    const hasAO = acc.aoN > 0;
    outMat.uniforms.tAO.value = hasAO ? rtAO[acc.aoPing].texture : white;
    outMat.uniforms.uAO.value = hasAO ? view.ao : 0;
    renderer.setRenderTarget(null);
    quadOut.render(renderer);
  }

  function resetAccum() { acc.n = 0; acc.aoN = 0; }

  // -------------------------------------------------------------------------
  // Boucle interactive : rendu à la demande + affinage progressif au repos
  // -------------------------------------------------------------------------
  const frameCallbacks = new Set();
  const lastCam = { m: new THREE.Matrix4(), p: new THREE.Matrix4(), valid: false };
  const loopState = { dirty: true, lastChange: 0, lastT: 0 };
  const ACC_TARGET = hq ? 32 : 16;
  const AO_FRAMES_INTERACTIVE = hq ? 8 : 4;
  const IDLE_MS = 300;

  function requestRender() { loopState.dirty = true; }

  function cameraChanged() {
    camera.updateMatrixWorld();
    const changed = !lastCam.valid || !lastCam.m.equals(camera.matrixWorld) || !lastCam.p.equals(camera.projectionMatrix);
    if (changed) { lastCam.m.copy(camera.matrixWorld); lastCam.p.copy(camera.projectionMatrix); lastCam.valid = true; }
    return changed;
  }

  function renderOnce() {
    resetAccum();
    renderSample(0, { jitter: false, ao: useAO && (hq || !interactive) });
    output();
    state.frames = acc.n;
  }

  function loop(t) {
    const dt = loopState.lastT ? Math.min(0.1, (t - loopState.lastT) / 1000) : 1 / 60;
    loopState.lastT = t;
    for (const fn of frameCallbacks) { try { fn(dt); } catch (e) { console.error(e); } }
    stepAnim();
    if (controls && controls.enabled) controls.update();
    const moved = cameraChanged();
    if (moved || loopState.dirty) {
      loopState.dirty = false;
      loopState.lastChange = t;
      renderOnce();                       // image nette immédiate (AO seulement sur ordinateur)
      return;
    }
    // au repos : affinage progressif, puis plus aucun rendu (image convergée)
    if (t - loopState.lastChange > IDLE_MS && acc.n < ACC_TARGET) {
      renderSample(acc.n, { jitter: true, ao: useAO && acc.aoN < AO_FRAMES_INTERACTIVE });
      output();
      state.frames = acc.n;
    }
  }

  if (interactive) {
    window.addEventListener('resize', () => resize());
    renderer.setAnimationLoop(loop);
  }

  // -------------------------------------------------------------------------
  // Image fixe "qualité photo" (utilisée par tools/render.mjs)
  //   opts.frames : nombre d'échantillons (défaut 32, ou moins si le budget est atteint)
  //   opts.budget : temps max en secondes (défaut 150 ; illimité si frames est imposé) ; minimum 4 échantillons
  // -------------------------------------------------------------------------
  const app = {};
  async function snapshot(name, w, h, opts = {}) {
    const t0 = performance.now();
    resize(w, h);
    setView(name, { animate: false });
    const N = Math.max(1, opts.frames ?? 32);
    const budget = (opts.budget ?? (opts.frames ? Infinity : 150)) * 1000;
    const minFrames = Math.min(N, opts.minFrames ?? 4);
    const aoFrames = useAO ? Math.min(N, opts.aoFrames ?? 4) : 0;
    // synchronisation réelle (lecture d'un pixel) : gl.finish() ne bloque pas avec tous les pilotes
    const px = RT_TYPE === THREE.HalfFloatType ? new Uint16Array(4) : new Uint8Array(4);
    const sync = () => renderer.readRenderTargetPixels(rtAcc[acc.ping], 0, 0, 1, 1, px);
    resetAccum();
    let tFrame = 0;
    for (let i = 0; i < N; i++) {
      const ts = performance.now();
      renderSample(i, { jitter: true, ao: i < aoFrames });
      sync();
      tFrame = performance.now() - ts;
      if (i + 1 >= minFrames && performance.now() - t0 + tFrame > budget) break;
      await new Promise((r) => setTimeout(r, 0));
    }
    output();
    state.frames = acc.n;
    app.lastSnapshot = { view: name, w, h, frames: acc.n, aoFrames: acc.aoN, seconds: +((performance.now() - t0) / 1000).toFixed(1) };
    return renderer.domElement.toDataURL('image/png');
  }

  // -------------------------------------------------------------------------
  // Repères projetés (légendes HTML posées par la page) : objets avec userData.callouts
  //   [{ view, text, pos:[x,y,z] (repère spec.js, mètres) }]
  // -------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  function chainVisible(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
  function projectCallouts(viewName = state.view, { occlusion = true } = {}) {
    const size = renderer.getSize(new THREE.Vector2());
    camera.updateMatrixWorld();
    const out = [];
    const camPos = camera.getWorldPosition(new THREE.Vector3());
    model.traverse((o) => {
      const list = o.userData.callouts;
      if (!Array.isArray(list)) return;
      for (const c of list) {
        if (c.view && viewName && c.view !== viewName) continue;
        const p = new THREE.Vector3(...c.pos);
        const ndc = p.clone().project(camera);
        const x = (ndc.x + 1) / 2 * size.x, y = (1 - ndc.y) / 2 * size.y;
        const viewZ = p.clone().applyMatrix4(camera.matrixWorldInverse).z;
        let visible = viewZ < 0 && ndc.z < 1 && x >= 0 && x <= size.x && y >= 0 && y <= size.y && chainVisible(o);
        if (visible && state.clip.some((pl) => pl.distanceToPoint(p) < -0.003)) visible = false;
        if (visible && occlusion) {
          const dir = p.clone().sub(camPos); const dist = dir.length(); dir.normalize();
          raycaster.set(camPos, dir); raycaster.near = camera.near; raycaster.far = dist - 0.02;
          const hits = raycaster.intersectObject(model, true);
          visible = !hits.some((hh) => {
            const mats = Array.isArray(hh.object.material) ? hh.object.material : [hh.object.material];
            if (mats.some((m) => m.transparent) || !chainVisible(hh.object)) return false;
            return !state.clip.some((pl) => pl.distanceToPoint(hh.point) < 0);
          });
        }
        out.push({ ...c, text: c.text, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, visible });
      }
    });
    return out;
  }

  function setControlsEnabled(on) {
    if (!controls) return;
    if (on && !controls.enabled) {
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const d = Math.max(1.5, controls.target.distanceTo(camera.position));
      controls.target.copy(camera.position).addScaledVector(fwd, Math.min(d, 6));
    }
    controls.enabled = !!on;
    requestRender();
  }

  Object.assign(app, {
    THREE, scene, camera, renderer, model, controls, loaded, state,
    setView, resize, renderOnce, snapshot, applyVisibility, setPlacoHighlight,
    setAO: (on) => { useAO = !!on; requestRender(); },
    get ao() { return useAO; },
    setToggle: (key, val) => { state[key] = val; applyVisibility(); },
    onFrame: (fn) => { frameCallbacks.add(fn); return () => frameCallbacks.delete(fn); },
    requestRender,
    setControlsEnabled,
    projectCallouts,
    // réglages avancés (essais, page de démonstration)
    setToneMapping: (tm) => { renderer.toneMapping = tm; compensateCaps(); requestRender(); },
  });
  resize();
  return app;
}
