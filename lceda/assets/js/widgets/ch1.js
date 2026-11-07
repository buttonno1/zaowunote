/* 第 1 章互动组件：555 节拍器模拟器、PCB 层叠爆炸图、器件三联图、原理图↔PCB 对照、mm/mil 换算 */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ROOT = document.body.dataset.root || "";
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ============ A-0 555 节拍器模拟器 ============ */
  const RA = [100, 220, 330, 470, 680, 1e3, 2.2e3, 4.7e3, 10e3, 22e3, 47e3, 100e3];
  const RB = [1e3, 2.2e3, 4.7e3, 10e3, 22e3, 33e3, 47e3, 68e3, 100e3, 220e3, 470e3];
  const CC = [1e-6, 2.2e-6, 4.7e-6, 10e-6, 22e-6, 47e-6, 100e-6];
  const fmtR = (v) => v >= 1e6 ? v / 1e6 + "MΩ" : v >= 1e3 ? v / 1e3 + "kΩ" : v + "Ω";
  const fmtC = (v) => +(v * 1e6).toFixed(1) + "µF";
  const fmtT = (s) => s >= 1 ? s.toFixed(2) + " s" : (s * 1000).toFixed(s < 0.01 ? 2 : 0) + " ms";

  $$(".n555-widget").forEach((w) => {
    w.innerHTML = `
      <div class="n555-grid">
        <div class="n555-ctrl">
          <label>R3（定时电阻 A）<b class="v-ra"></b><input type="range" class="s-ra" min="0" max="${RA.length - 1}" step="1"></label>
          <label>R4（定时电阻 B）<b class="v-rb"></b><input type="range" class="s-rb" min="0" max="${RB.length - 1}" step="1"></label>
          <label>C1（定时电容）<b class="v-c"></b><input type="range" class="s-c" min="0" max="${CC.length - 1}" step="1"></label>
          <div class="n555-out">
            <div>闪烁频率 <b class="o-f"></b></div>
            <div>一个周期 <b class="o-t"></b>（亮 <span class="o-th"></span> / 灭 <span class="o-tl"></span>）</div>
            <div>占空比 <b class="o-d"></b></div>
          </div>
          <div class="n555-formula">f ≈ 1.44 / ((R3 + 2·R4) · C1)<br>占空比 = (R3 + R4) / (R3 + 2·R4)</div>
          <button type="button" class="n555-reset">恢复本例默认值（1k / 47k / 10µF）</button>
        </div>
        <div class="n555-badge">
          <svg viewBox="0 0 200 200" aria-label="徽章模拟">
            <circle cx="100" cy="100" r="94" fill="#1c3f94" stroke="#0b2160" stroke-width="3"/>
            <text x="100" y="40" text-anchor="middle" fill="#fff" font-size="15" font-family="PingFang SC,sans-serif">眨眼小徽章</text>
            <g class="led w"><circle cx="62" cy="72" r="11"/><circle cx="138" cy="72" r="11"/></g>
            <g class="led r"><circle cx="36" cy="118" r="9"/><circle cx="164" cy="118" r="9"/></g>
            <rect x="82" y="96" width="36" height="28" rx="3" fill="#222"/><text x="100" y="115" text-anchor="middle" fill="#ccc" font-size="9">NE555</text>
            <rect x="80" y="170" width="40" height="24" rx="6" fill="#bbb" stroke="#888"/>
          </svg>
          <div class="n555-legend"><span class="dot w"></span>白灯 LED1/2：OUT 低时亮　<span class="dot r"></span>红灯 LED3/4：OUT 高时亮</div>
        </div>
      </div>
      <canvas class="n555-cv" height="260"></canvas>
      <div class="n555-note"></div>`;
    const sRa = $(".s-ra", w), sRb = $(".s-rb", w), sC = $(".s-c", w);
    const cv = $(".n555-cv", w), ctx = cv.getContext("2d");
    const ledW = $(".led.w", w), ledR = $(".led.r", w), note = $(".n555-note", w);
    let P = {};
    const reset = () => { sRa.value = RA.indexOf(1e3); sRb.value = RB.indexOf(47e3); sC.value = CC.indexOf(10e-6); upd(); };
    function upd() {
      const ra = RA[sRa.value], rb = RB[sRb.value], c = CC[sC.value];
      const th = 0.693 * (ra + rb) * c, tl = 0.693 * rb * c, T = th + tl;
      P = { ra, rb, c, th, tl, T, t0: performance.now() / 1000 };
      $(".v-ra", w).textContent = fmtR(ra); $(".v-rb", w).textContent = fmtR(rb); $(".v-c", w).textContent = fmtC(c);
      $(".o-f", w).textContent = (1 / T).toFixed(2) + " Hz";
      $(".o-t", w).textContent = fmtT(T);
      $(".o-th", w).textContent = "红 " + fmtT(th); $(".o-tl", w).textContent = "白 " + fmtT(tl);
      $(".o-d", w).textContent = Math.round((th / T) * 100) + "%（OUT 为高电平的时间占比）";
      const f = 1 / T;
      note.innerHTML = f > 25 ? "⚡ 超过约 25 Hz 后，眼睛已经分辨不出闪烁了——看起来两组灯都是“常亮”（其实在飞快地交替）。"
        : f < 0.3 ? "🐢 很慢：一次要等好几秒。想快一点就减小 R4 或 C1。"
        : ra > rb ? "注意：R3 比 R4 大时，“红灯亮”的时间明显比“白灯亮”长，节奏不再对称。本例让 R4 ≫ R3，所以占空比接近 50%。"
        : "试试把 C1 调大一倍：闪烁变慢一半。R3 和 R4 也一样——数值越大，电容充放电越慢。";
    }
    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = 260;
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const L = 52, Rm = 12, win = 3 * P.T;            // 显示 3 个周期
      const x = (t) => L + (t / win) * (W - L - Rm);
      // 电容电压波形：从 1/3 VCC 开始充电
      const vc = (t) => {
        const k = t % P.T;
        if (k < P.th) return 1 - (2 / 3) * Math.exp(-k / ((P.ra + P.rb) * P.c));
        return (2 / 3) * Math.exp(-(k - P.th) / (P.rb * P.c));
      };
      const out = (t) => (t % P.T) < P.th;
      const top1 = 14, h1 = 130, top2 = 176, h2 = 56;
      const y1 = (v) => top1 + h1 * (1 - v), y2 = (b) => top2 + (b ? 6 : h2 - 6);
      ctx.font = "12px -apple-system, PingFang SC, sans-serif";
      // 网格与阈值线
      ctx.strokeStyle = "#e9ecef"; ctx.lineWidth = 1;
      ctx.strokeRect(L, top1, W - L - Rm, h1); ctx.strokeRect(L, top2, W - L - Rm, h2);
      [[2 / 3, "2/3 VCC"], [1 / 3, "1/3 VCC"]].forEach(([v, s]) => {
        ctx.setLineDash([5, 4]); ctx.strokeStyle = "#adb5bd"; ctx.beginPath(); ctx.moveTo(L, y1(v)); ctx.lineTo(W - Rm, y1(v)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#868e96"; ctx.textAlign = "right"; ctx.fillText(s, L - 4, y1(v) + 4);
      });
      ctx.fillStyle = "#495057"; ctx.textAlign = "left";
      ctx.fillText("C1 电压（像水桶里的水位）", L + 6, top1 + 14);
      ctx.fillText("OUT 输出（3 脚）", L + 6, top2 + h2 / 2 + 4);
      ctx.textAlign = "right"; ctx.fillStyle = "#868e96"; ctx.fillText("高", L - 4, y2(true) + 4); ctx.fillText("低", L - 4, y2(false) + 4);
      // 曲线
      ctx.lineWidth = 2.2; ctx.strokeStyle = "#1c7ed6"; ctx.beginPath();
      for (let i = 0; i <= 600; i++) { const t = (i / 600) * win; const px = x(t), py = y1(vc(t)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      ctx.strokeStyle = "#e8590c"; ctx.beginPath();
      for (let i = 0; i <= 900; i++) { const t = (i / 900) * win; const px = x(t), py = y2(out(t)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      // 时间轴
      ctx.fillStyle = "#868e96"; ctx.textAlign = "center";
      for (let k = 0; k <= 3; k++) ctx.fillText(fmtT(k * P.T), x(k * P.T), H - 6);
      // 当前时刻
      const now = performance.now() / 1000 - P.t0;
      const tc = now % win;
      ctx.strokeStyle = "rgba(240,62,62,.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x(tc), top1); ctx.lineTo(x(tc), top2 + h2); ctx.stroke();
      ctx.fillStyle = "#f03e3e"; ctx.beginPath(); ctx.arc(x(tc), y1(vc(tc)), 4, 0, 7); ctx.fill();
      const hi = out(now);
      ledR.classList.toggle("on", hi); ledW.classList.toggle("on", !hi);
      requestAnimationFrame(draw);
    }
    [sRa, sRb, sC].forEach((s) => s.addEventListener("input", upd));
    $(".n555-reset", w).addEventListener("click", reset);
    reset();
    requestAnimationFrame(draw);
  });

  /* ============ A-4 PCB 层叠爆炸图 ============ */
  const LAYERS = [
    { id: 3, name: "顶层丝印", en: "Top Silkscreen", col: "#f1f3f5", stroke: "#adb5bd", file: "Gerber_TopSilkscreenLayer.GTO",
      what: "印在板子最外面的白色（或其他颜色）文字和图案：元件位号 R1、C1……、元件外框、作品名「眨眼小徽章」、Logo。它不导电，只是“油墨字”。", ex: "本例的位号、元件外框和「眨眼小徽章」几个字。" },
    { id: 5, name: "顶层阻焊", en: "Top Solder Mask", col: "#2f9e44", stroke: "#2b8a3e", alpha: 0.85, file: "Gerber_TopSolderMaskLayer.GTS",
      what: "盖在铜上面的那层绿油（下单时可以选别的颜色）。它保护铜线不氧化、焊接时防止锡流到不该去的地方。<b>注意：阻焊层上画的东西表示“这里不要绿油”（开窗）</b>，所以焊盘处是开着口的。", ex: "每个焊盘上方都自动开了窗，露出铜来焊接。" },
    { id: 1, name: "顶层铜", en: "Top Layer", col: "#e03131", stroke: "#c92a2a", file: "Gerber_TopLayer.GTL",
      what: "板子正面的铜箔：焊盘、导线、铺铜都在这一层。电流就是在铜里流的。", ex: "本例大部分导线都走在顶层，外加一整片 GND 铺铜。" },
    { id: "—", name: "基材 FR-4", en: "Substrate", col: "#e9d8a6", stroke: "#c9b37a", file: "（没有单独文件，板厚在下单时选，默认 1.6 mm）",
      what: "中间那块硬板子，用玻璃纤维布 + 环氧树脂压成，不导电，起支撑和绝缘作用。编辑器里没有这一“层”可以画，它的厚度和材料在下单页面选。", ex: "FR-4，厚 1.6 mm（下单默认）。" },
    { id: 2, name: "底层铜", en: "Bottom Layer", col: "#1c7ed6", stroke: "#1864ab", file: "Gerber_BottomLayer.GBL",
      what: "板子背面的铜箔。双面板的第二层走线空间；上下两层铜通过<b>过孔</b>连接。", ex: "自动布线把几段 VCC 线放到了底层，另有一整片 GND 铺铜。" },
    { id: 6, name: "底层阻焊", en: "Bottom Solder Mask", col: "#2f9e44", stroke: "#2b8a3e", alpha: 0.85, file: "Gerber_BottomSolderMaskLayer.GBS",
      what: "背面的绿油，作用同顶层阻焊。", ex: "背面没有元件，基本是满满一层绿油。" },
    { id: 4, name: "底层丝印", en: "Bottom Silkscreen", col: "#f1f3f5", stroke: "#adb5bd", file: "Gerber_BottomSilkscreenLayer.GBO",
      what: "背面的文字图案。元件都在正面时，背面丝印可以用来写名字、日期、版本号。", ex: "本例背面没放文字（🎨 可以自己加）。" },
  ];
  const OTHERS = [
    ["11", "板框层", "画板子外形轮廓。工厂沿着这条线把板子切下来。本例是一个直径 40 mm 的圆。"],
    ["12", "多层", "同时属于所有铜层的东西，比如插件焊盘、过孔——它们是穿透整块板子的。"],
    ["7 / 8", "顶层 / 底层锡膏层", "钢网用的：贴片时工厂用一张有孔的钢片往焊盘上刷锡膏，这层就是钢片上开孔的形状。"],
    ["13", "文档层", "写给人看的备注，不会被生产出来。"],
    ["56", "钻孔图层", "标出每个孔的位置和大小，供工厂钻孔参考。"],
    ["57", "飞线层", "显示还没连的“飞线”。只在软件里显示，不生产。"],
    ["48~51", "元件外形 / 标识 / 引脚层", "元件封装里的辅助图形，帮你在编辑器里看清元件，不生产。"],
  ];
  $$(".stack-widget").forEach((w) => {
    const N = LAYERS.length;
    w.innerHTML = `<div class="stk-wrap"><svg class="stk-svg" viewBox="0 0 520 330"></svg>
      <div class="stk-info"></div></div>
      <div class="stk-bar"><label><input type="checkbox" class="stk-ex" checked> 拆开显示（爆炸图）</label></div>
      <div class="stk-others"><b>编辑器里还有这些“非生产”或辅助图层：</b><div class="chips"></div></div>`;
    const svg = $(".stk-svg", w), info = $(".stk-info", w), ex = $(".stk-ex", w);
    const chips = $(".chips", w);
    OTHERS.forEach(([n, nm, d]) => { const c = el("button", "chip", `<span>${n}</span>${nm}`); c.type = "button"; c.addEventListener("click", () => { cur = -1; render(); info.innerHTML = `<h4>${n} · ${nm}</h4><p>${d}</p>`; $$(".chip", chips).forEach((x) => x.classList.toggle("on", x === c)); }); chips.appendChild(c); });
    let cur = 2;
    const NS = "http://www.w3.org/2000/svg";
    function render() {
      svg.innerHTML = "";
      const gap = ex.checked ? 38 : 9;
      for (let i = N - 1; i >= 0; i--) {
        const L = LAYERS[i];
        const y = (ex.checked ? 300 : 230) - (N - 1 - i) * gap;
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "stk-l" + (i === cur ? " on" : ""));
        const x0 = 150, wdt = 250, dx = 70, dh = 46;
        const th = L.id === "—" ? 14 : 4;
        const pts = `${x0},${y} ${x0 + wdt},${y} ${x0 + wdt + dx},${y - dh} ${x0 + dx},${y - dh}`;
        g.innerHTML = `<polygon points="${x0},${y} ${x0 + wdt},${y} ${x0 + wdt},${y + th} ${x0},${y + th}" fill="${L.stroke}"/>
          <polygon points="${x0 + wdt},${y} ${x0 + wdt + dx},${y - dh} ${x0 + wdt + dx},${y - dh + th} ${x0 + wdt},${y + th}" fill="${L.stroke}" opacity=".8"/>
          <polygon points="${pts}" fill="${L.col}" fill-opacity="${L.alpha || 1}" stroke="${L.stroke}" stroke-width="1.2"/>
          <text x="${x0 - 10}" y="${y - 6}" text-anchor="end" font-size="13">${L.name}</text>
          <text x="${x0 + wdt + dx + 10}" y="${y - dh + 14}" font-size="12" class="stk-id">${L.id === "—" ? "（无编号）" : "图层 " + L.id}</text>`;
        if (L.id === 1 || L.id === 2) {   // 铜层上画几根“走线”
          const yy = y - dh / 2;
          g.innerHTML += `<path d="M${x0 + 60},${y - 8} L${x0 + 110},${yy} L${x0 + 230},${yy}" stroke="#ffd8a8" stroke-width="2.5" fill="none" opacity=".9"/>`;
        }
        if (L.id === 3 || L.id === 4) g.innerHTML += `<text x="${x0 + 150}" y="${y - 18}" font-size="11" fill="#495057" text-anchor="middle">${L.id === 3 ? "R1 C1 眨眼小徽章" : "（背面文字）"}</text>`;
        g.addEventListener("click", () => { cur = i; render(); });
        svg.appendChild(g);
      }
      if (cur >= 0) {
        const L = LAYERS[cur];
        info.innerHTML = `<h4>${L.name} <small>${L.en}</small></h4><div class="stk-tag">编辑器图层编号：<b>${L.id}</b></div>
          <p>${L.what}</p><p><b>本例：</b>${L.ex}</p><p class="muted small">导出的 Gerber 文件：<code>${L.file}</code></p>`;
        $$(".chip", chips).forEach((x) => x.classList.remove("on"));
      }
    }
    ex.addEventListener("change", render);
    render();
  });

  /* ============ A-2 器件三联图 ============ */
  const TRI = [
    ["符号", "dev-sym", "<b>符号（Symbol）</b>：在<b>原理图</b>里的样子。一个方框 + 8 根“引脚线”，每根标着编号（1~8）和功能名（VCC、GND、OUT……）。它只表示“这个芯片有哪些脚、各是干什么的”，大小和真实芯片无关。"],
    ["封装", "dev-fp", "<b>封装（Footprint）</b>：在 <b>PCB</b> 上的样子。8 个红色的长条是<b>焊盘</b>（铜做的小块，芯片的脚就焊在上面），尺寸和间距跟真实芯片一模一样（SOIC-8，脚间距 1.27 mm）。黄色框是丝印外形，左下的圆点标出 1 号脚。"],
    ["实物", "dev-photo", "<b>实物照片</b>：真实的 NE555DR 芯片，黑色塑料小块，两边各 4 只“脚”。背景的格子是 1 mm，可以感受一下它有多小（约 5 mm × 6 mm）。"],
    ["3D 模型", "dev-3d", "<b>3D 模型</b>：用来做 3D 预览，看看元件装上去会不会撞到别的东西。它是根据封装自动对上的。"],
  ];
  $$(".tri-widget").forEach((w) => {
    w.innerHTML = `<div class="tri-btns"></div><div class="tri-body"><div class="tri-img"><img alt=""></div><div class="tri-txt"></div></div>
      <div class="tri-strip"></div>`;
    const btns = $(".tri-btns", w), img = $(".tri-img img", w), txt = $(".tri-txt", w), strip = $(".tri-strip", w);
    const show = (i) => {
      img.src = ROOT + "img/ch1/" + TRI[i][1] + ".png"; img.alt = TRI[i][0];
      txt.innerHTML = TRI[i][2];
      $$("button", btns).forEach((b, j) => b.classList.toggle("on", i === j));
      $$("img", strip).forEach((b, j) => b.classList.toggle("on", i === j));
    };
    TRI.forEach((t, i) => {
      const b = el("button", "", `${i + 1}. ${t[0]}`); b.type = "button"; b.addEventListener("click", () => show(i)); btns.appendChild(b);
      const s = el("img"); s.src = ROOT + "img/ch1/" + t[1] + ".png"; s.alt = t[0]; s.addEventListener("click", () => show(i)); strip.appendChild(s);
    });
    show(0);
  });

  /* ============ A-3 原理图 ↔ PCB 对照 ============ */
  // 坐标：截图上的 CSS 像素（sch 来自 A2-21，pcb 来自 A3-03）
  const XP = {
    sch: { img: "a0-sch", crop: [255, 275, 895, 420] },
    pcb: { img: "a3-pcb", crop: [255, 85, 900, 745] },
    parts: {
      USB1: [[363, 508], [370, 490], "Type-C 插座：电从这里进来"],
      R1: [[522, 533], [583, 593], "5.1kΩ：告诉充电器“我要用电”（CC1）"],
      R2: [[488, 542], [505, 630], "5.1kΩ：同上（CC2）"],
      C3: [[616, 425], [628, 330], "100nF 去耦电容：芯片旁边的“小水缸”"],
      R3: [[694, 425], [718, 330], "1kΩ 定时电阻"],
      R4: [[694, 483], [745, 345], "47kΩ 定时电阻"],
      C1: [[694, 551], [715, 662], "10µF 定时电容：决定闪烁快慢"],
      U1: [[803, 488], [815, 465], "NE555 节拍器芯片"],
      C2: [[875, 533], [895, 612], "10nF：稳定 5 脚 CONT"],
      LED1: [[1000, 352], [990, 245], "白灯（眼睛）"],
      LED2: [[1081, 352], [1091, 245], "白灯（眼睛）"],
      R5: [[1000, 407], [990, 292], "330Ω 限流电阻"],
      R6: [[1081, 407], [1088, 292], "330Ω 限流电阻"],
      R7: [[1000, 533], [1010, 590], "330Ω 限流电阻"],
      R8: [[1081, 533], [1108, 590], "330Ω 限流电阻"],
      LED3: [[1000, 597], [1017, 712], "红灯（腮红）"],
      LED4: [[1081, 597], [1116, 712], "红灯（腮红）"],
    },
  };
  $$(".xprobe-widget").forEach((w) => {
    w.innerHTML = `<div class="xp-btns"></div><div class="xp-row">
      <div class="xp-pane"><div class="xp-cap">原理图</div><div class="xp-stage s"><img src="${ROOT}img/ch1/${XP.sch.img}.png" alt="原理图"><i class="ring"></i></div></div>
      <div class="xp-pane"><div class="xp-cap">PCB（刚转换过来，还没布局）</div><div class="xp-stage p"><img src="${ROOT}img/ch1/${XP.pcb.img}.png" alt="PCB"><i class="ring"></i></div></div>
      </div><div class="xp-info">👆 点上面的位号，看看它在原理图和 PCB 里分别在哪。</div>`;
    const btns = $(".xp-btns", w);
    const place = (stage, crop, p) => {
      const r = $(".ring", stage);
      r.style.left = ((p[0] - crop[0]) / crop[2]) * 100 + "%";
      r.style.top = ((p[1] - crop[1]) / crop[3]) * 100 + "%";
      r.classList.add("on");
    };
    Object.entries(XP.parts).forEach(([k, v]) => {
      const b = el("button", "", k); b.type = "button";
      b.addEventListener("click", () => {
        $$("button", btns).forEach((x) => x.classList.toggle("on", x === b));
        place($(".xp-stage.s", w), XP.sch.crop, v[0]);
        place($(".xp-stage.p", w), XP.pcb.crop, v[1]);
        $(".xp-info", w).innerHTML = `<b>${k}</b>：${v[2]}。两边是<b>同一个元件</b>——原理图里的符号变成了 PCB 上的封装，原理图里的连线变成了 PCB 上的飞线。`;
      });
      btns.appendChild(b);
    });
  });

  /* ============ A-4 mm / mil 换算 ============ */
  $$(".unit-widget").forEach((w) => {
    w.innerHTML = `<div class="uc-row"><input type="number" class="uc-mm" value="0.254" step="0.001"> mm　⇄　<input type="number" class="uc-mil" step="0.1"> mil</div>
      <div class="uc-quick"></div><div class="widget-hint">1 inch（英寸）= 25.4 mm = 1000 mil，所以 1 mil = 0.0254 mm，1 mm ≈ 39.37 mil。</div>`;
    const mm = $(".uc-mm", w), mil = $(".uc-mil", w);
    const fromMm = () => { mil.value = +(mm.value / 0.0254).toFixed(2); };
    const fromMil = () => { mm.value = +(mil.value * 0.0254).toFixed(4); };
    mm.addEventListener("input", fromMm); mil.addEventListener("input", fromMil);
    [["默认线宽", 0.254], ["最小线宽", 0.127], ["安全间距", 0.152], ["过孔外径", 0.61], ["板厚", 1.6], ["板子直径", 40]].forEach(([n, v]) => {
      const b = el("button", "", `${n} ${v} mm`); b.type = "button";
      b.addEventListener("click", () => { mm.value = v; fromMm(); });
      $(".uc-quick", w).appendChild(b);
    });
    fromMm();
  });
})();
