import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { UserInput } from '../types'
import {
  ADVANCED_FIELDS,
  CKD_OPTIONS,
  COMORBIDITY_TOGGLES,
  LIPID_FIELDS,
  SEX_OPTIONS,
} from '../features/input-v2/formDefaults'
import {
  calculateDerivedMetrics,
  formValuesToUserInput,
  userInputToFormValues,
  validateForm,
} from '../features/input-v2/mapper'
import type {
  FieldOption,
  FormSectionConfig,
  InputFormValues,
  NumericFieldName,
  ToggleFieldName,
} from '../features/input-v2/types'

interface Props {
  onSubmit: (input: UserInput) => void
  initialInput?: Partial<UserInput>
}

const COLORS = {
  text: '#0A2540',
  muted: '#64748B',
  subtle: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F0F0F0',
  primary: '#0052CC',
  danger: '#DC2626',
  warning: '#F59E0B',
  warningText: '#B45309',
  success: '#10B981',
  successText: '#047857',
} as const

const SIZES = {
  inputWidth: '80px',
  unitWidth: '40px',
  cardGap: '16px',
  fieldGap: '20px',
  compactGap: '12px',
  inlineGap: '8px',
} as const

const labelStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: COLORS.muted,
  fontWeight: 500,
  marginBottom: '4px',
  display: 'block',
}

const subtleTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: COLORS.subtle,
}

const errorTextStyle: CSSProperties = {
  fontSize: '0.72rem',
  color: COLORS.danger,
  marginTop: '6px',
}

const warningTextStyle: CSSProperties = {
  fontSize: '0.72rem',
  color: COLORS.warningText,
  marginTop: '6px',
}

const infoTextStyle: CSSProperties = {
  fontSize: '0.72rem',
  color: COLORS.muted,
  marginTop: '6px',
}

const twoColumnGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: SIZES.fieldGap,
}

const compactGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: SIZES.compactGap,
  marginBottom: SIZES.compactGap,
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
}

const rowLabelStyle: CSSProperties = {
  flex: 1,
  fontSize: '0.9rem',
  color: COLORS.text,
  fontWeight: 500,
}

const rowValueWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: `1.5px solid ${COLORS.border}`,
  backgroundColor: 'white',
  color: COLORS.text,
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  appearance: 'auto',
}

const yesNoOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
] as const

const familyHistoryOptions = [
  { label: '有', value: 'yes' },
  { label: '無', value: 'no' },
] as const

const requiredFieldLabels: Partial<Record<keyof InputFormValues, string>> = {
  age: '年齡',
  sex: '性別',
  sbp: '收縮壓',
  tc: '總膽固醇',
  ldl: 'LDL',
  hdl: 'HDL-C',
  tg: 'TG',
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="section-title">{children}</div>
}

function SectionCard({ title, children, style, className }: { title: string; children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={className ?? 'card'} style={style}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`pill-toggle ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  gap = SIZES.inlineGap,
  wrap = false,
  paddingTop = '0px',
}: {
  value: T
  options: ReadonlyArray<FieldOption<T>>
  onChange: (value: T) => void
  gap?: string
  wrap?: boolean
  paddingTop?: string
}) {
  return (
    <div style={{ display: 'flex', gap, flexWrap: wrap ? 'wrap' : 'nowrap', paddingTop }}>
      {options.map(option => (
        <PillButton key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </PillButton>
      ))}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'number',
  min,
  max,
  invalid = false,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'number' | 'text'
  min?: number
  max?: number
  invalid?: boolean
  helper?: ReactNode
}) {
  return (
    <div>
      <label style={{ ...labelStyle, color: invalid ? COLORS.danger : labelStyle.color }}>{label}</label>
      <input
        className="input-underline"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        style={invalid ? { borderBottomColor: COLORS.danger } : undefined}
      />
      {helper}
    </div>
  )
}

function ComputedField({ label, value, mutedValue }: { label: string; value: string | number | null; mutedValue: string }) {
  const displayValue = value === null || value === '' ? mutedValue : value
  const isMuted = value === null || value === ''

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        className="input-underline"
        style={{
          paddingTop: '10px',
          minHeight: '42px',
          color: isMuted ? COLORS.subtle : COLORS.text,
          fontWeight: 600,
        }}
      >
        {displayValue}
      </div>
    </div>
  )
}

function LipidRow({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  optional,
  invalid,
  tone,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  suffix: string
  optional?: boolean
  invalid?: boolean
  tone?: 'default' | 'warning' | 'success'
  helper?: ReactNode
}) {
  const borderColor = invalid ? COLORS.danger : tone === 'warning' ? COLORS.warning : tone === 'success' ? COLORS.success : COLORS.border
  const textColor = invalid ? COLORS.danger : tone === 'warning' ? COLORS.warningText : tone === 'success' ? COLORS.successText : COLORS.primary

  return (
    <div>
      <div style={{ ...rowStyle, borderBottom: helper ? 'none' : `1px solid ${COLORS.borderLight}` }}>
        <div style={{ ...rowLabelStyle, color: invalid ? COLORS.danger : COLORS.text }}>
          {label}
          {optional && <span style={{ fontSize: '0.7rem', color: COLORS.subtle, fontWeight: 400, marginLeft: '4px' }}>(選填)</span>}
        </div>
        <div style={rowValueWrapStyle}>
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: SIZES.inputWidth,
              border: 'none',
              borderBottom: `2px solid ${borderColor}`,
              padding: '6px 4px',
              textAlign: 'right',
              fontSize: '1rem',
              fontWeight: 600,
              color: textColor,
              background: 'transparent',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: COLORS.muted, width: SIZES.unitWidth }}>{suffix}</span>
        </div>
      </div>
      {helper && <div style={{ padding: '4px 0 8px 0', borderBottom: `1px solid ${COLORS.borderLight}` }}>{helper}</div>}
    </div>
  )
}

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: '14px',
        border: 'none',
        backgroundColor: disabled ? COLORS.border : COLORS.primary,
        color: disabled ? COLORS.subtle : 'white',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '0.02em',
      }}
    >
      查看分析結果 →
    </button>
  )
}

export function InputFormV2({ onSubmit, initialInput }: Props) {
  const [values, setValues] = useState<InputFormValues>(() => userInputToFormValues(initialInput))

  const derived = useMemo(() => calculateDerivedMetrics(values), [values])
  const validation = useMemo(() => validateForm(values), [values])

  const missingRequiredSet = useMemo(() => new Set(validation.missingRequired), [validation.missingRequired])
  const missingRequiredLabels = useMemo(
    () => validation.missingRequired.map(field => requiredFieldLabels[field]).filter(Boolean) as string[],
    [validation.missingRequired],
  )

  const setNumericField = (name: NumericFieldName, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const setToggleField = (name: ToggleFieldName, value: boolean) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (!validation.isValid) return
    onSubmit(formValuesToUserInput(values))
  }

  const leftSections = useMemo<FormSectionConfig[]>(() => {
    return [
      {
        key: 'basic-info',
        title: '基本資料',
        style: { marginBottom: SIZES.cardGap },
        content: (
          <>
            <div style={{ ...twoColumnGridStyle, marginBottom: SIZES.fieldGap }}>
              <TextField
                label="年齡（歲）"
                placeholder="18–90"
                value={values.age}
                onChange={value => setNumericField('age', value)}
                min={18}
                max={90}
                invalid={missingRequiredSet.has('age')}
                helper={missingRequiredSet.has('age') ? <div style={errorTextStyle}>請輸入 18–90 歲的有效年齡</div> : undefined}
              />
              <div>
                <label style={{ ...labelStyle, color: missingRequiredSet.has('sex') ? COLORS.danger : labelStyle.color }}>性別</label>
                <ToggleGroup value={values.sex} options={SEX_OPTIONS} onChange={value => setValues(prev => ({ ...prev, sex: value }))} paddingTop="8px" />
                {missingRequiredSet.has('sex') && <div style={errorTextStyle}>請選擇性別</div>}
              </div>
            </div>

            <div style={{ ...twoColumnGridStyle, marginBottom: SIZES.fieldGap }}>
              <TextField
                label="收縮壓（mmHg）"
                placeholder="120"
                value={values.sbp}
                onChange={value => setNumericField('sbp', value)}
                invalid={missingRequiredSet.has('sbp')}
                helper={missingRequiredSet.has('sbp') ? <div style={errorTextStyle}>請輸入收縮壓</div> : undefined}
              />
              <div>
                <label style={labelStyle}>服用降壓藥？</label>
                <ToggleGroup
                  value={values.onBpMeds ? 'yes' : 'no'}
                  options={yesNoOptions}
                  onChange={value => setToggleField('onBpMeds', value === 'yes')}
                  paddingTop="8px"
                />
              </div>
            </div>

            <div style={{ ...twoColumnGridStyle, marginBottom: SIZES.fieldGap }}>
              <TextField
                label="身高（cm）"
                placeholder="170"
                value={values.heightCm}
                onChange={value => setNumericField('heightCm', value)}
              />
              <TextField
                label="體重（kg）"
                placeholder="70"
                value={values.weightKg}
                onChange={value => setNumericField('weightKg', value)}
              />
            </div>

            <div style={twoColumnGridStyle}>
              <ComputedField label="BMI（自動計算）" value={derived.bmi} mutedValue="請輸入身高與體重" />
              <TextField
                label="eGFR"
                placeholder="90"
                value={values.egfr}
                onChange={value => setNumericField('egfr', value)}
              />
            </div>
          </>
        ),
      },
      {
        key: 'lipids',
        title: '血脂數值（mg/dL）',
        style: { marginBottom: SIZES.cardGap },
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {LIPID_FIELDS.map(field => {
              const isMissing = missingRequiredSet.has(field.name)
              const showEstimated = field.name === 'ldl' && !values.ldl
              const placeholder = showEstimated && derived.friedewaldLdl !== null ? String(derived.friedewaldLdl) : field.placeholder

              let tone: 'default' | 'warning' | 'success' = 'default'
              let helper: ReactNode = null

              if (field.name === 'ldl') {
                if (derived.tgTooHighForFriedewald && !values.ldl) {
                  tone = 'warning'
                  helper = <span style={errorTextStyle}>⚠️ TG ≥ 400 mg/dL，Friedewald 公式不適用，請輸入實測 LDL</span>
                } else if (!values.ldl && derived.friedewaldLdl !== null) {
                  tone = 'warning'
                  helper = <span style={warningTextStyle}>🔶 目前使用估算 LDL：TC − HDL − TG/5 = <strong>{derived.friedewaldLdl} mg/dL</strong></span>
                } else if (values.ldl) {
                  tone = 'success'
                  helper = <span style={infoTextStyle}>✅ 目前使用實測 LDL</span>
                } else {
                  helper = <span style={infoTextStyle}>輸入 TC、HDL、TG 後可自動估算 LDL</span>
                }
              } else if (isMissing) {
                helper = <span style={errorTextStyle}>此欄位為必填</span>
              }

              return (
                <LipidRow
                  key={field.name}
                  label={field.label}
                  value={values[field.name]}
                  onChange={value => setNumericField(field.name, value)}
                  placeholder={placeholder}
                  suffix={field.suffix ?? 'mg/dL'}
                  optional={field.optional}
                  invalid={isMissing && field.name !== 'ldl'}
                  tone={tone}
                  helper={helper}
                />
              )
            })}

            <div style={rowStyle}>
              <div style={{ ...rowLabelStyle, color: COLORS.muted }}>Non-HDL（自動計算）</div>
              <div style={rowValueWrapStyle}>
                <span style={{ width: SIZES.inputWidth, textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: COLORS.muted, padding: '6px 4px' }}>
                  {derived.nonHdl !== null ? derived.nonHdl : '—'}
                </span>
                <span style={{ fontSize: '0.75rem', color: COLORS.muted, width: SIZES.unitWidth }}>mg/dL</span>
              </div>
            </div>
          </div>
        ),
      },
    ]
  }, [derived.bmi, derived.friedewaldLdl, derived.nonHdl, derived.tgTooHighForFriedewald, missingRequiredSet, values])

  const rightSections = useMemo<FormSectionConfig[]>(() => {
    return [
      {
        key: 'comorbidity',
        title: '共病症 / 風險因子',
        style: { marginBottom: SIZES.cardGap },
        content: (
          <>
            <div style={{ marginBottom: SIZES.cardGap }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>是否曾確診以下疾病？</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SIZES.inlineGap }}>
                {COMORBIDITY_TOGGLES.map(toggle => (
                  <PillButton
                    key={toggle.name}
                    active={values[toggle.name]}
                    onClick={() => setToggleField(toggle.name, !values[toggle.name])}
                  >
                    {toggle.label}
                  </PillButton>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: SIZES.cardGap }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>慢性腎臟病（CKD）分期</label>
              <select
                value={values.ckd}
                onChange={e => setValues(prev => ({ ...prev, ckd: e.target.value as InputFormValues['ckd'] }))}
                style={selectStyle}
              >
                {CKD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: SIZES.cardGap }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>早發 ASCVD 家族史</label>
              <ToggleGroup
                value={values.familyHistoryPrematureASCVD ? 'yes' : 'no'}
                options={familyHistoryOptions}
                onChange={value => setToggleField('familyHistoryPrematureASCVD', value === 'yes')}
              />
            </div>

            <div style={compactGridStyle}>
              {ADVANCED_FIELDS.slice(0, 2).map(field => (
                <TextField
                  key={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={value => setNumericField(field.name, value)}
                />
              ))}
            </div>

            <TextField
              label={ADVANCED_FIELDS[2].label}
              placeholder={ADVANCED_FIELDS[2].placeholder}
              value={values.apoB}
              onChange={value => setNumericField('apoB', value)}
            />
          </>
        ),
      },
    ]
  }, [values])

  return (
    <div className="form-outer-wrap">
      <div className="form-layout">
        <div className="form-left-col">
          {leftSections.map(section => (
            <SectionCard key={section.key} title={section.title} style={section.style} className={section.className}>
              {section.content}
            </SectionCard>
          ))}
        </div>

        <div className="form-right-col">
          {rightSections.map(section => (
            <SectionCard key={section.key} title={section.title} style={section.style} className={section.className}>
              {section.content}
            </SectionCard>
          ))}

          <div className="desktop-only" style={{ marginTop: '8px' }}>
            <SubmitButton disabled={!validation.isValid} onClick={handleSubmit} />
            {!validation.isValid && (
              <div style={{ marginTop: '10px', ...subtleTextStyle }}>
                尚缺：{missingRequiredLabels.join('、')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-only" style={{ marginTop: SIZES.cardGap, paddingBottom: '24px' }}>
        <SubmitButton disabled={!validation.isValid} onClick={handleSubmit} />
        {!validation.isValid && (
          <div style={{ marginTop: '10px', ...subtleTextStyle }}>
            尚缺：{missingRequiredLabels.join('、')}
          </div>
        )}
      </div>
    </div>
  )
}
