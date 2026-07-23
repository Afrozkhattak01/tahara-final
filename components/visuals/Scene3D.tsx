// @ts-nocheck
/* Ported unchanged from the verified vanilla/React build — same rationale
   as stackGeometry.tsx: retrofitting strict types onto already-verified
   canvas/perspective math risks introducing a transcription error into
   logic that's been checked pixel-for-pixel. The `reduce` prop and the
   component's public surface are the only things that matter to callers;
   everything inside the effect is self-contained. */
'use client';

import { useEffect, useRef } from 'react';

/* 3D wireframe background — ported unchanged from the verified React build.
   78 points on a fibonacci sphere, edges between near neighbours, rotated
   on two axes and projected with real perspective. Geometry built once into
   typed arrays, draw calls batched into 7 alpha buckets, DPR capped at 1.5,
   rendered at ~30fps, stops when the tab is hidden. Draws a single static
   frame under prefers-reduced-motion. */
export function Scene3D({ reduce }: { reduce: boolean }){
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const N = 78, LINK = 0.40, FOV = 2.6;
    const SPIN = 0.00016, TILT = 0.00009, BUCKETS = 7, MIN_MS = 32, MAX_DPR = 1.5;

    const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
    const big = new Uint8Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++){
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      px[i] = Math.cos(th) * r; py[i] = y; pz[i] = Math.sin(th) * r;
      big[i] = i % 11 === 0 ? 1 : 0;
    }
    const ea = [], eb = [], ew = [];
    for (let i = 0; i < N; i++){
      for (let j = i + 1; j < N; j++){
        const dx = px[i]-px[j], dy = py[i]-py[j], dz = pz[i]-pz[j];
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < LINK){ ea.push(i); eb.push(j); ew.push(1 - d / LINK * 0.55); }
      }
    }
    const E = ea.length;
    const sx = new Float32Array(N), sy = new Float32Array(N);
    const sk = new Float32Array(N), sz = new Float32Array(N);
    const edgeBins = [], nodeBins = [];
    for (let i = 0; i < BUCKETS; i++){ edgeBins.push([]); nodeBins.push([]); }

    let W = 0, H = 0, R = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1;
      R = Math.min(W, H) * 0.56;
    };
    resize();
    window.addEventListener('resize', resize);

    let scrollRot = 0, wantScrollRot = 0, lx = 0, ly = 0, wlx = 0, wly = 0;
    const onScroll = () => { wantScrollRot = (window.scrollY || 0) * 0.00042; };
    const onMove = e => {
      wlx = (e.clientX / window.innerWidth  - 0.5) * 0.24;
      wly = (e.clientY / window.innerHeight - 0.5) * 0.18;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const hoverable = matchMedia('(hover:hover)').matches;
    if (hoverable) window.addEventListener('pointermove', onMove, { passive: true });

    function draw(ay, ax){
      ctx.clearRect(0, 0, W, H);
      const cy = Math.cos(ay), siy = Math.sin(ay);
      const cx = Math.cos(ax), six = Math.sin(ax);
      const ox = W / 2, oy = H * 0.46;

      for (let i = 0; i < N; i++){
        const x1 =  px[i] * cy + pz[i] * siy;
        const z1 = -px[i] * siy + pz[i] * cy;
        const y2 =  py[i] * cx - z1 * six;
        const z2 =  py[i] * six + z1 * cx;
        const k  = FOV / (FOV + z2);
        sx[i] = ox + x1 * R * k; sy[i] = oy + y2 * R * k; sk[i] = k; sz[i] = z2;
      }
      for (let i = 0; i < BUCKETS; i++){ edgeBins[i].length = 0; nodeBins[i].length = 0; }

      for (let e = 0; e < E; e++){
        const i = ea[e], j = eb[e];
        const near = 1 - ((sz[i] + sz[j]) * 0.5 + 1) * 0.5;
        const a = (0.05 + near * 0.17) * ew[e];
        let bin = (a / 0.22 * BUCKETS) | 0;
        if (bin < 0) bin = 0; else if (bin >= BUCKETS) bin = BUCKETS - 1;
        edgeBins[bin].push(i, j);
      }
      for (let b = 0; b < BUCKETS; b++){
        const list = edgeBins[b];
        if (!list.length) continue;
        ctx.strokeStyle = 'rgba(31,82,56,' + (((b + 0.5) / BUCKETS) * 0.22).toFixed(3) + ')';
        ctx.beginPath();
        for (let q = 0; q < list.length; q += 2){
          ctx.moveTo(sx[list[q]], sy[list[q]]);
          ctx.lineTo(sx[list[q+1]], sy[list[q+1]]);
        }
        ctx.stroke();
      }
      for (let i = 0; i < N; i++){
        const near = 1 - (sz[i] + 1) * 0.5;
        const a = 0.10 + near * 0.34;
        let bin = (a / 0.46 * BUCKETS) | 0;
        if (bin < 0) bin = 0; else if (bin >= BUCKETS) bin = BUCKETS - 1;
        nodeBins[bin].push(i);
      }
      for (let b = 0; b < BUCKETS; b++){
        const list = nodeBins[b];
        if (!list.length) continue;
        ctx.fillStyle = 'rgba(31,82,56,' + (((b + 0.5) / BUCKETS) * 0.46).toFixed(3) + ')';
        ctx.beginPath();
        for (let q = 0; q < list.length; q++){
          const i = list[q], rad = (big[i] ? 2.4 : 1.5) * sk[i];
          ctx.moveTo(sx[i] + rad, sy[i]);
          ctx.arc(sx[i], sy[i], rad, 0, 6.2832);
        }
        ctx.fill();
      }
    }

    if (reduce){
      draw(0.6, 0.42);
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('scroll', onScroll);
        if (hoverable) window.removeEventListener('pointermove', onMove);
      };
    }

    const t0 = performance.now();
    let last = 0, running = true, raf = 0;
    const step = now => {
      if (!running){ raf = 0; return; }
      raf = requestAnimationFrame(step);
      if (now - last < MIN_MS) return;
      last = now;
      const t = now - t0;
      scrollRot += (wantScrollRot - scrollRot) * 0.08;
      lx += (wlx - lx) * 0.06;
      ly += (wly - ly) * 0.06;
      draw(t * SPIN + scrollRot + lx, 0.34 + Math.sin(t * TILT) * 0.18 + ly);
    };
    const onVis = () => {
      running = !document.hidden;
      if (running && !raf) raf = requestAnimationFrame(step);
    };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      if (hoverable) window.removeEventListener('pointermove', onMove);
    };
  }, [reduce]);

  return <canvas id="scene3d" ref={ref} aria-hidden="true" />;
}