function metodosHtml(order) {
  if (order.status === "PAID") return '<span class="stock">' + t("orders.payOk") + "</span>";
  return '<div class="actions" style="flex-wrap:wrap;margin-top:12px">' +
    '<button class="btn btn-primary" data-pay="CREDIT_CARD">' + t("orders.method.credit") + "</button>" +
    '<button class="btn btn-primary" data-pay="DEBIT_CARD">' + t("orders.method.debit") + "</button>" +
    '<button class="btn btn-primary" data-pay="PAYPAL">' + t("orders.method.paypal") + "</button>" +
    '<button class="btn btn-primary" data-pay="WOMPI">' + t("orders.method.wompi") + "</button>" +
    '<button class="btn btn-danger" data-pay="FAIL_CARD">' + t("orders.method.fail") + "</button>" +
    '</div><div class="demo-slot"></div>';
}

async function pintarPedidos() {
  var box = document.getElementById("orders");
  if (!box) return;
  var orders = await obtenerPedidos();
  if (!orders.length) {
    box.innerHTML = '<div class="card empty-card"><p class="muted">' + t("orders.empty") + "</p></div>";
    return;
  }
  box.innerHTML = orders.map(function (o) {
    var lines = (o.lines || []).map(function (l) {
      return "<li>" + l.name + " × " + l.quantity + " — " + dinero(l.unitPrice) + "</li>";
    }).join("");
    return '<article class="panel" data-order="' + o.id + '" style="margin-bottom:16px">' +
      "<div><strong>" + t("orders.label") + " #" + o.id + "</strong> · " + o.status + "</div>" +
      "<ul>" + lines + "</ul>" +
      "<div>" + t("cart.total", { amount: dinero(o.total) }) + "</div>" +
      metodosHtml(o) +
      "</article>";
  }).join("");

  box.querySelectorAll("[data-pay]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var card = btn.closest("[data-order]");
      var orderId = card.getAttribute("data-order");
      var method = btn.getAttribute("data-pay");
      try {
        var res = await pagarPedido(orderId, method);
        if (res.status === "FAILED") {
          toast(t("orders.payError"), "error");
          return;
        }
        if (res.status === "PENDING" || res.demo) {
          var slot = card.querySelector(".demo-slot");
          var kind = method === "PAYPAL" ? "paypal" : "wompi";
          var approve = method === "PAYPAL" ? t("orders.paypal.approve") : t("orders.wompi.approve");
          var decline = method === "PAYPAL" ? t("orders.paypal.decline") : t("orders.wompi.decline");
          slot.innerHTML = '<div class="pay-demo ' + kind + '">' +
            "<strong>" + (method === "PAYPAL" ? t("orders.paypal.title") : t("orders.wompi.demoTitle")) + "</strong>" +
            "<p>" + dinero(res.amountUsd || 0) + (res.amountCop ? " · " + res.amountCop + " COP" : "") + "</p>" +
            '<button class="btn btn-primary" data-ok="1">' + approve + "</button> " +
            '<button class="btn btn-danger" data-ok="0">' + decline + "</button></div>";
          slot.querySelectorAll("[data-ok]").forEach(function (b) {
            b.addEventListener("click", async function () {
              await completarPagoDemo(res.id, orderId, b.getAttribute("data-ok") === "1");
              toast(b.getAttribute("data-ok") === "1" ? t("orders.payOk") : t("orders.payError"));
              pintarPedidos();
            });
          });
          return;
        }
        toast(t("orders.payOk"));
        pintarPedidos();
      } catch (e) {
        toast(e.message || t("orders.payError"), "error");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof exigirSesion === "function" && !exigirSesion()) return;
  pintarPedidos();
});
document.addEventListener("ns:lang", pintarPedidos);
