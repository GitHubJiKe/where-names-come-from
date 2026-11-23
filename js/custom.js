/* 典籍定制访谈表生成 + 云端提交 */
(function () {
  var form = document.getElementById("custom-form");
  var box = document.getElementById("result-box");
  var textarea = document.getElementById("result-text");
  var statusEl = document.getElementById("submit-status");

  // checkbox 选中态样式
  document.querySelectorAll(".checkbox-item input").forEach(function (cb) {
    cb.addEventListener("change", function () {
      cb.closest(".checkbox-item").classList.toggle("checked", cb.checked);
    });
  });

  function v(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : "";
  }
  function d(name) { return v(name) || "（未填写）"; }

  function selectedThemes() {
    return Array.prototype.map.call(
      document.querySelectorAll("#theme-group input:checked"),
      function (cb) { return cb.value; }
    );
  }

  function buildText(themes, ref) {
    return (
      "【名有来处·传世家风典籍音韵定制】一对一深度访谈表\n" +
      "————————————————————\n\n" +
      "1. 命名对象基础信息：\n" +
      "   姓氏：" + d("surname") + "\n" +
      "   性别：" + d("gender") + "\n" +
      "   出生季节与节气：" + d("season") + "\n\n" +
      "2. 宗族字辈与兄弟姐妹排行：\n" +
      "   字辈要求：" + d("generation") + "\n" +
      "   大宝姓名（系列名参考）：" + d("sibling") + "\n\n" +
      "3. 家族长辈避讳红线：" + d("avoid") + "\n\n" +
      "4. 家庭常住地与方言环境：\n" +
      "   常住城市：" + d("city") + "\n" +
      "   父亲方言区：" + d("dialect_f") + "\n" +
      "   母亲方言区：" + d("dialect_m") + "\n" +
      "   海外规划：" + d("oversea") + "\n\n" +
      "5. 钟爱的文化典籍母题：" + themes.join("、") + "\n\n" +
      "6. 家族专属记忆与情感锚点：" + d("memory") + "\n\n" +
      "7. 字形与结构偏好：\n" +
      "   名字长度倾向：" + d("length") + "\n" +
      "   虚词入名偏好：" + d("xuci") + "\n" +
      "   绝对排斥项：" + d("reject") + "\n\n" +
      "8. 对孩子未来三十年的期许：" + d("wish") + "\n\n" +
      "9. 联系方式（微信 / 手机）：" + d("contact") + "\n\n" +
      (ref ? "受理编号：" + ref + "\n\n" : "") +
      "————————————————————\n" +
      "本人已知悉并认同《服务交付标准与边界说明》：贵教研组不采集生辰八字、不从事算命占卜与五格测算。申请预约传世家风·典籍定制起名（980 元/单）。"
    );
  }

  function setStatus(kind, msg) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = "submit-status " + kind;
    statusEl.textContent = msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var themes = selectedThemes();
    if (!themes.length) {
      alert("请至少勾选 1 项文化典籍母题（建议 2—3 项）。");
      return;
    }

    // 1) 本地生成访谈表（无网络也可用）
    textarea.value = buildText(themes, "");
    box.classList.add("show");
    box.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2) 云端提交
    if (!window.NYLC) {
      setStatus("warn", "⚠ 云端组件未加载，请复制下方内容，扫码添加微信发送。");
      return;
    }
    setStatus("pending", "正在提交到教研组系统…");
    window.NYLC.submitLead({
      service: "custom",
      contact: v("contact"),
      surname: v("surname"),
      gender: v("gender"),
      answers: {
        surname: v("surname"),
        gender: v("gender"),
        season: v("season"),
        generation: v("generation"),
        sibling: v("sibling"),
        avoid: v("avoid"),
        city: v("city"),
        dialect_f: v("dialect_f"),
        dialect_m: v("dialect_m"),
        oversea: v("oversea"),
        themes: themes,
        memory: v("memory"),
        length: v("length"),
        xuci: v("xuci"),
        reject: v("reject"),
        wish: v("wish"),
        contact: v("contact"),
        page: "custom"
      }
    }).then(function (r) {
      textarea.value = buildText(themes, r.ref);
      setStatus("ok", "✓ 已提交成功，受理编号 " + r.ref + "。教研组会通过您填写的联系方式确认需求与排期；也可复制下方内容微信发送。");
    }).catch(function (err) {
      setStatus("warn", "⚠ 在线提交未成功：" + (err && err.message ? err.message : "网络异常") + "。请复制下方内容，扫码添加微信发送。");
    });
  });

  document.getElementById("copy-btn").addEventListener("click", function () {
    textarea.select();
    var done = function () {
      document.getElementById("copy-hint").textContent = "✓ 已复制到剪贴板，去微信粘贴发送即可。";
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(done).catch(function () {
        document.execCommand("copy"); done();
      });
    } else {
      document.execCommand("copy"); done();
    }
  });
})();
