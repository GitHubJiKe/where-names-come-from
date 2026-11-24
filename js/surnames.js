/* 姓氏平仄矩阵 交互逻辑（逐姓雷区为限量试读版）
 * 数据源：data/preview.js —— 全量逐姓黑名单与雅名示范属 ¥69 工具包交付物。
 */
(function () {
  var P = window.PREVIEW || {};
  var G = window.NYLGate || { lockedCards: function () { return ""; }, meta: {} };
  var GROUPS = P.surnames || [];
  var EXTRA = P.surnamesExtra || [];

  // 按声调组名合并扩展姓氏（试读版每组仅前 1 姓，rowsTotal 记录该组全量）
  function extraGroup(tone) {
    var hit = EXTRA.filter(function (e) { return tone.indexOf(e.tone) >= 0; });
    var rows = [];
    var total = 0;
    hit.forEach(function (e) {
      rows = rows.concat(e.rows || []);
      total += e.rowsTotal || (e.rows ? e.rows.length : 0);
    });
    return { rows: rows, total: total };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

  function render(filter) {
    var html = GROUPS.map(function (g) {
      var ex = extraGroup(g.tone);
      var allRows = (g.rows || []).concat(ex.rows);
      var rows = allRows.filter(function (r) {
        if (!filter) return true;
        return r.surname.indexOf(filter) >= 0 ||
               r.blacklist.indexOf(filter) >= 0 ||
               r.recommended.indexOf(filter) >= 0;
      });
      if (!rows.length) return "";

      var formulas = (g.formulas || []).map(function (f) {
        return (
          '<div style="margin-bottom:10px;">' +
          '<span class="tag tag-cinnabar" style="margin-right:8px;">' + esc(f.name) + "</span>" +
          '<span style="font-size:14px; color:var(--ink-soft);">' + nl2br(f.desc) + "</span>" +
          "</div>"
        );
      }).join("");
      var restF = (g.formulasTotal || (g.formulas || []).length) - (g.formulas || []).length;
      if (restF > 0) {
        formulas += '<div class="formula-more">另有 ' + restF + ' 条声调公式（含破局变法）收录于 ¥69 工具包</div>';
      }

      var extraNote = ex.total
        ? '<div style="font-size:13px; color:var(--gold); margin:-10px 0 14px;">＋ 教研组扩展收录 ' + ex.total + ' 个姓氏（含高频次大姓与高危谐音姓），试读展示每组前 1 姓。</div>'
        : "";

      var body = rows.map(function (r) {
        return (
          "<tr>" +
          '<td style="white-space:nowrap;"><strong style="color:var(--ink);">' + nl2br(r.surname) + "</strong></td>" +
          "<td>" + nl2br(r.blacklist) + "</td>" +
          '<td style="color:var(--jade);">' + nl2br(r.recommended) + "</td>" +
          "</tr>"
        );
      }).join("");

      var groupTotal = (g.rowsTotal || (g.rows || []).length) + ex.total;
      var shown = rows.length;
      var groupLock = groupTotal > shown
        ? '<div class="lock-hint">该组共 <strong>' + groupTotal + '</strong> 姓，试读展示 ' + shown +
          ' 姓；其余 <strong>' + (groupTotal - shown) + '</strong> 姓的专属谐音雷区与雅名示范收录于 ¥69 工具包。</div>'
        : "";

      return (
        '<div style="margin-bottom:44px;">' +
        '<h2 style="font-size:22px; letter-spacing:2px; margin-bottom:16px; padding-left:14px; border-left:4px solid var(--cinnabar);">' + esc(g.title) + "</h2>" +
        (formulas ? '<div class="card" style="margin-bottom:16px; background:#fdfaf2;">' + formulas + "</div>" : "") +
        extraNote +
        '<div style="overflow-x:auto;"><table class="data-table">' +
        "<thead><tr><th>姓氏</th><th>谐音雷区（连读十遍必翻车）</th><th>正统雅名示范</th></tr></thead>" +
        "<tbody>" + body + "</tbody></table></div>" +
        groupLock +
        "</div>"
      );
    }).join("");

    if (!html) {
      document.getElementById("surname-groups").innerHTML =
        '<p style="color:var(--ink-faint); text-align:center;">该姓氏暂不在试读矩阵内——请到下方「全量姓氏声调检索」查其声调分组与黄金公式，或查看 ¥69 工具包收录的完整逐姓雷区。</p>';
      return;
    }

    document.getElementById("surname-groups").innerHTML = html + G.lockedCards([
      { title: "还有 " + ((G.meta && G.meta.surnames) ? G.meta.surnames.total - G.meta.surnames.free : 97) + " 姓专属雷区", desc: "逐姓谐音黑名单 + 正统雅名示范，按四声分组编排" },
      { title: "全部四声黄金公式", desc: "每组 2—3 条配方，含三平调 / 三上声 / 三去声的破局变法" },
      { title: "与全量检索对照使用", desc: "先在站内查到声调，再翻工具包看该姓该配什么、忌什么" }
    ]);
  }

  document.getElementById("surname-search").addEventListener("input", function (e) {
    render(e.target.value.trim());
  });
  render("");
})();
