/* ==========================================================
   CARDS.JS
   ClinicFlow
   Controle dos cards indicadores
========================================================== */
const Cards = {
    atualizar(selector, valor) {
        const elemento =
            document.querySelector(selector);
        if (!elemento)
            return;
        elemento.innerText =
            valor;
    },
    incrementar(selector) {
        const elemento =
            document.querySelector(selector);
        if (!elemento)
            return;
        let valor =
            Number(
                elemento.innerText
            );
        elemento.innerText =
            valor + 1;
    },
    decrementar(selector) {
        const elemento =
            document.querySelector(selector);
        if (!elemento)
            return;
        let valor =
            Number(
                elemento.innerText
            );
        if (valor > 0) {
            elemento.innerText =
                valor - 1;
        }
    }
};