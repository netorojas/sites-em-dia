// Página de obrigado: botão do WhatsApp com a mensagem de início da assinatura.
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("zap-obrigado").href = SED.zap(
    "Olá! Acabei de assinar a Sites em Dia.\nNome da agência: \nCor da marca: \nWhatsApp para os laudos: \n(vou mandar o logo em seguida)");
});
