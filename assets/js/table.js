/* ==========================================================
   TABLE.JS
   ClinicFlow
   Componentes globais de tabela
========================================================== */
const Table = {
    limpar(selector) {
        const tabela =
            document.querySelector(selector);
        if (!tabela)
            return;
        tabela.innerHTML = "";
    },
    renderizar(selector, dados, template) {
        const tabela =
            document.querySelector(selector);
        if (!tabela)
            return;
        tabela.innerHTML = "";
        dados.forEach(
            item => {
                tabela.innerHTML +=
                    template(item);
            }
        );
    },
    criarLinha(dados) {
        return dados
            .map(
                coluna => {
                    return `
                    <td>
                        ${coluna}
                    </td>
                `;
                }
            )
            .join("");
    },
    vazio(selector, mensagem = "Nenhum registro encontrado") {
        const tabela =
            document.querySelector(selector);
        if (!tabela)
            return;
        tabela.innerHTML = `
            <tr>
                <td colspan="100%"
                class="text-center">
                    ${mensagem}
                </td>
            </tr>
        `;
    }
};