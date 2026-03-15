import type { UserInput, GuidelineResult, RiskLevel } from '../../types'

// SCORE2 簡化計算（2021 ESC SCORE2 Working Group, Low-to-Moderate Risk region）
// 台灣歸類為 Low-to-Moderate Risk 亞洲族群（非完全校正，顯示免責聲明）
function calcScore2(input: UserInput): number {
  const { age, sex, smoker, sbp, tc, hdl } = input
  const nonHdl = tc - hdl

  // SCORE2 使用 non-HDL cholesterol（mmol/L）
  const nonHdlMmol = nonHdl * 0.02586
  const sbpAdjusted = sbp

  let baselineRisk: number

  if (sex === 'male') {
    // Simplified SCORE2 for Low-Risk region men
    const ageFactor = (age - 60) * 0.064
    const smokeFactor = smoker ? 0.83 : 0
    const sbpFactor = (sbpAdjusted - 120) * 0.022
    const cholFactor = (nonHdlMmol - 3.5) * 0.24
    const lp = ageFactor + smokeFactor + sbpFactor + cholFactor
    baselineRisk = 1 - Math.exp(-Math.exp(lp + 0.3) * 0.01)
  } else {
    // Simplified SCORE2 for Low-Risk region women
    const ageFactor = (age - 60) * 0.066
    const smokeFactor = smoker ? 0.72 : 0
    const sbpFactor = (sbpAdjusted - 120) * 0.019
    const cholFactor = (nonHdlMmol - 3.5) * 0.21
    const lp = ageFactor + smokeFactor + sbpFactor + cholFactor
    baselineRisk = 1 - Math.exp(-Math.exp(lp - 0.05) * 0.005)
  }

  return Math.round(Math.min(Math.max(baselineRisk * 100, 0.1), 99.9) * 10) / 10
}

export function calcEscEas(input: UserInput): GuidelineResult {
  const { ldl, ascvd, dm, ckd, fh, age, sbp } = input

  let riskLevel: RiskLevel
  let ldlTarget: number
  let ldlTargetText: string
  let scoreRisk: number | undefined
  let notes: string | undefined

  // 極高風險（Extreme，2025新增）：進展性ASCVD 或 ASCVD+多重高風險
  if (ascvd && (dm || ckd === 'G4' || ckd === 'G5' || fh)) {
    riskLevel = 'extreme'
    ldlTarget = 40
    ldlTargetText = '< 40 mg/dL'
    notes = 'Extreme risk 條件採簡化代理，未完整涵蓋所有進展性 ASCVD 細項。'
  }
  // 非常高風險
  else if (
    ascvd ||
    ckd === 'G4' ||
    ckd === 'G5'
  ) {
    riskLevel = 'very-high'
    ldlTarget = 55
    ldlTargetText = '< 55 mg/dL'
  }
  // 高風險
  else if (
    fh ||
    dm ||
    ckd === 'G3a' ||
    ckd === 'G3b' ||
    ldl >= 190
  ) {
    riskLevel = 'high'
    ldlTarget = 70
    ldlTargetText = '< 70 mg/dL'
    if (dm) {
      notes = '糖尿病分級採簡化處理；ESC/EAS 原始指引還會納入病程、器官損傷與多重風險因子。'
    }
  } else {
    // 需要 SCORE2（2021 ESC 依年齡分層門檻，Low-to-Moderate Risk region）
    // < 50 歲：high ≥ 2.5%，very-high ≥ 7.5%
    // 50-69 歲：high ≥ 5%，very-high ≥ 10%
    // ≥ 70 歲：high ≥ 7.5%，very-high ≥ 15%（建議用 SCORE2-OP，此為近似值）
    if (age >= 40 && age <= 79 && sbp > 0) {
      scoreRisk = calcScore2(input)

      let veryHighThreshold: number
      let highThreshold: number

      if (age < 50) {
        veryHighThreshold = 7.5
        highThreshold = 2.5
      } else if (age < 70) {
        veryHighThreshold = 10
        highThreshold = 5
      } else {
        veryHighThreshold = 15
        highThreshold = 7.5
      }

      if (scoreRisk >= veryHighThreshold) {
        riskLevel = 'very-high'
        ldlTarget = 55
        ldlTargetText = '< 55 mg/dL'
      } else if (scoreRisk >= highThreshold) {
        riskLevel = 'high'
        ldlTarget = 70
        ldlTargetText = '< 70 mg/dL'
      } else if (scoreRisk >= 2.5) {
        riskLevel = 'moderate'
        ldlTarget = 100
        ldlTargetText = '< 100 mg/dL'
      } else {
        riskLevel = 'low'
        ldlTarget = 116
        ldlTargetText = '< 116 mg/dL'
      }
    } else {
      riskLevel = 'low'
      ldlTarget = 116
      ldlTargetText = '< 116 mg/dL'
    }
  }

  return {
    guideline: 'esceas',
    riskLevel,
    ldlTarget,
    ldlTargetText,
    currentLdl: ldl,
    achieved: ldl < ldlTarget,
    notes: notes
      ? `${notes} 注意：此風險計算以歐洲族群為基準，台灣用戶數值僅供參考（依據 2025 ESC/EAS 最新指引）`
      : '注意：此風險計算以歐洲族群為基準，台灣用戶數值僅供參考（依據 2025 ESC/EAS 最新指引）',
    tenYearRisk: scoreRisk,
  }
}
