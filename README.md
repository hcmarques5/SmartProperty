# SmartProperty

ROI calculator for Portuguese real estate flips — Phase 1.

Computes all-in cost (purchase + IMT + IS + notary + renovation + holding + financing interest), net profit after agent fees and mais-valias tax, ROI on cash invested and annualized return.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3.4
- No backend yet — fully client-side

## Dev

```powershell
npm install
npm run dev
```

## Notes

PT tax brackets (IMT, mais-valias) are coded per the values current at project start and labelled in `src/lib/pt-tax.ts`. Verify yearly.
