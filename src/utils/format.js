/**
 * Utilitários de formatação compartilhados entre componentes e utils.
 */

/**
 * Formata valor para moeda BRL
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Formata data ISO para pt-BR (dd/mm/aaaa)
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr, { short = false } = {}) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: short ? '2-digit' : 'numeric',
  });
}
