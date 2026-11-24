/* 雅字库 / 名句库 交互逻辑 */
(function () {
  var CHARS = window.CHARACTERS || [];
  var QUOTES = window.QUOTES || [];

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
      "共 " + list.length + " / " + CHARS.length + " 字";
    document.getElementById("char-list").innerHTML = list.map(function (c) {
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
    }).join("") || '<p style="color:var(--ink-faint);">没有匹配的字，换个关键词试试。</p>';
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
    var list = QUOTES.filter(function (item) {
      if (vol && item.volume !== vol) return false;
      if (q) {
        var hay = (item.source + " " + item.quote + " " + item.names + " " + item.context).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    document.getElementById("quote-count").textContent = "共 " + list.length + " / 120 句";
    document.getElementById("quote-list").innerHTML = list.map(function (item) {
      return (
        '<div class="card card-hover quote-card">' +
        '<div class="quote-source">' + esc(item.id) + " · " + esc(item.source) + "</div>" +
        '<div class="quote-text">' + esc(item.quote) + "</div>" +
        '<div class="quote-context">' + nl2br(item.context) + "</div>" +
        '<div class="quote-names"><strong>备选名：</strong>' + nl2br(item.names) + "</div>" +
        "</div>"
      );
    }).join("") || '<p style="color:var(--ink-faint);">没有匹配的名句，换个关键词试试。</p>';
  }

  ["quote-search", "quote-volume"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderQuotes);
  });
  renderQuotes();
})();
