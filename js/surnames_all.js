/* 全量姓氏声调检索 —— 1071 姓（数据由 build_surnames_all.py 生成） */
(function () {
  var ALL = window.SURNAMES_ALL || [];
  var GROUPS = window.SURNAMES || [];
  var EXTRA = window.SURNAMES_EXTRA || [];
  var GN = { 1: "阴平", 2: "阳平", 3: "上声", 4: "去声" };
  var MARKS = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
  var PLAIN = ["a", "e", "i", "o", "u", "v"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function plainPy(p) {
    return String(p).split("").map(function (c) {
      var i = MARKS.indexOf(c);
      if (i < 0) return c;
      var base = PLAIN[Math.floor(i / 4)];
      return base === "v" ? "u" : base; // 检索时 ü 按u处理
    }).join("");
  }
  function cleanSurname(v) {
    v = String(v).replace(/^(?:姓)?[\d\/\-—\s]+/, "");
    return v.split("（")[0].split("(")[0].trim();
  }

  // ---------- 重点矩阵收录映射（主表 + 扩展表） ----------
  var CURATED = {};
  GROUPS.forEach(function (g) {
    (g.rows || []).forEach(function (r) {
      cleanSurname(r.surname).split(/[/、]/).forEach(function (s) {
        s = s.trim();
        if (s) CURATED[s] = true;
      });
    });
  });
  EXTRA.forEach(function (e) {
    (e.rows || []).forEach(function (r) {
      var s = cleanSurname(r.surname);
      if (s) CURATED[s] = true;
    });
  });

  // ---------- 声调组黄金公式 ----------
  var FORMULAS = {};
  GROUPS.forEach(function (g) {
    ["阴平", "阳平", "上声", "去声"].forEach(function (name) {
      if (String(g.tone).indexOf(name) >= 0) FORMULAS[name] = g.formulas || [];
    });
  });
  function formulaText(toneName) {
    var fs = FORMULAS[toneName] || [];
    return fs.map(function (f) {
      var m = String(f.name).match(/【(.+?)】/);
      return m ? m[1] : f.name;
    }).join(" / ");
  }

  var searchEl = document.getElementById("all-search");
  var resultsEl = document.getElementById("all-results");
  var moreEl = document.getElementById("all-more");
  if (!searchEl || !resultsEl) return;

  var query = "";
  var toneFilter = 0;
  var LIMIT = 80;

  // ---------- 统计 ----------
  var counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  var curatedInAll = 0;
  ALL.forEach(function (r) {
    counts[r[2]] = (counts[r[2]] || 0) + 1;
    if (CURATED[r[0]]) curatedInAll++;
  });
  var countEl = document.getElementById("all-count");
  var curatedCountEl = document.getElementById("all-curated");
  if (countEl) countEl.textContent = ALL.length;
  if (curatedCountEl) curatedCountEl.textContent = curatedInAll;

  // ---------- 声调筛选 chips ----------
  var chipsEl = document.getElementById("tone-chips");
  var chipDefs = [{ v: 0, label: "全部 " + ALL.length }].concat(
    [1, 2, 3, 4].map(function (t) {
      return { v: t, label: GN[t] + " " + counts[t] };
    })
  );
  chipsEl.innerHTML = chipDefs.map(function (c, i) {
    return (
      '<button class="tone-chip' + (i === 0 ? " active" : "") + '" data-tone="' + c.v + '">' + esc(c.label) + "</button>"
    );
  }).join("");
  chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".tone-chip");
    if (!b) return;
    toneFilter = parseInt(b.getAttribute("data-tone"), 10);
    chipsEl.querySelectorAll(".tone-chip").forEach(function (x) { x.classList.remove("active"); });
    b.classList.add("active");
    render();
  });

  // ---------- 渲染 ----------
  function render() {
    var q = plainPy(query).toLowerCase();
    var hits = [];
    ALL.forEach(function (r, idx) {
      var s = r[0], py = r[1], t = r[2], pop = r[3];
      if (toneFilter && t !== toneFilter) return;
      if (q && s.indexOf(query) < 0 && plainPy(py).toLowerCase().indexOf(q) < 0) return;
      hits.push({ s: s, py: py, t: t, pop: pop, rank: idx + 1 });
    });

    var shown = hits.slice(0, LIMIT);
    var html = shown.map(function (h) {
      var toneName = GN[h.t] || "去声";
      var isPing = h.t === 1 || h.t === 2;
      var curated = CURATED[h.s];
      return (
        '<div class="card surn-card">' +
        '<div class="surn-char">' + esc(h.s) + "</div>" +
        '<div class="surn-py">' + esc(h.py) + "</div>" +
        '<span class="surn-tone ' + (isPing ? "surn-tone-ping" : "surn-tone-ze") + '">' + toneName + "</span>" +
        '<div class="surn-meta">人口第 ' + h.rank + " 位 · 约 " + h.pop + " 万人</div>" +
        (curated
          ? '<button class="surn-curated" data-surname="' + esc(h.s) + '">已收录雷区 · 查看排雷</button>'
          : '<div class="surn-formula">黄金公式<br><strong>' + esc(formulaText(toneName)) + "</strong><br>专属雷区可预约诊断获取</div>") +
        "</div>"
      );
    }).join("");
    resultsEl.innerHTML = html ||
      '<p style="color:var(--ink-faint); text-align:center; grid-column:1/-1;">未找到匹配的姓氏。</p>';
    moreEl.textContent = hits.length > LIMIT
      ? "已显示前 " + LIMIT + " 条（共 " + hits.length + " 姓匹配），输入更多关键字缩小范围。"
      : "";
  }

  searchEl.addEventListener("input", function (e) {
    query = e.target.value.trim();
    render();
  });

  // 已收录姓氏 → 联动上方重点矩阵搜索
  resultsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".surn-curated");
    if (!b) return;
    var s = b.getAttribute("data-surname");
    var top = document.getElementById("surname-search");
    top.value = s;
    top.dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementById("surname-groups").scrollIntoView({ behavior: "smooth" });
  });

  render();
})();
