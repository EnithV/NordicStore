async function pintarCarrito() {
  var items = await obtenerCarrito();
  var box = document.getElementById("cart-box");
  if (!items.length) {
    box.innerHTML = '<p class="mb-2">Tu carrito está vacío.</p><a class="btn btn-wood" href="../catalogo/catalogo.html">Ir al catálogo</a>';
    return;
  }
  var total = items.reduce(function (s, i) { return s + Number(i.price) * Number(i.quantity); }, 0);
  box.innerHTML = items.map(function (i, idx) {
    return '<div class="d-flex gap-3 align-items-center cart-row py-3 border-bottom">' +
      '<img src="' + (i.imageUrl || "") + '" alt="">' +
      '<div class="flex-grow-1"><strong>' + i.name + '</strong><div class="small text-secondary">' + dinero(i.price) + '</div></div>' +
      '<input type="number" min="1" class="form-control" style="width:5rem" value="' + i.quantity + '" data-idx="' + idx + '">' +
      '<button class="btn btn-sm btn-outline-danger" data-del="' + idx + '">Quitar</button>' +
      '</div>';
  }).join("") +
    '<div class="d-flex justify-content-between align-items-center pt-3">' +
      '<strong>Total ' + dinero(total) + '</strong>' +
      '<button class="btn btn-gold" id="btn-checkout">Crear pedido</button>' +
    '</div>';

  box.querySelectorAll("input[data-idx]").forEach(function (input) {
    input.addEventListener("change", async function () {
      var item = items[Number(input.getAttribute("data-idx"))];
      await cambiarCantidad(item, Number(input.value));
      pintarCarrito();
    });
  });
  box.querySelectorAll("[data-del]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var item = items[Number(btn.getAttribute("data-del"))];
      await quitarDelCarrito(item);
      pintarCarrito();
    });
  });
  document.getElementById("btn-checkout").addEventListener("click", async function () {
    try {
      var pedido = await checkoutCarrito();
      toast("Pedido #" + pedido.id + " creado");
      window.location.href = urlApp("/pages/pedidos/pedidos.html");
    } catch (e) {
      toast(e.message || "No se pudo crear el pedido", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", pintarCarrito);
