/* 排雷速查 + 六步自检 交互逻辑 */
(function () {
  var MINES = window.MINES || [];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

  // ---------- Tabs ----------
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("tab-mines").style.display = btn.dataset.tab === "mines" ? "" : "none";
      document.getElementById("tab-checklist").style.display = btn.dataset.tab === "checklist" ? "" : "none";
    });
  });

  // 支持 #checklist 直达自检标签
  if (location.hash === "#checklist") {
    tabBtns.forEach(function (b) {
      if (b.dataset.tab === "checklist") b.click();
    });
  }

  // ---------- 排雷表 ----------
  var PART_ORDER = ["伪古风烂俗字", "训诂翻车字", "生僻歧义字"];
  var PART_TITLE = {
    "伪古风烂俗字": "第一部分 · 50 个伪古风 / 网文风 / 烂大街重灾区",
    "训诂翻车字": "第二部分 · 30 个字面极美、本义极凶的训诂翻车字",
    "生僻歧义字": "第三部分 · 20 个系统报错与读音歧义生僻字"
  };
  var PART_TAG = {
    "伪古风烂俗字": "tag-cinnabar",
    "训诂翻车字": "tag-cinnabar",
    "生僻歧义字": "tag-gold"
  };

  function renderMines() {
    var q = document.getElementById("mine-search").value.trim().toLowerCase();
    var part = document.getElementById("mine-part").value;
    var list = MINES.filter(function (m) {
      if (part && m.part !== part) return false;
      if (q) {
        var hay = (m.char + " " + (m.diagnosis || "") + " " + (m.alternatives || "") + " " + (m.reading || "")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    document.getElementById("mine-count").textContent = "共命中 " + list.length + " / 100 个高危字";

    var html = PART_ORDER.map(function (p) {
      var group = list.filter(function (m) { return m.part === p; });
      if (!group.length) return "";
      var cards = group.map(function (m) {
        var extra = "";
        if (m.misuse) extra += '<div style="font-size:13px; color:var(--gold); margin-bottom:6px;"><strong>误用心理：</strong>' + nl2br(m.misuse) + "</div>";
        if (m.reading) extra += '<div style="font-size:13px; color:var(--gold); margin-bottom:6px;"><strong>读音层级：</strong>' + nl2br(m.reading) + "</div>";
        return (
          '<div class="card mine-card">' +
          '<div class="mine-head">' +
          '<span class="mine-char">' + esc(m.char) + "</span>" +
          '<span class="tag ' + (PART_TAG[p] || "") + '">' + esc(m.part) + "</span>" +
          '<span class="mine-id">No.' + String(m.id).padStart(3, "0") + "</span>" +
          "</div>" +
          extra +
          '<div class="mine-diagnosis">' + nl2br(m.diagnosis) + "</div>" +
          (m.alternatives ? '<div class="mine-alt"><strong>✓ 正统替代：</strong>' + nl2br(m.alternatives) + "</div>" : "") +
          "</div>"
        );
      }).join("");
      return (
        '<h2 style="font-size:20px; letter-spacing:2px; margin:32px 0 16px; padding-left:14px; border-left:4px solid var(--cinnabar);">' +
        esc(PART_TITLE[p]) + "</h2>" +
        '<div class="grid grid-2">' + cards + "</div>"
      );
    }).join("");

    document.getElementById("mine-list").innerHTML =
      html || '<p style="color:var(--ink-faint); text-align:center; padding:40px 0;">恭喜！这个字不在 100 高危黑名单中——但仍需过平仄、谐音、字表三关，建议继续用「六步自检」复核。</p>';
  }

  ["mine-search", "mine-part"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderMines);
  });
  renderMines();

  // ---------- 六步自检 ----------
  var GATES = [
    {
      title: "第 1 关：国家规范字表关（防系统死机）",
      body: "检查名字中的每一个字，是否 100% 属于《通用规范汉字表》中的一级字（3500字）或二级字（3000字）？凡属三级字表生僻字、表外古字、或“喆、堃、昇、甯”等异体字，一律淘汰。"
    },
    {
      title: "第 2 关：《说文解字》本义与原典语境关（防训诂翻车）",
      body: "是否查过每个字的造字本义？绝无“夭、殇、戾、芜、默、孤、冥、恙、佞、姬”等凶苦本义；所引用的古诗词，是否核查过全诗背景？绝非悼亡诗、弃妇诗、亡国词、绝命词。"
    },
    {
      title: "第 3 关：四声平仄与唇舌咬字关（防拗口扁平）",
      body: "连着姓氏用标准普通话大声朗读 5 遍：是否避开了“三平调（全一二声）”“三上声（全三声）”“三去声（全四声）”？三个字的声母是否避开了连续同部位“吃螺丝”？"
    },
    {
      title: "第 4 关：普通话、方言与英文 Pinyin 三重谐音关（防校园外号）",
      body: "用普通话、父亲方言、母亲方言、常住城市方言分别快速连读 10 遍并倒读 3 遍，是否有任何不雅谐音？写成汉语拼音（如 Shiting、Dai）是否撞车英文粗口或负面词？"
    },
    {
      title: "第 5 关：汉字几何建筑与书写工学关（防视觉呆板）",
      body: "连姓氏在内三个字，是否避开了“三个左右结构并排（排队栅栏病）”或“三个上下结构堆叠”？单字笔画是否控制在 4—16 画之间（不含“淼、鑫、焱、垚”等三叠字），确保孩子 6 岁能轻松写出、成年后签名流畅？"
    },
    {
      title: "第 6 关：家族长辈避讳与时代抗老化关（防 30 年后尴尬）",
      body: "是否已排查父系、母系三代长辈姓名，确保无同字及高频同音字？闭上眼睛想象孩子 45 岁成为学者、高管时，这个名字印在名片与著作封面上，是否依然端庄得体、不显低幼甜腻？"
    }
  ];

  var passed = {};
  function renderGates() {
    document.getElementById("gate-list").innerHTML = GATES.map(function (g, i) {
      return (
        '<div class="check-gate" data-i="' + i + '" style="padding:14px 0; border-bottom:1px dashed var(--line-soft);">' +
        '<div class="gate-head">' +
        '<div class="gate-check">✓</div>' +
        "<div>" +
        '<div class="gate-title">' + esc(g.title) + "</div>" +
        '<div class="gate-body">' + esc(g.body) + "</div>" +
        "</div></div></div>"
      );
    }).join("");
    updateProgress();
  }

  function updateProgress() {
    var done = Object.keys(passed).filter(function (k) { return passed[k]; }).length;
    document.getElementById("check-done").textContent = done;
    var box = document.getElementById("check-progress");
    if (done === 6) {
      box.innerHTML = '<span class="pass-all">✓ 六关全过</span> —— 这个名字，可以放心去办《出生医学证明》了。';
    } else {
      box.innerHTML = "已完成 <strong id='check-done' style='color:var(--cinnabar);'>" + done + "</strong> / 6 道安全闸门" +
        (done > 0 ? " —— 还有 " + (6 - done) + " 关待核验" : "");
    }
  }

  document.getElementById("gate-list").addEventListener("click", function (e) {
    var gate = e.target.closest(".check-gate");
    if (!gate) return;
    var i = gate.dataset.i;
    passed[i] = !passed[i];
    gate.classList.toggle("passed", passed[i]);
    updateProgress();
  });

  renderGates();
})();
