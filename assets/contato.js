// Formulário de contato: monta a mensagem e abre o WhatsApp (nada é enviado para um servidor).
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  $("zap-direto").href = SED.zap("Olá! Vim pelo site da Sites em Dia.");
  $("form-contato").addEventListener("submit", ev => {
    ev.preventDefault();
    const texto = [`Olá! Sou ${$("ct-nome").value.trim()}${$("ct-agencia").value.trim() ? `, da ${$("ct-agencia").value.trim()}` : ""}.`,
      `Assunto: ${$("ct-assunto").value}`, $("ct-msg").value.trim()].filter(Boolean).join("\n");
    window.open(SED.zap(texto), "_blank", "noopener");
  });
});
