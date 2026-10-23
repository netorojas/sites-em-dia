// Botões "Assinar": vão para o link de pagamento do config.js ou, sem link, para o WhatsApp.
document.addEventListener("DOMContentLoaded", () => {
  const nomes = { inicial: "Inicial (R$ 297/mês)", agencia: "Agência (R$ 497/mês)", carteira: "Carteira (R$ 997/mês)" };
  const links = (window.SITE && window.SITE.pagamento) || {};
  let algumSemLink = false;
  document.querySelectorAll("[data-plano]").forEach(botao => {
    const plano = botao.dataset.plano;
    if (links[plano]) {
      botao.href = links[plano];
    } else {
      algumSemLink = true;
      botao.href = SED.zap(`Olá! Quero assinar o plano ${nomes[plano]} da Sites em Dia.\nNome da agência: `);
    }
    botao.target = "_blank";
    botao.rel = "noopener";
  });
  document.getElementById("aviso-pagamento").textContent = algumSemLink
    ? "Ao clicar em Assinar, você fala com a gente no WhatsApp e recebe o link de pagamento por Pix ou cartão."
    : "Ao clicar em Assinar, você vai para o ambiente seguro de pagamento.";
});
