/* Camisetas Fútbol UY — historia con scroll y manifiesto horizontal */
(() => {
  const $ = (q) => document.querySelector(q);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const img = (s) => `assets/prendas/${s}.webp`;

  const story = $("#historia"), proc = $("#proc"), cardsEl = $("#cards");
  const panel = $("#panel"), panelBg = panel.querySelector(".panel-bg"), obj = $("#panelObj"), objImg = $("#panelImg"), black = $("#blackout");
  const manif = $("#manif"), track = $("#mTrack");

  // ---------- utilidades ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bez = (x1, y1, x2, y2) => (x) => { // cubic-bezier para curvas a medida
    let t = x;
    for (let i = 0; i < 6; i++) {
      const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
      const d = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
      if (Math.abs(d) < 1e-6) break;
      t = clamp(t - cx / d);
    }
    return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  };
  const eGlide = bez(0.25, 0.75, 0.2, 1);
  const follow = (w, dt) => 1 - Math.pow(1 - w, dt / 16.67);

  // ---------- tarjetas ----------
  const CARDS = [
    "penarol-retro-frente", "boca-paredes-frente", "real-madrid-valverde-frente",
    "uruguay-suarez-frente", "brasil-buzo-frente", "bayern-buzo-frente",
    "deportivo-gimenez-frente", "noruega-haaland-frente", "north-face-campera-frente",
    "uruguay-suarez-espalda", "penarol-retro-espalda", "boca-paredes-espalda",
  ];
  const NC = CARDS.length;
  const cards = CARDS.map((s) => {
    const d = document.createElement("div");
    d.className = "card3";
    d.innerHTML = `<img src="${img(s)}" alt="" loading="lazy" draggable="false">`;
    cardsEl.appendChild(d);
    return d;
  });
  const shown = cards.map(() => null); // pose mostrada [x,y,r,s,o]

  // ---------- medidas ----------
  let W, H, mobile, cw, storyTop, storyH, mTop, mH, trackW;
  function size() {
    W = innerWidth; H = innerHeight;
    mobile = W < 820 && W < H * 1.1;
    const pfs = mobile ? Math.min(W * 0.085, 40) : Math.min(W * 0.04, H * 0.072);
    const sfs = mobile ? Math.min(W * 0.09, 44) : Math.min(W * 0.046, H * 0.085);
    const mfs = mobile ? Math.min(W * 0.13, H * 0.085) : Math.min(W * 0.062, H * 0.12);
    cw = mobile ? Math.min(W * 0.3, H * 0.2) : Math.min(W / 1440, H / 780) * 218;
    root.style.setProperty("--pfs", pfs + "px");
    root.style.setProperty("--sfs", sfs + "px");
    root.style.setProperty("--mfs", mfs + "px");
    root.style.setProperty("--objh", (mobile ? Math.min(H * 0.44, W * 0.95) : Math.min(H * 0.58, W * 0.38)) + "px");
    cardsEl.style.setProperty("--cw", cw);
    const r1 = story.getBoundingClientRect(), r2 = manif.getBoundingClientRect();
    storyTop = r1.top + scrollY; storyH = r1.height;
    mTop = r2.top + scrollY; mH = r2.height;
    trackW = track.scrollWidth;
  }

  // separación entre tarjetas en arco: la cuerda entre centros = 1.05 × ancho
  const step = (R) => 2 * Math.asin((1.05 * cw) / (2 * R));

  const SCAT_D = [[.08, .46, -20], [.2, .86, -12], [.8, .84, 14], [.38, 1.02, -8], [.92, .42, 16], [.62, 1.02, 9]];
  const SCAT_M = [[.06, .62, -20], [.45, .7, 12], [.94, .62, 16], [.22, .95, -14], [.74, .97, 9], [.5, 1.3, 0]];

  function scatter(i) {
    if (i > 5) return [W * 0.5, H * 1.4, 0, 1, 0];
    const s = (mobile ? SCAT_M : SCAT_D)[i];
    let y = s[1];
    if (H < 500 && y < 0.1) y += 0.08;
    return [W * s[0], H * y, s[2], 1, 1];
  }
  function below(i) {
    const s = scatter(i);
    return [s[0], H + cw * 1.2, s[2] + 8, 1, i > 5 ? 0 : 1];
  }
  function pile(i) {
    const sg = i % 2 ? 1 : -1;
    return [W * 0.5 + ((i % 3) - 1) * cw * 0.08, H * (mobile ? 0.7 : 0.76) +(((i * 7) % 5) - 2) * cw * 0.04, sg * (4 + i * 1.3), 1, 1];
  }
  function wheel(i, rot) {
    const R = mobile ? W * 1.2 : (900 * W) / 1440;
    const cx = W * 0.5, cy = (mobile ? H * 0.78 : H * 0.84) + R;
    let slot = (((i + rot) % NC) + NC) % NC - (NC - 1) / 2;
    const a = slot * step(R);
    const deg = (a * 180) / Math.PI;
    return [cx + R * Math.sin(a), cy - R * Math.cos(a), deg, 1, Math.abs(deg) < 62 ? 1 : 0];
  }
  const mix = (a, b, t) => a.map((v, k) => lerp(v, b[k], t));

  function target(i, p) {
    // entrada: suben desde abajo mientras la escena llega a la pantalla
    if (p < 0.14) {
      const t = eInOut(range(p, -0.1 + i * 0.006, -0.03 + i * 0.006));
      return mix(below(i), scatter(i), t);
    }
    if (p < 0.24) {
      const t = eInOut(range(p, 0.14, 0.24));
      const a = scatter(i);
      if (i > 5) a[0] = W * 0.5, a[1] = H * 0.9;
      const b = pile(i);
      const m = mix(a, b, t);
      if (i > 5) m[4] = t;
      return m;
    }
    if (p < 0.34) return mix(pile(i), wheel(i, 0), eGlide(range(p, 0.24, 0.34)));
    return wheel(i, -3 * eInOut(range(p, 0.34, 0.5)));
  }

  // ---------- manifiesto ----------
  const SHIRT = (s, h, r) => ({ pop: `<img class="m-shirt" src="${img(s)}" alt="" style="height:${h}em" draggable="false">`, r });
  const LABEL = (t, bg, r, small, fg) => ({ pop: `<span class="m-label${small ? " s" : ""}" style="background:${bg}${fg ? ";color:" + fg : ""}">${t}</span>`, r });
  const STAR = { pop: `<svg class="m-star" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 0c.8 5.6 3.6 8.6 10 10-6.4 1.4-9.2 4.4-10 10-.8-5.6-3.6-8.6-10-10 6.4-1.4 9.2-4.4 10-10z"/></svg>`, r: 0 };
  const CEL = "#8cc3ec", YEL = "#f5d90a", WHT = "#f1efec", PINK = "#f06aa8", TURQ = "#8ee6df";

  // Palabras con * van en gris
  const ITEMS = [
    { intro: [["*Hecho", "para", "la"], ["tribuna", "*y la calle."]] },
    SHIRT("penarol-retro-frente", 1.25, -12),
    "Camisetas",
    { stack: [LABEL("retro", YEL, -8), LABEL("y de temporada", CEL, 6, true)] },
    "*de", "clubes,", "selecciones",
    STAR, SHIRT("boca-paredes-frente", 0.8, 6),
    "*y", "leyendas", "*como",
    LABEL("Suárez", CEL, -8), SHIRT("uruguay-suarez-frente", 1.05, 10), STAR, LABEL("Valverde", PINK, 3, false, "#0b0b0c"),
    "*y", LABEL("Giménez", TURQ, -10), SHIRT("deportivo-gimenez-frente", 1.05, -8),
    "que", "llegan", "*a", "*los", "19", "departamentos", "*con", "*un", "*solo", "mensaje.",
  ];

  function wordEl(t) {
    const g = t.startsWith("*");
    const s = document.createElement("span");
    s.className = "m-word" + (g ? " gr" : "");
    [...(g ? t.slice(1) : t)].forEach((ch, j) => {
      const i = document.createElement("i");
      i.style.setProperty("--c", j);
      i.textContent = ch === " " ? " " : ch;
      s.appendChild(i);
    });
    return s;
  }
  function popEl(o) {
    const s = document.createElement("span");
    s.className = "m-pop";
    s.style.setProperty("--r", o.r + "deg");
    s.innerHTML = o.pop;
    return s;
  }
  const reveal = []; // elementos que se revelan al pasar el borde
  ITEMS.forEach((it) => {
    let el;
    if (typeof it === "string") el = wordEl(it);
    else if (it.intro) {
      el = document.createElement("div");
      el.className = "m-intro";
      it.intro.forEach((row) => {
        const r = document.createElement("div");
        row.forEach((w, k) => { if (k) r.append(" "); r.appendChild(wordEl(w)); });
        el.appendChild(r);
      });
      const tags = [
        [LABEL("desde Artigas", CEL, -6, true), "top:-.95em;left:0"],
        [LABEL("hasta Montevideo", WHT, -4, true), "top:-1.1em;left:4.2em"],
        [LABEL("envíos a todo el país", YEL, 4, true), "bottom:-1em;left:.6em"],
      ];
      tags.forEach(([o, css]) => { const p = popEl(o); p.style.cssText += css; el.appendChild(p); });
    } else if (it.stack) {
      el = document.createElement("div");
      el.className = "m-stack";
      it.stack.forEach((o) => el.appendChild(popEl(o)));
    } else el = popEl(it);
    track.appendChild(el);
    reveal.push(el);
  });
  const sp = document.createElement("span"); sp.className = "m-space"; track.appendChild(sp);

  function revealEl(el) {
    if (el.dataset.on) return;
    el.dataset.on = 1;
    const parts = el.matches(".m-word,.m-pop") ? [el] : [...el.querySelectorAll(".m-word,.m-pop")];
    parts.forEach((p, k) => setTimeout(() => p.classList.add("on"), k * 60));
  }

  // ---------- reducido: estado final sin movimiento ----------
  size();
  if (reduce) {
    proc.style.opacity = 1; proc.classList.add("on");
    cards.forEach((c, i) => {
      const t = scatter(i);
      c.style.transform = `translate(${t[0]}px,${t[1]}px) rotate(${t[2]}deg)`;
      c.style.opacity = t[4];
    });
    reveal.forEach(revealEl);
    addEventListener("resize", size);
    return;
  }

  // retrasos de las palabras
  proc.querySelectorAll(".w").forEach((w, i) => w.style.setProperty("--d", i * 0.11 + "s"));
  [0, 0.12, 0.24, 0.45, 0.57].forEach((d, i) => panel.querySelectorAll(".pw-tl .w")[i]?.style.setProperty("--d", d + "s"));
  [0.6, 0.72, 0.84, 0.96, 1.08].forEach((d, i) => panel.querySelectorAll(".pw-br .w")[i]?.style.setProperty("--d", d + "s"));

  // ---------- recorrido guiado: los enlaces que bajan pasan por toda la animación ----------
  let touring = false, tourRAF = 0;
  function stopTour() { touring = false; cancelAnimationFrame(tourRAF); }
  function tour(el, hash) {
    size();
    const y0 = scrollY, yT = el.getBoundingClientRect().top + scrollY;
    const storyEnd = storyTop + storyH - H, manifEnd = mTop + mH - H;
    if (yT <= y0 || y0 >= manifEnd) { el.scrollIntoView({ behavior: "smooth" }); return; }
    // Guion del recorrido: [posición destino, segundos de viaje, segundos de pausa].
    // Cada tramo arranca y frena suave, así la velocidad sube y baja como en una animación;
    // las pausas dejan leer cada texto antes de seguir.
    const at = (p) => storyTop + p * (storyH - H);
    const atM = (m) => mTop + m * (mH - H);
    const script = [
      [at(0), 1.1, 1.3],    // llega la escena: "Clubes de acá y camisetas de todo el mundo"
      [at(0.24), 1.0, 0.2], // las tarjetas se juntan en la pila
      [at(0.34), 0.9, 0],   // la pila se abre en rueda
      [at(0.52), 1.2, 0.3], // la rueda gira
      [at(0.67), 1.0, 1.6], // se abre el panel celeste: "No es solo una camiseta / Es la de tu equipo"
      [at(0.8), 0.9, 0],    // la camiseta gira
      [at(0.96), 1.0, 0.2], // la cámara entra en el 9
      [atM(0), 0.5, 0.2],   // empieza el manifiesto
      [atM(0.34), 1.4, 0.4],
      [atM(0.68), 1.4, 0.4],
      [atM(1), 1.4, 0.5],
      [yT, 0.9, 0],         // llega al destino
    ];
    // tramos (desde la posición actual, saltando lo que ya quedó atrás)
    const segs = [];
    let y = y0, t = 0;
    for (const [yy, mv, hold] of script) {
      if (yy <= y + 2 || yy > yT + 2) continue;
      const dist = yy - y;
      const dur = Math.max(0.35, Math.min(mv, mv * (dist / (H * 1.2)) + 0.35)); // tramos cortos, más rápidos
      segs.push({ y0: y, y1: yy, t0: t, t1: t + dur });
      t += dur;
      if (hold) { segs.push({ y0: yy, y1: yy, t0: t, t1: t + hold }); t += hold; }
      y = yy;
    }
    if (y < yT - 2) { segs.push({ y0: y, y1: yT, t0: t, t1: t + 0.9 }); t += 0.9; }
    const T = t * 1000, t0 = performance.now();
    touring = true;
    const run = (now) => {
      if (!touring) return;
      const u = (now - t0) / 1000;
      const s = segs.find((g) => u < g.t1) || segs[segs.length - 1];
      const k = clamp((u - s.t0) / (s.t1 - s.t0));
      scrollTo({ top: lerp(s.y0, s.y1, eInOut(k)), behavior: "instant" });
      if (now - t0 < T) tourRAF = requestAnimationFrame(run);
      else { touring = false; history.replaceState(null, "", hash); el.querySelector("h2")?.setAttribute("tabindex", "-1"); el.querySelector("h2")?.focus({ preventScroll: true }); }
    };
    tourRAF = requestAnimationFrame(run);
  }
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) =>
    addEventListener(ev, (e) => { if (touring && !(ev === "pointerdown" && e.target.closest("a[href^='#']"))) stopTour(); }, { passive: true }));
  document.querySelectorAll("a[href^='#']:not(.skip)").forEach((a) => {
    const id = a.getAttribute("href");
    const el = id.length > 1 && document.querySelector(id);
    if (!el || !(el.compareDocumentPosition(manif) & Node.DOCUMENT_POSITION_PRECEDING)) return;
    a.addEventListener("click", (e) => { e.preventDefault(); tour(el, id); });
  });

  // ---------- bucle ----------
  let sy = scrollY, last = performance.now(), panelP = 0;
  addEventListener("resize", () => { size(); });
  addEventListener("load", size);
  if (document.fonts) document.fonts.ready.then(size);

  function frame(now) {
    const dt = Math.min(200, now - last); last = now;
    const real = scrollY;
    // desplazamiento suavizado (sin interceptar la rueda): sigue al scroll nativo
    if (Math.abs(real - sy) > H * 3) sy = real; else sy += (real - sy) * follow(0.2, dt);

    const p = (sy - storyTop) / (storyH - H);
    const near = sy + H > storyTop - H * 0.5 && sy < storyTop + storyH;
    if (near) story_(p, dt, now);
    const mp = (sy - mTop) / (mH - H);
    if (sy + H > mTop - H && sy < mTop + mH) manif_(clamp(mp));
    requestAnimationFrame(frame);
  }

  function story_(p, dt, now) {
    // bloque de texto: aparece cuando llega la escena
    proc.style.opacity = clamp((p + 0.07) / 0.04);
    if (p > -0.05) proc.classList.add("on");
    else if (p < -0.11) proc.classList.remove("on");

    let settled = true;
    cards.forEach((c, i) => {
      const t = target(i, p);
      let s = shown[i];
      if (!s) s = shown[i] = t.slice();
      else {
        const k = follow(0.055 + (i % 4) * 0.008, dt);
        for (let j = 0; j < 5; j++) s[j] += (t[j] - s[j]) * k;
      }
      if (Math.abs(t[0] - s[0]) > 3 || Math.abs(t[1] - s[1]) > 3 || Math.abs(t[2] - s[2]) > 1) settled = false;
      c.style.transform = `translate(${s[0]}px,${s[1]}px) rotate(${s[2]}deg) scale(${s[3]})`;
      c.style.opacity = s[4].toFixed(3);
    });

    // panel celeste: espera a que la rueda termine y las tarjetas se asienten
    const allowed = p >= 0.55 && (settled || touring);
    const tgt = allowed ? range(p, 0.55, 0.67) : (p < 0.55 ? 0 : panelP);
    panelP += (tgt - panelP) * follow(touring ? 0.16 : 0.09, dt);
    if (Math.abs(tgt - panelP) < 0.0005) panelP = tgt;
    const e = eInOut(panelP);
    panel.style.visibility = panelP > 0.001 ? "visible" : "hidden";
    const win = mobile ? [0.42, 0.16, 0.06] : [0.17, 0.2, 0.12];
    const top = (0.5 - win[2] - win[1] / 2) * H * (1 - e);
    const bot = (0.5 + win[2] - win[1] / 2) * H * (1 - e);
    const side = ((1 - win[0]) / 2) * W * (1 - e);
    panel.style.clipPath = `inset(${top}px ${side}px ${bot}px ${side}px round ${14 * (1 - e)}px)`;
    panelBg.style.transform = `scale(${lerp(1.18, 1, e)})`;
    if (panelP > 0.85) panel.classList.add("on"); else if (panelP < 0.5) panel.classList.remove("on");

    // la camiseta gira, flota y al final la cámara entra en el 9
    const yaw = lerp(-10, 10, range(p, 0.67, 0.82));
    const bob = Math.sin(now / 1000 * 1.6) * 6;
    const gate = panelP >= 0.9 ? (panelP - 0.9) / 0.1 : 0;
    const q = Math.pow(range(p, 0.82, 0.93), 1.6) * gate;
    obj.style.transform = `translate(-50%,-50%) scale(${lerp(0.5, 1, e)})`;
    objImg.style.transform = `translateY(${bob}px) rotateY(${yaw}deg) scale(${1 + q * q * 28})`;
    black.style.opacity = range(q, 0.45, 0.85);
  }

  function manif_(mp) {
    const x0 = W * (mobile ? 0.08 : 0.06), x1 = -(trackW - W * 0.9);
    const x = lerp(x0, x1, mp);
    track.style.transform = `translate(${x}px,-50%)`;
    const visible = sy > mTop - H * 0.2;
    if (!visible) return;
    const edge = W * (mobile ? 0.92 : 0.86);
    for (const el of reveal) {
      if (el.dataset.on) continue;
      if (el.offsetLeft + x < edge) revealEl(el);
    }
  }

  requestAnimationFrame(frame);
})();
