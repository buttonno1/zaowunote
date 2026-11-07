/* 模块 A：版本树示意 */
(function () {
  "use strict";
  const css = `
  .vtree-widget svg{width:100%;max-width:640px;height:auto;display:block;margin:6px auto}
  .vtree-widget .nd{cursor:pointer}
  .vtree-widget .nd circle{stroke:#333;stroke-width:2;transition:all .15s}
  .vtree-widget .nd.on circle{stroke:#e53935;stroke-width:4}
  .vtree-widget .vt-info{background:#f6f8fb;border-radius:8px;padding:10px 14px;margin-top:6px;line-height:1.7;min-height:3.4em}
  .vtree-widget text{font-size:13px;font-family:inherit}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const N = [
    { id: "start", x: 60, y: 60, c: "#9e9e9e", t: "start", d: "<b>start 节点</b>：新建工程时自动生成的第一个节点，就是“空工程”的样子。" },
    { id: "v1", x: 200, y: 60, c: "#1e88e5", t: "原理图完成", d: "<b>节点</b>：你手动创建的存档点。画完原理图、DRC 通过后，「版本控制」→「创建节点」，起名“原理图完成”。" },
    { id: "v2", x: 340, y: 60, c: "#1e88e5", t: "PCB V1", d: "<b>节点</b>：布完线、准备下单前再存一个。以后想看“下单时到底是什么样”，打开这个节点就行。" },
    { id: "main", x: 500, y: 60, c: "#43a047", t: "main（当前）", d: "<b>main 分支的最新状态</b>：你平时编辑的就是它。工程树最上面的 <code>main</code> 小标签表示你在这条分支上。" },
    { id: "b1", x: 340, y: 160, c: "#fb8c00", t: "试 16P USB", d: "<b>分支</b>：从“原理图完成”节点分出来的一条平行路线。在这里随便改（比如把 6P Type-C 换成 16P），main 完全不受影响。" },
    { id: "b2", x: 500, y: 160, c: "#fb8c00", t: "分支最新", d: "<b>分支的最新状态</b>：试成功了，可以以后在 main 上照着改；试失败了，直接不管它（或删除）就好。" },
  ];
  const E = [["start", "v1"], ["v1", "v2"], ["v2", "main"], ["v1", "b1"], ["b1", "b2"]];
  document.querySelectorAll(".vtree-widget").forEach((w) => {
    const P = Object.fromEntries(N.map((n) => [n.id, n]));
    let s = `<svg viewBox="0 0 600 210">`;
    s += `<text x="10" y="25" fill="#43a047">main 分支 →</text><text x="10" y="200" fill="#fb8c00">新分支 →</text>`;
    E.forEach(([a, b]) => {
      const A = P[a], B = P[b];
      s += A.y === B.y ? `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#888" stroke-width="3"/>`
        : `<path d="M${A.x},${A.y} C${A.x},${B.y} ${A.x},${B.y} ${B.x},${B.y}" fill="none" stroke="#fb8c00" stroke-width="3" stroke-dasharray="6 4"/>`;
    });
    N.forEach((n) => { s += `<g class="nd" data-id="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="14" fill="${n.c}"/><text x="${n.x}" y="${n.y + 34}" text-anchor="middle">${n.t}</text></g>`; });
    s += `</svg><div class="vt-info"></div>`;
    w.innerHTML = s;
    const info = w.querySelector(".vt-info");
    const show = (id) => { w.querySelectorAll(".nd").forEach((g) => g.classList.toggle("on", g.dataset.id === id)); info.innerHTML = P[id].d; };
    w.querySelectorAll(".nd").forEach((g) => { g.addEventListener("click", () => show(g.dataset.id)); g.addEventListener("mouseenter", () => show(g.dataset.id)); });
    show("v1");
  });
})();
