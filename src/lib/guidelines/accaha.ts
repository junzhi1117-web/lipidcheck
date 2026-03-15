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

  // 二級預防與明確高風險條件
  if (ascvd) {
    const hasResidualRisk = dm || ckd === 'G3a' || ckd === 'G3b' || ckd === 'G4' || ckd === 'G5' || fh
    riskLevel = 'very-high'
    ldlTarget = 70
    ldlTargetText = '< 70 mg/dL'
    notes = hasResidualRisk
      ? '屬二級預防且合併額外高風險條件。ACC/AHA 原始重點為高強度 statin 與 LDL ≥ 70 mg/dL 時考慮加藥，本工具以 LDL 目標做簡化呈現。'
      : '屬二級預防族群。ACC/AHA 原始重點為高強度 statin 與 LDL ≥ 70 mg/dL 時考慮加藥，本工具以 LDL 目標做簡化呈現。'
  } else if (ldl >= 190 || fh) {
    riskLevel = 'high'
    ldlTarget = 70
    ldlTargetText = '< 70 mg/dL'
    notes = '屬 severe hypercholesterolemia / FH 高風險族群。ACC/AHA 原始建議重點為高強度 statin 與後續 intensification，本工具以 LDL 目標做簡化呈現。'
  } else if (dm && age >= 40 && age <= 75) {
    riskLevel = 'high'
    ldlTarget = null
    ldlTargetText = '至少建議中等強度 statin；較高風險者考慮更積極降脂'
    notes = 'ACC/AHA 對糖尿病族群重點為 statin 強度與風險增強因子，不是所有人都有固定 LDL < 70 mg/dL 目標。'
  } else {
    // 需要 PCE 計算
    if (age >= 40 && age <= 79 && sbp > 0) {
      tenYearRisk = calcPCE(input)
      if (tenYearRisk >= 20) {
        riskLevel = 'high'
        ldlTarget = null
        ldlTargetText = '建議積極降 LDL-C（通常至少 50% 降幅）'
        notes = 'PCE 為初級預防風險評估工具；ACC/AHA 原始建議偏重 statin 強度與風險討論，而非固定 LDL 目標。'
      } else if (tenYearRisk >= 7.5) {
        riskLevel = 'high'
        ldlTarget = null
        ldlTargetText = '建議降低膽固醇 30–50%'
      } else if (tenYearRisk >= 5) {
        riskLevel = 'moderate'
        ldlTarget = null
        ldlTargetText = '可考慮降低膽固醇 30–50%（視整體風險）'
      } else {
        riskLevel = 'low'
        ldlTarget = null
        ldlTargetText = '以飲食運動調整為主'
      }
    } else {
      riskLevel = 'low'
      ldlTarget = null
      ldlTargetText = '以飲食運動調整為主（資料不足，無法精確計算）'
    }
  }

  return {
    guideline: 'accaha',
    riskLevel,
    ldlTarget,
    ldlTargetText,
    currentLdl: input.ldl,
    achieved: ldlTarget !== null ? input.ldl < ldlTarget : null,
    notes: notes ?? '注意：此風險計算以美國族群為基準，台灣用戶數值僅供參考',
    tenYearRisk,
  }
}
