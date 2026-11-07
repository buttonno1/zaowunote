/* 嘉立创EDA 专业版教程 —— 全站交互脚本（无依赖） */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ROOT = document.body.dataset.root || "";
  const PAGE = document.body.dataset.page || "";
  const BOOK = document.body.dataset.book || "lceda";
  const LS_DONE = BOOK + "-tut-done";

  /* ---------- 移动端菜单 ---------- */
  const mb = $(".menu-btn");
  if (mb) mb.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $(".content") && $(".content").addEventListener("click", () => document.body.classList.remove("nav-open"));

  /* 当前页在侧栏中滚动到可见 */
  const cur = $(".nav-link.current");
  if (cur) cur.scrollIntoView({ block: "center" });

  /* ---------- 本页目录 + 滚动高亮 ---------- */
  const tocUl = $(".toc ul");
  const heads = $$("article h2[id], article h3[id]");
  if (tocUl) {
    if (heads.length < 2) $(".toc").style.visibility = "hidden";
    heads.forEach((h) => {
      const li = document.createElement("li");
      li.className = h.tagName.toLowerCase();
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/#$/, "").trim();
      li.appendChild(a);
      tocUl.appendChild(li);
    });
    const links = $$(".toc a");
    const spy = () => {
      let idx = 0;
      const y = window.scrollY + 90;
      heads.forEach((h, i) => { if (h.offsetTop <= y) idx = i; });
      links.forEach((a, i) => a.classList.toggle("active", i === idx));
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  /* ---------- 搜索 ---------- */
  const sInput = $(".search input");
  const sBox = $(".search-results");
  const IDX = window.SEARCH_INDEX || [];
  let sSel = -1;
  function esc(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function hl(s, q) {
    if (!q) return esc(s);
    const i = s.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(s);
    return esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + q.length)) + "</mark>" + esc(s.slice(i + q.length));
  }
  function doSearch() {
    const q = sInput.value.trim();
    sSel = -1;
    if (!q) { sBox.classList.remove("show"); return; }
    const terms = q.toLowerCase().split(/\s+/);
    const res = [];
    for (const e of IDX) {
      const hay = (e.t + " " + e.s + " " + e.x).toLowerCase();
      if (!terms.every((t) => hay.includes(t))) continue;
      let score = 0;
      if ((e.s || e.t).toLowerCase().includes(terms[0])) score += 10;
      if (e.t.toLowerCase().includes(terms[0])) score += 3;
      res.push([score, e]);
    }
    res.sort((a, b) => b[0] - a[0]);
    if (!res.length) { sBox.innerHTML = '<div class="empty">没有找到相关内容（有些章节还在制作中）</div>'; sBox.classList.add("show"); return; }
    sBox.innerHTML = res.slice(0, 30).map(([, e]) => {
      const x = e.x.toLowerCase();
      const k = x.indexOf(terms[0]);
      const st = Math.max(0, k - 24);
      const snip = (st > 0 ? "…" : "") + e.x.slice(st, st + 90) + "…";
      return `<a href="${ROOT}${e.p}${e.a ? "#" + e.a : ""}"><b>${hl(e.s || e.t, terms[0])}</b><span>${esc(e.s ? e.t : "")}${e.s ? " · " : ""}${hl(snip, terms[0])}</span></a>`;
    }).join("");
    sBox.classList.add("show");
  }
  if (sInput) {
    sInput.addEventListener("input", doSearch);
    sInput.addEventListener("focus", doSearch);
    sInput.addEventListener("keydown", (ev) => {
      const items = $$("a", sBox);
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        sSel = (sSel + (ev.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("active", i === sSel));
        items[sSel] && items[sSel].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "Enter") {
        const a = items[sSel >= 0 ? sSel : 0];
        if (a) location.href = a.href;
      } else if (ev.key === "Escape") {
        sInput.blur(); sBox.classList.remove("show");
      }
    });
    document.addEventListener("click", (ev) => { if (!ev.target.closest(".search")) sBox.classList.remove("show"); });
    document.addEventListener("keydown", (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); sInput.focus(); sInput.select(); }
    });
  }

  /* ---------- 图片灯箱 ---------- */
  const lb = $(".lightbox");
  if (lb) {
    const lbImg = $("img", lb), lbCap = $(".lb-cap", lb);
    document.addEventListener("click", (ev) => {
      const img = ev.target.closest("figure.shot img, .zoomable");
      if (!img) return;
      lbImg.src = img.currentSrc || img.src;
      const cap = img.closest("figure") && $("figcaption", img.closest("figure"));
      lbCap.textContent = cap ? cap.textContent : "";
      const natW = img.naturalWidth / 2;
      lb.classList.toggle("fit", natW < window.innerWidth * 0.9);
      lbImg.style.width = Math.min(img.naturalWidth / 2 * 1.35, window.innerWidth * 0.94) + "px";
      lb.classList.add("show");
    });
    lb.addEventListener("click", () => lb.classList.remove("show"));
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") lb.classList.remove("show"); });
  }

  /* ---------- 前后对比滑块 ---------- */
  $$(".compare").forEach((c) => {
    const wrap = $(".after-wrap", c), handle = $(".handle", c);
    const set = (x) => {
      const r = c.getBoundingClientRect();
      const p = Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100));
      wrap.style.clipPath = `inset(0 0 0 ${p}%)`;
      handle.style.left = p + "%";
    };
    let drag = false;
    c.addEventListener("pointerdown", (e) => { drag = true; c.setPointerCapture(e.pointerId); set(e.clientX); });
    c.addEventListener("pointermove", (e) => { if (drag) set(e.clientX); });
    c.addEventListener("pointerup", () => { drag = false; });
  });

  /* ---------- 热点图 ---------- */
  $$(".hotspot").forEach((hs) => {
    const areas = $$(".hs-area", hs), info = $(".hs-info", hs), btns = $$(".hs-legend button", hs);
    const def = info.innerHTML;
    let locked = -1;
    const show = (i) => {
      areas.forEach((a, j) => a.classList.toggle("on", j === i));
      btns.forEach((b, j) => b.classList.toggle("on", j === i));
      info.innerHTML = i >= 0 ? areas[i].dataset.info : def;
    };
    areas.forEach((a, i) => {
      a.addEventListener("mouseenter", () => show(i));
      a.addEventListener("mouseleave", () => show(locked));
      a.addEventListener("click", () => { locked = locked === i ? -1 : i; show(locked); });
    });
    btns.forEach((b, i) => b.addEventListener("click", () => { locked = locked === i ? -1 : i; show(locked); }));
  });

  /* ---------- 选项卡 ---------- */
  $$(".tabs").forEach((t) => {
    const bs = $$(".tab-btns button", t), ps = $$(".tab-pane", t);
    bs.forEach((b, i) => b.addEventListener("click", () => {
      bs.forEach((x, j) => x.classList.toggle("on", i === j));
      ps.forEach((x, j) => x.classList.toggle("on", i === j));
    }));
  });

  /* ---------- 小测验 ---------- */
  $$(".quiz").forEach((q) => {
    $$("button.opt", q).forEach((b) => b.addEventListener("click", () => {
      if (q.classList.contains("answered")) return;
      q.classList.add("answered");
      $$("button.opt", q).forEach((x) => { if (x.dataset.right !== undefined) x.classList.add("right"); });
      if (b.dataset.right === undefined) b.classList.add("wrong");
    }));
  });

  /* ---------- 检查清单（记住勾选状态） ---------- */
  $$("ul.checklist").forEach((ul, k) => {
    const key = BOOK + "-chk-" + PAGE + "-" + k;
    let st = [];
    try { st = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
    $$("li", ul).forEach((li, i) => {
      if (st[i]) li.classList.add("on");
      li.addEventListener("click", () => {
        li.classList.toggle("on");
        st[i] = li.classList.contains("on");
        localStorage.setItem(key, JSON.stringify(st));
      });
    });
  });

  /* ---------- 学习进度 ---------- */
  function getDone() { try { return new Set(JSON.parse(localStorage.getItem(LS_DONE) || "[]")); } catch (e) { return new Set(); } }
  function setDone(s) { localStorage.setItem(LS_DONE, JSON.stringify([...s])); }
  function paint() {
    const d = getDone();
    $$(".nav-link[data-id]").forEach((a) => a.classList.toggle("done", d.has(a.dataset.id)));
    const ids = window.PAGE_IDS || [];
    const n = ids.filter((i) => d.has(i)).length;
    const pct = ids.length ? Math.round((n / ids.length) * 100) : 0;
    const p = $(".sidebar .pct"), bar = $(".sidebar .bar i");
    if (p) p.textContent = `${pct}%（${n}/${ids.length} 页）`;
    if (bar) bar.style.width = pct + "%";
    const btn = $(".done-btn");
    if (btn) {
      const on = d.has(PAGE);
      btn.classList.toggle("done", on);
      btn.textContent = on ? "✓ 已学完（点击取消）" : "✓ 我学完这一页了";
    }
  }
  const db = $(".done-btn");
  if (db) db.addEventListener("click", () => {
    const d = getDone();
    d.has(PAGE) ? d.delete(PAGE) : d.add(PAGE);
    setDone(d); paint();
  });
  paint();
})();
