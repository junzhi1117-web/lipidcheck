import type {
  CKDLevel,
  FieldOption,
  InputFormValues,
  TextFieldConfig,
  ToggleFieldConfig,
} from './types'

export const DEFAULT_CKD_LEVEL: CKDLevel = 'none'

export const EMPTY_FORM_VALUES: InputFormValues = {
  age: '',
  sex: '',
  sbp: '',
  onBpMeds: false,
  smoker: false,
  tc: '',
  ldl: '',
  hdl: '',
  tg: '',
  heightCm: '',
  weightKg: '',
  egfr: '',
  onStatin: false,
  ascvd: false,
  dm: false,
  ckd: DEFAULT_CKD_LEVEL,
  fh: false,
  familyHistoryPrematureASCVD: false,
  cacScore: '',
  lpA: '',
  apoB: '',
}

export const SEX_OPTIONS: FieldOption<'male' | 'female'>[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

export const CKD_OPTIONS: FieldOption<CKDLevel>[] = [
  { label: '無', value: 'none' },
  { label: '腎功能正常（G1）', value: 'G1' },
  { label: '腎功能輕度下降（G2）', value: 'G2' },
  { label: '輕至中度下降（G3a）', value: 'G3a' },
  { label: '中度下降（G3b）', value: 'G3b' },
  { label: '重度下降（G4）', value: 'G4' },
  { label: '極重度下降/腎衰竭（G5）', value: 'G5' },
]

export const BASIC_INFO_FIELDS: TextFieldConfig[] = [
  { name: 'age', label: '年齡（歲）', placeholder: '18–90', inputMode: 'numeric' },
  { name: 'sbp', label: '收縮壓（mmHg）', placeholder: '120', inputMode: 'numeric' },
  { name: 'heightCm', label: '身高（cm）', placeholder: '170', inputMode: 'numeric', optional: true },
  { name: 'weightKg', label: '體重（kg）', placeholder: '70', inputMode: 'numeric', optional: true },
  { name: 'egfr', label: 'eGFR', placeholder: '90', inputMode: 'numeric', optional: true },
]

export const LIPID_FIELDS: TextFieldConfig[] = [
  { name: 'tc', label: '總膽固醇 (TC)', placeholder: '200', inputMode: 'numeric', suffix: 'mg/dL' },
  { name: 'ldl', label: 'LDL-C（壞膽固醇）', placeholder: '選填', inputMode: 'numeric', optional: true, suffix: 'mg/dL' },
  { name: 'hdl', label: 'HDL-C（好膽固醇）', placeholder: '55', inputMode: 'numeric', suffix: 'mg/dL' },
  { name: 'tg', label: '三酸甘油酯 (TG)', placeholder: '150', inputMode: 'numeric', suffix: 'mg/dL' },
]

export const COMORBIDITY_TOGGLES: ToggleFieldConfig[] = [
  { name: 'ascvd', label: '心肌梗塞/中風/周邊動脈疾病' },
  { name: 'dm', label: '糖尿病' },
  { name: 'fh', label: '家族性高膽固醇血症 (FH)' },
  { name: 'smoker', label: '吸菸' },
  { name: 'onStatin', label: '目前有吃 statin' },
]

export const ADVANCED_FIELDS: TextFieldConfig[] = [
  { name: 'cacScore', label: 'CAC score', placeholder: '選填', inputMode: 'numeric', optional: true },
  { name: 'lpA', label: 'Lp(a)（mg/dL）', placeholder: '選填', inputMode: 'numeric', optional: true },
  { name: 'apoB', label: 'ApoB（mg/dL）', placeholder: '選填', inputMode: 'numeric', optional: true },
]
