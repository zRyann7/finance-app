// Mensagem para o usuário a partir de um erro do axios.
//   1) erro devolvido pela API (ex.: "Credenciais inválidas") sempre tem prioridade;
//   2) estouro de tempo: o servidor provavelmente ainda está acordando;
//   3) qualquer outra falha usa a mensagem padrão da tela.
export function describeRequestError(error, fallback) {
  const apiMessage = error?.response?.data?.error;
  if (apiMessage) return apiMessage;

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "O servidor demorou para responder. Aguarde alguns segundos e tente novamente.";
  }

  return fallback;
}
