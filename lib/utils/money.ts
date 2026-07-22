/**
 * Multi-Currency formatting utility for Print_Flow.
 * Supports FCFA (default), Euro (€), US Dollar ($), Dirham Marocain (MAD), Franc Guinéen (GNF).
 */

export type CurrencyCode = 'FCFA' | 'EUR' | 'USD' | 'MAD' | 'GNF';

export interface CurrencyConfig {
  code: CurrencyCode;
  label: string;
  symbol: string;
  rateToFcfa: number;
  position: 'prefix' | 'suffix';
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  FCFA: { code: 'FCFA', label: 'FCFA (Afrique)', symbol: 'FCFA', rateToFcfa: 1, position: 'suffix' },
  EUR: { code: 'EUR', label: 'Euro (€)', symbol: '€', rateToFcfa: 0.001524, position: 'suffix' },
  USD: { code: 'USD', label: 'Dollar ($)', symbol: '$', rateToFcfa: 0.00165, position: 'prefix' },
  MAD: { code: 'MAD', label: 'Dirham (MAD)', symbol: 'MAD', rateToFcfa: 0.0165, position: 'suffix' },
  GNF: { code: 'GNF', label: 'Franc G. (GNF)', symbol: 'GNF', rateToFcfa: 14.2, position: 'suffix' }
};

let globalActiveCurrency: CurrencyCode = 'FCFA';

export function setActiveCurrency(code: CurrencyCode) {
  if (CURRENCIES[code]) {
    globalActiveCurrency = code;
  }
}

export function getActiveCurrency(): CurrencyCode {
  return globalActiveCurrency;
}

export function formatFCFA(amountInFcfa: number, forceCurrency?: CurrencyCode): string {
  const code = forceCurrency || globalActiveCurrency;
  const config = CURRENCIES[code] || CURRENCIES.FCFA;
  const converted = (amountInFcfa || 0) * config.rateToFcfa;

  const decimals = code === 'FCFA' || code === 'GNF' ? 0 : 2;
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(converted);

  if (config.position === 'prefix') {
    return `${config.symbol}${formatted}`;
  }
  return `${formatted} ${config.symbol}`;
}
