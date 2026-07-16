/* ==========================================================
   LOGIN.JS
   ClinicFlow
   Controle de autenticação frontend
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        criarUsuarioInicial();

        if (Auth.estaLogado()) {
            const proximaPagina = Auth.obterPrimeiraPaginaPermitida();
            if (proximaPagina) {
                window.location.replace(`html/${proximaPagina}`);
                return;
            }

            // Sessões antigas ou corrompidas podem não possuir permissões.
            // Não as redirecionamos para uma página que irá recusá-las.
            Auth.limparSessao();
        }

        iniciarLogin();
    });
/* ==========================================================
   USUÁRIO PADRÃO
========================================================== */
const PERMISSOES_ADMINISTRADOR = {
    dashboard: true,
    pacientes: true,
    agenda: true,
    profissionais: true,
    servicos: true,
    financeiro: true,
    relatorios: true,
    configuracoes: true,
    usuarios: true
};

function criarUsuarioInicial() {
    const usuarios = Storage.buscar("clinicflow_usuarios") || [];
    const indiceAdmin = usuarios.findIndex((usuario) => {
        const login = (usuario.login || usuario.email || "")
            .toString()
            .trim()
            .toLowerCase();

        return login === "admin" || (usuario.email || "").toLowerCase() === "admin@clinicflow.com";
    });

    if (indiceAdmin !== -1) {
        const usuarioAdmin = usuarios[indiceAdmin];
        usuarios[indiceAdmin] = {
            ...usuarioAdmin,
            id: usuarioAdmin.id || Utils.gerarId(),
            nome: usuarioAdmin.nome || "Administrador",
            cargo: usuarioAdmin.cargo || "Administrador",
            email: usuarioAdmin.email || "admin@clinicflow.com",
            login: "admin",
            senha: usuarioAdmin.senha || "123456",
            perfil: "Administrador",
            status: "ativo",
            usuarioAtivo: true,
            trocarSenhaPrimeiroLogin: false,
            permissoes: { ...PERMISSOES_ADMINISTRADOR }
        };

        Storage.salvar("clinicflow_usuarios", usuarios);

        return;
    }

    const usuarioPadrao = {
        id: Utils.gerarId(),
        cargo: "Administrador",
        cpf: "12398499669",
        nome: "Administrador",
        email: "admin@clinicflow.com",
        login: "admin",
        senha: "123456",
        perfil: "Administrador",
        status: "ativo",
        usuarioAtivo: true,
        trocarSenhaPrimeiroLogin: false,
        foto: "https://i.pravatar.cc/120?img=12",
        permissoes: { ...PERMISSOES_ADMINISTRADOR }
    };

    Storage.salvar("clinicflow_usuarios", [usuarioPadrao, ...usuarios]);
}
/* ==========================================================
   LOGIN
========================================================== */
function iniciarLogin() {
    const formulario =
        document.querySelector(
            "#formLogin"
        );
    if (!formulario)
        return;
    formulario.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();
            realizarLogin();
        }
    );
}

function normalizarPermissoesLogin(permissoes) {
    const base = {
        dashboard: false,
        pacientes: false,
        agenda: false,
        profissionais: false,
        servicos: false,
        financeiro: false,
        relatorios: false,
        configuracoes: false,
        usuarios: false
    };

    if (!permissoes || typeof permissoes !== "object") {
        return base;
    }

    Object.keys(base).forEach((chave) => {
        base[chave] = Boolean(permissoes[chave]);
    });

    return base;
}

function realizarLogin() {
    const login =
        document.querySelector(
            "#login"
        ).value.trim().toLowerCase();
    const senha =
        document.querySelector(
            "#password"
        ).value.trim();

    const usuarios =
        Storage.buscar(
            "clinicflow_usuarios"
        ) || [];

    const usuario = usuarios.find((item) => {
        const loginUsuario = (item.login || "")
            .toString()
            .trim()
            .toLowerCase();
        const emailUsuario = (item.email || "")
            .toString()
            .trim()
            .toLowerCase();
        const loginValido = loginUsuario === login || emailUsuario === login;

        return loginValido && item.senha === senha && item.status !== "bloqueado" && item.usuarioAtivo !== false;
    });

    if (usuario) {
        const usuarioSessao = {
            ...usuario,
            perfil: usuario.perfil || "Administrador",
            permissoes: normalizarPermissoesLogin(usuario.permissoes)
        };

        Auth.login(usuarioSessao);
        redirecionarUsuarioAutenticado();
        return;
    }

    const usuarioLegacy = Storage.buscar("clinicflow_usuario");
    if (
        usuarioLegacy &&
        ((usuarioLegacy.email || "").toLowerCase() === login || (usuarioLegacy.login || "").toLowerCase() === login) &&
        usuarioLegacy.senha === senha
    ) {
        const usuarioSessao = {
            ...usuarioLegacy,
            perfil: usuarioLegacy.perfil || "Administrador",
            permissoes: normalizarPermissoesLogin(usuarioLegacy.permissoes)
        };

        Auth.login(usuarioSessao);
        redirecionarUsuarioAutenticado();
        return;
    }

    mostrarErroLogin(
        "Login ou senha inválidos"
    );
}

function redirecionarUsuarioAutenticado() {
    const proximaPagina = Auth.obterPrimeiraPaginaPermitida();
    if (proximaPagina) {
        window.location.replace(`html/${proximaPagina}`);
        return;
    }

    Auth.limparSessao();
    mostrarErroLogin("Este usuário não possui permissão de acesso.");
}
/* ==========================================================
   VERIFICAR SESSÃO
========================================================== */
function verificarSessao() {
    const pagina =
        window.location.pathname;
    const sessao =
        Storage.buscar(
            "clinicflow_sessao"
        );
    if (
        pagina.includes(
            "dashboard"
        )
        ||
        pagina.includes(
            "pacientes"
        )
    ) {
        if (!sessao) {
            window.location.href =
                "index.html";
        }
    }
}
/* ==========================================================
   LOGOUT
========================================================== */
function logout() {
    Storage.remover(
        "clinicflow_sessao"
    );
    window.location.href =
        "index.html";
}
/* ==========================================================
   ERRO LOGIN
========================================================== */
function mostrarErroLogin(mensagem) {
    const erro =
        document.querySelector(
            "#mensagemErro"
        );
    if (erro) {
        erro.innerText =
            mensagem;
        erro.style.display =
            "block";
    }
    else {
        alert(mensagem);
    }
}
