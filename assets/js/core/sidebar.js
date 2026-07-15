/* ==========================================================
   SIDEBAR
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const paginaAtual = window.location.pathname
        .split("/")
        .pop();

    document.querySelectorAll(".sidebar a").forEach(link => {

        const href = link.getAttribute("href");

        if (href === paginaAtual) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }

    });

});