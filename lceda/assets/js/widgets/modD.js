/* 模块 D：阻焊开窗层叠示意 */
(function () {
  "use strict";
  const st = document.createElement("style");
  st.textContent = `
  .maskopen-widget .mo-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .maskopen-widget .mo-bar button{border:1px solid #cfd6e0;background:#fff;border-radius:6px;padding:6px 12px;cursor:pointer;font:inherit}
  .maskopen-widget .mo-bar button.on{background:#1e6fd9;color:#fff;border-color:#1e6fd9}
  .maskopen-widget .mo-row{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
  .maskopen-widget svg{width:100%;max-width:520px;height:auto;border:1px solid #e3e3e3;border-radius:8px;background:#fafafa}
  .maskopen-widget .mo-info{flex:1;min-width:220px;background:#f6f8fb;border-radius:8px;padding:12px 14px;line-height:1.75}
  .maskopen-widget .mo-sel{margin-left:auto}`;
  document.head.appendChild(st);
  const MASK = { "蓝色": "#1f3f8f", "绿色": "#1f6b3a", "黑色": "#1a1a1a", "白色": "#eeeeee", "红色": "#a52020", "紫色": "#5b2a86" };
  const CASES = [
    { k: "normal", n: "铜 + 阻焊（普通走线）", d: "最普通的情况：铜（走线或铺铜）被阻焊油漆完整盖住。从上面看就是阻焊的颜色，有铜的地方因为“垫高”了一点，颜色会略深一些。", cu: true, mask: true, silk: false, top: (m) => m },
    { k: "open", n: "铜 + 阻焊开窗（金色）", d: "<b>铜层画图案 + 阻焊层同位置画同样的图案</b>：阻焊层上的图形表示“这里不刷油漆”，铜就露出来。露出来的铜要做表面处理：选<b>沉金</b>是金色，选喷锡是银色。焊盘就是这样露出来的，本例的金色月亮也是。", cu: true, mask: false, silk: false, top: () => "#c9a227" },
    { k: "bare", n: "只开窗、不放铜（露基材）", d: "阻焊层画了图案、铜层没有：露出来的是板材本身（FR4 是浅米黄色，半透明）。可以做出“透出浅色”的效果。", cu: false, mask: false, silk: false, top: () => "#d8c79a" },
    { k: "silk", n: "丝印（白色油墨）", d: "丝印是印在阻焊<b>上面</b>的一层油墨（一般白色）。文字、Logo、图片都是丝印。它不导电，也不能印在焊盘上。", cu: false, mask: true, silk: true, top: () => "#ffffff" },
  ];
  document.querySelectorAll(".maskopen-widget").forEach((w) => {
    w.innerHTML = `<div class="mo-bar"></div><div class="mo-row"><svg viewBox="0 0 520 230"></svg><div class="mo-info"></div></div>`;
    const bar = w.querySelector(".mo-bar"), svg = w.querySelector("svg"), info = w.querySelector(".mo-info");
    let cur = "open", mcol = "蓝色";
    const sel = document.createElement("select"); sel.className = "mo-sel";
    Object.keys(MASK).forEach((c) => { const o = document.createElement("option"); o.textContent = c; sel.appendChild(o); });
    sel.onchange = () => { mcol = sel.value; draw(); };
    CASES.forEach((c) => { const b = document.createElement("button"); b.textContent = c.n; b.dataset.k = c.k; b.onclick = () => { cur = c.k; draw(); }; bar.appendChild(b); });
    const lab = document.createElement("span"); lab.textContent = "阻焊颜色："; lab.style.marginLeft = "auto"; bar.appendChild(lab); bar.appendChild(sel); sel.style.marginLeft = "0";
    function draw() {
      const c = CASES.find((x) => x.k === cur), m = MASK[mcol];
      bar.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === cur));
      let s = `<text x="12" y="20" font-size="13" fill="#555">剖面（侧面切开看）</text>`;
      // 基材
      s += `<rect x="20" y="120" width="300" height="60" fill="#d8c79a"/><text x="170" y="155" font-size="12" text-anchor="middle" fill="#6b5a2a">基材 FR4</text>`;
      // 铜
      if (c.cu) s += `<rect x="120" y="108" width="100" height="12" fill="#c87533"/><text x="170" y="104" font-size="11" text-anchor="middle" fill="#c87533">铜</text>`;
      // 阻焊：两侧总有，中间看是否开窗
      s += `<rect x="20" y="98" width="100" height="22" fill="${m}" opacity=".92"/><rect x="220" y="98" width="100" height="22" fill="${m}" opacity=".92"/>`;
      if (c.mask) s += `<path d="M120 98 h100 v${c.cu ? 10 : 22} h-100 z" fill="${m}" opacity=".92"/>` + (c.cu ? `<rect x="120" y="92" width="100" height="16" fill="${m}" opacity=".92"/>` : "");
      if (!c.mask && c.cu) s += `<rect x="120" y="104" width="100" height="4" fill="#e3c04a"/><text x="170" y="86" font-size="11" text-anchor="middle" fill="#a8861a">沉金表面</text>`;
      if (c.silk) s += `<rect x="135" y="88" width="70" height="8" fill="#fff" stroke="#bbb"/><text x="170" y="80" font-size="11" text-anchor="middle" fill="#666">丝印</text>`;
      s += `<text x="20" y="200" font-size="11" fill="#888">阻焊（${mcol}）</text>`;
      // 俯视
      s += `<text x="350" y="20" font-size="13" fill="#555">从上面看</text><rect x="350" y="40" width="150" height="150" rx="10" fill="${m}"/>`;
      const tc = c.top(m);
      s += c.k === "normal" ? `<path d="M400 75 q25 -25 50 0 q-25 70 0 85 q-50 -10 -50 -85z" fill="${tc}" stroke="rgba(0,0,0,.35)" stroke-width="3"/>`
        : `<path d="M400 75 q25 -25 50 0 q-25 70 0 85 q-50 -10 -50 -85z" fill="${tc}"/>`;
      svg.innerHTML = s; info.innerHTML = c.d;
    }
    draw();
  });
})();
