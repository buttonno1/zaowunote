/* 第 0 章互动组件：流程地图、生态关系图、Mac 键盘、鼠标/触控板模拟画布 */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ROOT = document.body.dataset.root || "";

  /* ============ 0.1 流程地图 ============ */
  const FLOW = [
    { ico: "💡", name: "想法", who: "you", whoT: "你",
      what: "想清楚要做一个什么东西：它要实现什么功能？多大？用什么供电（电池、USB）？大概花多少钱？",
      out: "一段文字描述、手绘草图、元件清单的雏形", tool: "纸和笔，或者脑子", ch: "案例 A-0 / B-0 会示范怎么想" },
    { ico: "✏️", name: "画原理图", who: "you", whoT: "你（用 EDA）",
      what: "在软件里放上需要的元件（电阻、芯片、LED……），再用“导线”表示谁和谁连在一起。原理图只管“连接关系”，不管元件真实大小和位置。",
      out: "原理图（Schematic）", tool: "嘉立创EDA 原理图编辑器", ch: "案例 A-2；进阶模块 B" },
    { ico: "🧩", name: "画 PCB", who: "you", whoT: "你（用 EDA）",
      what: "把原理图“翻译”成真实的电路板：定板子的形状和大小、把元件摆到合适的位置、用铜线把该连的焊盘连起来。",
      out: "PCB 设计图", tool: "嘉立创EDA PCB 编辑器", ch: "案例 A-3 ~ A-9；进阶模块 D、E" },
    { ico: "📦", name: "导出制造文件", who: "you", whoT: "你（用 EDA）",
      what: "把设计导出成工厂看得懂的文件：Gerber（每一层的“底片”）、BOM（元件清单）、坐标文件（每个元件放在哪）。嘉立创EDA 也可以一键跳转下单，不用手动传文件。",
      out: "Gerber 压缩包、BOM 表、坐标文件", tool: "嘉立创EDA 导出 / 下单功能", ch: "案例 A-10；进阶模块 F" },
    { ico: "🏭", name: "工厂制板", who: "fab", whoT: "工厂",
      what: "PCB 工厂按照 Gerber 文件做出一块“光板”——有铜线、有孔、有丝印文字，但还没有焊元件。",
      out: "空白电路板（光板）", tool: "嘉立创等 PCB 工厂", ch: "第 2 章 2.11 工厂是怎么做 PCB 的" },
    { ico: "🔩", name: "贴片 / 焊接", who: "both", whoT: "工厂 或 你",
      what: "把元件固定并焊接到电路板上。可以下单时选“SMT 贴片”让工厂的机器帮你焊好；也可以买元件回来用电烙铁自己焊。",
      out: "焊好元件的电路板（PCBA）", tool: "工厂贴片机 / 电烙铁", ch: "案例 A-10、A-11；第 2 章 2.13" },
    { ico: "🔋", name: "测试调试", who: "you", whoT: "你",
      what: "通电看看能不能正常工作；不正常就排查问题，必要时回到“画原理图 / 画 PCB”修改，再做一版。工程师管这叫“迭代”。",
      out: "能用的作品 🎉（或者下一版的改进清单）", tool: "万用表、电脑、耐心", ch: "案例 A-11、B-5" },
  ];
  $$(".flow-widget").forEach((w) => {
    const flow = document.createElement("div");
    flow.className = "flow";
    FLOW.forEach((s, i) => {
      const d = document.createElement("div");
      d.className = "flow-step " + (s.who === "fab" ? "fab" : "you");
      d.innerHTML = `<span class="ico">${s.ico}</span><b>${i + 1}. ${s.name}</b><br><span class="who">${s.whoT}</span>`;
      d.addEventListener("click", () => show(i));
      d.addEventListener("mouseenter", () => show(i));
      flow.appendChild(d);
    });
    const det = document.createElement("div");
    det.className = "flow-detail";
    const leg = document.createElement("div");
    leg.className = "flow-legend";
    leg.innerHTML = '<span>🔵 蓝色标签：你在电脑上完成</span><span>🟠 橙色标签：工厂完成</span>';
    w.append(flow, leg, det);
    function show(i) {
      $$(".flow-step", flow).forEach((x, j) => x.classList.toggle("on", i === j));
      const s = FLOW[i];
      det.innerHTML = `<h4>${s.ico} 第 ${i + 1} 步：${s.name}</h4><div>${s.what}</div>
        <dl><dt>产出</dt><dd>${s.out}</dd><dt>用什么</dt><dd>${s.tool}</dd><dt>本教程</dt><dd>${s.ch}</dd></dl>`;
    }
    show(0);
  });

  /* ============ 0.2 生态关系图 ============ */
  $$(".eco-widget").forEach((w) => {
    const det = $(".eco-detail", w);
    const nodes = $$(".node", w);
    const show = (n) => {
      nodes.forEach((x) => x.classList.toggle("on", x === n));
      det.innerHTML = n.dataset.info;
    };
    nodes.forEach((n) => { n.addEventListener("click", () => show(n)); n.addEventListener("mouseenter", () => show(n)); });
    show(nodes.find((n) => n.classList.contains("center")) || nodes[0]);
  });

  /* ============ 0.4 Mac 键盘 ============ */
  const KEYS = {
    esc: ["esc", "Esc", "取消当前操作：比如正在放元件/画线时按一下就退出，弹窗也能用它关掉。"],
    f1: ["F1", "F1", "打开帮助教程。⚠️ Mac 顶排默认是亮度/音量键，要按 <kbd>fn</kbd> + <kbd>F1</kbd> 才是 F1（可在 系统设置 → 键盘 里改成默认 F 键）。"],
    f4: ["F4", "F4", "重复上一个动作。同样需要配合 <kbd>fn</kbd>。"],
    f11: ["F11", "F11", "编辑器里是“全屏”，但在 Mac 上 F11 默认被系统用来“显示桌面”。想全屏请用 Chrome 的 <kbd>⌃</kbd><kbd>⌘</kbd><kbd>F</kbd>。"],
    del: ["delete", "Backspace", "删除选中的对象（本教程实测：Mac 键盘上的 delete 键可以直接删除）。编辑器快捷键表里写的 “Delete” 是另一个键，在 Mac 上要按 <kbd>fn</kbd> + <kbd>delete</kbd>。"],
    tab: ["tab", "Tab", "放置元件、画线的过程中按 Tab，会弹出属性框，可以先改好参数（比如电阻值、线宽）再放下去。"],
    q: ["Q", "Q", "切换单位（mm ↔ mil ↔ inch），PCB 里常用。"],
    w: ["W", "W", "单独按没有功能；<kbd>⌥</kbd><kbd>W</kbd> = 画导线（原理图）/ 单路布线（PCB）。"],
    e: ["E", "E", "<kbd>⌥</kbd><kbd>E</kbd> = 画椭圆（原理图）/ 画铺铜区域（PCB）。"],
    r: ["R", "R", "<kbd>⌥</kbd><kbd>R</kbd> = 画矩形（本教程实测可用）。"],
    t: ["T", "T", "<kbd>⌥</kbd><kbd>T</kbd> = 放置文本。"],
    y: ["Y", "Y", "上下翻转选中的对象。<kbd>⌘</kbd><kbd>Y</kbd> = 重做（撤销了又想恢复）。"],
    lb: ["[", "[", "展开 / 收起左侧面板（屏幕小时很好用）。"],
    rb: ["]", "]", "展开 / 收起右侧面板。"],
    bs: ["\\", "\\", "展开 / 收起底部面板。"],
    caps: ["中/英", "—", "⚠️ 重要：编辑器里很多快捷键是单个字母（K、Q、X、Y、M……）。如果当前是中文输入法，按字母会被输入法吃掉、快捷键不起作用。用编辑器时请切到英文输入（Mac 默认按一下 caps lock 或 <kbd>⌃</kbd><kbd>空格</kbd> 切换）。"],
    a: ["A", "A", "<kbd>⌘</kbd><kbd>A</kbd> = 全选。"],
    s: ["S", "S", "<kbd>⌘</kbd><kbd>S</kbd> = 保存全部。养成随手 ⌘S 的习惯！"],
    d: ["D", "D", "<kbd>⌘</kbd><kbd>D</kbd> = 重复到光标位置。"],
    f: ["F", "F", "<kbd>⌘</kbd><kbd>F</kbd> = 查找替换；<kbd>⇧</kbd><kbd>F</kbd> = 放置器件。"],
    g: ["G", "G", "鼠标下有好几个东西叠在一起时，按 G 在它们之间切换选择；<kbd>⌘</kbd><kbd>G</kbd> = 组合。"],
    h: ["H", "H", "<kbd>⇧</kbd><kbd>H</kbd> = 高亮 / 取消高亮网络。⚠️ <kbd>⌘</kbd><kbd>H</kbd> 在 Mac 上会把浏览器窗口隐藏，别按。"],
    k: ["K", "K", "适应全部：一键把整张图缩放到刚好显示完整。迷路了就按 K！（本教程实测）"],
    l: ["L", "L", "PCB 布线时切换拐角样式（45° / 90° / 圆弧）。"],
    ret: ["return", "Enter", "完成 / 确认；选中对象时按回车可以展开属性直接修改。"],
    shift: ["shift", "Shift", "组合键用，比如 <kbd>⇧</kbd><kbd>N</kbd> = 新建工程。编辑器里写作 Shift，Mac 键帽符号是 ⇧。"],
    z: ["Z", "Z", "<kbd>⌘</kbd><kbd>Z</kbd> = 撤销（后悔药）。"],
    x: ["X", "X", "左右翻转选中的对象；<kbd>⌘</kbd><kbd>X</kbd> = 剪切。"],
    c: ["C", "C", "<kbd>⌘</kbd><kbd>C</kbd> = 复制。"],
    v: ["V", "V", "<kbd>⌘</kbd><kbd>V</kbd> = 粘贴。"],
    m: ["M", "M", "移动选中的对象（以中心为基准）。"],
    n: ["N", "N", "单击选择一整个网络（连在一起的所有导线）。"],
    up: ["↑", "Up", "有选中对象时：把对象往上挪一格；没有选中时：画布往上滚。<kbd>fn</kbd>+<kbd>↑</kbd> = Page Up（上一页）。"],
    fn: ["fn", "—", "Mac 特有的功能键：fn + ↑/↓ = Page Up/Down，fn + ←/→ = Home/End，fn + delete = Delete，fn + F1~F12 = 真正的 F 键。"],
    ctrl: ["control ⌃", "Ctrl", "编辑器里写作 Ctrl。注意 Mac 上大部分 Windows 的 Ctrl 快捷键都换成了 ⌘（Cmd）。⌃ 主要在“CTRL + 滚轮缩放”模式里用到。"],
    opt: ["option ⌥", "Alt", "编辑器里写作 Alt。画图工具大多是 ⌥ + 字母：⌥W 导线、⌥R 矩形、⌥T 文本……"],
    cmd: ["command ⌘", "Cmd", "编辑器里写作 Cmd，对应 Windows 的 Ctrl：⌘Z 撤销、⌘Y 重做、⌘C/⌘V 复制粘贴、⌘S 保存。"],
    space: ["空格", "Space", "旋转：选中元件或正在放置时按空格，元件转 90°。画线时按空格切换拐弯方向。"],
    left: ["←", "Left", "移动对象 / 滚动画布。"], down: ["↓", "Down", "移动对象 / 滚动画布。"], right: ["→", "Right", "移动对象 / 滚动画布。"],
  };
  const LAYOUT = [
    [["esc", 1.2], ["f1"], ["f4"], ["f11"], ["~gap"], ["del", 1.6]],
    [["tab", 1.5], ["q"], ["w"], ["e"], ["r"], ["t"], ["y"], ["~gap"], ["lb"], ["rb"], ["bs"]],
    [["caps", 1.8], ["a"], ["s"], ["d"], ["f"], ["g"], ["h"], ["~j"], ["k"], ["l"], ["~gap"], ["ret", 1.8]],
    [["shift", 2.3], ["z"], ["x"], ["c"], ["v"], ["~b"], ["n"], ["m"], ["~gap"], ["up"]],
    [["fn"], ["ctrl", 1.2], ["opt", 1.2], ["cmd", 1.5], ["space", 4.2], ["cmd", 1.5], ["opt", 1.2], ["~gap"], ["left"], ["down"], ["right"]],
  ];
  const WIN = {
    f1: ["F1", "F1", "打开帮助教程。"],
    f4: ["F4", "F4", "重复上一个动作。"],
    f11: ["F11", "F11", "编辑器的“全屏”。在 Windows 上可以直接按。"],
    del: ["Delete", "Delete", "删除选中的对象（编辑器快捷键表里写的就是 Delete）。"],
    caps: ["中/英", "—", "⚠️ 重要：编辑器里很多快捷键是单个字母（K、Q、X、Y、M……）。如果当前是中文输入法，按字母会被输入法吃掉、快捷键不起作用。用编辑器时请切到英文（Windows 自带的微软拼音按一下 Shift 切换）。"],
    h: ["H", "H", "<kbd>⇧</kbd><kbd>H</kbd> = 高亮 / 取消高亮网络。"],
    up: ["↑", "Up", "有选中对象时：把对象往上挪一格；没有选中时：画布往上滚。"],
    ret: ["Enter", "Enter", "完成 / 确认；选中对象时按回车可以展开属性直接修改。"],
    shift: ["Shift", "Shift", "组合键用，比如 Shift+N = 新建工程。"],
    ctrl: ["Ctrl", "Ctrl", "最常用的修饰键：Ctrl+Z 撤销、Ctrl+Y 重做、Ctrl+C / Ctrl+V 复制粘贴、Ctrl+S 保存。编辑器里写作 Ctrl。"],
    opt: ["Alt", "Alt", "画图工具大多是 Alt + 字母：Alt+W 导线、Alt+R 矩形、Alt+T 文本……"],
    win: ["Win", "—", "Windows 徽标键，编辑器里基本用不到。"],
  };
  const LAYOUT_WIN = [
    [["esc", 1.2], ["f1"], ["f4"], ["f11"], ["~gap"], ["del", 1.6]],
    [["tab", 1.5], ["q"], ["w"], ["e"], ["r"], ["t"], ["y"], ["~gap"], ["lb"], ["rb"], ["bs"]],
    [["caps", 1.8], ["a"], ["s"], ["d"], ["f"], ["g"], ["h"], ["~j"], ["k"], ["l"], ["~gap"], ["ret", 1.8]],
    [["shift", 2.3], ["z"], ["x"], ["c"], ["v"], ["~b"], ["n"], ["m"], ["~gap"], ["up"]],
    [["ctrl", 1.3], ["win", 1.1], ["opt", 1.2], ["space", 4.6], ["opt", 1.2], ["ctrl", 1.3], ["~gap"], ["left"], ["down"], ["right"]],
  ];
  $$(".mackb-widget").forEach((w) => {
    function render(os) {
      const isWin = os === "win";
      const K = (id) => (isWin && WIN[id]) || KEYS[id];
      w.innerHTML = "";
      const kb = document.createElement("div");
      kb.className = "mackb";
      const info = document.createElement("div");
      info.className = "kb-info";
      info.innerHTML = "👆 把鼠标移到键帽上（或点击），查看它叫什么、编辑器里怎么写、常用来做什么。<b>黄色</b>的键是本教程常用的。（当前显示：" + (isWin ? "Windows 键盘" : "Mac 键盘") + "，右上角可切换）";
      (isWin ? LAYOUT_WIN : LAYOUT).forEach((row) => {
        const r = document.createElement("div");
        r.className = "row";
        row.forEach(([id, wd]) => {
          if (id === "~gap") { const g = document.createElement("div"); g.className = "gap"; r.appendChild(g); return; }
          const k = document.createElement("div");
          k.className = "k";
          k.style.minWidth = (wd || 1) * 44 + "px";
          if (id.startsWith("~")) { k.classList.add("dim"); k.innerHTML = `<span></span><span class="s">${id.slice(1).toUpperCase()}</span>`; r.appendChild(k); return; }
          const d = K(id);
          const sym = isWin ? { ret: "↵", del: "", tab: "⇥", shift: "⇧" }[id] : { cmd: "⌘", opt: "⌥", ctrl: "⌃", shift: "⇧", ret: "↩", del: "⌫", tab: "⇥", fn: "🌐" }[id];
          k.innerHTML = sym ? `<span class="s">${sym}</span><span>${d[0].replace(/ [⌘⌥⌃]$/, "")}</span>` : `<span></span><span class="s">${d[0]}</span>`;
          if (["k", "del", "esc", "cmd", "opt", "space", "tab", "caps", isWin ? "ctrl" : "_"].includes(id)) k.classList.add("hot");
          const showK = () => {
            $$(".k", kb).forEach((x) => x.classList.remove("on"));
            k.classList.add("on");
            info.innerHTML = `<b>${d[0]}</b>　编辑器里写作：<code>${d[1]}</code><br>${d[2]}`;
          };
          k.addEventListener("mouseenter", showK);
          k.addEventListener("click", showK);
          r.appendChild(k);
        });
        kb.appendChild(r);
      });
      w.append(kb, info);
    }
    render(window.ZW_OS ? window.ZW_OS.get() : "mac");
    document.addEventListener("oschange", (e) => render(e.detail));
  });

  /* ============ 0.4 鼠标 / 触控板模拟画布 ============ */
  $$(".gsim-widget").forEach((w) => {
    const img = w.dataset.img;
    w.innerHTML = `
      <div class="gsim-bar">
        <span>编辑器设置「画布缩放」：</span>
        <label><input type="radio" name="gm" value="wheel" checked> 滚轮缩放（默认）</label>
        <label><input type="radio" name="gm" value="ctrl"> CTRL + 滚轮</label>
      </div>
      <div class="gsim-stage" tabindex="0">
        <div class="world"><img src="${img}" alt="示例 PCB"></div>
        <div class="toast"></div>
        <div class="hud"><span class="z">缩放 100%</span><span>在这里试试：滚轮 / 双指滑动 / 捏合 / 右键拖动 / 中键拖动 / 按 K</span></div>
      </div>
      <table class="gsim-table"><thead><tr><th>你的操作</th><th>效果（当前设置）</th></tr></thead><tbody></tbody></table>`;
    const stage = $(".gsim-stage", w), world = $(".world", w), toast = $(".toast", w), zt = $(".z", w), tb = $("tbody", w);
    let mode = "wheel", s = 1, tx = 0, ty = 0, tt;
    const ROWS = {
      wheel: [
        ["mouse", "🖱️ 鼠标滚轮上下滚", "缩放", "y"],
        ["vswipe", "✌️ 触控板双指上下滑", "缩放（很容易缩过头）", "y"],
        ["hswipe", "✌️ 触控板双指左右滑", "左右平移", "y"],
        ["pinch", "🤏 触控板双指捏合 / 张开", "上下平移 —— 不是缩放！", "n"],
        ["cmdwheel", "⌘ + 滚轮", "上下平移", ""],
        ["rdrag", "🖱️ 按住右键拖动", "平移画布", "y"],
        ["mdrag", "🖱️ 按住中键（滚轮）拖动", "平移画布", "y"],
        ["ldrag", "🖱️ 按住左键在空白处拖动", "框选（不会平移）", ""],
        ["k", "⌨️ 按 K", "适应全部（回到全图）", "y"],
      ],
      ctrl: [
        ["mouse", "🖱️ 鼠标滚轮上下滚", "上下平移", ""],
        ["vswipe", "✌️ 触控板双指上下滑", "上下平移", "y"],
        ["hswipe", "✌️ 触控板双指左右滑", "左右平移", "y"],
        ["pinch", "🤏 触控板双指捏合 / 张开", "缩放 —— 和看照片一样自然", "y"],
        ["cmdwheel", "⌘ + 滚轮", "缩放", "y"],
        ["rdrag", "🖱️ 按住右键拖动", "平移画布", "y"],
        ["mdrag", "🖱️ 按住中键（滚轮）拖动", "平移画布", "y"],
        ["ldrag", "🖱️ 按住左键在空白处拖动", "框选（不会平移）", ""],
        ["k", "⌨️ 按 K", "适应全部（回到全图）", "y"],
      ],
    };
    function table(cur) {
      const cs = [].concat(cur || []);
      tb.innerHTML = ROWS[mode].map(([id, a, b, c]) => `<tr class="${cs.includes(id) ? "cur" : ""}"><td>${a}</td><td class="${c}">${b}</td></tr>`).join("");
    }
    function apply() { world.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; zt.textContent = "缩放 " + Math.round(s * 100) + "%"; }
    function fit() {
      const r = stage.getBoundingClientRect();
      s = Math.min((r.width - 40) / 395, (r.height - 40) / 302);
      tx = (r.width - 395 * s) / 2; ty = (r.height - 302 * s) / 2; apply();
    }
    function say(id, txt) {
      table(id);
      toast.textContent = txt; toast.classList.add("show");
      clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 1400);
    }
    function zoomAt(cx, cy, f) {
      const ns = Math.min(8, Math.max(0.2, s * f));
      tx = cx - (cx - tx) * (ns / s); ty = cy - (cy - ty) * (ns / s); s = ns; apply();
    }
    const gname = "gm" + Math.random().toString(36).slice(2);
    $$('input[name="gm"]', w).forEach((r) => { r.name = gname; });
    $$(".gsim-bar input", w).forEach((r) => r.addEventListener("change", () => { mode = r.value; table(); }));
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY, dx = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
      const UD = ["mouse", "vswipe"]; // 浏览器分不清鼠标滚轮和双指上下滑，两行一起高亮
      if (e.ctrlKey) {
        if (mode === "ctrl") { zoomAt(cx, cy, Math.exp(-dy * 0.01)); say("pinch", "捏合 / ⌃+滚轮 → 缩放"); }
        else { ty -= dy * 2; apply(); say("pinch", "捏合 → 在默认设置下变成了上下平移"); }
        return;
      }
      if (e.metaKey) {
        if (mode === "ctrl") { zoomAt(cx, cy, Math.exp(-dy * 0.003)); say("cmdwheel", "⌘+滚轮 → 缩放"); }
        else { ty -= dy; apply(); say("cmdwheel", "⌘+滚轮 → 上下平移"); }
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) { tx -= dx; apply(); say("hswipe", "左右滑动 → 左右平移"); return; }
      if (mode === "wheel") { zoomAt(cx, cy, Math.exp(-dy * 0.003)); say(UD, "上下滚动 → 缩放"); }
      else { ty -= dy; apply(); say(UD, "上下滚动 → 上下平移"); }
    }, { passive: false });
    let drag = null;
    stage.addEventListener("contextmenu", (e) => e.preventDefault());
    stage.addEventListener("pointerdown", (e) => {
      stage.focus();
      drag = { b: e.button, x: e.clientX, y: e.clientY, tx, ty };
      stage.setPointerCapture(e.pointerId);
      if (e.button === 1) e.preventDefault();
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (drag.b === 2 || drag.b === 1) {
        tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; apply();
        say(drag.b === 2 ? "rdrag" : "mdrag", (drag.b === 2 ? "右键" : "中键") + "拖动 → 平移画布");
      } else if (drag.b === 0 && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
        say("ldrag", "左键拖动 → 框选（画布不动）");
      }
    });
    stage.addEventListener("pointerup", () => { drag = null; });
    stage.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "k") { fit(); say("k", "按 K → 适应全部"); } });
    table();
    const io = new ResizeObserver(() => fit());
    io.observe(stage);
  });
})();
