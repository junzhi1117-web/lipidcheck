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
      summary = `很好！您的膽固醇（${input.ldl} mg/dL）已符合三大指引中最嚴格的目標（< ${strictestTarget} mg/dL）。繼續保持現在的生活習慣就對了。`
    } else {
      summary = `您的膽固醇（${input.ldl} mg/dL）目前超過建議目標（< ${strictestTarget} mg/dL）。建議找醫師聊聊，討論飲食調整或是否需要用藥。`
    }
    if (!consistent) {
      summary += '（三大指引對您的風險評估略有差異，本建議採用最嚴格的標準。）'
    }
  } else {
    summary = '目前資料不足以給出精確目標值。建議從飲食調整和規律運動開始，並定期回診追蹤。'
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
      crossGuidelineNote = `依目前簡化條件推估，台灣指引下您屬於「非常高風險」（膽固醇目標 < 70 mg/dL），但歐美工具可能把您歸為更高風險，建議目標也會更低。建議就診時與醫師討論是否需要更積極的治療。`
    } else {
      crossGuidelineNote = `依目前簡化條件推估，台灣指引下的風險分層（${twLabel[taiwan.riskLevel]}）比歐美工具（${otherLabel}）保守；建議就診時與醫師討論是否採更積極的 LDL 控制目標。`
    }
  }

  // Non-HDL cholesterol
  const nonHdlValue = input.tc - input.hdl
  const accahaLdlTarget = accaha.ldlTarget

  // ESC/EAS non-HDL targets by risk level
  const esceasNonHdlTargets: Record<RiskLevel, number> = {
    'extreme': 85,
    'very-high': 100,
    'high': 130,
    'moderate': 145,
    'low': 145,
  }

  const nonHdl = {
    value: nonHdlValue,
    accahaTarget: accahaLdlTarget !== null ? accahaLdlTarget + 30 : null,
    esceasTarget: esceasNonHdlTargets[esceas.riskLevel],
    taiwanTarget: null as null,
    accahaAchieved: accahaLdlTarget !== null ? nonHdlValue < (accahaLdlTarget + 30) : null,
    esceasAchieved: nonHdlValue < esceasNonHdlTargets[esceas.riskLevel],
  }

  // LDL reduction needed
  const calcReduction = (g: typeof taiwan) => {
    if (g.ldlTarget === null) return null
    if (input.ldl < g.ldlTarget) {
      return { needed: 0, percent: 0, achieved: true }
    }
    const needed = input.ldl - g.ldlTarget
    const percent = Math.round((needed / input.ldl) * 100)
    return { needed, percent, achieved: false }
  }

  const accahaReduction = (() => {
    if (accaha.ldlTarget !== null) {
      return calcReduction(accaha)
    }
    if (accaha.ldlReductionPercentMin !== undefined && accaha.ldlReductionPercentMax !== undefined) {
      const minRatio = accaha.ldlReductionPercentMin / 100
      const maxRatio = accaha.ldlReductionPercentMax / 100
      return {
        rangeMode: true as const,
        rangeMin: Math.round(input.ldl * minRatio),
        rangeMax: Math.round(input.ldl * maxRatio),
        rangePercentMin: accaha.ldlReductionPercentMin,
        rangePercentMax: accaha.ldlReductionPercentMax,
      }
    }
    return null
  })()

  const ldlReduction = {
    taiwan: calcReduction(taiwan),
    accaha: accahaReduction,
    esceas: calcReduction(esceas),
  }

  // Ten-year risk
  const tenYearRisk = {
    pce: accaha.tenYearRisk ?? null,
    score2: esceas.tenYearRisk ?? null,
  }

  return {
    taiwan,
    accaha,
    esceas,
    ldlSource: input.ldlSource,
    consensus: {
      strictestTarget,
      achieved: strictestTarget !== null ? input.ldl < strictestTarget : null,
      summary,
      consistent,
      crossGuidelineNote,
    },
    nonHdl,
    ldlReduction,
    tenYearRisk,
    recommendations: {
      diet: getDietRecs(input, maxRisk),
      exercise: getExerciseRecs(maxRisk),
    },
  }
}
