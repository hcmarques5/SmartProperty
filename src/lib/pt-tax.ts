// PT real-estate tax helpers — values current as of 2025/early 2026.
// VERIFY YEARLY (Lei do Orçamento do Estado).

export type PropertyType = "secondary" | "permanent" | "other";
export type Region = "continente" | "madeira" | "acores";

export type ImtBracket = { upTo: number; rate: number; abatement: number; single?: boolean };

// Continente — habitação SECUNDÁRIA / não permanente (urbano destinado a habitação)
// Source: Código do IMT, art. 17.º (valores 2025).
export const IMT_BRACKETS_CONTINENTE_SECONDARY: ImtBracket[] = [
  { upTo: 104_261, rate: 0.01, abatement: 0 },
  { upTo: 142_618, rate: 0.02, abatement: 1_042.61 },
  { upTo: 194_458, rate: 0.05, abatement: 5_321.15 },
  { upTo: 324_058, rate: 0.07, abatement: 9_210.31 },
  { upTo: 621_501, rate: 0.08, abatement: 12_450.89 },
  { upTo: 1_128_287, rate: 0.06, abatement: 0, single: true },
  { upTo: Infinity, rate: 0.075, abatement: 0, single: true },
];

// Continente — habitação PRÓPRIA PERMANENTE
export const IMT_BRACKETS_CONTINENTE_PERMANENT: ImtBracket[] = [
  { upTo: 104_261, rate: 0, abatement: 0 },
  { upTo: 142_618, rate: 0.02, abatement: 2_085.22 },
  { upTo: 194_458, rate: 0.05, abatement: 6_363.77 },
  { upTo: 324_058, rate: 0.07, abatement: 10_252.93 },
  { upTo: 621_501, rate: 0.08, abatement: 13_493.51 },
  { upTo: 1_128_287, rate: 0.06, abatement: 0, single: true },
  { upTo: Infinity, rate: 0.075, abatement: 0, single: true },
];

export function computeIMT(price: number, type: PropertyType, _region: Region): number {
  if (price <= 0) return 0;
  if (type === "other") {
    // Outros prédios urbanos (não habitacionais): 6.5%
    return price * 0.065;
  }
  const brackets =
    type === "permanent" ? IMT_BRACKETS_CONTINENTE_PERMANENT : IMT_BRACKETS_CONTINENTE_SECONDARY;
  for (const b of brackets) {
    if (price <= b.upTo) {
      if (b.single) return price * b.rate;
      return Math.max(0, price * b.rate - b.abatement);
    }
  }
  return 0;
}

// Imposto de Selo on real-estate purchase: 0.8% of price.
export const STAMP_DUTY_PURCHASE_RATE = 0.008;

export function computeStampDutyPurchase(price: number): number {
  return Math.max(0, price) * STAMP_DUTY_PURCHASE_RATE;
}

// IVA standard rate
export const IVA_STANDARD = 0.23;

// ---------------- Mortgage ----------------
// Returns total interest paid over `months` of a French-amortization loan.
export function totalInterestPaid(principal: number, annualRatePct: number, termYears: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  const m = Math.min(months, n);
  if (r === 0) return 0;
  const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
  let bal = principal;
  let interest = 0;
  for (let i = 0; i < m; i++) {
    const intPart = bal * r;
    interest += intPart;
    bal -= pmt - intPart;
  }
  return interest;
}

// ---------------- Capital gains (mais-valias) ----------------
// For individuals selling non-permanent residence (typical flip):
//   Option A — englobamento: 50% of gain × marginal IRS rate
//   Option B — autonomous flat 28%
// Reinvestment exemption only applies to permanent residence — not modelled here.
export type CapGainsMode = "englobamento_50_irs" | "flat_28";

export function computeCapGainsTax(gain: number, mode: CapGainsMode, irsMarginalPct: number): number {
  if (gain <= 0) return 0;
  if (mode === "flat_28") return gain * 0.28;
  return gain * 0.5 * (irsMarginalPct / 100);
}
