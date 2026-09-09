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

function nsAsset(path) {
  return window.NS_BASE + path.replace(/^\//, "");
}

function nsLoadCss() {
  if (document.getElementById("ns-main-css")) return;
  var link = document.createElement("link");
  link.id = "ns-main-css";
  link.rel = "stylesheet";
  link.href = nsAsset("assets/css/main.css");
  document.head.appendChild(link);
}

function nsLoadScripts(files) {
  function next(i) {
    if (i >= files.length) return;
    var s = document.createElement("script");
    s.src = nsAsset(files[i]);
    s.onload = function () { next(i + 1); };
    document.body.appendChild(s);
  }
  next(0);
}

nsLoadCss();
