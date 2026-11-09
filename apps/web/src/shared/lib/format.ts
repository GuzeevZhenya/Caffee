/** Формат денег: в проекте цены хранятся в BYN (number, копейки через roundMoney) */
export function formatPrice(value: number): string {
  return `${value.toFixed(2)} BYN`;
}
