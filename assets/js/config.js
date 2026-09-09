const API_BASE = "https://nordicstore-api.onrender.com";
if (typeof window !== "undefined") {
  window.API_BASE = API_BASE;
}

const FRONTEND_BASE_URL = "https://enithv.github.io/NordicStore";
const GITHUB_PAGES_BASE_PATH = "/NordicStore";

function obtenerBaseAplicacion() {
  var path = window.location.pathname || "";
  var pagesIdx = path.indexOf("/pages/");
  if (pagesIdx >= 0) {
    return pagesIdx > 0 ? path.substring(0, pagesIdx) : "";
  }
  if (GITHUB_PAGES_BASE_PATH && path.indexOf(GITHUB_PAGES_BASE_PATH) === 0) {
    return GITHUB_PAGES_BASE_PATH;
  }
  if (window.location.hostname.indexOf("github.io") !== -1 && GITHUB_PAGES_BASE_PATH) {
    return GITHUB_PAGES_BASE_PATH;
  }
  return "";
}

function urlApp(rutaDesdeRaiz) {
  var base = obtenerBaseAplicacion();
  var ruta = rutaDesdeRaiz.charAt(0) === "/" ? rutaDesdeRaiz : "/" + rutaDesdeRaiz;
  return base + ruta;
}

function dinero(valor) {
  return "$" + Number(valor || 0).toFixed(2) + " USD";
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

function saludoNavbar(nombre) {
  var limpio = (nombre || "").trim();
  if (!limpio) return "Hola";
  return "Hola, " + limpio.split(/\s+/)[0];
}

function marcarEnlaceActivo() {
  var slug = (window.location.pathname || "").split("/").filter(Boolean).pop() || "index.html";
  document.querySelectorAll(".navbar-nav .nav-link").forEach(function (enlace) {
    var href = enlace.getAttribute("href") || "";
    var activo = href.indexOf(slug) !== -1 || (slug === "index.html" && href.indexOf("index.html") !== -1);
    enlace.classList.toggle("active", activo);
  });
}

function actualizarNavbar() {
  var user = usuarioActual();
  var userInfo = document.getElementById("user-info");
  var acceso = document.getElementById("acceso-botones");
  var userName = document.getElementById("userName");
  var adminLink = document.getElementById("admin-link");
  var pedidosLink = document.getElementById("pedidos-link");

  if (user) {
    if (userName) userName.textContent = saludoNavbar(user.nombre || user.username);
    if (userInfo) userInfo.style.display = "flex";
    if (acceso) acceso.style.display = "none";
    if (adminLink) adminLink.style.display = (user.rol || "").toString().toUpperCase() === "ADMIN" ? "" : "none";
  } else {
    if (userInfo) userInfo.style.display = "none";
    if (acceso) acceso.style.display = "block";
    if (adminLink) adminLink.style.display = "none";
  }
  marcarEnlaceActivo();
  actualizarBadgeCarrito();
}

function cerrarSesion() {
  limpiarSesion();
  window.location.href = urlApp("/index.html");
}

function cargarLayout() {
  var header = document.getElementById("header");
  var footer = document.getElementById("footer-placeholder");
  var navPath = urlApp("/components/navbar/navbar.html");
  var footPath = urlApp("/components/footer/footer.html");

  if (header) {
    fetch(navPath)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        header.innerHTML = html;
        header.querySelectorAll("[data-ns-href]").forEach(function (el) {
          el.setAttribute("href", urlApp(el.getAttribute("data-ns-href")));
        });
        actualizarNavbar();
        var btn = document.getElementById("btnCerrarSesion");
        if (btn) btn.addEventListener("click", cerrarSesion);
      })
      .catch(function () { /* layout opcional */ });
  }
  if (footer) {
    fetch(footPath)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        footer.innerHTML = html;
        footer.querySelectorAll("[data-ns-href]").forEach(function (el) {
          el.setAttribute("href", urlApp(el.getAttribute("data-ns-href")));
        });
      })
      .catch(function () { /* footer opcional */ });
  }
  montarAsistente();
}

function actualizarBadgeCarrito() {
  var badge = document.getElementById("cart-badge");
  if (!badge) return;
  var count = 0;
  try {
    var cart = JSON.parse(localStorage.getItem("ns_cart") || "[]");
    count = cart.reduce(function (sum, item) { return sum + (item.quantity || 0); }, 0);
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

function montarAsistente() {
  if (document.getElementById("assistant-btn")) return;
  var btn = document.createElement("button");
  btn.id = "assistant-btn";
  btn.className = "assistant-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Asistente de compra");
  btn.innerHTML = '<i class="fa-solid fa-comments"></i>';
  var panel = document.createElement("div");
  panel.className = "assistant-panel";
  panel.id = "assistant-panel";
  panel.innerHTML =
    "<header>Asistente NordicStore</header>" +
    '<div class="assistant-log" id="assistant-log"><div class="bot">Pregúntame por un producto. Uso el catálogo real y no invento precios. No hago checkout.</div></div>' +
    '<form id="assistant-form"><input class="form-control form-control-sm" id="assistant-input" placeholder="Ej. auriculares" autocomplete="off"><button class="btn btn-sm btn-wood" type="submit">Enviar</button></form>';
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  btn.addEventListener("click", function () {
    panel.classList.toggle("open");
  });
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
      log.lastElementChild.textContent = res.reply || "Sin respuesta";
    } catch (e) {
      log.insertAdjacentHTML("beforeend", '<div class="bot"></div>');
      log.lastElementChild.textContent = "No pude consultar el catálogo ahora.";
    }
    log.scrollTop = log.scrollHeight;
  });
}

document.addEventListener("DOMContentLoaded", cargarLayout);
