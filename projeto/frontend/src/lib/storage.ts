const TOTAL_FASES = 4;

export function limparRespostasSalvas() {
  for (let faseId = 1; faseId <= TOTAL_FASES; faseId++) {
    localStorage.removeItem(`sql_rascunho_fase_${faseId}`);
    localStorage.removeItem(`sql_correto_fase_${faseId}`);
  }
}
