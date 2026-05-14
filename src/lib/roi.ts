import {
  computeIMT,
  computeStampDutyPurchase,
  computeCapGainsTax,
  totalInterestPaid,
  IVA_STANDARD,
  type CapGainsMode,
  type PropertyType,
  type Region,
} from "./pt-tax";

export interface RoiInputs {
  // Purchase
  purchasePrice: number;
  propertyType: PropertyType;
  region: Region;
  notary: number; // escritura + registo

  // Renovation
  renoArea: number;
  renoPerSqm: number;
  renoLump: number; // if > 0, overrides area×perSqm

  // Holding
  holdingMonths: number;
  vpt: number; // for IMI
  imiAnnualPct: number; // e.g. 0.4
  condoMonthly: number;
  utilitiesMonthly: number;

  // Financing
  downPaymentPct: number; // e.g. 30
  mortgageRatePct: number; // e.g. 4.0
  mortgageTermYears: number;

  // Sale
  salePrice: number;
  agentFeePct: number; // e.g. 5
  agentFeeIvaIncluded: boolean;

  // Capital gains
  capGainsMode: CapGainsMode;
  irsMarginalPct: number; // e.g. 35
}

export interface RoiBreakdown {
  // Cost components
  imt: number;
  stampDuty: number;
  notary: number;
  reno: number;
  imi: number;
  condo: number;
  utilities: number;
  mortgageInterest: number;
  agentFee: number;
  capGainsTax: number;

  // Aggregates
  acquisitionTotal: number; // price + IMT + IS + notary
  renoTotal: number;
  holdingTotal: number; // IMI + condo + utilities + interest
  saleCosts: number; // agent fee + cap gains tax
  allInCost: number;

  // Financing
  loanAmount: number;
  cashInvested: number; // down payment + reno (assumed cash) + acq taxes (assumed cash)

  // Result
  netSaleProceeds: number; // sale - agent fee - loan payoff (using interest-only proxy: principal returned at sale)
  netProfit: number;
  roi: number; // fraction
  annualizedRoi: number; // fraction
  breakEvenSalePrice: number; // sale price where netProfit = 0
}

function renoCost(i: RoiInputs): number {
  if (i.renoLump > 0) return i.renoLump;
  return Math.max(0, i.renoArea) * Math.max(0, i.renoPerSqm);
}

export function compute(i: RoiInputs): RoiBreakdown {
  const imt = computeIMT(i.purchasePrice, i.propertyType, i.region);
  const stampDuty = computeStampDutyPurchase(i.purchasePrice);
  const notary = Math.max(0, i.notary);
  const reno = renoCost(i);

  // Holding
  const months = Math.max(0, i.holdingMonths);
  const years = months / 12;
  const imi = Math.max(0, i.vpt) * (i.imiAnnualPct / 100) * years;
  const condo = Math.max(0, i.condoMonthly) * months;
  const utilities = Math.max(0, i.utilitiesMonthly) * months;

  // Financing
  const dpFrac = Math.max(0, Math.min(100, i.downPaymentPct)) / 100;
  const downPayment = i.purchasePrice * dpFrac;
  const loanAmount = Math.max(0, i.purchasePrice - downPayment);
  const mortgageInterest = totalInterestPaid(loanAmount, i.mortgageRatePct, i.mortgageTermYears, months);

  // Sale costs
  const agentFeeRate = (Math.max(0, i.agentFeePct) / 100) * (i.agentFeeIvaIncluded ? 1 : 1 + IVA_STANDARD);
  const agentFee = Math.max(0, i.salePrice) * agentFeeRate;

  // Capital gain (PT: gain = sale - acq value - documented improvements - sale/acq costs)
  // Acquisition value for tax = purchasePrice + IMT + IS + notary (escritura)
  // Add reno (only if documented with VAT invoices — assumed yes here).
  const acqValueForTax = i.purchasePrice + imt + stampDuty + notary;
  const grossGain = i.salePrice - acqValueForTax - reno - agentFee;
  const capGainsTax = computeCapGainsTax(grossGain, i.capGainsMode, i.irsMarginalPct);

  const acquisitionTotal = i.purchasePrice + imt + stampDuty + notary;
  const holdingTotal = imi + condo + utilities + mortgageInterest;
  const saleCosts = agentFee + capGainsTax;
  const allInCost = acquisitionTotal + reno + holdingTotal + saleCosts;

  // Cash invested: down payment + acq taxes + reno + holding cash outflows (we treat all as cash from owner)
  const cashInvested = downPayment + imt + stampDuty + notary + reno + imi + condo + utilities + mortgageInterest;

  // Net sale proceeds: sale - agent fee - cap gains tax - loan payoff (principal repaid at sale)
  const netSaleProceeds = i.salePrice - agentFee - capGainsTax - loanAmount;
  const netProfit = netSaleProceeds - cashInvested;

  const roi = cashInvested > 0 ? netProfit / cashInvested : 0;
  const annualizedRoi = years > 0 && cashInvested > 0
    ? Math.pow(1 + roi, 1 / years) - 1
    : 0;

  // Break-even sale price: solve for S such that netProfit = 0.
  // Costs that depend on S: agentFee = S * agentFeeRate, capGainsTax depends on (S - acq - reno - agentFee)
  // Set netProfit = 0 → S - S*r - tax(S) - loanAmount - cashInvested_excluding_capgains = 0.
  // We'll just numerically search.
  const targetCash = cashInvested - capGainsTax; // exclude cap gains, recompute per S
  const breakEvenSalePrice = solveBreakEven({
    targetCash,
    loanAmount,
    agentFeeRate,
    acqValueForTax,
    reno,
    capGainsMode: i.capGainsMode,
    irsMarginalPct: i.irsMarginalPct,
  });

  return {
    imt,
    stampDuty,
    notary,
    reno,
    imi,
    condo,
    utilities,
    mortgageInterest,
    agentFee,
    capGainsTax,
    acquisitionTotal,
    renoTotal: reno,
    holdingTotal,
    saleCosts,
    allInCost,
    loanAmount,
    cashInvested,
    netSaleProceeds,
    netProfit,
    roi,
    annualizedRoi,
    breakEvenSalePrice,
  };
}

function solveBreakEven(p: {
  targetCash: number;
  loanAmount: number;
  agentFeeRate: number;
  acqValueForTax: number;
  reno: number;
  capGainsMode: CapGainsMode;
  irsMarginalPct: number;
}): number {
  // f(S) = S - S*r - tax(S) - loanAmount - targetCash
  // tax(S) = max(0, S - acqValueForTax - reno - S*r) * factor
  const factor = p.capGainsMode === "flat_28" ? 0.28 : 0.5 * (p.irsMarginalPct / 100);
  const r = p.agentFeeRate;

  // Closed form when gain > 0: f(S) = S(1 - r) - factor*(S(1 - r) - acq - reno) - loan - cash
  // = S(1 - r)(1 - factor) + factor*(acq+reno) - loan - cash
  // Solve = 0 → S = (loan + cash - factor*(acq+reno)) / ((1 - r)(1 - factor))
  const denom = (1 - r) * (1 - factor);
  if (denom <= 0) return Infinity;
  const sPositiveGain = (p.loanAmount + p.targetCash - factor * (p.acqValueForTax + p.reno)) / denom;
  // Check whether at sPositiveGain the gain is positive
  const gainAtS = sPositiveGain * (1 - r) - p.acqValueForTax - p.reno;
  if (gainAtS >= 0) return sPositiveGain;
  // Otherwise no tax: S(1 - r) - loan - cash = 0
  return (p.loanAmount + p.targetCash) / (1 - r);
}

export interface SensitivityCell {
  renoDelta: number;
  saleDelta: number;
  roi: number;
}

export function sensitivity(i: RoiInputs): SensitivityCell[] {
  const renoDeltas = [-0.2, -0.1, 0, 0.1, 0.2];
  const saleDeltas = [-0.2, -0.1, 0, 0.1, 0.2];
  const baseReno = i.renoLump > 0 ? i.renoLump : i.renoArea * i.renoPerSqm;
  const out: SensitivityCell[] = [];
  for (const rd of renoDeltas) {
    for (const sd of saleDeltas) {
      const adj: RoiInputs = {
        ...i,
        renoLump: baseReno * (1 + rd),
        renoArea: 0,
        renoPerSqm: 0,
        salePrice: i.salePrice * (1 + sd),
      };
      out.push({ renoDelta: rd, saleDelta: sd, roi: compute(adj).roi });
    }
  }
  return out;
}
