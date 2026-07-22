/* ==========================================================
                        CLINICFLOW
                    DASHBOARD SERVICE
========================================================== */
const DashboardService = (() => {
    "use strict";
    /* ==========================================================
                        STORAGE KEYS
    ========================================================== */
    const STORAGE = {
        usuarios: "usuarios",
        pacientes: "pacientes",
        agenda: "agendamentos",
        financeiro: "financeiro",
        servicos: "servicos",
        profissionais: "profissionais",
        notificacoes: "notificacoes",
        configuracoes: "configuracoes",
        estoque: "estoque",
        convenios: "convenios"
    };
    /* ==========================================================
                        ESTADO
    ========================================================== */
    const state = {
        usuarios: [],
        pacientes: [],
        agenda: [],
        financeiro: [],
        servicos: [],
        profissionais: [],
        notificacoes: [],
        configuracoes: {},
        estoque: [],
        convenios: [],
        ultimaAtualizacao: null
    };
    /* ==========================================================
                        CARREGAR STORAGE
    ========================================================== */
    function carregarColecao(chave) {
        try {
            if (window.Storage && typeof Storage.buscar === "function") {
                return Storage.buscar(chave) || [];
            }
            return JSON.parse(localStorage.getItem(chave)) || [];
        }
        catch (erro) {
            console.error(
                `[DashboardService] Erro ao carregar ${chave}`,
                erro
            );
            return [];
        }
    }
    /* ==========================================================
                        RECARREGAR DADOS
    ========================================================== */
    function atualizarDados() {
        state.usuarios = carregarColecao(STORAGE.usuarios);
        state.pacientes = carregarColecao(STORAGE.pacientes);
        state.agenda = carregarColecao(STORAGE.agenda);
        state.financeiro = carregarColecao(STORAGE.financeiro);
        state.servicos = carregarColecao(STORAGE.servicos);
        state.profissionais = carregarColecao(STORAGE.profissionais);
        state.notificacoes = carregarColecao(STORAGE.notificacoes);
        state.estoque = carregarColecao(STORAGE.estoque);
        state.convenios = carregarColecao(STORAGE.convenios);
        state.configuracoes =
            carregarColecao(STORAGE.configuracoes);
        state.ultimaAtualizacao = new Date();
    }
    /* ==========================================================
                        GETTERS
    ========================================================== */
    function usuarios() {
        return [...state.usuarios];
    }
    function pacientes() {
        return [...state.pacientes];
    }
    function agenda() {
        return [...state.agenda];
    }
    function financeiro() {
        return [...state.financeiro];
    }
    function servicos() {
        return [...state.servicos];
    }
    function profissionais() {
        return [...state.profissionais];
    }
    function estoque() {
        return [...state.estoque];
    }
    function convenios() {
        return [...state.convenios];
    }
    function notificacoes() {
        return [...state.notificacoes];
    }
    /* ==========================================================
                        HELPERS
    ========================================================== */
    function quantidade(lista) {
        return Array.isArray(lista)
            ? lista.length
            : 0;
    }
    function soma(lista, campo) {
        return lista.reduce(
            (total, item) =>
                total + Number(item[campo] || 0),
            0
        );
    }
    function media(lista, campo) {
        if (!lista.length) return 0;
        return soma(lista, campo) / lista.length;
    }
    function filtrar(lista, callback) {
        return lista.filter(callback);
    }
    function ultimoRegistro(lista, campo = "dataCadastro") {
        if (!lista.length) return null;
        return [...lista].sort(
            (a, b) =>
                new Date(b[campo]) -
                new Date(a[campo])
        )[0];
    }
    function percentual(valor, total) {
        if (!total) return 0;
        return Number(
            ((valor / total) * 100)
                .toFixed(1)
        );
    }
    function hoje() {
        const data = new Date();
        data.setHours(0, 0, 0, 0);
        return data;
    }
    function inicioMes() {
        const data = new Date();
        return new Date(
            data.getFullYear(),
            data.getMonth(),
            1
        );
    }
    function fimMes() {
        const data = new Date();
        return new Date(
            data.getFullYear(),
            data.getMonth() + 1,
            0,
            23,
            59,
            59
        );
    }
    function estaNoMes(data) {
        const inicio = inicioMes();
        const fim = fimMes();
        const atual = new Date(data);
        return atual >= inicio && atual <= fim;
    }
    /* ==========================================================
                        API PÚBLICA
    ========================================================== */
    return {
        atualizarDados,
        usuarios,
        pacientes,
        agenda,
        financeiro,
        servicos,
        profissionais,
        estoque,
        convenios,
        notificacoes,
        quantidade,
        soma,
        media,
        filtrar,
        percentual,
        ultimoRegistro,
        estaNoMes,
        hoje,
        get ultimaAtualizacao() {
            return state.ultimaAtualizacao;
        }
    };
})();
/* ==========================================================
                DASHBOARD GERAL
========================================================== */
function obterDashboardGeral() {
    atualizarDados();
    const usuariosLista = usuarios();
    const pacientesLista = pacientes();
    const agendaLista = agenda();
    const financeiroLista = financeiro();
    const notificacoesLista = notificacoes();
    const profissionaisLista = profissionais();
    const servicosLista = servicos();
    return {
        ultimaAtualizacao: state.ultimaAtualizacao,
        usuarios: {
            total: quantidade(usuariosLista),
            ativos: filtrar(
                usuariosLista,
                usuario => usuario.status === "ativo"
            ).length,
            bloqueados: filtrar(
                usuariosLista,
                usuario => usuario.status === "bloqueado"
            ).length,
            administradores: filtrar(
                usuariosLista,
                usuario =>
                    (usuario.perfil || "").toLowerCase() ===
                    "administrador"
            ).length
        },
        pacientes: {
            total: quantidade(pacientesLista),
            ativos: filtrar(
                pacientesLista,
                paciente =>
                    paciente.status === "ativo" ||
                    !paciente.status
            ).length,
            cadastradosMes: filtrar(
                pacientesLista,
                paciente =>
                    paciente.dataCadastro &&
                    estaNoMes(paciente.dataCadastro)
            ).length
        },
        agenda: {
            total: quantidade(agendaLista),
            hoje: filtrar(
                agendaLista,
                agendamento => {
                    if (!agendamento.data) return false;
                    const data = new Date(agendamento.data);
                    data.setHours(0, 0, 0, 0);
                    return data.getTime() === hoje().getTime();
                }
            ).length,
            confirmados: filtrar(
                agendaLista,
                item => item.status === "confirmado"
            ).length,
            cancelados: filtrar(
                agendaLista,
                item => item.status === "cancelado"
            ).length,
            concluidos: filtrar(
                agendaLista,
                item => item.status === "concluido"
            ).length
        },
        financeiro: {
            totalLancamentos: quantidade(financeiroLista),
            receitas: soma(
                filtrar(
                    financeiroLista,
                    item => item.tipo === "receita"
                ),
                "valor"
            ),
            despesas: soma(
                filtrar(
                    financeiroLista,
                    item => item.tipo === "despesa"
                ),
                "valor"
            )
        },
        profissionais: {
            total: quantidade(profissionaisLista)
        },
        servicos: {
            total: quantidade(servicosLista)
        },
        notificacoes: {
            total: quantidade(notificacoesLista),
            naoLidas: filtrar(
                notificacoesLista,
                notificacao =>
                    notificacao.lida === false
            ).length
        }
    };
}
/* ==========================================================
                SALDO FINANCEIRO
========================================================== */
function saldoAtual() {
    const financeiro = obterDashboardGeral().financeiro;
    return financeiro.receitas - financeiro.despesas;
}
/* ==========================================================
                TOTAL GERAL
========================================================== */
function obterIndicadoresGerais() {
    const dashboard = obterDashboardGeral();
    return {
        usuarios: dashboard.usuarios.total,
        pacientes: dashboard.pacientes.total,
        consultas: dashboard.agenda.total,
        consultasHoje: dashboard.agenda.hoje,
        profissionais: dashboard.profissionais.total,
        servicos: dashboard.servicos.total,
        receitas: dashboard.financeiro.receitas,
        despesas: dashboard.financeiro.despesas,
        saldo: saldoAtual(),
        notificacoes: dashboard.notificacoes.naoLidas
    };
}
/* ==========================================================
                    RESUMO DE USUÁRIOS
========================================================== */
function obterResumoUsuarios() {
    atualizarDados();
    const lista = usuarios();
    const ativos = lista.filter(u => u.status === "ativo");
    const bloqueados = lista.filter(u => u.status === "bloqueado");
    const administradores = lista.filter(
        u => (u.perfil || "").toLowerCase() === "administrador"
    );
    const gerentes = lista.filter(
        u => (u.perfil || "").toLowerCase() === "gerente"
    );
    const recepcionistas = lista.filter(
        u => (u.perfil || "").toLowerCase() === "recepcionista"
    );
    const profissionaisSistema = lista.filter(
        u => (u.perfil || "").toLowerCase() === "profissional"
    );
    const novosMes = lista.filter(usuario => {
        if (!usuario.dataCadastro) return false;
        return estaNoMes(usuario.dataCadastro);
    });
    const ultimoUsuario = ultimoRegistro(lista);
    const ultimoLogin = [...lista]
        .filter(u => u.ultimoLogin)
        .sort((a, b) =>
            new Date(b.ultimoLogin) -
            new Date(a.ultimoLogin)
        )[0] || null;
    return {
        total: lista.length,
        ativos: ativos.length,
        bloqueados: bloqueados.length,
        administradores: administradores.length,
        gerentes: gerentes.length,
        recepcionistas: recepcionistas.length,
        profissionais: profissionaisSistema.length,
        novosMes: novosMes.length,
        percentualAtivos: percentual(
            ativos.length,
            lista.length
        ),
        percentualBloqueados: percentual(
            bloqueados.length,
            lista.length
        ),
        ultimoCadastro: ultimoUsuario,
        ultimoLogin
    };
}
/* ==========================================================
                    RESUMO PACIENTES
========================================================== */
function obterResumoPacientes() {
    atualizarDados();
    const lista = pacientes();
    const ativos = lista.filter(
        paciente =>
            paciente.status === "ativo" ||
            !paciente.status
    );
    const novosMes = lista.filter(paciente => {
        if (!paciente.dataCadastro) return false;
        return estaNoMes(paciente.dataCadastro);
    });
    const aniversariantesMes = lista.filter(paciente => {
        if (!paciente.dataNascimento) return false;
        const nascimento = new Date(paciente.dataNascimento);
        return nascimento.getMonth() ===
            new Date().getMonth();
    });
    const masculino = lista.filter(
        paciente => paciente.sexo === "Masculino"
    );
    const feminino = lista.filter(
        paciente => paciente.sexo === "Feminino"
    );
    const ultimoPaciente = ultimoRegistro(lista);
    return {
        total: lista.length,
        ativos: ativos.length,
        novosMes: novosMes.length,
        aniversariantesMes:
            aniversariantesMes.length,
        masculino: masculino.length,
        feminino: feminino.length,
        percentualAtivos: percentual(
            ativos.length,
            lista.length
        ),
        ultimoCadastro: ultimoPaciente
    };
}
/* ==========================================================
            PACIENTE MAIS FREQUENTE
========================================================== */
function obterPacienteMaisAtivo() {
    atualizarDados();
    const agendamentos = agenda();
    if (!agendamentos.length)
        return null;
    const ranking = {};
    agendamentos.forEach(item => {
        const nome = item.paciente;
        if (!nome) return;
        ranking[nome] =
            (ranking[nome] || 0) + 1;
    });
    let maior = "";
    let quantidade = 0;
    Object.entries(ranking).forEach(
        ([paciente, total]) => {
            if (total > quantidade) {
                maior = paciente;
                quantidade = total;
            }
        }
    );
    return {
        paciente: maior,
        consultas: quantidade
    };
}
/* ==========================================================
                DISTRIBUIÇÃO DE PERFIS
========================================================== */
function distribuicaoPerfis() {
    atualizarDados();
    const lista = usuarios();
    const distribuicao = {};
    lista.forEach(usuario => {
        const perfil =
            usuario.perfil || "Não informado";
        distribuicao[perfil] =
            (distribuicao[perfil] || 0) + 1;
    });
    return distribuicao;
}
/* ==========================================================
            ÚLTIMOS USUÁRIOS
========================================================== */
function obterUltimosUsuarios(limite = 5) {
    atualizarDados();
    return [...usuarios()]
        .sort(
            (a, b) =>
                new Date(b.dataCadastro) -
                new Date(a.dataCadastro)
        )
        .slice(0, limite);
}
/* ==========================================================
            ÚLTIMOS PACIENTES
========================================================== */
function obterUltimosPacientes(limite = 5) {
    atualizarDados();
    return [...pacientes()]
        .sort(
            (a, b) =>
                new Date(b.dataCadastro) -
                new Date(a.dataCadastro)
        )
        .slice(0, limite);
}
/* ==========================================================
                    RESUMO DA AGENDA
========================================================== */
function obterResumoAgenda() {
    atualizarDados();
    const lista = agenda();
    const hojeData = hoje();
    const hojeConsultas = lista.filter(item => {
        if (!item.data) return false;
        const data = new Date(item.data);
        data.setHours(0, 0, 0, 0);
        return data.getTime() === hojeData.getTime();
    });
    const confirmados =
        lista.filter(item => item.status === "confirmado");
    const concluidos =
        lista.filter(item => item.status === "concluido");
    const cancelados =
        lista.filter(item => item.status === "cancelado");
    const pendentes =
        lista.filter(item => item.status === "pendente");
    const mesAtual =
        lista.filter(item =>
            item.data &&
            estaNoMes(item.data)
        );
    const profissionaisUnicos =
        [...new Set(
            lista
                .map(item => item.profissional)
                .filter(Boolean)
        )];
    return {
        total: lista.length,
        hoje: hojeConsultas.length,
        confirmados: confirmados.length,
        concluidos: concluidos.length,
        cancelados: cancelados.length,
        pendentes: pendentes.length,
        mesAtual: mesAtual.length,
        profissionaisAtivos:
            profissionaisUnicos.length,
        taxaComparecimento:
            percentual(
                concluidos.length,
                confirmados.length +
                concluidos.length
            )
    };
}
/* ==========================================================
                CONSULTAS POR PROFISSIONAL
========================================================== */
function obterConsultasPorProfissional() {
    atualizarDados();
    const ranking = {};
    agenda().forEach(item => {
        if (!item.profissional) return;
        ranking[item.profissional] =
            (ranking[item.profissional] || 0) + 1;

    });
    return ranking;
}
/* ==========================================================
                CONSULTAS POR SERVIÇO
========================================================== */
function obterConsultasPorServico() {
    atualizarDados();
    const ranking = {};
    agenda().forEach(item => {
        if (!item.servico) return;
        ranking[item.servico] =
            (ranking[item.servico] || 0) + 1;
    });
    return ranking;
}
/* ==========================================================
                    RESUMO FINANCEIRO
========================================================== */
function obterResumoFinanceiro() {
    atualizarDados();
    const lista = financeiro();
    const receitas =
        lista.filter(item =>
            item.tipo === "receita"
        );
    const despesas =
        lista.filter(item =>
            item.tipo === "despesa"
        );
    const receitasMes =
        receitas.filter(item =>
            item.data &&
            estaNoMes(item.data)
        );
    const despesasMes =
        despesas.filter(item =>
            item.data &&
            estaNoMes(item.data)
        );
    const valorReceitas =
        soma(receitasMes, "valor");
    const valorDespesas =
        soma(despesasMes, "valor");
    const saldo =
        valorReceitas - valorDespesas;
    const contasReceber =
        receitas.filter(item =>
            item.status === "pendente"
        );
    const contasPagar =
        despesas.filter(item =>
            item.status === "pendente"
        );
    return {
        totalLancamentos:
            lista.length,
        receitas:
            valorReceitas,
        despesas:
            valorDespesas,
        saldo,
        lucro:
            saldo,
        ticketMedio:
            receitasMes.length
                ? valorReceitas /
                receitasMes.length
                : 0,
        contasReceber:
            contasReceber.length,
        contasPagar:
            contasPagar.length,
        valorReceber:
            soma(contasReceber, "valor"),
        valorPagar:
            soma(contasPagar, "valor")
    };
}
/* ==========================================================
                RECEITAS X DESPESAS
========================================================== */
function obterFluxoFinanceiroMensal() {
    atualizarDados();
    const meses = {};
    financeiro().forEach(item => {
        if (!item.data) return;
        const data = new Date(item.data);
        const chave =
            `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
        if (!meses[chave]) {
            meses[chave] = {
                receitas: 0,
                despesas: 0
            };
        }
        if (item.tipo === "receita") {
            meses[chave].receitas +=
                Number(item.valor) || 0;
        }
        else {
            meses[chave].despesas +=
                Number(item.valor) || 0;
        }
    });
    return meses;
}
/* ==========================================================
            SERVIÇO MAIS LUCRATIVO
========================================================== */
function obterServicoMaisRentavel() {
    atualizarDados();
    const ranking = {};
    financeiro().forEach(item => {
        if (
            item.tipo !== "receita" ||
            !item.servico
        ) return;
        ranking[item.servico] =
            (ranking[item.servico] || 0) +
            Number(item.valor || 0);
    });
    let nome = "";
    let valor = 0;
    Object.entries(ranking).forEach(
        ([servico, total]) => {
            if (total > valor) {
                nome = servico;
                valor = total;
            }
        }
    );
    return {
        servico: nome,
        faturamento: valor
    };
}
/* ==========================================================
                RESUMO DOS RELATÓRIOS
========================================================== */
function obterResumoRelatorios() {
    atualizarDados();
    const agendaLista = agenda();
    const financeiroLista = financeiro();
    const pacientesLista = pacientes();
    const melhorServico = obterConsultasPorServico();
    const melhorProfissional = obterConsultasPorProfissional();
    const pacienteMaisAtivo = obterPacienteMaisAtivo();
    let servico = "-";
    let qtdServico = 0;
    Object.entries(melhorServico).forEach(([nome, total]) => {
        if (total > qtdServico) {
            servico = nome;
            qtdServico = total;
        }
    });
    let profissional = "-";
    let qtdProfissional = 0;
    Object.entries(melhorProfissional).forEach(([nome, total]) => {
        if (total > qtdProfissional) {
            profissional = nome;
            qtdProfissional = total;
        }
    });
    return {
        totalPacientes: pacientesLista.length,
        totalConsultas: agendaLista.length,
        totalLancamentos: financeiroLista.length,
        melhorServico: {
            nome: servico,
            quantidade: qtdServico
        },
        melhorProfissional: {
            nome: profissional,
            quantidade: qtdProfissional
        },
        pacienteMaisAtivo
    };
}
/* ==========================================================
                RESUMO NOTIFICAÇÕES
========================================================== */
function obterResumoNotificacoes() {
    atualizarDados();
    const lista = notificacoes();
    return {
        total: lista.length,
        lidas:
            lista.filter(
                item => item.lida
            ).length,
        naoLidas:
            lista.filter(
                item => !item.lida
            ).length,
        altaPrioridade:
            lista.filter(
                item => item.prioridade === "alta"
            ).length
    };
}
/* ==========================================================
                RESUMO ESTOQUE
========================================================== */
function obterResumoEstoque() {
    atualizarDados();
    const lista = estoque();
    return {
        totalItens: lista.length,
        estoqueBaixo:
            lista.filter(
                item =>
                    Number(item.quantidade || 0)
                    <=
                    Number(item.minimo || 0)
            ).length,
        valorTotal:
            lista.reduce(
                (total, item) =>
                    total +
                    (Number(item.quantidade || 0) *
                        Number(item.valor || 0))
                , 0
            )
    };
}
/* ==========================================================
                RESUMO CONVÊNIOS
========================================================== */
function obterResumoConvenios() {
    atualizarDados();
    const lista = convenios();
    return {
        total: lista.length,
        ativos:
            lista.filter(
                item => item.status === "ativo"
            ).length,
        inativos:
            lista.filter(
                item => item.status === "inativo"
            ).length
    };
}
/* ==========================================================
                RESUMO CONFIGURAÇÕES
========================================================== */
function obterResumoConfiguracoes() {
    atualizarDados();
    return {
        configuracoes: state.configuracoes,
        ultimaAtualizacao:
            state.ultimaAtualizacao
    };
}
/* ==========================================================
                ESTATÍSTICAS GERAIS
========================================================== */
function obterEstatisticasSistema() {
    atualizarDados();
    return {
        usuarios:
            obterResumoUsuarios(),
        pacientes:
            obterResumoPacientes(),
        agenda:
            obterResumoAgenda(),
        financeiro:
            obterResumoFinanceiro(),
        relatorios:
            obterResumoRelatorios(),
        notificacoes:
            obterResumoNotificacoes(),
        estoque:
            obterResumoEstoque(),
        convenios:
            obterResumoConvenios(),
        configuracoes:
            obterResumoConfiguracoes()
    };
}
/* ==========================================================
                ATUALIZAÇÃO GERAL
========================================================== */
function atualizar() {
    atualizarDados();
    return obterEstatisticasSistema();
}
/* ==========================================================
                LIMPAR CACHE
========================================================== */
function limparCache() {
    state.usuarios = [];
    state.pacientes = [];
    state.agenda = [];
    state.financeiro = [];
    state.servicos = [];
    state.profissionais = [];
    state.notificacoes = [];
    state.estoque = [];
    state.convenios = [];
    state.configuracoes = {};
    state.ultimaAtualizacao = null;
}