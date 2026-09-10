function tarjetaProducto(p) {
  var stock = Number(p.stock || 0);
  var name = typeof productoNombre === "function" ? productoNombre(p) : p.name;
  var desc = typeof productoDesc === "function" ? productoDesc(p) : (p.description || "");
  var stockHtml = stock > 0
    ? '<span class="stock">' + t("catalog.inStock", { n: stock }) + "</span>"
    : '<span class="stock out">' + t("catalog.outOfStock") + "</span>";
  var cat = (p.category && p.category.name) || "";
  return (
    '<article class="card product">' +
      '<div class="thumb"><img src="' + p.imageUrl + '" alt="' + name + '"></div>' +
      '<div class="product-body">' +
        '<span class="category">' + cat + "</span>" +
        "<h3>" + name + "</h3>" +
        '<p class="desc">' + desc + "</p>" +
        '<div class="product-foot"><span class="price">' + dinero(p.price) + "</span>" + stockHtml + "</div>" +
        '<button class="btn btn-primary block" data-add="' + p.id + '"' + (stock <= 0 ? " disabled" : "") + ">" + t("catalog.add") + "</button>" +
      "</div>" +
    "</article>"
  );
}

var nsProductos = [];

async function pintarCatalogo() {
  var box = document.getElementById("featured") || document.getElementById("grid");
  if (!box) return;
  if (!nsProductos.length) {
    nsProductos = await cargarProductos();
  }
  var lista = nsProductos;
  var q = document.getElementById("q");
  var cat = document.getElementById("cat");
  if (q || cat) {
    var query = ((q && q.value) || "").toLowerCase();
    var catVal = (cat && cat.value) || "";
    lista = nsProductos.filter(function (p) {
      var blob = (productoNombre(p) + " " + productoDesc(p) + " " + ((p.category && p.category.name) || "")).toLowerCase();
      return (!query || blob.indexOf(query) !== -1) && (!catVal || ((p.category && p.category.name) === catVal));
    });
  }
  box.innerHTML = lista.length ? lista.map(tarjetaProducto).join("") : '<p class="lede">' + t("catalog.empty") + "</p>";
}

var homeListo = false;

function iniciarHome() {
  var box = document.getElementById("featured") || document.getElementById("grid");
  if (!box) return;
  pintarCatalogo();
  if (homeListo) return;
  homeListo = true;
  box.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-add]");
    if (!btn) return;
    var prod = nsProductos.find(function (p) { return Number(p.id) === Number(btn.getAttribute("data-add")); });
    if (prod) agregarAlCarrito(prod, 1);
  });
}

if (typeof nsReady === "function") {
  nsReady(iniciarHome);
} else {
  document.addEventListener("DOMContentLoaded", iniciarHome);
}

document.addEventListener("ns:lang", function () {
  if (document.getElementById("featured") || document.getElementById("grid")) {
    pintarCatalogo();
  }
});
