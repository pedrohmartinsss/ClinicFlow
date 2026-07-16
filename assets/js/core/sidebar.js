/* ==========================================================
   SIDEBAR
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const paginaAtual = window.location.pathname
        .split("/")
        .pop();

    const mapaPermissao = {
        "dashboard.html": "dashboard",
        "pacientes.html": "pacientes",
        "agenda.html": "agenda",
        "profissionais.html": "profissionais",
        "servicos.html": "servicos",
        "financeiro.html": "financeiro",
        "relatorios.html": "relatorios",
        "configuracoes.html": "configuracoes",
        "usuarios.html": "usuarios"
    };

    document.querySelectorAll(".sidebar li").forEach(item => {
        const link = item.querySelector("a");
        const href = link?.getAttribute("href");
        const modulo = mapaPermissao[href] || null;

        if (!modulo) {
            return;
        }

        const permitido = Auth.temPermissao(modulo);
        if (!permitido) {
            item.style.display = "none";
            return;
        }

        if (href === paginaAtual) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

});