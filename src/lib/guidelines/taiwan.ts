import type { UserInput, GuidelineResult, RiskLevel } from '../../types'

export function calcTaiwan(input: UserInput): GuidelineResult {
  const { age, sex, sbp, smoker, hdl, ldl, ascvd, dm, ckd, fh } = input

  // 次級風險因子計算（用於中度風險判斷）
  const riskFactorCount = [
    sex === 'male' ? age >= 45 : age >= 55,
    sbp >= 140,
    smoker,
    sex === 'male' ? hdl < 40 : hdl < 50,
    fh,
  ].filter(Boolean).length

  let riskLevel: RiskLevel
  let ldlTarget: number

  // 極高風險：ASCVD + 糖尿病 或 ASCVD + 第2種ASCVD事件（本工具以ASCVD+DM代表）
  if (ascvd && dm) {
    riskLevel = 'extreme'
    ldlTarget = 55
  }
  // 非常高風險：確診ASCVD（但無上述額外因子）
  else if (ascvd) {
    riskLevel = 'very-high'
    ldlTarget = 70
  }
  // 高風險
  else if (dm || ckd === 'G3b' || ckd === 'G4' || ckd === 'G5' || ldl >= 190 || fh) {
    riskLevel = 'high'
    ldlTarget = 100
  }
  // 中度風險：2+ 次級風險因子
  else if (riskFactorCount >= 2) {
    riskLevel = 'moderate'
    ldlTarget = 115
  }
  // 低風險
  else {
    riskLevel = 'low'
    ldlTarget = 130
  }

  return {
    guideline: 'taiwan',
    riskLevel,
    ldlTarget,
    ldlTargetText: `< ${ldlTarget} mg/dL`,
    currentLdl: ldl,
    achieved: ldl < ldlTarget,
  }
}
