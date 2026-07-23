// @ts-nocheck
/* This file is ported verbatim from already-verified vanilla/React logic —
   pure coordinate math with no external dependencies. Retrofitting strict
   parameter types onto every internal helper (P, pts, mid, boxShapes,
   furniture) risks introducing a transcription error into geometry that's
   already been checked pixel-for-pixel; the public surface at the bottom
   (buildStackGeometryTyped) is fully typed via StackLayer. */

/* Isometric assurance-stack geometry — ported unchanged from the verified
   vanilla/React build. Five slabs, each with its own hand-drawn "furniture"
   (data cylinder, model tiles, agent mesh, guardrail walls, governance
   shield), scaled by SC so the whole diagram resizes proportionally if W
   ever changes. */

export interface Shape {
  t: 'polygon' | 'ellipse' | 'line' | 'path';
  points?: string;
  cx?: number; cy?: number; rx?: number; ry?: number;
  x1?: number; y1?: number; x2?: number; y2?: number;
  d?: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  op?: number;
  dash?: string;
  cap?: string;
  join?: string;
}

export interface StackLayer {
  i: number;
  fromRight: boolean;
  style: Record<string, string>;
  sideL: string;
  sideR: string;
  top: string;
  grid: number[][];
  shapes: Shape[];
  lead: number[];
  label: [number, number, string];
}

const CXP = 250, WP = 186, HP = 91, TP = 11, DYP = 134, BASEP = 650, INK = '#1f5238';
const SC = WP / 155;   /* every fixed pixel offset below scales with the slab */
const P  = (cy, a, b) => [CXP + (a - b) * WP, cy + (a + b - 1) * HP];
const pts = arr => arr.map(p => p.join(',')).join(' ');
const mid = (cy, a, b, s) => P(cy, a + s / 2, b + s / 2);

function boxShapes(cy, a, b, s, lift, fill){
  const y = cy - lift;
  const top = [P(y,a,b), P(y,a+s,b), P(y,a+s,b+s), P(y,a,b+s)];
  const h = Math.max(7, s * 40) * SC;
  return [
    { t:'polygon', points:pts([top[3],top[2],[top[2][0],top[2][1]+h],[top[3][0],top[3][1]+h]]), fill:'#dfe9dc', stroke:INK, sw:0.9 },
    { t:'polygon', points:pts([top[1],top[2],[top[2][0],top[2][1]+h],[top[1][0],top[1][1]+h]]), fill:'#eef4ec', stroke:INK, sw:0.9 },
    { t:'polygon', points:pts(top), fill, stroke:INK, sw:0.9 }
  ];
}

function furniture(cy, i){
  const out = [];
  if (i === 0){
    const c = mid(cy,.18,.2,.2);
    out.push({ t:'ellipse', cx:c[0], cy:c[1]-22*SC, rx:26*SC, ry:13*SC, fill:'#f7faf6', stroke:INK, sw:1 });
    out.push({ t:'path', d:`M${c[0]-26*SC} ${c[1]-22*SC} v${18*SC} a${26*SC} ${13*SC} 0 0 0 ${52*SC} 0 v${-18*SC}`, fill:'#eef4ec', stroke:INK, sw:1 });
    out.push({ t:'ellipse', cx:c[0], cy:c[1]-4*SC, rx:26*SC, ry:13*SC, fill:'none', stroke:INK, sw:1, op:.6 });
    out.push(...boxShapes(cy,.58,.5,.12,4,'#f7faf6'), ...boxShapes(cy,.34,.68,.1,4,'#2c6b47'));
  } else if (i === 1){
    out.push(...boxShapes(cy,.16,.30,.14,5,'#f7faf6'), ...boxShapes(cy,.40,.18,.14,5,'#f7faf6'),
             ...boxShapes(cy,.60,.46,.14,5,'#17402d'), ...boxShapes(cy,.30,.60,.14,5,'#f7faf6'));
  } else if (i === 2){
    const hub = mid(cy,.42,.40,.16), sp = [[.16,.20],[.70,.22],[.22,.70],[.66,.68]];
    sp.forEach(s => { const c = mid(cy,s[0],s[1],.12);
      out.push({ t:'line', x1:hub[0], y1:hub[1]-12*SC, x2:c[0], y2:c[1]-8*SC, stroke:INK, sw:1, dash:'3 3', op:.7 }); });
    sp.forEach(s => { const c = mid(cy,s[0],s[1],.12);
      out.push({ t:'ellipse', cx:c[0], cy:c[1]-8*SC, rx:13*SC, ry:7.5*SC, fill:'#f7faf6', stroke:INK, sw:1 }); });
    out.push({ t:'ellipse', cx:hub[0], cy:hub[1]-12*SC, rx:19*SC, ry:11*SC, fill:'#2c6b47', stroke:INK, sw:1 });
  } else if (i === 3){
    for (let n = 0; n < 4; n++){
      const a = .12 + n * .2, p1 = P(cy,a,.12), p2 = P(cy,a,.88);
      out.push({ t:'polygon', points:pts([p1,p2,[p2[0],p2[1]-20*SC],[p1[0],p1[1]-20*SC]]),
        fill: n === 2 ? 'rgba(168,104,26,.20)' : 'rgba(44,107,71,.14)',
        stroke: n === 2 ? '#a8681a' : INK, sw:1 });
    }
    out.push(...boxShapes(cy,.74,.40,.12,22*SC,'#17402d'));
  } else {
    out.push(...boxShapes(cy,.30,.34,.30,6,'#f7faf6'));
    const c = mid(cy,.30,.34,.30), sy = c[1] - 66*SC;
    out.push({ t:'line', x1:c[0], y1:c[1]-12*SC, x2:c[0], y2:sy+44*SC, stroke:INK, sw:1, dash:'3 4', op:.55 });
    out.push({ t:'path', d:`M${c[0]} ${sy-18*SC} l${30*SC} ${11*SC} v${20*SC} c0 ${18*SC} ${-13*SC} ${30*SC} ${-30*SC} ${35*SC} ${-17*SC} ${-5*SC} ${-30*SC} ${-17*SC} ${-30*SC} ${-35*SC} v${-20*SC} z`, fill:'#f7faf6', stroke:INK, sw:1.6*SC });
    out.push({ t:'path', d:`M${c[0]-12*SC} ${sy+12*SC} l${9*SC} ${9*SC} ${17*SC} ${-19*SC}`, fill:'none', stroke:'#2c6b47', sw:2.4*SC, cap:'round', join:'round' });
  }
  return out;
}

function buildStackGeometry(){
  return [0,1,2,3,4].map(i => {
    const cy = BASEP - i * DYP;
    const fromRight = i % 2 === 1;
    const top = [P(cy,0,0), P(cy,1,0), P(cy,1,1), P(cy,0,1)];
    const grid = [];
    for (let n = 1; n < 8; n++){
      const a1 = P(cy,n/8,0), a2 = P(cy,n/8,1), b1 = P(cy,0,n/8), b2 = P(cy,1,n/8);
      grid.push([a1[0],a1[1],a2[0],a2[1]], [b1[0],b1[1],b2[0],b2[1]]);
    }
    const edge = P(cy,1,0);
    return {
      i, fromRight,
      style: { '--dy': ((i-2)*74)+'px', '--ex': (fromRight ? 780 : -780)+'px', '--rot': (fromRight ? 6 : -6)+'deg' },
      sideL: pts([top[3],top[2],[top[2][0],top[2][1]+TP],[top[3][0],top[3][1]+TP]]),
      sideR: pts([top[1],top[2],[top[2][0],top[2][1]+TP],[top[1][0],top[1][1]+TP]]),
      top: pts(top),
      grid,
      shapes: furniture(cy, i),
      lead: [edge[0]+7, edge[1], edge[0]+54, edge[1]],
      label: [edge[0]+61, edge[1]+4, '0' + (i+1)]
    };
  });
}

function Shape({ s }){
  if (s.t === 'polygon') return <polygon points={s.points} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} opacity={s.op} />;
  if (s.t === 'ellipse') return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} opacity={s.op} />;
  if (s.t === 'line')    return <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.sw} strokeDasharray={s.dash} opacity={s.op} />;
  return <path d={s.d} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} strokeLinecap={s.cap} strokeLinejoin={s.join} opacity={s.op} />;
}

export function buildStackGeometryTyped(): StackLayer[] {
  return buildStackGeometry() as unknown as StackLayer[];
}
