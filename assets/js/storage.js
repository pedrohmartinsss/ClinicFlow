/* ==========================================================
   STORAGE.JS
   ClinicFlow
   Gerenciamento global do armazenamento local
========================================================== */
const Storage = {
    /* ======================================================
       SALVAR DADOS
    ====================================================== */
    salvar(chave, dados) {
        try {
            localStorage.setItem(
                chave,
                JSON.stringify(dados)
            );
            return true;
        } catch (error) {
            console.error(
                "Erro ao salvar dados:",
                error
            );
            return false;
        }
    },
    /* ======================================================
       BUSCAR DADOS
    ====================================================== */
    buscar(chave) {
        try {
            const dados =
                localStorage.getItem(
                    chave
                );

            if (!dados) {
                return null;
            }
            return JSON.parse(
                dados
            );
        } catch (error) {
            console.error(
                "Erro ao buscar dados:",
                error
            );
            return null;
        }
    },
    /* ======================================================
       REMOVER ITEM
    ====================================================== */
    remover(chave) {
        try {
            localStorage.removeItem(
                chave
            );
            return true;
        } catch (error) {
            console.error(
                "Erro ao remover dados:",
                error
            );
            return false;
        }
    },
    /* ======================================================
       LIMPAR STORAGE
    ====================================================== */
    limpar() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error(
                "Erro ao limpar storage:",
                error
            );
            return false;
        }
    },
    /* ======================================================
       VERIFICAR EXISTÊNCIA
    ====================================================== */
    existe(chave) {
        return (
            localStorage.getItem(chave)
            !== null
        );
    },
    /* ======================================================
       ATUALIZAR ITEM
    ====================================================== */
    atualizar(chave, callback) {
        const dados =
            this.buscar(chave);
        if (!dados) {
            return false;
        }
        const novosDados =
            callback(dados);
        return this.salvar(
            chave,
            novosDados
        );
    }
};