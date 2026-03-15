import type { UserInput, GuidelineResult, RiskLevel } from '../../types'

// Transitional estimator for 2026 ACC/AHA pathwaying.
// NOTE: 2026 guideline adopts PREVENT-ASCVD, but the exact implementation
// coefficients are not yet embedded in this app. We therefore use a lightweight
// approximation to support branch selection and clearly label it as an estimate.
function calcPreventEstimate(input: UserInput): number {
  const { age, sex, tc, hdl, sbp, onBpMeds, smoker, dm, ckd } = input

  let score = 0

  score += Math.max(0, age - 30) * 0.14
  score += sex === 'male' ? 1.2 : 0
  score += Math.max(0, tc - 180) * 0.018
  score += Math.max(0, 50 - hdl) * 0.09
  score += Math.max(0, sbp - 110) * (onBpMeds ? 0.05 : 0.04)
  score += smoker ? 2.2 : 0
  score += dm ? 2.0 : 0
  score += ckd === 'G3a' || ckd === 'G3b' ? 1.6 : 0
  score += ckd === 'G4' || ckd === 'G5' ? 3.0 : 0

  const risk = Math.min(Math.max(score, 0.3), 35)
  return Math.round(risk * 10) / 10
}

function hasStage3PlusCkd(ckd: UserInput['ckd']) {
  return ckd === 'G3a' || ckd === 'G3b' || ckd === 'G4' || ckd === 'G5'
}

function hasAdvancedCkd(ckd: UserInput['ckd']) {
  return ckd === 'G3b' || ckd === 'G4' || ckd === 'G5'
}

export function calcAccAha(input: UserInput): GuidelineResult {
  const {
    age,
    ldl,
    ascvd,
    dm,
    ckd,
    fh,
    familyHistoryPrematureASCVD,
    cacScore,
    lpA,
    apoB,
  } = input

  const strongFamilyHistory = Boolean(familyHistoryPrematureASCVD || fh)
  const stage3Plus = hasStage3PlusCkd(ckd)
  const advancedCkd = hasAdvancedCkd(ckd)
  const elevatedLpA = lpA !== undefined && lpA !== null && lpA >= 50
  const elevatedApoB = apoB !== undefined && apoB !== null && apoB >= 130
  const riskEnhancerCount = [
    strongFamilyHistory,
    stage3Plus,
    input.tg >= 175,
    elevatedLpA,
    elevatedApoB,
  ].filter(Boolean).length
  const hasRiskEnhancer = riskEnhancerCount > 0

  let riskLevel: RiskLevel = 'low'
  let ldlTarget: number | null = null
  let nonHdlTarget: number | null = null
  let ldlTargetText = '以飲食運動調整為主'
  let notes: string | undefined
  let tenYearRisk: number | undefined
  let riskModel: string | undefined
  let pathway: string | undefined
  let ldlReductionPercentMin: number | undefined
  let ldlReductionPercentMax: number | undefined

  // 1) Secondary prevention
  if (ascvd) {
    pathway = 'secondary-prevention-2026'
    riskModel = '2026 ACC/AHA treatment pathway'

    const veryHighRiskAscvd = advancedCkd || dm || fh || (cacScore !== null && cacScore !== undefined && cacScore >= 1000)

    if (veryHighRiskAscvd) {
      riskLevel = 'extreme'
      ldlTarget = 55
      nonHdlTarget = 85
      ldlTargetText = '高強度或最大可耐受 statin；若未達標應加 ezetimibe / PCSK9；目標 LDL-C <55、non-HDL-C <85，並至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = '屬 2026 ACC/AHA 二級預防較高風險分支。clinical ASCVD 合併 CKD stage 3b+、糖尿病、FH 或極高 CAC 等條件時，治療應更積極，目標可拉到 LDL-C <55、non-HDL-C <85。'
    } else {
      riskLevel = 'very-high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '高強度 statin；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = '屬 2026 ACC/AHA 二級預防。clinical ASCVD 的基準治療是 high-intensity statin，目標 LDL-C <70、non-HDL-C <100；若仍未達標，可考慮加 ezetimibe / PCSK9 / bempedoic acid。'
    }
  }
  // 2) Severe hypercholesterolemia / FH
  else if (age >= 20 && ldl >= 190) {
    pathway = 'severe-hypercholesterolemia-2026'
    riskModel = '2026 ACC/AHA treatment pathway'
    ldlReductionPercentMin = 50
    ldlReductionPercentMax = 50

    if (fh || hasRiskEnhancer || (cacScore !== null && cacScore !== undefined && cacScore > 0)) {
      riskLevel = 'very-high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '最大可耐受 statin；若未達標可加 ezetimibe / PCSK9 / bempedoic acid；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      notes = '2026 ACC/AHA 對 LDL-C ≥190 mg/dL 且合併 HeFH、額外 risk factors 或 CAC 證據者，治療目標較積極，建議朝 LDL-C <70、non-HDL-C <100 前進。'
    } else {
      riskLevel = 'high'
      ldlTarget = 100
      nonHdlTarget = 130
      ldlTargetText = '最大可耐受 statin；若未達標可加 ezetimibe / PCSK9 / bempedoic acid；目標 LDL-C <100、non-HDL-C <130，並至少降低 50%'
      notes = '2026 ACC/AHA 對 severe hypercholesterolemia（LDL-C ≥190）不再只是看降幅，也明確納入 LDL-C <100、non-HDL-C <130 的治療目標。'
    }
  }
  // 3) Diabetes primary prevention
  else if (dm && age >= 40 && age <= 75) {
    pathway = 'diabetes-primary-prevention-2026'
    riskModel = '2026 ACC/AHA treatment pathway'

    const higherRiskDiabetes = age >= 50 || riskEnhancerCount >= 1 || stage3Plus
    if (higherRiskDiabetes) {
      riskLevel = 'high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '至少中高強度 statin；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = '2026 ACC/AHA 對糖尿病且合併較高風險條件者，建議使用較積極的 lipid lowering strategy，目標 LDL-C <70、non-HDL-C <100。'
    } else {
      riskLevel = 'moderate'
      ldlTarget = 100
      nonHdlTarget = 130
      ldlTargetText = '至少中等強度 statin；目標 LDL-C <100、non-HDL-C <130，並降低 30–49%'
      ldlReductionPercentMin = 30
      ldlReductionPercentMax = 49
      notes = '2026 ACC/AHA 對 40–75 歲糖尿病 primary prevention 已重新納入明確 LDL-C / non-HDL-C 目標，不再只是單看 statin intensity。'
    }
  }
  // 4) CKD stage 3+ primary prevention
  else if (age >= 40 && age <= 75 && stage3Plus) {
    pathway = 'ckd-primary-prevention-2026'
    riskModel = '2026 ACC/AHA treatment pathway'

    if (advancedCkd) {
      riskLevel = 'high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '至少中高強度 statin；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = '2026 ACC/AHA 對 CKD stage 3b–5 primary prevention 的地位較高，已不是單純 risk enhancer。'
    } else {
      riskLevel = 'moderate'
      ldlTarget = 100
      nonHdlTarget = 130
      ldlTargetText = '建議至少中等強度 statin；目標 LDL-C <100、non-HDL-C <130，並降低 30–49%'
      ldlReductionPercentMin = 30
      ldlReductionPercentMax = 49
      notes = 'CKD stage 3a 在 2026 ACC/AHA 中應被納入更積極的 primary prevention 討論，而不只是附註性 risk enhancer。'
    }
  }
  // 5) Young adults 20–39
  else if (age >= 20 && age <= 39) {
    pathway = 'young-adult-2026'
    riskModel = '2026 ACC/AHA treatment pathway'

    if (ldl >= 160 || strongFamilyHistory) {
      riskLevel = 'moderate'
      ldlTargetText = '可考慮啟動 statin；重點是及早降低 lifetime LDL exposure，並評估是否需朝 LDL-C <100（若風險訊號明顯可更積極）'
      if (ldl >= 160) {
        ldlTarget = 100
        nonHdlTarget = 130
      }
      notes = '2026 ACC/AHA 對年輕成人更重視早期介入。若 LDL-C ≥160 或有早發 ASCVD 家族史，應考慮比過去更早開始 pharmacotherapy。'
    } else {
      riskLevel = 'low'
      ldlTargetText = '以 lifestyle 為主，定期追蹤 LDL-C 與整體代謝風險'
      notes = '20–39 歲若無明顯高風險訊號，2026 ACC/AHA 仍以 lifestyle 為基礎。'
    }
  }
  // 6) Primary prevention with PREVENT-style bins (transitional estimate)
  else if (!dm && age >= 30 && age <= 79 && ldl >= 70 && ldl <= 189) {
    pathway = 'primary-prevention-prevent-2026'
    riskModel = 'PREVENT-ASCVD estimate (transitional)'
    tenYearRisk = calcPreventEstimate(input)

    if (tenYearRisk >= 10) {
      riskLevel = 'high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '建議高強度 statin；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      ldlReductionPercentMin = 50
      ldlReductionPercentMax = 50
      notes = '依 2026 ACC/AHA 的 PREVENT-ASCVD 架構，高風險 primary prevention 應以 high-intensity statin 為主，並以 LDL-C <70、non-HDL-C <100 作為治療目標。'
    } else if (tenYearRisk >= 5) {
      riskLevel = 'moderate'
      ldlTarget = 100
      nonHdlTarget = 130
      ldlTargetText = '至少中等強度 statin；目標 LDL-C <100、non-HDL-C <130，並降低 30–49%'
      ldlReductionPercentMin = 30
      ldlReductionPercentMax = 49
      notes = '依 2026 ACC/AHA，intermediate risk（5%–<10%）應至少考慮 moderate-intensity statin，並以 LDL-C <100、non-HDL-C <130 為治療目標。'
    } else if (tenYearRisk >= 3) {
      riskLevel = 'moderate'
      ldlTarget = 100
      nonHdlTarget = 130
      if (hasRiskEnhancer || (cacScore !== null && cacScore !== undefined && cacScore > 0)) {
        ldlTargetText = '可考慮中等強度 statin；若治療，目標 LDL-C <100、non-HDL-C <130，並降低 30–49%'
        ldlReductionPercentMin = 30
        ldlReductionPercentMax = 49
        notes = '依 2026 ACC/AHA，borderline risk（3%–<5%）在合併 risk enhancers、Lp(a)/apoB 異常或 CAC >0 時，可更支持啟動 statin。'
      } else {
        ldlTargetText = '先以 lifestyle 為主；若有更多風險證據（如 CAC >0、Lp(a) 高）再考慮 statin'
        notes = 'borderline risk 族群不應自動進入用藥；2026 ACC/AHA 仍強調 shared decision-making 與 risk refinement。'
      }
    } else {
      riskLevel = 'low'
      if (ldl >= 160 || strongFamilyHistory) {
        ldlTarget = 100
        nonHdlTarget = 130
        ldlTargetText = '以 lifestyle 為主；若 LDL-C 160–189 或 lifetime risk 較高，可考慮 moderate-intensity statin，目標 LDL-C <100、non-HDL-C <130'
        notes = '即使 10 年風險偏低，2026 ACC/AHA 對 LDL-C 160–189 或 lifetime risk 較高者也允許較早介入。'
      } else {
        ldlTargetText = '以 lifestyle 為主'
        notes = '依 2026 ACC/AHA，low risk primary prevention 以 heart-healthy lifestyle 為主。'
      }
    }

    if (cacScore !== null && cacScore !== undefined) {
      if (cacScore === 0) {
        notes += ' CAC = 0 時，若無其他高風險訊號，可考慮延後藥物治療並於 3–7 年後重新評估。'
      } else if (cacScore >= 1 && cacScore < 100) {
        notes += ' CAC 1–99 代表已可支持啟動 moderate-intensity statin。'
      } else if (cacScore >= 100 && cacScore < 300) {
        ldlTarget = 70
        nonHdlTarget = 100
        ldlTargetText = '建議更積極治療；目標 LDL-C <70、non-HDL-C <100，並視情況考慮 high-intensity statin'
        riskLevel = RISK_ORDER[riskLevel] >= RISK_ORDER['high'] ? riskLevel : 'high'
        ldlReductionPercentMin = 50
        ldlReductionPercentMax = 50
        notes += ' CAC ≥100 時，2026 ACC/AHA 支持把治療目標提升到 LDL-C <70、non-HDL-C <100。'
      } else if (cacScore >= 300) {
        ldlTarget = 55
        nonHdlTarget = 85
        ldlTargetText = '建議積極加強治療；目標 LDL-C <55、non-HDL-C <85，並至少降低 50%'
        riskLevel = 'extreme'
        ldlReductionPercentMin = 50
        ldlReductionPercentMax = 50
        notes += ' CAC ≥300 時風險顯著上升，合理朝 LDL-C <55、non-HDL-C <85 intensify。'
      }
    }
  }
  // 7) fallback
  else {
    pathway = 'lifestyle-only'
    riskModel = '2026 ACC/AHA treatment pathway'
    riskLevel = 'low'
    ldlTargetText = '以飲食運動調整為主（不屬於 2026 ACC/AHA 主要 statin 分流情境）'
    notes = '目前資料不足，或不在 2026 ACC/AHA 主要 statin treatment pathway 內；建議以 lifestyle 為主並與醫師討論。'
  }

  return {
    guideline: 'accaha',
    riskLevel,
    ldlTarget,
    nonHdlTarget,
    ldlTargetText,
    currentLdl: input.ldl,
    achieved: ldlTarget !== null ? input.ldl < ldlTarget : null,
    notes,
    tenYearRisk,
    riskModel,
    pathway,
    ldlReductionPercentMin,
    ldlReductionPercentMax,
  }
}

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  'very-high': 3,
  extreme: 4,
}
