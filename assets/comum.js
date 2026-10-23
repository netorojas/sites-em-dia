// Funções usadas em todas as páginas: menu, contatos e o teste real com o Google.
const SED = (() => {
  const cfg = () => window.SITE || {};

  const faixa = n => (n >= 90 ? "var(--bom)" : n >= 50 ? "var(--medio)" : "var(--ruim)");

  const zap = texto => `https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(texto)}`;

  const telefone = () => {
    const n = cfg().whatsapp || "";
    return n.length >= 12 ? `+${n.slice(0, 2)} (${n.slice(2, 4)}) ${n.slice(4, -4)}-${n.slice(-4)}` : n;
  };

  // "https://www.Site.com.br/contato" -> "www.site.com.br"
  function normalizarHost(texto) {
    let host = (texto || "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#\s]/)[0];
    if (host && !host.includes(".")) host += ".com.br";
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : "";
  }

  // ---------- teste real: Google PageSpeed Insights ----------
  const CATEGORIAS = [["performance", "Velocidade"], ["accessibility", "Acessibilidade"], ["best-practices", "Boas práticas"], ["seo", "SEO"]];

  async function testarGoogle(host, estrategia = "mobile") {
    const p = new URLSearchParams({ url: `https://${host}`, strategy: estrategia, locale: "pt" });
    CATEGORIAS.forEach(([c]) => p.append("category", c.toUpperCase().replace("-", "_")));
    if (cfg().pagespeedKey) p.set("key", cfg().pagespeedKey);
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 90000);
    let resposta;
    try {
      resposta = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${p}`, { signal: controle.signal });
    } catch (e) {
      throw new Error(e.name === "AbortError" ? "O Google demorou demais para responder. Tente de novo em instantes." : "Não consegui falar com o Google. Confira a sua internet.");
    } finally { clearTimeout(limite); }
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      const msg = (dados.error && dados.error.message) || "";
      if (resposta.status === 429) throw new Error("O teste grátis atingiu o limite de hoje no Google. Peça o laudo completo pelo WhatsApp que a gente roda para você.");
      if (/FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|DNS/i.test(msg)) throw new Error("O Google não conseguiu abrir esse site. Confira se o endereço está certo e se o site está no ar.");
      throw new Error("O Google não conseguiu analisar esse site agora. Tente de novo em alguns minutos.");
    }
    const lr = dados.lighthouseResult;
    const notas = Object.fromEntries(CATEGORIAS.map(([c]) => [c, Math.round((lr.categories[c]?.score ?? 0) * 100)]));
    const a = lr.audits;
    const metricas = [
      ["Conteúdo principal", a["largest-contentful-paint"]?.displayValue],
      ["Primeiro conteúdo", a["first-contentful-paint"]?.displayValue],
      ["Bloqueio total", a["total-blocking-time"]?.displayValue],
      ["Mudança de layout", a["cumulative-layout-shift"]?.displayValue],
    ];
    // Problemas: até 3 dicas de velocidade (as que mais economizam tempo) e até 3 das outras categorias.
    const limpar = t => String(t || "").replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    const velocidade = [], outros = [];
    for (const ref of lr.categories.performance?.auditRefs || []) {
      const au = a[ref.id];
      if (!au || ref.group !== "diagnostics" || au.score === null || au.score >= 0.9) continue;
      const economia = Object.values(au.metricSavings || {}).reduce((s, v) => s + (v || 0), 0);
      // Só dicas acionáveis: as que dizem quanto se economiza ("Economia estimada de ...").
      if (economia > 0 && /economia|savings/i.test(au.displayValue || "")) velocidade.push({ titulo: limpar(au.title), detalhe: limpar(au.displayValue), peso: economia, grave: au.score < 0.5 });
    }
    for (const [c] of CATEGORIAS.slice(1)) {
      for (const ref of lr.categories[c]?.auditRefs || []) {
        const au = a[ref.id];
        if (!au || !ref.weight || au.score === null || au.score >= 0.9 || outros.some(o => o.id === ref.id)) continue;
        outros.push({ id: ref.id, titulo: limpar(au.title), detalhe: limpar(au.displayValue), peso: ref.weight * (1 - au.score), grave: au.score < 0.5 });
      }
    }
    const ordenar = l => l.sort((x, y) => y.peso - x.peso).slice(0, 3);
    return { host, notas, metricas, problemas: [...ordenar(velocidade), ...ordenar(outros)], data: new Date() };
  }

  function anel(valor, rotulo) {
    return `<div class="anel"><div class="dial" style="--v:${valor};--c:${faixa(valor)}"><b>${valor}</b></div><small>${rotulo}</small></div>`;
  }

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function htmlResultado(r) {
    const prob = r.problemas.length
      ? r.problemas.map(p => `<li><span>${p.grave ? "❌" : "⚠️"}</span><span>${esc(p.titulo)}${p.detalhe ? `<small>${esc(p.detalhe)}</small>` : ""}</span></li>`).join("")
      : `<li><span>✅</span><span>Nenhum problema relevante nas regras do Google.</span></li>`;
    const pedido = `Olá! Testei o site ${r.host} na Sites em Dia (velocidade no celular ${r.notas.performance}/100). Quero o laudo completo.`;
    return `
      <div class="resultado-cab"><div><h3>Nota do Google no celular</h3><p>${esc(r.host)} · ${r.data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p></div>
        <span class="pilula"><i></i>Dados reais do Google</span></div>
      <div class="aneis">${CATEGORIAS.map(([c, n]) => anel(r.notas[c], n)).join("")}</div>
      <div class="metricas">${r.metricas.map(([n, v]) => `<div><b>${esc(v || "–")}</b><small>${n}</small></div>`).join("")}</div>
      <div><span class="rotulo">Principais pontos a corrigir</span></div>
      <ul class="problemas">${prob}</ul>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <a class="botao zap" href="${zap(pedido)}" target="_blank" rel="noopener">Receber o laudo completo (grátis)</a>
        <span class="suave" style="font-size:.88rem">Inclui LGPD, cookies, WhatsApp, prints e PDF com a sua marca.</span>
      </div>`;
  }

  // Liga um formulário de teste: <form data-teste> com <input> e um alvo [data-resultado].
  function ligarTeste(form, alvo) {
    const entrada = form.querySelector("input"), botao = form.querySelector("button"), status = form.parentElement.querySelector("[data-status]");
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const host = normalizarHost(entrada.value);
      if (!host) { status.textContent = "Digite um endereço válido, por exemplo: clinicasorriso.com.br"; status.className = "status erro"; entrada.focus(); return; }
      entrada.value = host; botao.disabled = true; alvo.hidden = false;
      status.textContent = ""; status.className = "status";
      alvo.innerHTML = `<div class="carregando"><b>Analisando ${esc(host)} com o Google...</b><span class="suave">Simulando um celular em 4G. Leva de 15 a 40 segundos.</span><div class="barra"><i></i></div></div>`;
      try {
        const r = await testarGoogle(host);
        alvo.innerHTML = htmlResultado(r);
        alvo.classList.add("resultado");
      } catch (e) {
        alvo.innerHTML = `<div class="carregando"><b class="status erro">${esc(e.message)}</b>
          <a class="botao zap" style="justify-self:start" href="${zap(`Olá! Quero o laudo do site ${host}.`)}" target="_blank" rel="noopener">Pedir pelo WhatsApp</a></div>`;
      } finally { botao.disabled = false; }
    });
  }

  // ---------- DNS (usado nas ferramentas) ----------
  async function dns(nome, tipo) {
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(nome)}&type=${tipo}`);
    if (!r.ok) throw new Error("Falha na consulta de DNS.");
    const d = await r.json();
    return (d.Answer || []).filter(x => x.type === { A: 1, NS: 2, CNAME: 5, MX: 15, TXT: 16, AAAA: 28 }[tipo]).map(x => x.data.replace(/^"|"$/g, "").replace(/" "/g, "").replace(/\.$/, ""));
  }

  // ---------- comum a todas as páginas ----------
  document.addEventListener("DOMContentLoaded", () => {
    const botao = document.querySelector(".menu-botao"), links = document.getElementById("menu-links");
    botao?.addEventListener("click", () => {
      const aberto = links.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", aberto);
    });
    const c = cfg(), partes = [];
    if (c.whatsapp) partes.push(`WhatsApp <a href="${zap("Olá! Vim pelo site da Sites em Dia.")}" target="_blank" rel="noopener">${telefone()}</a>`);
    if (c.email) partes.push(`<a href="mailto:${c.email}">${c.email}</a>`);
    if (c.instagram) partes.push(`<a href="https://instagram.com/${c.instagram}" target="_blank" rel="noopener">@${c.instagram}</a>`);
    document.querySelectorAll("[data-contato]").forEach(el => el.innerHTML = partes.join(" · "));
    document.querySelectorAll("[data-telefone]").forEach(el => el.textContent = telefone());
    document.querySelectorAll("[data-email]").forEach(el => { if (c.email) { el.textContent = c.email; el.href = `mailto:${c.email}`; } else el.closest("[data-some-vazio]")?.setAttribute("hidden", ""); });
    document.querySelectorAll("[data-instagram]").forEach(el => { if (c.instagram) { el.textContent = "@" + c.instagram; el.href = `https://instagram.com/${c.instagram}`; } else el.closest("[data-some-vazio]")?.setAttribute("hidden", ""); });
    const safe = document.getElementById("selo-safe");
    if (safe) safe.href = `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(location.host || "netorojas.github.io")}&hl=pt_BR`;
    document.querySelectorAll("form[data-teste]").forEach(f => ligarTeste(f, document.querySelector(f.dataset.teste)));
  });

  return { faixa, zap, telefone, normalizarHost, testarGoogle, dns, esc, anel };
})();
