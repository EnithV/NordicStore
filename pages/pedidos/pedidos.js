function metodosHtml(order) {
  if (order.status === "PAID") return '<span class="badge text-bg-success">Pagado</span>';
  return '<div class="d-flex flex-wrap gap-2 mt-2">' +
    '<button class="btn btn-sm btn-wood" data-pay="CREDIT_CARD">Tarjeta crédito</button>' +
    '<button class="btn btn-sm btn-wood" data-pay="DEBIT_CARD">Tarjeta débito</button>' +
    '<button class="btn btn-sm btn-gold" data-pay="PAYPAL">PayPal</button>' +
    '<button class="btn btn-sm btn-success" data-pay="WOMPI">Wompi</button>' +
    '<button class="btn btn-sm btn-outline-danger" data-pay="FAIL_CARD">FAIL_CARD</button>' +
    '</div><div class="demo-slot"></div>';
}

async function pintarPedidos() {
  var box = document.getElementById("orders");
  var orders = await obtenerPedidos();
  if (!orders.length) {
    box.innerHTML = '<div class="panel">Aún no hay pedidos. <a href="../carrito/carrito.html">Ir al carrito</a></div>';
    return;
  }
  box.innerHTML = orders.map(function (o) {
    var lines = (o.lines || []).map(function (l) {
      return '<li>' + l.name + " × " + l.quantity + " — " + dinero(l.unitPrice) + "</li>";
    }).join("");
    return '<article class="panel mb-3" data-order="' + o.id + '">' +
      '<div class="d-flex justify-content-between"><strong>Pedido #' + o.id + '</strong><span>' + o.status + '</span></div>' +
      '<ul class="small mt-2">' + lines + '</ul>' +
      '<div>Total ' + dinero(o.total) + '</div>' +
      metodosHtml(o) +
      '</article>';
  }).join("");

  box.querySelectorAll("[data-pay]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var card = btn.closest("[data-order]");
      var orderId = card.getAttribute("data-order");
      var method = btn.getAttribute("data-pay");
      try {
        var res = await pagarPedido(orderId, method);
        if (res.status === "FAILED") {
          toast("Pago rechazado", "error");
          return;
        }
        if (res.status === "PENDING" || res.demo) {
          var slot = card.querySelector(".demo-slot");
          var kind = method === "PAYPAL" ? "paypal" : "wompi";
          slot.innerHTML = '<div class="pay-demo ' + kind + '">' +
            '<strong>' + method + ' demo</strong>' +
            '<p class="small mb-2">Monto ' + dinero(res.amountUsd || 0) +
            (res.amountCop ? " · " + res.amountCop + " COP" : "") + "</p>" +
            '<button class="btn btn-sm btn-wood me-2" data-ok="1">Aprobar</button>' +
            '<button class="btn btn-sm btn-outline-danger" data-ok="0">Rechazar</button></div>';
          slot.querySelectorAll("[data-ok]").forEach(function (b) {
            b.addEventListener("click", async function () {
              await completarPagoDemo(res.id, orderId, b.getAttribute("data-ok") === "1");
              toast(b.getAttribute("data-ok") === "1" ? "Pago aprobado" : "Pago rechazado");
              pintarPedidos();
            });
          });
          return;
        }
        toast("Pago aprobado");
        pintarPedidos();
      } catch (e) {
        toast(e.message || "No se pudo pagar", "error");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", pintarPedidos);
