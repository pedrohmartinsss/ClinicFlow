/* ==========================================================
   USUARIOS.JS
   ClinicFlow
   Gerenciamento de usuários com modal e permissões
========================================================== */
"use strict";

const STORAGE_USUARIOS = "clinicflow_usuarios";

let usuarios = [];
let usuarioEditando = null;
let fotoUsuarioAtual = "";
let filtroTexto = "";
let filtroPerfilAtual = "todos";
let filtroStatusAtual = "todos";

const MODULOS_PERMISSOES = [
    {
        chave: "dashboard",
        titulo: "Dashboard",
        icone: "fa-house",
        descricao: "Acesso ao painel principal"
    },
    {
        chave: "pacientes",
        titulo: "Pacientes",
        icone: "fa-users",
        descricao: "Cadastro e consulta de pacientes"
    },
    {
        chave: "agenda",
        titulo: "Agenda",
        icone: "fa-calendar-days",
        descricao: "Gestão da agenda e atendimentos"
    },
    {
        chave: "profissionais",
        titulo: "Profissionais",
        icone: "fa-user-doctor",
        descricao: "Controle de profissionais"
    },
    {
        chave: "servicos",
        titulo: "Serviços",
        icone: "fa-stethoscope",
        descricao: "Gestão de serviços"
    },
    {
        chave: "financeiro",
        titulo: "Financeiro",
        icone: "fa-wallet",
        descricao: "Controle financeiro"
    },
    {
        chave: "relatorios",
        titulo: "Relatórios",
        icone: "fa-chart-line",
        descricao: "Acesso aos relatórios"
    },
    {
        chave: "configuracoes",
        titulo: "Configurações",
        icone: "fa-gear",
        descricao: "Configurações gerais"
    },
    {
        chave: "usuarios",
        titulo: "Usuários",
        icone: "fa-user",
        descricao: "Gestão de usuários"
    }
];

const PERMISSOES_PADRAO = MODULOS_PERMISSOES.reduce((acumulador, modulo) => {
    acumulador[modulo.chave] = true;
    return acumulador;
}, {});

const PERFIS_PERMISSOES = {
    Administrador: MODULOS_PERMISSOES.reduce((acumulador, modulo) => {
        acumulador[modulo.chave] = true;
        return acumulador;
    }, {}),
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
    }
};

function iniciarUsuarios() {
    if (typeof Auth !== "undefined") {
        Auth.protegerPagina();
    }

    garantirModaisUsuarios();
    carregarUsuarios();
    configurarEventos();
    renderizarUsuarios();
    atualizarDashboard();
}

document.addEventListener("DOMContentLoaded", iniciarUsuarios);

function carregarUsuarios() {
    usuarios = Storage.buscar(STORAGE_USUARIOS) || [];
}

function configurarEventos() {
    const btnSair = document.querySelector("#btnSair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            Auth.logout();
        });
    }

    const btnNovo = document.querySelector("#btnNovoUsuario");
    if (btnNovo) {
        btnNovo.addEventListener("click", abrirModalUsuario);
    }

    const btnFechar = document.querySelector("#fecharModalUsuario");
    if (btnFechar) {
        btnFechar.addEventListener("click", fecharModalUsuario);
    }

    const btnCancelar = document.querySelector("#cancelarUsuario");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", fecharModalUsuario);
    }

    const btnSalvar = document.querySelector("#salvarUsuario");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", salvarUsuario);
    }

    const inputPesquisa = document.querySelector("#pesquisaUsuarios");
    if (inputPesquisa) {
        inputPesquisa.addEventListener("input", (event) => {
            filtroTexto = event.target.value.trim().toLowerCase();
            renderizarUsuarios();
        });
    }

    const filtroPerfilEl = document.querySelector("#filtroPerfil");
    if (filtroPerfilEl) {
        filtroPerfilEl.addEventListener("change", (event) => {
            filtroPerfilAtual = event.target.value;
            renderizarUsuarios();
        });
    }

    const filtroStatusEl = document.querySelector("#filtroStatus");
    if (filtroStatusEl) {
        filtroStatusEl.addEventListener("change", (event) => {
            filtroStatusAtual = event.target.value;
            renderizarUsuarios();
        });
    }

    const inputFoto = document.querySelector("#fotoUsuario");
    if (inputFoto) {
        inputFoto.addEventListener("change", lerFotoUsuario);
    }

    const listaUsuarios = document.querySelector("#listaUsuarios");
    if (listaUsuarios) {
        listaUsuarios.addEventListener("click", tratarCliqueListaUsuarios);
    }
}

function garantirModaisUsuarios() {
    if (!document.querySelector("#modalVisualizarUsuario")) {
        const modalVisualizar = document.createElement("div");
        modalVisualizar.className = "modal-overlay";
        modalVisualizar.id = "modalVisualizarUsuario";
        modalVisualizar.innerHTML = `
      <div class="modal modal-xl">
        <div class="modal-header">
          <h2>Detalhes do Usuário</h2>
          <button class="btn btn-danger btn-sm" id="fecharVisualizacaoUsuario">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <div id="conteudoVisualizacaoUsuario"></div>
        </div>
      </div>
    `;
        document.querySelector("main.content")?.appendChild(modalVisualizar);

        document
            .querySelector("#fecharVisualizacaoUsuario")
            ?.addEventListener("click", () => Modal.fechar("modalVisualizarUsuario"));
    }

    if (!document.querySelector("#modalPermissoes")) {
        const modalPermissoes = document.createElement("div");
        modalPermissoes.className = "modal-overlay";
        modalPermissoes.id = "modalPermissoes";
        modalPermissoes.innerHTML = `
      <div class="modal modal-xl">
        <div class="modal-header">
          <h2 id="tituloModalPermissoes">Permissões do Usuário</h2>
          <button class="btn btn-danger btn-sm" id="fecharModalPermissoes">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="permissoes-actions">
            <div class="permissoes-resumo">
              <i class="fa-solid fa-user-shield"></i>
              <div>
                <h4 id="resumoPermissoesTitulo">Perfil personalizado</h4>
                <p id="resumoPermissoesTexto">Selecione as permissões para este usuário.</p>
              </div>
            </div>
            <button class="btn btn-primary" id="salvarPermissoesUsuario">
              <i class="fa-solid fa-floppy-disk"></i>
              Salvar Permissões
            </button>
          </div>
          <div id="permissoesGrid" class="permissoes-grid"></div>
        </div>
      </div>
    `;
        document.querySelector("main.content")?.appendChild(modalPermissoes);

        document
            .querySelector("#fecharModalPermissoes")
            ?.addEventListener("click", () => Modal.fechar("modalPermissoes"));

        document
            .querySelector("#salvarPermissoesUsuario")
            ?.addEventListener("click", salvarPermissoesUsuario);
    }
}

function abrirModalUsuario() {
    usuarioEditando = null;
    fotoUsuarioAtual = "";
    limparFormularioUsuario();
    document.querySelector("#tituloModalUsuario").textContent = "Novo Usuário";
    document.querySelector("#senhaUsuario")?.setAttribute("required", "required");
    document.querySelector("#confirmarSenhaUsuario")?.setAttribute("required", "required");
    Modal.abrir("modalUsuario");
}

function fecharModalUsuario() {
    Modal.fechar("modalUsuario");
    limparFormularioUsuario();
    usuarioEditando = null;
}

function limparFormularioUsuario() {
    const formulario = document.querySelector("#modalUsuario");
    if (!formulario) {
        return;
    }

    formulario.querySelector("#nomeUsuario").value = "";
    formulario.querySelector("#cpfUsuario").value = "";
    formulario.querySelector("#dataNascimentoUsuario").value = "";
    formulario.querySelector("#sexoUsuario").value = "";
    formulario.querySelector("#cargoUsuario").value = "";
    formulario.querySelector("#emailUsuario").value = "";
    formulario.querySelector("#telefoneUsuario").value = "";
    formulario.querySelector("#loginUsuario").value = "";
    formulario.querySelector("#senhaUsuario").value = "";
    formulario.querySelector("#confirmarSenhaUsuario").value = "";
    formulario.querySelector("#perfilUsuario").value = "Administrador";
    formulario.querySelector("#statusUsuario").value = "ativo";
    formulario.querySelector("#trocarSenhaPrimeiroLogin").checked = false;
    formulario.querySelector("#usuarioAtivo").checked = true;

    const preview = formulario.querySelector("#previewFotoUsuario");
    if (preview) {
        preview.src = "https://i.pravatar.cc/120?img=12";
    }

    const inputFoto = formulario.querySelector("#fotoUsuario");
    if (inputFoto) {
        inputFoto.value = "";
    }

    fotoUsuarioAtual = "";
}

function salvarUsuario() {
    const formulario = document.querySelector("#modalUsuario");
    if (!formulario) {
        return;
    }

    const nome = formulario.querySelector("#nomeUsuario").value.trim();
    const cpf = formulario.querySelector("#cpfUsuario").value.trim();
    const dataNascimento = formulario.querySelector("#dataNascimentoUsuario").value;
    const sexo = formulario.querySelector("#sexoUsuario").value.trim();
    const cargo = formulario.querySelector("#cargoUsuario").value.trim();
    const email = formulario.querySelector("#emailUsuario").value.trim();
    const telefone = formulario.querySelector("#telefoneUsuario").value.trim();
    const login = formulario.querySelector("#loginUsuario").value.trim();
    const senha = formulario.querySelector("#senhaUsuario").value;
    const confirmarSenha = formulario.querySelector("#confirmarSenhaUsuario").value;
    const perfil = formulario.querySelector("#perfilUsuario").value;
    const status = formulario.querySelector("#statusUsuario").value;
    const trocarSenhaPrimeiroLogin = formulario.querySelector("#trocarSenhaPrimeiroLogin").checked;
    const usuarioAtivo = formulario.querySelector("#usuarioAtivo").checked;

    if (!nome || !email || !login || !perfil) {
        mostrarMensagem("Preencha nome, e-mail, login e perfil.", "error");
        return;
    }

    if (!Utils.emailValido(email)) {
        mostrarMensagem("Informe um e-mail válido.", "error");
        return;
    }

    if (cpf && !Utils.cpfValido(cpf)) {
        mostrarMensagem("CPF inválido. Verifique o número informado.", "error");
        return;
    }

    if (usuarioEditando) {
        const indice = usuarios.findIndex((usuario) => usuario.id === usuarioEditando);
        if (indice === -1) {
            mostrarMensagem("Usuário não encontrado para edição.", "error");
            return;
        }

        const usuarioAtual = usuarios[indice];
        const senhaFutura = senha || usuarioAtual.senha;

        if (senha && senha !== confirmarSenha) {
            mostrarMensagem("A confirmação de senha não confere.", "error");
            return;
        }

        usuarios[indice] = {
            ...usuarioAtual,
            nome,
            cpf,
            dataNascimento,
            sexo,
            cargo,
            email,
            telefone,
            login,
            senha: senhaFutura,
            perfil,
            status,
            trocarSenhaPrimeiroLogin,
            usuarioAtivo,
            foto: fotoUsuarioAtual || usuarioAtual.foto,
            permissoes: usuarioAtual.permissoes || gerarPermissoesPorPerfil(perfil)
        };

        mostrarMensagem("Usuário atualizado com sucesso.", "success");
    } else {
        if (!senha || !confirmarSenha) {
            mostrarMensagem("Informe a senha e confirme-a para criar o usuário.", "error");
            return;
        }

        if (senha !== confirmarSenha) {
            mostrarMensagem("A confirmação de senha não confere.", "error");
            return;
        }

        const loginExistente = usuarios.some((usuario) => usuario.login.toLowerCase() === login.toLowerCase());
        if (loginExistente) {
            mostrarMensagem("Já existe um usuário com este login.", "error");
            return;
        }

        usuarios.push({
            id: Utils.gerarId(),
            nome,
            cpf,
            dataNascimento,
            sexo,
            cargo,
            email,
            telefone,
            login,
            senha,
            perfil,
            status,
            trocarSenhaPrimeiroLogin,
            usuarioAtivo,
            foto: fotoUsuarioAtual || "https://i.pravatar.cc/120?img=12",
            permissoes: gerarPermissoesPorPerfil(perfil)
        });

        mostrarMensagem("Usuário criado com sucesso.", "success");
    }

    Storage.salvar(STORAGE_USUARIOS, usuarios);
    fecharModalUsuario();
    renderizarUsuarios();
    atualizarDashboard();
}

function editarUsuario(id) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) {
        return;
    }

    usuarioEditando = id;
    document.querySelector("#tituloModalUsuario").textContent = "Editar Usuário";

    const formulario = document.querySelector("#modalUsuario");
    if (!formulario) {
        return;
    }

    formulario.querySelector("#nomeUsuario").value = usuario.nome || "";
    formulario.querySelector("#cpfUsuario").value = usuario.cpf || "";
    formulario.querySelector("#dataNascimentoUsuario").value = usuario.dataNascimento || "";
    formulario.querySelector("#sexoUsuario").value = usuario.sexo || "";
    formulario.querySelector("#cargoUsuario").value = usuario.cargo || "";
    formulario.querySelector("#emailUsuario").value = usuario.email || "";
    formulario.querySelector("#telefoneUsuario").value = usuario.telefone || "";
    formulario.querySelector("#loginUsuario").value = usuario.login || "";
    formulario.querySelector("#senhaUsuario").value = "";
    formulario.querySelector("#confirmarSenhaUsuario").value = "";
    formulario.querySelector("#perfilUsuario").value = usuario.perfil || "Administrador";
    formulario.querySelector("#statusUsuario").value = usuario.status || "ativo";
    formulario.querySelector("#trocarSenhaPrimeiroLogin").checked = Boolean(usuario.trocarSenhaPrimeiroLogin);
    formulario.querySelector("#usuarioAtivo").checked = usuario.usuarioAtivo !== false;

    fotoUsuarioAtual = usuario.foto || "";
    formulario.querySelector("#previewFotoUsuario").src = usuario.foto || "https://i.pravatar.cc/120?img=12";

    document.querySelector("#senhaUsuario")?.removeAttribute("required");
    document.querySelector("#confirmarSenhaUsuario")?.removeAttribute("required");

    Modal.abrir("modalUsuario");
}

function visualizarUsuario(id) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) {
        return;
    }

    const container = document.querySelector("#conteudoVisualizacaoUsuario");
    if (!container) {
        return;
    }

    const permissoesAtivas = Object.values(usuario.permissoes || {}).filter(Boolean).length;
    const totalPermissoes = MODULOS_PERMISSOES.length;

    container.innerHTML = `
    <div class="usuario-view-topo">
      <img src="${usuario.foto || "https://i.pravatar.cc/120?img=12"}" alt="Foto do usuário">
      <div>
        <h2>${usuario.nome}</h2>
        <span class="badge ${usuario.status === "bloqueado" ? "badge-danger" : "badge-success"}">
          ${usuario.status === "bloqueado" ? "Bloqueado" : "Ativo"}
        </span>
        <p>${usuario.perfil}</p>
      </div>
    </div>
    <div class="usuario-view-grid">
      <div class="info-card">
        <span>Login</span>
        <strong>${usuario.login}</strong>
      </div>
      <div class="info-card">
        <span>E-mail</span>
        <strong>${usuario.email}</strong>
      </div>
      <div class="info-card">
        <span>CPF</span>
        <strong>${usuario.cpf || "-"}</strong>
      </div>
      <div class="info-card">
        <span>Telefone</span>
        <strong>${usuario.telefone || "-"}</strong>
      </div>
      <div class="info-card">
        <span>Cargo</span>
        <strong>${usuario.cargo || "-"}</strong>
      </div>
      <div class="info-card">
        <span>Permissões</span>
        <strong>${permissoesAtivas}/${totalPermissoes} módulos</strong>
      </div>
    </div>
  `;

    Modal.abrir("modalVisualizarUsuario");
}

function excluirUsuario(id) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) {
        return;
    }

    if (!confirm(`Deseja excluir o usuário ${usuario.nome}?`)) {
        return;
    }

    usuarios = usuarios.filter((item) => item.id !== id);
    Storage.salvar(STORAGE_USUARIOS, usuarios);
    renderizarUsuarios();
    atualizarDashboard();
}

function abrirPermissoesUsuario(id) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) {
        return;
    }

    const titulo = document.querySelector("#tituloModalPermissoes");
    const resumoTitulo = document.querySelector("#resumoPermissoesTitulo");
    const resumoTexto = document.querySelector("#resumoPermissoesTexto");
    const grid = document.querySelector("#permissoesGrid");

    if (titulo) {
        titulo.textContent = `Permissões de ${usuario.nome}`;
    }

    if (resumoTitulo) {
        resumoTitulo.textContent = `Perfil: ${usuario.perfil}`;
    }

    if (resumoTexto) {
        resumoTexto.textContent = `Ajuste manualmente as permissões do usuário ${usuario.login}.`;
    }

    if (!grid) {
        return;
    }

    const permissoes = normalizarPermissoes(usuario.permissoes || gerarPermissoesPorPerfil(usuario.perfil));
    grid.innerHTML = "";

    MODULOS_PERMISSOES.forEach((modulo) => {
        const card = document.createElement("div");
        card.className = "permissao-card";
        card.innerHTML = `
      <div class="permissao-header">
        <h3><i class="fa-solid ${modulo.icone}"></i>${modulo.titulo}</h3>
        <span>${modulo.descricao}</span>
      </div>
      <div class="permissao-body">
        <div class="permissao-item">
          <label>
            <input type="checkbox" data-chave="${modulo.chave}" ${permissoes[modulo.chave] ? "checked" : ""}>
            <span>Permitir acesso</span>
          </label>
        </div>
      </div>
    `;
        grid.appendChild(card);
    });

    const salvar = document.querySelector("#salvarPermissoesUsuario");
    if (salvar) {
        salvar.dataset.usuarioId = String(id);
    }

    Modal.abrir("modalPermissoes");
}

function salvarPermissoesUsuario() {
    const usuarioId = Number(document.querySelector("#salvarPermissoesUsuario")?.dataset.usuarioId);
    const usuario = usuarios.find((item) => item.id === usuarioId);
    if (!usuario) {
        return;
    }

    const checkboxes = document.querySelectorAll("#modalPermissoes input[type='checkbox']");
    const permissoes = {};

    MODULOS_PERMISSOES.forEach((modulo) => {
        permissoes[modulo.chave] = Boolean(document.querySelector(`input[data-chave="${modulo.chave}"]`)?.checked);
    });

    usuario.permissoes = permissoes;
    Storage.salvar(STORAGE_USUARIOS, usuarios);
    renderizarUsuarios();
    Modal.fechar("modalPermissoes");
    mostrarMensagem("Permissões atualizadas com sucesso.", "success");
}

function gerarPermissoesPorPerfil(perfil) {
    if (!perfil || !PERFIS_PERMISSOES[perfil]) {
        return { ...PERMISSOES_PADRAO };
    }

    return { ...PERFIS_PERMISSOES[perfil] };
}

function normalizarPermissoes(permissoes) {
    const normalizadas = { ...PERMISSOES_PADRAO };
    if (!permissoes || typeof permissoes !== "object") {
        return normalizadas;
    }

    MODULOS_PERMISSOES.forEach((modulo) => {
        normalizadas[modulo.chave] = Boolean(permissoes[modulo.chave]);
    });

    return normalizadas;
}

function lerFotoUsuario(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) {
        return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
        mostrarMensagem("A foto deve ter no máximo 5MB.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        fotoUsuarioAtual = reader.result;
        const preview = document.querySelector("#previewFotoUsuario");
        if (preview) {
            preview.src = reader.result;
        }
    };
    reader.readAsDataURL(arquivo);
}

function tratarCliqueListaUsuarios(event) {
    const botao = event.target.closest("button[data-action]");
    if (!botao) {
        return;
    }

    const action = botao.dataset.action;
    const id = Number(botao.dataset.id);

    if (action === "visualizar") {
        visualizarUsuario(id);
    }

    if (action === "editar") {
        editarUsuario(id);
    }

    if (action === "excluir") {
        excluirUsuario(id);
    }

    if (action === "permissoes") {
        abrirPermissoesUsuario(id);
    }
}

function renderizarUsuarios() {
    const listaUsuarios = document.querySelector("#listaUsuarios");
    if (!listaUsuarios) {
        return;
    }

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const texto = [usuario.nome, usuario.email, usuario.login, usuario.perfil]
            .join(" ")
            .toLowerCase();

        const atendeTexto = !filtroTexto || texto.includes(filtroTexto);
        const atendePerfil = filtroPerfilAtual === "todos" || usuario.perfil === filtroPerfilAtual;
        const atendeStatus = filtroStatusAtual === "todos" || usuario.status === filtroStatusAtual;

        return atendeTexto && atendePerfil && atendeStatus;
    });

    listaUsuarios.innerHTML = "";

    if (!usuariosFiltrados.length) {
        listaUsuarios.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-user-slash"></i>
        <h3>Nenhum usuário encontrado</h3>
        <p>Tente outro filtro ou cadastre um novo usuário.</p>
      </div>
    `;
        return;
    }

    usuariosFiltrados.forEach((usuario) => {
        const card = document.createElement("article");
        card.className = "usuario-card";

        const permissoesAtivas = Object.values(normalizarPermissoes(usuario.permissoes)).filter(Boolean).length;

        card.innerHTML = `
      <div class="usuario-header">
        <img class="usuario-avatar" src="${usuario.foto || "https://i.pravatar.cc/120?img=12"}" alt="Foto do usuário">
        <div class="usuario-info">
          <h3>${usuario.nome}</h3>
          <p>${usuario.email}</p>
        </div>
        <span class="usuario-status ${usuario.status === "bloqueado" ? "bloqueado" : "ativo"}">
          ${usuario.status === "bloqueado" ? "Bloqueado" : "Ativo"}
        </span>
      </div>
      <div class="usuario-body">
        <div class="usuario-item">
          <i class="fa-solid fa-user-tag"></i>
          <span>Perfil</span>
          <strong>${usuario.perfil}</strong>
        </div>
        <div class="usuario-item">
          <i class="fa-solid fa-id-card"></i>
          <span>Login</span>
          <strong>${usuario.login}</strong>
        </div>
        <div class="usuario-item">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Permissões</span>
          <strong>${permissoesAtivas} módulos</strong>
        </div>
      </div>
      <div class="usuario-footer">
        <button class="btn btn-secondary btn-sm" data-action="visualizar" data-id="${usuario.id}">
          <i class="fa-solid fa-eye"></i>
          Visualizar
        </button>
        <button class="btn btn-primary btn-sm" data-action="editar" data-id="${usuario.id}">
          <i class="fa-solid fa-pen"></i>
          Editar
        </button>
        <button class="btn btn-info btn-sm" data-action="permissoes" data-id="${usuario.id}">
          <i class="fa-solid fa-key"></i>
          Permissões
        </button>
        <button class="btn btn-danger btn-sm" data-action="excluir" data-id="${usuario.id}">
          <i class="fa-solid fa-trash"></i>
          Excluir
        </button>
      </div>
    `;

        listaUsuarios.appendChild(card);
    });
}

function atualizarDashboard() {
    const totalUsuarios = usuarios.length;
    const usuariosAtivos = usuarios.filter((usuario) => usuario.status === "ativo").length;
    const usuariosBloqueados = usuarios.filter((usuario) => usuario.status === "bloqueado").length;
    const usuariosAdministradores = usuarios.filter((usuario) => usuario.perfil === "Administrador").length;

    document.querySelector("#totalUsuarios").textContent = totalUsuarios;
    document.querySelector("#usuariosAtivos").textContent = usuariosAtivos;
    document.querySelector("#usuariosBloqueados").textContent = usuariosBloqueados;
    document.querySelector("#usuariosAdministradores").textContent = usuariosAdministradores;
}
