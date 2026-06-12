const CURRENCY_MAP: Record<string, { symbol: string; flag: string; name: string }> = {
  USD: { symbol: "$", flag: "us", name: "US Dollar" },
  NGN: { symbol: "₦", flag: "ng", name: "Nigerian Naira" },
  GBP: { symbol: "£", flag: "gb", name: "British Pound" },
  EUR: { symbol: "€", flag: "eu", name: "Euro" },
  CAD: { symbol: "$", flag: "ca", name: "Canadian Dollar" },
  AUD: { symbol: "$", flag: "au", name: "Australian Dollar" },
  BRL: { symbol: "R$", flag: "br", name: "Brazilian Real" },
};

export function getCurrencySymbol(code?: string): string {
  if (!code) return "₦";
  return CURRENCY_MAP[code.toUpperCase()]?.symbol ?? `${code} `;
}

export function getCurrencyFlag(code?: string): string {
  if (!code) return "us";
  return CURRENCY_MAP[code.toUpperCase()]?.flag ?? "us";
}

export { CURRENCY_MAP };
