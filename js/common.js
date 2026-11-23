/* 名有来处 · 公共导航与页脚 */
(function () {
  var NAV_ITEMS = [
    { href: "index.html", label: "首页" },
    { href: "library.html", label: "雅字库·名句库" },
    { href: "surnames.html", label: "姓氏平仄矩阵" },
    { href: "mine.html", label: "排雷自查" },
    { href: "diagnosis.html", label: "五维诊断 ¥199" },
    { href: "custom.html", label: "典籍定制 ¥980", cta: true }
  ];

  var current = location.pathname.split("/").pop() || "index.html";

  function renderNav() {
    var links = NAV_ITEMS.map(function (item) {
      var cls = [];
      if (item.href === current) cls.push("active");
      if (item.cta) cls.push("nav-cta");
      return '<a href="' + item.href + '" class="' + cls.join(" ") + '">' + item.label + "</a>";
    }).join("");
    return (
      '<nav class="site-nav"><div class="wrap">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-seal">名</span>' +
      '<span><span class="brand-name">名有来处</span><span class="brand-sub">正统姓名学</span></span>' +
      "</a>" +
      '<button class="nav-toggle" aria-label="菜单" onclick="document.querySelector(\'.nav-links\').classList.toggle(\'open\')">☰</button>' +
      '<div class="nav-links">' + links + "</div>" +
      "</div></nav>"
    );
  }

  function renderFooter() {
    return (
      '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-grid">' +
      "<div>" +
      '<div class="footer-brand-name">名有来处</div>' +
      '<p style="font-size:14px;line-height:2;">名以正体，字以表德。<br>秉承《说文解字》训诂正脉与汉语音韵学，为中国家庭提供经得起时间与户籍系统双重检验的命名服务。<br><strong style="color:#e8dfca;">不谈八字，不算五格，不信生肖——只讲文字学。</strong></p>' +
      '<div style="margin-top:16px; display:flex; align-items:center; gap:12px;">' +
      '<img class="qr-code" src="assets/wechat_qrcode.jpg" alt="名有来处微信二维码" style="width:84px; height:auto; display:block; background:#fff; padding:5px; border-radius:3px;">' +
      '<span style="font-size:12.5px; color:#b9b09c; line-height:1.7;">微信扫码添加<br>回复【排雷】领手册<br>回复【诊断】预约服务<br><em style="font-style:normal; color:#d8cfae;">点击二维码可放大</em></span>' +
      "</div>" +
      "</div>" +
      "<div>" +
      "<h4>学术工具</h4>" +
      '<a href="library.html">300 雅字库 / 120 名句库</a>' +
      '<a href="surnames.html">百姓平仄黄金公式</a>' +
      '<a href="mine.html">100 排雷字速查</a>' +
      '<a href="mine.html#checklist">办证前六步自检</a>' +
      "</div>" +
      "<div>" +
      "<h4>服务体系</h4>" +
      '<a href="diagnosis.html">五维姓名美学诊断 ¥199</a>' +
      '<a href="custom.html">传世家风典籍定制 ¥980</a>' +
      '<a href="index.html#services">自主起名工具包 ¥69</a>' +
      '<a href="index.html#contact">预约咨询</a>' +
      "</div>" +
      "</div>" +
      '<div class="footer-bottom">名有来处 · 《名扬天下：中国姓名学》教研组出品 ｜ 依据《通用规范汉字表》（8105字）编纂 ｜ 微信公众号：名有来处</div>' +
      "</div></footer>"
    );
  }

  document.body.insertAdjacentHTML("afterbegin", renderNav());
  document.body.insertAdjacentHTML("beforeend", renderFooter());

  // FAQ 折叠
  document.addEventListener("click", function (e) {
    var q = e.target.closest(".faq-q");
    if (q) q.parentElement.classList.toggle("open");
  });

  // ---------- 图片查看器（点击二维码等图片弹框放大） ----------
  var viewer = document.createElement("div");
  viewer.className = "img-viewer";
  viewer.innerHTML =
    '<div class="img-viewer-mask"></div>' +
    '<button class="img-viewer-close" aria-label="关闭">&times;</button>' +
    '<div class="img-viewer-body">' +
    '<img class="img-viewer-img" alt="">' +
    '<div class="img-viewer-caption"></div>' +
    "</div>";
  document.body.appendChild(viewer);

  function openViewer(img) {
    viewer.querySelector(".img-viewer-img").src = img.src;
    viewer.querySelector(".img-viewer-caption").textContent =
      (img.alt || "微信扫码添加") + " · 长按图片可识别或保存";
    viewer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeViewer() {
    viewer.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".img-viewer-close") || e.target.classList.contains("img-viewer-mask")) {
      closeViewer();
      return;
    }
    var img = e.target.closest("img.qr-code");
    if (img) {
      e.preventDefault();
      openViewer(img);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeViewer();
  });
})();
