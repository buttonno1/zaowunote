/* 模块 E：微带线阻抗估算 */
(function () {
  "use strict";
  const st = document.createElement("style");
  st.textContent = `
  .imp-widget{display:flex;gap:16px;flex-wrap:wrap}
  .imp-widget .iw-ctl{flex:1;min-width:260px}
  .imp-widget .iw-ctl label{display:block;margin:8px 0 2px;font-size:14px}
  .imp-widget .iw-ctl input[type=range]{width:100%}
  .imp-widget .iw-pre{display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap}
  .imp-widget .iw-pre button{border:1px solid #cfd6e0;background:#fff;border-radius:6px;padding:5px 10px;cursor:pointer;font:inherit}
  .imp-widget svg{width:100%;max-width:360px;height:auto;background:#fafafa;border:1px solid #e3e3e3;border-radius:8px}
  .imp-widget .iw-out{font-size:15px;line-height:1.8;margin-top:6px}
  .imp-widget .iw-out b{font-size:20px}
  .imp-widget .ok{color:#2e7d32}.imp-widget .warn{color:#c62828}`;
  document.head.appendChild(st);
  document.querySelectorAll(".imp-widget").forEach((w) => {
    w.innerHTML = `<div class="iw-ctl">
      <div class="iw-pre"><button data-p="2">2 层板（h=1.51 mm, εr=4.5）</button><button data-p="4">4 层板外层（h=0.2104 mm, εr=4.4）</button></div>
      <label>线宽 w：<span class="vw"></span> mm</label><input type="range" class="w" min="0.1" max="3.5" step="0.01" value="0.35">
      <label>到参考地平面的介质厚度 h：<span class="vh"></span> mm</label><input type="range" class="h" min="0.08" max="1.6" step="0.01" value="0.2104">
      <label>介电常数 εr：<span class="ve"></span></label><input type="range" class="e" min="3.5" max="4.8" step="0.01" value="4.4">
      <div class="iw-out"></div></div><svg viewBox="0 0 360 200"></svg>`;
    const $ = (s) => w.querySelector(s), t = 0.035;
    function calc() {
      const W = +$(".w").value, H = +$(".h").value, E = +$(".e").value;
      $(".vw").textContent = W.toFixed(2); $(".vh").textContent = H.toFixed(3); $(".ve").textContent = E.toFixed(2);
      const arg = 5.98 * H / (0.8 * W + t);
      const z = arg > 1 ? 87 / Math.sqrt(E + 1.41) * Math.log(arg) : 0;
      const ratio = W / H, valid = ratio >= 0.1 && ratio <= 2.0;
      const w50 = (5.98 * H / Math.exp(50 * Math.sqrt(E + 1.41) / 87) - t) / 0.8;
      $(".iw-out").innerHTML = `单端阻抗 Z₀ ≈ <b class="${Math.abs(z - 50) < 5 ? "ok" : ""}">${z.toFixed(1)} Ω</b><br>当前叠层下做 50 Ω 约需线宽 <b>${w50.toFixed(2)} mm</b>` +
        (valid ? "" : `<br><span class="warn">w/h = ${ratio.toFixed(2)} 超出公式适用范围（0.1～2），数值仅供参考</span>`);
      // 剖面图
      const sx = 300 / 3.6, sh = Math.min(120, H * 75 + 8);
      const yTop = 40, lw = Math.max(4, W * sx);
      $("svg").innerHTML = `<rect x="20" y="${yTop + 10}" width="320" height="${sh}" fill="#d8c79a"/>
        <rect x="20" y="${yTop + 10 + sh}" width="320" height="8" fill="#c87533"/>
        <rect x="${180 - lw / 2}" y="${yTop + 4}" width="${lw}" height="6" fill="#c87533"/>
        <text x="180" y="${yTop - 4}" font-size="12" text-anchor="middle" fill="#c87533">走线 w=${W.toFixed(2)}</text>
        <line x1="40" y1="${yTop + 10}" x2="40" y2="${yTop + 10 + sh}" stroke="#1e6fd9" stroke-width="2"/>
        <text x="46" y="${yTop + 14 + sh / 2}" font-size="12" fill="#1e6fd9">h=${H.toFixed(2)}</text>
        <text x="300" y="${yTop + 24 + sh}" font-size="12" text-anchor="end" fill="#c87533">参考地平面（GND）</text>
        <text x="300" y="${yTop + 6 + sh / 2 + 10}" font-size="12" text-anchor="end" fill="#6b5a2a">介质 εr=${(+$(".e").value).toFixed(1)}</text>`;
    }
    w.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    w.querySelectorAll(".iw-pre button").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.p === "2") { $(".h").value = 1.51; $(".e").value = 4.5; $(".w").value = 0.5; }
      else { $(".h").value = 0.2104; $(".e").value = 4.4; $(".w").value = 0.35; }
      calc();
    }));
    calc();
  });
})();
