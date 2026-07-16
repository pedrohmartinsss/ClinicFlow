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
document.addEventListener("DOMContentLoaded", inicializarModulo);
function inicializarModulo() {
    if (typeof Auth !== "undefined") {
        Auth.protegerPagina();
    }
    carregarDados();
    configurarEventos();
    preencherProfissionais();
    renderizarServicos();
    atualizarResumo();
    preencherCategorias();
}
/* ==========================================================
   CARREGAR DADOS
========================================================== */
function carregarDados() {
    servicos =
        Storage.buscar(STORAGE_SERVICOS) || [];
    profissionais =
        Storage.buscar(STORAGE_PROFISSIONAIS) || [];
}
/* ==========================================================
   EVENTOS
========================================================== */
function configurarEventos() {
    document
        .querySelector("#btnNovoServico")
        ?.addEventListener("click", abrirModalServico);
    document
        .querySelector("#fecharModalServico")
        ?.addEventListener("click", fecharModalServico);
    document
        .querySelector("#cancelarServico")
        ?.addEventListener("click", fecharModalServico);
    document
        .querySelector("#salvarServico")
        ?.addEventListener("click", salvarServico);
    document
        .querySelector("#pesquisaServico")
        ?.addEventListener("input", aplicarFiltros);
    document
        .querySelector("#filtroCategoria")
        ?.addEventListener("change", aplicarFiltros);
    document
        .querySelector("#filtroStatus")
        ?.addEventListener("change", aplicarFiltros);
    document
        .querySelector("#fecharVisualizarServico")
        ?.addEventListener("click", fecharModalVisualizacao);
    document
        .querySelector("#btnFecharVisualizarServico")
        ?.addEventListener("click", fecharModalVisualizacao);
}
/* ==========================================================
   MODAL
========================================================== */
function abrirModalServico() {
    servicoEditando = null;
    limparFormularioServico();
    document.querySelector("#tituloModalServico").textContent =
        "Novo Serviço";
    Modal.abrir("#modalServico");
}
function fecharModalServico() {
    Modal.fechar("#modalServico");
}
function fecharModalVisualizacao() {
    Modal.fechar("#modalVisualizarServico");
}
/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormularioServico() {
    document.querySelector("#nomeServico").value = "";
    document.querySelector("#categoriaServico").value = "";
    document.querySelector("#descricaoServico").value = "";
    document.querySelector("#duracaoServico").value = "";
    document.querySelector("#valorServico").value = "";
    document.querySelector("#comissaoServico").value = "";
    document.querySelector("#corServico").value = "#2563eb";
    document.querySelector("#statusServico").value = "ativo";
    const select =
        document.querySelector("#profissionaisServico");
    if (select) {
        [...select.options].forEach(op => {
            op.selected = false;
        });
    }
}
/* ==========================================================
   PREENCHER PROFISSIONAIS
========================================================== */
function preencherProfissionais() {
    const select = document.querySelector("#profissionaisServico");
    if (!select) return;
    select.innerHTML = "";
    if (profissionais.length === 0) {
        select.innerHTML = `
            <option disabled>
                Nenhum profissional cadastrado
            </option>
        `;
        return;
    }
    profissionais.forEach(profissional => {
        select.innerHTML += `
            <option value="${profissional.id}">
                ${profissional.nome}
            </option>
        `;
    });
}
/* ==========================================================
   RENDERIZAR SERVIÇOS
========================================================== */
function renderizarServicos() {
    const lista = document.querySelector("#listaServicos");
    if (!lista) return;
    lista.innerHTML = "";
    if (servicos.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <h3>Nenhum serviço cadastrado</h3>
                <p>
                    Clique em <strong>Novo Serviço</strong>
                    para começar.
                </p>
            </div>
        `;
        atualizarResumo();
        return;
    }
    servicos
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(renderizarCardServico);
    atualizarResumo();
}
/* ==========================================================
   RENDERIZAR CARD
========================================================== */
function renderizarCardServico(servico) {
    const container = document.querySelector("#listaServicos");
    const nomesProfissionais = profissionais
        .filter(p => (servico.profissionais || []).includes(p.id))
        .map(p => p.nome)
        .join(", ");
    const card = document.createElement("div");
    card.className = "servico-card";
    card.innerHTML = `
        <div class="servico-card-header">
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
        <div class="servico-card-body">
            <p>
                <i class="fa-solid fa-layer-group"></i>
                ${servico.categoria}
            </p>
            <p>
                <i class="fa-solid fa-clock"></i>
                ${servico.duracao} min
            </p>
            <p>
                <i class="fa-solid fa-user-doctor"></i>
                ${nomesProfissionais || "Nenhum"}
            </p>
        </div>
        <div class="servico-card-footer">
            <button
                class="btn btn-light"
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
   RECARREGAR TELA
========================================================== */
function atualizarTela() {
    carregarDados();
    preencherProfissionais();
    renderizarServicos();
}
/* ==========================================================
   SALVAR SERVIÇO
========================================================== */
function salvarServico() {
    const nome = document.querySelector("#nomeServico").value.trim();
    const categoria = document.querySelector("#categoriaServico").value;
    const descricao = document.querySelector("#descricaoServico").value.trim();
    const duracao = Number(
        document.querySelector("#duracaoServico").value
    );
    const valor = Number(
        document.querySelector("#valorServico").value
    );
    const comissao = Number(
        document.querySelector("#comissaoServico").value
    );
    const cor = document.querySelector("#corServico").value;
    const status = document.querySelector("#statusServico").value;
    const profissionaisSelecionados =
        Array.from(
            document.querySelector("#profissionaisServico").selectedOptions
        ).map(item => Number(item.value));
    /* ==========================
       VALIDAÇÃO
    ========================== */
    if (
        nome === "" ||
        categoria === "" ||
        duracao <= 0 ||
        valor <= 0
    ) {
        mostrarMensagem(
            "Preencha todos os campos obrigatórios.",
            "warning"
        );
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
        descricao,
        duracao,
        valor,
        comissao,
        cor,
        profissionais:
            profissionaisSelecionados,
        status,
        criadoEm:
            servicoEditando
                ? servicos.find(s => s.id === servicoEditando)?.criadoEm
                : new Date().toISOString(),
        atualizadoEm:
            new Date().toISOString()
    };

    console.log(servico);
    /* ==========================
       NOVO
    ========================== */
    if (servicoEditando === null) {
        servicos.push(servico);
        mostrarMensagem(
            "Serviço cadastrado com sucesso."
        );
    }
    /* ==========================
       EDIÇÃO
    ========================== */
    else {
        const indice =
            servicos.findIndex(
                item => item.id === servicoEditando
            );
        if (indice >= 0) {
            servicos[indice] = servico;
        }
        mostrarMensagem(
            "Serviço atualizado com sucesso."
        );
    }
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    fecharModalServico();
    atualizarTela();
}
/* ==========================================================
   EDITAR SERVIÇO
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
    document.querySelector("#descricaoServico").value =
        servico.descricao;
    document.querySelector("#duracaoServico").value =
        servico.duracao;
    document.querySelector("#valorServico").value =
        servico.valor;
    document.querySelector("#comissaoServico").value =
        servico.comissao;
    document.querySelector("#corServico").value =
        servico.cor;
    document.querySelector("#statusServico").value =
        servico.status;
    const select =
        document.querySelector("#profissionaisServico");
    [...select.options].forEach(option => {
        option.selected =
            servico.profissionais.includes(
                Number(option.value)
            );
    });
    Modal.abrir("#modalServico");
}
/* ==========================================================
   EXCLUIR SERVIÇO
========================================================== */
function excluirServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    if (!confirm(
        `Deseja excluir o serviço "${servico.nome}"?`
    )) {
        return;
    }
    servicos =
        servicos.filter(
            item => item.id !== id
        );
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarTela();
    mostrarMensagem(
        "Serviço removido com sucesso."
    );
}
/* ==========================================================
   DUPLICAR SERVIÇO
========================================================== */
function duplicarServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    const copia = {
        ...servico,
        id: Utils.gerarId(),
        nome:
            servico.nome +
            " (Cópia)",
        criadoEm:
            new Date().toISOString(),
        atualizadoEm:
            new Date().toISOString()
    };
    servicos.push(copia);
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarTela();
    mostrarMensagem(
        "Serviço duplicado."
    );
}
/* ==========================================================
   VISUALIZAR SERVIÇO
========================================================== */
function visualizarServico(id) {
    const servico =
        servicos.find(s => s.id === id);
    if (!servico) return;
    preencherModalVisualizacao(servico);
    Modal.abrir("#modalVisualizarServico");
}
function preencherModalVisualizacao(servico) {
    const listaProfissionais = profissionais
        .filter(p => servico.profissionais.includes(p.id));
    document.querySelector("#viewNomeServico").textContent =
        servico.nome;
    document.querySelector("#viewCategoriaServico").textContent =
        servico.categoria;
    document.querySelector("#viewDuracao").textContent =
        `${servico.duracao} minutos`;
    document.querySelector("#viewValor").textContent =
        formatarMoeda(servico.valor);
    document.querySelector("#viewComissao").textContent =
        `${servico.comissao}%`;
    document.querySelector("#viewStatus").textContent =
        capitalizar(servico.status);
    document.querySelector("#viewDescricao").textContent =
        servico.descricao || "Nenhuma descrição cadastrada.";
    /* Cor */
    document.querySelector("#viewCodigoCor").textContent =
        servico.cor;
    document.querySelector("#viewCorServico").style.background =
        servico.cor;
    /* Profissionais */
    const container =
        document.querySelector("#viewProfissionais");
    container.innerHTML = "";
    if (listaProfissionais.length === 0) {
        container.innerHTML =
            `<span class="badge badge-secondary">
                Nenhum profissional
            </span>`;
    } else {
        listaProfissionais.forEach(profissional => {
            container.innerHTML += `
                <span class="badge badge-primary">
                    <i class="fa-solid fa-user-doctor"></i>
                    ${profissional.nome}
                </span>
            `;
        });
    }
}
/* ==========================================================
   ALTERAR STATUS
========================================================== */
function alternarStatusServico(id) {
    const servico =
        servicos.find(item => item.id === id);
    if (!servico) return;
    servico.status =
        servico.status === "ativo"
            ? "inativo"
            : "ativo";
    servico.atualizadoEm =
        new Date().toISOString();
    Storage.salvar(
        STORAGE_SERVICOS,
        servicos
    );
    atualizarTela();
    mostrarMensagem(
        "Status atualizado."
    );
}
/* ==========================================================
   FILTROS
========================================================== */
function aplicarFiltros() {
    const pesquisa =
        document.querySelector("#pesquisaServico")
            ?.value
            .toLowerCase()
            .trim() || "";
    const categoria =
        document.querySelector("#filtroCategoria")
            ?.value || "todos";
    const status =
        document.querySelector("#filtroStatus")
            ?.value || "todos";
    let lista = [...servicos];
    if (pesquisa !== "") {
        lista = lista.filter(item =>
            item.nome.toLowerCase().includes(pesquisa) ||
            item.categoria.toLowerCase().includes(pesquisa)
        );
    }
    if (categoria !== "todos") {
        lista = lista.filter(
            item => item.categoria === categoria
        );
    }
    if (status !== "todos") {
        lista = lista.filter(
            item => item.status === status
        );
    }
    const container =
        document.querySelector("#listaServicos");
    container.innerHTML = "";
    lista.forEach(renderizarCardServico);
}
function preencherCategorias() {
    const select = document.querySelector("#filtroCategoria");
    if (!select) return;
    const categorias = [
        ...new Set(
            servicos.map(s => s.categoria)
        )
    ].sort();
    select.innerHTML = `
        <option value="todos">
            Todas as categorias
        </option>
    `;
    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });
}
/* ==========================================================
   DASHBOARD
========================================================== */
function atualizarResumo() {
    const total = servicos.length;
    const ativos =
        servicos.filter(
            s => s.status === "ativo"
        ).length;
    const inativos =
        servicos.filter(
            s => s.status === "inativo"
        ).length;
    const soma =
        servicos.reduce(
            (total, s) =>
                total + Number(s.valor || 0),
            0
        );
    const ticket =
        total > 0
            ? soma / total
            : 0;
    document.querySelector("#totalServicos").textContent =
        total;
    document.querySelector("#servicosAtivos").textContent =
        ativos;
    document.querySelector("#servicosInativos").textContent =
        inativos;
    document.querySelector("#ticketMedio").textContent =
        ticket.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}
/* ==========================================================
   HELPERS
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
function capitalizar(texto) {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase()
        + texto.slice(1);
}
function mostrarMensagem(mensagem, tipo = "success") {
    if (
        window.Utils &&
        typeof Utils.toast === "function"
    ) {
        Utils.toast(mensagem, tipo);
        return;
    }
    alert(mensagem);
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
   STORAGE EVENT
========================================================== */
window.addEventListener("storage", evento => {
    if (evento.key === STORAGE_SERVICOS) {
        atualizarTela();
    }
});
/* ==========================================================
   API PÚBLICA
========================================================== */
window.Servicos = {
    listar() {
        return servicos;
    },
    buscar(id) {
        return servicos.find(
            item => item.id === id
        );
    },
    atualizar() {
        atualizarTela();
    }
};