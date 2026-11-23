/* 典籍定制访谈表生成 */
(function () {
  var form = document.getElementById("custom-form");
  var box = document.getElementById("result-box");
  var textarea = document.getElementById("result-text");

  // checkbox 选中态样式
  document.querySelectorAll(".checkbox-item input").forEach(function (cb) {
    cb.addEventListener("change", function () {
      cb.closest(".checkbox-item").classList.toggle("checked", cb.checked);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = function (name) { return (form.elements[name].value || "").trim() || "（未填写）"; };
    var themes = Array.prototype.map.call(
      document.querySelectorAll("#theme-group input:checked"),
      function (cb) { return cb.value; }
    );
    if (!themes.length) {
      alert("请至少勾选 1 项文化典籍母题（建议 2—3 项）。");
      return;
    }
    var text =
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
      "————————————————————\n" +
      "本人已知悉并认同《服务交付标准与边界说明》：贵教研组不采集生辰八字、不从事算命占卜与五格测算。申请预约传世家风·典籍定制起名（980 元/单）。";
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
