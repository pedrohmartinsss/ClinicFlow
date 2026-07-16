/* ==========================================================
   DASHBOARD.JS
   ClinicFlow
   Controle do painel principal
========================================================== */
let agendamentos = [];
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  Auth.protegerPagina();
  carregarAgendamentos();
  renderizarAgendamentos();
  atualizarCards();
  iniciarModalAgendamento();
  iniciarPesquisaAgenda();
  iniciarAcoesAgenda();
  iniciarMenuDashboard();

  const btnSair = document.querySelector("#btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      Auth.logout();
    });
  }
});
/* ==========================================================
   CARREGAMENTO
========================================================== */
function carregarAgendamentos() {
  agendamentos =
    Storage.buscar("clinicflow_agendamentos") || criarAgendamentosIniciais();
  Storage.salvar("clinicflow_agendamentos", agendamentos);
}

function criarAgendamentosIniciais() {
  return [
    {
      id: Utils.gerarId(),
      paciente: "Maria Oliveira",
      profissional: "Dr. Carlos",
      data: "08/07/2026",
      horario: "09:00",
      status: "confirmado",
    },
    {
      id: Utils.gerarId(),
      paciente: "João Pedro Santos",
      profissional: "Dra. Ana",
      data: "08/07/2026",
      horario: "10:30",
      status: "pendente",
    },
  ];
}
/* ==========================================================
   RENDERIZAÇÃO DA AGENDA
========================================================== */
function renderizarAgendamentos() {
  const lista = document.querySelector("#listaAgendamentos");
  if (!lista) return;
  lista.innerHTML = "";
  if (agendamentos.length === 0) {
    lista.innerHTML = `
            <p class="empty">
                Nenhum agendamento encontrado.
            </p>
        `;
    return;
  }
  agendamentos.forEach((agendamento) => {
    lista.innerHTML += `
            <div 
            class="agenda-item"
            data-id="${agendamento.id}">
                <div>
                    <strong>
                        ${agendamento.horario}
                    </strong>
                    <p>
                        ${agendamento.paciente}
                    </p>
                    <small>
                        ${agendamento.profissional}
                    </small>
                </div>
                <span class="status">
                    ${agendamento.status}
                </span>
            </div>
            `;
  });
}
/* ==========================================================
   CARDS DO DASHBOARD
========================================================== */
function atualizarCards() {
  Cards.atualizar("#totalAgendamentos", agendamentos.length);
  Cards.atualizar(
    "#pacientesAtendidos",
    agendamentos.filter((item) => item.status === "confirmado").length,
  );
  Cards.atualizar(
    "#pendentes",
    agendamentos.filter((item) => item.status === "pendente").length,
  );
}
/* ==========================================================
   MODAL AGENDAMENTO
========================================================== */
function iniciarModalAgendamento() {
  const abrir = document.querySelector("#btnNovoAgendamento,#btnAgenda");
  if (abrir) {
    abrir.addEventListener("click", () => {
      preencherProfissionaisAgendamento();
      Modal.abrir("#modalAgendamento");
    });
  }
  document
    .querySelectorAll("#fecharModalAgendamento,#cancelarAgendamento")
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        Modal.fechar("#modalAgendamento");
      });
    });
  const salvar = document.querySelector("#salvarAgendamento");
  if (salvar) {
    salvar.addEventListener("click", salvarAgendamento);
  }
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

function salvarAgendamento() {
  const paciente = document.querySelector("#pacienteAgendamento").value;
  const profissional = document.querySelector("#profissionalAgendamento").value;
  if (!paciente || !profissional) {
    alert("Selecione um paciente e um profissional");
    return;
  }
  agendamentos.push({
    id: Utils.gerarId(),
    paciente,
    profissional,
    data: document.querySelector("#dataAgendamento").value,
    horario: document.querySelector("#horarioAgendamento").value,
    status: "pendente",
  });
  Storage.salvar("clinicflow_agendamentos", agendamentos);
  renderizarAgendamentos();
  atualizarCards();
  Modal.fechar("#modalAgendamento");
  alert("Agendamento criado com sucesso!");
}
/* ==========================================================
   PESQUISA
========================================================== */
function iniciarPesquisaAgenda() {
  const campo = document.querySelector("#pesquisaAgenda");
  if (!campo) return;
  campo.addEventListener(
    "input",
    Utils.debounce(() => {
      pesquisarAgenda(campo.value);
    }, 300),
  );
}

function pesquisarAgenda(valor) {
  valor = valor.toLowerCase();
  document.querySelectorAll(".agenda-item").forEach((item) => {
    item.style.display = item.innerText.toLowerCase().includes(valor)
      ? ""
      : "none";
  });
}
/* ==========================================================
   AÇÕES
========================================================== */
function iniciarAcoesAgenda() {
  const lista = document.querySelector("#listaAgendamentos");
  if (!lista) return;

  lista.addEventListener("click", (event) => {
    const item = event.target.closest(".agenda-item");
    if (!item) return;

    alterarStatus(item.dataset.id);
  });
}

function alterarStatus(id) {
  const agendamento = agendamentos.find((item) => item.id == id);
  if (!agendamento) return;
  if (agendamento.status === "pendente") {
    agendamento.status = "confirmado";
  } else {
    agendamento.status = "pendente";
  }
  Storage.salvar("clinicflow_agendamentos", agendamentos);
  renderizarAgendamentos();
  atualizarCards();
}

/* ==========================================================
   FUNÇÃO PARA BOTÃO MENU EM DISPOSITIVOS MÓVEIS
========================================================== */
function iniciarMenuDashboard() {
  const btnMenu = document.getElementById("btnMenu");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!btnMenu || !sidebar || !overlay) return;

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
}
