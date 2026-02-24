import type { UserInput, AnalysisResult, RiskLevel } from '../types'
import { calcTaiwan } from './guidelines/taiwan'
import { calcAccAha } from './guidelines/accaha'
import { calcEscEas } from './guidelines/esceas'
import { getDietRecs, getExerciseRecs } from './recommendations'

const RISK_ORDER: Record<RiskLevel, number> = {
  'low': 0,
  'moderate': 1,
  'high': 2,
  'very-high': 3,
  'extreme': 4,
}

export function analyze(input: UserInput): AnalysisResult {
  const taiwan = calcTaiwan(input)
  const accaha = calcAccAha(input)
  const esceas = calcEscEas(input)

  // 最高風險等級
  const maxRisk = [taiwan.riskLevel, accaha.riskLevel, esceas.riskLevel].reduce(
    (max, r) => (RISK_ORDER[r] > RISK_ORDER[max] ? r : max),
    'low' as RiskLevel
  )

  // 最嚴格 LDL 目標
  const targets = [taiwan.ldlTarget, accaha.ldlTarget, esceas.ldlTarget].filter(
    (t): t is number => t !== null
  )
  const strictestTarget = targets.length > 0 ? Math.min(...targets) : null

  const consistent =
    taiwan.riskLevel === accaha.riskLevel && taiwan.riskLevel === esceas.riskLevel

  let summary = ''
  if (strictestTarget !== null) {
    const achieved = input.ldl < strictestTarget
    if (achieved) {
      summary = `您目前的 LDL-C（${input.ldl} mg/dL）已達到三大指引中最嚴格的目標（< ${strictestTarget} mg/dL）。請繼續維持現有的生活習慣與治療。`
    } else {
      summary = `您目前的 LDL-C（${input.ldl} mg/dL）尚未達到建議目標（< ${strictestTarget} mg/dL）。建議儘快諮詢醫師，討論生活型態調整或藥物治療。`
    }
    if (!consistent) {
      summary += ' 三大指引風險分層略有差異，以最保守目標為準。'
    }
  } else {
    summary = '目前無法計算精確 LDL 目標，建議從生活型態介入（飲食調整、規律運動）開始，並定期追蹤血脂。'
  }

  return {
    taiwan,
    accaha,
    esceas,
    consensus: {
      strictestTarget,
      achieved: strictestTarget !== null ? input.ldl < strictestTarget : null,
      summary,
      consistent,
    },
    recommendations: {
      diet: getDietRecs(input, maxRisk),
      exercise: getExerciseRecs(maxRisk),
    },
  }
}
