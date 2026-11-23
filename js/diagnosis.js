/* 五维诊断采集卡生成 + 云端提交 */
(function () {
  var form = document.getElementById("diag-form");
  var box = document.getElementById("result-box");
  var textarea = document.getElementById("result-text");
  var statusEl = document.getElementById("submit-status");

  function v(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : "";
  }
  function d(name) { return v(name) || "（未填写）"; }
  function firstToken(s) { return (s || "").split(/[\s\/、，,（(]/)[0] || ""; }

  function buildText(ref) {
    return (
      "【名有来处·五维姓名美学诊断】信息采集卡\n" +
      "————————————————————\n\n" +
      "1. 宝宝姓氏与性别：" + d("basic") + "\n\n" +
      "2. 待评估备选名及来源说明：\n" +
      "   ① " + d("name1") + "\n" +
      "   ② " + d("name2") + "\n" +
      "   ③ " + d("name3") + "\n\n" +
      "3. 家庭常住城市与父母双方方言区：" + d("dialect") + "\n\n" +
      "4. 家族长辈避讳字：" + d("avoid") + "\n\n" +
      "5. 家族字辈（派语）硬性要求：" + d("generation") + "\n\n" +
      "6. 父母最看重的气质关键词：" + d("style") + "\n\n" +
      "7. 联系方式（微信 / 手机）：" + d("contact") + "\n\n" +
      (ref ? "受理编号：" + ref + "\n\n" : "") +
      "————————————————————\n" +
      "本人已知悉：贵教研组不采集生辰八字、不测算五行五格，仅做正统文字学与音韵学评估。申请预约五维姓名美学诊断（199 元/次）。"
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

    // 1) 立即在本地生成采集卡（无网络也可用）
    textarea.value = buildText("");
    box.classList.add("show");
    box.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2) 同步提交到云端预约库
    if (!window.NYLC) {
      setStatus("warn", "⚠ 云端组件未加载，请复制下方内容，扫码添加微信发送。");
      return;
    }
    setStatus("pending", "正在提交到教研组系统…");
    window.NYLC.submitLead({
      service: "diagnosis",
      contact: v("contact"),
      surname: firstToken(v("basic")),
      gender: "",
      answers: {
        basic: v("basic"),
        name1: v("name1"),
        name2: v("name2"),
        name3: v("name3"),
        dialect: v("dialect"),
        avoid: v("avoid"),
        generation: v("generation"),
        style: v("style"),
        contact: v("contact"),
        page: "diagnosis"
      }
    }).then(function (r) {
      textarea.value = buildText(r.ref);
      setStatus("ok", "✓ 已提交成功，受理编号 " + r.ref + "。教研组会通过您填写的联系方式在 24 小时内回复；也可复制下方内容微信发送。");
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
