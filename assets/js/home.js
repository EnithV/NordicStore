function tarjetaProducto(p) {
  var cat = (p.category && p.category.name) || "";
  return (
    '<div class="col-md-6 col-lg-3">' +
      '<article class="product-card">' +
        '<img src="' + p.imageUrl + '" alt="' + p.name + '" loading="lazy">' +
        '<div class="body">' +
          '<div class="cat">' + cat + "</div>" +
          "<h3 class=\"h6 mb-1\">" + p.name + "</h3>" +
          '<p class="small text-secondary flex-grow-1">' + (p.description || "") + "</p>" +
          '<div class="d-flex justify-content-between align-items-center mt-2">' +
            '<span class="price">' + dinero(p.price) + "</span>" +
            '<button class="btn btn-sm btn-wood" data-add="' + p.id + '">Añadir</button>' +
          "</div>" +
        "</div>" +
      "</article>" +
    "</div>"
  );
}

document.addEventListener("DOMContentLoaded", async function () {
  var box = document.getElementById("featured");
  if (!box) return;
  var products = await cargarProductos();
  var dest = products.slice(0, 4);
  box.innerHTML = dest.map(tarjetaProducto).join("");
  box.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-add]");
    if (!btn) return;
    var id = Number(btn.getAttribute("data-add"));
    var prod = products.find(function (p) { return Number(p.id) === id; });
    if (prod) agregarAlCarrito(prod, 1);
  });
});
