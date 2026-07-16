/* ==========================================================
   AGENDA.JS
   ClinicFlow
   ========================================================== */
"use strict";
/* =========================================================
   CHAVES DO STORAGE
   ========================================================== */
const STORAGE_AGENDAMENTOS = "clinicflow_agendamentos";
const STORAGE_PACIENTES = "clinicflow_pacientes";
/* ==========================================================
   ESTADO DA AGENDA
   ========================================================== */
let dataAtual = new Date();
let agendamentos = [];
let pacientes = [];
/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Protege a página
  if (typeof Auth !== "undefined") {
    Auth.protegerPagina();
  }
  carregarDados();
  configurarEventos();
  configurarFiltros();
  atualizarData();
  preencherPacientes();
  preencherFiltroProfissionais();
  aplicarFiltros();
});
/* ==========================================================
   CARREGAMENTO DOS DADOS
   ========================================================== */
function carregarDados() {
  agendamentos = Storage.buscar(STORAGE_AGENDAMENTOS) || [];
  pacientes = Storage.buscar(STORAGE_PACIENTES) || [];
}
/* ==========================================================
   CONFIGURAÇÃO DOS EVENTOS
   ========================================================== */
function configurarEventos() {
  const btnNovo = document.querySelector("#btnNovoAgendamento");
  if (btnNovo) {
    btnNovo.addEventListener("click", abrirModal);
  }
  const btnCancelar = document.querySelector("#cancelarAgendamento");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      fecharModal();
    });
  }
  const btnFechar = document.querySelector("#fecharModalAgendamento");
  if (btnFechar) {
    btnFechar.addEventListener("click", () => {
      fecharModal();
    });
  }
  const btnSalvar = document.querySelector("#salvarAgendamento");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarAgendamento);
  }
  const btnHoje = document.querySelector("#btnHoje");
  if (btnHoje) {
    btnHoje.addEventListener("click", () => {
      dataAtual = new Date();
      atualizarData();
      renderizarAgenda();
    });
  }
  const btnAnterior = document.querySelector("#btnDiaAnterior");
  if (btnAnterior) {
    btnAnterior.addEventListener("click", voltarDia);
  }
  const btnProximo = document.querySelector("#btnProximoDia");
  if (btnProximo) {
    btnProximo.addEventListener("click", avancarDia);
  }
  const btnSair = document.querySelector("#btnLogout");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      Auth.logout();
    });
  }
}
/* ==========================================================
   CONTROLE DA DATA
   ========================================================== */
function atualizarData() {
  const elemento = document.querySelector("#dataAtual");
  if (!elemento) return;
  elemento.textContent = dataAtual.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function voltarDia() {
  dataAtual.setDate(dataAtual.getDate() - 1);
  atualizarData();
  renderizarAgenda();
}

function avancarDia() {
  dataAtual.setDate(dataAtual.getDate() + 1);
  atualizarData();
  renderizarAgenda();
}
/* ==========================================================
   MODAL
   ========================================================== */
function abrirModal() {
  const modal = document.querySelector("#modalAgendamento");
  if (!modal) return;
  preencherProfissionaisAgendamento();
  modal.classList.add("active");
}
function fecharModal() {
  limparFormulario();
  const modal = document.querySelector("#modalAgendamento");
  if (!modal) {
    console.error("Modal de agendamento não encontrado");
    return;
  }
  modal.classList.remove("active");
}
/* ==========================================================
   PREENCHER PACIENTES
   ========================================================== */
function preencherPacientes() {
  const select = document.querySelector("#pacienteAgendamento");
  if (!select) return;
  select.innerHTML = `
        <option value="">
            Selecione um paciente
        </option>
    `;
  pacientes.forEach((paciente) => {
    select.innerHTML += `
            <option value="${paciente.id}">
                ${paciente.nome}
            </option>
        `;
  });
}
/* ==========================================================
   MODAL (UTILIZANDO modal.js)
========================================================== */
function abrirModal() {
  const modal = document.querySelector("#modalAgendamento");
  if (!modal) {
    console.error("Modal não encontrado.");
    return;
  }
  preencherProfissionaisAgendamento();
  modal.classList.add("active");
}
function fecharModal() {
  limparFormulario();
  const modal = document.querySelector("#modalAgendamento");
  if (!modal) {
    console.error("Modal de agendamento não encontrado");
    return;
  }
  modal.classList.remove("active");
}
/* ==========================================================
   RENDERIZAÇÃO DA AGENDA
========================================================== */
function renderizarAgenda() {
  limparTimeline();
  const dataSelecionada = formatarData(dataAtual);
  const agendaDoDia = agendamentos.filter((agendamento) => {
    return agendamento.data === dataSelecionada;
  });
  agendaDoDia.sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });
  agendaDoDia.forEach(renderizarCard);
}
/* =========================================================
   LIMPAR TIMELINE
========================================================== */
function limparTimeline() {
  const horarios = document.querySelectorAll(".timeline-events");
  horarios.forEach((container) => {
    container.innerHTML = "";
  });
}
/* ==========================================================
   RENDERIZAR CARD
========================================================== */
function renderizarCard(agendamento) {
  const horaBase = agendamento.horario.substring(0, 2) + ":00";
  const container = document.querySelector(
    `.timeline-events[data-hour="${horaBase}"]`,
  );
  if (!container) return;
  const card = document.createElement("div");
  card.className = `agenda-card ${agendamento.status}`;
  card.innerHTML = `
        <div class="agenda-card-info">
            <div class="agenda-card-header">
                <div>
                    <div class="agenda-card-paciente">
                        ${agendamento.paciente}
                    </div>
                    <div class="agenda-card-profissional">
                        ${agendamento.profissional}
                    </div>
                </div>
                <select
class="status-badge status-${agendamento.status}"
onchange="alterarStatus(${agendamento.id}, this.value)">
    <option value="pendente"
        ${agendamento.status === "pendente" ? "selected" : ""}>
        Pendente
    </option>
    <option value="confirmado"
        ${agendamento.status === "confirmado" ? "selected" : ""}>
        Confirmado
    </option>
    <option value="concluido"
        ${agendamento.status === "concluido" ? "selected" : ""}>
        Concluído
    </option>
    <option value="cancelado"
        ${agendamento.status === "cancelado" ? "selected" : ""}>
        Cancelado
    </option>
</select>
            </div>
            <div class="agenda-card-procedimento">
                ${agendamento.procedimento}
            </div>
            ${agendamento.observacao
      ? `<div class="agenda-card-observacao">
                    ${agendamento.observacao}
                </div>`
      : ""
    }
            <div class="agenda-card-footer">
                <div class="agenda-card-horario">
                    <i class="fa-solid fa-clock"></i>
                    ${agendamento.horario.substring(0, 5)}
                </div>
                <div class="agenda-card-actions">
                    <button
                        class="btn btn-primary"
                        onclick="editarAgendamento(${agendamento.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button
                        class="btn btn-danger"
                        onclick="excluirAgendamento(${agendamento.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
  container.appendChild(card);
}
/* ==========================================================
   FORMATAR DATA
========================================================== */
function formatarData(data) {
  return data.toISOString().split("T")[0];
}
/* ==========================================================
   CAPITALIZAR
========================================================== */
function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
/* ==========================================================
   HORÁRIOS SEM AGENDAMENTO
========================================================== */
function atualizarHorariosLivres() {
  document.querySelectorAll(".timeline-events").forEach((container) => {
    if (container.children.length === 0) {
      container.innerHTML = `<div class="timeline-empty">
                        Horário disponível
                    </div>`;
    }
  });
}
/* ==========================================================
   ATUALIZAÇÃO FINAL
========================================================== */
const renderizarAgendaOriginal = renderizarAgenda;
renderizarAgenda = function () {
  renderizarAgendaOriginal();
  atualizarHorariosLivres();
};
/* ==========================================================
   CONTROLE DE EDIÇÃO
========================================================== */
let agendamentoEditando = null;
/* ==========================================================
   SALVAR AGENDAMENTO
========================================================== */
function salvarAgendamento() {
  const pacienteId = document.querySelector("#pacienteAgendamento").value;
  const profissional = document.querySelector("#profissionalAgendamento").value;
  const data = document.querySelector("#dataAgendamento").value;
  const horario = document.querySelector("#horarioAgendamento").value;
  const procedimento = document
    .querySelector("#procedimentoAgendamento")
    .value.trim();
  const observacao = document
    .querySelector("#observacaoAgendamento")
    .value.trim();
  if (!pacienteId || !profissional || !data || !horario) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }
  const paciente = pacientes.find((p) => String(p.id) === String(pacienteId));
  if (!paciente) {
    alert("Paciente não encontrado.");
    return;
  }
  const conflito = agendamentos.find(
    (a) =>
      a.id !== agendamentoEditando &&
      a.data === data &&
      a.horario === horario &&
      a.profissional === profissional,
  );
  if (conflito) {
    alert("Já existe um agendamento para este profissional neste horário.");
    return;
  }
  if (agendamentoEditando) {
    const indice = agendamentos.findIndex((a) => a.id === agendamentoEditando);
    agendamentos[indice] = {
      ...agendamentos[indice],
      pacienteId,
      paciente: paciente.nome,
      profissional,
      procedimento,
      observacao,
      data,
      horario,
    };
  } else {
    agendamentos.push({
      id: Utils.gerarId(),
      pacienteId,
      paciente: paciente.nome,
      profissional,
      procedimento,
      observacao,
      data,
      horario,
      status: "pendente",
    });
  }
  Storage.salvar(STORAGE_AGENDAMENTOS, agendamentos);
  limparFormulario();
  fecharModal();
  renderizarAgenda();
  atualizarSistema();
}
/* ==========================================================
   EDITAR
========================================================== */
function editarAgendamento(id) {
  const agendamento = agendamentos.find((a) => a.id === id);
  if (!agendamento) return;
  agendamentoEditando = id;
  document.querySelector("#pacienteAgendamento").value = agendamento.pacienteId;
  document.querySelector("#profissionalAgendamento").value =
    agendamento.profissional;
  document.querySelector("#dataAgendamento").value = agendamento.data;
  document.querySelector("#horarioAgendamento").value = agendamento.horario;
  document.querySelector("#procedimentoAgendamento").value =
    agendamento.procedimento;
  document.querySelector("#observacaoAgendamento").value =
    agendamento.observacao || "";
  abrirModal();
}
/* ==========================================================
   EXCLUIR
========================================================== */
function excluirAgendamento(id) {
  const confirmar = confirm("Deseja realmente excluir este agendamento?");
  if (!confirmar) return;
  agendamentos = agendamentos.filter((a) => a.id !== id);
  Storage.salvar(STORAGE_AGENDAMENTOS, agendamentos);
  atualizarSistema();
}
/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormulario() {
  agendamentoEditando = null;
  document.querySelector("#pacienteAgendamento").value = "";
  document.querySelector("#profissionalAgendamento").value = "";
  document.querySelector("#dataAgendamento").value = "";
  document.querySelector("#horarioAgendamento").value = "";
  document.querySelector("#procedimentoAgendamento").value = "";
  document.querySelector("#observacaoAgendamento").value = "";
}
/* ==========================================================
   FECHAR MODAL
========================================================== */
function fecharModal() {
  limparFormulario();
  const modal = document.querySelector("#modalAgendamento");
  if (!modal) {
    console.error("Modal de agendamento não encontrado");
    return;
  }
  modal.classList.remove("active");
}
/* ==========================================================
   FILTROS
========================================================== */
function configurarFiltros() {
  const filtroProfissional = document.querySelector("#filtroProfissional");
  const filtroStatus = document.querySelector("#filtroStatus");
  const pesquisa = document.querySelector("#pesquisaAgenda");
  if (filtroProfissional) {
    preencherProfissionais();
    filtroProfissional.addEventListener("change", aplicarFiltros);
  }
  if (filtroStatus) {
    filtroStatus.addEventListener("change", aplicarFiltros);
  }
  if (pesquisa) {
    pesquisa.addEventListener("input", aplicarFiltros);
  }
}
/* ==========================================================
   PROFISSIONAIS
========================================================== */
function preencherFiltroProfissionais() {
  const select = document.querySelector("#filtroProfissional");
  if (!select) return;
  const profissionais = [...new Set(agendamentos.map((a) => a.profissional))];
  select.innerHTML = `<option value="todos">Todos</option>`;
  profissionais.forEach((nome) => {
    select.innerHTML += `<option value="${nome}">
                ${nome}
            </option>`;
  });
}

function preencherProfissionaisAgendamento() {
  const select = document.querySelector("#profissionalAgendamento");
  if (!select) return;

  const profissionais = Storage.buscar("clinicflow_profissionais") || [];
  const profissionalSelecionado = select.value;

  select.innerHTML = "";
  const opcaoPadrao = document.createElement("option");
  opcaoPadrao.value = "";
  opcaoPadrao.textContent = "Selecione um profissional";
  select.appendChild(opcaoPadrao);

  profissionais.forEach((profissional) => {
    const opcao = document.createElement("option");
    opcao.value = profissional.nome;
    opcao.textContent = profissional.especialidade
      ? `${profissional.nome} — ${profissional.especialidade}`
      : profissional.nome;
    select.appendChild(opcao);
  });

  select.value = profissionalSelecionado;
}
/* ==========================================================
   APLICAR FILTROS
========================================================== */
function aplicarFiltros() {
  limparTimeline();
  let lista = [...agendamentos];
  const data = formatarData(dataAtual);
  lista = lista.filter((item) => item.data === data);
  const profissional = document.querySelector("#filtroProfissional").value;
  if (profissional !== "todos") {
    lista = lista.filter((item) => item.profissional === profissional);
  }
  const status = document.querySelector("#filtroStatus").value;
  if (status !== "todos") {
    lista = lista.filter((item) => item.status === status);
  }
  const texto = document
    .querySelector("#pesquisaAgenda")
    .value.toLowerCase()
    .trim();
  if (texto !== "") {
    lista = lista.filter((item) => item.paciente.toLowerCase().includes(texto));
  }
  lista.sort((a, b) => a.horario.localeCompare(b.horario));
  lista.forEach(renderizarCard);
  atualizarHorariosLivres();
}
/* ==========================================================
   ALTERAÇÃO DE STATUS
========================================================== */
function alterarStatus(id, novoStatus) {
  const agendamento = agendamentos.find((a) => a.id === id);
  if (!agendamento) return;
  agendamento.status = novoStatus;
  Storage.salvar(STORAGE_AGENDAMENTOS, agendamentos);
  atualizarSistema();
}
/* ==========================================================
   DASHBOARD
========================================================== */
function atualizarDashboard() {
  Storage.salvar(STORAGE_AGENDAMENTOS, agendamentos);
}
/* ==========================================================
   RECARREGAR
========================================================== */
function atualizarAgendaCompleta() {
  carregarDados();
  preencherPacientes();
  preencherProfissionais();
  aplicarFiltros();
}
/* ==========================================================
   NOTIFICAÇÕES
========================================================== */
function mostrarMensagem(mensagem, tipo = "success") {
  if (window.Utils && typeof Utils.toast === "function") {
    Utils.toast(mensagem, tipo);
    return;
  }
  alert(mensagem);
}
/* ==========================================================
   CONFIRMAÇÃO
========================================================== */
function confirmarAcao(mensagem) {
  return confirm(mensagem);
}
/* ==========================================================
   RECARREGAR DADOS
========================================================== */
function atualizarDados() {
  carregarDados();
  preencherPacientes();
  preencherProfissionais();
  aplicarFiltros();
}
/* ==========================================================
   EXPORTAÇÃO (PREPARAÇÃO PARA API)
========================================================== */
const AgendaService = {
  listar() {
    return agendamentos;
  },
  buscar(id) {
    return agendamentos.find((item) => item.id === id);
  },
  salvar(lista) {
    agendamentos = lista;
    Storage.salvar(STORAGE_AGENDAMENTOS, agendamentos);
  },
  atualizar() {
    atualizarDados();
  },
};
/* =========================================================
   OBSERVAR ALTERAÇÕES NO STORAGE
========================================================== */
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_AGENDAMENTOS) {
    atualizarDados();
  }
});
/* ==========================================================
   DASHBOARD
========================================================== */
function sincronizarDashboard() {
  document.dispatchEvent(
    new CustomEvent("agendaAtualizada", {
      detail: {
        quantidade: agendamentos.length,
      },
    }),
  );
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
   ATUALIZAÇÕES AUTOMÁTICAS
========================================================== */
function atualizarSistema() {
  atualizarDados();
  sincronizarDashboard();
}
/* ==========================================================
   INICIALIZAÇÃO FINAL
========================================================== */
window.editarAgendamento = editarAgendamento;
window.excluirAgendamento = excluirAgendamento;
window.alterarStatus = alterarStatus;
window.Agenda = {
  atualizar: atualizarSistema,
  listar: () => agendamentos,
  buscar: AgendaService.buscar,
  salvar: AgendaService.salvar,
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
