/* Camisetas Fútbol UY — perchero, catálogo y vista de detalle */
(() => {
  // Número de WhatsApp de EJEMPLO: reemplazar por el real (formato 598 + número, sin + ni espacios).
  const WHATSAPP = "59800000000";
  const INSTAGRAM = "https://www.instagram.com/camisetas.futboluy/";

  const P = [
    { s: "bayern-buzo",          n: "Bayern Múnich · Buzo a rayas",   m: "Buzo · Manga larga" },
    { s: "boca-paredes",         n: "Boca Juniors · Paredes 5",       m: "Camiseta · Manga corta" },
    { s: "real-madrid-valverde", n: "Real Madrid rosa · Valverde 8",  m: "Camiseta · Manga corta" },
    { s: "penarol-retro",        n: "Peñarol retro · Parmalat 8",     m: "Camiseta · Cuello polo" },
    { s: "uruguay-suarez",       n: "Uruguay alternativa · Suárez 9", m: "Camiseta · Manga corta" },
    { s: "deportivo-gimenez",    n: "Deportivo · J.M. Giménez 20",    m: "Camiseta · Manga corta" },
    { s: "noruega-haaland",      n: "Negra y turquesa · Haaland 9",   m: "Camiseta · Manga corta" },
    { s: "brasil-buzo",          n: "Brasil · Buzo a rayas",          m: "Buzo · Manga larga" },
    { s: "north-face-campera",   n: "The North Face · Campera inflable", m: "Campera · Cierre completo" },
  ];
  const N = P.length;
  const src = (k, lado = "frente") => `assets/prendas/${P[k].s}-${lado}.webp`;
  const wa = (t) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;
  const pedir = (k) => wa(`¡Hola! Quiero consultar por la prenda "${P[k].n}". Mi talle es: `);
  const EASE = "cubic-bezier(.2,.8,.2,1)";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (q) => document.querySelector(q);

  // ---------- enlaces de WhatsApp ----------
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = wa("¡Hola! Quiero consultar por camisetas.");
    a.target = "_blank"; a.rel = "noopener";
  });

  // ---------- franja roja ----------
  const items = ["CAMISETAS FÚTBOL UY", "•", "ENVÍOS A TODO EL PAÍS", "•", "ARTIGAS — MONTEVIDEO", "•", "STOCK EN DESTACADAS DE INSTAGRAM", "•"];
  const track = $("#band .track");
  for (let r = 0; r < 12; r++) for (const t of items) { const s = document.createElement("span"); s.textContent = t; track.appendChild(s); }

  // ---------- artboard del perchero ----------
  const CFG = {
    wide:   { W: 1500, H: 400, railL: 150, railR: 150, SLOT: 116, OPEN: 92 },
    narrow: { W: 640,  H: 400, railL: 30,  railR: 30,  SLOT: 62,  OPEN: 100 },
  };
  const RAIL_TOP = 60, G_TOP = 42, CAP_TOP = 350;
  let C = CFG.wide;
  const art = $("#art"), stage = $("#stage"), rail = $("#rail"), rack = $("#rack"), cap = $("#cap");

  function fit() {
    C = stage.clientWidth < 760 ? CFG.narrow : CFG.wide;
    art.style.width = C.W + "px"; art.style.height = C.H + "px";
    rail.style.left = C.railL + "px"; rail.style.right = C.railR + "px"; rail.style.top = RAIL_TOP + "px";
    cap.style.top = CAP_TOP + "px";
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const k = Math.min(sw / C.W, sh / C.H);
    art.style.transform = `scale(${k})`;
    art.style.left = (sw - C.W * k) / 2 + "px";
    art.style.top = Math.max(0, (sh - C.H * k) * 0.45) + "px";
    layout();
  }

  // percha: gancho sobre el caño + barra (queda detrás de la prenda)
  const HANGER = `<svg viewBox="0 0 289 130" aria-hidden="true">
    <defs><linearGradient id="hk" x1="0" x2="1"><stop offset="0" stop-color="#7a7d83"/><stop offset=".5" stop-color="#f3f3f4"/><stop offset="1" stop-color="#8d9096"/></linearGradient></defs>
    <path d="M144.5 104V38c0-14 9-26 0-28.5c-7-1.8-11 4-9.5 9" fill="none" stroke="url(#hk)" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M144.5 104L100 114q-6 3 0 4h89q6-1 0-4z" fill="#1d1d20" stroke="#3a3a3e" stroke-width="1"/>
  </svg>`;

  const G = P.map((p, k) => {
    const g = document.createElement("div");
    g.className = "g"; g.tabIndex = 0;
    g.setAttribute("role", "listitem");
    g.setAttribute("aria-label", `${p.n}. Enter para verla grande`);
    g.style.setProperty("--k", k);
    g.style.top = G_TOP + "px";
    g.innerHTML = `<i>${HANGER}<img src="${src(k)}" alt="" draggable="false"></i>`;
    rack.appendChild(g);
    return g;
  });

  let hov = -1, open = -1, from = "rail", lado = "frente", pointer = "mouse";

  function layout() {
    G.forEach((g, k) => {
      let x = C.W / 2 + (k - (N - 1) / 2) * C.SLOT;
      if (hov >= 0 && k !== hov) x += Math.sign(k - hov) * C.OPEN;
      g.style.left = x + "px";
      g.classList.toggle("face", k === hov);
    });
    if (hov >= 0) {
      cap.style.left = G[hov].style.left;
      cap.querySelector("b").textContent = P[hov].n;
      cap.querySelector("span").textContent = P[hov].m;
      cap.classList.add("on");
    } else cap.classList.remove("on");
  }

  // entrada: las prendas llegan deslizándose desde la punta del caño
  rack.classList.add("pre", "stagger");
  fit();
  G.forEach((g) => (g.style.left = C.railL + 30 + "px"));
  void rack.offsetWidth; // fija la posición inicial antes de animar
  setTimeout(() => {
    rack.classList.remove("pre");
    layout();
    setTimeout(() => rack.classList.remove("stagger"), 1400);
  }, 120);
  addEventListener("resize", fit);
  if (document.fonts) document.fonts.ready.then(fit);

  addEventListener("pointerdown", (e) => (pointer = e.pointerType), true);
  G.forEach((g, k) => {
    g.addEventListener("pointerenter", (e) => {
      if (open < 0 && e.pointerType !== "touch") { hov = k; layout(); }
    });
    g.addEventListener("focus", () => { if (open < 0 && hov !== k) { hov = k; layout(); } });
    g.addEventListener("click", () => {
      if (pointer === "touch" && hov !== k) { hov = k; layout(); return; }
      openG(k, "rail");
    });
  });
  rack.addEventListener("pointerleave", (e) => {
    if (open < 0 && e.pointerType !== "touch") { hov = -1; layout(); }
  });

  // ---------- catálogo ----------
  const grid = $("#grid");
  const arrow = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const cards = P.map((p, k) => {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <button class="card-pic" aria-label="Ver ${p.n} en grande">
        <img class="front" src="${src(k)}" alt="${p.n}, de frente" loading="lazy" draggable="false">
        <img class="back" src="${src(k, "espalda")}" alt="" loading="lazy" draggable="false">
      </button>
      <div class="card-row">
        <div><h3>${p.n}</h3><p>${p.m}</p></div>
        <button class="pick" aria-label="Elegir talle de ${p.n}">Elegir talle ${arrow}</button>
      </div>`;
    li.querySelector(".card-pic").addEventListener("click", () => openG(k, "card"));
    li.querySelector(".pick").addEventListener("click", () => openG(k, "card"));
    grid.appendChild(li);
    return li;
  });

  // ---------- detalle ----------
  const body = document.body, det = $("#det"), big = $("#big"), big2 = $("#big2"), bigwrap = $("#bigwrap");
  const btnLado = [...document.querySelectorAll(".lado button")];
  let lastFocus = null, closing = 0;

  const srcEl = (k) => (from === "rail" ? G[k].querySelector("img") : cards[k].querySelector(".front"));
  const hideSrc = (k, v) => {
    const el = from === "rail" ? G[k] : cards[k].querySelector(".card-pic");
    el.style.visibility = v ? "hidden" : "";
  };

  async function setImg(img, k, l) {
    img.src = src(k, l);
    try { await img.decode(); } catch (e) {}
  }

  function fill(k) {
    $("#num").textContent = `${String(k + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    $("#name").textContent = P[k].n;
    $("#meta").textContent = P[k].m;
    $("#det-wa").href = pedir(k);
    $("#det-wa").target = "_blank"; $("#det-wa").rel = "noopener";
    big.alt = `${P[k].n}, ${lado === "frente" ? "de frente" : "de espalda"}`;
    setTalle(null);
  }

  // ---------- talles y pedido ----------
  let talle = null;
  const talleBtns = [...document.querySelectorAll("#talles button")];
  const talleMsg = $("#talleMsg"), addBtn = $("#addBtn");
  function setTalle(t) {
    talle = t;
    talleBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.talle === t)));
    if (t) talleMsg.textContent = "";
  }
  talleBtns.forEach((b) => b.addEventListener("click", () => setTalle(b.dataset.talle)));

  const KEY = "cfuy-pedido";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { bag = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  const bagEl = $("#bolsa"), list = $("#bolsaList"), empty = $("#bolsaEmpty"), send = $("#bolsaSend");
  const floatBtn = document.querySelector(".bag-float");
  let bagOpen = false, bagReturn = null;

  function renderBag(bump) {
    const n = bag.reduce((s, it) => s + it.q, 0);
    document.querySelectorAll("[data-bag-n]").forEach((el) => {
      el.textContent = n;
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    floatBtn.hidden = n === 0;
    list.innerHTML = "";
    bag.forEach((it, idx) => {
      const k = P.findIndex((p) => p.s === it.s);
      if (k < 0) return;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="th"><img src="${src(k)}" alt=""></div>
        <div><h3>${P[k].n}</h3><p>Talle ${it.t}</p>
          <div class="qty"><button aria-label="Quitar una">−</button><span>${it.q}</span><button aria-label="Sumar una">+</button></div></div>
        <button class="quitar">Quitar</button>`;
      const [minus, plus] = li.querySelectorAll(".qty button");
      minus.onclick = () => { it.q > 1 ? it.q-- : bag.splice(idx, 1); save(); renderBag(); };
      plus.onclick = () => { it.q++; save(); renderBag(); };
      li.querySelector(".quitar").onclick = () => { bag.splice(idx, 1); save(); renderBag(); };
      list.appendChild(li);
    });
    empty.hidden = n > 0;
    const lines = bag.map((it) => `• ${P.find((p) => p.s === it.s)?.n} — talle ${it.t} — x${it.q}`);
    send.href = wa(`¡Hola! Quiero hacer este pedido:\n${lines.join("\n")}\n¿Me confirman precio y stock?`);
    send.target = "_blank"; send.rel = "noopener";
    send.setAttribute("aria-disabled", String(n === 0));
  }

  addBtn.addEventListener("click", () => {
    if (open < 0) return;
    if (!talle) {
      talleMsg.textContent = "Elegí un talle para agregarla.";
      const g = $("#talles"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
      return;
    }
    const s = P[open].s, found = bag.find((it) => it.s === s && it.t === talle);
    found ? found.q++ : bag.push({ s, t: talle, q: 1 });
    save(); renderBag(true);
    const lbl = addBtn.querySelector(".lbl");
    addBtn.classList.add("swap");
    setTimeout(() => { lbl.textContent = `Agregada · talle ${talle}`; addBtn.classList.remove("swap"); }, 180);
    setTimeout(() => {
      addBtn.classList.add("swap");
      setTimeout(() => { lbl.textContent = "Agregar al pedido"; addBtn.classList.remove("swap"); }, 180);
    }, 1800);
  });

  function openBag() {
    if (open >= 0) closeG();
    bagReturn = document.activeElement;
    bagOpen = true;
    body.classList.add("bag-open");
    bagEl.setAttribute("aria-hidden", "false");
    setTimeout(() => bagEl.querySelector(".x-btn[data-bag-close]")?.focus({ preventScroll: true }), 50);
  }
  function closeBag() {
    bagOpen = false;
    body.classList.remove("bag-open");
    bagEl.setAttribute("aria-hidden", "true");
    bagReturn?.focus?.({ preventScroll: true });
  }
  document.querySelectorAll("[data-bag]").forEach((b) => b.addEventListener("click", openBag));
  document.querySelectorAll("[data-bag-close]").forEach((b) => b.addEventListener("click", closeBag));
  renderBag();
  // la barra "Tu pedido" no tapa los botones del inicio: aparece al dejar el perchero
  new IntersectionObserver(([e]) => body.classList.toggle("in-hero", e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] })
    .observe(document.querySelector(".hero"));
  function setLado(l) {
    lado = l;
    btnLado.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lado === l)));
  }

  function flipFrom(el) {
    const a = el.getBoundingClientRect(), b = big.getBoundingClientRect();
    if (!a.width || a.bottom < 0 || a.top > innerHeight) return null;
    return `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width})`;
  }

  async function openG(k, origin) {
    if (open >= 0) return;
    clearTimeout(closing);
    open = k; from = origin; lastFocus = document.activeElement;
    if (from === "rail") { hov = k; layout(); }
    setLado("frente");
    big.getAnimations().forEach((a) => a.cancel());
    big.style.opacity = "0";
    await setImg(big, k, "frente");
    fill(k);
    body.classList.add("open");
    det.setAttribute("aria-hidden", "false");
    big.style.transformOrigin = "0 0";
    big.style.opacity = "";
    const t = flipFrom(srcEl(k));
    big.animate(
      t ? [{ transform: t, opacity: 1 }, { transform: "none", opacity: 1 }]
        : [{ transform: "translateY(16px) scale(.96)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: reduce ? 1 : 750, easing: EASE, fill: "forwards" }
    );
    hideSrc(k, true);
    $("#close").focus({ preventScroll: true });
  }

  async function step(d) {
    if (open < 0) return;
    const prev = open;
    open = (open + d + N) % N;
    hideSrc(prev, false); hideSrc(open, true);
    if (from === "rail") { hov = open; layout(); }
    big2.src = big.src; big2.style.marginLeft = big.style.marginLeft;
    big2.style.transformOrigin = big.style.transformOrigin = "50% 4%";
    big2.animate(
      [{ transform: "none", opacity: 1, filter: "blur(0)" },
       { transform: `translateX(${-d * 120}px) scale(.94)`, opacity: 0, filter: "blur(6px)" }],
      { duration: reduce ? 1 : 600, easing: EASE }
    );
    big.getAnimations().forEach((a) => a.cancel());
    big.style.opacity = "0";
    await setImg(big, open, lado);
    fill(open);
    big.style.opacity = "";
    big.animate(
      [{ transform: `translateX(${d * 120}px) scale(.94)`, opacity: 0, filter: "blur(6px)" },
       { transform: "none", opacity: 1, filter: "blur(0)" }],
      { duration: reduce ? 1 : 600, easing: EASE, fill: "forwards" }
    );
  }

  async function turn(l) {
    if (open < 0 || l === lado) return;
    setLado(l);
    big.getAnimations().forEach((a) => a.cancel());
    big.style.transformOrigin = "50% 50%";
    await big.animate([{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(4px)", transform: "scale(.98)" }],
      { duration: reduce ? 1 : 140, easing: "ease-in", fill: "forwards" }).finished;
    await setImg(big, open, l);
    fill(open);
    big.getAnimations().forEach((a) => a.cancel());
    big.animate([{ opacity: 0, filter: "blur(4px)", transform: "scale(.98)" }, { opacity: 1, filter: "blur(0)", transform: "none" }],
      { duration: reduce ? 1 : 260, easing: "cubic-bezier(.23,1,.32,1)", fill: "forwards" });
  }

  function closeG() {
    if (open < 0) return;
    const k = open;
    big.getAnimations().forEach((a) => a.cancel());
    big.style.transformOrigin = "0 0";
    hideSrc(k, false);
    const t = flipFrom(srcEl(k));
    hideSrc(k, true);
    big.animate(
      [{ transform: "none", opacity: 1 },
       t ? { transform: t, opacity: 1 } : { transform: "translateY(16px) scale(.96)", opacity: 0 }],
      { duration: reduce ? 1 : 650, easing: EASE, fill: "forwards" }
    );
    body.classList.remove("open");
    det.setAttribute("aria-hidden", "true");
    const back = from === "rail" ? G[k] : cards[k].querySelector(".card-pic");
    closing = setTimeout(() => {
      hideSrc(k, false);
      big.getAnimations().forEach((a) => a.cancel());
      big.style.opacity = "0";
      open = -1;
      if (from === "rail" && !(back.matches(":hover"))) { hov = -1; layout(); }
    }, reduce ? 1 : 650);
    (back || lastFocus)?.focus({ preventScroll: true });
  }

  $("#prev").addEventListener("click", () => step(-1));
  $("#next").addEventListener("click", () => step(1));
  $("#close").addEventListener("click", closeG);
  $("#det .hit").addEventListener("click", closeG);
  btnLado.forEach((b) => b.addEventListener("click", () => turn(b.dataset.lado)));

  // ---------- teclado ----------
  // ---------- menú del celular ----------
  const burger = $("#burger"), menu = $("#menu");
  let menuOpen = false;
  function setMenu(v) {
    menuOpen = v;
    body.classList.toggle("menu-open", v);
    burger.setAttribute("aria-expanded", String(v));
    burger.setAttribute("aria-label", v ? "Cerrar menú" : "Abrir menú");
    menu.setAttribute("aria-hidden", String(!v));
    if (v) setTimeout(() => menu.querySelector("[data-menu-link]")?.focus({ preventScroll: true }), 60);
  }
  burger.addEventListener("click", () => setMenu(!menuOpen));
  menu.querySelectorAll("[data-menu-link]").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  matchMedia("(min-width: 1001px) and (min-height: 501px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  addEventListener("keydown", (e) => {
    if (menuOpen) { if (e.key === "Escape") { setMenu(false); burger.focus(); } return; }
    if (bagOpen) { if (e.key === "Escape") closeBag(); return; }
    if (open >= 0) {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") closeG();
      else if (e.key === "Tab") {
        const f = [...det.querySelectorAll("button, a[href]")].filter((x) => x.offsetParent !== null);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
      return;
    }
    if (scrollY > innerHeight * 0.5) return;
    const inRack = rack.contains(document.activeElement);
    if (e.key === "ArrowRight") { hov = Math.min(N - 1, hov + 1); layout(); if (inRack) G[hov].focus(); }
    else if (e.key === "ArrowLeft") { hov = hov < 0 ? N - 1 : Math.max(0, hov - 1); layout(); if (inRack) G[hov].focus(); }
    else if (e.key === "Enter" && hov >= 0 && (inRack || document.activeElement === body)) openG(hov, "rail");
  });

  window.__perchero = { openG: (k) => openG(k, "rail"), step, closeG, setHov: (k) => { hov = k; layout(); } };
})();
