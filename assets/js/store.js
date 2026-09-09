function carritoLocal() {
  try {
    return JSON.parse(localStorage.getItem("ns_cart") || "[]");
  } catch (e) {
    return [];
  }
}

function guardarCarritoLocal(items) {
  localStorage.setItem("ns_cart", JSON.stringify(items));
  actualizarBadgeCarrito();
}

function pedidosLocal() {
  try {
    return JSON.parse(localStorage.getItem("ns_orders") || "[]");
  } catch (e) {
    return [];
  }
}

function guardarPedidosLocal(orders) {
  localStorage.setItem("ns_orders", JSON.stringify(orders));
}

async function agregarAlCarrito(producto, cantidad) {
  var qty = Math.max(1, cantidad || 1);
  if (tokenActual()) {
    try {
      await apiFetch("/cart", { method: "POST", body: JSON.stringify({ productId: producto.id, quantity: qty }) });
      toast(producto.name + " añadido al carrito");
      var remoto = await apiFetch("/cart");
      guardarCarritoLocal(remoto);
      return;
    } catch (e) {
      /* sigue en local */
    }
  }
  var cart = carritoLocal();
  var existente = cart.find(function (i) { return Number(i.productId) === Number(producto.id); });
  if (existente) {
    existente.quantity += qty;
    existente.lineTotal = existente.price * existente.quantity;
  } else {
    cart.push({
      id: "local-" + producto.id,
      productId: producto.id,
      name: producto.name,
      price: producto.price,
      imageUrl: producto.imageUrl,
      quantity: qty,
      lineTotal: producto.price * qty
    });
  }
  guardarCarritoLocal(cart);
  toast(producto.name + " añadido al carrito");
}

async function obtenerCarrito() {
  if (tokenActual()) {
    try {
      var remoto = await apiFetch("/cart");
      guardarCarritoLocal(remoto);
      return remoto;
    } catch (e) {
      /* local */
    }
  }
  return carritoLocal();
}

async function cambiarCantidad(item, quantity) {
  if (tokenActual() && typeof item.id === "number") {
    try {
      await apiFetch("/cart/" + item.id, { method: "PUT", body: JSON.stringify({ productId: item.productId, quantity: quantity }) });
      return obtenerCarrito();
    } catch (e) { /* local */ }
  }
  var cart = carritoLocal().map(function (i) {
    if (String(i.productId) === String(item.productId)) {
      i.quantity = Math.max(1, quantity);
      i.lineTotal = i.price * i.quantity;
    }
    return i;
  });
  guardarCarritoLocal(cart);
  return cart;
}

async function quitarDelCarrito(item) {
  if (tokenActual() && typeof item.id === "number") {
    try {
      await apiFetch("/cart/" + item.id, { method: "DELETE" });
      return obtenerCarrito();
    } catch (e) { /* local */ }
  }
  var cart = carritoLocal().filter(function (i) { return String(i.productId) !== String(item.productId); });
  guardarCarritoLocal(cart);
  return cart;
}

async function checkoutCarrito() {
  if (tokenActual()) {
    try {
      var pedido = await apiFetch("/orders/checkout", { method: "POST", body: "{}" });
      guardarCarritoLocal([]);
      return pedido;
    } catch (e) {
      if (e.status === 401) throw e;
    }
  }
  var cart = carritoLocal();
  if (!cart.length) throw new Error("El carrito está vacío");
  var orders = pedidosLocal();
  var pedido = {
    id: Date.now(),
    total: cart.reduce(function (s, i) { return s + Number(i.price) * Number(i.quantity); }, 0),
    status: "PENDING_PAYMENT",
    createdAt: new Date().toISOString(),
    lines: cart.map(function (i) {
      return { productId: i.productId, name: i.name, unitPrice: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity };
    })
  };
  orders.unshift(pedido);
  guardarPedidosLocal(orders);
  guardarCarritoLocal([]);
  return pedido;
}

async function obtenerPedidos() {
  if (tokenActual()) {
    try {
      return await apiFetch("/orders");
    } catch (e) { /* local */ }
  }
  return pedidosLocal();
}

async function pagarPedido(orderId, method) {
  if (tokenActual()) {
    try {
      return await apiFetch("/payments", { method: "POST", body: JSON.stringify({ orderId: orderId, method: method }) });
    } catch (e) {
      if (e.status && e.status !== 0) throw e;
    }
  }
  var orders = pedidosLocal();
  var order = orders.find(function (o) { return Number(o.id) === Number(orderId); });
  if (!order) throw new Error("Pedido no encontrado");
  if (method === "FAIL_CARD") {
    return { status: "FAILED", method: method, orderId: orderId, demo: true };
  }
  if (method === "PAYPAL" || method === "WOMPI") {
    return {
      id: "demo-" + orderId,
      status: "PENDING",
      method: method,
      orderId: orderId,
      amountUsd: order.total,
      amountCop: Math.round(order.total * 4000),
      demo: true
    };
  }
  order.status = "PAID";
  guardarPedidosLocal(orders);
  return { status: "SUCCESS", method: method, orderId: orderId };
}

async function completarPagoDemo(paymentId, orderId, approve) {
  if (tokenActual() && String(paymentId).indexOf("demo-") !== 0) {
    try {
      var res = await apiFetch("/payments/" + paymentId + "/demo-complete", {
        method: "POST",
        body: JSON.stringify({ approve: approve })
      });
      return res;
    } catch (e) { /* local */ }
  }
  var orders = pedidosLocal();
  var order = orders.find(function (o) { return Number(o.id) === Number(orderId); });
  if (order && approve) {
    order.status = "PAID";
    guardarPedidosLocal(orders);
  }
  return { status: approve ? "SUCCESS" : "FAILED" };
}

async function chatAsistente(mensaje) {
  try {
    return await apiFetch("/assistant/chat", { method: "POST", body: JSON.stringify({ message: mensaje }) });
  } catch (e) {
    var catalogo = await cargarProductos(mensaje);
    if (!catalogo.length) {
      return { reply: "El API está dormido y no encontré ese producto en el catálogo local. Prueba auriculares, tablet o cámara." };
    }
    var lineas = catalogo.slice(0, 5).map(function (p) {
      return "• " + p.name + " — " + dinero(p.price);
    }).join("\n");
    return { reply: "Catálogo local (el API puede estar iniciando):\n" + lineas };
  }
}
