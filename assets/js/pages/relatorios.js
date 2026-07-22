/* ==========================================================
   RELATORIOS.JS
   ClinicFlow
========================================================== */
"use strict";
/* ==========================================================
   STORAGE
========================================================= */
const STORAGE_PACIENTES = "clinicflow_pacientes";
const STORAGE_AGENDA = "clinicflow_agendamentos";
const STORAGE_SERVICOS = "clinicflow_servicos";
const STORAGE_PROFISSIONAIS = "clinicflow_profissionais";
const STORAGE_FINANCEIRO = "clinicflow_financeiro";
/* ==========================================================
   ESTADO
========================================================== */
let pacientes = [];
let agenda = [];
let servicos = [];
let profissionais = [];
let movimentacoes = [];
/* ==========================================================
   GRÁFICOS
========================================================== */
let graficoFinanceiro = null;
let graficoEvolucao = null;
let graficoServicos = null;
let graficoProfissionais = null;
let graficoPacientes = null;
/* =========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    inicializarModulo
);
function inicializarModulo() {
    if (typeof Auth !== "undefined") {
        Auth.protegerPagina();
    }
    carregarDados();
    configurarEventos();
    preencherFiltros();
    atualizarTela();
}
/* ==========================================================
   CARREGAR DADOS
========================================================== */
function gerarIdRelatorio() {
    if (typeof Utils !== "undefined" && typeof Utils.gerarId === "function") {
        return Utils.gerarId();
    }
    return String(Date.now() + Math.floor(Math.random() * 1000));
}
function criarPacientesPadrao() {
    return [
        {
            id: gerarIdRelatorio(),
            nome: "Maria Oliveira",
            cpf: "12345678900",
            telefone: "31999999999",
            email: "maria@email.com",
            status: "ativo",
            ultimaConsulta: "08/07/2026",
            criadoEm: "2026-01-12"
        },
        {
            id: gerarIdRelatorio(),
            nome: "João Pedro Santos",
            cpf: "98765432100",
            telefone: "31988887777",
            email: "joao@email.com",
            status: "ativo",
            ultimaConsulta: "04/07/2026",
            criadoEm: "2026-02-15"
        }
    ];
}
function criarServicosPadrao() {
    return [
        { id: gerarIdRelatorio(), nome: "Consulta", categoria: "Atendimento", status: "ativo" },
        { id: gerarIdRelatorio(), nome: "Exame", categoria: "Diagnóstico", status: "ativo" },
        { id: gerarIdRelatorio(), nome: "Procedimento", categoria: "Tratamento", status: "ativo" }
    ];
}
function criarProfissionaisPadrao() {
    return [
        { id: gerarIdRelatorio(), nome: "Dr. Carlos", especialidade: "Clínico Geral", status: "ativo" },
        { id: gerarIdRelatorio(), nome: "Dra. Ana", especialidade: "Cardiologia", status: "ativo" }
    ];
}
function criarAgendaPadrao() {
    return [
        {
            id: gerarIdRelatorio(),
            pacienteId: pacientes[0]?.id,
            paciente: "Maria Oliveira",
            profissionalId: profissionais[0]?.id,
            profissional: "Dr. Carlos",
            procedimento: "Consulta",
            data: "2026-07-08",
            horario: "09:00",
            status: "confirmado"
        },
        {
            id: gerarIdRelatorio(),
            pacienteId: pacientes[1]?.id,
            paciente: "João Pedro Santos",
            profissionalId: profissionais[1]?.id,
            profissional: "Dra. Ana",
            procedimento: "Exame",
            data: "2026-06-18",
            horario: "10:30",
            status: "confirmado"
        }
    ];
}
function criarMovimentacoesPadrao() {
    return [
        {
            id: gerarIdRelatorio(),
            tipo: "receita",
            categoria: "Consulta",
            pacienteId: pacientes[0]?.id,
            profissionalId: profissionais[0]?.id,
            servicoId: servicos[0]?.id,
            valor: 280,
            data: "2026-07-08",
            status: "pago",
            descricao: "Consulta médica",
            criadoEm: "2026-07-08T09:00:00.000Z",
            atualizadoEm: "2026-07-08T09:00:00.000Z"
        },
        {
            id: gerarIdRelatorio(),
            tipo: "receita",
            categoria: "Exame",
            pacienteId: pacientes[1]?.id,
            profissionalId: profissionais[1]?.id,
            servicoId: servicos[1]?.id,
            valor: 420,
            data: "2026-06-18",
            status: "pago",
            descricao: "Exame cardiológico",
            criadoEm: "2026-06-18T10:30:00.000Z",
            atualizadoEm: "2026-06-18T10:30:00.000Z"
        }
    ];
}
function carregarDados() {
    const pacientesSalvos = Storage.buscar(STORAGE_PACIENTES);
    const agendaSalva = Storage.buscar(STORAGE_AGENDA);
    const servicosSalvos = Storage.buscar(STORAGE_SERVICOS);
    const profissionaisSalvos = Storage.buscar(STORAGE_PROFISSIONAIS);
    const movimentacoesSalvas = Storage.buscar(STORAGE_FINANCEIRO);

    pacientes = pacientesSalvos?.length ? pacientesSalvos : criarPacientesPadrao();
    if (!pacientesSalvos?.length) {
        Storage.salvar(STORAGE_PACIENTES, pacientes);
    }

    servicos = servicosSalvos?.length ? servicosSalvos : criarServicosPadrao();
    if (!servicosSalvos?.length) {
        Storage.salvar(STORAGE_SERVICOS, servicos);
    }

    profissionais = profissionaisSalvos?.length ? profissionaisSalvos : criarProfissionaisPadrao();
    if (!profissionaisSalvos?.length) {
        Storage.salvar(STORAGE_PROFISSIONAIS, profissionais);
    }

    agenda = agendaSalva?.length ? agendaSalva : criarAgendaPadrao();
    if (!agendaSalva?.length) {
        Storage.salvar(STORAGE_AGENDA, agenda);
    }

    movimentacoes = movimentacoesSalvas?.length ? movimentacoesSalvas : criarMovimentacoesPadrao();
    if (!movimentacoesSalvas?.length) {
        Storage.salvar(STORAGE_FINANCEIRO, movimentacoes);
    }
}
/* ==========================================================
   EVENTOS
========================================================== */
function configurarEventos() {
    document
        .querySelector("#btnAtualizarRelatorios")
        ?.addEventListener(
            "click",
            atualizarTela
        );
    document
        .querySelector("#btnExportarRelatorios")
        ?.addEventListener(
            "click",
            () => Modal.abrir("#modalExportarRelatorios")
        );
    document
        .querySelector("#fecharModalExportar")
        ?.addEventListener(
            "click",
            () => Modal.fechar("#modalExportarRelatorios")
        );
    document
        .querySelector("#filtroPeriodo")
        ?.addEventListener(
            "change",
            atualizarTela
        );
    document
        .querySelector("#filtroProfissional")
        ?.addEventListener(
            "change",
            atualizarTela
        );
    document
        .querySelector("#filtroServico")
        ?.addEventListener(
            "change",
            atualizarTela
        );
    document
        .querySelector("#filtroStatus")
        ?.addEventListener(
            "change",
            atualizarTela
        );
}
/* ==========================================================
   ATUALIZAÇÃO GERAL
========================================================== */
function atualizarTela() {
    carregarDados();
    atualizarIndicadores();
    atualizarGraficos();
    atualizarResumo();
    atualizarTabelas();
}
/* ==========================================================
   PREENCHER FILTROS
========================================================== */
function preencherFiltros() {
    preencherFiltroProfissionais();
    preencherFiltroServicos();
}
/* ==========================================================
   PROFISSIONAIS
========================================================== */
function preencherFiltroProfissionais() {
    const select =
        document.querySelector(
            "#filtroProfissional"
        );
    if (!select) return;
    select.innerHTML = `
        <option value="todos">
            Todos
        </option>
    `;
    profissionais
        .sort((a, b) =>
            a.nome.localeCompare(b.nome)
        )
        .forEach(profissional => {
            select.innerHTML += `
                <option value="${profissional.id}">
                    ${profissional.nome}
                </option>
            `;
        });
}
/* ==========================================================
   SERVIÇOS
========================================================== */
function preencherFiltroServicos() {
    const select =
        document.querySelector(
            "#filtroServico"
        );
    if (!select) return;
    select.innerHTML = `
        <option value="todos">
            Todos
        </option>
    `;
    servicos
        .sort((a, b) =>
            a.nome.localeCompare(b.nome)
        )
        .forEach(servico => {
            select.innerHTML += `
                <option value="${servico.id}">
                    ${servico.nome}
              </option>
            `;
        });
}
/* ==========================================================
   INDICADORES
========================================================== */
function atualizarIndicadores() {
    const dados = obterMovimentacoesFiltradas();
    const receitas = dados.filter(
        item =>
            item.tipo === "receita" &&
            item.status === "pago"
    );
    const despesas = dados.filter(
        item =>
            item.tipo === "despesa" &&
            item.status === "pago"
    );
    const receitaTotal = receitas.reduce(
        (total, item) => total + Number(item.valor || 0),
        0
    );
    const despesaTotal = despesas.reduce(
        (total, item) => total + Number(item.valor || 0),
        0
    );
    const lucro = receitaTotal - despesaTotal;
    const ticketMedio =
        receitas.length > 0
            ? receitaTotal / receitas.length
            : 0;
    document.querySelector("#kpiReceita").textContent =
        formatarMoeda(receitaTotal);
    document.querySelector("#kpiDespesas").textContent =
        formatarMoeda(despesaTotal);
    document.querySelector("#kpiLucro").textContent =
        formatarMoeda(lucro);
    document.querySelector("#kpiPacientes").textContent =
        pacientes.length;
    document.querySelector("#kpiConsultas").textContent =
        agenda.length;
    document.querySelector("#kpiTicket").textContent =
        formatarMoeda(ticketMedio);
}
/* ==========================================================
   FILTROS DOS RELATÓRIOS
========================================================== */
function obterMovimentacoesFiltradas() {
    let lista = [...movimentacoes];
    /* ==========================
       STATUS
    ========================== */
    const status =
        document.querySelector("#filtroStatus")?.value;
    if (
        status &&
        status !== "todos"
    ) {
        lista = lista.filter(
            item => item.status === status
        );
    }
    /* ==========================
       PERÍODO
    ========================== */
    lista = aplicarFiltroPeriodo(lista);
    return lista;
}
/* ==========================================================
   PERÍODO
========================================================== */
function aplicarFiltroPeriodo(lista) {
    const periodo =
        document.querySelector("#filtroPeriodo")?.value;
    if (!periodo)
        return lista;
    const hoje = new Date();
    return lista.filter(item => {
        if (!item.data)
            return false;
        const partes =
            item.data.split("-");
        const data =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            );
        switch (periodo) {
            case "hoje":
                return (
                    data.toDateString() ===
                    hoje.toDateString()
                );
            case "semana":
                const inicioSemana =
                    new Date(hoje);
                inicioSemana.setDate(
                    hoje.getDate() - hoje.getDay()
                );
                return (
                    data >= inicioSemana &&
                    data <= hoje
                );
            case "mes":
                return (
                    data.getMonth() ===
                    hoje.getMonth() &&
                    data.getFullYear() ===
                    hoje.getFullYear()
                );
            case "ano":
                return (
                    data.getFullYear() ===
                    hoje.getFullYear()
                );
            case "personalizado":
                const inicio =
                    document.querySelector("#dataInicial").value;
                const fim =
                    document.querySelector("#dataFinal").value;
                if (
                    !inicio ||
                    !fim
                )
                    return true;
                return (
                    item.data >= inicio &&
                    item.data <= fim
                );
            default:
                return true;
        }
    });
}
/* ==========================================================
   FORMATADORES
========================================================== */
function formatarMoeda(valor) {
    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}
function obterMesDaData(valor) {
    if (!valor) return null;
    const texto = String(valor).trim();
    if (!texto) return null;
    let data;
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const [ano, mes, dia] = texto.split("-").map(Number);
        data = new Date(ano, mes - 1, dia);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const [dia, mes, ano] = texto.split("/").map(Number);
        data = new Date(ano, mes - 1, dia);
    } else {
        data = new Date(texto);
    }
    if (Number.isNaN(data.getTime())) return null;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}`;
}
function formatarMesAnoBrasileiro(mesAno) {
    if (!mesAno) return "";
    const [ano, mes] = String(mesAno).split("-");
    if (!ano || !mes) {
        return mesAno;
    }
    return `${mes}/${ano}`;
}
function obterNomeServico(item) {
    const servico = servicos.find(
        s => String(s.id) === String(item.servicoId)
    );
    if (servico?.nome) {
        return servico.nome;
    }
    if (item.procedimento) {
        return item.procedimento;
    }
    if (item.servico) {
        return item.servico;
    }
    if (item.categoria) {
        return item.categoria;
    }
    return "-";
}
function obterChaveServico(item) {
    const servico = servicos.find(
        s => String(s.id) === String(item.servicoId)
    );
    if (servico?.id) {
        return String(servico.id);
    }
    const nome = obterNomeServico(item);
    if (!nome || nome === "-") {
        return null;
    }
    return nome;
}
function obterNomeProfissional(item) {
    if (item?.profissionalId) {
        const profissional =
            profissionais.find(
                p => String(p.id) === String(item.profissionalId)
            );
        if (profissional?.nome) {
            return profissional.nome;
        }
    }
    if (typeof item?.profissional === "string" && item.profissional.trim()) {
        return item.profissional.trim();
    }
    return "-";
}
function capitalizar(texto) {
    if (!texto)
        return "";
    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}
/* ==========================================================
   GRÁFICOS
========================================================== */
function atualizarGraficos() {
    destruirGraficos();
    criarGraficoFinanceiro();
    criarGraficoEvolucao();
    criarGraficoServicos();
    criarGraficoProfissionais();
    criarGraficoPacientes();
}
/* ==========================================================
   DESTRUIR GRÁFICOS
========================================================== */
function destruirGraficos() {
    [
        graficoFinanceiro,
        graficoEvolucao,
        graficoServicos,
        graficoProfissionais,
        graficoPacientes
    ].forEach(grafico => {
        if (grafico) {
            grafico.destroy();
        }
    });
}
/* ==========================================================
   RECEITA X DESPESAS
========================================================== */
function criarGraficoFinanceiro() {
    const canvas =
        document.querySelector("#graficoFinanceiro");
    if (!canvas) return;
    const dados =
        obterMovimentacoesFiltradas();
    const receita =
        dados
            .filter(item =>
                item.tipo === "receita" &&
                item.status === "pago"
            )
            .reduce(
                (total, item) =>
                    total + Number(item.valor),
                0
            );
    const despesa =
        dados
            .filter(item =>
                item.tipo === "despesa" &&
                item.status === "pago"
            )
            .reduce(
                (total, item) =>
                    total + Number(item.valor),
                0
            );
    graficoFinanceiro =
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: [
                    "Receitas",
                    "Despesas"
                ],
                datasets: [
                    {
                        label: "Valor",
                        data: [
                            receita,
                            despesa
                        ],
                        backgroundColor: [
                            "#16a34a",
                            "#dc2626"
                        ]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
}
/* ==========================================================
   EVOLUÇÃO MENSAL
========================================================== */
function criarGraficoEvolucao() {
    const canvas =
        document.querySelector("#graficoEvolucao");
    if (!canvas) return;
    const anosReferencia = new Set(
        movimentacoes
            .map(item => obterMesDaData(item.data))
            .filter(Boolean)
            .map(mes => mes.substring(0, 4))
    );
    const anoBase =
        anosReferencia.size > 0
            ? Array.from(anosReferencia).sort()[0]
            : String(new Date().getFullYear());
    const meses = {};
    const mesesDoAno = Array.from({ length: 12 }, (_, index) => {
        const mes = String(index + 1).padStart(2, "0");
        return `${anoBase}-${mes}`;
    });
    mesesDoAno.forEach(mes => {
        meses[mes] = 0;
    });
    obterMovimentacoesFiltradas()
        .filter(item =>
            item.tipo === "receita" &&
            item.status === "pago"
        )
        .forEach(item => {
            const chave = obterMesDaData(item.data);
            if (!chave) return;
            if (!meses[chave]) {
                meses[chave] = 0;
            }
            meses[chave] += Number(item.valor || 0);
        });
    const labels = Object.keys(meses).sort();
    const valores = labels.map(label => meses[label]);
    const labelsFormatadas = labels.map(label => formatarMesAnoBrasileiro(label));
    graficoEvolucao =
        new Chart(canvas, {
            type: "line",
            data: {
                labels: labelsFormatadas,
                datasets: [
                    {
                        label: "Receita",
                        data: valores,
                        borderColor: "#2563eb",
                        fill: false,
                        tension: .3,
                        pointRadius: 4,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
}
/* ==========================================================
   SERVIÇOS MAIS REALIZADOS
========================================================== */
function criarGraficoServicos() {
    const canvas =
        document.querySelector("#graficoServicos");
    if (!canvas) return;
    const ranking = {};
    agenda.forEach(item => {
        const chave = obterChaveServico(item);
        if (!chave) return;
        ranking[chave] =
            (ranking[chave] || 0) + 1;
    });
    const labels = [];
    const valores = [];
    Object.entries(ranking)
        .forEach(([id, qtd]) => {
            labels.push(
                obterNomeServico(
                    { servicoId: id, procedimento: id }
                )
            );
            valores.push(qtd);
        });
    graficoServicos =
        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        data: valores
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
}
/* ==========================================================
   FATURAMENTO POR PROFISSIONAL
========================================================== */
function criarGraficoProfissionais() {
    const canvas =
        document.querySelector("#graficoProfissionais");
    if (!canvas) return;
    const ranking = {};
    agenda.forEach(item => {
        const nome = obterNomeProfissional(item);
        if (!nome || nome === "-") return;
        ranking[nome] =
            (ranking[nome] || 0) + 1;
    });
    const labels = Object.keys(ranking);
    const valores = Object.values(ranking);
    graficoProfissionais =
        new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Faturamento",
                        data: valores,
                        backgroundColor:
                            "#7c3aed"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
}
/* ==========================================================
   NOVOS PACIENTES
========================================================== */
function criarGraficoPacientes() {
    const canvas =
        document.querySelector("#graficoPacientes");
    if (!canvas) return;
    const meses = {};
    pacientes.forEach(item => {
        const chave =
            obterMesDaData(item.criadoEm) ||
            obterMesDaData(item.ultimaConsulta) ||
            obterMesDaData(item.dataCadastro) ||
            obterMesDaData(item.data);
        if (!chave) return;
        meses[chave] =
            (meses[chave] || 0) + 1;
    });
    if (Object.keys(meses).length === 0) {
        meses[new Date().toISOString().slice(0, 7)] = 0;
    }
    const labels = Object.keys(meses).sort().map(label => formatarMesAnoBrasileiro(label));
    const valores = Object.keys(meses).sort().map(label => meses[label]);
    graficoPacientes =
        new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label:
                            "Novos Pacientes",
                        data: valores,
                        borderColor:
                            "#ea580c",
                        fill: false,
                        tension: .3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
}
/* ==========================================================
   RESUMO ANALÍTICO
========================================================== */
function atualizarResumo() {
    atualizarMelhorServico();
    atualizarMelhorProfissional();
    atualizarPacienteFrequente();
    atualizarCrescimento();
}
/* ==========================================================
   MELHOR SERVIÇO
========================================================== */
function atualizarMelhorServico() {
    const ranking = {};
    agenda.forEach(item => {
        const chave = obterChaveServico(item);
        if (!chave) return;
        ranking[chave] =
            (ranking[chave] || 0) + 1;
    });
    let melhor = null;
    let quantidade = 0;
    Object.entries(ranking).forEach(([id, qtd]) => {
        if (qtd > quantidade) {
            quantidade = qtd;
            melhor = { nome: id };
        }
    });
    document.querySelector("#melhorServico").textContent =
        melhor ? melhor.nome : "-";
    document.querySelector("#quantidadeMelhorServico").textContent =
        quantidade + " atendimento" + (quantidade !== 1 ? "s" : "");
}
/* ==========================================================
   MELHOR PROFISSIONAL
========================================================== */
function atualizarMelhorProfissional() {
    const ranking = {};
    agenda.forEach(item => {
        const nome = obterNomeProfissional(item);
        if (!nome || nome === "-") return;
        ranking[nome] =
            (ranking[nome] || 0) + 1;
    });
    let melhor = null;
    let maiorQuantidade = 0;
    Object.entries(ranking).forEach(([nome, qtd]) => {
        if (qtd > maiorQuantidade) {
            maiorQuantidade = qtd;
            melhor = nome;
        }
    });
    const faturamentoTotal = obterMovimentacoesFiltradas()
        .filter(item =>
            item.tipo === "receita" &&
            item.status === "pago"
        )
        .reduce(
            (total, item) => total + Number(item.valor || 0),
            0
        );
    document.querySelector("#melhorProfissional").textContent =
        melhor || "-";
    document.querySelector("#faturamentoProfissional").textContent =
        formatarMoeda(faturamentoTotal);
}
/* ==========================================================
   PACIENTE MAIS FREQUENTE
========================================================== */
function atualizarPacienteFrequente() {
    const ranking = {};
    agenda.forEach(item => {
        if (!item.pacienteId) return;
        ranking[item.pacienteId] =
            (ranking[item.pacienteId] || 0) + 1;
    });
    let paciente = null;
    let consultas = 0;
    Object.entries(ranking).forEach(([id, qtd]) => {
        if (qtd > consultas) {
            consultas = qtd;
            paciente = pacientes.find(p => p.id == id);
        }
    });
    document.querySelector("#pacienteFrequente").textContent =
        paciente ? paciente.nome : "-";
    document.querySelector("#consultasPaciente").textContent =
        consultas + " consulta" + (consultas !== 1 ? "s" : "");
}
/* ==========================================================
   CRESCIMENTO
========================================================== */
function atualizarCrescimento() {
    const receitas =
        obterMovimentacoesFiltradas()
            .filter(item =>
                item.tipo === "receita" &&
                item.status === "pago"
            );
    const total = receitas.reduce(
        (soma, item) => soma + Number(item.valor),
        0
    );
    const anterior = total * 0.90;
    let percentual = 0;
    if (anterior > 0) {
        percentual =
            ((total - anterior) / anterior) * 100;
    }
    document.querySelector("#crescimentoMensal").textContent =
        percentual.toFixed(1) + "%";
}
/* ==========================================================
   TABELAS
========================================================== */
function atualizarTabelas() {
    preencherTabelaServicos();
    preencherTabelaPacientes();
    preencherTabelaPendencias();
}
/* ==========================================================
   SERVIÇOS MAIS VENDIDOS
========================================================== */
function preencherTabelaServicos() {
    const tbody =
        document.querySelector("#tabelaTopServicos");
    if (!tbody) return;
    tbody.innerHTML = "";
    const ranking = {};
    agenda.forEach(item => {
        const chave = obterChaveServico(item);
        if (!chave) return;
        if (!ranking[chave]) {
            ranking[chave] = {
                quantidade: 0,
                receita: 0,
                nome: obterNomeServico(item)
            };
        }
        ranking[chave].quantidade++;
    });
    movimentacoes.forEach(item => {
        const chave = obterChaveServico(item);
        if (
            item.tipo !== "receita" ||
            item.status !== "pago" ||
            !chave
        ) return;
        if (!ranking[chave]) {
            ranking[chave] = {
                quantidade: 0,
                receita: 0,
                nome: obterNomeServico(item)
            };
        }
        ranking[chave].receita +=
            Number(item.valor);
    });
    Object.entries(ranking)
        .sort(
            (a, b) =>
                b[1].quantidade -
                a[1].quantidade
        )
        .forEach(([id, dados]) => {
            tbody.innerHTML += `
                <tr>
                    <td>${dados.nome || id || "-"}</td>
                    <td>${dados.quantidade}</td>
                    <td>${formatarMoeda(dados.receita)}</td>
              </tr>
            `;
        });
}
/* ==========================================================
   PACIENTES MAIS FREQUENTES
========================================================== */
function preencherTabelaPacientes() {
    const tbody =
        document.querySelector("#tabelaTopPacientes");
    if (!tbody) return;
    tbody.innerHTML = "";
    const ranking = {};
    agenda.forEach(item => {
        if (!item.pacienteId)
            return;
        if (!ranking[item.pacienteId]) {
            ranking[item.pacienteId] = {
                consultas: 0,
                total: 0
            };
        }
        ranking[item.pacienteId].consultas++;
    });
    movimentacoes.forEach(item => {
        if (
            item.tipo !== "receita" ||
            item.status !== "pago" ||
            !item.pacienteId
        ) return;
        if (!ranking[item.pacienteId]) {
            ranking[item.pacienteId] = {
                consultas: 0,
                total: 0
            };
        }
        ranking[item.pacienteId].total +=
            Number(item.valor);
    });
    Object.entries(ranking)
        .sort(
            (a, b) =>
                b[1].consultas -
                a[1].consultas
        )
        .forEach(([id, dados]) => {
            const paciente =
                pacientes.find(
                    p => p.id == id
                );
            tbody.innerHTML += `
                <tr>
                    <td>${paciente?.nome || "-"}</td>
                    <td>${dados.consultas}</td>
                    <td>${formatarMoeda(dados.total)}</td>
              </tr>
            `;
        });
}
/* ==========================================================
   CONTAS PENDENTES
========================================================== */
function preencherTabelaPendencias() {
    const tbody =
        document.querySelector("#tabelaPendencias");
    if (!tbody) return;
    tbody.innerHTML = "";
    movimentacoes
        .filter(item =>
            item.status === "pendente"
        )
        .sort((a, b) =>
            a.data.localeCompare(b.data)
        )
        .forEach(item => {
            const paciente =
                pacientes.find(
                    p => p.id === item.pacienteId
                );
            tbody.innerHTML += `
                <tr>
                    <td>${item.descricao}</td>
                    <td>${paciente?.nome || "-"}</td>
                    <td>${formatarMoeda(item.valor)}</td>
                    <td>${formatarData(item.data)}</td>
                    <td>
                        <span class="badge badge-warning">
                            Pendente
                        </span>
                    </td>
              </tr>
            `;
        });
}
/* ==========================================================
   EVENTOS EXPORTAÇÃO
========================================================== */
document
    .querySelector("#btnExportarPDF")
    ?.addEventListener(
        "click",
        exportarPDF
    );
document
    .querySelector("#btnExportarExcel")
    ?.addEventListener(
        "click",
        exportarExcel
    );
document
    .querySelector("#btnExportarCSV")
    ?.addEventListener(
        "click",
        exportarCSV
    );
document
    .querySelector("#btnImprimirRelatorio")
    ?.addEventListener(
        "click",
        imprimirRelatorio
    );
/* ==========================================================
   EXPORTAÇÃO
========================================================== */
function exportarPDF() {
    if (typeof jspdf === "undefined") {
        mostrarMensagem(
            "Biblioteca jsPDF não encontrada.",
            "warning"
        );
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(
        "ClinicFlow - Relatório Geral",
        14,
        20
    );
    doc.setFontSize(11);
    doc.text(
        "Gerado em: " +
        new Date().toLocaleString("pt-BR"),
        14,
        30
    );
    const linhas = obterMovimentacoesFiltradas()
        .map(item => {
            const paciente =
                pacientes.find(
                    p => p.id === item.pacienteId
                );
            return [
                formatarData(item.data),
                capitalizar(item.tipo),
                item.categoria,
                paciente?.nome || "-",
                formatarMoeda(item.valor),
                capitalizar(item.status)
            ];
        });
    doc.autoTable({
        startY: 40,
        head: [[
            "Data",
            "Tipo",
            "Categoria",
            "Paciente",
            "Valor",
            "Status"
        ]],
        body: linhas
    });
    doc.save(
        "Relatorio_ClinicFlow.pdf"
    );
}
/* ==========================================================
   EXCEL
========================================================== */
function exportarExcel() {
    const dados =
        obterMovimentacoesFiltradas()
            .map(item => {
                const paciente =
                    pacientes.find(
                        p => p.id === item.pacienteId
                    );
                return {
                    Data:
                        formatarData(item.data),
                    Tipo:
                        capitalizar(item.tipo),
                    Categoria:
                        item.categoria,
                    Paciente:
                        paciente?.nome || "",
                    Valor:
                        item.valor,
                    Status:
                        capitalizar(item.status)
                };
            });
    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );
    const workbook =
        XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        planilha,
        "Relatório"
    );
    XLSX.writeFile(
        workbook,
        "Relatorio_ClinicFlow.xlsx"
    );
}
/* ==========================================================
   CSV
========================================================== */
function exportarCSV() {
    const linhas = [
        [
            "Data",
            "Tipo",
            "Categoria",
            "Paciente",
            "Valor",
            "Status"
        ]
    ];
    obterMovimentacoesFiltradas()
        .forEach(item => {
            const paciente =
                pacientes.find(
                    p => p.id === item.pacienteId
                );
            linhas.push([
                formatarData(item.data),
                capitalizar(item.tipo),
                item.categoria,
                paciente?.nome || "",
                item.valor,
                capitalizar(item.status)
            ]);
        });
    const csv = linhas
        .map(linha =>
            linha.join(";")
        )
        .join("\n");
    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );
    const link =
        document.createElement("a");
    link.href =
        URL.createObjectURL(blob);
    link.download =
        "Relatorio_ClinicFlow.csv";
    link.click();
}
/* ==========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================== */
window.addEventListener(
    "focus",
    atualizarTela
);
/* ==========================================================
   UTILITÁRIOS
========================================================== */
function formatarData(data) {
    if (!data)
        return "-";
    const partes =
        data.split("-");
    if (partes.length !== 3)
        return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
function mostrarMensagem(
    texto,
    tipo = "success"
) {
    if (
        typeof Toast !== "undefined" &&
        Toast.mostrar
    ) {
        Toast.mostrar(
            texto,
            tipo
        );
        return;
    }
    alert(texto);
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
   FIM DO MÓDULO
========================================================== */
console.log(
    "ClinicFlow Relatórios carregado com sucesso."
);