async function pintarCarrito() {
  var box = document.getElementById("cart-box");
  if (!box) return;
  var items = await obtenerCarrito();
  if (!items.length) {
    box.innerHTML = '<div class="card empty-card"><p class="muted">' + t("cart.empty") +
      '</p><a class="btn btn-outline" href="' + urlApp("/index.html") + '">' + t("cart.goCatalog") + "</a></div>";
    return;
  }
  var total = items.reduce(function (s, i) { return s + Number(i.price) * Number(i.quantity); }, 0);
  var rows = items.map(function (i, idx) {
    return "<tr>" +
      '<td class="name">' + (i.name || "") + "</td>" +
      "<td>" + dinero(i.price) + "</td>" +
      '<td><div class="qty">' +
        '<button type="button" class="qty-btn" data-delta="-1" data-idx="' + idx + '">−</button>' +
        "<span>" + i.quantity + "</span>" +
        '<button type="button" class="qty-btn" data-delta="1" data-idx="' + idx + '">+</button>' +
      "</div></td>" +
      "<td>" + dinero(Number(i.price) * Number(i.quantity)) + "</td>" +
      '<td><button type="button" class="btn btn-danger" data-del="' + idx + '">' + t("cart.remove") + "</button></td>" +
      "</tr>";
  }).join("");
  box.innerHTML =
    '<div class="card"><table class="items"><thead><tr>' +
      "<th>" + t("cart.product") + "</th><th>" + t("cart.price") + "</th><th>" + t("cart.qty") + "</th><th>" + t("cart.subtotal") + "</th><th></th>" +
    "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
    '<div class="card summary">' +
      "<div><span class=\"muted\">" + t("cart.items", { n: items.reduce(function (s, i) { return s + Number(i.quantity); }, 0) }) +
      '</span><div class="total">' + t("cart.total", { amount: dinero(total) }) + "</div></div>" +
      '<div class="actions">' +
        '<button type="button" class="btn btn-danger" id="btn-clear">' + t("cart.clear") + "</button>" +
        '<button type="button" class="btn btn-primary" id="btn-checkout">' + t("cart.checkout") + "</button>" +
      "</div></div>";

  box.querySelectorAll(".qty-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var item = items[Number(btn.getAttribute("data-idx"))];
      var next = Number(item.quantity) + Number(btn.getAttribute("data-delta"));
      if (next < 1) return;
      await cambiarCantidad(item, next);
      pintarCarrito();
    });
  });
  box.querySelectorAll("[data-del]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      await quitarDelCarrito(items[Number(btn.getAttribute("data-del"))]);
      pintarCarrito();
    });
  });
  var clear = document.getElementById("btn-clear");
  if (clear) {
    clear.addEventListener("click", async function () {
      for (var i = 0; i < items.length; i++) await quitarDelCarrito(items[i]);
      pintarCarrito();
    });
  }
  document.getElementById("btn-checkout").addEventListener("click", async function () {
    try {
      var pedido = await checkoutCarrito();
      toast(t("orders.label") + " #" + pedido.id);
      window.location.href = urlApp("/pages/pedidos/pedidos.html");
    } catch (e) {
      toast(e.message || t("cart.checkoutError"), "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof exigirSesion === "function" && !exigirSesion()) return;
  pintarCarrito();
});
document.addEventListener("ns:lang", pintarCarrito);
