/* ==========================================================
   PACIENTES.JS
   ClinicFlow
   Controle do módulo de pacientes
========================================================== */
let pacientes = [];
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  carregarPacientes();
  renderizarPacientes();
  iniciarModalPaciente();
  iniciarCadastro();
  iniciarPesquisa();
  iniciarFiltroStatus();
  iniciarAcoesTabela();
});
/* ==========================================================
   CARREGAR PACIENTES
========================================================== */
function carregarPacientes() {
  pacientes =
    Storage.buscar("clinicflow_pacientes") || criarPacientesIniciais();
  Storage.salvar("clinicflow_pacientes", pacientes);
}

function criarPacientesIniciais() {
  return [
    {
      id: Utils.gerarId(),
      nome: "Maria Oliveira",
      cpf: "12345678900",
      telefone: "31999999999",
      email: "maria@email.com",
      status: "ativo",
      ultimaConsulta: "08/07/2026",
    },
    {
      id: Utils.gerarId(),
      nome: "João Pedro Santos",
      cpf: "98765432100",
      telefone: "31988887777",
      email: "joao@email.com",
      status: "ativo",
      ultimaConsulta: "04/07/2026",
    },
    {
      id: Utils.gerarId(),
      nome: "Carlos Henrique",
      cpf: "45678912300",
      telefone: "31977776666",
      email: "carlos@email.com",
      status: "inativo",
      ultimaConsulta: "15/05/2026",
    },
  ];
}
/* =========================================================
   RENDERIZAÇÃO DA TABELA
========================================================== */
function renderizarPacientes() {
  Table.renderizar(
    "#tabelaPacientes tbody",
    pacientes,
    (paciente) => `
        <tr data-status="${paciente.status}">
            <td>
                <div class="d-flex align-center gap-2">
                    <img 
                    class="avatar"
                    src="https://i.pravatar.cc/80">
                    <div>
                        <strong>
                            ${paciente.nome}
                        </strong>
                        <p>
                            ${paciente.email}
                        </p>
                    </div>
                </div>
            </td>
            <td>
                ${Utils.formatarCPF(paciente.cpf)}
            </td>
            <td>
                ${Utils.formatarTelefone(paciente.telefone)}
            </td>
            <td>
                ${paciente.ultimaConsulta}
            </td>
            <td>
                <span class="status status-confirmado">
                    ${paciente.status}
                </span>
            </td>
            <td>
                <button 
                class="btn btn-warning btn-sm btn-ver"
                data-id="${paciente.id}">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button 
                class="btn btn-danger btn-sm btn-excluir"
                data-id="${paciente.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
        `,
  );
  iniciarAcoesTabela();
}
/* ==========================================================
   MODAL
========================================================== */
function iniciarModalPaciente() {
  const abrir = document.querySelector("#btnNovoPaciente");
  if (abrir) {
    abrir.addEventListener("click", () => {
      Modal.abrir("#modalPaciente");
    });
  }
  document
    .querySelectorAll("#fecharModalPaciente,#cancelarPaciente")
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        Modal.fechar("#modalPaciente");
      });
    });
}

/* ==========================================================
   CADASTRO
========================================================== */
function iniciarCadastro() {
  const salvar = document.querySelector("#salvarPaciente");
  if (salvar) {
    salvar.addEventListener("click", cadastrarPaciente);
  }
}

function cadastrarPaciente() {
  const nome = document.querySelector("#nomePaciente").value.trim();
  if (!nome) {
    alert("Informe o nome do paciente");
    return;
  }
  pacientes.push({
    id: Utils.gerarId(),
    nome,
    cpf: "00000000000",
    telefone: "00000000000",
    email: "",
    status: "ativo",
    ultimaConsulta: "-",
  });
  Storage.salvar("clinicflow_pacientes", pacientes);
  renderizarPacientes();
  Modal.fechar("#modalPaciente");
  alert("Paciente cadastrado!");
}
/* ==========================================================
   PESQUISA
========================================================== */
function iniciarPesquisa() {
  const campo = document.querySelector("#pesquisaPaciente");
  if (!campo) return;
  campo.addEventListener(
    "input",
    Utils.debounce(() => {
      filtrar(campo.value);
    }, 300),
  );
}

function filtrar(valor) {
  valor = valor.toLowerCase();
  const filtrados = pacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(valor),
  );
  Table.renderizar(
    "#tabelaPacientes tbody",
    filtrados,
    (paciente) => `
        <tr data-status="${paciente.status}">
            <td>${paciente.nome}</td>
            <td>${paciente.cpf}</td>
            <td>${paciente.telefone}</td>
            <td>${paciente.ultimaConsulta}</td>
            <td>${paciente.status}</td>
            <td>
            </td>
        </tr>
        `,
  );
}
/* ==========================================================
   FILTRO STATUS
========================================================== */
function iniciarFiltroStatus() {
  const filtro = document.querySelector("#filtroStatus");
  if (!filtro) return;
  filtro.addEventListener("change", () => {
    const valor = filtro.value;
    if (valor === "todos") {
      renderizarPacientes();
      return;
    }
    Table.renderizar(
      "#tabelaPacientes tbody",
      pacientes.filter((paciente) => paciente.status === valor),
      (paciente) => `
                <tr>
                    <td>
                        ${paciente.nome}
                    </td>
                    <td>
                        ${paciente.cpf}
                    </td>
                    <td>
                        ${paciente.telefone}
                    </td>
                    <td>
                        ${paciente.status}
                    </td>
                </tr>
                `,
    );
  });
}
/* ==========================================================
   AÇÕES
========================================================== */
function iniciarAcoesTabela() {
  document.querySelectorAll(".btn-excluir").forEach((botao) => {
    botao.addEventListener("click", () => {
      excluirPaciente(botao.dataset.id);
    });
  });
  document.querySelectorAll(".btn-ver").forEach((botao) => {
    botao.addEventListener("click", () => {
      Modal.abrir("#modalDetalhesPaciente");
    });
  });
  const fechar = document.querySelector("#fecharVisualizarPaciente");

  if (fechar) {
    fechar.onclick = () => {
      Modal.fechar("#modalDetalhesPaciente");
    };
  }
}

function excluirPaciente(id) {
  pacientes = pacientes.filter((paciente) => paciente.id != id);
  Storage.salvar("clinicflow_pacientes", pacientes);
  renderizarPacientes();
}

document.addEventListener("DOMContentLoaded", () => {
  const btnSair = document.querySelector("#btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      Auth.logout();
    });
  }
});
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
