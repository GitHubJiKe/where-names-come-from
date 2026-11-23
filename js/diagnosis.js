/* 五维诊断采集卡生成 */
(function () {
  var form = document.getElementById("diag-form");
  var box = document.getElementById("result-box");
  var textarea = document.getElementById("result-text");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = function (name) { return (form.elements[name].value || "").trim() || "（未填写）"; };
    var text =
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
      "————————————————————\n" +
      "本人已知悉：贵教研组不采集生辰八字、不测算五行五格，仅做正统文字学与音韵学评估。申请预约五维姓名美学诊断（199 元/次）。";
    textarea.value = text;
    box.classList.add("show");
    box.scrollIntoView({ behavior: "smooth", block: "center" });
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
