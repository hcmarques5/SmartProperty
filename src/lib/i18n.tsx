"use client";

import * as React from "react";

export type Locale = "pt" | "en";

const STORAGE_KEY = "sp.locale";

const dict = {
  pt: {
    appTitle: "SmartProperty",
    appTagline: "Calculadora de ROI para imobiliário em Portugal",
    sectionPurchase: "Compra",
    sectionRenovation: "Obras",
    sectionHolding: "Custos de detenção",
    sectionFinancing: "Financiamento",
    sectionSale: "Venda",
    sectionTax: "Fiscal",
    purchasePrice: "Preço de compra",
    propertyType: "Tipo / destino",
    propertyType_secondary: "Habitação secundária / não permanente",
    propertyType_permanent: "Habitação própria permanente",
    propertyType_other: "Outros prédios urbanos",
    region: "Região",
    region_continente: "Continente",
    region_madeira: "Madeira",
    region_acores: "Açores",
    notary: "Escritura + registo",
    renoArea: "Área (m²)",
    renoPerSqm: "Custo de obra (€/m²)",
    renoLump: "Ou montante fixo (€)",
    holdingMonths: "Meses até à venda",
    imiAnnualPct: "IMI (% anual sobre VPT)",
    vpt: "VPT estimado",
    condo: "Condomínio (€/mês)",
    utilities: "Água/luz/seguro (€/mês)",
    downPaymentPct: "Entrada (%)",
    mortgageRate: "Taxa de juro (% anual)",
    mortgageTermYears: "Prazo (anos)",
    salePrice: "Preço de venda",
    agentFeePct: "Comissão imobiliária (%)",
    agentFeeIvaIncl: "IVA 23% incluído na comissão",
    maisValiasMode: "Regime de mais-valias",
    maisValias_50_irs: "Englobamento (50% × taxa IRS marginal)",
    maisValias_28: "Taxa autónoma 28%",
    irsMarginalPct: "Taxa marginal IRS (%)",
    summary: "Resumo",
    allInCost: "Custo total",
    cashInvested: "Capital próprio investido",
    netSaleProceeds: "Encaixe líquido na venda",
    netProfit: "Lucro líquido",
    roi: "ROI sobre capital próprio",
    annualized: "Retorno anualizado",
    breakEven: "Preço de venda break-even",
    cost_purchase: "Preço de compra",
    cost_imt: "IMT",
    cost_is: "Imposto de Selo",
    cost_notary: "Escritura + registo",
    cost_reno: "Obras",
    cost_imi: "IMI",
    cost_condo: "Condomínio",
    cost_utilities: "Utilities",
    cost_interest: "Juros do empréstimo",
    cost_agent: "Comissão imobiliária",
    cost_capgains: "Mais-valias",
    sensitivity: "Sensibilidade — ROI",
    renoVar: "Custo obra",
    saleVar: "Preço venda",
    flipWarning: "Atenção: revenda frequente pode ser tributada como atividade Cat. B do IRS, não como mais-valia. Confirme com contabilista.",
    verifyTax: "Valores fiscais (IMT, IS, mais-valias) baseiam-se nas regras vigentes na data de criação. Confirme anualmente.",
    languageToggle: "EN",
  },
  en: {
    appTitle: "SmartProperty",
    appTagline: "ROI calculator for Portuguese real estate",
    sectionPurchase: "Purchase",
    sectionRenovation: "Renovation",
    sectionHolding: "Holding costs",
    sectionFinancing: "Financing",
    sectionSale: "Sale",
    sectionTax: "Tax",
    purchasePrice: "Purchase price",
    propertyType: "Type / use",
    propertyType_secondary: "Secondary / non-primary residence",
    propertyType_permanent: "Permanent primary residence",
    propertyType_other: "Other urban property",
    region: "Region",
    region_continente: "Mainland",
    region_madeira: "Madeira",
    region_acores: "Azores",
    notary: "Notary + registry",
    renoArea: "Area (m²)",
    renoPerSqm: "Reno cost (€/m²)",
    renoLump: "Or lump sum (€)",
    holdingMonths: "Months until sale",
    imiAnnualPct: "IMI (annual % of VPT)",
    vpt: "Estimated VPT",
    condo: "HOA / condo (€/mo)",
    utilities: "Utilities + insurance (€/mo)",
    downPaymentPct: "Down payment (%)",
    mortgageRate: "Mortgage rate (% APR)",
    mortgageTermYears: "Term (years)",
    salePrice: "Sale price",
    agentFeePct: "Agent fee (%)",
    agentFeeIvaIncl: "Includes 23% VAT",
    maisValiasMode: "Capital gains regime",
    maisValias_50_irs: "Englobamento (50% × marginal IRS)",
    maisValias_28: "Flat 28% autonomous",
    irsMarginalPct: "Marginal IRS rate (%)",
    summary: "Summary",
    allInCost: "All-in cost",
    cashInvested: "Cash invested",
    netSaleProceeds: "Net sale proceeds",
    netProfit: "Net profit",
    roi: "ROI on cash invested",
    annualized: "Annualized return",
    breakEven: "Break-even sale price",
    cost_purchase: "Purchase price",
    cost_imt: "IMT",
    cost_is: "Stamp duty",
    cost_notary: "Notary + registry",
    cost_reno: "Renovation",
    cost_imi: "IMI",
    cost_condo: "Condo / HOA",
    cost_utilities: "Utilities",
    cost_interest: "Mortgage interest",
    cost_agent: "Agent fee",
    cost_capgains: "Capital gains tax",
    sensitivity: "Sensitivity — ROI",
    renoVar: "Reno cost",
    saleVar: "Sale price",
    flipWarning: "Warning: frequent flips may be taxed as IRS Cat. B business activity, not capital gains. Check with accountant.",
    verifyTax: "Tax values (IMT, IS, capital gains) reflect rules at project creation. Verify yearly.",
    languageToggle: "PT",
  },
} as const;

export type DictKey = keyof typeof dict.pt;

const I18nCtx = React.createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: DictKey) => string;
}>({ locale: "pt", setLocale: () => {}, t: (k) => dict.pt[k] });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("pt");

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "pt" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = React.useCallback((k: DictKey) => dict[locale][k], [locale]);

  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return React.useContext(I18nCtx);
}
