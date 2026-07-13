/* ==========================================================
   MODAL.JS
   ClinicFlow
   Gerenciamento global de modais
========================================================== */
const Modal = {
    abrir(selector) {
        if (!selector.startsWith("#")) {
            selector = "#" + selector;
        }
        const modal = document.querySelector(selector);
        if (!modal)
            return;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    },
    fechar(selector) {
        if (!selector.startsWith("#")) {
            selector = "#" + selector;
        }
        const modal = document.querySelector(selector);
        if (!modal)
            return;
        modal.classList.remove("active");
        document.body.style.overflow = "";
    },
    fecharTodos() {
        const modais =
            document.querySelectorAll(
                ".modal-overlay"
            );
        modais.forEach(
            modal => {
                modal.classList.remove(
                    "active"
                );
            }
        );
        document.body.style.overflow =
            "";
    }
};
/* ==========================================================
   FECHAR CLICANDO FORA
========================================================== */
document.addEventListener(
    "click",
    (event) => {
        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {
            Modal.fecharTodos();
        }
    });
/* ==========================================================
   FECHAR COM ESC
========================================================== */
document.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Escape") {
            Modal.fecharTodos();
        }
    });