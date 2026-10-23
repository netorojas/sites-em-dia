// Ferramentas grátis que rodam no navegador: hospedagem (DNS + IP) e e-mail (MX, SPF, DMARC).
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const esc = SED.esc;

  // Provedores conhecidos pelos servidores de DNS ou pelo dono do IP.
  const PROVEDORES = [
    [/cloudflare/i, "Cloudflare"], [/awsdns|amazon|aws/i, "Amazon Web Services"], [/google/i, "Google"], [/azure|microsoft/i, "Microsoft Azure"],
    [/hostgator/i, "HostGator"], [/locaweb/i, "Locaweb"], [/kinghost/i, "KingHost"], [/umbler/i, "Umbler"], [/hostinger/i, "Hostinger"],
    [/godaddy|domaincontrol/i, "GoDaddy"], [/registro\.br|dns\.br/i, "Registro.br"], [/digitalocean/i, "DigitalOcean"], [/hetzner/i, "Hetzner"],
    [/wix/i, "Wix"], [/squarespace/i, "Squarespace"], [/vercel/i, "Vercel"], [/netlify/i, "Netlify"], [/github/i, "GitHub"],
    [/ovh/i, "OVH"], [/linode|akamai/i, "Akamai/Linode"], [/hostnet/i, "Hostnet"], [/uol/i, "UOL Host"], [/weblink/i, "Weblink"],
  ];
  const provedor = texto => (PROVEDORES.find(([re]) => re.test(texto || "")) || [, ""])[1];

  async function infoIp(ip) {
    try {
      const r = await fetch(`https://ipwho.is/${ip}?lang=pt-BR`);
      const d = await r.json();
      if (d.success !== false) return { org: d.connection?.org || d.connection?.isp, asn: d.connection?.asn, pais: d.country, cidade: d.city, bandeira: d.flag?.emoji };
    } catch { /* tenta o próximo serviço */ }
    try {
      const d = await (await fetch(`https://ipapi.co/${ip}/json/`)).json();
      if (!d.error) return { org: d.org, asn: d.asn, pais: d.country_name, cidade: d.city };
    } catch { /* sem informação de IP */ }
    return null;
  }

  function tabela(linhas) {
    return `<div class="rolagem"><table class="tabela"><tbody>${linhas.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function ligar(formId, statusId, resId, executar) {
    const form = $(formId), status = $(statusId), res = $(resId), botao = form.querySelector("button"), entrada = form.querySelector("input");
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const host = SED.normalizarHost(entrada.value).replace(/^www\./, "");
      if (!host) { status.textContent = "Digite um domínio válido, por exemplo: empresa.com.br"; status.className = "status erro"; return; }
      entrada.value = host; botao.disabled = true; status.className = "status"; status.textContent = "Consultando...";
      try {
        res.innerHTML = await executar(host); res.hidden = false; status.textContent = "";
      } catch (e) {
        status.textContent = e.message || "Não consegui consultar agora. Tente de novo."; status.className = "status erro";
      } finally { botao.disabled = false; }
    });
  }

  // ---------- hospedagem ----------
  ligar("f-hospedagem", "s-hospedagem", "res-hospedagem", async host => {
    const [a, aaaa, ns, www] = await Promise.all([SED.dns(host, "A"), SED.dns(host, "AAAA"), SED.dns(host, "NS"), SED.dns("www." + host, "CNAME")]);
    if (!a.length && !aaaa.length && !www.length) throw new Error("Esse domínio não tem endereço publicado. Confira se digitou certo.");
    const ip = a[0] || aaaa[0];
    const info = ip ? await infoIp(ip) : null;
    const hosp = provedor(info?.org) || provedor(www.join(" ")) || info?.org || "Não identificado";
    const dnsProv = provedor(ns.join(" ")) || "Não identificado";
    return `<div class="resultado">
      <div class="resultado-cab"><div><h3>${esc(host)}</h3><p>Dados públicos de DNS e IP</p></div><span class="pilula"><i></i>Consulta real</span></div>
      <div class="metricas" style="grid-template-columns:repeat(2,1fr)"><div><b>${esc(hosp)}</b><small>Hospedagem do site</small></div><div><b>${esc(dnsProv)}</b><small>Onde está o DNS</small></div></div>
      ${tabela([
        ["Endereço IP", esc([...a, ...aaaa].slice(0, 4).join(", ") || "–")],
        ["Dono do IP", esc(info?.org || "–") + (info?.asn ? ` · AS${esc(String(info.asn).replace(/^AS/i, ""))}` : "")],
        ["Local do servidor", esc([info?.cidade, info?.pais].filter(Boolean).join(", ") || "–") + (info?.bandeira ? " " + info.bandeira : "")],
        ["Servidores de DNS", esc(ns.join(", ") || "–")],
        ["www aponta para", esc(www.join(", ") || "mesmo endereço")],
      ])}
      <p class="suave" style="font-size:.85rem">Quando o site usa Cloudflare ou outro CDN, o IP mostrado é o do CDN, não o do servidor de origem.</p>
    </div>`;
  });

  // ---------- e-mail ----------
  ligar("f-email", "s-email", "res-email", async host => {
    const [mx, txt, dmarc] = await Promise.all([SED.dns(host, "MX"), SED.dns(host, "TXT"), SED.dns("_dmarc." + host, "TXT")]);
    const spf = txt.find(t => /^v=spf1/i.test(t));
    const dm = dmarc.find(t => /^v=DMARC1/i.test(t));
    const politica = dm ? (dm.match(/;\s*p=(\w+)/i) || [])[1] : "";
    const servico = provedor(mx.join(" ")) || (/outlook|protection\.outlook/i.test(mx.join(" ")) ? "Microsoft 365" : /google|aspmx/i.test(mx.join(" ")) ? "Google Workspace" : mx.length ? "Outro provedor" : "–");
    const item = (ok, aviso, titulo, texto) => `<li><span>${ok ? "✅" : aviso ? "⚠️" : "❌"}</span><span><b>${titulo}</b><small>${texto}</small></span></li>`;
    const itens = [
      item(mx.length, false, "MX (quem recebe os e-mails)", mx.length ? `Configurado: ${esc(servico)}.` : "Sem MX: o domínio não recebe e-mails."),
      item(!!spf && !/\+all/.test(spf), !!spf, "SPF (quem pode enviar em nome do domínio)", spf ? (/\+all/.test(spf) ? "Existe, mas libera qualquer servidor (+all). Isso anula a proteção." : "Configurado.") : "Não encontrado. Os e-mails têm mais chance de cair no spam."),
      item(dm && /reject|quarantine/i.test(politica), !!dm, "DMARC (o que fazer com e-mail falso)", dm ? (/none/i.test(politica) ? "Existe, mas só monitora (p=none). Ninguém é bloqueado." : `Configurado com política ${esc(politica)}.`) : "Não encontrado. Gmail e Yahoo exigem DMARC de quem envia muitos e-mails."),
    ];
    const ruins = (!mx.length) + (!spf) + (!dm);
    return `<div class="resultado">
      <div class="resultado-cab"><div><h3>${esc(host)}</h3><p>Registros públicos de e-mail</p></div>
        <span class="pilula"><i style="background:${ruins ? "var(--medio)" : "var(--bom)"};box-shadow:none"></i>${ruins ? `${ruins} ponto(s) a corrigir` : "Tudo configurado"}</span></div>
      <ul class="problemas">${itens.join("")}</ul>
      ${tabela([["SPF", esc(spf || "–")], ["DMARC", esc(dm || "–")], ["MX", esc(mx.join(", ") || "–")]])}
      <a class="botao zap" style="justify-self:start" target="_blank" rel="noopener" href="${SED.zap(`Olá! Verifiquei o e-mail do domínio ${host} na Sites em Dia e quero ajuda para corrigir.`)}">Quero ajuda para corrigir</a>
    </div>`;
  });

  // Abre direto na ferramenta quando o link tem #nota, #hospedagem ou #email
  const alvo = location.hash && document.querySelector(location.hash + " input");
  if (alvo) setTimeout(() => alvo.focus(), 300);
});
