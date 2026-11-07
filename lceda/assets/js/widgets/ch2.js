/* 第 2 章互动组件：
   水流类比+欧姆定律、分压器、色环/贴片电阻读数、LED 限流、真实比例尺寸对比、找连接练习、
   上拉电阻按键、线宽-电流计算、工艺流程动画、焊点对比、规格书标注、术语表、原理图符号
   （样式在本文件内注入，不改 style.css） */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ROOT = document.body.dataset.root || "";
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  let UID = 0;

  /* ---------------- 注入样式 ---------------- */
  const CSS = `
.w2-row{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;font-size:14.5px;margin:8px 0}
.w2-row label{display:inline-flex;align-items:center;gap:6px}
.w2-row input[type=number],.w2-row select,.w2-in{font:inherit;font-size:14px;font-family:var(--mono);padding:3px 6px;border:1px solid var(--c-border);border-radius:6px;width:92px;background:#fff}
.w2-row select{font-family:var(--font);width:auto}
.w2-row input[type=range]{width:180px}
.w2-out{background:var(--c-bg-2);border:1px solid var(--c-border);border-radius:10px;padding:10px 14px;font-size:14.5px;line-height:1.8;margin-top:10px}
.w2-out b{color:#d9480f;font-family:var(--mono)}
.w2-out .big{font-size:20px}
.w2-btns{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.w2-btns button{font:inherit;font-size:13px;padding:3px 12px;border-radius:16px;border:1px solid var(--c-border);background:#fff;cursor:pointer}
.w2-btns button:hover{border-color:var(--c-primary);color:var(--c-primary)}
.w2-btns button.on{background:var(--c-primary);color:#fff;border-color:var(--c-primary)}
.w2-svg{width:100%;display:block}
.w2-svg text{font-family:-apple-system,"PingFang SC",sans-serif}
.w2-warn{color:#c92a2a;font-weight:600}
.w2-ok{color:#2b8a3e;font-weight:600}
.w2-sub{font-weight:700;font-size:14.5px;margin:16px 0 4px}
/* 欧姆 */
.ohm-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:16px;align-items:center}
.ohm-ctrl label{display:block;font-size:14px;margin-bottom:10px}
.ohm-ctrl label b{float:right;color:var(--c-primary);font-family:var(--mono)}
.ohm-ctrl input[type=range]{display:block;width:100%;margin-top:4px}
.ohm-calc{margin-top:16px;border-top:1px dashed var(--c-border);padding-top:12px}
.ohm-calc input:disabled{background:#fff9db;color:#d9480f;font-weight:700}
/* 色环 */
.rc-band{display:flex;align-items:center;gap:8px;font-size:13.5px;margin:4px 0;flex-wrap:wrap}
.rc-band .nm{width:84px;color:var(--c-text-2)}
.rc-sw{width:24px;height:24px;border-radius:5px;border:1px solid #adb5bd;cursor:pointer;padding:0;position:relative}
.rc-sw.on{outline:3px solid var(--c-primary);outline-offset:1px}
.rc-sw:hover::after{content:attr(data-n);position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:11px;background:#212529;color:#fff;padding:0 4px;border-radius:3px;white-space:nowrap}
/* 尺寸对比 */
.sz-wrap{overflow-x:auto;border:1px solid var(--c-border);border-radius:10px;background:#fff repeating-linear-gradient(0deg,transparent 0 19px,#f3f5f7 19px 20px),#fff;}
.sz-wrap svg{display:block}
.sz-item{cursor:pointer}
.sz-item:hover .sz-hit,.sz-item.on .sz-hit{stroke:#f03e3e;stroke-width:2}
.sz-info{min-height:52px}
/* 找连接 */
.nf-svg .wire{stroke:#2f9e44;stroke-width:2;fill:none;stroke-linecap:round}
.nf-svg .wire.hl{stroke:#f03e3e;stroke-width:4}
.nf-svg .part{stroke:#1c3f94;stroke-width:2;fill:none}
.nf-svg .partf{fill:#fff;stroke:#1c3f94;stroke-width:2}
.nf-svg .pin{fill:#fff;stroke:#868e96;stroke-width:1.5;cursor:pointer}
.nf-svg .pin:hover{stroke:#1c7ed6;stroke-width:3}
.nf-svg .pin.a{fill:#ffd43b;stroke:#e67700;stroke-width:3}
.nf-svg .pin.hl{stroke:#f03e3e;stroke-width:2.5}
.nf-svg .jn{fill:#2f9e44}
.nf-svg .jn.hl{fill:#f03e3e}
.nf-svg .psym.hl{stroke:#f03e3e}
.nf-svg .lbl{font-size:12px;fill:#495057}
.nf-svg .pn{font-size:10px;fill:#868e96}
.nf-svg .net{font-size:12px;fill:#2f9e44;font-weight:700}
.nf-svg .net.hl{fill:#f03e3e}
.nf-q{border:1px solid var(--c-border);border-radius:10px;padding:8px 12px;margin:6px 0;font-size:14.5px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.nf-q .t{flex:1;min-width:260px}
.nf-q button{font:inherit;font-size:13px;padding:2px 14px;border-radius:14px;border:1px solid var(--c-border);background:#fff;cursor:pointer}
.nf-q .r{width:100%;font-size:13.5px;color:var(--c-text-2);display:none}
.nf-q.done .r{display:block}
.nf-q.ok{border-color:#8ce99a;background:#f4fdf5}
.nf-q.bad{border-color:#ffa8a8;background:#fff5f5}
/* 上拉 */
.pu-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;align-items:start}
.pu-btn{font:inherit;font-size:15px;padding:10px 18px;border-radius:12px;border:2px solid #495057;background:#f8f9fa;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none}
.pu-btn.down{background:#495057;color:#fff;transform:translateY(2px)}
.pu-flow{stroke-dasharray:6 8;animation:puflow .6s linear infinite}
@keyframes puflow{to{stroke-dashoffset:-14}}
.pu-short{animation:pushort .3s steps(2) infinite}
@keyframes pushort{50%{opacity:.2}}
/* 线宽 */
.tw-bar{height:auto;margin-top:10px}
/* 工艺 */
.fab-steps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.fab-steps button{font:inherit;font-size:13px;padding:3px 10px;border-radius:14px;border:1px solid var(--c-border);background:#fff;cursor:pointer}
.fab-steps button.on{background:var(--c-primary);color:#fff;border-color:var(--c-primary)}
.fab-steps button.past{background:var(--c-primary-weak);border-color:#a5d8ff}
.fab-svg{border:1px solid var(--c-border);border-radius:10px;background:#fcfcfd}
.fab-info{min-height:96px}
.fab-info h4{margin:0 0 4px;font-size:16px}
.fab-info p{margin:4px 0}
.fab-nav{display:flex;gap:8px;margin-top:10px}
.fab-nav button{font:inherit;font-size:14px;padding:5px 16px;border-radius:18px;border:1px solid var(--c-border);background:#fff;cursor:pointer}
.fab-nav button:hover{border-color:var(--c-primary);color:var(--c-primary)}
.fab-svg .fade{transition:opacity .4s}
/* 焊点 */
.sj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.sj-card{border:2px solid var(--c-border);border-radius:12px;padding:8px 10px;background:#fff;font-size:13.5px;line-height:1.6}
.sj-card.good{border-color:#8ce99a}
.sj-card.bad{border-color:#ffc9c9}
.sj-card h4{margin:2px 0 2px;font-size:15px}
.sj-card.good h4{color:#2b8a3e}.sj-card.bad h4{color:#c92a2a}
.sj-card svg{width:100%;display:block;background:#f8f9fa;border-radius:8px}
.sj-card p{margin:4px 0 0;color:var(--c-text-2)}
/* 规格书 */
.ds-grid{display:grid;grid-template-columns:360px 1fr;gap:16px;align-items:start}
.ds-page{border:1px solid #ced4da;border-radius:4px;box-shadow:0 4px 14px rgba(0,0,0,.08);background:#fff}
.ds-co{cursor:pointer}
.ds-co circle{fill:#f03e3e;stroke:#fff;stroke-width:2}
.ds-co text{fill:#fff;font-size:12px;font-weight:700}
.ds-co.on circle{fill:#1c7ed6}
.ds-blk{fill:none;stroke:transparent;stroke-width:2.5}
.ds-blk.on{stroke:#1c7ed6;fill:rgba(28,126,214,.06)}
.ds-info{background:var(--c-bg-2);border:1px solid var(--c-border);border-radius:12px;padding:12px 16px;font-size:14.5px;min-height:240px}
.ds-info h4{margin:0 0 6px;font-size:16px}
.ds-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
/* 术语表 */
.gl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
.gl-bar input{font:inherit;font-size:15px;padding:7px 12px;border:1px solid var(--c-border);border-radius:20px;width:300px;max-width:100%}
.gl-cnt{font-size:13px;color:var(--c-text-3)}
.gl-table td:first-child{white-space:nowrap;font-weight:600}
.gl-table td:nth-child(2){font-family:var(--mono);font-size:13px;color:var(--c-text-2)}
.gl-table td:nth-child(3){white-space:nowrap;font-size:12.5px;color:var(--c-text-3)}
.gl-table mark{background:#fff3bf;padding:0}
/* 符号 */
.sym{display:inline-block;vertical-align:middle;color:#1c3f94}
.sym svg{width:80px;height:44px;display:block}
.sym-tbl td:first-child{width:96px;text-align:center}
@media (max-width:900px){.ohm-grid,.pu-grid,.ds-grid{grid-template-columns:1fr}}
`;
  const stEl = document.createElement("style");
  stEl.textContent = CSS;
  document.head.appendChild(stEl);

  /* ---------------- 通用工具 ---------------- */
  const p3 = (v) => +(+v).toPrecision(3);
  const fmtOhm = (r) => r >= 1e6 ? p3(r / 1e6) + " MΩ" : r >= 1e3 ? p3(r / 1e3) + " kΩ" : p3(r) + " Ω";
  const fmtA = (i) => i >= 1 ? p3(i) + " A" : i >= 1e-3 ? p3(i * 1e3) + " mA" : p3(i * 1e6) + " µA";
  const fmtW = (p) => p >= 1 ? p3(p) + " W" : p >= 1e-3 ? p3(p * 1e3) + " mW" : p3(p * 1e6) + " µW";
  const fmtV = (v) => p3(v) + " V";
  const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  const E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
  const series = (E, d0, d1) => { const o = []; for (let d = d0; d <= d1; d++) E.forEach((m) => o.push(+(m * Math.pow(10, d)).toPrecision(3))); return o; };
  const nextE24 = (r) => { for (let d = -1; d < 8; d++) for (const m of E24) { const v = +(m * Math.pow(10, d)).toPrecision(3); if (v >= r * 0.999) return v; } return r; };

  /* ---------------- 原理图符号（2.4 / 2.6 用） ---------------- */
  const SYM = {
    res: '<line x1="2" y1="22" x2="20" y2="22"/><rect x="20" y="14" width="40" height="16" fill="none"/><line x1="60" y1="22" x2="78" y2="22"/>',
    resus: '<polyline points="2,22 18,22 22,14 28,30 34,14 40,30 46,14 52,30 58,14 62,22 78,22" fill="none"/>',
    cap: '<line x1="2" y1="22" x2="36" y2="22"/><line x1="36" y1="8" x2="36" y2="36" stroke-width="3"/><line x1="44" y1="8" x2="44" y2="36" stroke-width="3"/><line x1="44" y1="22" x2="78" y2="22"/>',
    ecap: '<line x1="2" y1="22" x2="36" y2="22"/><line x1="36" y1="8" x2="36" y2="36" stroke-width="3"/><path d="M48,8 Q42,22 48,36" fill="none" stroke-width="3"/><line x1="45" y1="22" x2="78" y2="22"/><text x="24" y="12" font-size="12" stroke="none" fill="currentColor">+</text>',
    ind: '<line x1="2" y1="24" x2="16" y2="24"/><path d="M16,24 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0" fill="none"/><line x1="64" y1="24" x2="78" y2="24"/>',
    diode: '<line x1="2" y1="22" x2="30" y2="22"/><polygon points="30,10 30,34 50,22" fill="currentColor"/><line x1="50" y1="10" x2="50" y2="34" stroke-width="3"/><line x1="50" y1="22" x2="78" y2="22"/>',
    led: '<line x1="2" y1="24" x2="30" y2="24"/><polygon points="30,12 30,36 50,24" fill="currentColor"/><line x1="50" y1="12" x2="50" y2="36" stroke-width="3"/><line x1="50" y1="24" x2="78" y2="24"/><path d="M40,10 l8,-8 M44,2 h4 v4 M48,12 l8,-8 M52,4 h4 v4" fill="none" stroke-width="1.5"/>',
    npn: '<circle cx="44" cy="22" r="18" fill="none"/><line x1="2" y1="22" x2="36" y2="22"/><line x1="36" y1="10" x2="36" y2="34" stroke-width="3"/><line x1="36" y1="16" x2="54" y2="4"/><line x1="36" y1="28" x2="54" y2="40"/><polygon points="54,40 44,38 50,31" fill="currentColor"/>',
    nmos: '<line x1="2" y1="30" x2="28" y2="30"/><line x1="28" y1="12" x2="28" y2="34" stroke-width="2.5"/><line x1="34" y1="10" x2="34" y2="18" stroke-width="3"/><line x1="34" y1="20" x2="34" y2="26" stroke-width="3"/><line x1="34" y1="28" x2="34" y2="36" stroke-width="3"/><line x1="34" y1="14" x2="56" y2="14"/><line x1="56" y1="14" x2="56" y2="2"/><line x1="34" y1="32" x2="56" y2="32"/><line x1="56" y1="32" x2="56" y2="42"/><line x1="34" y1="23" x2="56" y2="23"/><line x1="56" y1="23" x2="56" y2="32"/><polygon points="36,23 44,19 44,27" fill="currentColor"/>',
    xtal: '<line x1="2" y1="22" x2="26" y2="22"/><line x1="26" y1="10" x2="26" y2="34" stroke-width="2.5"/><rect x="32" y="12" width="16" height="20" fill="none"/><line x1="54" y1="10" x2="54" y2="34" stroke-width="2.5"/><line x1="54" y1="22" x2="78" y2="22"/>',
    sw: '<line x1="2" y1="32" x2="22" y2="32"/><circle cx="24" cy="32" r="2.5" fill="currentColor"/><circle cx="56" cy="32" r="2.5" fill="currentColor"/><line x1="58" y1="32" x2="78" y2="32"/><line x1="20" y1="22" x2="60" y2="22" stroke-width="2.5"/><line x1="40" y1="22" x2="40" y2="8"/><line x1="32" y1="8" x2="48" y2="8"/>',
    gnd: '<line x1="40" y1="2" x2="40" y2="20"/><line x1="24" y1="20" x2="56" y2="20" stroke-width="2.5"/><line x1="30" y1="27" x2="50" y2="27" stroke-width="2.5"/><line x1="36" y1="34" x2="44" y2="34" stroke-width="2.5"/>',
    vcc: '<line x1="40" y1="42" x2="40" y2="18"/><line x1="26" y1="18" x2="54" y2="18" stroke-width="2.5"/><text x="40" y="12" font-size="11" text-anchor="middle" stroke="none" fill="currentColor">VCC</text>',
    net: '<line x1="2" y1="30" x2="78" y2="30"/><text x="20" y="24" font-size="13" stroke="none" fill="#2f9e44" font-weight="700">OUT</text>',
    nc: '<line x1="2" y1="22" x2="40" y2="22"/><path d="M33,15 l14,14 M47,15 l-14,14" stroke="#e03131" stroke-width="2.5"/>',
    junc: '<line x1="2" y1="22" x2="78" y2="22"/><line x1="40" y1="22" x2="40" y2="42"/><circle cx="40" cy="22" r="4" fill="#e03131" stroke="none"/>',
    cross: '<line x1="2" y1="22" x2="78" y2="22"/><line x1="40" y1="2" x2="40" y2="42"/>',
    ic: '<rect x="22" y="4" width="36" height="36" fill="none"/><line x1="4" y1="12" x2="22" y2="12"/><line x1="4" y1="22" x2="22" y2="22"/><line x1="4" y1="32" x2="22" y2="32"/><line x1="58" y1="12" x2="76" y2="12"/><line x1="58" y1="22" x2="76" y2="22"/><line x1="58" y1="32" x2="76" y2="32"/><text x="40" y="26" font-size="10" text-anchor="middle" stroke="none" fill="currentColor">U1</text>',
    conn: '<rect x="30" y="2" width="20" height="40" fill="none"/><circle cx="40" cy="10" r="3"/><circle cx="40" cy="22" r="3"/><circle cx="40" cy="34" r="3"/><line x1="4" y1="10" x2="30" y2="10"/><line x1="4" y1="22" x2="30" y2="22"/><line x1="4" y1="34" x2="30" y2="34"/>',
  };
  $$(".sym[data-s]").forEach((s) => {
    const k = s.dataset.s;
    if (!SYM[k]) return;
    s.innerHTML = `<svg viewBox="0 0 80 44" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">${SYM[k]}</svg>`;
  });

  /* ============ 2.1 水流类比 + 欧姆定律 ============ */
  const OHM_R = series(E12, 1, 4).concat([100000]);
  $$(".ohm-widget").forEach((w) => {
    const id = ++UID;
    w.innerHTML = `
    <div class="ohm-grid">
      <svg class="w2-svg ohm-svg" viewBox="0 0 560 240" aria-label="水流类比">
        <path class="ohm-loop" d="M110,190 L110,40 L450,40 L450,190 Z" fill="none" stroke="#495057" stroke-width="26" stroke-linejoin="round"/>
        <path d="M110,190 L110,40 L450,40 L450,190 Z" fill="none" stroke="#d0ebff" stroke-width="22" stroke-linejoin="round"/>
        <rect x="228" y="24" width="104" height="32" fill="#fff"/>
        <line class="ohm-nw" x1="226" y1="40" x2="334" y2="40" stroke="#495057"/>
        <line class="ohm-ni" x1="226" y1="40" x2="334" y2="40" stroke="#d0ebff"/>
        <g class="ohm-dots"></g>
        <circle cx="110" cy="115" r="30" fill="#fff3bf" stroke="#e67700" stroke-width="3"/>
        <text x="110" y="111" text-anchor="middle" font-size="13" fill="#e67700">水泵</text>
        <text class="ohm-vt" x="110" y="128" text-anchor="middle" font-size="12" fill="#495057"></text>
        <rect x="40" y="65" width="16" height="100" rx="3" fill="#f1f3f5" stroke="#ced4da"/>
        <rect class="ohm-pbar" x="40" y="165" width="16" height="0" rx="3" fill="#fd7e14"/>
        <text x="48" y="182" text-anchor="middle" font-size="11" fill="#868e96">水压</text>
        <text x="280" y="16" text-anchor="middle" font-size="13" fill="#495057">细水管 = 电阻 R（越细阻碍越大）</text>
        <text x="340" y="222" text-anchor="middle" font-size="13" fill="#495057">回水管 = 导线（几乎没有阻碍）</text>
        <text x="472" y="110" font-size="13" fill="#1971c2">水流</text>
        <text x="472" y="128" font-size="13" fill="#1971c2">= 电流 I</text>
        <text x="110" y="232" text-anchor="middle" font-size="12" fill="#868e96">水泵 = 电池（提供水压 = 电压）</text>
      </svg>
      <div class="ohm-ctrl">
        <label>电压 V（水泵的压力）<b class="o-v"></b><input type="range" class="s-v" min="0" max="12" step="0.1" value="5"></label>
        <label>电阻 R（水管有多细）<b class="o-r"></b><input type="range" class="s-r" min="0" max="${OHM_R.length - 1}" step="1"></label>
        <div class="w2-out">电流 I = V / R = <b class="big o-i"></b><br>功率 P = V × I = <b class="o-p"></b></div>
        <div class="widget-hint o-note"></div>
      </div>
    </div>
    <div class="ohm-calc">
      <div class="w2-sub">欧姆定律计算器：知道两个，求第三个</div>
      <div class="w2-row">
        <label><input type="radio" name="ocm${id}" value="i" checked> 求电流 I</label>
        <label><input type="radio" name="ocm${id}" value="v"> 求电压 V</label>
        <label><input type="radio" name="ocm${id}" value="r"> 求电阻 R</label>
      </div>
      <div class="w2-row">
        <label>电压 <input type="number" class="c-v" value="5" step="0.1"> V</label>
        <label>电流 <input type="number" class="c-i" value="" step="0.1"> mA</label>
        <label>电阻 <input type="number" class="c-r" value="330" step="1"> Ω</label>
      </div>
      <div class="w2-out c-out"></div>
    </div>`;
    const sV = $(".s-v", w), sR = $(".s-r", w);
    sR.value = OHM_R.indexOf(330);
    const loop = $(".ohm-loop", w), L = loop.getTotalLength();
    const dotsG = $(".ohm-dots", w), N = 30, dots = [];
    for (let i = 0; i < N; i++) { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("fill", "#1c7ed6"); dotsG.appendChild(c); dots.push(c); }
    let I = 0, nw = 10, phase = 0, last = performance.now();
    function upd() {
      const V = +sV.value, R = OHM_R[sR.value];
      I = V / R;
      $(".o-v", w).textContent = V.toFixed(1) + " V";
      $(".o-r", w).textContent = fmtOhm(R);
      $(".o-i", w).textContent = fmtA(I);
      $(".o-p", w).textContent = fmtW(V * I);
      $(".ohm-vt", w).textContent = V.toFixed(1) + " V";
      const ph = (V / 12) * 100;
      const pb = $(".ohm-pbar", w); pb.setAttribute("y", 165 - ph); pb.setAttribute("height", ph);
      nw = Math.max(3, 20 - 4.2 * Math.log10(R / 10));
      $(".ohm-nw", w).setAttribute("stroke-width", nw + 4);
      $(".ohm-ni", w).setAttribute("stroke-width", nw);
      const note = $(".o-note", w);
      note.innerHTML = V === 0 ? "没有压力（电压为 0），水就不流，电流为 0。"
        : V * I > 0.1 ? `⚠️ 功率 ${fmtW(V * I)}，超过了一颗 0603 小电阻常见的额定功率（约 0.1 W），真做的话它会发烫甚至烧坏——要换大功率电阻或者增大阻值。`
        : R === 330 && Math.abs(V - 5) < 0.05 ? "这就是案例 A 里 LED 限流电阻的阻值（不算 LED 本身的压降）。真实电路里 LED 还会“吃掉”约 2 V，电流会更小，见 2.4 节。"
        : "试试：电压不变把电阻调大 10 倍，电流就变成 1/10。";
    }
    function anim(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      const speed = 380 * (1 - Math.exp(-(I * 1000) / 40));
      phase = (phase + speed * dt) % L;
      for (let i = 0; i < N; i++) {
        const s = (phase + (i * L) / N) % L;
        const p = loop.getPointAtLength(s);
        const inNarrow = p.y < 45 && p.x > 226 && p.x < 334;
        dots[i].setAttribute("cx", p.x); dots[i].setAttribute("cy", p.y);
        dots[i].setAttribute("r", inNarrow ? Math.min(4, nw / 2 - 0.5) : 4);
      }
      requestAnimationFrame(anim);
    }
    [sV, sR].forEach((s) => s.addEventListener("input", upd));
    upd(); requestAnimationFrame(anim);
    // 计算器
    const cv = $(".c-v", w), ci = $(".c-i", w), cr = $(".c-r", w), co = $(".c-out", w);
    const mode = () => $(`input[name=ocm${id}]:checked`, w).value;
    function calc() {
      const m = mode();
      [cv, ci, cr].forEach((x) => (x.disabled = false));
      ({ v: cv, i: ci, r: cr })[m].disabled = true;
      const V = +cv.value, Ia = +ci.value / 1000, R = +cr.value;
      let txt = "";
      if (m === "i") { if (R > 0) { const i = V / R; ci.value = p3(i * 1000); txt = `I = V / R = ${V} / ${R} = <b>${fmtA(i)}</b>，功率 P = V × I = <b>${fmtW(V * i)}</b>`; } else txt = "电阻要大于 0（电阻为 0 就是“短路”，电流会大到烧东西）"; }
      if (m === "v") { const v = Ia * R; cv.value = p3(v); txt = `V = I × R = ${p3(Ia)} A × ${R} Ω = <b>${fmtV(v)}</b>，功率 P = <b>${fmtW(v * Ia)}</b>`; }
      if (m === "r") { if (Ia > 0) { const r = V / Ia; cr.value = p3(r); txt = `R = V / I = ${V} / ${p3(Ia)} A = <b>${fmtOhm(r)}</b>，功率 P = <b>${fmtW(V * Ia)}</b>`; } else txt = "电流要大于 0"; }
      co.innerHTML = txt + '<br><span class="muted small">提示：1 mA = 0.001 A；1 kΩ = 1000 Ω。</span>';
    }
    $$("input", $(".ohm-calc", w)).forEach((x) => { x.addEventListener("input", calc); x.addEventListener("change", calc); });
    calc();
  });

  /* ============ 2.3 分压器 ============ */
  $$(".divider-widget").forEach((w) => {
    w.innerHTML = `
    <div class="ohm-grid">
      <svg class="w2-svg dv-svg" viewBox="0 0 520 300"></svg>
      <div>
        <div class="w2-row"><label>输入电压 Vin <input type="number" class="d-vin" value="5" step="0.1" min="0"> V</label></div>
        <div class="w2-row"><label>上电阻 R1 <input type="number" class="d-r1" value="10" step="0.1" min="0.001"> kΩ</label></div>
        <div class="w2-row"><label>下电阻 R2 <input type="number" class="d-r2" value="10" step="0.1" min="0.001"> kΩ</label></div>
        <div class="w2-row"><label>Vout 上接一个负载
          <select class="d-rl"><option value="0">不接</option><option value="1000">接 100 kΩ</option><option value="10">接 10 kΩ</option><option value="1">接 1 kΩ</option></select></label></div>
        <div class="w2-out d-out"></div>
      </div>
    </div>
    <div class="w2-btns"><span class="small muted">试试这些：</span>
      <button type="button" data-p="5,10,10,0">R1 = R2：正好一半</button>
      <button type="button" data-p="5,10,20,0">10k + 20k：5 V 信号降到约 3.3 V</button>
      <button type="button" data-p="5,5,10,0">555 芯片内部：5k + 5k + 5k 得到 2/3 VCC</button>
      <button type="button" data-p="5,10,10,1">接上 1 kΩ 负载会怎样？</button>
    </div>`;
    const svg = $(".dv-svg", w);
    const vin = $(".d-vin", w), r1 = $(".d-r1", w), r2 = $(".d-r2", w), rl = $(".d-rl", w);
    const resV = (x, y1, y2, lab) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y1 + 14}" class="wr"/><rect x="${x - 11}" y="${y1 + 14}" width="22" height="${y2 - y1 - 28}" fill="#fff" stroke="#1c3f94" stroke-width="2"/><line x1="${x}" y1="${y2 - 14}" x2="${x}" y2="${y2}" class="wr"/><text x="${x + 18}" y="${(y1 + y2) / 2 + 4}" font-size="13" fill="#1c3f94">${lab}</text>`;
    const gnd = (x, y) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 8}" stroke="#2f9e44" stroke-width="2"/><line x1="${x - 12}" y1="${y + 8}" x2="${x + 12}" y2="${y + 8}" stroke="#1c3f94" stroke-width="2.5"/><line x1="${x - 7}" y1="${y + 13}" x2="${x + 7}" y2="${y + 13}" stroke="#1c3f94" stroke-width="2.5"/><line x1="${x - 3}" y1="${y + 18}" x2="${x + 3}" y2="${y + 18}" stroke="#1c3f94" stroke-width="2.5"/>`;
    function upd() {
      const Vin = Math.max(0, +vin.value), R1 = Math.max(1e-3, +r1.value) * 1e3, R2 = Math.max(1e-3, +r2.value) * 1e3, RL = +rl.value * 1e3;
      const R2e = RL ? (R2 * RL) / (R2 + RL) : R2;
      const Vout = (Vin * R2e) / (R1 + R2e), I = Vin / (R1 + R2e);
      const Vnl = (Vin * R2) / (R1 + R2);
      const frac = Vin > 0 ? Vout / Vin : 0;
      const yTop = 40, yBot = 260, yN = 150;
      const barY = yBot - frac * (yBot - yTop);
      svg.innerHTML = `<style>.dv-svg .wr{stroke:#2f9e44;stroke-width:2}</style>
        <text x="160" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#e67700">Vin = ${fmtV(Vin)}</text>
        <line x1="140" y1="30" x2="180" y2="30" stroke="#1c3f94" stroke-width="2.5"/><line x1="160" y1="30" x2="160" y2="40" class="wr"/>
        ${resV(160, 40, 140, "R1 " + fmtOhm(R1))}
        <line x1="160" y1="140" x2="160" y2="160" class="wr"/><circle cx="160" cy="150" r="4.5" fill="#f03e3e"/>
        <line x1="160" y1="150" x2="300" y2="150" class="wr"/>
        <text x="300" y="140" text-anchor="end" font-size="14" font-weight="700" fill="#d9480f">Vout = ${fmtV(Vout)}</text>
        ${resV(160, 160, 260, "R2 " + fmtOhm(R2))}
        ${gnd(160, 260)}
        ${RL ? `${resV(300, 150, 260, "负载 " + fmtOhm(RL))}${gnd(300, 260)}` : `<circle cx="300" cy="150" r="4" fill="#fff" stroke="#2f9e44" stroke-width="2"/>`}
        <rect x="420" y="${yTop}" width="26" height="${yBot - yTop}" rx="4" fill="#f1f3f5" stroke="#ced4da"/>
        <rect x="420" y="${barY}" width="26" height="${yBot - barY}" rx="4" fill="#ffa94d"/>
        <text x="454" y="${yTop + 4}" font-size="12" fill="#868e96">Vin</text>
        <text x="454" y="${yBot + 4}" font-size="12" fill="#868e96">0 V</text>
        <line x1="412" y1="${barY}" x2="452" y2="${barY}" stroke="#d9480f" stroke-width="2"/>
        <text x="408" y="${barY + 4}" text-anchor="end" font-size="12" fill="#d9480f">${Math.round(frac * 100)}%</text>
        <text x="433" y="292" text-anchor="middle" font-size="12" fill="#868e96">“电压高度”</text>`;
      let txt = `Vout = Vin × R2 / (R1 + R2) = <b class="big">${fmtV(Vout)}</b><br>流过 R1 的电流 = <b>${fmtA(I)}</b>`;
      if (RL) txt += `<br><span class="w2-warn">接上负载后 Vout 从 ${fmtV(Vnl)} 掉到了 ${fmtV(Vout)}</span>——负载和 R2 “并联”分走了电流。所以分压电路只适合给芯片的<b>输入引脚</b>提供参考电压，不能拿来给东西供电。`;
      $(".d-out", w).innerHTML = txt;
    }
    [vin, r1, r2, rl].forEach((x) => x.addEventListener("input", upd));
    $$(".w2-btns button", w).forEach((b) => b.addEventListener("click", () => {
      const [a, b1, c, d] = b.dataset.p.split(",");
      vin.value = a; r1.value = b1; r2.value = c; rl.value = d === "1" ? "1" : "0"; upd();
    }));
    upd();
  });

  /* ============ 2.4 色环电阻读数器 + 贴片编码 ============ */
  const RC = [
    { n: "黑", c: "#1a1a1a", d: 0, m: 0 }, { n: "棕", c: "#7b3f00", d: 1, m: 1, t: 1 }, { n: "红", c: "#e03131", d: 2, m: 2, t: 2 },
    { n: "橙", c: "#f76707", d: 3, m: 3 }, { n: "黄", c: "#fcc419", d: 4, m: 4 }, { n: "绿", c: "#2f9e44", d: 5, m: 5, t: 0.5 },
    { n: "蓝", c: "#1c7ed6", d: 6, m: 6, t: 0.25 }, { n: "紫", c: "#7048e8", d: 7, m: 7, t: 0.1 }, { n: "灰", c: "#868e96", d: 8, m: 8, t: 0.05 },
    { n: "白", c: "#ffffff", d: 9, m: 9 }, { n: "金", c: "#c9a227", m: -1, t: 5 }, { n: "银", c: "#c0c4c8", m: -2, t: 10 },
  ];
  function smdParse(s) {
    s = s.trim().toUpperCase().replace(/Ω/g, "");
    if (!s) return null;
    if (/^0+$/.test(s)) return { v: 0, how: "全是 0：这是 <b>0 Ω 电阻</b>，相当于一根导线（常用来“跳线”或预留位置）。" };
    let m;
    if ((m = s.match(/^(\d*)([RKM])(\d*)$/)) && (m[1] || m[3])) {
      const mul = { R: 1, K: 1e3, M: 1e6 }[m[2]];
      const v = parseFloat((m[1] || "0") + "." + (m[3] || "0")) * mul;
      return { v, how: `字母 <b>${m[2]}</b> 当作小数点${m[2] === "R" ? "" : "，同时表示单位 " + (m[2] === "K" ? "kΩ" : "MΩ")}：${s} = ${fmtOhm(v)}` };
    }
    if ((m = s.match(/^(\d)(\d)(\d)$/))) {
      const v = (+m[1] * 10 + +m[2]) * Math.pow(10, +m[3]);
      return { v, how: `3 位数字：前两位 <b>${m[1]}${m[2]}</b> 是有效数字，第 3 位 <b>${m[3]}</b> 表示后面加 ${m[3]} 个 0 → ${m[1]}${m[2]}${"0".repeat(+m[3])} Ω（通常是 ±5% 的电阻）` };
    }
    if ((m = s.match(/^(\d)(\d)(\d)(\d)$/))) {
      const v = (+m[1] * 100 + +m[2] * 10 + +m[3]) * Math.pow(10, +m[4]);
      return { v, how: `4 位数字：前三位 <b>${m[1]}${m[2]}${m[3]}</b> 是有效数字，第 4 位 <b>${m[4]}</b> 表示加 ${m[4]} 个 0（通常是 ±1% 的精密电阻）` };
    }
    if (/^\d\d[A-Z]$/.test(s)) return { v: null, how: "两位数字 + 一个字母：这是 <b>EIA-96</b> 编码（1% 电阻常用），数字是查表用的序号、字母是倍率，需要对照 EIA-96 代码表查，这里不做换算。" };
    return { v: null, how: "没认出来。常见写法：3 位数字（如 103）、4 位数字（如 1002）、带 R/K 的（如 4R7、4K7）。" };
  }
  $$(".rcode-widget").forEach((w) => {
    let n = 4;
    const st = { 4: [4, 7, 3, 10], 5: [3, 3, 0, 0, 1] };
    w.innerHTML = `<div class="w2-btns rc-mode"><button type="button" class="on" data-n="4">4 色环（常见 ±5%）</button><button type="button" data-n="5">5 色环（精密 ±1%）</button></div>
      <svg class="w2-svg rc-svg" viewBox="0 0 440 100" style="max-width:520px"></svg>
      <div class="rc-rows"></div>
      <div class="w2-out rc-out"></div>
      <div class="w2-sub" style="margin-top:18px">贴片电阻上的数字编码</div>
      <div class="w2-row">输入电阻表面印的字：<input class="w2-in smd-in" value="473" style="width:110px"></div>
      <div class="w2-btns smd-q"></div>
      <div class="w2-out smd-out"></div>`;
    ["102", "331", "473", "512", "1002", "4R7", "R10", "4K7", "000"].forEach((c) => {
      const b = el("button", "", c); b.type = "button";
      b.addEventListener("click", () => { $(".smd-in", w).value = c; smd(); });
      $(".smd-q", w).appendChild(b);
    });
    const names4 = ["第 1 环：数字", "第 2 环：数字", "第 3 环：倍率", "第 4 环：误差"];
    const names5 = ["第 1 环：数字", "第 2 环：数字", "第 3 环：数字", "第 4 环：倍率", "第 5 环：误差"];
    function allowed(i) {
      const k = n === 4 ? ["d", "d", "m", "t"][i] : ["d", "d", "d", "m", "t"][i];
      return RC.map((c, j) => [c, j]).filter(([c]) => (k === "d" ? c.d != null : k === "m" ? c.m != null : c.t != null));
    }
    function draw() {
      const s = st[n];
      const xs = n === 4 ? [120, 160, 200, 310] : [110, 145, 180, 215, 310];
      let bands = s.map((ci, i) => `<rect x="${xs[i]}" y="${i === s.length - 1 ? 22 : 22}" width="16" height="56" fill="${RC[ci].c}" stroke="rgba(0,0,0,.25)"/>`).join("");
      $(".rc-svg", w).innerHTML = `<line x1="0" y1="50" x2="440" y2="50" stroke="#adb5bd" stroke-width="5"/>
        <path d="M70,24 Q70,14 92,14 L120,14 Q130,22 140,22 L300,22 Q310,22 320,14 L348,14 Q370,14 370,24 L370,76 Q370,86 348,86 L320,86 Q310,78 300,78 L140,78 Q130,78 120,86 L92,86 Q70,86 70,76 Z" fill="#e6c99a" stroke="#b08850"/>
        <g clip-path="none">${bands}</g>
        <text x="220" y="98" text-anchor="middle" font-size="11" fill="#868e96">误差环通常离其他环远一点（这里在右边），从另一头开始读</text>`;
      const rows = $(".rc-rows", w); rows.innerHTML = "";
      s.forEach((ci, i) => {
        const r = el("div", "rc-band", `<span class="nm">${(n === 4 ? names4 : names5)[i]}</span>`);
        allowed(i).forEach(([c, j]) => {
          const b = el("button", "rc-sw" + (j === ci ? " on" : "")); b.type = "button"; b.style.background = c.c; b.dataset.n = c.n; b.title = c.n;
          b.addEventListener("click", () => { st[n][i] = j; draw(); });
          r.appendChild(b);
        });
        rows.appendChild(r);
      });
      const nd = n - 2;
      let val = 0; for (let i = 0; i < nd; i++) val = val * 10 + RC[s[i]].d;
      const mul = RC[s[nd]].m, tol = RC[s[nd + 1]].t;
      const v = val * Math.pow(10, mul);
      $(".rc-out", w).innerHTML = `读数：${s.slice(0, nd).map((c) => RC[c].n + "(" + RC[c].d + ")").join(" ")} × 10<sup>${mul}</sup>（${RC[s[nd]].n}）＝ <b class="big">${fmtOhm(v)}</b>，误差 <b>±${tol}%</b>（${RC[s[nd + 1]].n}）
        <br><span class="small muted">记忆口诀：黑棕红橙黄绿蓝紫灰白 = 0~9；金 = ×0.1 或 ±5%，银 = ×0.01 或 ±10%。</span>`;
    }
    $$(".rc-mode button", w).forEach((b) => b.addEventListener("click", () => {
      n = +b.dataset.n; $$(".rc-mode button", w).forEach((x) => x.classList.toggle("on", x === b)); draw();
    }));
    function smd() {
      const r = smdParse($(".smd-in", w).value);
      $(".smd-out", w).innerHTML = !r ? "输入试试" : (r.v != null ? `= <b class="big">${fmtOhm(r.v)}</b><br>` : "") + r.how;
    }
    $(".smd-in", w).addEventListener("input", smd);
    draw(); smd();
  });

  /* ============ 2.4 LED 限流电阻计算器 ============ */
  const LEDC = [["红色", 2.0], ["黄色", 2.0], ["绿色（高亮）", 3.0], ["蓝色", 3.0], ["白色", 3.0]];
  $$(".led-widget").forEach((w) => {
    w.innerHTML = `<div class="w2-row">
        <label>电源电压 Vs <input type="number" class="l-vs" value="5" step="0.1"> V</label>
        <label>LED 颜色 <select class="l-col">${LEDC.map(([n, v], i) => `<option value="${v}"${i === 0 ? " selected" : ""}>${n}（典型约 ${v} V）</option>`).join("")}</select></label>
      </div>
      <div class="w2-row">
        <label>正向压降 Vf <input type="number" class="l-vf" value="2" step="0.1"> V</label>
        <label>想要的电流 If <input type="number" class="l-if" value="10" step="1"> mA</label>
      </div>
      <svg class="w2-svg l-svg" viewBox="0 0 520 90" style="max-width:560px"></svg>
      <div class="w2-out l-out"></div>
      <div class="w2-row" style="margin-top:10px"><label>反过来：已经选了电阻 <input type="number" class="l-r" value="330" step="1"> Ω</label><span class="l-back"></span></div>`;
    const vs = $(".l-vs", w), col = $(".l-col", w), vf = $(".l-vf", w), iff = $(".l-if", w), rr = $(".l-r", w);
    col.addEventListener("change", () => { vf.value = col.value; upd(); });
    function upd() {
      const Vs = +vs.value, Vf = +vf.value, If = +iff.value / 1000;
      const out = $(".l-out", w);
      const dV = Vs - Vf;
      $(".l-svg", w).innerHTML = `<rect x="10" y="30" width="56" height="30" rx="4" fill="#fff3bf" stroke="#e67700"/><text x="38" y="50" text-anchor="middle" font-size="13">${fmtV(Vs)}</text>
        <line x1="66" y1="45" x2="150" y2="45" stroke="#2f9e44" stroke-width="2"/>
        <rect x="150" y="34" width="70" height="22" fill="#fff" stroke="#1c3f94" stroke-width="2"/><text x="185" y="27" text-anchor="middle" font-size="12" fill="#1c3f94">电阻 R</text>
        <text x="185" y="76" text-anchor="middle" font-size="12" fill="#d9480f">分到 ${dV > 0 ? fmtV(dV) : "—"}</text>
        <line x1="220" y1="45" x2="300" y2="45" stroke="#2f9e44" stroke-width="2"/>
        <polygon points="300,32 300,58 324,45" fill="#e03131"/><line x1="324" y1="32" x2="324" y2="58" stroke="#e03131" stroke-width="3"/>
        <text x="312" y="27" text-anchor="middle" font-size="12" fill="#e03131">LED</text><text x="312" y="76" text-anchor="middle" font-size="12" fill="#d9480f">分到 ${fmtV(Vf)}</text>
        <line x1="324" y1="45" x2="420" y2="45" stroke="#2f9e44" stroke-width="2"/><text x="440" y="50" font-size="13">GND (0 V)</text>`;
      if (!(If > 0)) { out.innerHTML = "电流要大于 0"; return; }
      if (dV <= 0) { out.innerHTML = `<span class="w2-warn">电源电压 ${fmtV(Vs)} 不高于 LED 的压降 ${fmtV(Vf)}，LED 基本亮不起来。</span>换更高的电源，或者用压降更低的 LED。`; return; }
      const R = dV / If, Rs = nextE24(R), Ia = dV / Rs, P = Ia * Ia * Rs;
      out.innerHTML = `R = (Vs − Vf) / If = (${p3(Vs)} − ${p3(Vf)}) / ${p3(If)} A = <b class="big">${fmtOhm(R)}</b>
        <br>选一个不小于它的标准阻值（E24 系列）：<b>${fmtOhm(Rs)}</b> → 实际电流约 <b>${fmtA(Ia)}</b>，电阻发热功率 <b>${fmtW(P)}</b>
        ${P > 0.1 ? '<br><span class="w2-warn">功率超过 0.1 W，0603 电阻扛不住，要换 1206 或更大封装。</span>' : '<br><span class="w2-ok">功率很小，0603 电阻没问题。</span>'}
        ${If > 0.02 ? '<br><span class="w2-warn">小贴片 LED 一般不要超过 20 mA（看规格书的最大电流）。</span>' : ""}`;
      const R2 = +rr.value;
      $(".l-back", w).innerHTML = R2 > 0 ? `→ 电流约 <b>${fmtA(dV / R2)}</b>` : "";
    }
    [vs, vf, iff, rr].forEach((x) => x.addEventListener("input", upd));
    upd();
  });

  /* ============ 2.5 真实比例对比图 ============ */
  const SZ = [
    { k: "0402", w: 1.0, h: 0.5, t: "chip", small: 1, info: "0402（英制）= 1.0 × 0.5 mm，公制叫 1005。比芝麻粒还小，手机、耳机里大量使用；手工焊接很难。" },
    { k: "0603", w: 1.6, h: 0.8, t: "chip", small: 1, info: "0603 = 1.6 × 0.8 mm（公制 1608）。<b>案例 A 的电阻、LED 和小电容都是它</b>，适合机器贴片；手焊需要镊子和耐心。" },
    { k: "0805", w: 2.0, h: 1.25, t: "cap", small: 1, info: "0805 = 2.0 × 1.25 mm（公制 2012）。案例 A 的 C1（10 µF）用的是 0805——容量大的电容往往要大一点的封装。" },
    { k: "1206", w: 3.2, h: 1.6, t: "chip", small: 1, info: "1206 = 3.2 × 1.6 mm（公制 3216）。<b>新手手工焊接推荐</b>，用普通烙铁就能焊。" },
    { k: "SOT-23", w: 2.9, h: 2.4, t: "sot", small: 1, dim: "2.9 × 1.3", info: "SOT-23：三只脚的小晶体管封装，塑料本体约 2.9 × 1.3 mm，加上脚宽约 2.4 mm，脚间距 0.95 mm。三极管、MOS 管、小稳压芯片常用。（不同厂家尺寸略有差别）" },
    { k: "SOP-8", w: 4.9, h: 6.0, t: "sop", small: 1, dim: "4.9 × 3.9", info: "SOP-8 / SOIC-8：8 只脚，本体约 4.9 × 3.9 mm，加上两侧的脚约 6 mm 宽，脚间距 1.27 mm。<b>案例 A 的 NE555DR 就是 SOIC-8</b>。左下角的圆点标出 1 号脚。" },
    { k: "米粒", w: 6.0, h: 2.5, t: "rice", small: 1, dim: "约 6 × 2.5", info: "一粒米，约 6 × 2.5 mm（因品种而异），用来感受大小。" },
    { k: "DIP-8 直插", w: 9.6, h: 8.2, t: "dip", dim: "约 9.6 × 6.4", info: "DIP-8：直插封装，本体约 9.6 × 6.4 mm，脚间距 2.54 mm（0.1 英寸），两排脚相距 7.62 mm。NE555 也有这种封装（NE555P），插进面包板就能用。（尺寸为常见值，以规格书为准）" },
    { k: "ESP32-C3 模组", w: 13.2, h: 16.6, t: "mod", info: "ESP32-C3-MINI-1 模组：13.2 × 16.6 mm，<b>案例 B 的主角</b>。上面一截是 PCB 天线，下面的金属屏蔽罩里是芯片、Flash 和晶振。焊盘全在底部，手焊很难，交给 SMT。" },
    { k: "1 元硬币", w: 25, h: 25, t: "coin", dim: "直径 25", info: "1 元硬币：直径 25 mm。案例 A 的小徽章直径 40 mm，比它大一圈。" },
  ];
  function szDraw(it, x, y, s) {
    const W = it.w * s, H = it.h * s, cx = x + W / 2, cy = y + H / 2;
    let g = "";
    if (it.t === "chip" || it.t === "cap") {
      const e = W * 0.18;
      g = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${Math.min(2, s * 0.05)}" fill="#c3c8ce" stroke="#868e96" stroke-width=".6"/>
           <rect x="${x + e}" y="${y}" width="${W - 2 * e}" height="${H}" fill="${it.t === "cap" ? "#b8915a" : "#1f1f1f"}"/>`;
    } else if (it.t === "sot") {
      const bh = 1.3 * s, by = cy - bh / 2, lw = 0.4 * s;
      const lead = (lx, ly, lh) => `<rect x="${lx - lw / 2}" y="${ly}" width="${lw}" height="${lh}" fill="#adb5bd"/>`;
      g = lead(cx, y, by - y) + lead(cx - 0.95 * s, by + bh, y + H - by - bh) + lead(cx + 0.95 * s, by + bh, y + H - by - bh) +
          `<rect x="${x}" y="${by}" width="${W}" height="${bh}" rx="${s * 0.1}" fill="#212529"/>`;
    } else if (it.t === "sop") {
      const bh = 3.9 * s, by = cy - bh / 2, lw = 0.42 * s;
      [-1.905, -0.635, 0.635, 1.905].forEach((d) => {
        g += `<rect x="${cx + d * s - lw / 2}" y="${y}" width="${lw}" height="${by - y}" fill="#adb5bd"/><rect x="${cx + d * s - lw / 2}" y="${by + bh}" width="${lw}" height="${y + H - by - bh}" fill="#adb5bd"/>`;
      });
      g += `<rect x="${x}" y="${by}" width="${W}" height="${bh}" rx="${s * 0.15}" fill="#212529"/><circle cx="${x + 0.8 * s}" cy="${by + bh - 0.8 * s}" r="${0.35 * s}" fill="#495057"/>`;
      if (s > 9) g += `<text x="${cx}" y="${cy + s * 0.35}" text-anchor="middle" font-size="${0.9 * s}" fill="#adb5bd">NE555</text>`;
    } else if (it.t === "dip") {
      const bh = 6.4 * s, by = cy - bh / 2, lw = 0.6 * s;
      [-3.81, -1.27, 1.27, 3.81].forEach((d) => {
        g += `<rect x="${cx + d * s - lw / 2}" y="${y}" width="${lw}" height="${by - y + 1}" fill="#adb5bd"/><rect x="${cx + d * s - lw / 2}" y="${by + bh - 1}" width="${lw}" height="${y + H - by - bh + 1}" fill="#adb5bd"/>`;
      });
      g += `<rect x="${x}" y="${by}" width="${W}" height="${bh}" rx="${s * 0.2}" fill="#2b2b2b"/><path d="M${x},${cy - 0.8 * s} a${0.8 * s},${0.8 * s} 0 0 1 0,${1.6 * s}" fill="#495057"/>`;
    } else if (it.t === "mod") {
      g = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${s * 0.3}" fill="#1e5631"/>
           <path d="M${x + 1.2 * s},${y + 1.4 * s} h${3 * s} v${1.6 * s} h${3 * s} v${-1.6 * s} h${3 * s}" fill="none" stroke="#c9a227" stroke-width="${0.35 * s}"/>
           <rect x="${x + 0.6 * s}" y="${y + 4.6 * s}" width="${W - 1.2 * s}" height="${H - 5.2 * s}" rx="${s * 0.3}" fill="#ced4da" stroke="#adb5bd"/>`;
      if (s > 4) g += `<text x="${cx}" y="${y + 10.6 * s}" text-anchor="middle" font-size="${1.3 * s}" fill="#495057">ESP32-C3</text>`;
    } else if (it.t === "rice") {
      g = `<ellipse cx="${cx}" cy="${cy}" rx="${W / 2}" ry="${H / 2}" fill="#fffdf5" stroke="#d6cfb8"/>`;
    } else if (it.t === "coin") {
      g = `<circle cx="${cx}" cy="${cy}" r="${W / 2}" fill="#d9dde1" stroke="#adb5bd" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${W / 2 - 1.2 * s}" fill="none" stroke="#bfc5cb"/>
           <text x="${cx}" y="${cy + 3 * s}" text-anchor="middle" font-size="${9 * s}" fill="#9aa1a8" font-weight="700">1</text>`;
    }
    return g + `<rect class="sz-hit" x="${x - 3}" y="${y - 3}" width="${W + 6}" height="${H + 6}" rx="4" fill="transparent" stroke="transparent"/>`;
  }
  $$(".size-widget").forEach((w) => {
    let set = "small", zoom = 1, fixed = null, cur = 1;
    w.innerHTML = `<div class="w2-btns sz-set"><button type="button" class="on" data-s="small">小元件 + 米粒</button><button type="button" data-s="all">全部（含模组、硬币）</button>
      <button type="button" class="sz-real">按屏幕“约实物大小”显示</button></div>
      <div class="w2-row"><label>放大 <input type="range" class="sz-z" min="1" max="6" step="0.1" value="1"></label><span class="small muted sz-sc"></span></div>
      <div class="sz-wrap"><svg></svg></div>
      <div class="w2-out sz-info"></div>`;
    const wrap = $(".sz-wrap", w), svg = $("svg", wrap), info = $(".sz-info", w);
    function render() {
      const rows = set === "all" ? [SZ.filter((it) => it.small), SZ.filter((it) => !it.small)] : [SZ.filter((it) => it.small)];
      const gap = 10, pad = 16, MINS = 72;
      const cw = Math.max(320, wrap.clientWidth - 2);
      const slotW = (list, sc) => list.reduce((a, it) => a + Math.max(it.w * sc, MINS), 0) + gap * (list.length - 1) + pad * 2;
      const fitRow = (list) => { let lo = 0.5, hi = 200; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (slotW(list, m) > cw) hi = m; else lo = m; } return lo; };
      const s = fixed || Math.min(...rows.map(fitRow)) * zoom;
      const total = Math.max(...rows.map((r) => slotW(r, s)));
      let out = "", y0 = 0;
      rows.forEach((list) => {
        const maxH = Math.max(...list.map((it) => it.h)) * s;
        const cy = y0 + 16 + maxH / 2;
        let x = pad;
        list.forEach((it) => {
          const i = SZ.indexOf(it);
          const slot = Math.max(it.w * s, MINS), ix = x + (slot - it.w * s) / 2;
          out += `<g class="sz-item${i === cur ? " on" : ""}" data-i="${i}">${szDraw(it, ix, cy - (it.h * s) / 2, s)}
          <text x="${x + slot / 2}" y="${cy + maxH / 2 + 24}" text-anchor="middle" font-size="13" fill="#343a40" font-weight="600">${it.k}</text>
          <text x="${x + slot / 2}" y="${cy + maxH / 2 + 40}" text-anchor="middle" font-size="11" fill="#868e96">${it.dim || it.w + " × " + it.h} mm</text></g>`;
          x += slot + gap;
        });
        y0 += maxH + 60;
      });
      const H = y0 + 32;
      svg.setAttribute("width", total); svg.setAttribute("height", H); svg.setAttribute("viewBox", `0 0 ${total} ${H}`);
      const bar = s * 5 > 200 ? 1 : 5;
      out += `<line x1="${pad}" y1="${H - 10}" x2="${pad + bar * s}" y2="${H - 10}" stroke="#f03e3e" stroke-width="3"/><text x="${pad + bar * s + 8}" y="${H - 6}" font-size="12" fill="#f03e3e">${bar} mm</text>`;
      svg.innerHTML = out;
      $(".sz-sc", w).textContent = fixed ? "（按 CSS 标准 96 像素/英寸绘制，屏幕不同会有偏差：拿一枚 1 元硬币贴在屏幕上比一比）" : `当前比例：1 mm ≈ ${s.toFixed(1)} 像素（所有东西都按同一个比例画）`;
      $$(".sz-item", svg).forEach((g) => g.addEventListener("click", () => { cur = +g.dataset.i; render(); }));
      info.innerHTML = SZ[cur].info;
    }
    $$(".sz-set button[data-s]", w).forEach((b) => b.addEventListener("click", () => {
      set = b.dataset.s; fixed = null; $$(".sz-set button", w).forEach((x) => x.classList.toggle("on", x === b)); render();
    }));
    $(".sz-real", w).addEventListener("click", (e) => {
      fixed = 96 / 25.4; set = "all"; $$(".sz-set button", w).forEach((x) => x.classList.toggle("on", x === e.target)); render();
    });
    $(".sz-z", w).addEventListener("input", (e) => { zoom = +e.target.value; fixed = null; render(); });
    window.addEventListener("resize", render);
    render();
  });

  /* ============ 2.6 找连接 小练习 ============ */
  const NF = {
    pins: {
      "R3.1": [150, 55, "VCC"], "R3.2": [150, 125, "DISCH"], "R4.1": [150, 145, "DISCH"], "R4.2": [150, 205, "TRIG"],
      "C1.1": [150, 245, "TRIG"], "C1.2": [150, 295, "GND"],
      "U1.1": [360, 320, "GND"], "U1.2": [270, 225, "TRIG"], "U1.3": [450, 150, "OUT"], "U1.4": [390, 70, "VCC"],
      "U1.5": [450, 240, "CONT"], "U1.6": [270, 185, "TRIG"], "U1.7": [270, 135, "DISCH"], "U1.8": [330, 70, "VCC"],
      "C2.1": [630, 255, "CONT"], "C2.2": [630, 300, "GND"], "R7.1": [540, 255, "OUT"], "R7.2": [540, 305, "N1"],
      "LED3.A": [540, 320, "N1"], "LED3.K": [540, 360, "GND"],
    },
    wires: {
      VCC: [[150, 32, 150, 55], [330, 70, 330, 58], [390, 70, 390, 58], [330, 58, 390, 58], [360, 58, 360, 42]],
      DISCH: [[150, 125, 150, 145], [150, 135, 270, 135]],
      TRIG: [[150, 205, 150, 245], [150, 225, 270, 225], [235, 225, 235, 185], [235, 185, 270, 185]],
      GND: [[150, 295, 150, 310], [360, 320, 360, 330], [630, 300, 630, 312], [540, 360, 540, 370]],
      OUT: [[450, 150, 515, 150], [540, 102, 540, 255]],
      CONT: [[450, 240, 630, 240], [630, 240, 630, 255]],
      N1: [[540, 305, 540, 320]],
    },
    jn: { DISCH: [[150, 135]], TRIG: [[150, 225], [235, 225]], VCC: [[360, 58]] },
    names: { VCC: "VCC（电源）", GND: "GND（地）", DISCH: "放电节点（没起名字）", TRIG: "定时节点（没起名字）", OUT: "OUT", CONT: "控制端节点（没起名字）", N1: "R7 和 LED3 之间（没起名字）" },
    nice: { "R3.1": "R3 上端", "R3.2": "R3 下端", "R4.1": "R4 上端", "R4.2": "R4 下端", "C1.1": "C1 上端", "C1.2": "C1 下端", "C2.1": "C2 上端", "C2.2": "C2 下端",
      "R7.1": "R7 上端", "R7.2": "R7 下端", "LED3.A": "LED3 正极", "LED3.K": "LED3 负极",
      "U1.1": "U1 的 1 脚 GND", "U1.2": "U1 的 2 脚 TRIG", "U1.3": "U1 的 3 脚 OUT", "U1.4": "U1 的 4 脚 RST", "U1.5": "U1 的 5 脚 CONT", "U1.6": "U1 的 6 脚 THRES", "U1.7": "U1 的 7 脚 DISCH", "U1.8": "U1 的 8 脚 VCC" },
    qs: [
      ["R3.1", "U1.8", "两个 VCC 电源符号名字相同，软件认为它们是同一个网络，虽然中间没画线。"],
      ["U1.6", "U1.2", "6 脚和 2 脚通过导线和红色连接点连在一起，都属于“定时节点”。"],
      ["R7.1", "U1.5", "R7 上方的竖线和 5 脚的横线只是<b>交叉</b>，交叉处没有连接点圆点，所以<b>不相连</b>。"],
      ["R7.1", "U1.3", "两处都挂着名字为 OUT 的网络标签——同名网络标签就是相连的。"],
      ["R4.1", "R4.2", "同一个电阻的两端<b>不是</b>同一个网络：中间隔着电阻本身，两端电压可以不一样。"],
      ["C1.2", "LED3.K", "都接到了 GND 符号，所有 GND 符号是同一个网络。"],
    ],
  };
  $$(".netfind-widget").forEach((w) => {
    const P = NF.pins;
    const wireSvg = Object.entries(NF.wires).map(([n, ls]) => ls.map((l) => `<line class="wire" data-net="${n}" x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}"/>`).join("")).join("");
    const jnSvg = Object.entries(NF.jn).map(([n, ps]) => ps.map((p) => `<circle class="jn" data-net="${n}" cx="${p[0]}" cy="${p[1]}" r="4.5"/>`).join("")).join("");
    const resV = (x, y1, y2, a, b) => `<line class="part" x1="${x}" y1="${y1}" x2="${x}" y2="${y1 + 10}"/><rect class="partf" x="${x - 9}" y="${y1 + 10}" width="18" height="${y2 - y1 - 20}"/><line class="part" x1="${x}" y1="${y2 - 10}" x2="${x}" y2="${y2}"/><text class="lbl" x="${x + 14}" y="${(y1 + y2) / 2 - 2}">${a}</text><text class="lbl" x="${x + 14}" y="${(y1 + y2) / 2 + 13}">${b}</text>`;
    const capV = (x, y1, y2, a, b) => { const m = (y1 + y2) / 2; return `<line class="part" x1="${x}" y1="${y1}" x2="${x}" y2="${m - 4}"/><line class="part" x1="${x - 13}" y1="${m - 4}" x2="${x + 13}" y2="${m - 4}" stroke-width="3"/><line class="part" x1="${x - 13}" y1="${m + 4}" x2="${x + 13}" y2="${m + 4}" stroke-width="3"/><line class="part" x1="${x}" y1="${m + 4}" x2="${x}" y2="${y2}"/><text class="lbl" x="${x + 17}" y="${m - 2}">${a}</text><text class="lbl" x="${x + 17}" y="${m + 13}">${b}</text>`; };
    const gnd = (x, y) => `<g class="psym" data-net="GND" stroke="#1c3f94" stroke-width="2.2"><line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}"/><line x1="${x - 7}" y1="${y + 5}" x2="${x + 7}" y2="${y + 5}"/><line x1="${x - 3}" y1="${y + 10}" x2="${x + 3}" y2="${y + 10}"/></g>`;
    const vcc = (x, y) => `<g class="psym" data-net="VCC" stroke="#1c3f94" stroke-width="2.2"><line x1="${x - 12}" y1="${y}" x2="${x + 12}" y2="${y}"/></g><text class="lbl" x="${x}" y="${y - 6}" text-anchor="middle">VCC</text>`;
    const pinLine = (x1, y1, x2, y2) => `<line class="part" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    const art = `
      ${resV(150, 55, 125, "R3", "1kΩ")}${resV(150, 145, 205, "R4", "47kΩ")}${capV(150, 245, 295, "C1", "10µF")}
      ${capV(630, 255, 300, "C2", "10nF")}${resV(540, 255, 305, "R7", "330Ω")}
      <line class="part" x1="540" y1="320" x2="540" y2="328"/><polygon points="528,328 552,328 540,348" fill="#1c3f94"/><line class="part" x1="528" y1="348" x2="552" y2="348" stroke-width="3"/><line class="part" x1="540" y1="348" x2="540" y2="360"/><text class="lbl" x="558" y="342">LED3</text>
      <rect class="partf" x="300" y="100" width="120" height="190"/><text class="lbl" x="360" y="210" text-anchor="middle" font-weight="700">U1 NE555</text>
      ${pinLine(270, 135, 300, 135)}${pinLine(270, 185, 300, 185)}${pinLine(270, 225, 300, 225)}${pinLine(420, 150, 450, 150)}${pinLine(420, 240, 450, 240)}${pinLine(330, 70, 330, 100)}${pinLine(390, 70, 390, 100)}${pinLine(360, 290, 360, 320)}
      <text class="lbl" x="306" y="139">DISCH</text><text class="lbl" x="306" y="189">THRES</text><text class="lbl" x="306" y="229">TRIG</text><text class="lbl" x="414" y="154" text-anchor="end">OUT</text><text class="lbl" x="414" y="244" text-anchor="end">CONT</text>
      <text class="lbl" x="330" y="116" text-anchor="middle">VCC</text><text class="lbl" x="390" y="116" text-anchor="middle">RST</text><text class="lbl" x="360" y="284" text-anchor="middle">GND</text>
      <text class="pn" x="286" y="131">7</text><text class="pn" x="286" y="181">6</text><text class="pn" x="286" y="221">2</text><text class="pn" x="432" y="146">3</text><text class="pn" x="432" y="236">5</text><text class="pn" x="334" y="90">8</text><text class="pn" x="394" y="90">4</text><text class="pn" x="364" y="306">1</text>
      ${vcc(150, 32)}${vcc(360, 42)}${gnd(150, 310)}${gnd(360, 330)}${gnd(630, 312)}${gnd(540, 370)}
      <text class="net" data-net="OUT" x="470" y="145">OUT</text><text class="net" data-net="OUT" x="528" y="97">OUT</text>`;
    w.innerHTML = `<svg class="w2-svg nf-svg" viewBox="0 0 700 390">${art}${wireSvg}${jnSvg}<g class="pins"></g></svg>
      <div class="w2-out nf-info">👆 点任意一个<b>引脚端点</b>（小圆圈），整个网络会变红；再点第二个引脚，告诉你两者是不是连在一起。</div>
      <div class="w2-sub">挑战：下面每一对引脚是不是同一个网络？</div><div class="nf-qs"></div>`;
    const svg = $(".nf-svg", w), pg = $(".pins", svg), info = $(".nf-info", w);
    Object.entries(P).forEach(([id, [x, y]]) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "pin"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 6); c.dataset.id = id;
      const t = document.createElementNS("http://www.w3.org/2000/svg", "title"); t.textContent = NF.nice[id]; c.appendChild(t);
      pg.appendChild(c);
    });
    let sel = [];
    function hl(net, ids) {
      $$("[data-net]", svg).forEach((e) => e.classList.toggle("hl", e.dataset.net === net));
      $$(".pin", svg).forEach((c) => { c.classList.toggle("hl", P[c.dataset.id][2] === net); c.classList.toggle("a", ids.includes(c.dataset.id)); });
    }
    const members = (net) => Object.keys(P).filter((k) => P[k][2] === net).map((k) => NF.nice[k]).join("、");
    $$(".pin", svg).forEach((c) => c.addEventListener("click", () => {
      const id = c.dataset.id;
      sel = sel.length >= 2 ? [id] : sel.concat(id);
      const net = P[id][2];
      hl(net, sel);
      let s = `<b>${NF.nice[id]}</b> 属于网络「${NF.names[net]}」，同一网络的还有：${members(net)}。`;
      if (sel.length === 2) {
        const [a, b] = sel, same = P[a][2] === P[b][2];
        s = `<b>${NF.nice[a]}</b> 和 <b>${NF.nice[b]}</b>：` + (same ? `<span class="w2-ok">✓ 是同一个网络</span>（${NF.names[P[a][2]]}）` : `<span class="w2-warn">✗ 不是同一个网络</span>（${NF.names[P[a][2]]} ≠ ${NF.names[P[b][2]]}）`) + "。再点任意引脚重新开始。";
      }
      info.innerHTML = s;
    }));
    NF.qs.forEach(([a, b, why]) => {
      const same = P[a][2] === P[b][2];
      const q = el("div", "nf-q", `<span class="t">${NF.nice[a]} 和 ${NF.nice[b]}</span><button type="button" data-y="1">相连</button><button type="button" data-y="0">不相连</button><div class="r"></div>`);
      $$("button", q).forEach((bt) => bt.addEventListener("click", () => {
        const ok = (bt.dataset.y === "1") === same;
        q.classList.add("done"); q.classList.toggle("ok", ok); q.classList.toggle("bad", !ok);
        $(".r", q).innerHTML = (ok ? "✅ 对！" : "❌ 不对。") + (same ? "它们<b>相连</b>。" : "它们<b>不相连</b>。") + why;
        sel = [a, b]; hl(P[a][2], sel);
      }));
      $(".nf-qs", w).appendChild(q);
    });
  });

  /* ============ 2.7 上拉电阻按键演示 ============ */
  $$(".pullup-widget").forEach((w) => {
    const id = ++UID;
    w.innerHTML = `<div class="pu-grid">
      <svg class="w2-svg pu-svg" viewBox="0 0 500 290"></svg>
      <div>
        <div class="w2-row" style="flex-direction:column;align-items:flex-start;gap:4px">
          <label><input type="radio" name="pum${id}" value="pu" checked> 接 10 kΩ 上拉电阻（推荐）</label>
          <label><input type="radio" name="pum${id}" value="none"> 什么都不接（引脚“悬空”）</label>
          <label><input type="radio" name="pum${id}" value="wire"> 把电阻换成一根导线</label>
        </div>
        <button type="button" class="pu-btn">👆 按住这里 = 按下按键</button>
        <label class="small" style="display:block;margin-top:6px"><input type="checkbox" class="pu-lock"> 保持按下</label>
        <div class="w2-out pu-out"></div>
      </div></div>
      <svg class="w2-svg pu-lv" viewBox="0 0 640 64" style="margin-top:8px"></svg>`;
    const svg = $(".pu-svg", w), lv = $(".pu-lv", w), out = $(".pu-out", w), btn = $(".pu-btn", w), lock = $(".pu-lock", w);
    let down = false, fv = 1.6, flick = 0;
    const mode = () => $(`input[name=pum${id}]:checked`, w).value;
    const pressed = () => down || lock.checked;
    function draw() {
      const m = mode(), p = pressed();
      let V, val, txt, cls = "";
      if (m === "pu") { V = p ? 0 : 3.3; val = p ? "0（低电平）" : "1（高电平）"; txt = p ? "按下：引脚通过按键直接接到 GND，电压被拉到 0 V。上拉电阻里流过 3.3 V / 10 kΩ = <b>0.33 mA</b>，很省电。" : "松开：没有电流流过电阻，电阻两端没有压降，引脚被“拉”到 3.3 V。"; }
      else if (m === "none") { V = p ? 0 : fv; val = p ? "0（低电平）" : (V > 2.31 ? "1" : V < 0.99 ? "0" : (flick ? "1" : "0")) + "？（乱跳）"; txt = p ? "按下时接到 GND，读到 0，看起来没问题……" : "<span class='w2-warn'>松开时引脚什么都没接</span>，电压随周围干扰飘来飘去，程序读到的值<b>时 0 时 1</b>，好像有人在乱按按键。"; cls = p ? "" : "w2-warn"; }
      else { V = p ? null : 3.3; val = p ? "—" : "1（高电平）"; txt = p ? "<span class='w2-warn pu-short'>⚡ 短路！</span> 按下后 3.3 V 通过导线和按键直接接到 GND，电流非常大，电源会被拉垮、导线发烫——这就是为什么中间必须有电阻。" : "松开时看起来正常……按下试试。"; }
      const flow = m === "pu" && p, sh = m === "wire" && p;
      const wc = (on) => on ? "#f03e3e" : "#2f9e44";
      svg.innerHTML = `
        <text x="120" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="#e67700">3.3 V</text>
        <line x1="96" y1="28" x2="144" y2="28" stroke="#1c3f94" stroke-width="2.5"/>
        <line x1="120" y1="28" x2="120" y2="52" stroke="${wc(flow || sh)}" stroke-width="2.5"/>
        ${m === "pu" ? `<rect x="109" y="52" width="22" height="60" fill="#fff" stroke="#1c3f94" stroke-width="2"/><text x="140" y="78" font-size="13" fill="#1c3f94">10 kΩ</text><text x="140" y="96" font-size="12" fill="#868e96">上拉电阻</text>`
          : m === "wire" ? `<line x1="120" y1="52" x2="120" y2="112" stroke="${wc(sh)}" stroke-width="2.5"/><text x="134" y="86" font-size="12" fill="#c92a2a">导线（0 Ω）</text>`
          : `<text x="134" y="86" font-size="12" fill="#868e96">（什么都没接）</text>`}
        ${m !== "none" ? `<line x1="120" y1="112" x2="120" y2="140" stroke="${wc(flow || sh)}" stroke-width="2.5"/>` : ""}
        <circle cx="120" cy="140" r="4.5" fill="#2f9e44"/>
        <line x1="120" y1="140" x2="330" y2="140" stroke="#2f9e44" stroke-width="2.5"/>
        <line x1="120" y1="140" x2="120" y2="178" stroke="${wc(flow || sh)}" stroke-width="2.5"/>
        <circle cx="120" cy="180" r="3.5" fill="#1c3f94"/><circle cx="120" cy="220" r="3.5" fill="#1c3f94"/>
        <line x1="120" y1="220" x2="${p ? 120 : 146}" y2="${p ? 182 : 186}" stroke="#1c3f94" stroke-width="3" stroke-linecap="round"/>
        <text x="${p ? 132 : 154}" y="206" font-size="13" fill="#1c3f94">按键${p ? "（按下）" : "（松开）"}</text>
        <line x1="120" y1="220" x2="120" y2="248" stroke="${wc(flow || sh)}" stroke-width="2.5"/>
        <line x1="106" y1="248" x2="134" y2="248" stroke="#1c3f94" stroke-width="2.5"/><line x1="112" y1="254" x2="128" y2="254" stroke="#1c3f94" stroke-width="2.5"/><line x1="117" y1="260" x2="123" y2="260" stroke="#1c3f94" stroke-width="2.5"/>
        <text x="120" y="280" text-anchor="middle" font-size="12" fill="#868e96">GND</text>
        ${flow || sh ? `<path class="pu-flow" d="M120,30 L120,248" stroke="${sh ? "#f03e3e" : "#ffa8a8"}" stroke-width="6" fill="none" opacity=".7"/>` : ""}
        <rect x="330" y="90" width="150" height="120" rx="8" fill="#f8f9fa" stroke="#495057" stroke-width="2"/>
        <text x="405" y="114" text-anchor="middle" font-size="13" fill="#495057">单片机（如 ESP32-C3）</text>
        <text x="338" y="145" font-size="12" fill="#495057">GPIO 引脚</text>
        <text x="405" y="176" text-anchor="middle" font-size="13" fill="#495057">程序读到：</text>
        <text x="405" y="199" text-anchor="middle" font-size="16" font-weight="700" fill="${cls ? "#c92a2a" : "#d9480f"}">${val}</text>
        <text x="225" y="132" text-anchor="middle" font-size="12" fill="#d9480f">${V == null ? "?" : V.toFixed(2) + " V"}</text>`;
      out.innerHTML = txt;
      // 电平条
      const X = (v) => 20 + (v / 3.3) * 600;
      lv.innerHTML = `<rect x="${X(0)}" y="18" width="${X(0.99) - X(0)}" height="16" fill="#d0ebff"/><rect x="${X(0.99)}" y="18" width="${X(2.31) - X(0.99)}" height="16" fill="#e9ecef"/><rect x="${X(2.31)}" y="18" width="${X(3.3) - X(2.31)}" height="16" fill="#ffe8cc"/>
        <text x="${(X(0) + X(0.99)) / 2}" y="30" text-anchor="middle" font-size="11" fill="#1971c2">低电平 0</text><text x="${(X(0.99) + X(2.31)) / 2}" y="30" text-anchor="middle" font-size="11" fill="#868e96">不确定区（别停在这里）</text><text x="${(X(2.31) + X(3.3)) / 2}" y="30" text-anchor="middle" font-size="11" fill="#d9480f">高电平 1</text>
        <text x="${X(0)}" y="50" font-size="11" fill="#868e96">0 V</text><text x="${X(0.99)}" y="50" text-anchor="middle" font-size="11" fill="#868e96">≈0.3×3.3</text><text x="${X(2.31)}" y="50" text-anchor="middle" font-size="11" fill="#868e96">≈0.7×3.3</text><text x="${X(3.3)}" y="50" text-anchor="end" font-size="11" fill="#868e96">3.3 V</text>
        ${V == null ? "" : `<polygon points="${X(V)},16 ${X(V) - 6},4 ${X(V) + 6},4" fill="#f03e3e"/>`}`;
    }
    const press = (v) => (e) => { e.preventDefault(); down = v; btn.classList.toggle("down", v || lock.checked); draw(); };
    btn.addEventListener("pointerdown", press(true));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, press(false)));
    lock.addEventListener("change", () => { btn.classList.toggle("down", lock.checked); draw(); });
    $$("input[type=radio]", w).forEach((r) => r.addEventListener("change", draw));
    setInterval(() => { if (mode() === "none" && !pressed()) { fv = Math.min(3.1, Math.max(0.2, fv + (Math.random() - 0.5) * 0.9)); flick = Math.random() < 0.5 ? 1 : 0; draw(); } }, 160);
    draw();
  });

  /* ============ 2.10 线宽-电流计算器（IPC-2221） ============ */
  $$(".trace-widget").forEach((w) => {
    w.innerHTML = `<div class="w2-row">
        <label>电流 <input type="number" class="t-i" value="1" step="0.1" min="0"> A</label>
        <label>允许温升 <select class="t-dt"><option value="10" selected>10 °C（稳妥）</option><option value="20">20 °C</option><option value="30">30 °C</option></select></label>
        <label>铜厚 <select class="t-oz"><option value="1" selected>1 oz（嘉立创默认外层）</option><option value="2">2 oz</option></select></label>
        <label>位置 <select class="t-ly"><option value="0.048" selected>外层（顶层/底层）</option><option value="0.024">内层</option></select></label>
      </div>
      <div class="w2-btns t-q"><span class="small muted">常见场景：</span></div>
      <div class="w2-out t-out"></div>
      <svg class="w2-svg tw-bar" viewBox="0 0 640 120"></svg>
      <div class="w2-row" style="margin-top:8px"><label>反过来：已有线宽 <input type="number" class="t-w" value="0.254" step="0.01" min="0"> mm</label><span class="t-back"></span></div>`;
    [["LED 徽章（十几 mA）", 0.02], ["USB 2.0 口上限 0.5 A", 0.5], ["1 A", 1], ["小电机 2 A", 2], ["5 A", 5]].forEach(([n, v]) => {
      const b = el("button", "", n); b.type = "button"; b.addEventListener("click", () => { $(".t-i", w).value = v; upd(); }); $(".t-q", w).appendChild(b);
    });
    const ti = $(".t-i", w), tdt = $(".t-dt", w), toz = $(".t-oz", w), tly = $(".t-ly", w), tw = $(".t-w", w);
    function upd() {
      const I = Math.max(0, +ti.value), dT = +tdt.value, t = 1.378 * +toz.value, k = +tly.value;
      const A = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
      const wmil = A / t, wmm = wmil * 0.0254;
      const use = Math.max(wmm, 0.254);
      $(".t-out", w).innerHTML = I <= 0 ? "输入电流" : `至少需要线宽约 <b class="big">${wmm < 0.01 ? wmm.toFixed(4) : wmm.toFixed(3)} mm</b>（${wmil.toFixed(1)} mil）
        <br>${wmm < 0.254 ? "比嘉立创默认线宽 0.254 mm 还细——<b>直接用默认线宽就行</b>。" : `建议画到 <b>${(Math.ceil(wmm * 20 - 1e-6) / 20).toFixed(2)} mm</b> 或更宽；铺铜、加宽成“铜皮”也可以。`}
        <br><span class="small muted">⚠️ 这是按 IPC-2221 经验公式算的<b>估算值</b>（I = k·ΔT<sup>0.44</sup>·A<sup>0.725</sup>，外层 k = 0.048，内层 k = 0.024，A 为截面积 mil²，1 oz 铜厚 ≈ 1.378 mil ≈ 0.035 mm）。大电流设计要留足余量。</span>`;
      const S = 120; // px per mm
      const wdraw = Math.min(use, 4.5) * S;
      $(".tw-bar", w).innerHTML = `<text x="10" y="16" font-size="12" fill="#868e96">按比例对比（1 mm = ${S} 像素）：</text>
        <rect x="10" y="${30}" width="600" height="${0.254 * S}" fill="#ffa8a8"/><text x="616" y="${30 + 0.254 * S - 4}" font-size="11" fill="#868e96" text-anchor="end">默认 0.254 mm</text>
        <rect x="10" y="${30 + 0.254 * S + 12}" width="600" height="${Math.max(1, wdraw)}" fill="#e8590c" opacity=".85"/>
        <text x="20" y="${30 + 0.254 * S + 12 + Math.max(12, Math.min(wdraw, 60) / 2 + 4)}" font-size="12" fill="#fff">${use > 4.5 ? "（太宽画不下，示意）" : "需要的线宽"}</text>`;
      $(".tw-bar", w).setAttribute("viewBox", `0 0 640 ${Math.min(30 + 0.254 * S + 12 + Math.max(1, wdraw) + 8, 640)}`);
      const W = +tw.value;
      if (W > 0) {
        const Ab = (W / 0.0254) * t, Ib = k * Math.pow(dT, 0.44) * Math.pow(Ab, 0.725);
        $(".t-back", w).innerHTML = `→ 在上面的温升/铜厚下约能过 <b>${Ib.toFixed(2)} A</b>（估算）`;
      } else $(".t-back", w).innerHTML = "";
    }
    [ti, tdt, toz, tly, tw].forEach((x) => x.addEventListener("input", upd));
    upd();
  });

  /* ============ 2.11 工厂工艺流程动画 ============ */
  const FAB = [
    ["开料", "Cutting", "工厂的原材料是大张的<b>覆铜板</b>：FR-4 基材两面贴着铜箔。先按生产需要切成合适的大小（一大张上会同时排很多块板子）。"],
    ["钻孔", "Drilling", "数控钻床按照你导出的<b>钻孔文件</b>（.DRL）打孔：过孔、插件孔、安装孔。这时候孔壁是绝缘的树脂，上下两层还没连通。"],
    ["沉铜 / 电镀", "PTH", "用化学方法在孔壁上“沉”一层薄铜，再电镀加厚，孔就变成了<b>金属化孔</b>——上下两层铜终于连通了。过孔能当“电梯”就靠这一步。"],
    ["图形转移", "Imaging", "板面贴上一层<b>感光膜</b>，按 Gerber 里的铜层图形曝光、显影：要保留的导线、焊盘处的膜被留下来，起保护作用（紫色是曝光的光）。"],
    ["蚀刻", "Etching", "药水把没被保护的铜“腐蚀”掉，再把感光膜洗掉，导线和焊盘就出现了。之后通常用 AOI 光学检查有没有断线、短路。<b>线宽、间距不能太小</b>，就是因为蚀刻有精度极限。"],
    ["阻焊", "Solder Mask", "整板涂上阻焊油墨（绿油，也可以选其他颜色），再曝光显影，把<b>焊盘的位置“开窗”</b>露出来。导线被盖住保护起来。"],
    ["丝印", "Silkscreen", "印上白色文字：位号 R1、C1、元件外框、Logo、你的名字……对应 Gerber 里的丝印层。"],
    ["表面处理", "Surface Finish", "裸露的铜焊盘很容易氧化，所以要“镀”一层保护：<b>喷锡、沉金或 OSP</b>（下单页「焊盘喷镀」那一项）。之后焊接更容易。"],
    ["成型", "Routing", "铣刀（锣机）沿着<b>板框</b>把每块板子从大板上切下来；如果是拼板，可能用 V 割留一点连接。你画的板框是什么形状，切出来就是什么形状。"],
    ["电测 / 检验", "E-Test", "用<b>飞针测试</b>检查每个网络有没有开路、短路（Gerber 包里那个 FlyingProbeTesting.json 就是给它用的），再人工外观检查、包装、发货。"],
  ];
  $$(".fab-widget").forEach((w) => {
    let s = 0, timer = null;
    w.innerHTML = `<div class="fab-steps"></div><svg class="w2-svg fab-svg" viewBox="0 0 640 230"></svg>
      <div class="w2-out fab-info"></div>
      <div class="fab-nav"><button type="button" class="f-prev">← 上一步</button><button type="button" class="f-play">▶ 自动播放</button><button type="button" class="f-next">下一步 →</button></div>`;
    FAB.forEach((f, i) => { const b = el("button", "", `${i + 1}. ${f[0]}`); b.type = "button"; b.addEventListener("click", () => { stop(); s = i; draw(); }); $(".fab-steps", w).appendChild(b); });
    const svg = $(".fab-svg", w);
    const keepT = [[80, 150], [190, 240], [280, 350], [440, 520]], keepB = [[120, 200], [280, 350], [420, 570]];
    const openT = [[80, 150], [280, 350], [440, 520]], openB = [[280, 350]];
    function draw() {
      const X0 = s >= 8 ? 40 : 14, X1 = s >= 8 ? 600 : 626;
      const etched = s >= 4, hole = s >= 1, plated = s >= 2;
      const cu = "#d9822b", cuD = "#b8661c";
      let g = "";
      g += `<rect x="${X0}" y="100" width="${X1 - X0}" height="50" fill="#e9d8a6" stroke="#c9b37a"/>`;
      const segs = (list, y, h, fill) => list.map(([a, b]) => `<rect x="${Math.max(a, X0)}" y="${y}" width="${Math.min(b, X1) - Math.max(a, X0)}" height="${h}" fill="${fill}"/>`).join("");
      if (!etched) { g += segs([[X0, X1]], 92, 8, cu) + segs([[X0, X1]], 150, 8, cu); }
      else { g += segs(keepT, 92, 8, cu) + segs(keepB, 150, 8, cu); }
      if (hole) {
        g += `<rect x="303" y="88" width="24" height="74" fill="#fcfcfd"/>`;
        if (plated) g += `<rect x="300" y="92" width="4" height="66" fill="${cuD}"/><rect x="326" y="92" width="4" height="66" fill="${cuD}"/>`;
      }
      if (s === 1) g += `<polygon points="306,10 324,10 324,60 315,78 306,60" fill="#adb5bd" stroke="#868e96"/><text x="336" y="40" font-size="12" fill="#495057">钻头</text>`;
      if (s === 3) {
        g += segs(keepT, 85, 7, "#4dabf7") + segs(keepB, 158, 7, "#4dabf7");
        for (let x = 60; x < 600; x += 40) g += `<line x1="${x}" y1="20" x2="${x}" y2="70" stroke="#9775fa" stroke-width="2" stroke-dasharray="4 4"/><polygon points="${x - 4},66 ${x + 4},66 ${x},74" fill="#9775fa"/>`;
        g += `<text x="20" y="16" font-size="12" fill="#7048e8">曝光（UV 光 / 激光）</text><text x="560" y="182" font-size="11" fill="#1971c2" text-anchor="end">蓝色 = 感光膜</text>`;
      }
      if (s === 4) g += `<text x="165" y="80" font-size="11" fill="#c92a2a">这里的铜被蚀刻掉了</text>`;
      if (s >= 5) {
        // 阻焊：覆盖除开窗外的地方
        const cover = (opens) => { const r = []; let x = X0; opens.forEach(([a, b]) => { if (a > x) r.push([x, a]); x = b; }); if (x < X1) r.push([x, X1]); return r; };
        g += segs(cover(openT), 84, 8, "#2f9e44") + segs(cover(openB), 158, 8, "#2f9e44");
        g += cover(openT).map(([a, b]) => keepT.filter(([c, d]) => c >= a && d <= b).map(([c, d]) => `<rect x="${c}" y="84" width="${d - c}" height="8" fill="#2b8a3e"/>`).join("")).join("");
      }
      if (s >= 6) g += `<rect x="372" y="78" width="44" height="6" fill="#fff" stroke="#dee2e6"/><text x="394" y="72" text-anchor="middle" font-size="11" fill="#868e96">丝印“R1”</text>`;
      if (s >= 7) g += segs(openT, 89, 3, "#e9c46a") + segs(openB, 158, 3, "#e9c46a") + (hole ? `<rect x="303" y="92" width="1.5" height="66" fill="#e9c46a"/><rect x="325.5" y="92" width="1.5" height="66" fill="#e9c46a"/>` : "");
      if (s === 8) g += `<line x1="40" y1="70" x2="40" y2="190" stroke="#f03e3e" stroke-dasharray="5 4" stroke-width="2"/><line x1="600" y1="70" x2="600" y2="190" stroke="#f03e3e" stroke-dasharray="5 4" stroke-width="2"/><text x="600" y="204" text-anchor="middle" font-size="11" fill="#f03e3e">沿板框切开</text>`;
      if (s === 9) g += `<line x1="115" y1="10" x2="115" y2="86" stroke="#495057" stroke-width="3"/><line x1="480" y1="10" x2="480" y2="86" stroke="#495057" stroke-width="3"/><path d="M115,14 Q300,-6 480,14" fill="none" stroke="#2f9e44" stroke-width="2"/><text x="298" y="22" text-anchor="middle" font-size="12" fill="#2f9e44">飞针：该通的通、不该通的不通 ✓</text>`;
      // 标注
      g += `<text x="${X0 + 4}" y="128" font-size="12" fill="#8a7542">FR-4 基材</text>`;
      g += `<text x="20" y="222" font-size="12" fill="#868e96">（剖面示意：中间是一个过孔，两边是焊盘和导线；厚度画得很夸张）</text>`;
      svg.innerHTML = g;
      $$(".fab-steps button", w).forEach((b, i) => { b.classList.toggle("on", i === s); b.classList.toggle("past", i < s); });
      $(".fab-info", w).innerHTML = `<h4>第 ${s + 1} 步：${FAB[s][0]} <small class="muted">${FAB[s][1]}</small></h4><p>${FAB[s][2]}</p>`;
    }
    const stop = () => { if (timer) { clearInterval(timer); timer = null; $(".f-play", w).textContent = "▶ 自动播放"; } };
    $(".f-prev", w).addEventListener("click", () => { stop(); s = Math.max(0, s - 1); draw(); });
    $(".f-next", w).addEventListener("click", () => { stop(); s = Math.min(FAB.length - 1, s + 1); draw(); });
    $(".f-play", w).addEventListener("click", (e) => {
      if (timer) { stop(); return; }
      if (s === FAB.length - 1) s = 0;
      e.target.textContent = "⏸ 暂停"; draw();
      timer = setInterval(() => { if (s >= FAB.length - 1) { stop(); return; } s++; draw(); }, 2600);
    });
    draw();
  });

  /* ============ 2.13 焊点对比 ============ */
  const BOARD = '<rect x="0" y="72" width="170" height="20" fill="#e9d8a6"/><rect x="0" y="68" width="170" height="4" fill="#2f9e44"/>';
  const PADT = (a, b) => `<rect x="${a}" y="66" width="${b - a}" height="6" fill="#d9822b"/>`;
  const LEAD = '<rect x="81" y="10" width="8" height="90" fill="#868e96"/>';
  const SOL = "#c8ccd0";
  const SJ = [
    ["good", "✓ 好焊点（直插）", BOARD + PADT(50, 120) + LEAD + `<path d="M50,67 Q76,63 81,26 L89,26 Q94,63 120,67 Z" fill="${SOL}" stroke="#adb5bd"/><path d="M60,64 Q78,58 82,34" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>`, "像一座小火山 / 圆锥，表面光亮平滑，焊锡铺满焊盘、顺着引脚爬上去。"],
    ["good", "✓ 好焊点（贴片）", BOARD + PADT(30, 62) + PADT(108, 140) + `<rect x="52" y="44" width="66" height="22" fill="#1f1f1f"/><rect x="52" y="44" width="12" height="22" fill="#c3c8ce"/><rect x="106" y="44" width="12" height="22" fill="#c3c8ce"/><path d="M32,67 Q46,64 52,48 L52,66 Z M138,67 Q124,64 118,48 L118,66 Z" fill="${SOL}" stroke="#adb5bd"/>`, "元件两端各有一个斜坡状的焊锡“鱼尾”，从焊盘平滑地爬到元件端头。"],
    ["bad", "✗ 锡太多（锡球）", BOARD + PADT(50, 120) + LEAD + `<ellipse cx="85" cy="48" rx="34" ry="24" fill="${SOL}" stroke="#adb5bd"/>`, "鼓成一个球，看不到引脚轮廓，里面可能根本没焊透。用吸锡带吸掉多余的锡。"],
    ["bad", "✗ 锡太少", BOARD + PADT(50, 120) + LEAD + `<path d="M74,67 Q79,64 81,56 L89,56 Q91,64 96,67 Z" fill="${SOL}" stroke="#adb5bd"/>`, "只有引脚根部一点点，焊盘大部分露在外面，容易一碰就断。补一点锡重焊。"],
    ["bad", "✗ 冷焊 / 虚焊", BOARD + PADT(50, 120) + LEAD + `<path d="M58,60 Q64,44 81,40 L89,40 Q104,46 112,60 L106,62 L98,58 L88,63 L76,58 L66,63 Z" fill="#9aa0a6" stroke="#6c757d"/><circle cx="72" cy="52" r="2" fill="#6c757d"/><circle cx="96" cy="50" r="2" fill="#6c757d"/><circle cx="86" cy="56" r="1.5" fill="#6c757d"/>`, "表面发灰、粗糙、像豆腐渣，焊锡和焊盘之间没有真正熔合。原因多是温度不够或焊接时晃动。加助焊剂重新加热。"],
    ["bad", "✗ 连锡（桥连）", BOARD + PADT(28, 70) + PADT(100, 142) + '<rect x="45" y="10" width="8" height="90" fill="#868e96"/><rect x="117" y="10" width="8" height="90" fill="#868e96"/>' + `<path d="M28,67 Q40,40 49,36 Q85,30 121,36 Q130,40 142,67 Z" fill="${SOL}" stroke="#adb5bd"/>`, "相邻两个引脚被焊锡连在一起 = 短路！芯片引脚密时最常见。加助焊剂后用烙铁拖开，或用吸锡带吸掉。"],
    ["bad", "✗ 立碑", BOARD + PADT(30, 62) + PADT(108, 140) + `<g transform="rotate(-62 112 66)"><rect x="52" y="44" width="66" height="22" fill="#1f1f1f"/><rect x="52" y="44" width="12" height="22" fill="#c3c8ce"/><rect x="106" y="44" width="12" height="22" fill="#c3c8ce"/></g><path d="M104,67 Q112,62 118,56 L132,67 Z" fill="${SOL}" stroke="#adb5bd"/>`, "贴片元件一端翘起来“站”着，另一端没焊上。两端焊盘受热不均或锡量不一致导致。用烙铁加热翘起那端压平重焊。"],
  ];
  $$(".joint-widget").forEach((w) => {
    w.innerHTML = `<div class="sj-grid">${SJ.map(([c, t, g, d]) => `<div class="sj-card ${c}"><h4>${t}</h4><svg viewBox="0 0 170 100">${g}</svg><p>${d}</p></div>`).join("")}</div>`;
  });

  /* ============ 2.14 规格书标注示例 ============ */
  const DS = [
    { b: [14, 40, 332, 74], t: "① 首页：型号与特性 Features", d: "第一页告诉你：这是什么芯片、一句话用途、主要特性（工作电压范围、关键性能指标、有哪些封装）。<b>先看这一页，判断“它能不能用在我的电路里”</b>：比如电源是 5 V，就看它的电压范围包不包括 5 V。" },
    { b: [14, 122, 160, 138], t: "② 引脚图与引脚功能表 Pin Configuration and Functions", d: "画着芯片的俯视图和每只脚的编号、名字、作用。<b>俯视图（Top View）里，1 号脚旁边有圆点或缺口，编号逆时针排</b>。NE555 的 SOIC-8：1 GND、2 TRIG、3 OUT、4 RESET、5 CONT、6 THRES、7 DISCH、8 VCC。画原理图符号、检查封装时都要对照它。" },
    { b: [186, 122, 160, 138], t: "③ 典型应用电路 Typical Application", d: "厂家给出的“标准用法”电路，<b>照着画基本不会错</b>。案例 A 的 555 无稳态（自激振荡）电路和 f ≈ 1.44 / ((R1 + 2R2)·C) 公式，就来自规格书的应用章节。" },
    { b: [14, 268, 332, 52], t: "④ 绝对最大额定值 Absolute Maximum Ratings", d: "<b>不能超过的极限</b>，超过就可能永久损坏。注意：这不是“正常工作”的数值，设计时要离它远一点。" },
    { b: [14, 326, 332, 46], t: "⑤ 推荐工作条件 Recommended Operating Conditions", d: "<b>正常工作</b>时该在的范围。设计按这里来。例如 TI 的 NE555 推荐电源电压 4.5 V ~ 16 V，所以案例 A 用 USB 的 5 V 没问题。" },
    { b: [14, 378, 332, 46], t: "⑥ 电气特性 Electrical Characteristics", d: "一张大表：每个参数有最小值 / 典型值 / 最大值和测试条件。新手主要看自己关心的几项（比如输出能给多大电流、静态电流多少），<b>设计时按最差情况（min / max）算，而不是典型值</b>。" },
    { b: [14, 430, 332, 30], t: "⑦ 封装信息 / 机械尺寸 Package / Mechanical Data", d: "最后几页：封装的精确尺寸图、推荐焊盘（Land Pattern）、编带信息。用来核对 EDA 里的封装对不对——<b>用立创商城现成的器件时一般已经帮你对好了</b>，自己画封装时才需要逐个尺寸核对。" },
    { b: [226, 6, 120, 28], t: "⑧ 订购信息 Ordering Information", d: "同一颗芯片有很多“后缀”：不同封装、温度等级、包装方式。比如 TI 的 NE555<b>D</b>R 里 D 表示 SOIC 封装、R 表示卷带包装；NE555<b>P</b> 是直插 DIP 封装。买错后缀，封装就对不上了。" },
  ];
  $$(".ds-widget").forEach((w) => {
    const lines = (x, y, n, wd) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 7}" width="${wd - (i % 3) * 18}" height="3" fill="#dee2e6"/>`).join("");
    const pin = (x, y, t, n, right) => right ? `<line x1="${x}" y1="${y}" x2="${x + 14}" y2="${y}" stroke="#495057" stroke-width="2"/><text x="${x + 18}" y="${y + 3}" font-size="8">${n} ${t}</text>` : `<line x1="${x - 14}" y1="${y}" x2="${x}" y2="${y}" stroke="#495057" stroke-width="2"/><text x="${x - 18}" y="${y + 3}" font-size="8" text-anchor="end">${t} ${n}</text>`;
    const page = `
      <rect x="0" y="0" width="360" height="470" fill="#fff"/>
      <rect x="0" y="0" width="360" height="4" fill="#c92a2a"/>
      <text x="14" y="24" font-size="15" font-weight="700" fill="#212529">NE555 精密定时器</text>
      <text x="230" y="18" font-size="7.5" fill="#868e96">NE555D / NE555DR / NE555P …</text>
      <text x="230" y="28" font-size="7.5" fill="#868e96">（示意页，不是真实规格书）</text>
      <text x="14" y="52" font-size="9" font-weight="700">1 特性 Features</text>${lines(14, 58, 4, 150)}
      <text x="186" y="52" font-size="9" font-weight="700">2 应用 Applications</text>${lines(186, 58, 3, 140)}
      <text x="14" y="104" font-size="9" font-weight="700">3 说明 Description</text>${lines(14, 108, 1, 320)}
      <text x="14" y="134" font-size="9" font-weight="700">引脚图（俯视）</text>
      <rect x="62" y="150" width="56" height="88" rx="3" fill="#343a40"/><circle cx="72" cy="160" r="3.5" fill="#868e96"/>
      ${pin(62, 162, "GND", 1)}${pin(62, 184, "TRIG", 2)}${pin(62, 206, "OUT", 3)}${pin(62, 228, "RESET", 4)}
      ${pin(118, 162, "VCC", 8, 1)}${pin(118, 184, "DISCH", 7, 1)}${pin(118, 206, "THRES", 6, 1)}${pin(118, 228, "CONT", 5, 1)}
      <text x="90" y="254" font-size="8" text-anchor="middle" fill="#868e96">D (SOIC-8) 封装 Top View</text>
      <text x="196" y="134" font-size="9" font-weight="700">典型应用：无稳态</text>
      <rect x="262" y="160" width="40" height="60" fill="#fff" stroke="#495057"/><text x="282" y="194" font-size="8" text-anchor="middle">555</text>
      <rect x="214" y="150" width="10" height="24" fill="#fff" stroke="#1c3f94"/><text x="210" y="166" font-size="7" text-anchor="end">RA</text>
      <rect x="214" y="182" width="10" height="24" fill="#fff" stroke="#1c3f94"/><text x="210" y="198" font-size="7" text-anchor="end">RB</text>
      <line x1="208" y1="222" x2="230" y2="222" stroke="#1c3f94" stroke-width="2"/><line x1="208" y1="227" x2="230" y2="227" stroke="#1c3f94" stroke-width="2"/><text x="204" y="228" font-size="7" text-anchor="end">C</text>
      <path d="M219,144 V150 M219,174 V182 M219,206 V222 M219,227 V240 M219,178 H262 M219,214 H262 M302,190 H322" stroke="#2f9e44" fill="none"/>
      <text x="326" y="193" font-size="7">OUT</text>
      <text x="196" y="254" font-size="7.5" fill="#495057">f ≈ 1.44 / ((RA + 2RB)·C)</text>
      <text x="14" y="282" font-size="9" font-weight="700">6.1 绝对最大额定值 Absolute Maximum Ratings</text>${lines(14, 290, 3, 320)}
      <text x="14" y="340" font-size="9" font-weight="700">6.3 推荐工作条件 Recommended Operating Conditions</text>${lines(14, 348, 3, 320)}
      <text x="14" y="392" font-size="9" font-weight="700">6.5 电气特性 Electrical Characteristics</text>
      <rect x="14" y="398" width="332" height="22" fill="none" stroke="#dee2e6"/><line x1="14" y1="405" x2="346" y2="405" stroke="#dee2e6"/><line x1="120" y1="398" x2="120" y2="420" stroke="#dee2e6"/><line x1="200" y1="398" x2="200" y2="420" stroke="#dee2e6"/><line x1="250" y1="398" x2="250" y2="420" stroke="#dee2e6"/><line x1="300" y1="398" x2="300" y2="420" stroke="#dee2e6"/>
      <text x="16" y="404" font-size="5.5" fill="#868e96">参数</text><text x="122" y="404" font-size="5.5" fill="#868e96">测试条件</text><text x="202" y="404" font-size="5.5" fill="#868e96">MIN</text><text x="252" y="404" font-size="5.5" fill="#868e96">TYP</text><text x="302" y="404" font-size="5.5" fill="#868e96">MAX</text>
      <text x="14" y="442" font-size="9" font-weight="700">11 机械尺寸 Mechanical Data</text>
      <rect x="200" y="434" width="40" height="22" fill="none" stroke="#495057"/><line x1="200" y1="462" x2="240" y2="462" stroke="#495057" stroke-width=".8"/><text x="220" y="469" font-size="6" text-anchor="middle">4.9 mm</text>`;
    w.innerHTML = `<div class="ds-list w2-btns"></div><div class="ds-grid"><svg class="w2-svg ds-page" viewBox="0 0 360 470">${page}
      ${DS.map((d, i) => `<rect class="ds-blk" data-i="${i}" x="${d.b[0] - 4}" y="${d.b[1] - 4}" width="${d.b[2] + 8}" height="${d.b[3] + 8}" rx="4"/>`).join("")}
      ${DS.map((d, i) => `<g class="ds-co" data-i="${i}"><circle cx="${d.b[0] + d.b[2] - 2}" cy="${d.b[1] + 2}" r="9"/><text x="${d.b[0] + d.b[2] - 2}" y="${d.b[1] + 6}" text-anchor="middle">${i + 1}</text></g>`).join("")}
      </svg><div class="ds-info"></div></div>`;
    DS.forEach((d, i) => { const b = el("button", "", d.t.replace(/^.\s/, "").split(" ")[0]); b.type = "button"; b.dataset.i = i; $(".ds-list", w).appendChild(b); });
    const show = (i) => {
      $$(".ds-co", w).forEach((g) => g.classList.toggle("on", +g.dataset.i === i));
      $$(".ds-blk", w).forEach((g) => g.classList.toggle("on", +g.dataset.i === i));
      $$(".ds-list button", w).forEach((g) => g.classList.toggle("on", +g.dataset.i === i));
      $(".ds-info", w).innerHTML = `<h4>${DS[i].t}</h4><p>${DS[i].d}</p>`;
    };
    $$(".ds-co, .ds-blk, .ds-list button", w).forEach((g) => g.addEventListener("click", () => show(+g.dataset.i)));
    $$(".ds-blk", w).forEach((g) => (g.style.cursor = "pointer"));
    show(1);
  });

  /* ============ 2.15 术语表 ============ */
  const GL = [
    // [中文, 英文/缩写, 分类, 解释, 链接]
    ["电压", "Voltage, V", "电学", "两点之间的“电压力差”，像水压。单位伏特 V。USB 是 5 V，ESP32-C3 用 3.3 V。", "ch2/1"],
    ["电流", "Current, I", "电学", "单位时间流过的电量，像水流量。单位安培 A，常用 mA（毫安）。", "ch2/1"],
    ["电阻", "Resistance / Resistor, R", "电学", "对电流的阻碍，像细水管；也指专门提供电阻的元件。单位欧姆 Ω。", "ch2/1"],
    ["欧姆定律", "Ohm's Law", "电学", "I = V / R：电压一定，电阻越大电流越小。", "ch2/1"],
    ["功率", "Power, P", "电学", "P = V × I，单位瓦特 W。电阻上的功率会变成热。", "ch2/1"],
    ["直流", "DC", "电学", "方向不变的电，电池、USB 供电都是直流。PCB 小作品基本都用直流。", "ch2/2"],
    ["交流", "AC", "电学", "方向来回变化的电，墙上插座的 220 V 市电是交流。新手不要碰。", "ch2/2"],
    ["地", "Ground, GND", "电学", "电路里电压的 0 参考点，所有电流最终回到这里。", "ch2/2"],
    ["共地", "Common Ground", "电学", "两个电路板（或模块）之间要通信，GND 必须连在一起，否则“高低电平”没有共同的参考。", "ch2/2"],
    ["稳压器 / LDO", "LDO Regulator", "元件", "把较高的电压稳定地降到较低的电压。案例 B 的 AMS1117-3.3 把 5 V 降成 3.3 V。", "ch2/2"],
    ["串联", "Series", "电学", "元件首尾相接排成一串，流过的电流相同，电压被分掉。", "ch2/3"],
    ["并联", "Parallel", "电学", "元件两端分别接在一起，电压相同，电流被分掉。", "ch2/3"],
    ["分压", "Voltage Divider", "电学", "两个电阻串联，中间点得到按比例的电压：Vout = Vin × R2 / (R1 + R2)。", "ch2/3"],
    ["限流电阻", "Current-limiting Resistor", "元件", "和 LED 串联、限制电流的电阻：R = (Vs − Vf) / If。案例 A 用 330 Ω。", "ch2/4"],
    ["电容", "Capacitor, C", "元件", "能存一点电的“小水缸”，用来滤波、去耦、定时。单位法拉 F，常用 µF、nF、pF。", "ch2/4"],
    ["去耦电容", "Decoupling Capacitor", "元件", "放在芯片电源脚旁边的小电容（常用 100 nF），给芯片就近“供水”、吸收噪声。案例 A 的 C3。", "ch2/4"],
    ["电解电容", "Electrolytic Capacitor", "元件", "容量大、有正负极的电容，接反会损坏甚至鼓包。", "ch2/4"],
    ["陶瓷电容 / MLCC", "MLCC", "元件", "多层陶瓷电容，贴片最常见、无极性。", "ch2/4"],
    ["耐压", "Voltage Rating", "元件", "电容能长期承受的最高电压，选的时候要比实际电压高一截。", "ch2/4"],
    ["电感", "Inductor, L", "元件", "线圈，阻碍电流变化，常用在开关电源和滤波里。", "ch2/4"],
    ["二极管", "Diode, D", "元件", "电流只能单向通过的“单向阀”，有正向压降（硅二极管约 0.6~1 V）。", "ch2/4"],
    ["发光二极管", "LED", "元件", "会发光的二极管，有正极（A）负极（K），必须串电阻限流。", "ch2/4"],
    ["正向压降", "Forward Voltage, Vf", "元件", "二极管 / LED 导通时两端的电压。红色 LED 约 2 V，白色约 3 V（以规格书为准）。", "ch2/4"],
    ["三极管", "BJT / Transistor, Q", "元件", "小电流控制大电流的电子开关 / 放大器，有 NPN、PNP 两种。", "ch2/4"],
    ["MOS 管", "MOSFET, Q", "元件", "用电压控制的电子开关，常用来开关电机、灯带等大电流负载。", "ch2/4"],
    ["晶振", "Crystal, Y / X", "元件", "给芯片提供精准“节拍”的元件。ESP32-C3 模组内部已经带了。", "ch2/4"],
    ["轻触按键", "Tactile Switch, SW", "元件", "按下导通、松开断开的小按键。案例 B 的 RESET、BOOT 键。", "ch2/4"],
    ["连接器", "Connector, J / P / USB", "元件", "接线用的插座、排针、USB 口等。", "ch2/4"],
    ["排针", "Pin Header", "元件", "一排金属针，间距常为 2.54 mm。案例 B 的 J1。", "ch2/4"],
    ["集成电路 / 芯片", "IC, U", "元件", "把很多电路做在一小块硅片上的元件，如 NE555、ESP32-C3。", "ch2/4"],
    ["色环", "Color Code", "元件", "直插电阻上用颜色环表示阻值。", "ch2/4"],
    ["阻值精度", "Tolerance", "元件", "实际阻值与标称值的允许误差，如 ±1%、±5%。", "ch2/4"],
    ["封装", "Package / Footprint", "PCB", "元件的外形规格（如 0603、SOIC-8），以及它在 PCB 上对应的焊盘图形。", "ch2/5"],
    ["直插", "THT / Through-Hole", "PCB", "引脚穿过板子上的孔焊接的元件。", "ch2/5"],
    ["贴片", "SMD / SMT", "PCB", "贴在板子表面焊接的元件（SMD），以及这种装配工艺（SMT）。", "ch2/5"],
    ["0603 / 0805 / 1206", "Chip size code", "PCB", "贴片阻容的英制尺寸代号：0603 = 1.6 × 0.8 mm，0805 = 2.0 × 1.25 mm，1206 = 3.2 × 1.6 mm。", "ch2/5"],
    ["SOT-23", "SOT-23", "PCB", "常见的三脚小封装，三极管 / MOS 管 / 小稳压器常用。", "ch2/5"],
    ["SOP / SOIC", "Small Outline Package", "PCB", "两侧伸出“鸥翼”脚的芯片封装，脚距 1.27 mm。NE555DR 是 SOIC-8。", "ch2/5"],
    ["QFN", "Quad Flat No-lead", "PCB", "四边焊盘在底部、没有伸出的脚，中间常有散热焊盘。手焊困难。", "ch2/5"],
    ["BGA", "Ball Grid Array", "PCB", "底部是一个个锡球的封装，只能机器焊接。", "ch2/5"],
    ["mil", "mil (thou)", "PCB", "千分之一英寸，1 mil = 0.0254 mm。嘉立创EDA PCB 默认单位。", "ch2/5"],
    ["引脚间距", "Pitch", "PCB", "相邻两个引脚中心的距离，如 0.5 mm、1.27 mm、2.54 mm。", "ch2/5"],
    ["原理图", "Schematic", "原理图", "用符号和连线表示“谁和谁相连”的图，不管真实大小和位置。", "ch2/6"],
    ["符号", "Symbol", "原理图", "元件在原理图里的样子。", "ch2/6"],
    ["位号", "Designator / Reference", "原理图", "元件的编号，如 R1、C3、U1、LED2。字母表示种类，数字区分个体。", "ch2/6"],
    ["引脚编号", "Pin Number", "原理图", "引脚的序号（1、2、3…），和封装上的焊盘编号一一对应。", "ch2/6"],
    ["网络", "Net", "原理图", "连在一起的所有引脚的集合，网络里各点电压相同。", "ch2/6"],
    ["网络标签", "Net Label", "原理图", "给网络起的名字，名字相同的地方自动相连。", "ch2/6"],
    ["连接点", "Junction", "原理图", "导线交汇处的实心圆点，表示真的连在一起。", "ch2/6"],
    ["非连接标识", "No Connect, NC", "原理图", "打在不用的引脚上的小叉，告诉 DRC“这只脚故意不接”。", "ch2/6"],
    ["网表", "Netlist", "原理图", "列出所有网络及其连接的引脚的清单，原理图转 PCB 靠它。", "ch2/6"],
    ["高电平 / 低电平", "High / Low", "数字", "数字信号的两种状态：接近电源电压为高（1），接近 0 V 为低（0）。", "ch2/7"],
    ["逻辑电平", "Logic Level", "数字", "芯片认定高低电平的电压范围，如 3.3 V 逻辑、5 V 逻辑。", "ch2/7"],
    ["上拉电阻", "Pull-up Resistor", "数字", "把引脚通过电阻接到电源，没有别的驱动时默认读到高电平。", "ch2/7"],
    ["下拉电阻", "Pull-down Resistor", "数字", "把引脚通过电阻接到 GND，默认读到低电平。", "ch2/7"],
    ["悬空", "Floating", "数字", "输入引脚什么都没接，电压不确定，读数乱跳。", "ch2/7"],
    ["时钟", "Clock", "数字", "有规律的方波节拍，数字电路按它的节奏工作。", "ch2/7"],
    ["单片机", "MCU, Microcontroller", "单片机", "把处理器、存储器、输入输出做在一颗芯片里的“小电脑”。", "ch2/8"],
    ["GPIO", "General Purpose I/O", "单片机", "通用输入输出引脚，程序可以让它输出高低电平或读取外部信号。", "ch2/8"],
    ["烧录", "Flashing / Programming", "单片机", "把编译好的程序写进芯片的 Flash 存储器里。", "ch2/8"],
    ["串口", "UART", "单片机", "最常用的两线通信方式（TX 发、RX 收），调试打印、下载程序都用它。", "ch2/8"],
    ["模组", "Module", "单片机", "把芯片、Flash、晶振、天线等做好的小板子，如 ESP32-C3-MINI-1，直接焊上就能用。", "ch2/8"],
    ["PCB", "Printed Circuit Board", "PCB", "印制电路板：在绝缘板上用铜箔做出导线的板子。", "ch2/9"],
    ["铜箔 / 铜层", "Copper Layer", "PCB", "PCB 上导电的那一层铜，导线、焊盘、铺铜都在铜层上。", "ch2/9"],
    ["基材", "Substrate, FR-4", "PCB", "PCB 中间的绝缘硬板，常用玻璃纤维 + 环氧树脂的 FR-4。", "ch2/9"],
    ["焊盘", "Pad", "PCB", "PCB 上用来焊接元件引脚的铜块。", "ch2/9"],
    ["过孔", "Via", "PCB", "连接不同铜层的金属化小孔，像层与层之间的“电梯”。", "ch2/9"],
    ["阻焊", "Solder Mask", "PCB", "盖在铜上的保护油墨（绿油），焊盘处开窗。", "ch2/9"],
    ["丝印", "Silkscreen / Legend", "PCB", "印在板子上的文字和图案，如位号、Logo。", "ch2/9"],
    ["板厚", "Board Thickness", "PCB", "整块 PCB 的厚度，最常用 1.6 mm。", "ch2/9"],
    ["铜厚", "Copper Weight, oz", "PCB", "铜箔厚度，用盎司 oz 表示：1 oz ≈ 35 µm。", "ch2/9"],
    ["多层板", "Multilayer PCB", "PCB", "四层及以上的 PCB，内部还有铜层，常用来做完整的地平面和电源层。", "ch2/9"],
    ["层叠", "Stack-up", "PCB", "PCB 各层从上到下的排列和厚度。", "ch2/9"],
    ["导线 / 走线", "Track / Trace", "PCB", "PCB 上连接焊盘的铜线。", "ch2/10"],
    ["线宽", "Track Width", "PCB", "导线的宽度，决定能过多大电流。嘉立创EDA 默认 0.254 mm（10 mil）。", "ch2/10"],
    ["安全间距", "Clearance", "PCB", "不同网络的铜之间的最小距离，嘉立创默认规则多为 0.152 mm（6 mil）。", "ch2/10"],
    ["铺铜", "Copper Pour", "PCB", "把空白区域填满铜并接到某个网络（通常是 GND）。", "ch2/10"],
    ["地平面", "Ground Plane", "PCB", "大面积的 GND 铜，给信号提供回流路径、降低干扰。", "ch2/10"],
    ["DRC", "Design Rule Check", "软件", "设计规则检查：自动找出间距不够、没连上等问题。", "ch2/10"],
    ["飞线", "Ratsnest", "软件", "PCB 里表示“这两点应该连但还没连”的细线。", "ch2/9"],
    ["板框", "Board Outline", "PCB", "板子的外形轮廓，工厂沿它切割。", "ch2/11"],
    ["蚀刻", "Etching", "制造", "用药水腐蚀掉不需要的铜，留下导线和焊盘。", "ch2/11"],
    ["沉铜", "PTH, Plated Through Hole", "制造", "让孔壁镀上铜，使孔变成导电的金属化孔。", "ch2/11"],
    ["表面处理", "Surface Finish", "制造", "焊盘上的保护镀层：喷锡（HASL）、沉金（ENIG）、OSP 等。", "ch2/11"],
    ["飞针测试", "Flying Probe Test", "制造", "用移动的探针检测每个网络有没有开路或短路。", "ch2/11"],
    ["拼板", "Panelization", "制造", "把多块小板拼成一大块生产或贴片，用 V 割或邮票孔连接。", "ch2/11"],
    ["Gerber", "Gerber (RS-274X)", "制造", "PCB 行业通用的制造文件格式，每层一个文件，像每层的“底片”。", "ch2/12"],
    ["钻孔文件", "Drill File, .DRL", "制造", "告诉钻床在哪里打多大孔的文件。", "ch2/12"],
    ["BOM", "Bill of Materials", "制造", "物料清单：用了哪些元件、各多少个、型号和编号。", "ch2/12"],
    ["坐标文件", "CPL / Pick and Place", "制造", "每个贴片元件的位置、角度和所在面，贴片机靠它放元件。", "ch2/12"],
    ["钢网", "Stencil", "制造", "开了孔的薄钢片，用来往焊盘上刷锡膏，对应锡膏层。", "ch2/12"],
    ["锡膏", "Solder Paste", "制造", "锡粉和助焊剂混成的膏，SMT 贴片前刷到焊盘上。", "ch2/13"],
    ["回流焊", "Reflow Soldering", "制造", "把刷好锡膏、贴好元件的板子过一遍加热炉，锡膏熔化完成焊接。", "ch2/13"],
    ["PCBA", "PCB Assembly", "制造", "焊好元件的电路板（光板叫 PCB）。", "ch2/13"],
    ["基础库 / 扩展库", "Basic / Extended Parts", "制造", "嘉立创 SMT 的元件分类：基础库常备便宜，扩展库需要临时上料、通常多收费。", "ch2/13"],
    ["助焊剂", "Flux", "制造", "帮助焊锡流动、去除氧化层的化学品，手焊必备。", "ch2/13"],
    ["连锡", "Solder Bridge", "制造", "相邻引脚被焊锡连在一起，造成短路。", "ch2/13"],
    ["虚焊 / 冷焊", "Cold Joint", "制造", "看起来焊上了，其实没熔合好，时通时断。", "ch2/13"],
    ["规格书 / 数据手册", "Datasheet", "其他", "厂家发布的元件说明书：引脚、参数、典型电路、封装尺寸。", "ch2/14"],
    ["绝对最大额定值", "Absolute Maximum Ratings", "其他", "元件能承受的极限，超过可能损坏，不是正常工作值。", "ch2/14"],
    ["典型应用电路", "Typical Application", "其他", "规格书里厂家推荐的标准接法，照着画最稳。", "ch2/14"],
    ["C 编号", "LCSC Part Number", "软件", "立创商城的商品编号（如 C7593），搜索元件最准确。", "ch1/a2"],
    ["器件", "Device", "软件", "嘉立创EDA 里把符号 + 封装 + 3D 模型 + 属性打包在一起的“元件”。", "ch1/a2"],
  ];
  $$(".gloss-widget").forEach((w) => {
    const cats = ["全部"].concat([...new Set(GL.map((g) => g[2]))]);
    let cat = "全部";
    w.innerHTML = `<div class="gl-bar"><input type="search" class="gl-q" placeholder="搜索中文、英文或解释，例如 过孔、via、GND"><span class="gl-cnt"></span></div>
      <div class="w2-btns gl-cats"></div>
      <table class="gl-table"><thead><tr><th>术语</th><th>英文 / 缩写</th><th>分类</th><th>大白话解释</th></tr></thead><tbody></tbody></table>`;
    cats.forEach((c) => { const b = el("button", c === cat ? "on" : "", c); b.type = "button"; b.addEventListener("click", () => { cat = c; $$(".gl-cats button", w).forEach((x) => x.classList.toggle("on", x === b)); render(); }); $(".gl-cats", w).appendChild(b); });
    const q = $(".gl-q", w), tb = $("tbody", w);
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const mk = (s, k) => { if (!k) return s; const i = s.toLowerCase().indexOf(k); return i < 0 ? s : s.slice(0, i) + "<mark>" + s.slice(i, i + k.length) + "</mark>" + s.slice(i + k.length); };
    function render() {
      const k = q.value.trim().toLowerCase();
      const rows = GL.filter((g) => (cat === "全部" || g[2] === cat) && (!k || (g[0] + " " + g[1] + " " + g[3]).toLowerCase().includes(k)));
      tb.innerHTML = rows.map((g) => `<tr><td>${mk(esc(g[0]), k)}</td><td>${mk(esc(g[1]), k)}</td><td>${g[2]}</td><td>${mk(esc(g[3]), k)} <a href="${ROOT}${g[4]}.html" class="small">→ ${g[4].startsWith("ch2/") ? g[4].replace("ch2/", "2.") : "A-2"}</a></td></tr>`).join("") ||
        '<tr><td colspan="4" class="muted">没有找到。换个关键词，或者用页面顶部的全站搜索（' + ((window.ZW_OS && window.ZW_OS.get() === 'win') ? 'Ctrl+K' : '⌘K') + '）。</td></tr>';
      $(".gl-cnt", w).textContent = `共 ${rows.length} / ${GL.length} 条`;
    }
    q.addEventListener("input", render);
    render();
  });
})();
