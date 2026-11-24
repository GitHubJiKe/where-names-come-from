/* 雅字库 / 名句库 交互逻辑（限量试读版）
 * 数据源：data/preview.js（试读切片）——全量内容属 ¥69 工具包交付物，不随站点公开。
 */
(function () {
  var P = window.PREVIEW || {};
  var G = window.NYLGate || { lockedCards: function () { return ""; }, meta: {} };
  var CHARS = P.characters || [];
  var QUOTES = P.quotes || [];

  // ---------- Tabs ----------
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("tab-chars").style.display = btn.dataset.tab === "chars" ? "" : "none";
      document.getElementById("tab-quotes").style.display = btn.dataset.tab === "quotes" ? "" : "none";
    });
  });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }
  function metaOf(key, fallback) {
    return (G.meta && G.meta[key]) || fallback;
  }

  // ---------- 字库 ----------
  var catSet = [];
  CHARS.forEach(function (c) { if (c.category && catSet.indexOf(c.category) < 0) catSet.push(c.category); });
  var catSel = document.getElementById("char-category");
  catSet.forEach(function (c) {
    var opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSel.appendChild(opt);
  });

  function renderChars() {
    var q = document.getElementById("char-search").value.trim().toLowerCase();
    var cat = catSel.value;
    var pz = document.getElementById("char-pingze").value;
    var lv = document.getElementById("char-level").value;
    var m = metaOf("characters", { total: 300, free: CHARS.length, unit: "字" });
    var list = CHARS.filter(function (c) {
      if (cat && c.category !== cat) return false;
      if (pz && c.pingze !== pz) return false;
      if (lv && c.level !== lv) return false;
      if (q) {
        var hay = (c.char + " " + c.pinyin + " " + c.meaning + " " + c.combos).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    document.getElementById("char-count").textContent =
      "试读命中 " + list.length + " / 全 " + m.total + " " + m.unit;

    var cards = list.map(function (c) {
      var combos = c.combos
        ? '<div class="char-combos"><strong>入名示范：</strong>' + nl2br(c.combos) + "</div>"
        : "";
      return (
        '<div class="card card-hover char-card">' +
        '<div class="char-glyph">' + esc(c.char) + "</div>" +
        '<div class="char-pinyin">' + esc(c.pinyin) + " · " + esc(c.tone) + "·" + esc(c.pingze) + "</div>" +
        '<div class="char-meta">' + (c.strokes ? c.strokes + " 画 · " : "") + esc(c.level) + "字表 · No." + String(c.id).padStart(3, "0") + "</div>" +
        '<div class="char-meaning">' + nl2br(c.meaning) + "</div>" +
        combos +
        "</div>"
      );
    }).join("");

    if (!cards) {
      document.getElementById("char-list").innerHTML =
        '<p style="color:var(--ink-faint); grid-column:1/-1;">试读范围内没有匹配的字——该字可能在完整 300 字库中，可到「' +
        '<a href="toolkit.html" style="color:var(--cinnabar);">¥69 工具包</a>」查阅全本。</p>';
      return;
    }

    document.getElementById("char-list").innerHTML = cards + G.lockedCards([
      { title: "还有 " + (m.total - m.free) + " 字完整词条", desc: "《说文》本义 · 典籍出处 · 笔画层级 · 入名示范组合" },
      { title: "按五大意象分册", desc: "玉石礼器 / 草木山林 / 水云雨雪 / 日月晨曦 / 君子心性" },
      { title: "PDF 全本 · 可打印", desc: "付款即发，离线案头查阅，不必联网逐条查" }
    ]);
  }

  ["char-search", "char-category", "char-pingze", "char-level"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderChars);
  });
  renderChars();

  // ---------- 句库 ----------
  var volSet = [];
  QUOTES.forEach(function (q) { if (q.volume && volSet.indexOf(q.volume) < 0) volSet.push(q.volume); });
  var volSel = document.getElementById("quote-volume");
  volSet.forEach(function (v) {
    var opt = document.createElement("option");
    opt.value = v; opt.textContent = v.replace(/（句.*$/, "");
    volSel.appendChild(opt);
  });

  function renderQuotes() {
    var q = document.getElementById("quote-search").value.trim().toLowerCase();
    var vol = volSel.value;
    var m = metaOf("quotes", { total: 120, free: QUOTES.length, unit: "句" });
    var list = QUOTES.filter(function (item) {
      if (vol && item.volume !== vol) return false;
      if (q) {
        var hay = (item.source + " " + item.quote + " " + item.names + " " + item.context).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    document.getElementById("quote-count").textContent =
      "试读命中 " + list.length + " / 全 " + m.total + " " + m.unit;

    var cards = list.map(function (item) {
      return (
        '<div class="card card-hover quote-card">' +
        '<div class="quote-source">' + esc(item.id) + " · " + esc(item.source) + "</div>" +
        '<div class="quote-text">' + esc(item.quote) + "</div>" +
        '<div class="quote-context">' + nl2br(item.context) + "</div>" +
        '<div class="quote-names"><strong>备选名：</strong>' + nl2br(item.names) + "</div>" +
        "</div>"
      );
    }).join("");

    if (!cards) {
      document.getElementById("quote-list").innerHTML =
        '<p style="color:var(--ink-faint); grid-column:1/-1;">试读范围内没有匹配的名句——完整 120 句见 ¥69 工具包。</p>';
      return;
    }

    document.getElementById("quote-list").innerHTML = cards + G.lockedCards([
      { title: "还有 " + (m.total - m.free) + " 句完整化用方案", desc: "每条含原典出处 · 语境释义 · 提炼备选名 · 平仄分析" },
      { title: "四卷分册 · 已剔除凶煞语境", desc: "诗经 / 楚辞 / 经哲 / 唐宋诗词，逐句核过上下文安全" },
      { title: "可直接对着起名", desc: "每句给出 2—4 个可落户备选名，不必自己二次发挥" }
    ]);
  }

  ["quote-search", "quote-volume"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderQuotes);
  });
  renderQuotes();
})();
