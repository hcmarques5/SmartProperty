"use client";

import * as React from "react";
import { Home, Languages } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SuiteSwitcher } from "@/components/suite-switcher";
import { useI18n, type DictKey } from "@/lib/i18n";
import { compute, sensitivity, type RoiInputs } from "@/lib/roi";
import type { CapGainsMode, PropertyType, Region } from "@/lib/pt-tax";
import { cn, formatEUR, formatPct } from "@/lib/utils";

const DEFAULTS: RoiInputs = {
  purchasePrice: 250_000,
  propertyType: "secondary",
  region: "continente",
  notary: 1_000,
  renoArea: 90,
  renoPerSqm: 600,
  renoLump: 0,
  holdingMonths: 9,
  vpt: 80_000,
  imiAnnualPct: 0.4,
  condoMonthly: 40,
  utilitiesMonthly: 60,
  downPaymentPct: 30,
  mortgageRatePct: 4.0,
  mortgageTermYears: 30,
  salePrice: 360_000,
  agentFeePct: 5,
  agentFeeIvaIncluded: false,
  capGainsMode: "flat_28",
  irsMarginalPct: 35,
};

function useNumberField(value: number, set: (n: number) => void) {
  return {
    value: Number.isFinite(value) ? String(value) : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(",", ".");
      const n = v === "" ? 0 : Number(v);
      set(Number.isFinite(n) ? n : 0);
    },
  };
}

export default function Page() {
  const { t, locale, setLocale } = useI18n();
  const [inputs, setInputs] = React.useState<RoiInputs>(DEFAULTS);

  const update = <K extends keyof RoiInputs>(key: K, value: RoiInputs[K]) =>
    setInputs((s) => ({ ...s, [key]: value }));

  const result = React.useMemo(() => compute(inputs), [inputs]);
  const grid = React.useMemo(() => sensitivity(inputs), [inputs]);

  const profitPositive = result.netProfit >= 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/15 p-3">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">{t("appTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("appTagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SuiteSwitcher current="property" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "pt" ? "en" : "pt")}
          >
            <Languages className="h-4 w-4" />
            {t("languageToggle")}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* LEFT: form */}
        <div className="space-y-6">
          {/* Purchase */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionPurchase")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("purchasePrice")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.purchasePrice, (n) => update("purchasePrice", n))} />
              </Field>
              <Field label={t("propertyType")}>
                <SelectField
                  value={inputs.propertyType}
                  onChange={(v) => update("propertyType", v as PropertyType)}
                  options={[
                    { value: "secondary", label: t("propertyType_secondary") },
                    { value: "permanent", label: t("propertyType_permanent") },
                    { value: "other", label: t("propertyType_other") },
                  ]}
                />
              </Field>
              <Field label={t("region")}>
                <SelectField
                  value={inputs.region}
                  onChange={(v) => update("region", v as Region)}
                  options={[
                    { value: "continente", label: t("region_continente") },
                    { value: "madeira", label: t("region_madeira") },
                    { value: "acores", label: t("region_acores") },
                  ]}
                />
              </Field>
              <Field label={t("notary")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.notary, (n) => update("notary", n))} />
              </Field>
            </CardContent>
          </Card>

          {/* Reno */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionRenovation")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={t("renoArea")} suffix="m²">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.renoArea, (n) => update("renoArea", n))} />
              </Field>
              <Field label={t("renoPerSqm")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.renoPerSqm, (n) => update("renoPerSqm", n))} />
              </Field>
              <Field label={t("renoLump")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.renoLump, (n) => update("renoLump", n))} />
              </Field>
            </CardContent>
          </Card>

          {/* Holding */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionHolding")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("holdingMonths")}>
                <Input type="number" inputMode="numeric" {...useNumberField(inputs.holdingMonths, (n) => update("holdingMonths", n))} />
              </Field>
              <Field label={t("vpt")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.vpt, (n) => update("vpt", n))} />
              </Field>
              <Field label={t("imiAnnualPct")} suffix="%">
                <Input type="number" inputMode="decimal" step="0.05" {...useNumberField(inputs.imiAnnualPct, (n) => update("imiAnnualPct", n))} />
              </Field>
              <Field label={t("condo")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.condoMonthly, (n) => update("condoMonthly", n))} />
              </Field>
              <Field label={t("utilities")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.utilitiesMonthly, (n) => update("utilitiesMonthly", n))} />
              </Field>
            </CardContent>
          </Card>

          {/* Financing */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionFinancing")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={t("downPaymentPct")} suffix="%">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.downPaymentPct, (n) => update("downPaymentPct", n))} />
              </Field>
              <Field label={t("mortgageRate")} suffix="%">
                <Input type="number" inputMode="decimal" step="0.05" {...useNumberField(inputs.mortgageRatePct, (n) => update("mortgageRatePct", n))} />
              </Field>
              <Field label={t("mortgageTermYears")}>
                <Input type="number" inputMode="numeric" {...useNumberField(inputs.mortgageTermYears, (n) => update("mortgageTermYears", n))} />
              </Field>
            </CardContent>
          </Card>

          {/* Sale */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionSale")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("salePrice")} suffix="€">
                <Input type="number" inputMode="decimal" {...useNumberField(inputs.salePrice, (n) => update("salePrice", n))} />
              </Field>
              <Field label={t("agentFeePct")} suffix="%">
                <Input type="number" inputMode="decimal" step="0.1" {...useNumberField(inputs.agentFeePct, (n) => update("agentFeePct", n))} />
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={inputs.agentFeeIvaIncluded}
                  onChange={(e) => update("agentFeeIvaIncluded", e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                {t("agentFeeIvaIncl")}
              </label>
            </CardContent>
          </Card>

          {/* Tax */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sectionTax")}</CardTitle>
              <CardDescription>{t("verifyTax")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("maisValiasMode")}>
                <SelectField
                  value={inputs.capGainsMode}
                  onChange={(v) => update("capGainsMode", v as CapGainsMode)}
                  options={[
                    { value: "flat_28", label: t("maisValias_28") },
                    { value: "englobamento_50_irs", label: t("maisValias_50_irs") },
                  ]}
                />
              </Field>
              <Field label={t("irsMarginalPct")} suffix="%">
                <Input
                  type="number"
                  inputMode="decimal"
                  disabled={inputs.capGainsMode !== "englobamento_50_irs"}
                  {...useNumberField(inputs.irsMarginalPct, (n) => update("irsMarginalPct", n))}
                />
              </Field>
              <p className="sm:col-span-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                {t("flipWarning")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: summary */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className={cn("border-2", profitPositive ? "border-success/50" : "border-destructive/50")}>
            <CardHeader>
              <CardTitle>{t("summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Stat label={t("allInCost")} value={formatEUR(result.allInCost)} />
              <Stat label={t("cashInvested")} value={formatEUR(result.cashInvested)} />
              <Stat label={t("netSaleProceeds")} value={formatEUR(result.netSaleProceeds)} />
              <div className="border-t pt-3">
                <Stat
                  label={t("netProfit")}
                  value={formatEUR(result.netProfit)}
                  emphasis={profitPositive ? "good" : "bad"}
                />
                <Stat
                  label={t("roi")}
                  value={formatPct(result.roi)}
                  emphasis={profitPositive ? "good" : "bad"}
                />
                <Stat label={t("annualized")} value={formatPct(result.annualizedRoi)} />
                <Stat label={t("breakEven")} value={formatEUR(result.breakEvenSalePrice)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <Row k={t("cost_purchase")} v={formatEUR(inputs.purchasePrice)} />
              <Row k={t("cost_imt")} v={formatEUR(result.imt)} />
              <Row k={t("cost_is")} v={formatEUR(result.stampDuty)} />
              <Row k={t("cost_notary")} v={formatEUR(result.notary)} />
              <Row k={t("cost_reno")} v={formatEUR(result.reno)} />
              <Row k={t("cost_imi")} v={formatEUR(result.imi)} />
              <Row k={t("cost_condo")} v={formatEUR(result.condo)} />
              <Row k={t("cost_utilities")} v={formatEUR(result.utilities)} />
              <Row k={t("cost_interest")} v={formatEUR(result.mortgageInterest)} />
              <Row k={t("cost_agent")} v={formatEUR(result.agentFee)} />
              <Row k={t("cost_capgains")} v={formatEUR(result.capGainsTax)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sensitivity grid */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("sensitivity")}</CardTitle>
          <CardDescription>
            {t("renoVar")} ↕ × {t("saleVar")} ↔
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SensitivityTable cells={grid} renoLabel={t("renoVar")} saleLabel={t("saleVar")} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Field({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </Label>
      {children}
    </div>
  );
}

function SelectField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "good" | "bad";
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums",
          emphasis === "good" && "text-success",
          emphasis === "bad" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}

function SensitivityTable({
  cells,
  renoLabel,
  saleLabel,
}: {
  cells: { renoDelta: number; saleDelta: number; roi: number }[];
  renoLabel: string;
  saleLabel: string;
}) {
  const renoDeltas = Array.from(new Set(cells.map((c) => c.renoDelta))).sort((a, b) => a - b);
  const saleDeltas = Array.from(new Set(cells.map((c) => c.saleDelta))).sort((a, b) => a - b);
  const lookup = new Map(cells.map((c) => [`${c.renoDelta}|${c.saleDelta}`, c.roi]));
  const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${(n * 100).toFixed(0)}%`;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-center text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-xs font-medium text-muted-foreground">
              {renoLabel} ↓ / {saleLabel} →
            </th>
            {saleDeltas.map((s) => (
              <th key={s} className="p-2 text-xs font-medium text-muted-foreground">
                {fmtPct(s)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renoDeltas.map((r) => (
            <tr key={r}>
              <th className="p-2 text-left text-xs font-medium text-muted-foreground">{fmtPct(r)}</th>
              {saleDeltas.map((s) => {
                const v = lookup.get(`${r}|${s}`) ?? 0;
                return (
                  <td
                    key={s}
                    className={cn(
                      "p-2 tabular-nums",
                      v >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatPct(v, 0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
