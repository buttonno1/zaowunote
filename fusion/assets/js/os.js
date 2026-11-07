/* 系统选择（Mac / Windows）：首次访问弹窗选择，之后按选择显示快捷键。
   页面里的按键写法统一用 Mac 符号（<k>⌘ ⇧ Z</k> 或 <kbd>⌘</kbd>），这里在 Windows 下自动换算。
   只对某个系统显示的内容：<span class="os-mac">…</span> / <div class="os-win">…</div> */
(function () {
  "use strict";
  var KEY = "zw-os";
  var MAP = { "⌘": "Ctrl", "⌃": "Ctrl", "⌥": "Alt", "⇧": "Shift", "return": "Enter", "delete": "Delete", "⌫": "Backspace", "↩": "Enter", "Cmd": "Ctrl", "Option": "Alt", "Command": "Ctrl" };
  var SPECIAL = [[["⌃", "⌘", "F"], ["F11"]]];  // Mac 全屏 → Windows F11
  function winTokens(tokens) {
    for (var i = 0; i < SPECIAL.length; i++) if (SPECIAL[i][0].join(" ") === tokens.join(" ")) return SPECIAL[i][1].slice();
    var out = [];
    tokens.forEach(function (t) {
      if (t === "fn") return;
      var m = MAP[t] !== undefined ? MAP[t] : t.replace(/⌘/g, "Ctrl+").replace(/⌥/g, "Alt+").replace(/⇧/g, "Shift+").replace(/⌃/g, "Ctrl+").replace(/\+$/, "");
      if (out.length && out[out.length - 1] === m) return;
      out.push(m);
    });
    return out;
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(os) { try { localStorage.setItem(KEY, os); } catch (e) {} apply(os); }
  function convert(root, os) {
    // 组合键 <span class="keys"><kbd>..</kbd>...</span>
    [].forEach.call(root.querySelectorAll(".keys"), function (sp) {
      if (sp.dataset.mac === undefined) sp.dataset.mac = JSON.stringify([].map.call(sp.querySelectorAll("kbd"), function (k) { return k.textContent; }));
      var toks = JSON.parse(sp.dataset.mac), show = os === "win" ? winTokens(toks) : toks;
      sp.innerHTML = show.map(function (t) { return "<kbd>" + t.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</kbd>"; }).join("");
    });
    // 单独的 <kbd>
    [].forEach.call(root.querySelectorAll("kbd"), function (k) {
      if (k.closest(".keys") || k.closest(".mackb")) return;
      if (k.dataset.mac === undefined) k.dataset.mac = k.textContent;
      var t = k.dataset.mac;
      k.textContent = os === "win" ? winTokens(t.split(/\s+/)).join(" ") : t;
    });
  }
  var busy = false;
  function apply(os) {
    os = os || "mac";
    document.documentElement.setAttribute("data-os", os);
    busy = true; convert(document, os); busy = false;
    [].forEach.call(document.querySelectorAll(".os-switch button"), function (b) { b.classList.toggle("on", b.dataset.os === os); });
    var s = document.querySelector(".search input");
    if (s) s.placeholder = "搜索教程…  " + (os === "win" ? "Ctrl+K" : "⌘K");
    document.dispatchEvent(new CustomEvent("oschange", { detail: os }));
  }
  window.ZW_OS = { get: function () { return get() || "mac"; }, winTokens: winTokens, apply: apply };
  function ask() {
    var guess = /Win/i.test(navigator.platform || navigator.userAgent) ? "win" : "mac";
    var d = document.createElement("div");
    d.className = "os-modal";
    d.innerHTML = '<div class="os-box"><h3>你用的是什么电脑？</h3><p>' + ((document.body.dataset.book === 'fusion') ? 'Fusion' : '嘉立创EDA') + ' 在 Mac 和 Windows 上的快捷键不一样。选一下，整套教程都会按你的电脑显示按键。</p>' +
      '<div class="os-choices"><button data-os="mac"' + (guess === "mac" ? ' class="rec"' : "") + '><span>🍎</span>Mac<small>⌘ Command / ⌥ Option</small></button>' +
      '<button data-os="win"' + (guess === "win" ? ' class="rec"' : "") + '><span>⊞</span>Windows<small>Ctrl / Alt</small></button></div>' +
      '<p class="os-tip">以后可以随时在页面右上角切换。</p></div>';
    document.body.appendChild(d);
    [].forEach.call(d.querySelectorAll("button"), function (b) { b.onclick = function () { set(b.dataset.os); d.remove(); }; });
  }
  document.addEventListener("DOMContentLoaded", function () {
    [].forEach.call(document.querySelectorAll(".os-switch button"), function (b) { b.onclick = function () { set(b.dataset.os); }; });
    apply(get() || "mac");
    if (!get()) ask();
    // 互动组件稍后才渲染出来的按键，也要换算
    var t = null;
    new MutationObserver(function () { if (busy) return; clearTimeout(t); t = setTimeout(function () { busy = true; convert(document, get() || "mac"); busy = false; }, 30); })
      .observe(document.body, { childList: true, subtree: true });
  });
})();
