async function apiFetch(ruta, opciones) {
  var opts = opciones || {};
  var headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
  if (opts.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  var token = tokenActual();
  if (token) {
    headers.Authorization = "Bearer " + token;
  }
  var respuesta = await fetch(API_BASE + ruta, Object.assign({}, opts, { headers: headers }));
  var data = null;
  var text = await respuesta.text();
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
  }
  if (!respuesta.ok) {
    var error = new Error((data && (data.error || data.message)) || "Error " + respuesta.status);
    error.status = respuesta.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function apiDisponible() {
  try {
    await fetch(API_BASE + "/health", { headers: { Accept: "application/json" } });
    return true;
  } catch (e) {
    return false;
  }
}

function catalogoUrl() {
  var url = "assets/data/catalog.json";
  if (typeof nsAsset === "function") url = nsAsset(url);
  else if (typeof urlApp === "function") url = urlApp("/assets/data/catalog.json");
  return url + "?v=5";
}

function fetchConTiempo(url, opciones, ms) {
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, ms || 2000);
  return fetch(url, Object.assign({}, opciones || {}, { signal: ctrl.signal })).finally(function () {
    clearTimeout(timer);
  });
}

async function catalogoLocal(query) {
  var res = await fetch(catalogoUrl());
  var catalogo = await res.json();
  if (!query) return catalogo;
  var q = query.toLowerCase();
  return catalogo.filter(function (p) {
    return (p.name + " " + p.description + " " + ((p.category && p.category.name) || "")).toLowerCase().indexOf(q) !== -1;
  });
}

async function cargarProductos(query) {
  try {
    return await catalogoLocal(query);
  } catch (e) {
    try {
      var qs = query ? "?q=" + encodeURIComponent(query) : "";
      var respuesta = await fetchConTiempo(API_BASE + "/products" + qs, {
        headers: { Accept: "application/json" }
      }, 2000);
      if (!respuesta.ok) throw new Error("API " + respuesta.status);
      return await respuesta.json();
    } catch (e2) {
      return [];
    }
  }
}
