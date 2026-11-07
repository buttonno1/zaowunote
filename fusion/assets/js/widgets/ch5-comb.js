/* 5.10 互动：曲率梳 —— 梳齿长度 = 这一点弯得有多厉害 */
(function () {
  function css() {
    if (document.getElementById("comb-css")) return;
    const s = document.createElement("style"); s.id = "comb-css";
    s.textContent = `.cbw{display:grid;grid-template-columns:1fr 250px;gap:14px;align-items:start}
.cbw canvas{width:100%;max-width:560px;border:1px solid #e4e7eb;border-radius:8px;background:#fff;touch-action:none}
.cbw .btns{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.cbw .btns button{border:1px solid #cfd8e3;background:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px}
.cbw .btns button.on{background:#1c7ed6;color:#fff;border-color:#1c7ed6}
.cbw .st{font-size:14px;line-height:1.7;padding:8px 10px;border-radius:6px;background:#f3f6fa;margin-top:8px}
.cbw input[type=range]{width:100%}
@media(max-width:720px){.cbw{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  const W = 560, H = 340;
  // 按“曲率随弧长的变化”积分出曲线：segs = [[长度, 起点曲率, 终点曲率], ...]
  function integrate(x, y, a, segs) {
    const pts = []; const ds = 1.5;
    for (const [len, k0, k1] of segs) {
      const n = Math.max(1, Math.round(len / ds));
      for (let i = 0; i < n; i++) {
        const t = i / n, k = k0 + (k1 - k0) * t;
        pts.push({ x, y, k, a });
        a += k * ds; x += Math.cos(a) * ds; y += Math.sin(a) * ds;
      }
    }
    pts.push({ x, y, k: segs[segs.length - 1][2], a });
    return pts;
  }
  function presetG1() { // 直线 → 半径 70 的 90° 圆弧 → 直线
    const R = 70, L = Math.PI / 2 * R;
    return integrate(40, 270, 0, [[200, 0, 0], [L, -1 / R, -1 / R], [70, 0, 0]]);
  }
  function presetG2() { // 直线 → 曲率从 0 慢慢升高再降回 0（总共也转 90°） → 直线
    const L = 160, kmax = (Math.PI / 2) / (L / 2); // 三角形曲率分布，面积 = 90°
    return integrate(40, 270, 0, [[160, 0, 0], [L / 2, 0, -kmax], [L / 2, -kmax, 0], [70, 0, 0]]);
  }
  function bezier(P) {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const t = i / 240, u = 1 - t;
      const x = u * u * u * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t * t * t * P[3].x;
      const y = u * u * u * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t * t * t * P[3].y;
      const dx = 3 * (u * u * (P[1].x - P[0].x) + 2 * u * t * (P[2].x - P[1].x) + t * t * (P[3].x - P[2].x));
      const dy = 3 * (u * u * (P[1].y - P[0].y) + 2 * u * t * (P[2].y - P[1].y) + t * t * (P[3].y - P[2].y));
      const ddx = 6 * (u * (P[2].x - 2 * P[1].x + P[0].x) + t * (P[3].x - 2 * P[2].x + P[1].x));
      const ddy = 6 * (u * (P[2].y - 2 * P[1].y + P[0].y) + t * (P[3].y - 2 * P[2].y + P[1].y));
      const k = (dx * ddy - dy * ddx) / Math.pow(dx * dx + dy * dy, 1.5);
      pts.push({ x, y, k, a: Math.atan2(dy, dx) });
    }
    return pts;
  }
  function widget(el) {
    el.classList.add("cbw");
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const side = document.createElement("div");
    side.innerHTML = '<div class="btns"><button type="button" data-m="g1" class="on">直线 + 圆弧（普通圆角）</button><button type="button" data-m="g2">曲率连续过渡</button><button type="button" data-m="free">自由曲线（可拖）</button></div>' +
      '<label>梳齿缩放：</label><input type="range" min="10" max="100" value="45"><div class="st"></div>';
    el.append(cv, side);
    const c = cv.getContext("2d"), sc = side.querySelector("input"), st = side.querySelector(".st");
    let mode = "g1", drag = -1;
    const P = [{ x: 60, y: 260 }, { x: 200, y: 60 }, { x: 330, y: 330 }, { x: 500, y: 90 }];
    function draw() {
      c.clearRect(0, 0, W, H);
      const pts = mode === "g1" ? presetG1() : mode === "g2" ? presetG2() : bezier(P);
      const s = +sc.value * 60, step = mode === "free" ? 4 : 5;
      // 梳齿（画在曲线凸出的一侧）
      const tips = [];
      for (let i = 0; i < pts.length; i += step) {
        const p = pts[i], nx = -Math.sin(p.a), ny = Math.cos(p.a), len = -p.k * s;
        tips.push({ x: p.x + nx * len, y: p.y + ny * len });
        c.strokeStyle = "rgba(28,126,214,.55)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + nx * len, p.y + ny * len); c.stroke();
      }
      c.strokeStyle = "#e03131"; c.lineWidth = 1.6; c.beginPath();
      tips.forEach((t, i) => (i ? c.lineTo(t.x, t.y) : c.moveTo(t.x, t.y))); c.stroke();
      c.strokeStyle = "#212529"; c.lineWidth = 2.5; c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
      if (mode === "free") {
        c.strokeStyle = "#adb5bd"; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath();
        P.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke(); c.setLineDash([]);
        P.forEach((p) => { c.fillStyle = "#fff"; c.strokeStyle = "#1c7ed6"; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 7, 0, 7); c.fill(); c.stroke(); });
      }
      c.fillStyle = "#495057"; c.font = "13px sans-serif";
      c.fillText("黑线：曲线　蓝色短线：梳齿　红线：梳齿顶端连起来", 12, 20);
      st.innerHTML = mode === "g1"
        ? "直线部分<b>没有梳齿</b>（直线不弯，曲率 = 0）；一进圆弧，梳齿<b>突然</b>变得一样长（圆弧处处弯得一样）。红线在交界处出现<b>竖直的跳变</b>：这就是普通圆角（G1，相切）的“曲率台阶”，反光时能看到一条亮线。"
        : mode === "g2" ? "同样转了 90°，但梳齿是从 0 <b>慢慢</b>变长、再慢慢变短，红线连成一条没有台阶的光滑线。这就是<b>曲率连续（G2）</b>：外观更“顺”，反光不会断。"
        : "拖动 4 个蓝色圆点改变曲线。注意梳齿翻到另一侧的地方：那里曲线从“往左弯”变成“往右弯”（拐点）。红线越平顺，曲线越好看。";
    }
    function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    cv.addEventListener("pointerdown", (e) => { if (mode !== "free") return; const p = pos(e); drag = P.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 16); if (drag >= 0) cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (drag < 0) return; const p = pos(e); P[drag].x = Math.max(8, Math.min(W - 8, p.x)); P[drag].y = Math.max(30, Math.min(H - 8, p.y)); draw(); });
    cv.addEventListener("pointerup", () => (drag = -1));
    side.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      side.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); mode = b.dataset.m; draw();
    }));
    sc.addEventListener("input", draw); draw();
  }
  css();
  document.querySelectorAll(".comb-widget").forEach(widget);
})();
