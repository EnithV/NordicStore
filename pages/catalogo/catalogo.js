var todos = [];

function pintar() {
  var q = (document.getElementById("q").value || "").toLowerCase();
  var cat = document.getElementById("cat").value;
  var lista = todos.filter(function (p) {
    var blob = (p.name + " " + p.description + " " + ((p.category && p.category.name) || "")).toLowerCase();
    var okQ = !q || blob.indexOf(q) !== -1;
    var okC = !cat || ((p.category && p.category.name) === cat);
    return okQ && okC;
  });
  var grid = document.getElementById("grid");
  grid.innerHTML = lista.length ? lista.map(tarjetaProducto).join("") : '<p class="text-secondary">Sin coincidencias.</p>';
}

document.addEventListener("DOMContentLoaded", async function () {
  todos = await cargarProductos();
  var cats = {};
  todos.forEach(function (p) {
    if (p.category && p.category.name) cats[p.category.name] = true;
  });
  var select = document.getElementById("cat");
  Object.keys(cats).forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  pintar();
  document.getElementById("q").addEventListener("input", pintar);
  select.addEventListener("change", pintar);
  document.getElementById("grid").addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-add]");
    if (!btn) return;
    var prod = todos.find(function (p) { return Number(p.id) === Number(btn.getAttribute("data-add")); });
    if (prod) agregarAlCarrito(prod, 1);
  });
});
