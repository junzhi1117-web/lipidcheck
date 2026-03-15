import { useMemo, useState } from 'react'
import type { UserInput } from '../types'
import {
  ADVANCED_FIELDS,
  BASIC_INFO_FIELDS,
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
  NumericFieldName,
  ToggleFieldName,
  InputFormValues,
} from '../features/input-v2/types'

interface Props {
  onSubmit: (input: UserInput) => void
  initialInput?: Partial<UserInput>
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748B',
  fontWeight: 500,
  marginBottom: '4px',
  display: 'block',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title">{children}</div>
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`pill-toggle ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
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

  return (
    <div className="form-outer-wrap">
      <div className="form-layout">
        <div className="form-left-col">
          <div className="card" style={{ marginBottom: '16px' }}>
            <SectionTitle>基本資料</SectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>年齡（歲）</label>
                <input
                  className="input-underline"
                  type="number"
                  placeholder="18–90"
                  value={values.age}
                  onChange={e => setNumericField('age', e.target.value)}
                  min={18}
                  max={90}
                />
              </div>
              <div>
                <label style={labelStyle}>性別</label>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                  {SEX_OPTIONS.map(option => (
                    <PillButton
                      key={option.value}
                      active={values.sex === option.value}
                      onClick={() => setValues(prev => ({ ...prev, sex: option.value }))}
                    >
                      {option.label}
                    </PillButton>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>收縮壓（mmHg）</label>
                <input
                  className="input-underline"
                  type="number"
                  placeholder="120"
                  value={values.sbp}
                  onChange={e => setNumericField('sbp', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>服用降壓藥？</label>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                  <PillButton active={values.onBpMeds} onClick={() => setToggleField('onBpMeds', true)}>是</PillButton>
                  <PillButton active={!values.onBpMeds} onClick={() => setToggleField('onBpMeds', false)}>否</PillButton>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {BASIC_INFO_FIELDS.filter(field => field.name === 'heightCm' || field.name === 'weightKg').map(field => (
                <div key={field.name}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    className="input-underline"
                    type="number"
                    placeholder={field.placeholder}
                    value={values[field.name]}
                    onChange={e => setNumericField(field.name, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>BMI（自動計算）</label>
                <div className="input-underline" style={{ paddingTop: '10px', minHeight: '42px', color: derived.bmi !== null ? '#0A2540' : '#94A3B8', fontWeight: 600 }}>
                  {derived.bmi !== null ? derived.bmi : '請輸入身高與體重'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>eGFR</label>
                <input
                  className="input-underline"
                  type="number"
                  placeholder="90"
                  value={values.egfr}
                  onChange={e => setNumericField('egfr', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '16px' }}>
            <SectionTitle>血脂數值（mg/dL）</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {LIPID_FIELDS.map(field => {
                const showEstimated = field.name === 'ldl' && !values.ldl
                return (
                  <div key={field.name}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#0A2540', fontWeight: 500 }}>
                        {field.label}
                        {field.optional && (
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 400, marginLeft: '4px' }}>(選填)</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          value={values[field.name]}
                          onChange={e => setNumericField(field.name, e.target.value)}
                          placeholder={showEstimated && derived.friedewaldLdl !== null ? String(derived.friedewaldLdl) : field.placeholder}
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
                        <span style={{ fontSize: '0.75rem', color: '#64748B', width: '40px' }}>{field.suffix ?? 'mg/dL'}</span>
                      </div>
                    </div>
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
          </div>
        </div>

        <div className="form-right-col">
          <div className="card" style={{ marginBottom: '16px' }}>
            <SectionTitle>共病症 / 風險因子</SectionTitle>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>是否曾確診以下疾病？</label>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <PillButton active={values.familyHistoryPrematureASCVD} onClick={() => setToggleField('familyHistoryPrematureASCVD', true)}>有</PillButton>
                <PillButton active={!values.familyHistoryPrematureASCVD} onClick={() => setToggleField('familyHistoryPrematureASCVD', false)}>無</PillButton>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {ADVANCED_FIELDS.slice(0, 2).map(field => (
                <div key={field.name}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    className="input-underline"
                    type="number"
                    placeholder={field.placeholder}
                    value={values[field.name]}
                    onChange={e => setNumericField(field.name, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div>
              <label style={labelStyle}>{ADVANCED_FIELDS[2].label}</label>
              <input
                className="input-underline"
                type="number"
                placeholder={ADVANCED_FIELDS[2].placeholder}
                value={values.apoB}
                onChange={e => setNumericField('apoB', e.target.value)}
              />
            </div>
          </div>

          <div className="desktop-only" style={{ marginTop: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={!validation.isValid}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: validation.isValid ? '#0052CC' : '#E2E8F0',
                color: validation.isValid ? 'white' : '#94A3B8',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: validation.isValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              查看分析結果 →
            </button>
            {!validation.isValid && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94A3B8' }}>
                skeleton phase：資料層已接好，下一步可拆成 field components / section renderer。
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-only" style={{ marginTop: '16px', paddingBottom: '24px' }}>
        <button
          onClick={handleSubmit}
          disabled={!validation.isValid}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: validation.isValid ? '#0052CC' : '#E2E8F0',
            color: validation.isValid ? 'white' : '#94A3B8',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: validation.isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}
        >
          查看分析結果 →
        </button>
      </div>
    </div>
  )
}
