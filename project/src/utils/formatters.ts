export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false // Désactive les séparateurs de milliers
  }).format(amount);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR', {
    useGrouping: false // Désactive les séparateurs de milliers
  }).format(number);
}