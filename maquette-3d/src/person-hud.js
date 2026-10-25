// Habillage 2D de la visite avec personnage (src/person.js) : étiquettes de largeur, bandeau, légende.
// Dessin sur un canevas 2D : sert à la fois à la vidéo (composé sur l'image) et à la visionneuse
// (canevas transparent posé sur la vue 3D).
import { CLEAR, WIDTH_COLORS, fmtWidth } from './clearance.js';

const FONT_BODY = "'Barlow', 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_DISP = "'Barlow Condensed', 'Arial Narrow', 'Barlow', sans-serif";
const INK = '#22272a', SOFT = '#5c6266', PAPER = 'rgba(246,244,239,0.94)', LINE = 'rgba(34,39,42,0.18)';

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

// ov : résultat de personTour.overlay(t) ; camera : caméra three.js ; W, H : taille du canevas (px)
export function drawPersonOverlay(g, ov, { THREE, camera, W, H, scale = 1, legend = true, hud = true, legendBottom = null }) {
  const u = scale;
  const v = new THREE.Vector3();
  const proj = (x, y, z) => { v.set(x, y, z).project(camera); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, ok: v.z < 1 && v.z > -1 }; };

  // --- étiquettes
  const boxes = [];
  const pers = ov.person ? proj(ov.person.x, ov.person.y, ov.person.z) : null;
  const items = ov.labels.map((L) => ({ L, a: proj(L.x, L.y, L.z) })).filter((o) => o.a.ok && o.a.x > -50 && o.a.x < W + 50 && o.a.y > -50 && o.a.y < H + 50);
  items.sort((p, q) => q.a.y - p.a.y);
  for (const { L, a } of items) {
    g.save();
    g.globalAlpha = L.alpha;
    const col = WIDTH_COLORS[L.cls];
    g.font = `600 ${Math.round(19 * u)}px ${FONT_DISP}`;
    const tw = g.measureText(L.text).width;
    g.font = `600 ${Math.round(13.5 * u)}px ${FONT_DISP}`;
    const t1 = g.measureText(L.title.toUpperCase()).width;
    g.font = `400 ${Math.round(12.5 * u)}px ${FONT_BODY}`;
    const t2 = g.measureText(L.sub).width;
    const bw = Math.max(tw + 30 * u, Math.max(t1 + 3 * u, t2) + 22 * u), bh = 58 * u;
    // place : au-dessus du point, décalée à gauche ou à droite (loin du personnage), sans chevauchement
    const side = pers && pers.x > a.x ? -1 : 1;
    let bx = a.x + side * 26 * u - (side < 0 ? bw : 0), by = a.y - 92 * u;
    bx = Math.min(W - bw - 12 * u, Math.max(12 * u, bx));
    by = Math.min(H - bh - 60 * u, Math.max(124 * u, by));
    for (let it = 0; it < 6; it++) {
      const hit = boxes.find((b) => bx < b.x + b.w + 6 * u && bx + bw + 6 * u > b.x && by < b.y + b.h + 6 * u && by + bh + 6 * u > b.y);
      if (!hit) break;
      by = hit.y - bh - 8 * u;
      if (by < 100 * u) { by = hit.y + hit.h + 8 * u; }
    }
    boxes.push({ x: bx, y: by, w: bw, h: bh });
    // repère au sol + filet
    g.strokeStyle = col; g.lineWidth = 2.2 * u;
    g.beginPath(); g.arc(a.x, a.y, 7 * u, 0, Math.PI * 2); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(a.x, a.y, 3 * u, 0, Math.PI * 2); g.fill();
    const ax = Math.min(bx + bw - 10 * u, Math.max(bx + 10 * u, a.x)), ay = by + bh;
    g.strokeStyle = 'rgba(34,39,42,0.75)'; g.lineWidth = 1.3 * u;
    g.beginPath(); g.moveTo(a.x, a.y - 7 * u); g.lineTo(ax, ay); g.stroke();
    // cartouche
    g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 8 * u; g.shadowOffsetY = 2 * u;
    roundRect(g, bx, by, bw, bh, 5 * u); g.fillStyle = PAPER; g.fill();
    g.shadowColor = 'transparent';
    g.strokeStyle = LINE; g.lineWidth = 1 * u; g.stroke();
    g.fillStyle = col; roundRect(g, bx, by, 5 * u, bh, 2 * u); g.fill();
    g.fillStyle = INK; g.textBaseline = 'alphabetic';
    g.font = `600 ${Math.round(13.5 * u)}px ${FONT_DISP}`;
    g.fillStyle = SOFT; g.fillText(L.title.toUpperCase(), bx + 14 * u, by + 17 * u);
    g.font = `600 ${Math.round(19 * u)}px ${FONT_DISP}`;
    g.fillStyle = L.cls === 'ok' ? INK : col; g.fillText(L.text, bx + 14 * u, by + 36 * u);
    g.font = `400 ${Math.round(12.5 * u)}px ${FONT_BODY}`;
    g.fillStyle = SOFT; g.fillText(L.sub, bx + 14 * u, by + 51 * u);
    g.restore();
  }

  // --- bandeau "où suis-je / largeur ici"
  if (hud && ov.hud) {
    const h = ov.hud, x = 18 * u, y = 18 * u;
    g.save();
    g.font = `600 ${Math.round(24 * u)}px ${FONT_DISP}`;
    const rw = g.measureText(h.room).width;
    const bw = Math.max(250 * u, rw + 32 * u), bh = 96 * u;
    g.shadowColor = 'rgba(0,0,0,0.16)'; g.shadowBlur = 10 * u; g.shadowOffsetY = 2 * u;
    roundRect(g, x, y, bw, bh, 6 * u); g.fillStyle = PAPER; g.fill();
    g.shadowColor = 'transparent'; g.strokeStyle = LINE; g.lineWidth = u; g.stroke();
    g.fillStyle = SOFT; g.font = `600 ${Math.round(12.5 * u)}px ${FONT_DISP}`;
    g.fillText('VISITE AVEC PERSONNAGE · 1,75 m', x + 16 * u, y + 21 * u);
    g.fillStyle = INK; g.font = `600 ${Math.round(24 * u)}px ${FONT_DISP}`;
    g.fillText(h.room, x + 16 * u, y + 47 * u);
    const col = WIDTH_COLORS[h.cls];
    g.fillStyle = col; roundRect(g, x + 16 * u, y + 60 * u, 14 * u, 14 * u, 3 * u); g.fill();
    g.fillStyle = INK; g.font = `400 ${Math.round(14 * u)}px ${FONT_BODY}`;
    const lbl = 'Largeur de passage ici : ';
    g.fillText(lbl, x + 38 * u, y + 72 * u);
    const lw = g.measureText(lbl).width;
    g.font = `600 ${Math.round(15 * u)}px ${FONT_BODY}`;
    g.fillStyle = h.cls === 'ok' ? INK : col;
    g.fillText(h.text + (h.profile ? '  · de profil' : ''), x + 38 * u + lw, y + 72 * u);
    g.restore();
  }

  // --- légende
  if (legend) {
    const rows = [['ok', `≥ ${fmtWidth(CLEAR.ok)} : confortable`], ['tight', `${fmtWidth(CLEAR.tight).replace(' m', '')} à ${fmtWidth(CLEAR.ok)} : étroit`], ['block', `< ${fmtWidth(CLEAR.tight)} : pas de place`]];
    g.save();
    g.font = `400 ${Math.round(13 * u)}px ${FONT_BODY}`;
    const bw = Math.max(...rows.map((r) => g.measureText(r[1]).width)) + 46 * u, bh = 26 * u + rows.length * 21 * u;
    const x = 18 * u, y = H - bh - (legendBottom ?? 18 * u);
    roundRect(g, x, y, bw, bh, 6 * u); g.fillStyle = PAPER; g.fill(); g.strokeStyle = LINE; g.lineWidth = u; g.stroke();
    g.fillStyle = SOFT; g.font = `600 ${Math.round(12 * u)}px ${FONT_DISP}`;
    g.fillText('LARGEUR DE PASSAGE (SOL COLORÉ)', x + 14 * u, y + 19 * u);
    rows.forEach(([cls, txt], i) => {
      const yy = y + 28 * u + i * 21 * u;
      g.fillStyle = WIDTH_COLORS[cls]; roundRect(g, x + 14 * u, yy, 14 * u, 14 * u, 3 * u); g.fill();
      g.fillStyle = INK; g.font = `400 ${Math.round(13 * u)}px ${FONT_BODY}`;
      g.fillText(txt, x + 36 * u, yy + 12 * u);
    });
    g.restore();
  }
}
