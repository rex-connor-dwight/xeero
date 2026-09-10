export const CURRENCIES = [
  { code: "USD", label: "USD ($)", symbol: "$" },
  { code: "NGN", label: "NGN (₦)", symbol: "₦" },
  { code: "GHS", label: "GHS (₵)", symbol: "₵" },
  { code: "KES", label: "KES (KSh)", symbol: "KSh" },
  { code: "ZAR", label: "ZAR (R)", symbol: "R" },
  { code: "GBP", label: "GBP (£)", symbol: "£" },
  { code: "EUR", label: "EUR (€)", symbol: "€" },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code;
}