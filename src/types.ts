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
  familyHistoryPrematureASCVD?: boolean
  cacScore?: number | null
  lpA?: number | null
  apoB?: number | null
  ldlSource?: 'measured' | 'friedewald'
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme'

export interface GuidelineResult {
  guideline: 'taiwan' | 'accaha' | 'esceas'
  riskLevel: RiskLevel
  ldlTarget: number | null
  nonHdlTarget?: number | null
  ldlTargetText: string
  currentLdl: number
  achieved: boolean | null
  notes?: string
  tenYearRisk?: number
  riskModel?: string
  pathway?: string
  ldlReductionPercentMin?: number
  ldlReductionPercentMax?: number
}

export interface AnalysisResult {
  taiwan: GuidelineResult
  accaha: GuidelineResult
  esceas: GuidelineResult
  ldlSource?: 'measured' | 'friedewald'
  consensus: {
    strictestTarget: number | null
    achieved: boolean | null
    summary: string
    consistent: boolean
    crossGuidelineNote?: string
  }
  nonHdl: {
    value: number
    accahaTarget: number | null
    esceasTarget: number | null
    taiwanTarget: null
    accahaAchieved: boolean | null
    esceasAchieved: boolean | null
  }
  ldlReduction: {
    taiwan: { needed: number; percent: number; achieved: boolean } | null
    accaha: { needed: number; percent: number; achieved: boolean } | { rangeMode: true; rangeMin: number; rangeMax: number; rangePercentMin: number; rangePercentMax: number } | null
    esceas: { needed: number; percent: number; achieved: boolean } | null
  }
  tenYearRisk: {
    accaha: number | null
    score2: number | null
  }
  recommendations: {
    diet: string[]
    exercise: string[]
  }
}

export interface HistoryEntry {
  id: string
  date: string
  ldl: number
  target: number | null
  achieved: boolean | null
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  'low': '低風險',
  'moderate': '中度風險',
  'high': '高風險',
  'very-high': '非常高風險',
  'extreme': '極高風險',
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  'low': '#10B981',
  'moderate': '#F59E0B',
  'high': '#EF4444',
  'very-high': '#B91C1C',
  'extreme': '#7F1D1D',
}
