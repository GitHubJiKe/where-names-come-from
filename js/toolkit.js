/* ¥69 自主起名实操工具包 · 领取登记（云端落库） */
(function () {
  var form = document.getElementById("tk-form");
  if (!form) return;
  var statusEl = document.getElementById("submit-status");
  var btn = form.querySelector('button[type="submit"]');

  function v(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : "";
  }

  function setStatus(kind, msg) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = "submit-status " + kind;
    statusEl.textContent = msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var contact = v("contact");
    if (!contact) {
      setStatus("warn", "请先填写微信号，教研组才能核对并发送全本。");
      return;
    }
    if (!window.NYLC) {
      setStatus("warn", "⚠ 云端组件未加载（可能网络受限）。请直接扫码添加微信，备注「工具包」并转账 69 元。");
      return;
    }

    setStatus("pending", "正在登记…");
    if (btn) { btn.disabled = true; btn.textContent = "提交中…"; }

    window.NYLC.submitLead({
      service: "toolkit",
      contact: contact,
      surname: v("surname"),
      gender: "",
      answers: {
        contact: contact,
        surname: v("surname"),
        note: v("note"),
        page: "toolkit",
        price: 69,
        product: "自主起名实操工具包（四合一）"
      }
    }).then(function (r) {
      setStatus(
        "ok",
        "✓ 登记成功，受理编号 " + r.ref +
        "。请扫码添加微信，转账 69 元并备注该编号，教研组核对后立即发送 PDF 全本。"
      );
      if (btn) { btn.disabled = false; btn.textContent = "已登记 · 编号 " + r.ref; }
    }).catch(function (err) {
      setStatus(
        "warn",
        "⚠ 登记未成功：" + (err && err.message ? err.message : "网络异常") +
        "。可直接扫码添加微信，备注「工具包」并转账 69 元，同样即时发送。"
      );
      if (btn) { btn.disabled = false; btn.textContent = "重新登记"; }
    });
  });
})();
