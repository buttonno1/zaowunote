/* 1.2 拉伸选项实验台：点选项 → 左边是 Fusion 实际算出的结果，右边是对话框里的设置 */
(function () {
  const R = document.body.dataset.root + "img/ch1/";
  const CASES = [
    { g: "基本", k: "d20", b: "一侧 20 mm", img: "vp-ext-d20", dlg: "ext-v-d20",
      t: "最普通的拉伸：从草图所在的平面开始，往一个方向长 20 mm。草图（浅蓝色）在方块的底面。" },
    { g: "基本", k: "neg20", b: "距离填 −20", img: "vp-ext-neg20", dlg: "ext-v-neg20",
      t: "距离填负数，就往反方向长。草图跑到了方块的<b>顶面</b>，方块长在了草图下面。也可以在画布上把箭头往下拖。" },
    { g: "开始", k: "offset", b: "偏移 10 mm", img: "vp-ext-offset", dlg: "ext-v-offset",
      t: "「开始」选「偏移」：先离开草图 10 mm，再开始长 20 mm。方块和草图之间空了一段，像悬在空中。" },
    { g: "方向", k: "two", b: "两侧 20 / 8", img: "vp-ext-two", dlg: "ext-v-twosides",
      t: "「方向」选「两侧」：往上、往下各长一段，两边距离可以不一样（这里上 20、下 8）。对话框会分成「侧 1」「侧 2」两组。" },
    { g: "方向", k: "sym", b: "对称 20 mm", img: "vp-ext-sym", dlg: "ext-v-symmetric",
      t: "「方向」选「对称」：上下长得一样多，草图正好在中间。「测量」决定填的 20 是<b>一半</b>还是<b>全长</b>，这张图选的是全长（上下各 10）。" },
    { g: "扫掠斜角", k: "taper15", b: "+15°", img: "vp-ext-taper15", dlg: "ext-v-taper15",
      t: "「扫掠斜角」填正数，侧壁一边长一边<b>往外张</b>，越往上越大。（实测：Fusion 2705 里正值往外。）" },
    { g: "扫掠斜角", k: "taperm10", b: "−10°", img: "vp-ext-taperm10", dlg: "ext-v-taperm10",
      t: "填负数，侧壁<b>往里收</b>，越往上越小，像个梯形台。做模具、做容易脱模的零件时会用到这种“斜度”。" },
    { g: "类型", k: "thin", b: "薄拉伸 2 mm", img: "vp-ext-thin", dlg: "ext-v-thin",
      t: "「类型」选第二个图标（薄拉伸）：只沿着轮廓的边长出一圈 2 mm 厚的墙，中间是空的。一步就能做出一个没有底的框。" },
  ];
  const OPS = [
    { k: "before", b: "操作之前", img: "vp-op-before", t: "已经有一个方块（实体 1）。在底面又画了一个圆（浅蓝色），圆有一半压在方块里。现在把这个圆拉伸 30 mm，「操作」选不同的选项，结果完全不同：" },
    { k: "new", b: "新建实体", img: "vp-op-new", t: "<b>新建实体</b>：圆柱是一个<b>新的、独立的</b>实体（这里涂成蓝色好区分），和方块互不相干，浏览器里会出现“实体 1”“实体 2”两个。" },
    { k: "join", b: "合并", img: "vp-op-join", t: "<b>合并</b>：圆柱和方块<b>粘成一个</b>实体。以后选它、移动它，都是一整块。" },
    { k: "cut", b: "剪切", img: "vp-op-cut", t: "<b>剪切</b>：用圆柱从方块上<b>挖掉</b>重叠的部分，圆柱本身不留下。打孔、开槽、刻字都用它。" },
    { k: "intersect", b: "相交", img: "vp-op-intersect", t: "<b>相交</b>：<b>只保留</b>圆柱和方块重叠的那部分，其余全部去掉。" },
  ];
  function css() {
    if (document.getElementById("ext-lab-css")) return;
    const s = document.createElement("style"); s.id = "ext-lab-css";
    s.textContent = `
.ext-lab .grp{display:flex;flex-wrap:wrap;gap:6px 14px;margin-bottom:10px}
.ext-lab .grp>div{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ext-lab .grp b.gl{font-size:13px;color:var(--c-muted,#777);font-weight:600}
.ext-lab button{border:1px solid #cfd6de;background:#fff;border-radius:6px;padding:4px 10px;font-size:13px;cursor:pointer}
.ext-lab button.on{background:#0b6bcb;color:#fff;border-color:#0b6bcb}
.ext-lab .stage{display:grid;grid-template-columns:1fr 230px;gap:12px;align-items:start}
.ext-lab .stage.nodlg{grid-template-columns:1fr}
.ext-lab .stage img{width:100%;border:1px solid #e4e7eb;border-radius:8px;background:#fff}
.ext-lab .desc{margin-top:8px;font-size:14.5px;line-height:1.7;min-height:3.4em}
@media (max-width:700px){.ext-lab .stage{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  function make(el, cases, groups, withDlg) {
    el.classList.add("ext-lab");
    const grp = document.createElement("div"); grp.className = "grp";
    const stage = document.createElement("div"); stage.className = "stage" + (withDlg ? "" : " nodlg");
    const img = document.createElement("img"); img.alt = "Fusion 中的结果";
    const dlg = document.createElement("img"); dlg.alt = "对话框设置";
    stage.appendChild(img); if (withDlg) stage.appendChild(dlg);
    const desc = document.createElement("div"); desc.className = "desc";
    const btns = [];
    const byG = {};
    cases.forEach((c) => { (byG[c.g || ""] = byG[c.g || ""] || []).push(c); });
    Object.keys(byG).forEach((g) => {
      const box = document.createElement("div");
      if (groups && g) { const l = document.createElement("b"); l.className = "gl"; l.textContent = g + "："; box.appendChild(l); }
      byG[g].forEach((c) => {
        const b = document.createElement("button"); b.type = "button"; b.innerHTML = c.b;
        b.addEventListener("click", () => show(c, b)); box.appendChild(b); btns.push([c, b]);
      });
      grp.appendChild(box);
    });
    function show(c, b) {
      btns.forEach(([, x]) => x.classList.toggle("on", x === b));
      img.src = R + c.img + ".png";
      if (withDlg) dlg.src = R + c.dlg + ".png";
      desc.innerHTML = c.t;
    }
    el.append(grp, stage, desc);
    show(btns[0][0], btns[0][1]);
  }
  css();
  document.querySelectorAll(".ext-lab-widget").forEach((el) => make(el, CASES, true, true));
  document.querySelectorAll(".ext-op-widget").forEach((el) => make(el, OPS, false, false));
})();
