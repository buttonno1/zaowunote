/* 模块 B：连接方式对比 */
(function () {
  "use strict";
  const css = `
  .conn-widget{display:flex;gap:14px;flex-wrap:wrap}
  .conn-widget .cw-list{display:flex;flex-direction:column;gap:6px;min-width:150px}
  .conn-widget .cw-list button{border:1px solid #cfd6e0;background:#fff;border-radius:6px;padding:6px 10px;text-align:left;cursor:pointer;font:inherit}
  .conn-widget .cw-list button.on{background:#1e6fd9;color:#fff;border-color:#1e6fd9}
  .conn-widget .cw-main{flex:1;min-width:300px}
  .conn-widget svg{width:100%;height:auto;background:#fffcf8;border:1px solid #e3e3e3;border-radius:6px}
  .conn-widget .cw-tags{margin:8px 0;display:flex;gap:8px;flex-wrap:wrap}
  .conn-widget .cw-tags span{background:#eef3fb;border-radius:12px;padding:2px 10px;font-size:13px}
  .conn-widget .cw-desc{line-height:1.7}
  .conn-widget text{font-family:inherit}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const R = (x, y, lab) => `<g><line x1="${x}" y1="${y}" x2="${x + 14}" y2="${y}" stroke="#a00" stroke-width="2"/><rect x="${x + 14}" y="${y - 7}" width="36" height="14" fill="none" stroke="#a00" stroke-width="2"/><line x1="${x + 50}" y1="${y}" x2="${x + 64}" y2="${y}" stroke="#a00" stroke-width="2"/><text x="${x + 32}" y="${y - 12}" font-size="12" fill="#00a" text-anchor="middle">${lab}</text></g>`;
  const W = (pts, c = "#080", w = 2, dash = "") => `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const T = (x, y, s, c = "#00a", sz = 12, a = "start") => `<text x="${x}" y="${y}" font-size="${sz}" fill="${c}" text-anchor="${a}">${s}</text>`;
  const page = (x, lab) => `<rect x="${x}" y="8" width="205" height="150" fill="none" stroke="#bbb" stroke-dasharray="5 4"/>${T(x + 6, 24, lab, "#777", 12)}`;
  const gnd = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 10}" stroke="#a00" stroke-width="2"/><line x1="${x - 10}" y1="${y + 10}" x2="${x + 10}" y2="${y + 10}" stroke="#a00" stroke-width="2"/><line x1="${x - 6}" y1="${y + 14}" x2="${x + 6}" y2="${y + 14}" stroke="#a00" stroke-width="2"/><line x1="${x - 2}" y1="${y + 18}" x2="${x + 2}" y2="${y + 18}" stroke="#a00" stroke-width="2"/>`;
  const vcc = (x, y, n = "VCC") => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 12}" stroke="#a00" stroke-width="2"/><line x1="${x - 10}" y1="${y - 12}" x2="${x + 10}" y2="${y - 12}" stroke="#a00" stroke-width="2"/>${T(x, y - 17, n, "#00a", 11, "middle")}`;
  const port = (x, y, n, dir) => dir === "out" ? `<polygon points="${x},${y - 7} ${x + 26},${y - 7} ${x + 34},${y} ${x + 26},${y + 7} ${x},${y + 7}" fill="none" stroke="#a00" stroke-width="2"/>${T(x + 40, y + 4, n)}`
    : `<polygon points="${x},${y} ${x + 8},${y - 7} ${x + 34},${y - 7} ${x + 34},${y + 7} ${x + 8},${y + 7}" fill="none" stroke="#a00" stroke-width="2"/>${T(x + 17, y - 12, n, "#00a", 12, "middle")}`;

  const D = {
    wire: { n: "导线", key: "⌥W", scope: ["本页", "画到哪连到哪"], svg: page(8, "P1") + R(30, 80, "R1") + W("94,80 150,80 150,120") + R(130, 120, "LED1").replace(/x1="130"/, 'x1="130"') + `<circle cx="150" cy="80" r="0"/>` + T(230, 60, "导线 = 真实的一根线", "#333", 13) + T(230, 82, "端点接在另一根线中间会出现", "#333", 12) + T(230, 100, "红色连接点 ● 表示相连", "#333", 12) + `<circle cx="300" cy="125" r="5" fill="#c00"/>` + W("260,125 340,125") + W("300,105 300,145"),
      d: "最直观的连接：画到哪连到哪。缺点是图大了线会很长很乱。<b>交叉的两根线不相连</b>，只有出现红色圆点（连接点）才相连。" },
    label: { n: "网络标签", key: "⌥N", scope: ["本页", "可跨页（看工程设置）"], svg: page(8, "P1") + R(30, 60, "R5") + W("94,60 130,60") + T(100, 54, "OUT") + R(30, 120, "R7") + W("94,120 130,120") + T(100, 114, "OUT") + T(230, 60, "两根导线都叫 OUT", "#333", 13) + T(230, 82, "→ 它们自动连在一起", "#333", 13) + T(230, 104, "（不需要画线把它们连起来）", "#777", 12),
      d: "给导线起名字，<b>同名就相连</b>。适合同一页里距离较远的两点，或者把原理图按模块分区后用名字连起来（案例 B 的做法）。是否跨页相连由「工程设置 → 网络标签跨页连接」决定。" },
    flag: { n: "网络标识（电源/地）", key: "工具栏 VCC / 地", scope: ["全局", "所有图页"], svg: page(8, "P1") + vcc(70, 60) + `<line x1="70" y1="60" x2="70" y2="66" stroke="#a00" stroke-width="2"/><rect x="63" y="66" width="14" height="34" fill="none" stroke="#a00" stroke-width="2"/><line x1="70" y1="100" x2="70" y2="112" stroke="#a00" stroke-width="2"/>` + T(84, 88, "R1") + gnd(70, 112) + page(225, "P2") + vcc(290, 60) + `<line x1="290" y1="60" x2="290" y2="66" stroke="#a00" stroke-width="2"/><rect x="283" y="66" width="14" height="34" fill="none" stroke="#a00" stroke-width="2"/><line x1="290" y1="100" x2="290" y2="112" stroke="#a00" stroke-width="2"/>` + T(304, 88, "R2") + gnd(290, 112) + T(330, 60, "← 和 P1 的 VCC", "#1e6fd9", 11) + T(330, 76, "　 是同一个网络", "#1e6fd9", 11) + T(330, 124, "← GND 也一样", "#1e6fd9", 11),
      d: "VCC、GND、+5V 这些符号。<b>整个工程里同名的全部相连</b>，不管在哪一页。名字不同（GND 和 AGND）就不相连，所以别混用。" },
    port: { n: "网络端口", key: "放置 → 网络端口", scope: ["跨页", "层次图引脚"], svg: page(8, "P1") + R(20, 80, "R1") + W("84,80 110,80") + port(110, 80, "SIG", "out") + page(225, "P2") + port(240, 80, "SIG", "in") + W("274,80 300,80") + R(300, 80, "LED1") + W("100,145 330,145", "#1e6fd9", 2, "6 4") + T(215, 140, "名字相同 → 跨页连通（实测网表 SIG=[R1.2, LED1.A]）", "#1e6fd9", 11, "middle"),
      d: "多页原理图的“出入口”。P1 上的输出端口 SIG 和 P2 上的输入端口 SIG 连在一起。在层次图里，子图的网络端口会变成模块符号的引脚。输入 / 输出 / 双向只影响箭头方向，方便阅读。" },
    offpage: { n: "跨页连接标识", key: "放置 → 跨页连接标识", scope: ["跨页"], svg: page(8, "P1") + R(20, 80, "U1") + W("84,80 110,80") + `<polygon points="110,73 130,73 140,80 130,87 110,87" fill="none" stroke="#a00" stroke-width="2"/><polygon points="122,73 142,73 152,80 142,87 122,87" fill="none" stroke="#a00" stroke-width="2"/>` + T(158, 84, "TX") + page(225, "P2") + `<polygon points="240,73 260,73 270,80 260,87 240,87" fill="none" stroke="#a00" stroke-width="2"/><polygon points="252,73 272,73 282,80 272,87 252,87" fill="none" stroke="#a00" stroke-width="2"/>` + T(288, 84, "TX") + W("315,80 340,80") + R(340, 80, "J1").slice(0),
      d: "形状提醒读图的人“这根线去别的页了”。同名的跨页连接标识相连。和网络端口很像，团队里统一用一种即可。" },
    bus: { n: "总线", key: "⌥B", scope: ["一组信号"], svg: page(8, "P1") + W("30,60 380,60", "#1e6fd9", 5) + T(200, 50, "D[0:3]", "#1e6fd9", 13, "middle") + [0, 1, 2, 3].map((i) => W(`${60 + i * 80},60 ${70 + i * 80},70 ${70 + i * 80},120`) + T(75 + i * 80, 100, "D" + i)).join(""),
      d: "把一组信号（D0～D3）画成一条粗线，名字写 D[0:3]。每根分支导线要起名 D0、D1…，名字对上才算连到对应成员。数据线多的设计用得上，小板子一般不用。" },
    short: { n: "短接标识", key: "放置 → 短接标识", scope: ["指定一点"], svg: page(8, "P1") + gnd(80, 100) + T(80, 140, "GND", "#00a", 12, "middle") + `<rect x="150" y="80" width="40" height="18" fill="none" stroke="#a00" stroke-width="2"/>` + T(170, 75, "短接", "#a00", 11, "middle") + W("80,100 80,89 150,89") + W("190,89 280,89 280,100") + gnd(280, 100) + T(280, 140, "AGND", "#00a", 12, "middle"),
      d: "让两个<b>不同名字</b>的网络在某一点连在一起，例如模拟地 AGND 和数字地 GND 单点相连。新手用不到。" },
    nc: { n: "非连接标识 ×", key: "放置 → 非连接标识", scope: ["单个引脚"], svg: page(8, "P1") + `<rect x="60" y="40" width="80" height="100" fill="none" stroke="#a00" stroke-width="2"/>` + T(100, 35, "U1", "#00a", 12, "middle") + [0, 1, 2].map((i) => `<line x1="140" y1="${65 + i * 30}" x2="170" y2="${65 + i * 30}" stroke="#a00" stroke-width="2"/>` + T(135, 69 + i * 30, ["IO1", "NC", "NC"][i], "#333", 11, "end")).join("") + W("170,65 230,65") + [1, 2].map((i) => `<path d="M165,${60 + i * 30} l10,10 m0,-10 l-10,10" stroke="#0a0" stroke-width="2"/>`).join("") + T(240, 100, "× = 故意不接", "#333", 13),
      d: "告诉软件这只脚是故意不接的，DRC 就不会报“引脚悬空”。模组、芯片上不用的脚都打一个。它<b>不会</b>把任何东西连起来。" },
  };
  document.querySelectorAll(".conn-widget").forEach((w) => {
    w.innerHTML = `<div class="cw-list"></div><div class="cw-main"><svg viewBox="0 0 440 165"></svg><div class="cw-tags"></div><div class="cw-desc"></div></div>`;
    const list = w.querySelector(".cw-list"), svg = w.querySelector("svg"), tags = w.querySelector(".cw-tags"), desc = w.querySelector(".cw-desc");
    const show = (k) => {
      list.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
      const v = D[k]; svg.innerHTML = v.svg;
      tags.innerHTML = `<span>放置：${v.key}</span>` + v.scope.map((s) => `<span>作用范围：${s}</span>`).join("");
      desc.innerHTML = v.d;
    };
    Object.entries(D).forEach(([k, v]) => { const b = document.createElement("button"); b.textContent = v.n; b.dataset.k = k; b.onclick = () => show(k); list.appendChild(b); });
    show("wire");
  });
})();
