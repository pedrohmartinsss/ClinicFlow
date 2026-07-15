/* ==========================================================
   FINANCEIRO.JS
   ClinicFlow
========================================================== */

"use strict";

/* ==========================================================
   STORAGE
========================================================== */
const STORAGE_FINANCEIRO = "clinicflow_financeiro";
const STORAGE_PACIENTES = "clinicflow_pacientes";
const STORAGE_SERVICOS = "clinicflow_servicos";
/* ==========================================================
   ESTADO
========================================================== */
let movimentacoes = [];
let pacientes = [];
let servicos = [];

let movimentacaoEditando = null;
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", inicializarModulo);
function inicializarModulo() {
    if (typeof Auth !== "undefined") {
        Auth.protegerPagina();
    }
    carregarDados();
    configurarEventos();
    preencherPacientes();
    preencherServicos();
    atualizarTela();
}
/* ==========================================================
   CARREGAR DADOS
========================================================== */
function carregarDados() {
    movimentacoes =
        Storage.buscar(STORAGE_FINANCEIRO) || [];
    pacientes =
        Storage.buscar(STORAGE_PACIENTES) || [];
    servicos =
        Storage.buscar(STORAGE_SERVICOS) || [];
}
/* ==========================================================
   CONFIGURAR EVENTOS
========================================================== */
function configurarEventos() {
    document
        .querySelector("#btnNovoLancamento")
        ?.addEventListener(
            "click",
            abrirModalFinanceiro
        );
    document
        .querySelector("#fecharModalLancamento")
        ?.addEventListener(
            "click",
            fecharModalFinanceiro
        );
    document
        .querySelector("#cancelarLancamento")
        ?.addEventListener(
            "click",
            fecharModalFinanceiro
        );
    document
        .querySelector("#salvarLancamento")
        ?.addEventListener(
            "click",
            salvarMovimentacao
        );
    document
        .querySelector("#fecharVisualizarLancamento")
        ?.addEventListener(
            "click",
            () => Modal.fechar("#modalVisualizarLancamento")
        );

    document
        .querySelector("#btnFecharVisualizarLancamento")
        ?.addEventListener(
            "click",
            () => Modal.fechar("#modalVisualizarLancamento")
        );
}
/* ==========================================================
   MODAL
========================================================== */
function abrirModalFinanceiro() {
    movimentacaoEditando = null;
    limparFormulario();
    preencherPacientes();
    document.querySelector(
        "#tituloModalLancamento"
    ).textContent = "Nova Movimentação";
    Modal.abrir("#modalLancamento");
}

function fecharModalFinanceiro() {
    movimentacaoEditando = null;
    limparFormulario();
    Modal.fechar("#modalLancamento");
}
/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormulario() {
    document.querySelector("#tipoLancamento").value = "receita";
    document.querySelector("#categoriaLancamento").value = "";
    document.querySelector("#descricaoLancamento").value = "";
    document.querySelector("#valorLancamento").value = "";
    document.querySelector("#dataLancamento").value = "";
    document.querySelector("#statusLancamento").value = "pendente";
    document.querySelector("#pacienteLancamento").value = "";
    document.querySelector("#observacaoLancamento").value = "";
}
/* ==========================================================
   PREENCHER PACIENTES
========================================================== */
function preencherPacientes() {

    const select = document.querySelector("#pacienteLancamento");
    if (!select) return;
    select.innerHTML = `
        <option value="">
            Nenhum
        </option>
    `;
    pacientes
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(paciente => {
            select.innerHTML += `
                <option value="${paciente.id}">
                    ${paciente.nome}
                </option>
            `;
        });
}
/* ==========================================================
   PREENCHER SERVIÇOS
========================================================== */
function preencherServicos() {
    const select =
        document.querySelector("#servicoMovimentacao");
    if (!select) return;
    select.innerHTML =
        `<option value="">Selecione</option>`;
    servicos
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(servico => {
            select.innerHTML += `
                <option value="${servico.id}">
                    ${servico.nome}
                </option>
            `;
        });
}
/* ==========================================================
   ATUALIZAR TELA
========================================================== */
function atualizarTela() {
    renderizarTabela();
    atualizarCards();
    atualizarFiltros();
}
/* ==========================================================
   SALVAR MOVIMENTAÇÃO
========================================================== */
function salvarMovimentacao() {
    const tipo =
        document.querySelector("#tipoLancamento").value;
    const categoria =
        document.querySelector("#categoriaLancamento").value;
    const pacienteId =
        Number(
            document.querySelector("#pacienteLancamento").value
        );
    const valor =
        Number(
            document.querySelector("#valorLancamento").value
        );
    const data =
        document.querySelector("#dataLancamento").value;
    const status =
        document.querySelector("#statusLancamento").value;
    const descricao =
        document.querySelector("#descricaoLancamento").value.trim();
    /* ==========================================
       VALIDAÇÃO
    ========================================= */
    if (
        categoria === "" ||
        valor <= 0 ||
        data === ""

    ) {
        mostrarMensagem(
            "Preencha todos os campos obrigatórios.",
            "warning"
        );
        return;
    }
    /* ==========================================
       OBJETO
    ========================================== */
    const movimentacao = {
        id:
            movimentacaoEditando ??
            Utils.gerarId(),
        tipo,
        categoria,
        pacienteId,
        valor,
        data,
        status,
        descricao,
        criadoEm:
            movimentacaoEditando
                ? movimentacoes.find(item => item.id === movimentacaoEditando)?.criadoEm
                : new Date().toISOString(),
        atualizadoEm:
            new Date().toISOString()
    };
    /* ==========================================
       NOVO
    ========================================== */
    if (movimentacaoEditando === null) {
        movimentacoes.push(movimentacao);
        mostrarMensagem(
            "Movimentação cadastrada com sucesso."
        );
    } else {
        const indice =
            movimentacoes.findIndex(
                item => item.id === movimentacaoEditando
            );
        movimentacoes[indice] = movimentacao;
        mostrarMensagem(
            "Movimentação atualizada com sucesso."
        );
    }
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    fecharModalFinanceiro();
    atualizarTela();
}
/* ==========================================================
   FORMATAR DATA
========================================================== */

/* ==========================================================
   EDITAR
========================================================== */
function editarMovimentacao(id) {
    const movimentacao =
        movimentacoes.find(
            item => item.id === id
        );
    if (!movimentacao) return;
    movimentacaoEditando = id;
    document.querySelector("#tituloModalLancamento").textContent =
        "Editar Movimentação";
    document.querySelector("#tipoLancamento").value =
        movimentacao.tipo;
    document.querySelector("#categoriaLancamento").value =
        movimentacao.categoria;
    document.querySelector("#pacienteLancamento").value =
        movimentacao.pacienteId || "";
    document.querySelector("#valorLancamento").value =
        movimentacao.valor;
    document.querySelector("#dataLancamento").value =
        movimentacao.data;
    document.querySelector("#statusLancamento").value =
        movimentacao.status;
    document.querySelector("#descricaoLancamento").value =
        movimentacao.descricao;
    Modal.abrir("#modalLancamento");
}
/* ==========================================================
   EXCLUIR
========================================================== */
function excluirMovimentacao(id) {
    if (
        !confirm(
            "Deseja realmente excluir esta movimentação?"
        )
    ) {
        return;
    }
    movimentacoes =
        movimentacoes.filter(
            item => item.id !== id
        );
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    mostrarMensagem(
        "Movimentação removida."
    );
    atualizarTela();
}
/* ==========================================================
   DUPLICAR
========================================================== */
function duplicarMovimentacao(id) {
    const movimentacao =
        movimentacoes.find(
            item => item.id === id
        );
    if (!movimentacao) return;
    const copia = {
        ...movimentacao,
        id:
            Utils.gerarId(),
        criadoEm:
            new Date().toISOString(),
        atualizadoEm:
            new Date().toISOString()
    };
    movimentacoes.push(copia);
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    mostrarMensagem(
        "Movimentação duplicada."
    );
    atualizarTela();
}
/* ==========================================================
   ALTERAR STATUS
========================================================== */
function alterarStatus(id) {
    const movimentacao =
        movimentacoes.find(
            item => item.id === id
        );
    if (!movimentacao) return;
    if (movimentacao.status === "pendente") {
        movimentacao.status = "pago";
    } else if (movimentacao.status === "pago") {
        movimentacao.status = "cancelado";
    } else {
        movimentacao.status = "pendente";
    }
    movimentacao.atualizadoEm =
        new Date().toISOString();
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    atualizarTela();
}
/* ==========================================================
   ATUALIZAR TELA
========================================================== */
function atualizarTela() {
    aplicarFiltros();
    atualizarCards();
}
/* ==========================================================
   APLICAR FILTROS
========================================================== */
function aplicarFiltros() {
    const tbody =
        document.querySelector("#listaFinanceiro");
    if (!tbody) return;
    tbody.innerHTML = "";
    let lista = [...movimentacoes];
    /* ==========================
       PESQUISA
    ========================== */
    const pesquisa =
        document
            .querySelector("#pesquisaFinanceiro")
            ?.value
            .toLowerCase()
            .trim() || "";
    if (pesquisa !== "") {
        lista = lista.filter(item =>
            item.categoria.toLowerCase().includes(pesquisa) ||
            item.descricao.toLowerCase().includes(pesquisa)
        );
    }
    /* ==========================
       STATUS
    ========================== */
    const status =
        document.querySelector("#filtroStatus")?.value;
    if (status && status !== "todos") {
        lista =
            lista.filter(
                item => item.status === status
            );
    }
    /* ==========================
       TIPO
    ========================== */
    const tipo =
        document.querySelector("#filtroTipo")?.value;
    if (tipo && tipo !== "todos") {
        lista =
            lista.filter(
                item => item.tipo === tipo
            );
    }
    /* ==========================
       DATA
    ========================== */
    const periodo =
        document.querySelector("#filtroPeriodo").value;
    if (periodo) {
        lista = lista.filter(item => {
            if (!item.data) return false;
            const anoMes = item.data.slice(0, 7);
            return anoMes === periodo;
        });
    }
    /* ==========================
       ORDENAÇÃO
    ========================== */
    lista.sort((a, b) =>
        new Date(b.data) -
        new Date(a.data)
    );
    lista.forEach(renderizarLinhaFinanceiro);
}
/* ==========================================================
   RENDERIZAR LINHA
========================================================== */
function renderizarLinhaFinanceiro(item) {
    const container =
        document.querySelector("#listaFinanceiro");
    if (!container) return;
    const paciente =
        pacientes.find(
            p => p.id === item.pacienteId
        );
    const servico =
        servicos.find(
            s => s.id === item.servicoId
        );
    const card =
        document.createElement("div");
    card.className = "financeiro-card";
    card.innerHTML = `
        <div class="financeiro-card-header">
            <div>
                <h3>
                    ${item.descricao || item.categoria}
                </h3>
                <span class="badge badge-${item.tipo}">
                    ${capitalizar(item.tipo)}
                </span>
            </div>
            <div class="financeiro-valor ${item.tipo}">
                ${item.tipo === "despesa" ? "-" : "+"}
                ${formatarMoeda(item.valor)}
            </div>
        </div>
        <div class="financeiro-card-body">
            <p>
                <i class="fa-solid fa-calendar"></i>
                ${formatarData(item.data)}
            </p>
            <p>
                <i class="fa-solid fa-layer-group"></i>
                ${item.categoria}
            </p>
            <p>
                <i class="fa-solid fa-user"></i>
                ${paciente?.nome || "-"}
            </p>
        </div>
        <div class="financeiro-card-footer">
            <span class="badge badge-${item.status}">
                ${capitalizar(item.status)}
            </span>
            <div class="acoes">
                <button
                    class="btn btn-secondary btn-sm"
                    onclick="visualizarMovimentacao(${item.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button
                    class="btn btn-primary btn-sm"
                    onclick="editarMovimentacao(${item.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button
                    class="btn btn-warning btn-sm"
                    onclick="duplicarMovimentacao(${item.id})">
                    <i class="fa-solid fa-copy"></i>
                </button>
                <button
                    class="btn btn-danger btn-sm"
                    onclick="excluirMovimentacao(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(card);
}
/* ==========================================================
   CARDS SUPERIORES
========================================================== */
function atualizarCards() {
    const receitas =
        movimentacoes.filter(
            item =>
                item.tipo === "receita" &&
                item.status === "pago"
        );
    const despesas =
        movimentacoes.filter(
            item =>
                item.tipo === "despesa" &&
                item.status === "pago"
        );
    const totalReceitas =
        receitas.reduce(
            (soma, item) =>
                soma + item.valor,
            0
        );
    const totalDespesas =
        despesas.reduce(
            (soma, item) =>
                soma + item.valor,
            0
        );
    const lucro =
        totalReceitas -
        totalDespesas;
    const ticketMedio =
        receitas.length
            ? totalReceitas / receitas.length
            : 0;
    const pendentes =
        movimentacoes.filter(
            item =>
                item.status === "pendente"
        ).length;
    atualizarTexto(
        "#receitaMes",
        formatarMoeda(totalReceitas)
    );
    atualizarTexto(
        "#despesaMes",
        formatarMoeda(totalDespesas)
    );
    atualizarTexto(
        "#saldoAtual",
        formatarMoeda(lucro)
    );
    atualizarTexto(
        "#ticketMedio",
        formatarMoeda(ticketMedio)
    );
    atualizarTexto(
        "#contasReceber",
        pendentes
    );
    atualizarTexto(
        "#cardMovimentacoes",
        movimentacoes.length
    );
}
/* ==========================================================
   VISUALIZAR MOVIMENTAÇÃO
========================================================== */
function visualizarMovimentacao(id) {
    const movimentacao =
        movimentacoes.find(item => item.id === id);
    if (!movimentacao) return;
    const paciente =
        pacientes.find(
            p => p.id === movimentacao.pacienteId
        );
    document.querySelector("#viewDescricaoLancamento").textContent =
        movimentacao.descricao || "-";
    document.querySelector("#viewTipoLancamento").textContent =
        capitalizar(movimentacao.tipo);
    document.querySelector("#viewCategoria").textContent =
        movimentacao.categoria;
    document.querySelector("#viewPaciente").textContent =
        paciente?.nome || "-";
    document.querySelector("#viewValorLancamento").textContent =
        formatarMoeda(movimentacao.valor);
    document.querySelector("#viewData").textContent =
        formatarData(movimentacao.data);
    document.querySelector("#viewStatus").textContent =
        capitalizar(movimentacao.status);
    document.querySelector("#viewObservacao").textContent =
        movimentacao.observacao || "-";
    Modal.abrir("#modalVisualizarLancamento");
}
/* ==========================================================
   DUPLICAR
========================================================== */
function duplicarMovimentacao(id) {
    const original =
        movimentacoes.find(item => item.id === id);
    if (!original) return;
    const copia = {
        ...original,
        id: Utils.gerarId(),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    movimentacoes.push(copia);
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    atualizarTela();
    mostrarMensagem(
        "Movimentação duplicada com sucesso."
    );
}
/* ==========================================================
   EXCLUIR
========================================================== */
function excluirMovimentacao(id) {
    if (!confirm("Deseja excluir esta movimentação?"))
        return;
    movimentacoes =
        movimentacoes.filter(item => item.id !== id);
    Storage.salvar(
        STORAGE_FINANCEIRO,
        movimentacoes
    );
    atualizarTela();
    mostrarMensagem(
        "Movimentação removida."
    );
}
/* ==========================================================
   FORMATAÇÕES
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
function formatarData(data) {
    if (!data) return "-";
    // Se vier no formato YYYY-MM-DD
    if (typeof data === "string" && data.includes("-")) {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }
    // Caso venha um objeto Date
    if (data instanceof Date) {
        return data.toLocaleDateString("pt-BR");
    }
    return data;
}
function capitalizar(texto) {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() +
        texto.slice(1);
}
function atualizarTexto(selector, valor) {
    const elemento =
        document.querySelector(selector);
    if (elemento) {
        elemento.textContent = valor;
    }
}
/* ==========================================================
   MENSAGEM
========================================================== */
function mostrarMensagem(
    mensagem,
    tipo = "success"
) {
    if (
        window.Utils &&
        typeof Utils.toast === "function"
    ) {
        Utils.toast(
            mensagem,
            tipo
        );
        return;
    }
    alert(mensagem);
}
/* ==========================================================
   EVENTOS DOS FILTROS
========================================================== */
document
    .querySelector("#pesquisaFinanceiro")
    ?.addEventListener(
        "input",
        aplicarFiltros
    );
document
    .querySelector("#filtroTipo")
    ?.addEventListener(
        "change",
        aplicarFiltros
    );
document
    .querySelector("#filtroStatus")
    ?.addEventListener(
        "change",
        aplicarFiltros
    );
document
    .querySelector("#filtroPeriodo")
    ?.addEventListener(
        "change",
        aplicarFiltros
    );
/* ==========================================================
   STORAGE
========================================================== */
window.addEventListener(
    "storage",
    (event) => {
        if (event.key === STORAGE_FINANCEIRO) {
            carregarDados();
            atualizarTela();
        }
    }
);
/* ==========================================================
   FECHAR MODAIS
========================================================== */
document
    .querySelector("#fecharModalFinanceiro")
    ?.addEventListener(
        "click",
        fecharModalFinanceiro
    );
document
    .querySelector("#cancelarFinanceiro")
    ?.addEventListener(
        "click",
        fecharModalFinanceiro
    );
document
    .querySelector("#fecharVisualizarFinanceiro")
    ?.addEventListener(
        "click",
        () => Modal.fechar("#modalVisualizarFinanceiro")
    );
document
    .querySelector("#btnFecharVisualizarFinanceiro")
    ?.addEventListener(
        "click",
        () => Modal.fechar("#modalVisualizarFinanceiro")
    );
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
   API DO MÓDULO
========================================================== */
window.Financeiro = {
    listar() {
        return movimentacoes;
    },
    buscar(id) {
        return movimentacoes.find(
            item => item.id === id
        );
    },
    salvar(lista) {
        movimentacoes = lista;
        Storage.salvar(
            STORAGE_FINANCEIRO,
            movimentacoes
        );
        atualizarTela();
    },
    atualizar() {
        carregarDados();
        atualizarTela();
    }
};