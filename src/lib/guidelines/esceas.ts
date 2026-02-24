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

  // 極高風險（Extreme，2025新增）：進展性ASCVD 或 ASCVD+多重高風險
  if (ascvd && (dm || ckd === 'G4' || ckd === 'G5' || fh)) {
    riskLevel = 'extreme'
    ldlTarget = 40
    ldlTargetText = '< 40 mg/dL（且較基線降低 ≥ 50%）'
  }
  // 非常高風險
  else if (
    ascvd ||
    (dm && (ckd !== 'none' || age >= 40)) || // DM with TOD or age
    ckd === 'G4' ||
    ckd === 'G5'
  ) {
    riskLevel = 'very-high'
    ldlTarget = 55
    ldlTargetText = '< 55 mg/dL（且較基線降低 ≥ 50%）'
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
    ldlTargetText = '< 70 mg/dL（且較基線降低 ≥ 50%）'
  } else {
    // 需要 SCORE2
    if (age >= 40 && age <= 79 && sbp > 0) {
      scoreRisk = calcScore2(input)
      if (scoreRisk >= 10) {
        riskLevel = 'very-high'
        ldlTarget = 55
        ldlTargetText = '< 55 mg/dL（且較基線降低 ≥ 50%）'
      } else if (scoreRisk >= 5) {
        riskLevel = 'high'
        ldlTarget = 70
        ldlTargetText = '< 70 mg/dL（且較基線降低 ≥ 50%）'
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
    notes: '⚠️ SCORE2 以歐洲族群建立，台灣用戶風險可能有所差異，僅供參考。依據 2025 ESC/EAS Focused Update。',
    tenYearRisk: scoreRisk,
  }
}
