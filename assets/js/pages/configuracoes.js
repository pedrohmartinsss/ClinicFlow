/* ==========================================================
   CONFIGURAÇÕES
   ClinicFlow
========================================================== */
/* ==========================================================
   STORAGE
========================================================== */
const STORAGE_CONFIGURACOES =
    "clinicflow_configuracoes";
/* ==========================================================
   VARIÁVEIS
========================================================== */
let configuracoes = {};
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    inicializarModulo
);
/* ==========================================================
   INICIALIZAR
========================================================== */
function inicializarModulo() {
    carregarConfiguracoes();
    configurarAbas();
    configurarEventos();
}
/* ==========================================================
   CONFIGURAÇÃO PADRÃO
========================================================== */
function configuracaoPadrao() {
    return {
        clinica: {
            nome: "",
            razaoSocial: "",
            cnpj: "",
            cnes: "",
            telefone: "",
            whatsapp: "",
            email: "",
            site: "",
            cep: "",
            cidade: "",
            estado: "",
            endereco: "",
            horario: "",
            logo: ""
        },

        aparencia: {
            tema: "claro",
            corPrimaria: "#2563eb",
            corSecundaria: "#0f172a",
            fonte: "Inter"
        },

        agenda: {
            horaInicial: "08:00",
            horaFinal: "18:00",
            intervalo: 30,
            duracaoPadrao: 30
        },

        financeiro: {
            moeda: "BRL",
            comissao: 10,
            diasVencimento: 30,
            formaPagamento: "PIX",
            multa: 2,
            juros: 1
        },

        usuarios: {
            recepcionistaPaciente: true,
            recepcionistaAgenda: true,
            profissionalRestrito: true,
            financeiro: true
        },

        notificacoes: {
            consulta: true,
            aniversario: false,
            financeiro: true,
            email: false
        },

        integracoes: {
            googleCalendar: false,
            googleDrive: false,
            whatsapp: false,
            mercadoPago: false,
            stripe: false,
            asaas: false,
            viaCep: true
        }
    };
}
/* =========================================================
   CARREGAR
========================================================== */
function carregarConfiguracoes() {
    configuracoes =
        Storage.buscar(
            STORAGE_CONFIGURACOES
        ) ||
        configuracaoPadrao();
    preencherFormulario();
}
/* ==========================================================
   ABAS
========================================================== */
function configurarAbas() {
    document
        .querySelectorAll(".config-tab")
        .forEach(botao => {
            botao.addEventListener(
                "click",
                function () {
                    document
                        .querySelectorAll(".config-tab")
                        .forEach(item =>
                            item.classList.remove("active")
                        );
                    document
                        .querySelectorAll(".config-page")
                        .forEach(item =>
                            item.classList.remove("active")
                        );
                    this.classList.add("active");

                    document
                        .querySelector(
                            "#" +
                            this.dataset.tab
                        )
                        ?.classList.add("active");
                }
            );
        });
}
/* ==========================================================
   EVENTOS
========================================================== */
function configurarEventos() {
    const btnSair = document.querySelector("#btnSair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            Auth.logout();
        });
    }

    document
        .querySelector("#btnSalvarConfiguracoes")
        ?.addEventListener(
            "click",
            salvarConfiguracoes
        );

    document
        .querySelector("#btnExportarBackup")
        ?.addEventListener(
            "click",
            exportarBackup
        );

    document
        .querySelector("#btnImportarBackup")
        ?.addEventListener(
            "click",
            abrirModalBackup
        );

    document
        .querySelector("#cancelarRestauracao")
        ?.addEventListener(
            "click",
            fecharModalBackup
        );

    document
        .querySelector("#fecharModalRestaurar")
        ?.addEventListener(
            "click",
            fecharModalBackup
        );

    document
        .querySelector("#confirmarRestauracao")
        ?.addEventListener(
            "click",
            importarBackup
        );

    document
        .querySelector("#temaSistema")
        ?.addEventListener(
            "change",
            aplicarTema
        );
}
/* ==========================================================
   PREENCHER FORMULÁRIO
========================================================== */
function preencherFormulario() {
    /* ========= CLÍNICA ========= */
    document.querySelector("#nomeClinica").value =
        configuracoes.clinica.nome;
    document.querySelector("#razaoSocial").value =
        configuracoes.clinica.razaoSocial;
    document.querySelector("#cnpjClinica").value =
        configuracoes.clinica.cnpj;
    document.querySelector("#cnesClinica").value =
        configuracoes.clinica.cnes;
    document.querySelector("#telefoneClinica").value =
        configuracoes.clinica.telefone;
    document.querySelector("#whatsappClinica").value =
        configuracoes.clinica.whatsapp;
    document.querySelector("#emailClinica").value =
        configuracoes.clinica.email;
    document.querySelector("#siteClinica").value =
        configuracoes.clinica.site;
    document.querySelector("#cepClinica").value =
        configuracoes.clinica.cep;
    document.querySelector("#cidadeClinica").value =
        configuracoes.clinica.cidade;
    document.querySelector("#estadoClinica").value =
        configuracoes.clinica.estado;
    document.querySelector("#enderecoClinica").value =
        configuracoes.clinica.endereco;
    document.querySelector("#horarioFuncionamento").value =
        configuracoes.clinica.horario;
    /* ========= APARÊNCIA ========= */
    /*document.querySelector("#temaSistema").value =
        configuracoes.aparencia.tema;
    document.querySelector("#corPrimaria").value =
        configuracoes.aparencia.corPrimaria;
    document.querySelector("#corSecundaria").value =
        configuracoes.aparencia.corSecundaria;
    document.querySelector("#fonteSistema").value =
        configuracoes.aparencia.fonte;*/
    /* ========= AGENDA ========= */
    document.querySelector("#horaInicial").value =
        configuracoes.agenda.horaInicial;
    document.querySelector("#horaFinal").value =
        configuracoes.agenda.horaFinal;
    document.querySelector("#intervaloAgenda").value =
        configuracoes.agenda.intervalo;
    document.querySelector("#duracaoPadrao").value =
        configuracoes.agenda.duracaoPadrao;
    /* ========= FINANCEIRO ========= */
    document.querySelector("#moedaSistema").value =
        configuracoes.financeiro.moeda;
    document.querySelector("#comissaoPadrao").value =
        configuracoes.financeiro.comissao;
    document.querySelector("#diasVencimento").value =
        configuracoes.financeiro.diasVencimento;
    document.querySelector("#formaPagamentoPadrao").value =
        configuracoes.financeiro.formaPagamento;
    document.querySelector("#multaAtraso").value =
        configuracoes.financeiro.multa;
    document.querySelector("#jurosMensal").value =
        configuracoes.financeiro.juros;
    /* ========= USUÁRIOS ========= */
    document.querySelector("#permRecepcionistaPaciente").checked =
        configuracoes.usuarios.recepcionistaPaciente;
    document.querySelector("#permRecepcionistaAgenda").checked =
        configuracoes.usuarios.recepcionistaAgenda;
    document.querySelector("#profissionalRestrito").checked =
        configuracoes.usuarios.profissionalRestrito;
    document.querySelector("#permFinanceiro").checked =
        configuracoes.usuarios.financeiro;
    /* ========= NOTIFICAÇÕES ========= */
    document.querySelector("#notificacaoConsulta").checked =
        configuracoes.notificacoes.consulta;
    document.querySelector("#notificacaoAniversario").checked =
        configuracoes.notificacoes.aniversario;
    document.querySelector("#notificacaoFinanceiro").checked =
        configuracoes.notificacoes.financeiro;
    document.querySelector("#emailAutomatico").checked =
        configuracoes.notificacoes.email;
    /* ========= INTEGRAÇÕES ========= */
    document.querySelector("#integracaoGoogleCalendar").checked =
        configuracoes.integracoes.googleCalendar;
    document.querySelector("#integracaoGoogleDrive").checked =
        configuracoes.integracoes.googleDrive;
    document.querySelector("#integracaoWhatsapp").checked =
        configuracoes.integracoes.whatsapp;
    document.querySelector("#integracaoMercadoPago").checked =
        configuracoes.integracoes.mercadoPago;
    document.querySelector("#integracaoStripe").checked =
        configuracoes.integracoes.stripe;
    document.querySelector("#integracaoAsaas").checked =
        configuracoes.integracoes.asaas;
    document.querySelector("#integracaoViaCep").checked =
        configuracoes.integracoes.viaCep;
    aplicarTema();
}
/* ==========================================================
   SALVAR CONFIGURAÇÕES
========================================================== */
function salvarConfiguracoes() {
    configuracoes.clinica = {
        nome: document.querySelector("#nomeClinica").value.trim(),
        razaoSocial: document.querySelector("#razaoSocial").value.trim(),
        cnpj: document.querySelector("#cnpjClinica").value.trim(),
        cnes: document.querySelector("#cnesClinica").value.trim(),
        telefone: document.querySelector("#telefoneClinica").value.trim(),
        whatsapp: document.querySelector("#whatsappClinica").value.trim(),
        email: document.querySelector("#emailClinica").value.trim(),
        site: document.querySelector("#siteClinica").value.trim(),
        cep: document.querySelector("#cepClinica").value.trim(),
        cidade: document.querySelector("#cidadeClinica").value.trim(),
        estado: document.querySelector("#estadoClinica").value.trim(),
        endereco: document.querySelector("#enderecoClinica").value.trim(),
        horario: document.querySelector("#horarioFuncionamento").value.trim(),
        logo: configuracoes.clinica.logo
    };
    configuracoes.aparencia = {
        tema: document.querySelector("#temaSistema").value,
        corPrimaria: document.querySelector("#corPrimaria").value,
        corSecundaria: document.querySelector("#corSecundaria").value,
        fonte: document.querySelector("#fonteSistema").value
    };
    configuracoes.agenda = {
        horaInicial: document.querySelector("#horaInicial").value,
        horaFinal: document.querySelector("#horaFinal").value,
        intervalo: Number(
            document.querySelector("#intervaloAgenda").value
        ),
        duracaoPadrao: Number(
            document.querySelector("#duracaoPadrao").value
        )
    };
    configuracoes.financeiro = {
        moeda: document.querySelector("#moedaSistema").value,
        comissao: Number(
            document.querySelector("#comissaoPadrao").value
        ),
        diasVencimento: Number(
            document.querySelector("#diasVencimento").value
        ),
        formaPagamento:
            document.querySelector("#formaPagamentoPadrao").value,
        multa: Number(
            document.querySelector("#multaAtraso").value
        ),
        juros: Number(
            document.querySelector("#jurosMensal").value
        )
    };
    configuracoes.usuarios = {
        recepcionistaPaciente:
            document.querySelector("#permRecepcionistaPaciente").checked,
        recepcionistaAgenda:
            document.querySelector("#permRecepcionistaAgenda").checked,
        profissionalRestrito:
            document.querySelector("#profissionalRestrito").checked,
        financeiro:
            document.querySelector("#permFinanceiro").checked
    };
    configuracoes.notificacoes = {
        consulta:
            document.querySelector("#notificacaoConsulta").checked,
        aniversario:
            document.querySelector("#notificacaoAniversario").checked,
        financeiro:
            document.querySelector("#notificacaoFinanceiro").checked,
        email:
            document.querySelector("#emailAutomatico").checked
    };
    configuracoes.integracoes = {
        googleCalendar:
            document.querySelector("#integracaoGoogleCalendar").checked,
        googleDrive:
            document.querySelector("#integracaoGoogleDrive").checked,
        whatsapp:
            document.querySelector("#integracaoWhatsapp").checked,
        mercadoPago:
            document.querySelector("#integracaoMercadoPago").checked,
        stripe:
            document.querySelector("#integracaoStripe").checked,
        asaas:
            document.querySelector("#integracaoAsaas").checked,
        viaCep:
            document.querySelector("#integracaoViaCep").checked
    };
    Storage.salvar(
        STORAGE_CONFIGURACOES,
        configuracoes
    );
    aplicarTemaGlobal();
    mostrarMensagem(
        "Configurações salvas com sucesso.",
        "success"
    );
}
/* ==========================================================
   TEMA
========================================================== */
function aplicarTema() {
    document.body.classList.toggle(
        "dark",
        configuracoes.aparencia.tema === "escuro"
    );

    document.documentElement.style.setProperty(
        "--primary",
        configuracoes.aparencia.corPrimaria
    );

    document.body.style.fontFamily =
        configuracoes.aparencia.fonte;
}
/* ==========================================================
   LOGO DA CLÍNICA
========================================================== */
document
    .querySelector("#logoClinica")
    ?.addEventListener(
        "change",
        function () {
            const arquivo = this.files[0];
            if (!arquivo) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                configuracoes.clinica.logo =
                    e.target.result;
                Storage.salvar(
                    STORAGE_CONFIGURACOES,
                    configuracoes
                );
                mostrarMensagem(
                    "Logo atualizada com sucesso.",
                    "success"
                );
            };
            reader.readAsDataURL(arquivo);
        }
    );
/* ==========================================================
EXPORTAR BACKUP
========================================================== */
function exportarBackup() {
    const backup = {
        exportadoEm: new Date().toISOString(),
        versao: "1.0.0",
        dados: {}
    };
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        try {
            backup.dados[chave] = JSON.parse(
                localStorage.getItem(chave)
            );
        }
        catch {
            backup.dados[chave] =
                localStorage.getItem(chave);
        }
    }
    const blob = new Blob(
        [
            JSON.stringify(
                backup,
                null,
                2
            )
        ],
        {
            type: "application/json"
        }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const data = new Date();
    const nomeArquivo =
        `ClinicFlow_Backup_${data.getFullYear()}-${String(
            data.getMonth() + 1
        ).padStart(2, "0")}-${String(
            data.getDate()
        ).padStart(2, "0")}.json`;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    mostrarMensagem(
        "Backup exportado com sucesso.",
        "success"
    );
}
/* ==========================================================
   MODAL BACKUP
========================================================== */
function abrirModalBackup() {
    document.querySelector(
        "#arquivoBackup"
    ).value = "";
    Modal.abrir(
        "#modalRestaurarSistema"
    );
}

function fecharModalBackup() {
    Modal.fechar(
        "#modalRestaurarSistema"
    );
}
/* ==========================================================
   IMPORTAR BACKUP
========================================================== */
function importarBackup() {
    const input =
        document.querySelector(
            "#arquivoBackup"
        );
    if (
        !input.files ||
        input.files.length === 0
    ) {
        mostrarMensagem(
            "Selecione um arquivo.",
            "warning"
        );
        return;
    }
    const arquivo =
        input.files[0];
    const leitor =
        new FileReader();
    leitor.onload = function (evento) {
        try {
            const backup =
                JSON.parse(
                    evento.target.result
                );
            if (
                !backup.dados
            ) {
                mostrarMensagem(
                    "Arquivo inválido.",
                    "error"
                );
                return;
            }
            restaurarBackup(
                backup.dados
            );
        }
        catch {
            mostrarMensagem(
                "Arquivo corrompido.",
                "error"
            );
        }
    };
    leitor.readAsText(
        arquivo
    );
}
/* ==========================================================
   RESTAURAR
========================================================== */
function restaurarBackup(dados) {
    Object.keys(dados)
        .forEach(chave => {
            localStorage.setItem(
                chave,
                JSON.stringify(
                    dados[chave]
                )
            );
        });
    fecharModalBackup();
    mostrarMensagem(
        "Backup restaurado com sucesso.",
        "success"
    );
    setTimeout(() => {
        location.reload();
    }, 1200);
}
/* ==========================================================
   RESET CONFIGURAÇÕES
========================================================== */
function restaurarConfiguracoesPadrao() {
    configuracoes =
        configuracaoPadrao();
    Storage.salvar(
        STORAGE_CONFIGURACOES,
        configuracoes
    );
    preencherFormulario();
    mostrarMensagem(
        "Configurações restauradas.",
        "success"
    );
}
/* ==========================================================
   AUTO SAVE (OPCIONAL)
========================================================== */
/*document
    .querySelectorAll(
        ".form-control"
    )

    .forEach(campo => {
        campo.addEventListener(
            "change",
            () => {
                salvarConfiguracoes();
            }
        );
    });*/
/* ==========================================================
   CHECKBOX AUTO SAVE
========================================================== */
document
    .querySelectorAll(
        'input[type="checkbox"]'
    )

    .forEach(campo => {
        campo.addEventListener(
            "change",
            () => {
                salvarConfiguracoes();
            }
        );
    });
/* ==========================================================
VIA CEP
========================================================== */
document
    .querySelector("#cepClinica")
    ?.addEventListener(
        "blur",
        buscarCep
    );
async function buscarCep() {
    if (
        !configuracoes.integracoes.viaCep
    ) return;
    const cep =
        document
            .querySelector("#cepClinica")
            .value
            .replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
        const resposta =
            await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );
        const dados =
            await resposta.json();
        if (dados.erro) return;
        document.querySelector(
            "#cidadeClinica"
        ).value = dados.localidade;

        document.querySelector(
            "#estadoClinica"
        ).value = dados.uf;

        document.querySelector(
            "#enderecoClinica"
        ).value = dados.logradouro;
    }
    catch {
        console.warn(
            "Erro ao consultar ViaCEP."
        );
    }
}
/* ==========================================================
   MÁSCARAS
========================================================== */
document
    .querySelector("#cnpjClinica")
    ?.addEventListener(
        "input",
        e => {
            e.target.value =
                Utils.mascararCNPJ
                    ? Utils.mascararCNPJ(
                        e.target.value
                    )
                    : e.target.value;
        }
    );

document
    .querySelector("#telefoneClinica")
    ?.addEventListener(
        "input",
        e => {
            e.target.value =
                Utils.mascararTelefone
                    ? Utils.mascararTelefone(
                        e.target.value
                    )
                    : e.target.value;
        }
    );

document
    .querySelector("#whatsappClinica")
    ?.addEventListener(
        "input",
        e => {
            e.target.value =
                Utils.mascararTelefone
                    ? Utils.mascararTelefone(
                        e.target.value
                    )
                    : e.target.value;
        }
    );
/* ==========================================================
   PREVIEW DA LOGO
========================================================== */
const inputLogo =
    document.querySelector(
        "#logoClinica"
    );
const previewLogo =
    document.querySelector(
        "#previewLogo"
    );
if (
    inputLogo &&
    previewLogo
) {
    inputLogo.addEventListener(
        "change",
        function () {
            const arquivo =
                this.files[0];
            if (!arquivo) return;
            const leitor =
                new FileReader();
            leitor.onload = function (
                evento
            ) {
                previewLogo.src =
                    evento.target.result;
                previewLogo.style.display =
                    "block";
            };
            leitor.readAsDataURL(
                arquivo
            );
        }
    );
}
/* ==========================================================
   ALTERAÇÃO DE TEMA
========================================================== */
document
    .querySelector("#temaSistema")
    ?.addEventListener(
        "change",
        function () {
            document.body.classList.toggle(
                "dark",
                this.value === "escuro"
            );
        }
    );
/* ==========================================================
   ALTERAÇÃO DE COR
========================================================== */
document
    .querySelector("#corPrimaria")
    ?.addEventListener(
        "input",
        function () {
            document.documentElement.style.setProperty(
                "--primary",
                this.value
            );
        }
    );
/* ==========================================================
   VALIDAÇÃO
========================================================== */
function validarFormulario() {
    const nome =
        document
            .querySelector("#nomeClinica")
            ?.value
            .trim();
    if (!nome) {
        mostrarMensagem(
            "Informe o nome da clínica.",
            "warning"
        );
        return false;
    }
    return true;
}
/* ==========================================================
   SOBRESCREVER SALVAR
========================================================== */
const salvarOriginal =
    salvarConfiguracoes;
salvarConfiguracoes =
    function () {
        if (
            !validarFormulario()
        ) return;
        salvarOriginal();
    };
/* ==========================================================
   UTILITÁRIOS
========================================================== */
function atualizarPreviewLogo() {
    if (
        !previewLogo ||
        !configuracoes.clinica.logo
    ) return
    previewLogo.src =
        configuracoes.clinica.logo;
    previewLogo.style.display =
        "block";
}
/* ==========================================================
   CARREGAMENTO
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        atualizarPreviewLogo();
        aplicarTema();
    }
);
