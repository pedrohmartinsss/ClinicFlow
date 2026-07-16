/* ==========================================================
   PACIENTES.JS
   ClinicFlow
   Controle do módulo de pacientes
========================================================== */
let pacientes = [];
let pacienteVisualizadoId = null;
let pacienteEditandoId = null;
const PACIENTES_POR_PAGINA = 10;
let paginaAtualPacientes = 1;
let listaPacientesAtual = [];
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  carregarPacientes();
  renderizarPacientes();
  atualizarCardsPacientes();
  iniciarModalPaciente();
  iniciarCadastro();
  iniciarPesquisa();
  iniciarFiltroStatus();
  iniciarAcoesTabela();
  iniciarDetalhesPaciente();
  iniciarExportacaoPacientes();
});
/* ==========================================================
   CARREGAR PACIENTES
========================================================== */
function carregarPacientes() {
  pacientes =
    Storage.buscar("clinicflow_pacientes") || criarPacientesIniciais();
  Storage.salvar("clinicflow_pacientes", pacientes);
}
/* =========================================================
   RENDERIZAÇÃO DA TABELA
========================================================== */
function renderizarPacientes() {
  listaPacientesAtual = pacientes;
  Table.renderizar(
    "#tabelaPacientes tbody",
    obterPacientesDaPagina(pacientes),
    (paciente) => `
        <tr data-status="${paciente.status}">
            <td>
                <div class="d-flex align-center gap-2">
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
                <div class="acoes-paciente">
                <button 
                class="btn btn-warning btn-sm btn-ver"
                title="Visualizar"
                data-id="${paciente.id}">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button
                class="btn btn-primary btn-sm btn-editar"
                title="Editar"
                data-id="${paciente.id}">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button 
                class="btn btn-danger btn-sm btn-excluir"
                title="Excluir"
                data-id="${paciente.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
                </div>
            </td>
        </tr>
        `,
  );
  iniciarAcoesTabela();
  renderizarPaginacaoPacientes();
}
/* ==========================================================
   MODAL
========================================================== */
function iniciarModalPaciente() {
  const abrir = document.querySelector("#btnNovoPaciente");
  if (abrir) {
    abrir.addEventListener("click", () => {
      pacienteEditandoId = null;
      limparFormularioPaciente();
      document.querySelector("#tituloModalPaciente").textContent = "Novo Paciente";
      Modal.abrir("#modalPaciente");
    });
  }
  document
    .querySelectorAll("#fecharModalPaciente,#cancelarPaciente")
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        pacienteEditandoId = null;
        limparFormularioPaciente();
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
  const dados = obterDadosFormularioPaciente();
  const { nome } = dados;
  if (!nome) {
    alert("Informe o nome do paciente");
    return;
  }
  if (pacienteEditandoId !== null) {
    const indice = pacientes.findIndex((paciente) => String(paciente.id) === String(pacienteEditandoId));
    if (indice === -1) return;
    pacientes[indice] = { ...pacientes[indice], ...dados };
  } else {
    pacientes.push({
      id: Utils.gerarId(),
      ...dados,
      status: "ativo",
      ultimaConsulta: "-",
      criadoEm: new Date().toISOString(),
    });
  }
  Storage.salvar("clinicflow_pacientes", pacientes);
  renderizarPacientes();
  atualizarCardsPacientes();
  limparFormularioPaciente();
  pacienteEditandoId = null;
  Modal.fechar("#modalPaciente");
  alert("Paciente salvo com sucesso!");
}

function obterDadosFormularioPaciente() {
  return {
    nome: document.querySelector("#nomePaciente").value.trim(),
    cpf: document.querySelector("#cpfPaciente").value.trim(),
    nascimento: document.querySelector("#nascimentoPaciente").value,
    sexo: document.querySelector("#sexoPaciente").value,
    telefone: document.querySelector("#telefonePaciente").value.trim(),
    email: document.querySelector("#emailPaciente").value.trim(),
    convenio: document.querySelector("#convenioPaciente").value.trim(),
    alergias: document.querySelector("#alergiasPaciente").value.trim(),
    observacoes: document.querySelector("#observacoesPaciente").value.trim(),
  };
}

function limparFormularioPaciente() {
  document.querySelector("#nomePaciente").value = "";
  document.querySelector("#cpfPaciente").value = "";
  document.querySelector("#nascimentoPaciente").value = "";
  document.querySelector("#sexoPaciente").value = "Masculino";
  document.querySelector("#telefonePaciente").value = "";
  document.querySelector("#emailPaciente").value = "";
  document.querySelector("#convenioPaciente").value = "";
  document.querySelector("#alergiasPaciente").value = "";
  document.querySelector("#observacoesPaciente").value = "";
}

function editarPaciente(id) {
  const paciente = pacientes.find((item) => String(item.id) === String(id));
  if (!paciente) return;

  pacienteEditandoId = paciente.id;
  document.querySelector("#tituloModalPaciente").textContent = "Editar Paciente";
  document.querySelector("#nomePaciente").value = paciente.nome || "";
  document.querySelector("#cpfPaciente").value = paciente.cpf || "";
  document.querySelector("#nascimentoPaciente").value = paciente.nascimento || "";
  document.querySelector("#sexoPaciente").value = paciente.sexo || "Masculino";
  document.querySelector("#telefonePaciente").value = paciente.telefone || "";
  document.querySelector("#emailPaciente").value = paciente.email || "";
  document.querySelector("#convenioPaciente").value = paciente.convenio || "";
  document.querySelector("#alergiasPaciente").value = paciente.alergias || "";
  document.querySelector("#observacoesPaciente").value = paciente.observacoes || "";
  Modal.abrir("#modalPaciente");
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
  const filtrados = pacientes.filter((paciente) => {
    const conteudo = `${paciente.nome || ""} ${paciente.cpf || ""} ${paciente.telefone || ""}`.toLowerCase();
    return conteudo.includes(valor);
  });
  renderizarListaFiltrada(filtrados);
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
    renderizarListaFiltrada(
      pacientes.filter((paciente) => paciente.status === valor),
    );
  });
}

function renderizarListaFiltrada(lista, redefinirPagina = true) {
  listaPacientesAtual = lista;
  if (redefinirPagina) paginaAtualPacientes = 1;
  Table.renderizar(
    "#tabelaPacientes tbody",
    obterPacientesDaPagina(lista),
    (paciente) => `
      <tr data-status="${paciente.status}">
        <td>
          <div class="d-flex align-center gap-2">
            <div><strong>${paciente.nome}</strong><p>${paciente.email || ""}</p></div>
          </div>
        </td>
        <td>${Utils.formatarCPF(paciente.cpf)}</td>
        <td>${Utils.formatarTelefone(paciente.telefone)}</td>
        <td>${paciente.ultimaConsulta}</td>
        <td><span class="status status-confirmado">${paciente.status}</span></td>
        <td>
          <div class="acoes-paciente">
            <button class="btn btn-warning btn-sm btn-ver" title="Visualizar" data-id="${paciente.id}"><i class="fa-solid fa-eye"></i></button>
            <button class="btn btn-primary btn-sm btn-editar" title="Editar" data-id="${paciente.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-sm btn-excluir" title="Excluir" data-id="${paciente.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `,
  );
  iniciarAcoesTabela();
  renderizarPaginacaoPacientes();
}

function obterPacientesDaPagina(lista) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / PACIENTES_POR_PAGINA));
  paginaAtualPacientes = Math.min(paginaAtualPacientes, totalPaginas);
  const inicio = (paginaAtualPacientes - 1) * PACIENTES_POR_PAGINA;
  return lista.slice(inicio, inicio + PACIENTES_POR_PAGINA);
}

function renderizarPaginacaoPacientes() {
  const container = document.querySelector("#paginacaoPacientes");
  if (!container) return;

  const totalPaginas = Math.max(1, Math.ceil(listaPacientesAtual.length / PACIENTES_POR_PAGINA));
  container.innerHTML = "";
  container.appendChild(criarBotaoPaginacao("‹", paginaAtualPacientes - 1, paginaAtualPacientes === 1));

  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    const botao = criarBotaoPaginacao(String(pagina), pagina, false);
    botao.classList.toggle("active", pagina === paginaAtualPacientes);
    container.appendChild(botao);
  }

  container.appendChild(criarBotaoPaginacao("›", paginaAtualPacientes + 1, paginaAtualPacientes === totalPaginas));
}

function criarBotaoPaginacao(texto, pagina, desabilitado) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  botao.disabled = desabilitado;
  botao.addEventListener("click", () => {
    paginaAtualPacientes = pagina;
    renderizarListaFiltrada(listaPacientesAtual, false);
  });
  return botao;
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
      abrirDetalhesPaciente(botao.dataset.id);
    });
  });
  document.querySelectorAll(".btn-editar").forEach((botao) => {
    botao.addEventListener("click", () => editarPaciente(botao.dataset.id));
  });
  const fechar = document.querySelector("#fecharVisualizarPaciente");

  if (fechar) {
    fechar.onclick = () => {
      Modal.fechar("#modalDetalhesPaciente");
    };
  }
}

/* ==========================================================
   DETALHES E CONSULTAS DO PACIENTE
========================================================== */
function iniciarDetalhesPaciente() {
  document.querySelectorAll("[data-aba-paciente]").forEach((aba) => {
    aba.addEventListener("click", () => selecionarAbaPaciente(aba.dataset.abaPaciente));
  });

  document
    .querySelector("#pesquisaConsultaPaciente")
    ?.addEventListener("input", renderizarConsultasPaciente);
  document
    .querySelector("#filtroStatusConsultaPaciente")
    ?.addEventListener("change", renderizarConsultasPaciente);
  document
    .querySelector("#filtroTipoFinanceiroPaciente")
    ?.addEventListener("change", renderizarFinanceiroPaciente);
}

function abrirDetalhesPaciente(id) {
  const paciente = pacientes.find((item) => String(item.id) === String(id));
  if (!paciente) return;

  pacienteVisualizadoId = paciente.id;
  document.querySelector("#detalhesPacienteNome").textContent = paciente.nome;
  document.querySelector("#detalhesPacienteDesde").textContent = "Dados cadastrais";
  document.querySelector("#detalhesPacienteCpf").textContent = Utils.formatarCPF(paciente.cpf);
  document.querySelector("#detalhesPacienteTelefone").textContent = Utils.formatarTelefone(paciente.telefone);
  document.querySelector("#detalhesPacienteEmail").textContent = paciente.email || "-";
  document.querySelector("#detalhesPacienteConvenio").textContent = paciente.convenio || "-";
  document.querySelector("#detalhesPacienteNascimento").textContent = formatarDataNascimento(paciente.nascimento);
  document.querySelector("#detalhesPacienteSexo").textContent = paciente.sexo || "-";
  document.querySelector("#detalhesPacienteAlergias").textContent = paciente.alergias || "Nenhuma alergia informada.";
  document.querySelector("#detalhesPacienteObservacoes").textContent = paciente.observacoes || "Nenhuma observação registrada.";

  document.querySelector("#pesquisaConsultaPaciente").value = "";
  document.querySelector("#filtroStatusConsultaPaciente").value = "todos";
  document.querySelector("#filtroTipoFinanceiroPaciente").value = "todos";
  document.querySelector("#detalhesConsultaPaciente").hidden = true;
  selecionarAbaPaciente("dados");
  Modal.abrir("#modalDetalhesPaciente");
}

function selecionarAbaPaciente(abaSelecionada) {
  const paineis = {
    dados: "#painelDadosPaciente",
    consultas: "#painelConsultasPaciente",
    financeiro: "#painelFinanceiroPaciente",
    observacoes: "#painelObservacoesPaciente",
  };
  Object.entries(paineis).forEach(([aba, seletor]) => {
    document.querySelector(seletor).hidden = aba !== abaSelecionada;
  });

  document.querySelectorAll("[data-aba-paciente]").forEach((aba) => {
    aba.classList.toggle("active", aba.dataset.abaPaciente === abaSelecionada);
  });

  if (abaSelecionada === "consultas") renderizarConsultasPaciente();
  if (abaSelecionada === "financeiro") renderizarFinanceiroPaciente();
}

function renderizarFinanceiroPaciente() {
  const lista = document.querySelector("#listaFinanceiroPaciente");
  if (!lista || pacienteVisualizadoId === null) return;

  const tipoSelecionado = document.querySelector("#filtroTipoFinanceiroPaciente").value;
  const movimentacoes = (Storage.buscar("clinicflow_financeiro") || [])
    .filter((movimentacao) => String(movimentacao.pacienteId) === String(pacienteVisualizadoId));
  const receita = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "receita")
    .reduce((total, movimentacao) => total + Number(movimentacao.valor || 0), 0);
  const despesa = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "despesa")
    .reduce((total, movimentacao) => total + Number(movimentacao.valor || 0), 0);

  document.querySelector("#totalReceitasPaciente").textContent = formatarMoeda(receita);
  document.querySelector("#totalDespesasPaciente").textContent = formatarMoeda(despesa);
  lista.innerHTML = "";

  const listaFiltrada = movimentacoes
    .filter((movimentacao) => tipoSelecionado === "todos" || movimentacao.tipo === tipoSelecionado)
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));

  if (!listaFiltrada.length) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Nenhum lançamento financeiro encontrado para este paciente.";
    lista.appendChild(mensagem);
    return;
  }

  listaFiltrada.forEach((movimentacao) => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    const titulo = document.createElement("strong");
    titulo.textContent = `${formatarDataConsulta(movimentacao.data)} — ${formatarMoeda(movimentacao.valor)}`;
    const descricao = document.createElement("p");
    descricao.textContent = `${movimentacao.descricao || movimentacao.categoria || "Lançamento"} • ${movimentacao.tipo || "-"} • ${movimentacao.status || "-"}`;
    item.append(titulo, descricao);
    lista.appendChild(item);
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderizarConsultasPaciente() {
  const lista = document.querySelector("#listaConsultasPaciente");
  if (!lista || pacienteVisualizadoId === null) return;

  const texto = document.querySelector("#pesquisaConsultaPaciente").value.trim().toLowerCase();
  const status = document.querySelector("#filtroStatusConsultaPaciente").value;
  const paciente = pacientes.find((item) => String(item.id) === String(pacienteVisualizadoId));
  let consultas = Storage.buscar("clinicflow_agendamentos") || [];

  consultas = consultas
    .filter((consulta) =>
      String(consulta.pacienteId) === String(pacienteVisualizadoId) ||
      (!consulta.pacienteId && consulta.paciente === paciente?.nome),
    )
    .filter((consulta) => status === "todos" || consulta.status === status)
    .filter((consulta) => {
      const conteudo = `${consulta.procedimento || ""} ${consulta.profissional || ""}`.toLowerCase();
      return conteudo.includes(texto);
    })
    .sort((a, b) => `${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`));

  lista.innerHTML = "";
  if (!consultas.length) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Nenhuma consulta encontrada para este paciente.";
    lista.appendChild(mensagem);
    return;
  }

  consultas.forEach((consulta) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "timeline-item btn btn-secondary";
    botao.innerHTML = `<strong>${formatarDataConsulta(consulta.data)} • ${consulta.horario || "-"}</strong><p>${consulta.procedimento || "Consulta"} — ${consulta.profissional || "Profissional não informado"}</p>`;
    botao.addEventListener("click", () => exibirDetalhesConsulta(consulta));
    lista.appendChild(botao);
  });
}

function exibirDetalhesConsulta(consulta) {
  const detalhes = document.querySelector("#detalhesConsultaPaciente");
  detalhes.innerHTML = "";
  const titulo = document.createElement("h4");
  titulo.textContent = "Detalhes da consulta";
  const descricao = document.createElement("p");
  descricao.textContent = `${formatarDataConsulta(consulta.data)} às ${consulta.horario || "-"} • ${consulta.profissional || "Profissional não informado"} • Status: ${consulta.status || "-"}`;
  const observacao = document.createElement("p");
  observacao.textContent = `Observações: ${consulta.observacao || "Nenhuma observação registrada."}`;
  detalhes.append(titulo, descricao, observacao);
  detalhes.hidden = false;
}

function formatarDataConsulta(data) {
  if (!data) return "Data não informada";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function excluirPaciente(id) {
  pacientes = pacientes.filter((paciente) => paciente.id != id);
  Storage.salvar("clinicflow_pacientes", pacientes);
  renderizarPacientes();
  atualizarCardsPacientes();
}

/* ==========================================================
   CARDS DE RESUMO
========================================================== */
function atualizarCardsPacientes() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const agendamentos = Storage.buscar("clinicflow_agendamentos") || [];

  const novosNoMes = pacientes.filter((paciente) => {
    if (!paciente.criadoEm) return false;
    const dataCadastro = new Date(paciente.criadoEm);
    return dataCadastro.getMonth() === mesAtual && dataCadastro.getFullYear() === anoAtual;
  }).length;
  const consultasRealizadas = agendamentos.filter(
    (agendamento) => agendamento.status === "concluido",
  ).length;
  const aniversariantes = pacientes.filter((paciente) => {
    if (!paciente.nascimento) return false;
    const [, mes, dia] = paciente.nascimento.split("-");
    return Number(mes) === mesAtual + 1 && Number(dia) === hoje.getDate();
  }).length;

  document.querySelector("#cardTotalPacientes").textContent = pacientes.length;
  document.querySelector("#cardNovosPacientes").textContent = novosNoMes;
  document.querySelector("#cardConsultasRealizadas").textContent = consultasRealizadas;
  document.querySelector("#cardAniversariantes").textContent = aniversariantes;
}

/* ==========================================================
   EXPORTAÇÃO DE PACIENTES
========================================================== */
function iniciarExportacaoPacientes() {
  document.querySelector("#btnExportarPacientes")?.addEventListener("click", () => {
    preencherPacientesExportacao();
    document.querySelector("#tipoExportacaoPaciente").value = "geral";
    alternarPacienteExportacao();
    Modal.abrir("#modalExportarPacientes");
  });
  document
    .querySelector("#tipoExportacaoPaciente")
    ?.addEventListener("change", alternarPacienteExportacao);
  document
    .querySelector("#confirmarExportarPacientes")
    ?.addEventListener("click", exportarPacientesPDF);
  document
    .querySelectorAll("#fecharModalExportarPacientes,#cancelarExportarPacientes")
    .forEach((botao) => botao.addEventListener("click", () => Modal.fechar("#modalExportarPacientes")));
}

function preencherPacientesExportacao() {
  const select = document.querySelector("#pacienteExportacao");
  select.innerHTML = "";
  pacientes
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((paciente) => {
      const opcao = document.createElement("option");
      opcao.value = paciente.id;
      opcao.textContent = paciente.nome;
      select.appendChild(opcao);
    });
}

function alternarPacienteExportacao() {
  const tipo = document.querySelector("#tipoExportacaoPaciente").value;
  document.querySelector("#grupoPacienteExportacao").hidden = tipo !== "paciente";
}

function exportarPacientesPDF() {
  if (typeof window.jspdf === "undefined") {
    alert("Não foi possível carregar a biblioteca de geração de PDF.");
    return;
  }

  const tipo = document.querySelector("#tipoExportacaoPaciente").value;
  if (tipo === "paciente") {
    const id = document.querySelector("#pacienteExportacao").value;
    const paciente = pacientes.find((item) => String(item.id) === String(id));
    if (!paciente) {
      alert("Selecione um paciente para exportar.");
      return;
    }
    gerarPdfPaciente(paciente);
  } else {
    gerarPdfGeralPacientes();
  }
  Modal.fechar("#modalExportarPacientes");
}

function gerarPdfGeralPacientes() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("ClinicFlow - Relatório de Pacientes", 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);
  doc.autoTable({
    startY: 34,
    head: [["Paciente", "CPF", "Telefone", "E-mail", "Status", "Última consulta"]],
    body: pacientes.map((paciente) => [
      paciente.nome,
      Utils.formatarCPF(paciente.cpf) || "-",
      Utils.formatarTelefone(paciente.telefone) || "-",
      paciente.email || "-",
      paciente.status || "-",
      paciente.ultimaConsulta || "-",
    ]),
  });
  doc.save("pacientes-clinicflow.pdf");
}

function gerarPdfPaciente(paciente) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const agendamentos = (Storage.buscar("clinicflow_agendamentos") || []).filter(
    (agendamento) =>
      String(agendamento.pacienteId) === String(paciente.id) ||
      (!agendamento.pacienteId && agendamento.paciente === paciente.nome),
  );
  const movimentacoes = (Storage.buscar("clinicflow_financeiro") || []).filter(
    (movimentacao) => String(movimentacao.pacienteId) === String(paciente.id),
  );

  doc.setFontSize(18);
  doc.text("ClinicFlow - Ficha do Paciente", 14, 20);
  doc.setFontSize(12);
  doc.text(paciente.nome, 14, 30);
  doc.autoTable({
    startY: 36,
    theme: "grid",
    body: [
      ["CPF", Utils.formatarCPF(paciente.cpf) || "-"],
      ["Nascimento", formatarDataNascimento(paciente.nascimento)],
      ["Sexo", paciente.sexo || "-"],
      ["Telefone", Utils.formatarTelefone(paciente.telefone) || "-"],
      ["E-mail", paciente.email || "-"],
      ["Convênio", paciente.convenio || "-"],
      ["Alergias", paciente.alergias || "Nenhuma informada"],
      ["Observações", paciente.observacoes || "Nenhuma registrada"],
    ],
  });
  let proximaLinha = doc.lastAutoTable.finalY + 10;
  doc.text("Consultas", 14, proximaLinha);
  doc.autoTable({
    startY: proximaLinha + 4,
    head: [["Data", "Horário", "Profissional", "Procedimento", "Status"]],
    body: agendamentos.map((item) => [
      formatarDataConsulta(item.data), item.horario || "-", item.profissional || "-", item.procedimento || "Consulta", item.status || "-",
    ]),
  });
  proximaLinha = doc.lastAutoTable.finalY + 10;
  doc.text("Financeiro", 14, proximaLinha);
  doc.autoTable({
    startY: proximaLinha + 4,
    head: [["Data", "Tipo", "Descrição", "Valor", "Status"]],
    body: movimentacoes.map((item) => [
      formatarDataConsulta(item.data), item.tipo || "-", item.descricao || item.categoria || "-", formatarMoeda(item.valor), item.status || "-",
    ]),
  });
  doc.save(`paciente-${normalizarNomeArquivo(paciente.nome)}.pdf`);
}

function normalizarNomeArquivo(nome) {
  return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatarDataNascimento(data) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return "-";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
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
