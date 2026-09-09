async function pintarCarrito() {
  var items = await obtenerCarrito();
  var box = document.getElementById("cart-box");
  if (!items.length) {
    box.innerHTML = '<p>Tu carrito está vacío.</p><a class="btn btn-primary" href="../../index.html">Ir al catálogo</a>';
    return;
  }
  var total = items.reduce(function (s, i) { return s + Number(i.price) * Number(i.quantity); }, 0);
  box.innerHTML = items.map(function (i, idx) {
    return '<div class="cart-row">' +
      '<img src="' + (i.imageUrl || "") + '" alt="">' +
      '<div style="flex:1"><strong>' + i.name + '</strong><div class="muted">' + dinero(i.price) + '</div></div>' +
      '<input type="number" min="1" value="' + i.quantity + '" data-idx="' + idx + '">' +
      '<button class="btn btn-danger" data-del="' + idx + '">Quitar</button>' +
      '</div>';
  }).join("") +
    '<div class="row-between">' +
      '<strong>Total ' + dinero(total) + '</strong>' +
      '<button class="btn btn-primary" id="btn-checkout">Crear pedido</button>' +
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
