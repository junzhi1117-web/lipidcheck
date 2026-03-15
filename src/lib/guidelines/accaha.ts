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
  let ldlTarget: number | null = null
  let ldlTargetText: string
  let notes: string | undefined
  let tenYearRisk: number | undefined
  let pathway: string | undefined
  let ldlReductionPercentMin: number | undefined
  let ldlReductionPercentMax: number | undefined

  const hasRiskEnhancer = fh || ckd === 'G3a' || ckd === 'G3b' || ckd === 'G4' || ckd === 'G5' || input.tg >= 175

  if (ascvd) {
    pathway = 'secondary-prevention'
    riskLevel = 'very-high'
    ldlTargetText = '高強度 statin；LDL-C 建議至少降低 50%'
    ldlReductionPercentMin = 50
    ldlReductionPercentMax = 50
    notes = '屬二級預防。ACC/AHA 重點是高強度或最大可耐受 statin，優先看 LDL 降幅（≥50%）；不是所有 ASCVD 都有固定 LDL < 70 mg/dL 目標。'
  } else if (age >= 20 && age <= 75 && ldl >= 190) {
    pathway = 'severe-hypercholesterolemia'
    riskLevel = 'high'
    ldlTargetText = '最大可耐受 statin；LDL-C 建議至少降低 50%'
    ldlReductionPercentMin = 50
    ldlReductionPercentMax = 50
    notes = fh
      ? '屬 severe hypercholesterolemia / FH 情境。ACC/AHA 重點是最大可耐受 statin、LDL 至少降低 50%；若治療後 LDL 仍 ≥ 100 mg/dL，可考慮加藥。'
      : '屬 severe hypercholesterolemia。ACC/AHA 重點是最大可耐受 statin、LDL 至少降低 50%；若治療後 LDL 仍 ≥ 100 mg/dL，可考慮加藥。'
  } else if (dm && age >= 40 && age <= 75 && ldl >= 70 && ldl <= 189) {
    pathway = 'diabetes-primary-prevention'
    const higherRiskDiabetes = age >= 50 || hasRiskEnhancer
    riskLevel = higherRiskDiabetes ? 'high' : 'moderate'
    ldlTargetText = higherRiskDiabetes
      ? '至少中高強度 statin；LDL-C 可考慮降低約 50%'
      : '至少中等強度 statin；LDL-C 建議降低 30–49%'
    ldlReductionPercentMin = higherRiskDiabetes ? 50 : 30
    ldlReductionPercentMax = higherRiskDiabetes ? 50 : 49
    notes = higherRiskDiabetes
      ? '糖尿病 40–75 歲且風險較高時，可考慮高強度 statin。ACC/AHA 對此族群重點是 statin 強度與 LDL 降幅，不是固定 LDL < 70 mg/dL。'
      : '糖尿病 40–75 歲族群，ACC/AHA 建議至少中等強度 statin；重點是 LDL 降幅，不是固定 LDL < 70 mg/dL。'
  } else if (age >= 20 && age <= 39) {
    pathway = 'young-adult'
    riskLevel = fh || ldl >= 160 ? 'moderate' : 'low'
    if (ldl >= 160 && fh) {
      ldlTargetText = '可考慮 statin；以生活型態調整為基礎'
      notes = '20–39 歲族群以 lifestyle 為主；若 LDL ≥ 160 且合併早發 ASCVD 家族風險情境，可考慮 statin。現階段以 FH 作近似替代提示。'
    } else {
      ldlTargetText = '以飲食運動調整為主'
      notes = '20–39 歲族群以 heart-healthy lifestyle 為主；除非有明顯早發 ASCVD 家族史或 LDL 顯著偏高。'
    }
  } else if (!dm && age >= 40 && age <= 75 && ldl >= 70 && ldl <= 189 && sbp > 0) {
    pathway = 'primary-prevention-pce'
    tenYearRisk = calcPCE(input)
    if (tenYearRisk >= 20) {
      riskLevel = 'high'
      ldlTargetText = '建議高強度 statin；LDL-C 至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = 'PCE 屬高風險時，ACC/AHA 偏向高強度 statin，重點是 LDL 降幅 ≥ 50%。'
    } else if (tenYearRisk >= 7.5) {
      riskLevel = 'moderate'
      ldlTargetText = hasRiskEnhancer
        ? '建議中等強度 statin；若風險增強因子明顯可更積極，LDL-C 約降 30–49%'
        : '建議中等強度 statin；LDL-C 約降低 30–49%'
      ldlReductionPercentMin = 30
      ldlReductionPercentMax = 49
      notes = hasRiskEnhancer
        ? '屬 intermediate risk，且有 risk enhancers（如 CKD / FH / TG ≥ 175），較支持啟動或加強 statin。'
        : '屬 intermediate risk。ACC/AHA 通常建議中等強度 statin，重點是 LDL 降幅約 30–49%。'
    } else if (tenYearRisk >= 5) {
      riskLevel = 'moderate'
      ldlTargetText = hasRiskEnhancer
        ? '可考慮中等強度 statin；若啟動治療，LDL-C 約降低 30–49%'
        : '以飲食運動調整為主；若需用藥應先和醫師討論'
      ldlReductionPercentMin = hasRiskEnhancer ? 30 : undefined
      ldlReductionPercentMax = hasRiskEnhancer ? 49 : undefined
      notes = hasRiskEnhancer
        ? '屬 borderline risk。只有在存在 risk enhancers 時，ACC/AHA 才較支持考慮 statin。'
        : '屬 borderline risk，但若無明顯 risk enhancers，ACC/AHA 通常仍以 lifestyle 為主。'
    } else {
      riskLevel = 'low'
      ldlTargetText = '以飲食運動調整為主'
      notes = '屬低風險。ACC/AHA 對此情境以 heart-healthy lifestyle 為主。'
    }
  } else {
    pathway = 'lifestyle-only'
    riskLevel = 'low'
    ldlTargetText = '以飲食運動調整為主（不屬於 ACC/AHA 主要 statin 決策情境）'
    notes = '目前資料不足，或不在 ACC/AHA 主要 statin treatment pathway 內；建議以 lifestyle 為主並和醫師討論。'
  }

  return {
    guideline: 'accaha',
    riskLevel,
    ldlTarget,
    ldlTargetText,
    currentLdl: input.ldl,
    achieved: null,
    notes: notes ?? '注意：此風險計算以美國族群為基準，台灣用戶數值僅供參考',
    tenYearRisk,
    pathway,
    ldlReductionPercentMin,
    ldlReductionPercentMax,
  }
}
