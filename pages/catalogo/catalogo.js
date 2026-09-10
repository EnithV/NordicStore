function iniciarFiltrosCatalogo() {
  var select = document.getElementById("cat");
  var q = document.getElementById("q");
  var ready = setInterval(function () {
    if (!nsProductos.length) return;
    clearInterval(ready);
    if (select && select.options.length <= 1) {
      select.innerHTML = '<option value="">' + t("catalog.all") + "</option>";
      var cats = {};
      nsProductos.forEach(function (p) {
        if (p.category && p.category.name) cats[p.category.name] = true;
      });
      Object.keys(cats).forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
      select.addEventListener("change", pintarCatalogo);
    }
    if (q) q.addEventListener("input", pintarCatalogo);
  }, 50);
}

if (typeof nsReady === "function") {
  nsReady(iniciarFiltrosCatalogo);
} else {
  document.addEventListener("DOMContentLoaded", iniciarFiltrosCatalogo);
}
