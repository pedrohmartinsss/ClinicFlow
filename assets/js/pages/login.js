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
    const usuario =
        Storage.buscar(
            "clinicflow_usuario"
        );
    if (usuario)
        return;
    Storage.salvar(
        "clinicflow_usuario",
        {
            id: Utils.gerarId(),
            nome: "Administrador",
            email: "admin@clinicflow.com",
            senha: "123456",
            perfil: "admin"
        }
    );
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
    const email =
        document.querySelector(
            "#email"
        ).value.trim();
    const senha =
        document.querySelector(
            "#password"
        ).value.trim();
    const usuario =
        Storage.buscar(
            "clinicflow_usuario"
        );
    if (
        email === usuario.email
        &&
        senha === usuario.senha
    ) {
        const sessao = {
            usuarioId:
                usuario.id,
            nome:
                usuario.nome,
            perfil:
                usuario.perfil,
            autenticado: true,
            login:
                new Date()
        };
        Auth.login(usuario);
        window.location.href =
            "html/dashboard.html";
    }
    else {
        mostrarErroLogin(
            "E-mail ou senha inválidos"
        );
    }
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