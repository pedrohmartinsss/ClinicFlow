/* ==========================================================
   AUTH.JS
   ClinicFlow
   Controle centralizado de autenticação
========================================================== */
const Auth = {
    CHAVE_SESSAO: "clinicflow_sessao",
    CHAVE_USUARIO: "clinicflow_usuario",
    MAPA_PERMISSOES_FALLBACK: {
        Administrador: {
            dashboard: true,
            pacientes: true,
            agenda: true,
            profissionais: true,
            servicos: true,
            financeiro: true,
            relatorios: true,
            configuracoes: true,
            usuarios: true
        },
        Gerente: {
            dashboard: true,
            pacientes: true,
            agenda: true,
            profissionais: true,
            servicos: true,
            financeiro: true,
            relatorios: true,
            configuracoes: false,
            usuarios: false
        },
        Recepcionista: {
            dashboard: true,
            pacientes: true,
            agenda: true,
            profissionais: false,
            servicos: false,
            financeiro: false,
            relatorios: false,
            configuracoes: false,
            usuarios: false
        },
        Profissional: {
            dashboard: true,
            pacientes: false,
            agenda: true,
            profissionais: true,
            servicos: false,
            financeiro: false,
            relatorios: false,
            configuracoes: false,
            usuarios: false
        },
        Financeiro: {
            dashboard: true,
            pacientes: false,
            agenda: false,
            profissionais: false,
            servicos: false,
            financeiro: true,
            relatorios: true,
            configuracoes: false,
            usuarios: false
        },
        admin: {
            dashboard: true,
            pacientes: true,
            agenda: true,
            profissionais: true,
            servicos: true,
            financeiro: true,
            relatorios: true,
            configuracoes: true,
            usuarios: true
        }
    },
    login(usuario) {
        Storage.salvar(this.CHAVE_SESSAO, {
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            autenticado: true,
            dataLogin: new Date().toISOString(),
            permissoes: usuario.permissoes || {}
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
        const sessao = this.usuarioLogado();
        return Boolean(sessao?.autenticado);
    },
    getPermissoesUsuario() {
        const sessao = this.usuarioLogado();
        if (!sessao) {
            return null;
        }

        if (sessao.permissoes && typeof sessao.permissoes === "object" && Object.keys(sessao.permissoes).length > 0) {
            return sessao.permissoes;
        }

        const perfil = (sessao.perfil || "").toString().trim();
        const fallback = this.MAPA_PERMISSOES_FALLBACK[perfil];
        if (fallback) {
            return fallback;
        }

        const usuarios = Storage.buscar("clinicflow_usuarios") || [];
        const usuarioAtual = usuarios.find((usuario) => usuario.id === sessao.usuarioId || (usuario.login || "").toLowerCase() === (sessao.login || "").toLowerCase());

        if (usuarioAtual?.permissoes && typeof usuarioAtual.permissoes === "object" && Object.keys(usuarioAtual.permissoes).length > 0) {
            return usuarioAtual.permissoes;
        }

        if (usuarioAtual?.perfil) {
            return this.MAPA_PERMISSOES_FALLBACK[usuarioAtual.perfil] || null;
        }

        return null;
    },
    temPermissao(modulo) {
        const permissoes = this.getPermissoesUsuario();
        if (!permissoes) {
            return false;
        }

        return Boolean(permissoes[modulo]);
    },
    obterPrimeiraPaginaPermitida() {
        const mapaRota = {
            dashboard: "dashboard.html",
            pacientes: "pacientes.html",
            agenda: "agenda.html",
            profissionais: "profissionais.html",
            servicos: "servicos.html",
            financeiro: "financeiro.html",
            relatorios: "relatorios.html",
            configuracoes: "configuracoes.html",
            usuarios: "usuarios.html"
        };

        const permissoes = this.getPermissoesUsuario() || {};
        const moduloPermitido = Object.keys(mapaRota).find((modulo) => Boolean(permissoes[modulo]));
        return mapaRota[moduloPermitido] || null;
    },
    protegerPagina() {
        if (!this.estaLogado()) {
            window.location.href = "../index.html";
            return;
        }

        const paginaAtual = window.location.pathname.split("/").pop();
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

        const modulo = mapaPermissao[paginaAtual];
        if (!modulo) {
            return;
        }

        if (!this.temPermissao(modulo)) {
            const proximaPagina = this.obterPrimeiraPaginaPermitida();
            if (proximaPagina && proximaPagina !== paginaAtual) {
                window.location.href = proximaPagina;
            } else {
                window.location.href = "../index.html";
            }
        }
    }
};