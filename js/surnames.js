/* 姓氏平仄矩阵 交互逻辑 */
(function () {
  var GROUPS = window.SURNAMES || [];
  var EXTRA = window.SURNAMES_EXTRA || [];

  // 按声调组名合并扩展姓氏
  function extraFor(tone) {
    var hit = EXTRA.filter(function (e) { return tone.indexOf(e.tone) >= 0; });
    var rows = [];
    hit.forEach(function (e) { rows = rows.concat(e.rows); });
    return rows;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

  function render(filter) {
    var html = GROUPS.map(function (g) {
      var allRows = g.rows.concat(extraFor(g.tone));
      var rows = allRows.filter(function (r) {
        if (!filter) return true;
        return r.surname.indexOf(filter) >= 0 || r.blacklist.indexOf(filter) >= 0 || r.recommended.indexOf(filter) >= 0;
      });
      if (!rows.length) return "";
      var formulas = g.formulas.map(function (f) {
        return (
          '<div style="margin-bottom:10px;">' +
          '<span class="tag tag-cinnabar" style="margin-right:8px;">' + esc(f.name) + "</span>" +
          '<span style="font-size:14px; color:var(--ink-soft);">' + nl2br(f.desc) + "</span>" +
          "</div>"
        );
      }).join("");
      var extraCount = extraFor(g.tone).length;
      var extraNote = extraCount
        ? '<div style="font-size:13px; color:var(--gold); margin:-10px 0 14px;">＋ 教研组扩展收录 ' + extraCount + ' 个姓氏（含高频次大姓与高危谐音姓），随表格附排雷核验。</div>'
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
      return (
        '<div style="margin-bottom:44px;">' +
        '<h2 style="font-size:22px; letter-spacing:2px; margin-bottom:16px; padding-left:14px; border-left:4px solid var(--cinnabar);">' + esc(g.title) + "</h2>" +
        (formulas ? '<div class="card" style="margin-bottom:16px; background:#fdfaf2;">' + formulas + "</div>" : "") +
        extraNote +
        '<div style="overflow-x:auto;"><table class="data-table">' +
        "<thead><tr><th>姓氏</th><th>谐音雷区（连读十遍必翻车）</th><th>正统雅名示范</th></tr></thead>" +
        "<tbody>" + body + "</tbody></table></div>" +
        "</div>"
      );
    }).join("");
    document.getElementById("surname-groups").innerHTML =
      html || '<p style="color:var(--ink-faint); text-align:center;">该姓氏暂不在重点矩阵内——请到下方「全量姓氏声调检索」查其声调分组与黄金公式，或预约诊断时单独咨询。</p>';
  }

  document.getElementById("surname-search").addEventListener("input", function (e) {
    render(e.target.value.trim());
  });
  render("");
})();
