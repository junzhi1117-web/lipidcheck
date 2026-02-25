export interface UserInput {
  age: number
  sex: 'male' | 'female'
  sbp: number
  onBpMeds: boolean
  smoker: boolean
  tc: number
  ldl: number
  hdl: number
  tg: number
  ascvd: boolean
  dm: boolean
  ckd: 'none' | 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'
  fh: boolean
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme'

export interface GuidelineResult {
  guideline: 'taiwan' | 'accaha' | 'esceas'
  riskLevel: RiskLevel
  ldlTarget: number | null
  ldlTargetText: string
  currentLdl: number
  achieved: boolean | null
  notes?: string
  tenYearRisk?: number
}

export interface AnalysisResult {
  taiwan: GuidelineResult
  accaha: GuidelineResult
  esceas: GuidelineResult
  consensus: {
    strictestTarget: number | null
    achieved: boolean | null
    summary: string
    consistent: boolean
  }
  recommendations: {
    diet: string[]
    exercise: string[]
  }
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  'low': '低風險（Low Risk）',
  'moderate': '中度風險（Moderate Risk）',
  'high': '高風險（High Risk）',
  'very-high': '非常高風險（Very High Risk）',
  'extreme': '極高風險（Extreme Risk）',
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  'low': '#28A745',
  'moderate': '#FFC107',
  'high': '#FD7E14',
  'very-high': '#DC3545',
  'extreme': '#B22222',
}
