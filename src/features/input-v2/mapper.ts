import type { UserInput } from '../../types'
import { EMPTY_FORM_VALUES } from './formDefaults'
import type { DerivedFormMetrics, FormValidationResult, InputFormValues } from './types'

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseRequiredNumber(value: string): number {
  return Number(value)
}

export function calculateDerivedMetrics(values: InputFormValues): DerivedFormMetrics {
  const tc = parseOptionalNumber(values.tc)
  const hdl = parseOptionalNumber(values.hdl)
  const tg = parseOptionalNumber(values.tg)
  const measuredLdl = parseOptionalNumber(values.ldl)
  const heightCm = parseOptionalNumber(values.heightCm)
  const weightKg = parseOptionalNumber(values.weightKg)

  const bmi = heightCm && weightKg && heightCm > 0 && weightKg > 0
    ? Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10
    : null

  const nonHdl = tc !== null && hdl !== null
    ? Math.round((tc - hdl) * 10) / 10
    : null

  const tgTooHighForFriedewald = tg !== null && tg >= 400

  const friedewaldLdl =
    tc !== null && hdl !== null && tg !== null && tg > 0 && tg < 400
      ? Math.round((tc - hdl - tg / 5) * 10) / 10
      : null

  return {
    bmi,
    nonHdl,
    friedewaldLdl,
    ldlSource: measuredLdl !== null ? 'measured' : 'friedewald',
    tgTooHighForFriedewald,
  }
}

export function validateForm(values: InputFormValues): FormValidationResult {
  const derived = calculateDerivedMetrics(values)
  const missingRequired = new Set<keyof InputFormValues>()

  if (!values.age || Number(values.age) < 18 || Number(values.age) > 90) missingRequired.add('age')
  if (!values.sex) missingRequired.add('sex')
  if (!values.sbp) missingRequired.add('sbp')
  if (!values.tc || Number(values.tc) <= 0) missingRequired.add('tc')
  if (!values.hdl || Number(values.hdl) <= 0) missingRequired.add('hdl')
  if (!values.tg || Number(values.tg) <= 0) missingRequired.add('tg')

  const hasUsableLdl = (values.ldl && Number(values.ldl) > 0) || (derived.friedewaldLdl !== null && derived.friedewaldLdl > 0)
  if (!hasUsableLdl) missingRequired.add('ldl')

  return {
    isValid: missingRequired.size === 0,
    missingRequired: Array.from(missingRequired),
  }
}

export function userInputToFormValues(input?: Partial<UserInput> | null): InputFormValues {
  if (!input) return { ...EMPTY_FORM_VALUES }

  return {
    age: input.age?.toString() ?? '',
    sex: input.sex ?? '',
    sbp: input.sbp?.toString() ?? '',
    onBpMeds: input.onBpMeds ?? false,
    smoker: input.smoker ?? false,
    tc: input.tc?.toString() ?? '',
    ldl: input.ldl?.toString() ?? '',
    hdl: input.hdl?.toString() ?? '',
    tg: input.tg?.toString() ?? '',
    heightCm: input.heightCm?.toString() ?? '',
    weightKg: input.weightKg?.toString() ?? '',
    egfr: input.egfr?.toString() ?? '',
    onStatin: input.onStatin ?? false,
    ascvd: input.ascvd ?? false,
    dm: input.dm ?? false,
    ckd: input.ckd ?? 'none',
    fh: input.fh ?? false,
    familyHistoryPrematureASCVD: input.familyHistoryPrematureASCVD ?? false,
    cacScore: input.cacScore?.toString() ?? '',
    lpA: input.lpA?.toString() ?? '',
    apoB: input.apoB?.toString() ?? '',
  }
}

export function formValuesToUserInput(values: InputFormValues): UserInput {
  const derived = calculateDerivedMetrics(values)
  const ldl = parseOptionalNumber(values.ldl) ?? derived.friedewaldLdl

  if (ldl === null) {
    throw new Error('LDL is required before converting form values to UserInput')
  }

  return {
    age: parseRequiredNumber(values.age),
    sex: values.sex === 'female' ? 'female' : 'male',
    sbp: parseRequiredNumber(values.sbp),
    onBpMeds: values.onBpMeds,
    smoker: values.smoker,
    tc: parseRequiredNumber(values.tc),
    ldl,
    hdl: parseRequiredNumber(values.hdl),
    tg: parseRequiredNumber(values.tg),
    heightCm: parseOptionalNumber(values.heightCm),
    weightKg: parseOptionalNumber(values.weightKg),
    bmi: derived.bmi,
    egfr: parseOptionalNumber(values.egfr),
    onStatin: values.onStatin,
    ascvd: values.ascvd,
    dm: values.dm,
    ckd: values.ckd,
    fh: values.fh,
    familyHistoryPrematureASCVD: values.familyHistoryPrematureASCVD,
    cacScore: parseOptionalNumber(values.cacScore),
    lpA: parseOptionalNumber(values.lpA),
    apoB: parseOptionalNumber(values.apoB),
    ldlSource: derived.ldlSource,
  }
}
