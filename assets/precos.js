// Página de preços: seletor Mensal / Semestral / Anual e botões que levam ao pagamento.
// Os preços ficam todos aqui. Os links de pagamento ficam no config.js.
document.addEventListener("DOMContentLoaded", () => {
  const PLANOS = {
    inicial:  { nome: "Inicial",  laudos: 20,  mensal: 297, semestral: 1600, anual: 2970 },
    agencia:  { nome: "Agência",  laudos: 60,  mensal: 497, semestral: 2680, anual: 4970 },
    carteira: { nome: "Carteira", laudos: 150, mensal: 997, semestral: 5380, anual: 9970 },
  };
  const PERIODOS = {
    mensal:    { meses: 1,  parcelas: 1,  rotulo: "Mensal" },
    semestral: { meses: 6,  parcelas: 6,  rotulo: "Semestral" },
    anual:     { meses: 12, parcelas: 12, rotulo: "Anual" },
  };
  const links = (window.SITE && window.SITE.pagamento) || {};
  const real = (n, casas = 0) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const centavos = n => real(n, Number.isInteger(n) ? 0 : 2);
  const botoes = [...document.querySelectorAll("[data-periodo]")];

  function mostrar(periodo) {
    const per = PERIODOS[periodo];
    botoes.forEach(b => b.setAttribute("aria-checked", b.dataset.periodo === periodo));
    let algumSemLink = false;

    for (const [chave, p] of Object.entries(PLANOS)) {
      const card = document.querySelector(`[data-card="${chave}"]`);
      const total = p[periodo];
      const porMes = Math.round((total / per.meses) * 100) / 100;
      const cheio = p.mensal * per.meses;

      card.querySelector("[data-preco]").innerHTML = `${centavos(porMes)}<small> /mês</small>`;
      card.querySelector("[data-riscado]").textContent = periodo === "mensal" ? "" : `${real(p.mensal)}/mês`;
      card.querySelector("[data-condicao]").innerHTML = periodo === "mensal"
        ? `Assinatura mensal · cancele quando quiser<br><span class="suave">≈ ${real(p.mensal / p.laudos, 2)} por laudo</span>`
        : `<b>${real(total)}</b> à vista no Pix ou em até <b>${per.parcelas}x</b> no cartão<br><span class="economia">Você economiza ${real(cheio - total)}</span>`;

      const botao = card.querySelector("[data-plano]");
      botao.textContent = periodo === "mensal" ? `Assinar o ${p.nome}` : `Contratar ${per.meses} meses`;
      const link = links[chave] && links[chave][periodo];
      if (link) {
        botao.href = link;
      } else {
        algumSemLink = true;
        const texto = periodo === "mensal"
          ? `Olá! Quero assinar o plano ${p.nome} mensal (${real(p.mensal)}/mês) da Sites em Dia.\nNome da agência: `
          : `Olá! Quero contratar o plano ${p.nome} ${per.rotulo.toLowerCase()} (${real(total)}, até ${per.parcelas}x) da Sites em Dia.\nNome da agência: `;
        botao.href = SED.zap(texto);
      }
      botao.target = "_blank";
      botao.rel = "noopener";
    }

    document.getElementById("aviso-pagamento").textContent = algumSemLink
      ? "Ao clicar, você fala com a gente no WhatsApp e recebe o link de pagamento por Pix, boleto ou cartão de crédito."
      : "Ao clicar, você vai para o ambiente seguro de pagamento da Asaas.";
    try { history.replaceState(null, "", `#${periodo}`); } catch { /* sem histórico */ }
  }

  botoes.forEach((b, i) => {
    b.addEventListener("click", () => mostrar(b.dataset.periodo));
    b.addEventListener("keydown", e => {
      const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!passo) return;
      const proximo = botoes[(i + passo + botoes.length) % botoes.length];
      proximo.focus();
      mostrar(proximo.dataset.periodo);
    });
  });

  const inicial = (location.hash || "").slice(1);
  mostrar(PERIODOS[inicial] ? inicial : "anual");
});
