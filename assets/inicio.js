// Página inicial: exemplo de resultado, marca da agência, abas, calculadora e verificações.
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const brl = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
  document.querySelectorAll(".hoje").forEach(e => e.textContent = new Date().toLocaleDateString("pt-BR"));

  // ---------- resultado de exemplo (antes do primeiro teste) ----------
  const exemplo = $("resultado-hero");
  exemplo.innerHTML = `
    <div class="resultado-cab"><div><h3>Nota do Google no celular</h3><p>clinicaexemplo.com.br · exemplo</p></div>
      <span class="pilula">Exemplo ilustrativo</span></div>
    <div class="aneis">${SED.anel(34, "Velocidade")}${SED.anel(78, "Acessibilidade")}${SED.anel(74, "Boas práticas")}${SED.anel(92, "SEO")}</div>
    <div class="metricas"><div><b>9,8 s</b><small>Conteúdo principal</small></div><div><b>3,1 s</b><small>Primeiro conteúdo</small></div>
      <div><b>1.240 ms</b><small>Bloqueio total</small></div><div><b>0,21</b><small>Mudança de layout</small></div></div>
    <ul class="problemas">
      <li><span>❌</span><span>Reduza o JavaScript não usado<small>Economia estimada de 1,4 s</small></span></li>
      <li><span>❌</span><span>Envie imagens em formatos modernos<small>Economia estimada de 820 KiB</small></span></li>
      <li><span>⚠️</span><span>As imagens não têm atributos alt</span></li>
    </ul>
    <p class="suave" style="font-size:.88rem">Cole um site no campo ao lado para ver os números reais dele.</p>`;

  // ---------- esteira ----------
  const nomes = ["Velocidade no celular", "Cadeado HTTPS", "Aviso de cookies", "Pixel antes do consentimento", "Título no Google", "Descrição no Google",
    "Botão de WhatsApp", "Telefone clicável", "Prévia no WhatsApp", "Imagens sem descrição", "Links quebrados", "Acessibilidade", "HSTS", "Política de privacidade"];
  $("trilho").innerHTML = nomes.concat(nomes).map(n => `<span>${n}</span>`).join("");

  // ---------- marca da agência ----------
  let logoUrl = "";
  function aplicarMarca() {
    const nome = $("m-nome").value.trim() || "Sua Agência";
    document.querySelectorAll(".m-nome").forEach(e => e.textContent = nome);
    document.querySelectorAll(".m-ini").forEach(e => {
      e.innerHTML = logoUrl ? `<img src="${logoUrl}" alt="">` : SED.esc(nome[0].toUpperCase());
    });
    document.querySelectorAll(".m-zap").forEach(e => e.textContent = $("m-zap").value);
  }
  function aplicarCor(cor) {
    document.body.style.setProperty("--marca", cor);
    $("m-cor").value = cor;
    document.querySelectorAll("#cores button").forEach(b => b.setAttribute("aria-pressed", b.dataset.cor === cor));
  }
  $("m-nome").addEventListener("input", aplicarMarca);
  $("m-zap").addEventListener("input", aplicarMarca);
  document.querySelectorAll("#cores button").forEach(b => b.addEventListener("click", () => aplicarCor(b.dataset.cor)));
  $("m-cor").addEventListener("input", e => aplicarCor(e.target.value));
  $("m-logo").addEventListener("change", e => {
    const arquivo = e.target.files[0];
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    logoUrl = URL.createObjectURL(arquivo);
    $("previa-logo").innerHTML = `<img src="${logoUrl}" alt="Logo enviado">`;
    aplicarMarca();
  });

  // ---------- abas ----------
  const abas = [...document.querySelectorAll("[role=tab]")];
  function abrir(aba, focar) {
    abas.forEach(a => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", ativa); a.tabIndex = ativa ? 0 : -1;
      $(a.getAttribute("aria-controls")).hidden = !ativa;
    });
    if (focar) aba.focus();
  }
  abas.forEach((a, i) => {
    a.addEventListener("click", () => abrir(a));
    a.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") abrir(abas[(i + 1) % abas.length], true);
      if (e.key === "ArrowLeft") abrir(abas[(i - 1 + abas.length) % abas.length], true);
    });
  });

  // ---------- calculadora ----------
  function calcular() {
    const v = id => +$(id).value;
    const carteira = v("c-carteira"), prospect = v("c-prospect"), convC = v("c-conv-c"), convP = v("c-conv-p"), ticket = v("c-ticket");
    $("o-carteira").textContent = carteira; $("o-prospect").textContent = prospect;
    $("o-conv-c").textContent = convC + "%"; $("o-conv-p").textContent = convP + "%"; $("o-ticket").textContent = brl(ticket);
    const laudos = carteira + prospect;
    const vendasC = carteira * convC / 100, vendasP = prospect * convP / 100;
    const total = (vendasC + vendasP) * ticket;
    const plano = laudos <= 20 ? ["Inicial", 297] : laudos <= 60 ? ["Agência", 497] : laudos <= 150 ? ["Carteira", 997] : ["Sob medida", 0];
    const fmt = n => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    $("r-total").textContent = brl(total);
    $("r-laudos").textContent = laudos;
    $("r-vendas-c").textContent = fmt(vendasC);
    $("r-vendas-p").textContent = fmt(vendasP);
    $("r-plano").textContent = plano[1] ? `${plano[0]} · ${brl(plano[1])}` : "Sob medida";
    $("r-vezes").textContent = plano[1] ? (total >= plano[1] ? `${fmt(total / plano[1])}× o valor do plano` : "Abaixo do valor do plano") : "–";
  }
  ["c-carteira", "c-prospect", "c-conv-c", "c-conv-p", "c-ticket"].forEach(id => $(id).addEventListener("input", calcular));
  calcular();

  // ---------- verificações ----------
  const CAT = {
    "Nota do Google": [["Velocidade no celular", "Quanto tempo o conteúdo principal leva para aparecer num celular em 4G."], ["Acessibilidade", "Se pessoas com deficiência e idosos conseguem usar o site."], ["Boas práticas", "Erros técnicos e de segurança medidos pelo Google."], ["SEO técnico", "Se o Google consegue ler e indexar a página."]],
    "Segurança": [["Cadeado (HTTPS)", "Se o navegador mostra o site como seguro."], ["HTTPS obrigatório", "Se o navegador é obrigado a usar sempre a versão segura."], ["Proteção contra iframe", "Se outro site consegue exibir o seu dentro dele."], ["Tipo de arquivo", "Uma proteção simples que falta em muitos servidores."]],
    "LGPD": [["Aviso de cookies", "Se existe aviso de consentimento quando há rastreadores."], ["Rastreio antes do consentimento", "Se o pixel de anúncio liga antes de o visitante aceitar."], ["Política de privacidade", "Se a página inicial leva até ela."]],
    "Google e SEO": [["Título da página", "O texto azul que aparece no Google, no tamanho certo."], ["Descrição", "O texto cinza embaixo do título no Google."], ["Título principal (H1)", "Um título principal por página."], ["Idioma", "Se a página declara o idioma."], ["Imagens com descrição", "Textos alternativos para o Google e leitores de tela."], ["Adaptado ao celular", "Se o layout foi feito para telas pequenas."]],
    "WhatsApp e contato": [["Prévia ao compartilhar", "Imagem e título quando o link é enviado no WhatsApp."], ["Ícone da aba", "O favicon do site."], ["Botão de WhatsApp", "Se o visitante chama a empresa com um clique."], ["Telefone clicável", "Se o telefone liga com um toque no celular."], ["Instagram", "Se a página leva às redes da empresa."]],
    "Erros e peso": [["Quantidade de arquivos", "Páginas com arquivos demais ficam lentas no 4G."], ["Links quebrados", "Arquivos que não carregam (erro 404 ou 500)."], ["Erros de programação", "Erros que aparecem no console do navegador."]],
  };
  const caixaCat = $("categorias"), caixaLista = $("lista-checks");
  function mostrar(nome) {
    caixaCat.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === nome));
    caixaLista.innerHTML = CAT[nome].map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("");
  }
  for (const [nome, itens] of Object.entries(CAT)) {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.cat = nome; b.textContent = `${nome} · ${itens.length}`;
    b.addEventListener("click", () => mostrar(nome)); caixaCat.append(b);
  }
  mostrar("Nota do Google");

  $("cta-zap").href = SED.zap("Olá! Quero testar os laudos da Sites em Dia.\nAgência: \nSites:\n1. \n2. \n3. ");
});
