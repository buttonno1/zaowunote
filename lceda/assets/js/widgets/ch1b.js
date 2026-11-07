/* 第 1 章 案例 B 互动组件：系统框图、上拉电阻按键演示、天线净空示意、RGB 彩灯模拟、Quickstart 流程总结
   样式全部在本文件里注入，不依赖 style.css 的新增规则。 */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = "http://www.w3.org/2000/svg";

  const CSS = `
  .bd-wrap{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;align-items:start}
  @media(max-width:860px){.bd-wrap{grid-template-columns:1fr}}
  .bd-svg{width:100%;height:auto;user-select:none}
  .bd-svg .blk{cursor:pointer}
  .bd-svg .blk rect{fill:#fff;stroke:#adb5bd;stroke-width:2;transition:.15s}
  .bd-svg .blk:hover rect{stroke:#74c0fc}
  .bd-svg .blk.on rect{fill:#e7f1fd;stroke:#1c6fd6;stroke-width:3}
  .bd-svg .blk text{font-size:13px;fill:#1f2328;pointer-events:none}
  .bd-svg .blk text.sub{font-size:11px;fill:#57606a}
  .bd-svg .wire{fill:none;stroke-width:2.5}
  .bd-svg .lab{font-size:11px;fill:#57606a}
  .bd-info{background:#f6f8fa;border:1px solid #e3e6ea;border-radius:12px;padding:14px 16px;font-size:14.5px;line-height:1.7;min-height:200px}
  .bd-info h4{margin:0 0 6px;font-size:16px}
  .bd-info dl{display:grid;grid-template-columns:4.8em 1fr;gap:4px 8px;margin:8px 0 0;font-size:14px}
  .bd-info dt{color:#8c959f}.bd-info dd{margin:0}
  .bd-legend{font-size:12.5px;color:#57606a;margin-top:6px}
  .bd-legend i{display:inline-block;width:18px;height:3px;vertical-align:middle;margin:0 4px 0 10px}
  .pu-wrap{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:18px;align-items:center}
  @media(max-width:760px){.pu-wrap{grid-template-columns:1fr}}
  .pu-svg{width:100%;height:auto;user-select:none}
  .pu-svg text{font-size:13px;fill:#1f2328}
  .pu-svg .btncap{cursor:pointer}
  .pu-ctrl button,.ant-ctrl button,.rgb-ctrl button{font:inherit;font-size:14px;padding:6px 14px;border-radius:18px;border:1px solid #e3e6ea;background:#fff;cursor:pointer;margin:0 6px 6px 0}
  .pu-ctrl button.on,.ant-ctrl button.on,.rgb-ctrl button.on{background:#1c6fd6;color:#fff;border-color:#1c6fd6}
  .pu-press{font-weight:700;padding:10px 22px!important;font-size:15px!important}
  .pu-press.down{background:#f03e3e!important;color:#fff!important;border-color:#f03e3e!important}
  .pu-meter{font-size:30px;font-weight:700;font-family:ui-monospace,Menlo,monospace;margin:6px 0}
  .pu-state{font-size:14.5px;line-height:1.7;background:#f6f8fa;border:1px solid #e3e6ea;border-radius:10px;padding:10px 14px}
  .pu-state code{font-size:13px}
  .ant-svg{width:100%;height:auto;max-width:720px;display:block;margin:0 auto}
  .ant-svg text{font-size:12px;fill:#1f2328}
  .ant-bar{height:14px;border-radius:7px;background:#e9ecef;overflow:hidden;max-width:360px}
  .ant-bar i{display:block;height:100%;background:linear-gradient(90deg,#f03e3e,#fab005,#40c057);transition:width .5s}
  .ant-out{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:14.5px}
  .rgb-board{display:flex;justify-content:center;gap:26px;padding:22px 10px;background:#123a7a;border-radius:14px;margin:6px 0 12px;position:relative}
  .rgb-led{width:58px;height:58px;border-radius:8px;background:#eee;border:3px solid #ddd;display:flex;align-items:center;justify-content:center;position:relative}
  .rgb-led i{width:30px;height:30px;border-radius:50%;background:#333;transition:background .05s,box-shadow .05s}
  .rgb-led span{position:absolute;bottom:-20px;font-size:11px;color:#dbe4ff}
  .rgb-info{font-size:14px;color:#57606a}
  .rgb-info code{font-size:12.5px}
  .qs-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  @media(max-width:860px){.qs-flow{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .qs-step{border:2px solid #e3e6ea;border-radius:12px;padding:10px 10px 8px;background:#fff;cursor:pointer;font-size:13.5px;line-height:1.45;transition:.15s;position:relative}
  .qs-step:hover{border-color:#74c0fc;transform:translateY(-2px)}
  .qs-step.on{border-color:#1c6fd6;background:#e7f1fd;box-shadow:0 4px 14px rgba(28,111,214,.18)}
  .qs-step b{display:block;font-size:14.5px;margin-bottom:2px}
  .qs-step .n{position:absolute;right:8px;top:6px;font-size:11px;color:#8c959f}
  .qs-step .ph{display:inline-block;font-size:11px;border-radius:8px;padding:0 6px;margin-top:4px}
  .qs-step .ph.s{background:#ebfbee;color:#2b8a3e}.qs-step .ph.p{background:#e7f5ff;color:#1971c2}.qs-step .ph.m{background:#fff4e6;color:#e8590c}.qs-step .ph.c{background:#f3f0ff;color:#6741d9}
  .qs-detail{margin-top:14px;padding:14px 18px;border-radius:12px;background:#f6f8fa;border:1px solid #e3e6ea;font-size:15px;min-height:130px;line-height:1.7}
  .qs-detail h4{margin:0 0 6px;font-size:16px}
  .qs-detail .go a{display:inline-block;margin:6px 8px 0 0;padding:3px 12px;border-radius:14px;border:1px solid #a5d8ff;background:#fff;font-size:14px}
  `;
  if ($(".bd-widget,.pu-widget,.ant-widget,.rgb-widget,.qs-widget")) {
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ============ B-0 系统框图 ============ */
  const BLOCKS = [
    { id: "usb", x: 10, y: 120, w: 120, h: 70, t: "Type-C 接口", s: "USB1 · 16P",
      what: "整块板子的<b>入口</b>：一根 USB 线同时送进来两样东西——<b>5 V 电</b>（VBUS / GND）和<b>数据</b>（D+ / D-）。",
      why: "要用 USB 直接写程序，所以必须是带 D+/D- 的 16P 接口，案例 A 那种只能供电的 6P 不行。CC1/CC2 各接一个 5.1 kΩ 电阻，让 C-to-C 充电器也肯给电（和案例 A 一样）。",
      parts: "USB1（C2765186）、R1/R2 5.1 kΩ" },
    { id: "ldo", x: 190, y: 30, w: 130, h: 70, t: "稳压芯片", s: "U2 · AMS1117-3.3",
      what: "把 USB 的 <b>5 V 降成 3.3 V</b>。ESP32-C3 只能吃 3.3 V，直接给 5 V 会烧坏。",
      why: "像水管上的<b>减压阀</b>：进来的水压高一点、波动一点都没关系，出去的永远是稳定的 3.3 V。输入输出两边的电容（C1 10 µF、C2 22 µF + C3 100 nF）是“小水缸”，让电压更稳。旁边的红色 LED4 是电源指示灯，一插电就亮。",
      parts: "U2（C6186）、C1、C2、C3、LED4 + R3 1 kΩ" },
    { id: "mcu", x: 190, y: 160, w: 150, h: 110, t: "ESP32-C3 模组", s: "U1 · 大脑 + Wi-Fi",
      what: "整块板子的<b>大脑</b>：执行你写的程序，控制灯、读按键，还能连 Wi-Fi。",
      why: "我们用的是乐鑫官方<b>模组</b>（芯片 + Flash + 晶振 + 天线已经在一个小铁壳里做好了），省掉最难的射频设计。它自带 USB，所以 D+/D- 直接接到模组的 IO19/IO18 就能写程序，不需要额外的 USB 转串口芯片。顶部那块露出来的是<b>板载天线</b>，下面不能有铜（B-3 会讲）。",
      parts: "U1（C2838502）、C4 10 µF + C5 100 nF 去耦、R6 10 kΩ + C6 1 µF（EN 复位延时）" },
    { id: "rgb", x: 410, y: 160, w: 130, h: 70, t: "RGB 彩灯 ×3", s: "LED1~3 · WS2812B",
      what: "三颗<b>可编程彩灯</b>，每颗都能单独显示任意颜色。",
      why: "它们是“智能灯”：每颗灯里有一个小芯片。模组只用<b>一根线</b>（IO8 → 第 1 颗的 DIN）发出一串数据，第 1 颗取走属于自己的那份，把剩下的从 DOU 转给第 2 颗……像<b>传纸条</b>一样串下去。灯的电源 VLED 经过二极管 D1 从 5 V 降到约 4.2 V，这样 3.3 V 的数据信号它也能认出来（B-2 详细讲）。",
      parts: "LED1~3（C2843785）、C7~C9 各 100 nF、D1（M7）、R5 10 kΩ" },
    { id: "key", x: 190, y: 310, w: 150, h: 60, t: "两个按键", s: "SW1 RST · SW2 BOOT",
      what: "<b>RST</b>（复位）：按一下，程序从头开始跑。<b>BOOT</b>（接 IO9）：平时当“用户按键”给程序用；按住 BOOT 再按 RST，模组进入<b>下载模式</b>。",
      why: "按键没按时，引脚被<b>上拉电阻</b>拉到 3.3 V（高电平）；按下就直接接地变成 0 V（低电平），程序读这个电压就知道有没有按。B-2 有互动演示。",
      parts: "SW1、SW2（C318884）" },
    { id: "hdr", x: 410, y: 290, w: 130, h: 80, t: "排针 J1", s: "1×8 · 预留扩展",
      what: "把 5V、3V3、GND 和 IO0、IO1、IO3、IO4、IO5 这几只引脚<b>引出来</b>，以后可以插杜邦线接传感器、舵机、屏幕。",
      why: "🎨 引出哪些脚可以自己决定。排针在 BOM 里设成「不加入 BOM」：工厂不贴，到手后自己焊（直插件手焊很容易）。",
      parts: "J1（C492407，不加入 BOM）" },
  ];
  $$(".bd-widget").forEach((w) => {
    w.innerHTML = `<div class="bd-wrap"><svg class="bd-svg" viewBox="0 0 550 385" aria-label="系统框图"></svg><div class="bd-info"></div></div>
      <div class="bd-legend">线的颜色：<i style="background:#f03e3e"></i>5 V（VBUS / VLED）<i style="background:#f59f00"></i>3.3 V<i style="background:#1c7ed6"></i>USB 数据 D+/D-<i style="background:#2f9e44"></i>信号（GPIO）</div>`;
    const svg = $(".bd-svg", w), info = $(".bd-info", w);
    const wires = [
      ["M130,140 L160,140 L160,65 L190,65", "#f03e3e", "5V", 148, 100],
      ["M320,65 L360,65 L360,140 L265,140 L265,160", "#f59f00", "3.3V", 366, 110],
      ["M130,175 L190,175", "#1c7ed6", "D+/D-", 136, 168],
      ["M340,200 L410,200", "#2f9e44", "IO8", 360, 194],
      ["M265,310 L265,270", "#2f9e44", "EN / IO9", 272, 295],
      ["M340,250 L380,250 L380,320 L410,320", "#2f9e44", "IO0~5", 348, 244],
      ["M160,140 L160,105 L475,105 L475,160", "#f03e3e", "5V→D1→VLED", 395, 99],
    ];
    svg.innerHTML = wires.map(([d, c, l, lx, ly]) => `<path class="wire" d="${d}" stroke="${c}"/><text class="lab" x="${lx}" y="${ly}">${l}</text>`).join("") +
      `<text class="lab" x="10" y="20">点击方块看它的作用 👇</text>`;
    BLOCKS.forEach((b, i) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "blk");
      g.innerHTML = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="10"/>
        <text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 - 3}" text-anchor="middle" font-weight="700">${b.t}</text>
        <text class="sub" x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + 15}" text-anchor="middle">${b.s}</text>`;
      if (b.id === "mcu") g.innerHTML += `<rect x="${b.x + 20}" y="${b.y + 6}" width="${b.w - 40}" height="16" rx="3" style="fill:#fff3bf;stroke:#fab005;stroke-width:1"/><text class="sub" x="${b.x + b.w / 2}" y="${b.y + 18}" text-anchor="middle">天线</text>`;
      g.addEventListener("click", () => show(i));
      svg.appendChild(g);
    });
    function show(i) {
      $$(".blk", svg).forEach((g, j) => g.classList.toggle("on", i === j));
      const b = BLOCKS[i];
      info.innerHTML = `<h4>${b.t} <small style="color:#8c959f;font-weight:400">${b.s}</small></h4><p style="margin:0">${b.what}</p>
        <dl><dt>为什么</dt><dd>${b.why}</dd><dt>对应元件</dt><dd>${b.parts}</dd></dl>`;
    }
    show(2);
  });

  /* ============ B-2 上拉电阻按键演示 ============ */
  $$(".pu-widget").forEach((w) => {
    w.innerHTML = `<div class="pu-wrap"><svg class="pu-svg" viewBox="0 0 360 300"></svg>
      <div class="pu-ctrl">
        <div><button type="button" class="pu-press">按住我 = 按下 BOOT 键</button></div>
        <div style="margin-top:8px">上拉电阻：<button type="button" data-r="10000" class="on">有（10 kΩ）</button><button type="button" data-r="0">去掉它试试</button></div>
        <div style="margin-top:6px">IO9 引脚电压</div>
        <div class="pu-meter">3.30 V</div>
        <div class="pu-state"></div>
      </div></div>`;
    const svg = $(".pu-svg", w), meter = $(".pu-meter", w), state = $(".pu-state", w), press = $(".pu-press", w);
    let down = false, R = 10000, noise = 0, timer = null;
    function draw(v) {
      const hasR = R > 0;
      const col = (x) => x > 2 ? "#f59f00" : x < 0.8 ? "#1c7ed6" : "#adb5bd";
      const nodeCol = col(v);
      const cur = hasR && down;
      svg.innerHTML = `
        <text x="150" y="22" font-weight="700">3.3 V</text>
        <line x1="130" y1="30" x2="200" y2="30" stroke="#f59f00" stroke-width="4"/>
        <line x1="165" y1="30" x2="165" y2="60" stroke="#f59f00" stroke-width="3"/>
        ${hasR ? `<rect x="153" y="60" width="24" height="70" rx="3" fill="#fff" stroke="#495057" stroke-width="2"/>
          <text x="186" y="92">上拉电阻</text><text x="186" y="110" style="font-size:12px;fill:#57606a">（例：10 kΩ）</text>`
          : `<line x1="165" y1="60" x2="165" y2="130" stroke="#dee2e6" stroke-width="3" stroke-dasharray="5 5"/><text x="180" y="100" style="fill:#c92a2a">（已去掉）</text>`}
        <line x1="165" y1="130" x2="165" y2="170" stroke="${hasR ? nodeCol : "#adb5bd"}" stroke-width="3"/>
        <circle cx="165" cy="170" r="5" fill="${nodeCol}"/>
        <line x1="165" y1="170" x2="60" y2="170" stroke="${nodeCol}" stroke-width="3"/>
        <rect x="10" y="148" width="50" height="44" rx="5" fill="#212529"/><text x="35" y="168" text-anchor="middle" style="fill:#fff;font-size:11px">ESP32</text><text x="35" y="184" text-anchor="middle" style="fill:#ffd43b;font-size:12px">IO9</text>
        <line x1="165" y1="170" x2="165" y2="200" stroke="${nodeCol}" stroke-width="3"/>
        <g class="btncap">
          <line x1="165" y1="200" x2="${down ? 165 : 150}" y2="${down ? 240 : 236}" stroke="#495057" stroke-width="4" stroke-linecap="round"/>
          <rect x="${down ? 185 : 175}" y="${down ? 208 : 198}" width="50" height="24" rx="5" fill="${down ? "#f03e3e" : "#e9ecef"}" stroke="#495057"/>
          <text x="${down ? 210 : 200}" y="${down ? 225 : 215}" text-anchor="middle" style="font-size:11px;${down ? "fill:#fff" : ""}">BOOT</text>
        </g>
        <circle cx="165" cy="240" r="4" fill="#495057"/>
        <line x1="165" y1="240" x2="165" y2="262" stroke="#1c7ed6" stroke-width="3"/>
        <line x1="140" y1="262" x2="190" y2="262" stroke="#1c7ed6" stroke-width="4"/>
        <line x1="150" y1="270" x2="180" y2="270" stroke="#1c7ed6" stroke-width="3"/>
        <line x1="159" y1="278" x2="171" y2="278" stroke="#1c7ed6" stroke-width="2"/>
        <text x="200" y="272">GND（0 V）</text>
        ${cur ? `<g><circle r="4" fill="#e03131"><animateMotion dur="1.2s" repeatCount="indefinite" path="M165,40 L165,262"/></circle>
          <circle r="4" fill="#e03131"><animateMotion dur="1.2s" begin="0.6s" repeatCount="indefinite" path="M165,40 L165,262"/></circle></g>
          <text x="20" y="100" style="fill:#e03131;font-size:12px">电流 ≈ 3.3V / 10kΩ</text><text x="20" y="116" style="fill:#e03131;font-size:12px">= 0.33 mA（很小）</text>` : ""}`;
      svg.querySelector(".btncap").addEventListener("pointerdown", (e) => { e.preventDefault(); set(true); });
    }
    function upd() {
      let v, txt;
      if (down) { v = 0; txt = `按键按下：IO9 被直接接到 GND，电压 <b>0 V</b>，程序 <code>digitalRead(9)</code> 读到 <b>LOW（0）</b>。${R ? "此时电流从 3.3 V 经过上拉电阻流到地——电阻限制了电流，所以不会短路。" : ""}`; }
      else if (R) { v = 3.3; txt = `按键松开：电阻把 IO9 “拉”到 3.3 V，读到 <b>HIGH（1）</b>。电阻里几乎没有电流（芯片引脚的输入像一扇关着的门）。`; }
      else { v = 1.2 + Math.sin(noise) * 1.1 + (Math.random() - 0.5) * 0.8; v = Math.max(0, Math.min(3.3, v));
        txt = `⚠️ 没有上拉电阻、按键又松开时，IO9 什么都没接——叫“<b>悬空</b>”。它像一根天线，会被手指、旁边的导线干扰，电压乱飘，程序一会儿读到 1、一会儿读到 0，好像有人在乱按键。所以按键一定要配上拉（或下拉）电阻。`; }
      meter.textContent = v.toFixed(2) + " V";
      meter.style.color = v > 2 ? "#e8590c" : v < 0.8 ? "#1971c2" : "#868e96";
      state.innerHTML = txt;
      draw(v);
    }
    function set(d) { if (down === d) return; down = d; press.classList.toggle("down", d); upd(); }
    press.addEventListener("pointerdown", (e) => { e.preventDefault(); set(true); });
    window.addEventListener("pointerup", () => set(false));
    press.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); set(true); } });
    press.addEventListener("keyup", () => set(false));
    $$("button[data-r]", w).forEach((b) => b.addEventListener("click", () => {
      R = +b.dataset.r;
      $$("button[data-r]", w).forEach((x) => x.classList.toggle("on", x === b));
      clearInterval(timer); timer = null;
      if (!R) timer = setInterval(() => { noise += 0.7; if (!down) upd(); }, 180);
      upd();
    }));
    upd();
  });

  /* ============ B-3 天线净空示意 ============ */
  $$(".ant-widget").forEach((w) => {
    w.innerHTML = `<div class="ant-ctrl"><button type="button" data-m="clear" class="on">✅ 天线在板边 + 下方净空</button><button type="button" data-m="cu">❌ 天线下方铺了铜</button><button type="button" data-m="mid">❌ 模组放在板子中间</button></div>
      <svg class="ant-svg" viewBox="0 0 720 300"></svg>
      <div class="ant-out"><span>信号强度（示意）</span><div class="ant-bar" style="flex:1"><i></i></div><b class="ant-pct"></b></div>
      <p class="ant-txt" style="font-size:14.5px;margin:8px 0 0"></p>`;
    const svg = $(".ant-svg", w), bar = $(".ant-bar i", w), pct = $(".ant-pct", w), txt = $(".ant-txt", w);
    const MODES = {
      clear: { s: 92, t: "天线（黄色区域）贴着板边（或伸出板边），下方所有层都没有铜：信号可以向四面八方自由发出去。这就是乐鑫推荐的放法，也是本案例的做法。" },
      cu: { s: 35, t: "天线下面有一大片铜（比如 GND 铺铜）：铜像一面<b>镜子 / 挡板</b>，把天线的能量吸收、反射掉一大部分，还会让天线“失谐”。结果是 Wi-Fi 距离变短、动不动就断。" },
      mid: { s: 50, t: "模组放在板子正中间，天线四周和下面都是铺铜和走线：同样会被挡住一大块，而且离手、外壳更近，信号更差。" },
    };
    let mode = "clear";
    function draw() {
      const m = MODES[mode];
      const cu = mode !== "clear";
      const mid = mode === "mid";
      const bx = mid ? 150 : 150, by = mid ? 90 : 120;
      const mx = mid ? 300 : 300, my = mid ? 120 : 70;   // 模组左上角
      let rings = "";
      const N = 4;
      for (let k = 0; k < N; k++) {
        const big = cu ? 90 : 190;
        rings += `<circle cx="${mx + 60}" cy="${my + 14}" r="10" fill="none" stroke="#1c7ed6" stroke-width="3" opacity="0">
          <animate attributeName="r" from="12" to="${big}" dur="2.4s" begin="${k * 0.6}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="${cu ? "0.9;0.25;0" : "0.9;0.5;0"}" dur="2.4s" begin="${k * 0.6}s" repeatCount="indefinite"/></circle>`;
      }
      svg.innerHTML = `
        <defs><pattern id="cuP" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#c92a2a"/><path d="M0,8 L8,0" stroke="#e03131" stroke-width="2"/></pattern></defs>
        <rect x="${bx}" y="${by}" width="300" height="${mid ? 190 : 170}" rx="10" fill="#2b8a3e" stroke="#1b5e20" stroke-width="2"/>
        <rect x="${bx + 8}" y="${by + 8}" width="284" height="${mid ? 174 : 154}" rx="6" fill="url(#cuP)" opacity=".55"/>
        ${!cu ? `<rect x="${mx - 4}" y="${by}" width="128" height="22" fill="#2b8a3e"/>` : ""}
        <rect x="${mx}" y="${my}" width="120" height="${mid ? 90 : 100}" rx="4" fill="#ced4da" stroke="#868e96"/>
        <rect x="${mx}" y="${my}" width="120" height="28" rx="4" fill="#fff3bf" stroke="#f59f00"/>
        <path d="M${mx + 10},${my + 20} h18 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h14 v12 h8" fill="none" stroke="#e67700" stroke-width="2"/>
        <text x="${mx + 60}" y="${my + 60}" text-anchor="middle">ESP32-C3 模组</text>
        ${cu ? `<rect x="${mx}" y="${my}" width="120" height="28" fill="url(#cuP)" opacity=".55"/>` : ""}
        ${rings}
        ${cu ? `<text x="${mx + 160}" y="${my + 18}" style="fill:#c92a2a;font-weight:700">被铜挡住 / 吸收</text>` : `<text x="${mx + 160}" y="${my - 10}" style="fill:#1971c2;font-weight:700">信号自由辐射</text>`}
        <text x="${bx + 6}" y="${by + (mid ? 210 : 190)}" style="fill:#57606a">绿色 = 电路板；红色斜纹 = 铺铜（GND）；黄色 = 天线</text>
        ${!cu ? `<line x1="${mx - 4}" y1="${by}" x2="${mx + 124}" y2="${by}" stroke="#fff" stroke-dasharray="4 3"/><text x="${mx + 128}" y="${by + 14}" style="fill:#fff;font-size:11px">板边</text>` : ""}`;
      bar.style.width = m.s + "%";
      pct.textContent = m.s + " 分";
      txt.innerHTML = m.t + " <span style=\"color:#8c959f\">（分数只是示意，不是实测值。）</span>";
    }
    $$("button[data-m]", w).forEach((b) => b.addEventListener("click", () => {
      mode = b.dataset.m; $$("button[data-m]", w).forEach((x) => x.classList.toggle("on", x === b)); draw();
    }));
    draw();
  });

  /* ============ B-5 RGB 彩灯模拟（对应程序 1 / 程序 2） ============ */
  function hsv(h, s, v) {   // h: 0~65535（和 Adafruit NeoPixel 的 ColorHSV 一样）
    h = (((h % 65536) + 65536) % 65536) / 65536 * 6;
    const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return [r * 255, g * 255, b * 255].map(Math.round);
  }
  $$(".rgb-widget").forEach((w) => {
    w.innerHTML = `<div class="rgb-board"><div class="rgb-led"><i></i><span>LED1</span></div><div class="rgb-led"><i></i><span>LED2</span></div><div class="rgb-led"><i></i><span>LED3</span></div></div>
      <div class="rgb-ctrl"><button type="button" data-k="0" class="on">模式 0 彩虹</button><button type="button" data-k="1">模式 1 呼吸</button><button type="button" data-k="2">模式 2 单色</button><button type="button" data-k="3">模式 3 关灯</button>
      <button type="button" class="rgb-boot" style="margin-left:10px">👆 按一下 BOOT（切换模式）</button></div>
      <div class="rgb-info"></div>`;
    const leds = $$(".rgb-led i", w), info = $(".rgb-info", w);
    let mode = 0, hue = 0, t0 = performance.now(), colorIdx = 0;
    const COLORS = [[255, 0, 0, "红"], [0, 255, 0, "绿"], [0, 0, 255, "蓝"], [255, 255, 255, "白"]];
    const DESC = [
      "彩虹：每颗灯的色相（hue）错开 1/3 圈，整体不停地转。对应程序 1 的 <code>strip.ColorHSV(hue + i * 65536 / 3)</code>。",
      "呼吸：三颗灯同一个颜色，亮度按正弦曲线慢慢变亮、变暗。",
      "单色：常亮一种颜色。程序里每按一次 BOOT 进入下一个模式。",
      "关灯：<code>strip.clear(); strip.show();</code>",
    ];
    function setMode(k) { mode = k; $$("button[data-k]", w).forEach((b) => b.classList.toggle("on", +b.dataset.k === k)); info.innerHTML = DESC[k]; }
    $$("button[data-k]", w).forEach((b) => b.addEventListener("click", () => setMode(+b.dataset.k)));
    $(".rgb-boot", w).addEventListener("click", () => setMode((mode + 1) % 4));
    function paint(i, [r, g, b]) {
      const c = `rgb(${r},${g},${b})`;
      leds[i].style.background = (r + g + b) < 8 ? "#333" : c;
      leds[i].style.boxShadow = (r + g + b) < 8 ? "none" : `0 0 18px 6px rgba(${r},${g},${b},.65)`;
    }
    function frame(now) {
      const dt = Math.max(0, now - t0) / 1000;
      if (mode === 0) { hue = (dt * 12000) % 65536; for (let i = 0; i < 3; i++) paint(i, hsv(hue + i * 65536 / 3, 1, 1)); }
      else if (mode === 1) { const v = (Math.sin(dt * 2) + 1) / 2 * 0.95 + 0.05; for (let i = 0; i < 3; i++) paint(i, hsv(43690, 0.9, v)); }
      else if (mode === 2) { const c = COLORS[colorIdx]; for (let i = 0; i < 3; i++) paint(i, c); }
      else for (let i = 0; i < 3; i++) paint(i, [0, 0, 0]);
      requestAnimationFrame(frame);
    }
    setMode(0);
    requestAnimationFrame(frame);
  });

  /* ============ Quickstart 小结：完整流程 ============ */
  const STEPS = [
    ["新建工程", "工程 = 一个文件夹，装着原理图、PCB。", "s", [["A-1", "a1.html"], ["B-2 开头", "b2.html"]]],
    ["找元件 · 读规格书", "按 C 编号在立创商城库里搜元件；基础库 / 扩展库；复杂芯片先找官方参考电路照着画。", "s", [["A-2.1", "a2.html#A2.1-打开元件库搜索-NE555"], ["B-1", "b1.html"]]],
    ["画原理图", "放元件、连导线、电源 / 地符号、网络标签、非连接标识；用矩形和文字给模块分区。", "s", [["A-2", "a2.html"], ["B-2", "b2.html"]]],
    ["原理图检查", "原理图 DRC；器件标准化——但换完器件要回头看 PCB。", "s", [["A-2.11", "a2.html#A2.11-检查原理图DRC并修好一个真实的错误"], ["B-2 检查", "b2.html#B2.9-检查DRC-与器件标准化"]]],
    ["转到 PCB", "设计 → 更新/转换原理图到 PCB，元件和飞线一起进来。", "p", [["A-3", "a3.html"], ["B-3.1", "b3.html#B3.1-转到-PCB画圆角矩形板框"]]],
    ["板框", "圆形、圆角矩形……板框决定板子切成什么形状。", "p", [["A-4", "a4.html"], ["B-3.1", "b3.html#B3.1-转到-PCB画圆角矩形板框"]]],
    ["布局", "接口在板边、相关元件就近、去耦电容贴着电源脚；模组天线伸出板边 + 禁止区域。", "p", [["A-5", "a5.html"], ["B-3.2", "b3.html#B3.2-布局与天线禁止区域"]]],
    ["布线", "手动 ⌥W、自动布线、差分对 ⌥D；自动布线不通的地方手动处理。", "p", [["A-6", "a6.html"], ["B-3.3", "b3.html#B3.3-USB-差分对"], ["B-3.4", "b3.html#B3.4-自动布线只布通-85.71为什么"]]],
    ["铺铜", "双面铺 GND，⇧B 重建铺铜。", "p", [["A-7", "a7.html"], ["B-3.5", "b3.html#B3.5-铺铜与-DRC-收尾"]]],
    ["丝印", "作品名、Logo、排针引脚名；底层丝印要镜像。", "p", [["A-8", "a8.html"], ["B-3.6", "b3.html#B3.6-丝印给排针写上引脚名"]]],
    ["DRC 与 3D", "PCB DRC 清零，3D / 2D 预览看一眼。", "p", [["A-9", "a9.html"], ["B-3.5", "b3.html#B3.5-铺铜与-DRC-收尾"]]],
    ["导出与下单", "Gerber / BOM / 坐标；PCB 下单页逐项看懂；SMT 另下单、核对贴片方向。", "m", [["A-10", "a10.html"], ["B-4", "b4.html"]]],
    ["拿到板子", "上电测试、排错、手工焊排针。", "m", [["A-11", "a11.html"], ["B-5.1", "b5.html"]]],
    ["写程序", "Arduino IDE 2 + esp32 支持包，彩虹灯、按键切换、Wi-Fi 网页调色。", "c", [["B-5", "b5.html"]]],
  ];
  const PH = { s: "原理图", p: "PCB", m: "生产", c: "编程" };
  $$(".qs-widget").forEach((w) => {
    w.innerHTML = `<div class="qs-flow"></div><div class="qs-detail"></div>`;
    const flow = $(".qs-flow", w), det = $(".qs-detail", w);
    STEPS.forEach(([t, d, ph], i) => {
      const s = document.createElement("div");
      s.className = "qs-step"; s.tabIndex = 0;
      s.innerHTML = `<span class="n">${i + 1}</span><b>${t}</b><span class="ph ${ph}">${PH[ph]}</span>`;
      s.addEventListener("click", () => show(i));
      s.addEventListener("keydown", (e) => { if (e.key === "Enter") show(i); });
      flow.appendChild(s);
    });
    function show(i) {
      $$(".qs-step", flow).forEach((x, j) => x.classList.toggle("on", i === j));
      const [t, d, , links] = STEPS[i];
      det.innerHTML = `<h4>${i + 1}. ${t}</h4><div>${d}</div><div class="go">${links.map(([n, h]) => `<a href="${h}">→ ${n}</a>`).join("")}</div>`;
    }
    show(0);
  });
})();
