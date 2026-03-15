import type { UserInput, GuidelineResult, RiskLevel } from '../../types'

const MGDL_TO_MMOLL = 0.02586

const PREVENT_ASCVD_10Y_COEFFICIENTS = {
  female: {
    age: 0.719883,
    nonHdl: 0.117697,
    hdl: -0.151185,
    sbpLt110: -0.083536,
    sbpGte110: 0.359285,
    diabetes: 0.834858,
    smoking: 0.483108,
    bmiLt30: 0,
    bmiGte30: 0,
    egfrLt60: 0.486462,
    egfrGte60: 0.039778,
    bpTx: 0.226531,
    statin: -0.059237,
    bpTxSbpGte110: -0.039576,
    statinNonHdl: 0.084442,
    ageNonHdl: -0.056784,
    ageHdl: 0.032569,
    ageSbpGte110: -0.103598,
    ageDiabetes: -0.241754,
    ageSmoking: -0.079114,
    ageBmiGte30: 0,
    ageEgfrLt60: -0.167149,
    constant: -3.819975,
  },
  male: {
    age: 0.709985,
    nonHdl: 0.165866,
    hdl: -0.114429,
    sbpLt110: -0.283721,
    sbpGte110: 0.323998,
    diabetes: 0.71896,
    smoking: 0.395697,
    bmiLt30: 0,
    bmiGte30: 0,
    egfrLt60: 0.369007,
    egfrGte60: 0.020362,
    bpTx: 0.203652,
    statin: -0.086558,
    bpTxSbpGte110: -0.032292,
    statinNonHdl: 0.114563,
    ageNonHdl: -0.03,
    ageHdl: 0.023275,
    ageSbpGte110: -0.092702,
    ageDiabetes: -0.201852,
    ageSmoking: -0.097053,
    ageBmiGte30: 0,
    ageEgfrLt60: -0.121708,
    constant: -3.500655,
  },
} as const

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function calcPreventAscvd10yr(input: UserInput): number | null {
  const { age, sex, tc, hdl, sbp, onBpMeds, smoker, dm, bmi, egfr, onStatin } = input

  if (age < 30 || age > 79) return null
  if (bmi === undefined || bmi === null || Number.isNaN(bmi)) return null
  if (egfr === undefined || egfr === null || Number.isNaN(egfr)) return null

  const coeffs = PREVENT_ASCVD_10Y_COEFFICIENTS[sex]
  const ageTerm = (age - 55) / 10
  const nonHdlMmol = (tc - hdl) * MGDL_TO_MMOLL - 3.5
  const hdlTerm = (hdl * MGDL_TO_MMOLL - 1.3) / 0.3
  const sbpLt110 = (Math.min(sbp, 110) - 110) / 20
  const sbpGte110 = (Math.max(sbp, 110) - 130) / 20
  const dmTerm = dm ? 1 : 0
  const smokingTerm = smoker ? 1 : 0
  const bmiLt30 = (Math.min(bmi, 30) - 25) / 5
  const bmiGte30 = (Math.max(bmi, 30) - 30) / 5
  const egfrLt60 = (Math.min(egfr, 60) - 60) / -15
  const egfrGte60 = (Math.max(egfr, 60) - 90) / -15
  const bpTx = onBpMeds ? 1 : 0
  const statin = onStatin ? 1 : 0

  const logOdds =
    coeffs.constant +
    coeffs.age * ageTerm +
    coeffs.nonHdl * nonHdlMmol +
    coeffs.hdl * hdlTerm +
    coeffs.sbpLt110 * sbpLt110 +
    coeffs.sbpGte110 * sbpGte110 +
    coeffs.diabetes * dmTerm +
    coeffs.smoking * smokingTerm +
    coeffs.bmiLt30 * bmiLt30 +
    coeffs.bmiGte30 * bmiGte30 +
    coeffs.egfrLt60 * egfrLt60 +
    coeffs.egfrGte60 * egfrGte60 +
    coeffs.bpTx * bpTx +
    coeffs.statin * statin +
    coeffs.bpTxSbpGte110 * bpTx * sbpGte110 +
    coeffs.statinNonHdl * statin * nonHdlMmol +
    coeffs.ageNonHdl * ageTerm * nonHdlMmol +
    coeffs.ageHdl * ageTerm * hdlTerm +
    coeffs.ageSbpGte110 * ageTerm * sbpGte110 +
    coeffs.ageDiabetes * ageTerm * dmTerm +
    coeffs.ageSmoking * ageTerm * smokingTerm +
    coeffs.ageBmiGte30 * ageTerm * bmiGte30 +
    coeffs.ageEgfrLt60 * ageTerm * egfrLt60

  const risk = Math.exp(logOdds) / (1 + Math.exp(logOdds))
  return round1(risk * 100)
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
    bmi,
    egfr,
    onStatin,
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
  const hasPreventInputs = bmi !== undefined && bmi !== null && egfr !== undefined && egfr !== null && typeof onStatin === 'boolean'

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
  } else if (age >= 20 && ldl >= 190) {
    pathway = 'severe-hypercholesterolemia-2026'
    riskModel = '2026 ACC/AHA treatment pathway'
    ldlReductionPercentMin = 50
    ldlReductionPercentMax = 50

    const severeUpgradeSignals = fh || (cacScore !== null && cacScore !== undefined && cacScore > 0) || advancedCkd

    if (severeUpgradeSignals) {
      riskLevel = 'very-high'
      ldlTarget = 70
      nonHdlTarget = 100
      ldlTargetText = '最大可耐受 statin；若未達標可加 ezetimibe / PCSK9 / bempedoic acid；目標 LDL-C <70、non-HDL-C <100，並至少降低 50%'
      notes = '2026 ACC/AHA 對 LDL-C ≥190 mg/dL 且合併 HeFH、明確高風險條件或 CAC 證據者，可採更積極治療目標。'
    } else {
      riskLevel = 'high'
      ldlTarget = 100
      nonHdlTarget = 130
      ldlTargetText = '最大可耐受 statin；若未達標可加 ezetimibe / PCSK9 / bempedoic acid；目標 LDL-C <100、non-HDL-C <130，並至少降低 50%'
      notes = '2026 ACC/AHA 對 severe hypercholesterolemia（LDL-C ≥190）不再只是看降幅，也明確納入 LDL-C <100、non-HDL-C <130 的治療目標。'
    }
  } else if (dm && age >= 40 && age <= 75) {
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
  } else if (age >= 40 && age <= 75 && stage3Plus) {
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
  } else if (age >= 20 && age <= 39) {
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
  } else if (!dm && age >= 30 && age <= 79 && ldl >= 70 && ldl <= 189) {
    pathway = 'primary-prevention-prevent-2026'
    tenYearRisk = calcPreventAscvd10yr(input) ?? undefined
    riskModel = hasPreventInputs ? 'PREVENT-ASCVD 10-year (base model)' : '2026 ACC/AHA treatment pathway'

    if (tenYearRisk === undefined) {
      riskLevel = hasRiskEnhancer ? 'moderate' : 'low'
      if (ldl >= 160 || strongFamilyHistory || hasRiskEnhancer) {
        ldlTarget = 100
        nonHdlTarget = 130
        ldlTargetText = 'PREVENT 需要身高/體重（用來計算 BMI）、eGFR、是否正在吃 statin 才能正式計算；在資料補齊前，先以 lifestyle 為主，若整體風險訊號偏高，可和醫師討論是否考慮中等強度 statin。'
      } else {
        ldlTargetText = '若要正式套用 PREVENT-ASCVD，還需要身高/體重（BMI）、eGFR、是否正在吃 statin；目前先以 lifestyle 為主。'
      }
      notes = 'ACC/AHA 2026 primary prevention 已改用 PREVENT-ASCVD。因目前缺少身高/體重（BMI）、eGFR 或 statin use，這裡不硬算風險數字，避免做成假公式。'
    } else if (tenYearRisk >= 10) {
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
        riskLevel = RISK_ORDER[riskLevel] >= RISK_ORDER.high ? riskLevel : 'high'
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
  } else {
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
