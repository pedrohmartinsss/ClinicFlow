/* ==========================================================
   UTILS.JS
   ClinicFlow
   Funções auxiliares globais
========================================================== */
const Utils = {
    /* ======================================================
       GERAR ID ÚNICO
    ====================================================== */
    gerarId() {
        return Date.now();
    },
    /* ======================================================
       FORMATAR CPF
    ====================================================== */
    formatarCPF(valor) {
        if (!valor)
            return "";
        valor =
            valor
                .replace(/\D/g, "")
                .substring(0, 11);
        return valor
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d{1,2})$/,
                "$1-$2"
            );
    },
    /* ======================================================
       FORMATAR TELEFONE
    ====================================================== */
    formatarTelefone(valor) {
        if (!valor)
            return "";
        valor =
            valor
                .replace(/\D/g, "")
                .substring(0, 11);
        if (valor.length <= 10) {
            return valor.replace(
                /(\d{2})(\d{4})(\d{0,4})/,
                "($1) $2-$3"
            );
        }
        return valor.replace(
            /(\d{2})(\d{5})(\d{0,4})/,
            "($1) $2-$3"
        );
    },
    /* ======================================================
       FORMATAR MOEDA BRASILEIRA
    ====================================================== */
    moeda(valor) {
        return Number(valor)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );
    },
    /* ======================================================
       FORMATAR DATA
    ====================================================== */
    data(valor) {
        if (!valor)
            return "-";
        const data =
            new Date(valor);
        return data.toLocaleDateString(
            "pt-BR"
        );
    },
    /* ======================================================
       DATA E HORA ATUAL
    ====================================================== */
    agora() {
        return new Date();
    },
    /* ======================================================
       VALIDAR EMAIL
    ====================================================== */
    emailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);
    },
    /* ======================================================
       VALIDAR CPF BÁSICO
    ====================================================== */
    cpfValido(cpf) {
        cpf =
            cpf.replace(
                /\D/g,
                ""
            );
        return cpf.length === 11;
    },
    /* ======================================================
       CAPITALIZAR TEXTO
    ====================================================== */
    capitalizar(texto) {
        if (!texto)
            return "";
        return texto
            .toLowerCase()
            .replace(
                /\b\w/g,
                letra =>
                    letra.toUpperCase()
            );
    },
    /* ======================================================
       LIMPAR FORMULÁRIO
    ====================================================== */
    limparFormulario(form) {
        if (form) {
            form.reset();
        }
    },
    /* ======================================================
       DEBOUNCE
       Útil para pesquisas
    ====================================================== */
    debounce(funcao, tempo = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer =
                setTimeout(
                    () => {
                        funcao.apply(
                            this,
                            args
                        );
                    },
                    tempo
                );
        };
    }
};