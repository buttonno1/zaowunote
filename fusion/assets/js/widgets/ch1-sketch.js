/* 1.1 草图约束实验：拖动四个角点；勾选约束后，图形被“钉住”。全部约束加上后线变黑、拖不动。 */
(function () {
  const S = 6; // 1 mm = 6 px
  const CONS = [
    { k: "h", t: "上下两条边 水平", dof: 2 },
    { k: "v", t: "左右两条边 竖直", dof: 2 },
    { k: "w", t: "宽度尺寸 40", dof: 1 },
    { k: "hh", t: "高度尺寸 30", dof: 1 },
    { k: "c", t: "中心 重合 原点", dof: 2 },
  ];
  function css() {
    if (document.getElementById("sk-dof-css")) return;
    const s = document.createElement("style"); s.id = "sk-dof-css";
    s.textContent = `.sk-dof{display:grid;grid-template-columns:1fr 220px;gap:14px;align-items:start}
.sk-dof canvas{width:100%;max-width:520px;border:1px solid #e4e7eb;border-radius:8px;background:#fff;touch-action:none;cursor:grab}
.sk-dof label{display:block;font-size:14px;margin:6px 0;cursor:pointer}
.sk-dof .st{margin-top:10px;font-size:14px;line-height:1.6;padding:8px 10px;border-radius:6px;background:#f3f6fa}
.sk-dof .st b{font-size:18px}
.sk-dof button{margin-top:8px;border:1px solid #cfd6de;background:#fff;border-radius:6px;padding:3px 10px;cursor:pointer}
@media(max-width:700px){.sk-dof{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  function make(el) {
    el.classList.add("sk-dof");
    const cv = document.createElement("canvas"); cv.width = 520; cv.height = 360;
    const side = document.createElement("div");
    const on = {};
    CONS.forEach((c) => {
      const l = document.createElement("label"); const i = document.createElement("input"); i.type = "checkbox";
      i.addEventListener("change", () => { on[c.k] = i.checked; solve(-1); draw(); });
      l.append(i, " " + c.t); side.appendChild(l);
    });
    const st = document.createElement("div"); st.className = "st"; side.appendChild(st);
    const rb = document.createElement("button"); rb.type = "button"; rb.textContent = "重来";
    side.appendChild(rb);
    el.append(cv, side);
    const ctx = cv.getContext("2d");
    const O = { x: 260, y: 180 };
    let P;
    function reset() {
      P = [{ x: 150, y: 95 }, { x: 395, y: 120 }, { x: 370, y: 285 }, { x: 125, y: 250 }];
      side.querySelectorAll("input").forEach((i) => (i.checked = false));
      CONS.forEach((c) => (on[c.k] = false)); draw();
    }
    rb.addEventListener("click", reset);
    function solve(fix) {
      for (let it = 0; it < 30; it++) {
        const mv = (i, f) => { if (i !== fix) f(P[i]); };
        if (on.h) { mv(1, (p) => (p.y = P[0].y)); mv(0, (p) => (p.y = P[1].y)); mv(2, (p) => (p.y = P[3].y)); mv(3, (p) => (p.y = P[2].y)); }
        if (on.v) { mv(3, (p) => (p.x = P[0].x)); mv(0, (p) => (p.x = P[3].x)); mv(2, (p) => (p.x = P[1].x)); mv(1, (p) => (p.x = P[2].x)); }
        if (on.w) { // 上边长度 = 40mm
          const L = 40 * S, dx = P[1].x - P[0].x, dy = P[1].y - P[0].y, d = Math.hypot(dx, dy) || 1;
          if (fix === 1) { P[0].x = P[1].x - dx / d * L; P[0].y = P[1].y - dy / d * L; } else { P[1].x = P[0].x + dx / d * L; P[1].y = P[0].y + dy / d * L; }
          if (on.v) { if (fix !== 2) P[2].x = P[1].x; if (fix === 2) { P[1].x = P[2].x; P[0].x = P[1].x - L; } }
        }
        if (on.hh) {
          const L = 30 * S, dx = P[2].x - P[1].x, dy = P[2].y - P[1].y, d = Math.hypot(dx, dy) || 1;
          if (fix === 2) { P[1].x = P[2].x - dx / d * L; P[1].y = P[2].y - dy / d * L; } else { P[2].x = P[1].x + dx / d * L; P[2].y = P[1].y + dy / d * L; }
          if (on.h) { if (fix !== 3) P[3].y = P[2].y; }
        }
        if (on.c) { const cx = (P[0].x + P[2].x) / 2 - O.x, cy = (P[0].y + P[2].y) / 2 - O.y; P.forEach((p) => { p.x -= cx; p.y -= cy; }); }
      }
    }
    function dof() { return 8 - CONS.reduce((a, c) => a + (on[c.k] ? c.dof : 0), 0); }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = "#eef1f4"; ctx.lineWidth = 1;
      for (let x = O.x % 30; x < cv.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
      for (let y = O.y % 30; y < cv.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
      ctx.strokeStyle = "#f2a0a0"; ctx.beginPath(); ctx.moveTo(0, O.y); ctx.lineTo(cv.width, O.y); ctx.stroke();
      ctx.strokeStyle = "#9ad19a"; ctx.beginPath(); ctx.moveTo(O.x, 0); ctx.lineTo(O.x, cv.height); ctx.stroke();
      const n = dof(), done = n === 0;
      ctx.fillStyle = "rgba(120,180,230,.18)"; ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = done ? "#222" : "#1f7fd6"; ctx.lineWidth = 2; ctx.stroke();
      P.forEach((p) => { ctx.fillStyle = done ? "#222" : "#1f7fd6"; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); });
      ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(O.x, O.y, 4, 0, 7); ctx.fill();
      ctx.font = "13px sans-serif"; ctx.fillStyle = "#666";
      const w = Math.hypot(P[1].x - P[0].x, P[1].y - P[0].y) / S, h = Math.hypot(P[2].x - P[1].x, P[2].y - P[1].y) / S;
      ctx.fillText((on.w ? "40" : w.toFixed(1)) + " mm", (P[0].x + P[1].x) / 2 - 20, (P[0].y + P[1].y) / 2 - 8);
      ctx.fillText((on.hh ? "30" : h.toFixed(1)) + " mm", (P[1].x + P[2].x) / 2 + 8, (P[1].y + P[2].y) / 2);
      st.innerHTML = done ? "剩余自由度 <b>0</b><br>✅ 完全约束：线变成<b>黑色</b>，怎么拖都不动了。" :
        `剩余自由度 <b>${n}</b><br>线还是<b>蓝色</b>：图形还能被拖变形。试试拖角点。`;
    }
    let drag = -1;
    function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
    cv.addEventListener("pointerdown", (e) => { const m = pos(e); drag = P.findIndex((p) => Math.hypot(p.x - m.x, p.y - m.y) < 14); if (drag >= 0) cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (drag < 0) return; const m = pos(e); P[drag].x = m.x; P[drag].y = m.y; solve(drag); if (dof() === 0) solve(-1); draw(); });
    cv.addEventListener("pointerup", () => { drag = -1; });
    reset();
  }
  css();
  document.querySelectorAll(".sk-dof-widget").forEach(make);
})();
