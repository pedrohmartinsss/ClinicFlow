/* ==========================================================
   AUTH.JS
   ClinicFlow
   Controle centralizado de autenticação
========================================================== */
const Auth = {
    CHAVE_SESSAO: "clinicflow_sessao",
    CHAVE_USUARIO: "clinicflow_usuario",
    login(usuario) {
        Storage.salvar(this.CHAVE_SESSAO, {
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            autenticado: true,
            dataLogin: new Date().toISOString()
        });
    },
    logout() {
        Storage.remover(this.CHAVE_SESSAO);
        window.location.href = "../index.html";
    },
    usuarioLogado() {
        return Storage.buscar(this.CHAVE_SESSAO);
    },
    estaLogado() {
        return this.usuarioLogado() !== null;
    },
    protegerPagina() {
        if (!this.estaLogado()) {
            window.location.href = "../index.html";
        }
    }
};