function tarjetaProducto(p) {
  var cat = (p.category && p.category.name) || "";
  var stock = Number(p.stock || 0);
  var stockHtml = stock > 0
    ? '<span class="stock">' + stock + " en stock</span>"
    : '<span class="stock out">Sin stock</span>';
  return (
    '<article class="card product">' +
      '<div class="thumb"><img src="' + p.imageUrl + '" alt="' + p.name + '"></div>' +
      '<div class="product-body">' +
        '<span class="category">' + cat + "</span>" +
        "<h3>" + p.name + "</h3>" +
        '<p class="desc">' + (p.description || "") + "</p>" +
        '<div class="product-foot"><span class="price">' + dinero(p.price) + "</span>" + stockHtml + "</div>" +
        '<button class="btn btn-primary block" data-add="' + p.id + '"' + (stock <= 0 ? " disabled" : "") + ">Añadir al carrito</button>" +
      "</div>" +
    "</article>"
  );
}

document.addEventListener("DOMContentLoaded", async function () {
  var box = document.getElementById("featured");
  if (!box) return;
  var products = await cargarProductos();
  box.innerHTML = products.map(tarjetaProducto).join("");
  box.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-add]");
    if (!btn) return;
    var prod = products.find(function (p) { return Number(p.id) === Number(btn.getAttribute("data-add")); });
    if (prod) agregarAlCarrito(prod, 1);
  });
});
