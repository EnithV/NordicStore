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

async function cargarProductos(query) {
  try {
    var qs = query ? "?q=" + encodeURIComponent(query) : "";
    return await apiFetch("/products" + qs);
  } catch (e) {
    var res = await fetch(urlApp("/assets/data/catalog.json"));
    var catalogo = await res.json();
    if (!query) return catalogo;
    var q = query.toLowerCase();
    return catalogo.filter(function (p) {
      return (p.name + " " + p.description + " " + (p.category && p.category.name || "")).toLowerCase().indexOf(q) !== -1;
    });
  }
}
