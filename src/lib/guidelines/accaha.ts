import type { UserInput, GuidelineResult, RiskLevel } from '../../types'

// Pooled Cohort Equations (Goff et al. 2014, ACC/AHA)
// 使用 White 族群係數；亞裔用戶標注免責聲明
function calcPCE(input: UserInput): number {
  const { age, sex, tc, hdl, sbp, onBpMeds, smoker, dm } = input
  const lnAge = Math.log(age)
  const lnTc = Math.log(tc)
  const lnHdl = Math.log(hdl)
  const lnSbp = Math.log(sbp)

  let sum: number
  let baselineSurvival: number
  let mean: number

  if (sex === 'female') {
    // White Women
    sum =
      -29.799 * lnAge +
      4.884 * lnAge * lnAge +
      13.540 * lnTc +
      -3.114 * lnAge * lnTc +
      -13.578 * lnHdl +
      3.149 * lnAge * lnHdl +
      (onBpMeds ? 2.019 : 1.957) * lnSbp +
      (smoker ? 7.574 : 0) +
      (smoker ? -1.665 * lnAge : 0) +
      (dm ? 0.661 : 0)
    baselineSurvival = 0.9665
    mean = -29.799
  } else {
    // White Men
    sum =
      12.344 * lnAge +
      11.853 * lnTc +
      -2.664 * lnAge * lnTc +
      -7.990 * lnHdl +
      1.769 * lnAge * lnHdl +
      (onBpMeds ? 1.797 : 1.764) * lnSbp +
      (smoker ? 7.837 : 0) +
      (smoker ? -1.795 * lnAge : 0) +
      (dm ? 0.658 : 0)
    baselineSurvival = 0.9144
    mean = 61.18
  }

  const risk = 1 - Math.pow(baselineSurvival, Math.exp(sum - mean))
  return Math.round(Math.min(Math.max(risk * 100, 0.1), 99.9) * 10) / 10
}

export function calcAccAha(input: UserInput): GuidelineResult {
  const { age, ldl, ascvd, dm, ckd, fh, sbp } = input

  let riskLevel: RiskLevel
  let ldlTarget: number | null
  let ldlTargetText: string
  let notes: string | undefined
  let tenYearRisk: number | undefined

  // 直接高/極高風險條件（不需 PCE）
  if (ascvd) {
    // 極高風險：ASCVD + 殘餘高風險因子
    const hasResidualRisk = dm || ckd !== 'none' || fh || ldl >= 100
    if (hasResidualRisk) {
      riskLevel = 'extreme'
      ldlTarget = 55
      ldlTargetText = '< 55 mg/dL（LDL 55-69 建議強化治療）'
      notes = '2025 ACC/AHA ACS 更新：極高風險者 LDL-C < 55 mg/dL 為合理目標'
    } else {
      riskLevel = 'very-high'
      ldlTarget = 70
      ldlTargetText = '< 70 mg/dL'
    }
  } else if (ldl >= 190 || fh) {
    riskLevel = 'high'
    ldlTarget = 70
    ldlTargetText = '< 70 mg/dL'
    notes = 'LDL ≥ 190 mg/dL 或家族性高膽固醇血症，建議高強度 statin'
  } else if (dm && age >= 40 && age <= 75) {
    riskLevel = 'high'
    ldlTarget = 70
    ldlTargetText = '< 70 mg/dL'
  } else {
    // 需要 PCE 計算
    if (age >= 40 && age <= 79 && sbp > 0) {
      tenYearRisk = calcPCE(input)
      if (tenYearRisk >= 20) {
        riskLevel = 'very-high'
        ldlTarget = 70
        ldlTargetText = '< 70 mg/dL（建議高強度 statin）'
        notes = '殘餘風險管理：LDL 達標後建議 non-HDL-C < 100 mg/dL、TG < 150 mg/dL'
      } else if (tenYearRisk >= 7.5) {
        riskLevel = 'high'
        ldlTarget = null
        ldlTargetText = '建議降低 LDL ≥ 30–50%'
      } else if (tenYearRisk >= 5) {
        riskLevel = 'moderate'
        ldlTarget = null
        ldlTargetText = '可考慮降低 LDL 30–50%（視風險增強因子）'
      } else {
        riskLevel = 'low'
        ldlTarget = null
        ldlTargetText = '生活型態介入為主'
      }
    } else {
      riskLevel = 'low'
      ldlTarget = null
      ldlTargetText = '生活型態介入（年齡或資料不足以計算 PCE）'
    }
  }

  return {
    guideline: 'accaha',
    riskLevel,
    ldlTarget,
    ldlTargetText,
    currentLdl: input.ldl,
    achieved: ldlTarget !== null ? input.ldl < ldlTarget : null,
    notes: notes ?? '注意：PCE 係數基於美國白人族群，亞裔實際風險可能低估，僅供參考',
    tenYearRisk,
  }
}
