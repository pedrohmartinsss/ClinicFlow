/* ==========================================================
   LOGIN.JS
   ClinicFlow
   Controle de autenticação frontend
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        criarUsuarioInicial();
        iniciarLogin();
    });
/* ==========================================================
   USUÁRIO PADRÃO
========================================================== */
function criarUsuarioInicial() {
    const usuarios = Storage.buscar("clinicflow_usuarios") || [];
    if (usuarios.length > 0) {
        return;
    }

    const usuarioPadrao = {
        id: Utils.gerarId(),
        nome: "Administrador",
        email: "admin@clinicflow.com",
        login: "admin",
        senha: "123456",
        perfil: "Administrador",
        status: "ativo",
        usuarioAtivo: true,
        trocarSenhaPrimeiroLogin: false,
        foto: "https://i.pravatar.cc/120?img=12",
        permissoes: {
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
    };

    Storage.salvar("clinicflow_usuarios", [usuarioPadrao]);
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
        const loginValido = (item.login || item.email || "")
            .toString()
            .trim()
            .toLowerCase() === login;

        return loginValido && item.senha === senha && item.status !== "bloqueado" && item.usuarioAtivo !== false;
    });

    if (usuario) {
        Auth.login(usuario);
        window.location.href =
            "html/dashboard.html";
        return;
    }

    const usuarioLegacy = Storage.buscar("clinicflow_usuario");
    if (
        usuarioLegacy &&
        ((usuarioLegacy.email || "").toLowerCase() === login || (usuarioLegacy.login || "").toLowerCase() === login) &&
        usuarioLegacy.senha === senha
    ) {
        Auth.login(usuarioLegacy);
        window.location.href =
            "html/dashboard.html";
        return;
    }

    mostrarErroLogin(
        "Login ou senha inválidos"
    );
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