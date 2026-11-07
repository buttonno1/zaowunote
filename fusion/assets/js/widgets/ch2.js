/* 第 2 章互动：悬垂角、配合间隙 */
(function () {
  function css() {
    if (document.getElementById("ch2-css")) return;
    const s = document.createElement("style"); s.id = "ch2-css";
    s.textContent = `.c2w{display:grid;grid-template-columns:1fr 240px;gap:14px;align-items:center}
.c2w canvas{width:100%;max-width:520px;border:1px solid #e4e7eb;border-radius:8px;background:#fff}
.c2w input[type=range]{width:100%}.c2w .st{font-size:14px;line-height:1.7;padding:8px 10px;border-radius:6px;background:#f3f6fa;margin-top:8px}
@media(max-width:700px){.c2w{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  function overhang(el) {
    el.classList.add("c2w");
    const cv = document.createElement("canvas"); cv.width = 520; cv.height = 300;
    const side = document.createElement("div");
    side.innerHTML = '<label>悬垂角度：<b class="v">30</b>°（和竖直方向的夹角）</label><input type="range" min="0" max="90" value="30"><div class="st"></div>';
    el.append(cv, side);
    const r = side.querySelector("input"), v = side.querySelector(".v"), st = side.querySelector(".st"), c = cv.getContext("2d");
    function draw() {
      const a = +r.value; v.textContent = a; c.clearRect(0, 0, 520, 300);
      c.fillStyle = "#ddd"; c.fillRect(0, 270, 520, 30); c.fillStyle = "#888"; c.font = "13px sans-serif"; c.fillText("打印平台", 10, 290);
      const layers = 22, h = 11, w0 = 120, x0 = 170, ok = a <= 45;
      for (let i = 0; i < layers; i++) {
        const y = 270 - (i + 1) * h, off = Math.tan(a * Math.PI / 180) * h * i;
        const prev = Math.tan(a * Math.PI / 180) * h * (i - 1);
        const over = i > 0 ? (off - prev) : 0;
        c.fillStyle = ok ? "#4a90d9" : (over > h * 1.0 ? "#e5533d" : "#e9a23b");
        c.fillRect(x0 + off, y, w0, h - 1.5);
      }
      if (!ok) { c.strokeStyle = "#999"; c.setLineDash([4, 4]); const top = Math.tan(a * Math.PI / 180) * h * (layers - 1);
        for (let x = x0 + w0 + 10; x < x0 + top + w0; x += 22) { c.beginPath(); c.moveTo(x, 270); c.lineTo(x, 270 - Math.max(0, (x - x0 - w0) / Math.tan(a * Math.PI / 180) / h) * h); c.stroke(); } c.setLineDash([]); }
      st.innerHTML = a <= 45 ? "✅ 每一层只比下一层多伸出一点，能“踩”在下一层上，<b>不需要支撑</b>。" : (a < 70 ? "⚠️ 每层伸出太多，下面悬空，边缘会下垂变丑，<b>需要支撑</b>（虚线）或者改设计。" : "❌ 几乎是水平悬空，没有支撑一定会塌。");
    }
    r.addEventListener("input", draw); draw();
  }
  function fit(el) {
    el.classList.add("c2w");
    const cv = document.createElement("canvas"); cv.width = 520; cv.height = 260;
    const side = document.createElement("div");
    side.innerHTML = '<label>单边间隙：<b class="v">0.20</b> mm</label><input type="range" min="-20" max="80" value="20"><div class="st"></div>';
    el.append(cv, side);
    const r = side.querySelector("input"), v = side.querySelector(".v"), st = side.querySelector(".st"), c = cv.getContext("2d");
    function draw() {
      const g = +r.value / 100; v.textContent = g.toFixed(2); c.clearRect(0, 0, 520, 260);
      const cx = 260, cy = 130, R = 80, S = 160, rp = R - g * S;
      c.fillStyle = "#cfd8e3"; c.beginPath(); c.arc(cx, cy, R + 40, 0, 7); c.arc(cx, cy, R, 0, 7, true); c.fill();
      c.fillStyle = g < 0 ? "#e5533d" : "#4a90d9"; c.beginPath(); c.arc(cx, cy, rp, 0, 7); c.fill();
      c.fillStyle = "#333"; c.font = "13px sans-serif"; c.fillText("孔", cx + R + 8, cy - R - 10); c.fillText("轴", cx - 8, cy + 4);
      let t;
      if (g < 0) t = "❌ <b>过盈</b>：轴比孔大，压不进去（或者要用力压进去，拆不下来）。";
      else if (g < 0.1) t = "⚠️ 几乎没缝：3D 打印件多半装不进去，或者转不动。";
      else if (g <= 0.3) t = "✅ <b>紧配合 / 滑配合</b>：能装进去，转起来有阻力，不晃。FDM 打印常用 0.15～0.3。";
      else if (g <= 0.5) t = "✅ <b>间隙配合</b>：转动顺滑，稍微有点晃。铰链、旋钮常用。";
      else t = "⚠️ 缝太大：装上去会明显晃动。";
      st.innerHTML = t + "<br><small>图中间隙放大了很多倍，方便看。</small>";
    }
    r.addEventListener("input", draw); draw();
  }
  css();
  document.querySelectorAll(".overhang-widget").forEach(overhang);
  document.querySelectorAll(".fit-widget").forEach(fit);
})();
