/* ==========================================================
   PROFISSIONAIS.JS
   ClinicFlow
========================================================== */
"use strict";
/* ==========================================================
   STORAGE
========================================================== */
const STORAGE_PROFISSIONAIS = "clinicflow_profissionais";
/* ==========================================================
   ESTADO
========================================================== */
let profissionais = [];
let profissionalEditando = null;
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined") {
    Auth.protegerPagina();
  }
  carregarProfissionais();
  configurarEventos();
  configurarFiltros();
  renderizarProfissionais();
  atualizarContador();
});
/* ==========================================================
   CARREGAR DADOS
========================================================== */
function carregarProfissionais() {
  profissionais = Storage.buscar(STORAGE_PROFISSIONAIS) || [];
}
/* ==========================================================
   EVENTOS
========================================================== */
function configurarEventos() {
  const btnNovo = document.querySelector("#btnNovoProfissional");
  if (btnNovo) {
    btnNovo.addEventListener("click", abrirModalProfissional);
  }
  const btnFechar = document.querySelector("#fecharModalProfissional");
  if (btnFechar) {
    btnFechar.addEventListener("click", fecharModalProfissional);
  }
  const btnCancelar = document.querySelector("#cancelarProfissional");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", fecharModalProfissional);
  }
  const btnSalvar = document.querySelector("#salvarProfissional");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarProfissional);
  }
  const btnLogout = document.querySelector("#btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      Auth.logout();
    });
  }
  document
    .querySelector("#fecharVisualizacao")
    ?.addEventListener("click", () => {
      Modal.fechar("modalVisualizarProfissional");
    });
  document
    .querySelector("#btnFecharVisualizacao")
    ?.addEventListener("click", () => {
      Modal.fechar("modalVisualizarProfissional");
    });
}
/* ==========================================================
   EXIBIR MODAL
========================================================== */
function exibirModalProfissional() {
  document.querySelector("#modalProfissional")?.classList.add("active");
}
/* ==========================================================
   MODAL
========================================================== */
function abrirModalProfissional() {
  profissionalEditando = null;
  limparFormulario();
  document.querySelector("#tituloModalProfissional").textContent =
    "Novo Profissional";
  exibirModalProfissional();
}
function fecharModalProfissional() {
  document.querySelector("#modalProfissional")?.classList.remove("active");
  limparFormulario();
  profissionalEditando = null;
}
/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormulario() {
  document.querySelector("#nomeProfissional").value = "";
  document.querySelector("#especialidadeProfissional").value = "";
  document.querySelector("#registroProfissional").value = "";
  document.querySelector("#telefoneProfissional").value = "";
  document.querySelector("#emailProfissional").value = "";
  document.querySelector("#horarioProfissional").value = "";
  document.querySelector("#statusProfissional").value = "ativo";
}
/* ==========================================================
   SALVAR
========================================================== */
function salvarProfissional() {
  const nome = document.querySelector("#nomeProfissional").value.trim();
  const especialidade = document
    .querySelector("#especialidadeProfissional")
    .value.trim();
  const registro = document.querySelector("#registroProfissional").value.trim();
  const telefone = document.querySelector("#telefoneProfissional").value.trim();
  const email = document.querySelector("#emailProfissional").value.trim();
  const horario = document.querySelector("#horarioProfissional").value.trim();
  const status = document.querySelector("#statusProfissional").value;
  if (!nome || !especialidade || !registro) {
    alert("Preencha os campos obrigatórios.");
    return;
  }
  if (profissionalEditando) {
    const indice = profissionais.findIndex(
      (p) => p.id === profissionalEditando,
    );
    profissionais[indice] = {
      ...profissionais[indice],
      nome,
      especialidade,
      registro,
      telefone,
      email,
      horario,
      status,
    };
  } else {
    profissionais.push({
      id: Utils.gerarId(),
      nome,
      especialidade,
      registro,
      telefone,
      email,
      horario,
      status,
    });
  }
  Storage.salvar(STORAGE_PROFISSIONAIS, profissionais);
  fecharModalProfissional();
  renderizarProfissionais();
  atualizarContador();
}
/* ==========================================================
   EDITAR
========================================================== */
function editarProfissional(id) {
  const profissional = profissionais.find((p) => p.id === id);
  if (!profissional) return;
  profissionalEditando = id;
  document.querySelector("#tituloModalProfissional").textContent =
    "Editar Profissional";
  document.querySelector("#nomeProfissional").value = profissional.nome;
  document.querySelector("#especialidadeProfissional").value =
    profissional.especialidade;
  document.querySelector("#registroProfissional").value = profissional.registro;
  document.querySelector("#telefoneProfissional").value = profissional.telefone;
  document.querySelector("#emailProfissional").value = profissional.email;
  document.querySelector("#horarioProfissional").value = profissional.horario;
  document.querySelector("#statusProfissional").value = profissional.status;
  exibirModalProfissional();
}
/* ==========================================================
   VISUALIZAR PROFISSIONAL
========================================================== */
function visualizarProfissional(id) {
  console.log("Visualizar clicado", id);
  const profissional = profissionais.find((p) => p.id === id);
  if (!profissional) return;
  preencherModalVisualizacao(profissional);
  Modal.abrir("modalVisualizarProfissional");
}
/* ==========================================================
   PREENCHER MODAL DE VISUALIZAÇÃO
========================================================== */
function preencherModalVisualizacao(profissional) {
  const container = document.querySelector("#conteudoVisualizacaoProfissional");
  if (!container) return;
  const statusClass = profissional.status === "Ativo" ? "success" : "danger";
  container.innerHTML = `
        <div class="view-profissional">
            <div class="view-header">
                <div class="view-avatar">
                    <i class="fa-solid fa-user-doctor"></i>
                </div>
                <div class="view-header-info">
                    <h2>${profissional.nome}</h2>
                    <span class="badge badge-${statusClass}">
                        ${profissional.status}
                    </span>
                    <p>${profissional.especialidade}</p>
                </div>
            </div>
            <div class="view-section">
                <h3>
                    <i class="fa-solid fa-id-card"></i>
                    Dados Profissionais
                </h3>
                <div class="view-grid">
                    <div class="view-item">
                        <label>Registro</label>
                        <span>${profissional.registro || "-"}</span>
                    </div>
                    <div class="view-item">
                        <label>Especialidade</label>
                        <span>${profissional.especialidade || "-"}</span>
                    </div>
                </div>
            </div>
            <div class="view-section">
                <h3>
                    <i class="fa-solid fa-address-book"></i>
                    Contato
                </h3>
                <div class="view-grid">
                    <div class="view-item">
                        <label>Telefone</label>
                        <span>${profissional.telefone || "-"}</span>
                    </div>
                    <div class="view-item">
                        <label>E-mail</label>
                        <span>${profissional.email || "-"}</span>
                    </div>
                </div>
            </div>
            <div class="view-section">
                <h3>
                    <i class="fa-solid fa-clock"></i>
                    Jornada
                </h3>
                <div class="view-grid">
                    <div class="view-item">
                        <label>Horário</label>
                        <span>${profissional.horario || "-"}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
/* ==========================================================
   EXCLUIR PROFISSIONAL
========================================================== */
function excluirProfissional(id) {
  if (!confirm("Deseja realmente excluir este profissional?")) {
    return;
  }
  profissionais = profissionais.filter(
    (profissional) => profissional.id !== id,
  );
  Storage.salvar(STORAGE_PROFISSIONAIS, profissionais);
  renderizarProfissionais();
  atualizarContador();
}
/* ==========================================================
   RENDERIZAÇÃO
========================================================== */
function renderizarProfissionais() {
  const lista = document.querySelector("#listaProfissionais");
  if (!lista) return;
  lista.innerHTML = "";
  if (profissionais.length === 0) {
    lista.innerHTML = `
            <div class="empty-professionals">
                <i class="fa-solid fa-user-doctor"></i>
                <h3>Nenhum profissional cadastrado</h3>
                <p>Clique em "Novo Profissional" para iniciar.</p>
            </div>
        `;
    return;
  }
  profissionais.forEach(criarCardProfissional);
}
/* ==========================================================
   CARD
========================================================== */
function criarCardProfissional(profissional) {
  const lista = document.querySelector("#listaProfissionais");
  const card = document.createElement("div");
  card.className = "professional-card";
  card.innerHTML = `
        <div class="professional-card-header">
            <div class="professional-avatar">
                <i class="fa-solid fa-user-doctor"></i>
            </div>
            <div class="professional-main">
                <div class="professional-name">
                    ${profissional.nome}
                </div>
                <div class="professional-specialty">
                    ${profissional.especialidade}
                </div>
            </div>
        </div>
        <div class="professional-info">
            <div class="professional-info-item">
                <i class="fa-solid fa-id-card"></i>
                ${profissional.registro}
            </div>
            <div class="professional-info-item">
                <i class="fa-solid fa-phone"></i>
                ${profissional.telefone || "-"}
            </div>
            <div class="professional-info-item">
                <i class="fa-solid fa-envelope"></i>
                ${profissional.email || "-"}
            </div>
            <div class="professional-status ${profissional.status}">
                ${profissional.status}
            </div>
        </div>
        <div class="professional-actions">
           <button
        class="btn btn-warning"
        title="Visualizar"
        onclick="visualizarProfissional(${profissional.id})">
        <i class="fa-solid fa-eye"></i>
    </button>
    <button
        class="btn btn-primary"
        title="Editar"
        onclick="editarProfissional(${profissional.id})">
        <i class="fa-solid fa-pen"></i>
    </button>
    <button
        class="btn btn-danger"
        title="Excluir"
        onclick="excluirProfissional(${profissional.id})">
        <i class="fa-solid fa-trash"></i>
    </button>
</div>
    `;
  lista.appendChild(card);
}
/* ==========================================================
   CONTADOR
========================================================== */
function atualizarContador() {
  const contador = document.querySelector("#contadorProfissionais");
  if (!contador) return;
  contador.textContent = `${profissionais.length} profissional${profissionais.length !== 1 ? "is" : ""}`;
}
/* ==========================================================
   FILTROS
========================================================== */
function configurarFiltros() {
  const pesquisa = document.querySelector("#pesquisaProfissional");
  const filtroEspecialidade = document.querySelector("#filtroEspecialidade");
  const filtroStatus = document.querySelector("#filtroStatusProfissional");
  pesquisa?.addEventListener("input", aplicarFiltros);
  filtroEspecialidade?.addEventListener("change", aplicarFiltros);
  filtroStatus?.addEventListener("change", aplicarFiltros);
  atualizarFiltroEspecialidades();
}
/* ==========================================================
AÇÕES
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const btnSair = document.querySelector("#btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      Auth.logout();
    });
  }
});
/* ==========================================================
   ATUALIZA ESPECIALIDADES
========================================================== */
function atualizarFiltroEspecialidades() {
  const select = document.querySelector("#filtroEspecialidade");
  if (!select) return;
  const especialidades = [
    ...new Set(profissionais.map((profissional) => profissional.especialidade)),
  ].sort();
  select.innerHTML = `<option value="todos">Todas as especialidades</option>`;
  especialidades.forEach((especialidade) => {
    select.innerHTML += `
            <option value="${especialidade}">
                ${especialidade}
            </option>
        `;
  });
}
/* ==========================================================
   FILTRAR
========================================================== */
function aplicarFiltros() {
  const texto =
    document
      .querySelector("#pesquisaProfissional")
      ?.value.toLowerCase()
      .trim() || "";
  const especialidade =
    document.querySelector("#filtroEspecialidade")?.value || "todos";
  const status =
    document.querySelector("#filtroStatusProfissional")?.value || "todos";
  let lista = [...profissionais];
  if (texto !== "") {
    lista = lista.filter((profissional) =>
      profissional.nome.toLowerCase().includes(texto),
    );
  }
  if (especialidade !== "todos") {
    lista = lista.filter(
      (profissional) => profissional.especialidade === especialidade,
    );
  }
  if (status !== "todos") {
    lista = lista.filter((profissional) => profissional.status === status);
  }
  renderizarLista(lista);
}
/* ==========================================================
   RENDERIZA LISTA FILTRADA
========================================================== */
function renderizarLista(lista) {
  const container = document.querySelector("#listaProfissionais");
  if (!container) return;
  container.innerHTML = "";
  if (lista.length === 0) {
    container.innerHTML = `
            <div class="empty-professionals">
                <i class="fa-solid fa-user-doctor"></i>
                <h3>Nenhum profissional encontrado</h3>
                <p>Tente alterar os filtros da pesquisa.</p>
            </div>
        `;
    return;
  }
  lista.forEach(criarCardProfissional);
}
/* ==========================================================
   ATUALIZAÇÕES
========================================================== */
function atualizarSistema() {
  Storage.salvar(STORAGE_PROFISSIONAIS, profissionais);
  atualizarFiltroEspecialidades();
  renderizarProfissionais();
  atualizarContador();
}
/* ==========================================================
   OBSERVAR ALTERAÇÕES
========================================================== */
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_PROFISSIONAIS) {
    carregarProfissionais();
    atualizarSistema();
  }
});
/* ==========================================================
   EXPORTAÇÃO
========================================================== */
window.editarProfissional = editarProfissional;

window.visualizarProfissional = visualizarProfissional;

window.excluirProfissional = excluirProfissional;
/* ==========================================================
   SERVICE
========================================================== */
const ProfissionaisService = {
  listar() {
    return profissionais;
  },
  buscar(id) {
    return profissionais.find((profissional) => profissional.id === id);
  },
  salvar(lista) {
    profissionais = lista;
    atualizarSistema();
  },
};
/* ==========================================================
   FUNÇÃO PARA BOTÃO MENU EM DISPOSITIVOS MÓVEIS
========================================================== */
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});
document.querySelectorAll("#sidebar a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 991) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }
  });
});
/* ==========================================================
   API GLOBAL
========================================================== */
window.Profissionais = {
  listar: () => profissionais,
  buscar: ProfissionaisService.buscar,
  salvar: ProfissionaisService.salvar,
  atualizar: atualizarSistema,
};
