export function calculateRICE(reach?: number, impact?: number, confidence?: number, effort?: number): number | null {
  if (reach == null || impact == null || confidence == null || effort == null || effort === 0) {
    return null
  }
  // Confidence is entered as percentage (0-100) or decimal (0-1). Normalize if > 1
  const conf = confidence > 1 ? confidence / 100 : confidence
  return Number(((reach * impact * conf) / effort).toFixed(2))
}

export function calculateICE(impact?: number, confidence?: number, ease?: number): number | null {
  if (impact == null || confidence == null || ease == null) {
    return null
  }
  return Number(((impact + confidence + ease) / 3).toFixed(2))
}

export interface UnitEconomicsInput {
  totalMarketingCost: number
  newCustomers: number
  arpu: number
  grossMarginPct: number // e.g. 80 for 80%
  churnRatePct: number // e.g. 5 for 5%
  mrr: number
}

export interface UnitEconomicsOutput {
  cac: number
  ltv: number
  ltvCacRatio: number
  paybackMonths: number
  arr: number
  retentionRatePct: number
  healthStatus: 'healthy' | 'warning' | 'critical'
}

export function calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsOutput {
  const { totalMarketingCost, newCustomers, arpu, grossMarginPct, churnRatePct, mrr } = input
  
  const cac = newCustomers > 0 ? Number((totalMarketingCost / newCustomers).toFixed(2)) : 0
  const gm = grossMarginPct / 100
  const churnDecimal = churnRatePct / 100

  // LTV = (ARPU * 12 * GrossMargin) / ChurnRate (annualized ARPU divided by churn) or ARPU * GM / Churn
  const monthlyGrossProfitPerUser = arpu * gm
  const customerLifespanMonths = churnDecimal > 0 ? 1 / churnDecimal : 24
  const ltv = Number((monthlyGrossProfitPerUser * customerLifespanMonths).toFixed(2))

  const ltvCacRatio = cac > 0 ? Number((ltv / cac).toFixed(2)) : 0
  const monthlyContributionPerUser = monthlyGrossProfitPerUser
  const paybackMonths = monthlyContributionPerUser > 0 ? Number((cac / monthlyContributionPerUser).toFixed(1)) : 0

  const arr = mrr * 12
  const retentionRatePct = Number((100 - churnRatePct).toFixed(1))

  let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
  if (ltvCacRatio < 1 || paybackMonths > 18) {
    healthStatus = 'critical'
  } else if (ltvCacRatio < 3 || paybackMonths > 12) {
    healthStatus = 'warning'
  }

  return {
    cac,
    ltv,
    ltvCacRatio,
    paybackMonths,
    arr,
    retentionRatePct,
    healthStatus
  }
}
