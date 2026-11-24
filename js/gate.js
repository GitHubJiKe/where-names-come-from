/* 限量试读门禁组件（全站通用）
 * 用法：
 *   1) HTML 里放 <div class="teaser-slot" data-free="30" data-total="300" data-unit="字" data-what="雅字"></div>
 *      → 自动填充「限量试读」提示条
 *   2) JS 渲染末尾拼接 NYLGate.lockedCards([{title,desc}, ...]) → 锁定占位卡
 */
(function () {
  var TOOLKIT = "toolkit.html";
  var P = (window.PREVIEW && window.PREVIEW.meta) || {};

  var LOCK_SVG =
    '<svg class="lk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------- 顶部试读提示条 ---------- */
  function fillTeaserSlots() {
    var slots = document.querySelectorAll(".teaser-slot");
    Array.prototype.forEach.call(slots, function (el) {
      // 优先用 meta（唯一数据源，避免与 HTML 硬编码不同步），退化才用 data-* 属性
      var key = el.getAttribute("data-key");
      var m = key ? P[key] : null;
      var free = m ? m.free : parseInt(el.getAttribute("data-free"), 10);
      var total = m ? m.total : parseInt(el.getAttribute("data-total"), 10);
      var unit = (m && m.unit) || el.getAttribute("data-unit") || "条";
      var what = el.getAttribute("data-what") || "内容";
      if (isNaN(free) || isNaN(total) || total <= free) { el.style.display = "none"; return; }
      var rest = total - free;
      el.innerHTML =
        '<div class="teaser-bar">' +
        '<span class="teaser-tag">限量试读</span>' +
        '<span class="teaser-text">本站' + esc(what) + '共 <strong>' + total + "</strong> " + esc(unit) +
        "，试读开放前 <strong>" + free + "</strong> " + esc(unit) +
        "；其余 <strong>" + rest + "</strong> " + esc(unit) + "收录于《自主起名实操工具包》。</span>" +
        '<a class="teaser-cta" href="' + TOOLKIT + '">¥69 获取全本 →</a>' +
        "</div>";
    });
  }

  /* ---------- 锁定占位卡 ---------- */
  function lockedCards(cards) {
    if (!cards || !cards.length) return "";
    var html = cards.map(function (c) {
      return (
        '<div class="locked-card">' +
        '<div class="lk-body">' + LOCK_SVG +
        '<div class="lk-title">' + esc(c.title) + "</div>" +
        '<div class="lk-desc">' + esc(c.desc) + "</div>" +
        '<a class="lk-link" href="' + TOOLKIT + '">查看工具包 →</a>' +
        "</div></div>"
      );
    }).join("");
    return '<div class="locked-wrap">' + html + "</div>";
  }

  /* ---------- 计数文案（试读用） ---------- */
  function countText(listLength, key) {
    var m = P[key];
    if (!m) return "共 " + listLength + " 条";
    return "试读命中 " + listLength + " / 全 " + m.total + " " + m.unit;
  }

  function rest(key) {
    var m = P[key];
    return m ? m.total - m.free : 0;
  }

  function total(key) {
    var m = P[key];
    return m ? m.total : 0;
  }

  window.NYLGate = {
    TOOLKIT: TOOLKIT,
    lockedCards: lockedCards,
    countText: countText,
    rest: rest,
    total: total,
    meta: P,
    ready: function () { fillTeaserSlots(); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillTeaserSlots);
  } else {
    fillTeaserSlots();
  }
})();
