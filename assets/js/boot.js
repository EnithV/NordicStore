if (!window.__NS_BOOT__) {
  window.__NS_BOOT__ = true;

  window.NS_BASE = (function () {
    if (location.hostname.indexOf("github.io") !== -1) {
      return "/NordicStore/";
    }
    var path = location.pathname || "/";
    var pages = path.indexOf("/pages/");
    if (pages >= 0) {
      return path.slice(0, pages + 1);
    }
    return path.replace(/[^/]*$/, "");
  })();

  window.nsAsset = function (path) {
    return window.NS_BASE + String(path || "").replace(/^\//, "");
  };

  window.nsReady = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  window.nsLoadCss = function () {
    if (document.getElementById("ns-main-css")) return;
    var link = document.createElement("link");
    link.id = "ns-main-css";
    link.rel = "stylesheet";
    link.href = nsAsset("assets/css/main.css") + "?v=3";
    document.head.appendChild(link);
  };

  window.nsLoadScripts = function (files, done) {
    function next(i) {
      if (i >= files.length) {
        if (typeof done === "function") done();
        return;
      }
      var s = document.createElement("script");
      s.src = nsAsset(files[i]);
      s.onload = function () { next(i + 1); };
      s.onerror = function () { next(i + 1); };
      document.body.appendChild(s);
    }
    next(0);
  };

  nsLoadCss();
}
