/* ==========================================================
   SERVICOS.JS
   ClinicFlow
========================================================== */
"use strict";
/* ==========================================================
   STORAGE
========================================================== */
const STORAGE_SERVICOS = "clinicflow_servicos";
const STORAGE_PROFISSIONAIS = "clinicflow_profissionais";
/* ==========================================================
   ESTADO
========================================================== */
let servicos = [];
let profissionais = [];
let servicoEditando = null;
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
function carregarDados() {
    servicos =
        Storage.buscar(STORAGE_SERVICOS) || [];

    profissionais =
        Storage.buscar(STORAGE_PROFISSIONAIS) || [];
}
document.addEventListener("DOMContentLoaded", () => {
    if (typeof Auth !== "undefined") {
        Auth.protegerPagina();
    }
    carregarDados();
    configurarEventos();
    preencherProfissionais();
    atualizarDashboard();
    renderizarServicos();
    aplicarFiltros();
});
function preencherProfissionais() {
    const select =
        document.querySelector("#profissionaisServico");
    if (!select) return;
    select.innerHTML = "";
    profissionais.forEach(profissional => {
        const option =
            document.createElement("option");
        option.value = profissional.id;
        option.textContent = profissional.nome;
        select.appendChild(option);
    });
}
function renderizarServicos() {
    const container =
        document.querySelector("#listaServicos");
    if (!container) return;
    container.innerHTML = "";
    servicos.forEach(renderizarCardServico);
}
function atualizarDashboard() {
    atualizarResumo();
}
/* ==========================================================
   CONFIGURAR EVENTOS
========================================================== */
function configurarEventos() {
    const btnNovoServico = document.querySelector("#btnNovoServico");
    if (btnNovoServico) {
        btnNovoServico.addEventListener("click", abrirModalServico);
    }
    const btnFechar = document.querySelector("#fecharModalServico");
    if (btnFechar) {
        btnFechar.addEventListener("click", fecharModalServico);
    }
    const btnCancelar = document.querySelector("#cancelarServico");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", fecharModalServico);
    }
    const btnSalvar = document.querySelector("#salvarServico");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", salvarServico);
    }
}
function abrirModalServico() {
    limparFormularioServico();
    Modal.abrir("#modalServico");
}


/* ==========================================================
   SALVAR SERVIÇO
========================================================== */
function salvarServico() {
    const nome =
        document.querySelector("#nomeServico").value.trim();
    const categoria =
        document.querySelector("#categoriaServico").value;
    const valor =
        parseFloat(
            document.querySelector("#valorServico").value
        );
    const duracao =
        document.querySelector("#duracaoServico").value;
    const profissionalIds =
        Array.from(
            document.querySelector("#profissionaisServico")
                .selectedOptions
        ).map(item => Number(item.value));
    const descricao =
        document.querySelector("#descricaoServico")
            .value.trim();
    const status =
        document.querySelector("#statusServico").value;
    /* ==========================
       VALIDAÇÃO
    ========================== */
    if (
        nome === "" ||
        categoria === "" ||
        isNaN(preco) ||
        duracao === "" ||
        status === ""
    ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }
    /* ==========================
       OBJETO
    ========================== */
    const servico = {
        id:
            servicoEditando ??
            Utils.gerarId(),
        nome,
        categoria,
        valor,
        duracao,
        profissionais: profissionalIds,
        descricao,
        status
    };
    /* ==========================
       NOVO OU EDIÇÃO
    ========================== */
    if (servicoEditando) {
        const indice =
            servicos.findIndex(
                item => item.id === servicoEditando
            );
        servicos[indice] = servico;
    } else {
        servicos.push(servico);
    }
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    Storage.salvar(STORAGE_SERVICOS, servicos);
    fecharModalServico();
    atualizarSistemaServicos();
    sincronizarDashboard();
    mostrarMensagem("Serviço salvo com sucesso.");
}
/* ==========================================================
   EDITAR
========================================================== */
function editarServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    servicoEditando = id;
    document.querySelector("#tituloModalServico").textContent =
        "Editar Serviço";
    document.querySelector("#nomeServico").value =
        servico.nome;
    document.querySelector("#categoriaServico").value =
        servico.categoria;
    document.querySelector("#precoServico").value =
        servico.valor;
    document.querySelector("#duracaoServico").value =
        servico.duracao;
    document.querySelector("#descricaoServico").value =
        servico.descricao;
    document.querySelector("#statusServico").value =
        servico.status;
    const select =
        document.querySelector("#profissionaisServico");
    Array.from(select.options).forEach(option => {
        option.selected =
            servico.profissionais.includes(
                Number(option.value)
            );
    });
    Modal.abrir("#modalServico");
}
/* ==========================================================
   EXCLUIR
========================================================== */
function excluirServico(id) {
    if (
        !confirm(
            "Deseja realmente excluir este serviço?"
        )
    ) return;
    servicos =
        servicos.filter(
            item => item.id !== id
        );
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarDashboard();
    aplicarFiltros();
    sincronizarDashboard();
}
/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormularioServico() {
    document.querySelector("#nomeServico").value = "";
    document.querySelector("#categoriaServico").value = "";
    document.querySelector("#valorServico").value = "";
    document.querySelector("#duracaoServico").value = "";
    document.querySelector("#descricaoServico").value = "";
    document.querySelector("#statusServico").value = "ativo";
    document.querySelector("#comissaoServico").value = "";
    document.querySelector("#corServico").value = "#2563eb";
    const select = document.querySelector("#profissionaisServico");
    Array.from(select.options).forEach(option => {
        option.selected = false;
    });
}
/* ==========================================================
   FECHAR MODAL
========================================================== */
function fecharModalServico() {
    servicoEditando = null;
    limparFormulario();
    Modal.fechar("#modalServico");
}
/* ==========================================================
   ATUALIZAR
========================================================== */
function atualizarSistemaServicos() {
    carregarDados();
    preencherProfissionais();
    atualizarDashboard();
    aplicarFiltros();
}
/* ==========================================================
   RENDERIZAR CARD
========================================================== */
function renderizarCardServico(servico) {
    const container =
        document.querySelector("#listaServicos");
    if (!container) return;
    const profissionaisServico =
        profissionais
            .filter(p => servico.profissionais.includes(p.id))
            .map(p => p.nome)
            .join(", ");
    const card = document.createElement("div");
    card.className = "servico-card";
    card.innerHTML = `

        <div class="servico-header">
            <div>
                <h3>${servico.nome}</h3>
                <span class="badge badge-${servico.status}">
                    ${capitalizar(servico.status)}
                </span>
            </div>
            <div class="servico-preco">
                ${formatarMoeda(servico.valor)}
            </div>
        </div>
        <div class="servico-body">
            <p>
                <i class="fa-solid fa-tag"></i>
                ${servico.categoria}
            </p>
            <p>
                <i class="fa-solid fa-clock"></i>
                ${servico.duracao}
            </p>
            <p>
                <i class="fa-solid fa-user-doctor"></i>
                ${profissionaisServico || "-"}
            </p>
        </div>
        <div class="servico-footer">
            <button
                class="btn btn-secondary"
                onclick="visualizarServico(${servico.id})">
                <i class="fa-solid fa-eye"></i>
            </button>
            <button
                class="btn btn-primary"
                onclick="editarServico(${servico.id})">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button
                class="btn btn-warning"
                onclick="duplicarServico(${servico.id})">
                <i class="fa-solid fa-copy"></i>
            </button>
            <button
                class="btn btn-success"
                onclick="alternarStatusServico(${servico.id})">
                <i class="fa-solid fa-power-off"></i>
            </button>
            <button
                class="btn btn-danger"
                onclick="excluirServico(${servico.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(card);
}
/* ==========================================================
   VISUALIZAR
========================================================== */
function visualizarServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    preencherModalVisualizacaoServico(servico);
    Modal.abrir("#modalVisualizarServico");
}
/* ==========================================================
   MODAL VISUALIZAÇÃO
========================================================== */
function preencherModalVisualizacaoServico(servico) {
    const profissionaisServico =
        profissionais
            .filter(p => servico.profissionais.includes(p.id))
            .map(p => p.nome)
            .join(", ");
    document.querySelector("#conteudoVisualizarServico").innerHTML = `
        <div class="visualizacao-servico">
            <div class="visualizacao-header">
                <h2>${servico.nome}</h2>
                <span class="badge badge-${servico.status}">
                    ${capitalizar(servico.status)}
                </span>
            </div>
            <div class="visualizacao-grid">
                <div>
                    <strong>Categoria</strong>
                    <p>${servico.categoria}</p>
                </div>
                <div>
                    <strong>Preço</strong>
                    <p>${formatarMoeda(servico.preco)}</p>
                </div>
                <div>
                    <strong>Duração</strong>
                    <p>${servico.duracao}</p>
                </div>
                <div>
                    <strong>Profissionais</strong>
                    <p>${profissionaisServico || "-"}</p>
                </div>
            </div>
            <div class="visualizacao-descricao">
                <strong>Descrição</strong>
                <p>${servico.descricao || "Não informada."}</p>
            </div>
        </div>
    `;
}
/* ==========================================================
   DUPLICAR
========================================================== */
function duplicarServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    const copia = {
        ...servico,
        id: Utils.gerarId(),
        nome: servico.nome + " (Cópia)"
    };
    servicos.push(copia);
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarSistemaServicos();
}
/* ==========================================================
   STATUS
========================================================== */
function alternarStatusServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    servico.status =
        servico.status === "ativo"
            ? "inativo"
            : "ativo";
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarSistemaServicos();
    sincronizarDashboard();
}
/* ==========================================================
   FORMATAR MOEDA
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
/* ==========================================================
   CAPITALIZAR
========================================================== */
function capitalizar(texto) {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() +
        texto.slice(1);
}
/* ==========================================================
   APLICAR FILTROS
========================================================== */
function aplicarFiltros() {
    const container =
        document.querySelector("#listaServicos");
    if (!container) return;
    container.innerHTML = "";
    let lista = [...servicos];
    /* Pesquisa */
    const pesquisa = document
        .querySelector("#pesquisaServico")
        .value
        .toLowerCase()
        .trim();
    if (pesquisa !== "") {
        lista = lista.filter(servico =>
            servico.nome.toLowerCase().includes(pesquisa) ||
            servico.categoria.toLowerCase().includes(pesquisa)
        );
    }
    /* Categoria */
    const categoria =
        document.querySelector("#filtroCategoria").value;
    if (categoria !== "todos") {
        lista = lista.filter(
            item => item.categoria === categoria
        );
    }
    /* Status */
    const status =
        document.querySelector("#filtroStatus").value;
    if (status !== "todos") {
        lista = lista.filter(
            item => item.status === status
        );
    }
    lista.sort((a, b) =>
        a.nome.localeCompare(b.nome)
    );
    lista.forEach(renderizarCardServico);
    atualizarResumo();
}
/* ==========================================================
   RESUMO
========================================================== */
function atualizarResumo() {
    document.querySelector("#totalServicos").textContent =
        servicos.length;
    document.querySelector("#servicosAtivos").textContent =
        servicos.filter(
            item => item.status === "ativo"
        ).length;
    document.querySelector("#servicosInativos").textContent =
        servicos.filter(
            item => item.status === "inativo"
        ).length;
}
/* ==========================================================
   TOAST
========================================================== */
function mostrarMensagem(
    mensagem,
    tipo = "success"
) {
    if (window.Utils &&
        typeof Utils.toast === "function") {
        Utils.toast(
            mensagem,
            tipo
        );
        return;
    }
    alert(mensagem);
}
/* ==========================================================
   ATUALIZAÇÃO GERAL
========================================================== */
/* ==========================================================
   EVENTOS FILTROS
========================================================== */
document
    .querySelector("#pesquisaServico")
    ?.addEventListener(
        "input",
        aplicarFiltros
    );
document
    .querySelector("#filtroCategoria")
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
/* ==========================================================
   STORAGE
========================================================== */
window.addEventListener(
    "storage",
    (event) => {
        if (event.key === STORAGE_SERVICOS) {
            atualizarSistemaServicos();
        }
    }
);
/* ==========================================================
   DASHBOARD
========================================================== */
function sincronizarDashboard() {
    document.dispatchEvent(
        new CustomEvent(
            "servicosAtualizados",
            {
                detail: {
                    quantidade:
                        servicos.length
                }
            }
        )
    );
}
/* ==========================================================
   API DO MÓDULO
========================================================== */
window.Servicos = {
    listar: () => servicos,
    buscar(id) {
        return servicos.find(
            item => item.id === id
        );
    },
    salvar(lista) {
        servicos = lista;
        Storage.salvar(
            STORAGE_SERVICOS,
            servicos
        );
        atualizarSistemaServicos();
    },
    atualizar() {
        atualizarSistemaServicos();
    }
};