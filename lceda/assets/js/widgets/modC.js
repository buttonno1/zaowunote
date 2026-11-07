/* 模块 C：器件组成图、尺寸图读图练习 */
(function () {
  "use strict";
  const st = document.createElement("style");
  st.textContent = `
  .devparts-widget,.dimread-widget{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}
  .devparts-widget svg,.dimread-widget svg{width:100%;max-width:440px;height:auto;background:#fffcf8;border:1px solid #e3e3e3;border-radius:8px}
  .devparts-widget .dp-info,.dimread-widget .dp-info{flex:1;min-width:240px;background:#f6f8fb;border-radius:8px;padding:12px 14px;line-height:1.75}
  .devparts-widget .pt,.dimread-widget .pt{cursor:pointer}
  .devparts-widget .pt rect{transition:all .15s}
  .devparts-widget .pt.on rect{stroke:#e53935;stroke-width:4}
  .dimread-widget .pt.on line,.dimread-widget .pt.on text{stroke:#e53935;fill:#e53935}
  .devparts-widget text,.dimread-widget text{font-family:inherit}`;
  document.head.appendChild(st);

  const PARTS = [
    { id: "dev", x: 150, y: 10, w: 140, h: 46, c: "#1e6fd9", t: "器件 Device", d: "<b>器件</b> = 一张“身份证”：把下面几样东西组合起来，再加上名称、位号前缀（U?）、制造商、供应商编号（C 编号）等属性。你在库里搜到、放到原理图上的就是器件。" },
    { id: "sym", x: 10, y: 110, w: 130, h: 46, c: "#a00000", t: "符号 Symbol", d: "<b>符号</b>：原理图里的“简笔画”。一个方框 + 几只引脚，每只引脚有<b>编号</b>（1、2、3…）和<b>名称</b>（VCC、GND…）。只表达“有几只脚、叫什么”，不管实际大小。" },
    { id: "fp", x: 155, y: 110, w: 130, h: 46, c: "#d4a000", t: "封装 Footprint", d: "<b>封装</b>：PCB 上的“脚印”。焊盘的形状、大小、位置，丝印外框，决定元件焊在板子上的哪里。尺寸必须和实物一模一样，差一点就焊不上。" },
    { id: "3d", x: 300, y: 110, w: 130, h: 46, c: "#2e7d32", t: "3D 模型", d: "<b>3D 模型</b>：元件的立体外形，只用于 3D 预览和导出给外壳设计，<b>不影响电路和生产</b>。没有也能下单。" },
    { id: "attr", x: 150, y: 200, w: 140, h: 46, c: "#6a1b9a", t: "属性", d: "<b>属性</b>：名称、位号、值、制造商、制造商编号、供应商编号（C 编号）、数据手册链接、加入 BOM、转到 PCB……BOM 表和 SMT 下单靠的就是这些信息。" },
  ];
  document.querySelectorAll(".devparts-widget").forEach((w) => {
    let s = `<svg viewBox="0 0 440 260">`;
    [["sym"], ["fp"], ["3d"], ["attr"]].forEach(([id]) => { const p = PARTS.find((x) => x.id === id), D = PARTS[0]; s += `<line x1="${D.x + D.w / 2}" y1="${D.y + D.h}" x2="${p.x + p.w / 2}" y2="${p.y}" stroke="#999" stroke-width="2" stroke-dasharray="${id === "attr" ? "0" : "5 4"}"/>`; });
    s += `<line x1="140" y1="133" x2="155" y2="133" stroke="#999" stroke-width="2"/><text x="147" y="174" font-size="11" text-anchor="middle" fill="#666">编号对应</text>`;
    PARTS.forEach((p) => { s += `<g class="pt" data-id="${p.id}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="#fff" stroke="${p.c}" stroke-width="2"/><text x="${p.x + p.w / 2}" y="${p.y + 28}" font-size="14" text-anchor="middle" fill="${p.c}">${p.t}</text></g>`; });
    s += `</svg><div class="dp-info"></div>`;
    w.innerHTML = s;
    const info = w.querySelector(".dp-info");
    const show = (id) => { w.querySelectorAll(".pt").forEach((g) => g.classList.toggle("on", g.dataset.id === id)); info.innerHTML = PARTS.find((p) => p.id === id).d; };
    w.querySelectorAll(".pt").forEach((g) => { g.addEventListener("click", () => show(g.dataset.id)); g.addEventListener("mouseenter", () => show(g.dataset.id)); });
    show("dev");
  });

  /* SOT-23-3 推荐焊盘（示例数值） */
  const K = 60, OX = 220, OY = 150; // 1mm = 60px
  const pad = (cx, cy, n) => `<rect x="${OX + (cx - 0.4) * K}" y="${OY + (cy - 0.5) * K}" width="${0.8 * K}" height="${1.0 * K}" fill="#d9a400" stroke="#8a6a00"/><text x="${OX + cx * K}" y="${OY + cy * K + 6}" font-size="16" text-anchor="middle" fill="#222">${n}</text>`;
  const dim = (id, x1, y1, x2, y2, lab, tx, ty) => `<g class="pt" data-id="${id}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1e6fd9" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="${tx}" y="${ty}" font-size="14" fill="#1e6fd9" text-anchor="middle">${lab}</text><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="18"/></g>`;
  const D = {
    pitch: "<b>0.95 mm = 引脚间距（pitch）</b>：相邻两只引脚中心之间的距离。1 脚和 2 脚之间就是 0.95 mm。规格书里常写成 <code>e = 0.95 BSC</code>。",
    span: "<b>1.90 mm</b>：1 脚和 2 脚中心的距离（= 2 × 0.95）。画的时候把 1 脚放在 X = −0.95，2 脚放在 X = +0.95，3 脚放在 X = 0，最方便。",
    row: "<b>2.30 mm = 行距</b>：上下两排焊盘<b>中心</b>之间的距离。所以 1、2 脚的中心 Y = +1.15，3 脚 Y = −1.15。",
    padw: "<b>0.80 mm = 焊盘宽</b>：在属性面板的「宽」里填。",
    padl: "<b>1.00 mm = 焊盘长</b>：在属性面板的「高」里填（焊盘竖着放）。",
  };
  document.querySelectorAll(".dimread-widget").forEach((w) => {
    let s = `<svg viewBox="0 0 440 300"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="#1e6fd9"/></marker></defs>`;
    s += pad(-0.95, 1.15, "1") + pad(0.95, 1.15, "2") + pad(0, -1.15, "3");
    s += `<line x1="${OX}" y1="20" x2="${OX}" y2="280" stroke="#ccc" stroke-dasharray="4 4"/><line x1="20" y1="${OY}" x2="420" y2="${OY}" stroke="#ccc" stroke-dasharray="4 4"/>`;
    s += dim("pitch", OX - 0.95 * K, OY + 2.0 * K, OX, OY + 2.0 * K, "0.95", OX - 0.47 * K, OY + 2.0 * K - 6);
    s += dim("span", OX - 0.95 * K, OY + 2.35 * K, OX + 0.95 * K, OY + 2.35 * K, "1.90", OX, OY + 2.35 * K - 6);
    s += dim("row", OX + 1.8 * K, OY - 1.15 * K, OX + 1.8 * K, OY + 1.15 * K, "2.30", OX + 1.8 * K + 26, OY + 5);
    s += dim("padw", OX - 1.35 * K, OY + 0.5 * K, OX - 0.55 * K, OY + 0.5 * K, "0.80", OX - 0.95 * K, OY + 0.5 * K - 6);
    s += dim("padl", OX - 1.65 * K, OY + 0.65 * K, OX - 1.65 * K, OY + 1.65 * K, "1.00", OX - 1.65 * K - 24, OY + 1.15 * K + 5);
    s += `<text x="20" y="22" font-size="12" fill="#888">单位 mm（示例数值，实际以你的规格书为准）</text></svg><div class="dp-info">点图上蓝色的尺寸，看它是什么意思、该填到哪里。</div>`;
    w.innerHTML = s;
    const info = w.querySelector(".dp-info");
    w.querySelectorAll(".pt").forEach((g) => { const f = () => { w.querySelectorAll(".pt").forEach((x) => x.classList.toggle("on", x === g)); info.innerHTML = D[g.dataset.id]; }; g.addEventListener("click", f); g.addEventListener("mouseenter", f); });
  });
})();
