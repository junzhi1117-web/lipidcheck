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

  // 偵測台灣指引比 ACC/ESC 寬鬆時產生提示
  const otherMaxRisk = [accaha.riskLevel, esceas.riskLevel].reduce(
    (max, r) => (RISK_ORDER[r] > RISK_ORDER[max] ? r : max),
    'low' as RiskLevel
  )
  let crossGuidelineNote: string | undefined
  if (RISK_ORDER[taiwan.riskLevel] < RISK_ORDER[otherMaxRisk]) {
    const twLabel: Record<RiskLevel, string> = {
      'low': '低風險', 'moderate': '中度風險', 'high': '高風險',
      'very-high': '非常高風險', 'extreme': '極高風險',
    }
    const otherLabel = twLabel[otherMaxRisk]
    if (otherMaxRisk === 'extreme' && taiwan.riskLevel === 'very-high') {
      crossGuidelineNote = `台灣指引將您列為「非常高風險（LDL 目標 < 70 mg/dL）」，但歐美主流指引（ACC/AHA、ESC）認為您的病況屬於「極高風險」，建議 LDL 要控制到更低。這個差異源自各指引對合併風險因子的定義不同，建議您主動告訴醫師，一起討論是否需要更積極的治療。`
    } else {
      crossGuidelineNote = `台灣指引對您的風險評估（${twLabel[taiwan.riskLevel]}）比歐美指引（${otherLabel}）寬鬆一個等級。建議諮詢醫師時，可以參考國際標準討論是否需要更積極控制膽固醇。`
    }
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
      crossGuidelineNote,
    },
    recommendations: {
      diet: getDietRecs(input, maxRisk),
      exercise: getExerciseRecs(maxRisk),
    },
  }
}
