// Configurações do site. Edite aqui e rode ./montar-site.sh para publicar.
window.SITE = {
  // WhatsApp comercial, só números, com 55 e DDD.
  whatsapp: "5511918521800",
  // E-mail de contato (deixe "" para esconder).
  email: "",
  // Instagram, sem @ (deixe "" para esconder).
  instagram: "",

  // Chave da API do Google PageSpeed Insights (grátis). Sem chave, o teste real
  // usa a cota pública do Google, que costuma acabar no meio do dia.
  pagespeedKey: "AIzaSyD7g6fxKbOedfXiWdsde4L35pH1UrSd4aA",

  // Links de pagamento do Asaas, um por plano e período. Enquanto um link estiver
  // vazio, o botão daquele plano abre o WhatsApp com o plano e o período escolhidos.
  //   mensal:    link de ASSINATURA mensal (renova sozinha)
  //   semestral: link de cobrança PARCELADA (pagamento único, até 6x no cartão)
  //   anual:     link de cobrança PARCELADA (pagamento único, até 12x no cartão)
  pagamento: {
    inicial: {
      mensal: "https://www.asaas.com/c/cj94cnqxtxqt0zhf",
      semestral: "https://www.asaas.com/c/bqmqm5t11yifqfen",
      anual: "https://www.asaas.com/c/k7zjq9aadttmywj2",
    },
    agencia: {
      mensal: "https://www.asaas.com/c/pit8brwn9oc8dudh",
      semestral: "https://www.asaas.com/c/mop9q8u5agr764ik",
      anual: "https://www.asaas.com/c/6jv4nv941zjh7m9p",
    },
    carteira: {
      mensal: "https://www.asaas.com/c/l2xzjsvjv3kyvlg9",
      semestral: "https://www.asaas.com/c/g8pc7ai8uv8sz1eq",
      anual: "https://www.asaas.com/c/mdve2mptefbi5srb",
    },
  },
};
