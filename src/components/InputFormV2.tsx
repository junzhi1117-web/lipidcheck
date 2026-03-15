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

const labelStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748B',
  fontWeight: 500,
  marginBottom: '4px',
  display: 'block',
}

const subtleTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#94A3B8',
}

const twoColumnGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
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
  gap = '8px',
  wrap = false,
  paddingTop = '0px',
}: {
  value: T
  options: FieldOption<T>[]
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'number' | 'text'
  min?: number
  max?: number
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        className="input-underline"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
      />
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
          color: isMuted ? '#94A3B8' : '#0A2540',
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  suffix: string
  optional?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
      <div style={{ flex: 1, fontSize: '0.9rem', color: '#0A2540', fontWeight: 500 }}>
        {label}
        {optional && <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 400, marginLeft: '4px' }}>(選填)</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '80px',
            border: 'none',
            borderBottom: '2px solid #E2E8F0',
            padding: '6px 4px',
            textAlign: 'right',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0052CC',
            background: 'transparent',
            outline: 'none',
          }}
        />
        <span style={{ fontSize: '0.75rem', color: '#64748B', width: '40px' }}>{suffix}</span>
      </div>
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
        backgroundColor: disabled ? '#E2E8F0' : '#0052CC',
        color: disabled ? '#94A3B8' : 'white',
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
        style: { marginBottom: '16px' },
        content: (
          <>
            <div style={{ ...twoColumnGridStyle, marginBottom: '20px' }}>
              <TextField
                label="年齡（歲）"
                placeholder="18–90"
                value={values.age}
                onChange={value => setNumericField('age', value)}
                min={18}
                max={90}
              />
              <div>
                <label style={labelStyle}>性別</label>
                <ToggleGroup value={values.sex} options={SEX_OPTIONS} onChange={value => setValues(prev => ({ ...prev, sex: value }))} paddingTop="8px" />
              </div>
            </div>

            <div style={{ ...twoColumnGridStyle, marginBottom: '20px' }}>
              <TextField
                label="收縮壓（mmHg）"
                placeholder="120"
                value={values.sbp}
                onChange={value => setNumericField('sbp', value)}
              />
              <div>
                <label style={labelStyle}>服用降壓藥？</label>
                <ToggleGroup
                  value={values.onBpMeds ? 'yes' : 'no'}
                  options={[{ label: '是', value: 'yes' }, { label: '否', value: 'no' }]}
                  onChange={value => setToggleField('onBpMeds', value === 'yes')}
                  paddingTop="8px"
                />
              </div>
            </div>

            <div style={{ ...twoColumnGridStyle, marginBottom: '20px' }}>
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
        style: { marginBottom: '16px' },
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {LIPID_FIELDS.map(field => {
              const showEstimated = field.name === 'ldl' && !values.ldl
              const placeholder = showEstimated && derived.friedewaldLdl !== null ? String(derived.friedewaldLdl) : field.placeholder

              return (
                <div key={field.name}>
                  <LipidRow
                    label={field.label}
                    value={values[field.name]}
                    onChange={value => setNumericField(field.name, value)}
                    placeholder={placeholder}
                    suffix={field.suffix ?? 'mg/dL'}
                    optional={field.optional}
                  />
                  {field.name === 'ldl' && !values.ldl && (
                    <div style={{ padding: '4px 0 8px 0', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem' }}>
                      {derived.tgTooHighForFriedewald ? (
                        <span style={{ color: '#EF4444' }}>⚠️ TG ≥ 400 mg/dL，Friedewald 公式不適用，請輸入實測 LDL</span>
                      ) : derived.friedewaldLdl !== null ? (
                        <span style={{ color: '#B45309' }}>🔶 由 Friedewald 公式估算：TC − HDL − TG/5 = <strong>{derived.friedewaldLdl} mg/dL</strong></span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>輸入 TC、HDL、TG 後可自動估算 LDL</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
              <div style={{ flex: 1, fontSize: '0.9rem', color: '#64748B' }}>Non-HDL（自動計算）</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '80px', textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: '#64748B', padding: '6px 4px' }}>
                  {derived.nonHdl !== null ? derived.nonHdl : '—'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', width: '40px' }}>mg/dL</span>
              </div>
            </div>
          </div>
        ),
      },
    ]
  }, [derived.bmi, derived.friedewaldLdl, derived.nonHdl, derived.tgTooHighForFriedewald, values])

  const rightSections = useMemo<FormSectionConfig[]>(() => {
    return [
      {
        key: 'comorbidity',
        title: '共病症 / 風險因子',
        style: { marginBottom: '16px' },
        content: (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>是否曾確診以下疾病？</label>
              <ToggleGroup
                value={JSON.stringify(COMORBIDITY_TOGGLES.map(toggle => values[toggle.name]))}
                options={[]}
                onChange={() => undefined}
                wrap
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>慢性腎臟病（CKD）分期</label>
              <select
                value={values.ckd}
                onChange={e => setValues(prev => ({ ...prev, ckd: e.target.value as InputFormValues['ckd'] }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: 'white',
                  color: '#0A2540',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'auto',
                }}
              >
                {CKD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>早發 ASCVD 家族史</label>
              <ToggleGroup
                value={values.familyHistoryPrematureASCVD ? 'yes' : 'no'}
                options={[{ label: '有', value: 'yes' }, { label: '無', value: 'no' }]}
                onChange={value => setToggleField('familyHistoryPrematureASCVD', value === 'yes')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                component tree phase：section 已抽出，下一步可補欄位錯誤提示與 visual states。
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-only" style={{ marginTop: '16px', paddingBottom: '24px' }}>
        <SubmitButton disabled={!validation.isValid} onClick={handleSubmit} />
      </div>
    </div>
  )
}
