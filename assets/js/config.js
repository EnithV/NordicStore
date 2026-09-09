const API_BASE = "https://nordicstore-api.onrender.com";
window.API_BASE = API_BASE;
const GITHUB_PAGES_BASE_PATH = "/NordicStore";

function obtenerBaseAplicacion() {
  var path = window.location.pathname || "";
  var pagesIdx = path.indexOf("/pages/");
  if (pagesIdx >= 0) {
    return pagesIdx > 0 ? path.substring(0, pagesIdx) : "";
  }
  if (path.indexOf(GITHUB_PAGES_BASE_PATH) === 0) {
    return GITHUB_PAGES_BASE_PATH;
  }
  if (window.location.hostname.indexOf("github.io") !== -1) {
    return GITHUB_PAGES_BASE_PATH;
  }
  return "";
}

function urlApp(ruta) {
  var base = obtenerBaseAplicacion();
  var clean = ruta.charAt(0) === "/" ? ruta : "/" + ruta;
  return base + clean;
}

function dinero(valor) {
  return "$" + Number(valor || 0).toFixed(2);
}

function usuarioActual() {
  try {
    var raw = localStorage.getItem("ns_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function tokenActual() {
  return localStorage.getItem("ns_token") || "";
}

function guardarSesion(data) {
  localStorage.setItem("ns_token", data.token || "");
  localStorage.setItem("ns_user", JSON.stringify({
    id: data.id,
    username: data.username,
    email: data.email,
    rol: data.rol,
    nombre: data.nombre
  }));
}

function limpiarSesion() {
  localStorage.removeItem("ns_token");
  localStorage.removeItem("ns_user");
}

function htmlNavbar() {
  return (
    '<header class="navbar">' +
      '<a class="brand" data-ns-href="/index.html"><span class="brand-mark">◆</span> Nordic<strong>Store</strong></a>' +
      '<nav class="nav-links">' +
        '<a data-ns-href="/index.html" data-i18n="nav.catalog">Catálogo</a>' +
        '<a data-ns-href="/pages/carrito/carrito.html" id="nav-cart" hidden><span data-i18n="nav.cart">Carrito</span> <span id="cart-badge">0</span></a>' +
        '<a data-ns-href="/pages/pedidos/pedidos.html" id="nav-orders" hidden data-i18n="nav.orders">Mis órdenes</a>' +
        '<a data-ns-href="/pages/perfil/perfil.html" id="nav-profile" hidden data-i18n="nav.profile">Perfil</a>' +
        '<a data-ns-href="/pages/admin/admin.html" id="admin-link" hidden data-i18n="nav.admin">Atelier</a>' +
      "</nav>" +
      '<div class="nav-actions">' +
        '<div class="lang" role="group" aria-label="Idioma">' +
          '<button type="button" class="lang-btn" data-lang="es">ES</button>' +
          '<button type="button" class="lang-btn" data-lang="en">EN</button>' +
        "</div>" +
        '<div id="user-info" class="user-session">' +
          '<span class="user" id="userName"></span>' +
          '<button type="button" class="btn btn-ghost" id="btnCerrarSesion" data-i18n="nav.logout">Salir</button>' +
        "</div>" +
        '<div id="acceso-botones">' +
          '<a class="btn btn-ghost" data-ns-href="/pages/registro/registro.html" data-i18n="nav.register">Crear cuenta</a>' +
          '<a class="btn btn-primary" data-ns-href="/pages/login/login.html" data-i18n="nav.login">Iniciar sesión</a>' +
        "</div>" +
      "</div>" +
    "</header>"
  );
}

function htmlFooter() {
  return (
    '<footer class="site-footer">' +
      '<div class="footer-inner">' +
        '<div class="footer-pills">' +
          '<span class="footer-pill">Java 17</span>' +
          '<span class="footer-pill">Spring Boot</span>' +
          '<span class="footer-pill">Angular</span>' +
          '<span class="footer-pill">Keycloak</span>' +
        "</div>" +
        '<p class="footer-author">Gicela Vargas</p>' +
        '<p class="footer-rights">© 2026 Gicela Vargas. <span data-i18n="footer.rights">Todos los derechos reservados.</span></p>' +
      "</div>" +
    "</footer>"
  );
}

function marcarEnlaceActivo() {
  var slug = (window.location.pathname || "").split("/").filter(Boolean).pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (enlace) {
    var href = enlace.getAttribute("href") || "";
    var activo = (slug === "index.html" || slug === "NordicStore")
      ? href.indexOf("index.html") !== -1
      : href.indexOf(slug) !== -1;
    enlace.classList.toggle("active", activo);
  });
}

function actualizarNavbar() {
  var user = usuarioActual();
  var userInfo = document.getElementById("user-info");
  var acceso = document.getElementById("acceso-botones");
  var userName = document.getElementById("userName");
  ["nav-cart", "nav-orders", "nav-profile", "admin-link"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (id === "admin-link") {
      el.hidden = !(user && String(user.rol).toUpperCase() === "ADMIN");
    } else {
      el.hidden = !user;
    }
  });
  if (user) {
    if (userName && typeof t === "function") {
      userName.textContent = t("nav.hello", { name: (user.nombre || user.username || "").split(/\s+/)[0] });
    }
    if (userInfo) userInfo.style.display = "flex";
    if (acceso) acceso.style.display = "none";
  } else {
    if (userInfo) userInfo.style.display = "none";
    if (acceso) acceso.style.display = "flex";
    acceso && acceso.style.setProperty("gap", "14px");
  }
  if (typeof aplicarI18n === "function") aplicarI18n();
  marcarEnlaceActivo();
  actualizarBadgeCarrito();
}

function exigirSesion() {
  if (usuarioActual()) return true;
  window.location.href = urlApp("/pages/login/login.html");
  return false;
}

function cerrarSesion() {
  limpiarSesion();
  window.location.href = urlApp("/index.html");
}

function cablearRutas(root) {
  (root || document).querySelectorAll("[data-ns-href]").forEach(function (el) {
    el.setAttribute("href", urlApp(el.getAttribute("data-ns-href")));
  });
}

function cargarLayout() {
  var header = document.getElementById("header");
  var footer = document.getElementById("footer-placeholder");
  if (header) header.innerHTML = htmlNavbar();
  if (footer) footer.innerHTML = htmlFooter();
  cablearRutas(document);
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-lang"));
    });
  });
  var out = document.getElementById("btnCerrarSesion");
  if (out) out.addEventListener("click", cerrarSesion);
  actualizarNavbar();
  montarAsistente();
}

function actualizarBadgeCarrito() {
  var badge = document.getElementById("cart-badge");
  if (!badge) return;
  var count = 0;
  try {
    count = JSON.parse(localStorage.getItem("ns_cart") || "[]")
      .reduce(function (sum, item) { return sum + (item.quantity || 0); }, 0);
  } catch (e) {
    count = 0;
  }
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

function toast(mensaje, tipo) {
  var el = document.getElementById("ns-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "ns-toast";
    el.className = "ns-toast";
    document.body.appendChild(el);
  }
  el.textContent = mensaje;
  el.classList.toggle("error", tipo === "error");
  el.classList.add("show");
  setTimeout(function () { el.classList.remove("show"); }, 2800);
}

function refrescarAsistenteI18n() {
  var btn = document.getElementById("assistant-btn");
  var title = document.getElementById("assistant-title");
  var welcome = document.getElementById("assistant-welcome");
  var input = document.getElementById("assistant-input");
  var send = document.getElementById("assistant-send");
  if (btn) btn.setAttribute("aria-label", t("assistant.title"));
  if (title) title.textContent = t("assistant.title");
  if (welcome) welcome.textContent = t("assistant.welcome");
  if (input) input.placeholder = t("assistant.placeholder");
  if (send) send.textContent = t("assistant.send");
}

function montarAsistente() {
  if (document.getElementById("assistant-btn")) return;
  var btn = document.createElement("button");
  btn.id = "assistant-btn";
  btn.className = "assistant-btn";
  btn.type = "button";
  btn.textContent = "✦";
  var panel = document.createElement("div");
  panel.className = "assistant-panel";
  panel.id = "assistant-panel";
  panel.innerHTML =
    '<header><strong id="assistant-title"></strong></header>' +
    '<div class="assistant-log" id="assistant-log"><div class="bot" id="assistant-welcome"></div></div>' +
    '<form id="assistant-form"><input id="assistant-input" autocomplete="off"><button class="btn btn-primary" type="submit" id="assistant-send"></button></form>';
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  refrescarAsistenteI18n();
  btn.addEventListener("click", function () { panel.classList.toggle("open"); });
  document.getElementById("assistant-form").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var input = document.getElementById("assistant-input");
    var msg = (input.value || "").trim();
    if (!msg) return;
    var log = document.getElementById("assistant-log");
    log.insertAdjacentHTML("beforeend", '<div class="me"></div>');
    log.lastElementChild.textContent = msg;
    input.value = "";
    try {
      var res = await chatAsistente(msg);
      log.insertAdjacentHTML("beforeend", '<div class="bot"></div>');
      log.lastElementChild.textContent = res.reply || t("assistant.error");
    } catch (e) {
      log.insertAdjacentHTML("beforeend", '<div class="bot"></div>');
      log.lastElementChild.textContent = t("assistant.error");
    }
    log.scrollTop = log.scrollHeight;
  });
}

document.addEventListener("DOMContentLoaded", cargarLayout);
