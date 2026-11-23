/* 云服务接入层 —— 预约提交落库（WorkBuddy Cloud Service · Database）
 * 说明：endpoint / publishableKey / oauthRelayBaseUrl 均来自云服务 publicConfig，
 * 属可公开的前端配置（publishableKey 仅标识应用，权限由服务端 Origin 校验与 RLS 控制）。
 */
(function () {
  var CONFIG = {
    endpoint: "https://where-names-come-from.app.workbuddy.host",
    publishableKey: "wbpk_eCcwtXhDna5fCzGsMOwFbs_E0MtEsZWm1FgbsXg70JKRDEaxBp0YONf",
    oauthRelayBaseUrl: "https://www.workbuddy.cn/v2/as/genie-baas/oauth"
  };

  var client = null;

  function getClient() {
    if (client) return client;
    if (!window.WorkBuddyCloud || typeof window.WorkBuddyCloud.createWorkBuddyCloud !== "function") {
      return null; // SDK 未加载（离线 / CDN 被拦）
    }
    client = window.WorkBuddyCloud.createWorkBuddyCloud({
      endpoint: CONFIG.endpoint,
      oauthRelayBaseUrl: CONFIG.oauthRelayBaseUrl,
      publishableKey: CONFIG.publishableKey
    });
    return client;
  }

  function makeRef() {
    var t = Date.now().toString(36).toUpperCase().slice(-5);
    var r = Math.random().toString(36).toUpperCase().slice(2, 5);
    return "NY" + t + r;
  }

  // data: { service:'diagnosis'|'custom', contact, surname, gender, answers }
  function submitLead(data) {
    return Promise.resolve().then(function () {
      var c = getClient();
      if (!c) throw new Error("云端组件未加载，请检查网络");
      var ref = makeRef();
      var row = {
        service: data.service,
        ref_code: ref,
        contact: (data.contact || "").trim() || null,
        surname: (data.surname || "").trim() || null,
        gender: (data.gender || "").trim() || null,
        answers: data.answers || {}
      };
      // 不链 .select()：该表只放开 INSERT 策略，匿名不可读回（隐私）
      return c.database.from("leads").insert(row).then(function (res) {
        if (res && res.error) {
          var e = res.error;
          if (e.code === "42501") throw new Error("提交被拒绝（权限）");
          if (e.code === "42P01") throw new Error("云端表未就绪");
          if (e.code === "23505") throw new Error("重复提交");
          throw new Error(e.message || "提交失败");
        }
        return { ref: ref };
      });
    });
  }

  window.NYLC = {
    submitLead: submitLead,
    isReady: function () { return !!getClient(); }
  };
})();
