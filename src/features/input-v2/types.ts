import type { CSSProperties, ReactNode } from 'react'
import type { UserInput } from '../../types'

export type CKDLevel = UserInput['ckd']
export type SexValue = UserInput['sex'] | ''
export type LdlSource = NonNullable<UserInput['ldlSource']>

export interface InputFormValues {
  age: string
  sex: SexValue
  sbp: string
  onBpMeds: boolean
  smoker: boolean
  tc: string
  ldl: string
  hdl: string
  tg: string
  heightCm: string
  weightKg: string
  egfr: string
  onStatin: boolean
  ascvd: boolean
  dm: boolean
  ckd: CKDLevel
  fh: boolean
  familyHistoryPrematureASCVD: boolean
  cacScore: string
  lpA: string
  apoB: string
}

export interface DerivedFormMetrics {
  bmi: number | null
  nonHdl: number | null
  friedewaldLdl: number | null
  ldlSource: LdlSource
  tgTooHighForFriedewald: boolean
}

export interface FormValidationResult {
  isValid: boolean
  missingRequired: Array<keyof InputFormValues>
}

export type ToggleFieldName = {
  [K in keyof InputFormValues]: InputFormValues[K] extends boolean ? K : never
}[keyof InputFormValues]

export type NumericFieldName = {
  [K in keyof InputFormValues]: InputFormValues[K] extends string ? K : never
}[keyof InputFormValues]

export interface FieldOption<T extends string> {
  label: string
  value: T
}

export interface TextFieldConfig {
  name: NumericFieldName
  label: string
  placeholder: string
  inputMode?: 'numeric' | 'decimal'
  optional?: boolean
  suffix?: string
}

export interface ToggleFieldConfig {
  name: ToggleFieldName
  label: string
}

export interface FormSectionConfig {
  key: string
  title: string
  className?: string
  style?: CSSProperties
  content: ReactNode
}
