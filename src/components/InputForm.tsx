import { useState } from 'react'
import type { UserInput } from '../types'

interface Props {
  onSubmit: (input: UserInput) => void
  initialInput?: Partial<UserInput>
}

type CKDLevel = 'none' | 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'

function getLipidColor(field: 'tc' | 'ldl' | 'hdl' | 'tg', value: string, sex: 'male' | 'female' | ''): string | undefined {
  const num = parseFloat(value)
  if (!value || isNaN(num) || num <= 0) return undefined

  switch (field) {
    case 'tc': return num >= 200 ? '#EF4444' : '#10B981'
    case 'ldl': return num >= 100 ? '#EF4444' : '#10B981'
    case 'hdl':
      if (!sex) return undefined
      return (sex === 'male' && num <= 40) || (sex === 'female' && num <= 50) ? '#EF4444' : '#10B981'
    case 'tg': return num >= 150 ? '#EF4444' : '#10B981'
  }
}

export function InputForm({ onSubmit, initialInput }: Props) {
  const [age, setAge] = useState(initialInput?.age?.toString() ?? '')
  const [sex, setSex] = useState<'male' | 'female' | ''>(initialInput?.sex ?? '')
  const [sbp, setSbp] = useState(initialInput?.sbp?.toString() ?? '')
  const [onBpMeds, setOnBpMeds] = useState(initialInput?.onBpMeds ?? false)
  const [smoker, setSmoker] = useState(initialInput?.smoker ?? false)
  const [tc, setTc] = useState(initialInput?.tc?.toString() ?? '')
  const [ldl, setLdl] = useState(initialInput?.ldl?.toString() ?? '')
  const [hdl, setHdl] = useState(initialInput?.hdl?.toString() ?? '')
  const [tg, setTg] = useState(initialInput?.tg?.toString() ?? '')
  const [ascvd, setAscvd] = useState(initialInput?.ascvd ?? false)
  const [dm, setDm] = useState(initialInput?.dm ?? false)
  const [ckd, setCkd] = useState<CKDLevel>(initialInput?.ckd ?? 'none')
  const [fh, setFh] = useState(initialInput?.fh ?? false)
  const [familyHistoryPrematureASCVD, setFamilyHistoryPrematureASCVD] = useState(initialInput?.familyHistoryPrematureASCVD ?? false)
  const [cacScore, setCacScore] = useState(initialInput?.cacScore?.toString() ?? '')
  const [lpA, setLpA] = useState(initialInput?.lpA?.toString() ?? '')
  const [apoB, setApoB] = useState(initialInput?.apoB?.toString() ?? '')

  const nonHdl = tc && hdl ? (parseFloat(tc) - parseFloat(hdl)).toFixed(1) : '—'

  // Friedewald LDL estimation (valid only when TG < 400 mg/dL)
  const tcNum = parseFloat(tc)
  const hdlNum = parseFloat(hdl)
  const tgNum = parseFloat(tg)
  const friedewaldLdl =
    tc && hdl && tg && !isNaN(tcNum) && !isNaN(hdlNum) && !isNaN(tgNum) && tgNum > 0 && tgNum < 400
      ? Math.round((tcNum - hdlNum - tgNum / 5) * 10) / 10
      : null
  const tgTooHigh = tg && tgNum >= 400

  // LDL source: use measured if provided, else Friedewald
  const effectiveLdl = ldl ? parseFloat(ldl) : friedewaldLdl
  const ldlSource: 'measured' | 'friedewald' = ldl ? 'measured' : 'friedewald'

  const isValid =
    age && sex && sbp && tc && hdl && tg &&
    parseInt(age) >= 18 && parseInt(age) <= 90 &&
    parseFloat(tc) > 0 &&
    parseFloat(hdl) > 0 && parseFloat(tg) > 0 &&
    effectiveLdl !== null && effectiveLdl > 0

  const handleSubmit = () => {
    if (!isValid || effectiveLdl === null) return
    onSubmit({
      age: parseInt(age),
      sex: sex as 'male' | 'female',
      sbp: parseFloat(sbp),
      onBpMeds,
      smoker,
      tc: parseFloat(tc),
      ldl: effectiveLdl,
      hdl: parseFloat(hdl),
      tg: parseFloat(tg),
      ascvd, dm, ckd, fh,
      familyHistoryPrematureASCVD,
      cacScore: cacScore ? parseFloat(cacScore) : null,
      lpA: lpA ? parseFloat(lpA) : null,
      apoB: apoB ? parseFloat(apoB) : null,
      ldlSource,
    })
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#64748B',
    fontWeight: 500,
    marginBottom: '4px',
    display: 'block',
  }

  const ToggleBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: '9999px',
        border: `1.5px solid ${active ? '#0052CC' : '#E2E8F0'}`,
        background: active ? '#0052CC' : 'white',
        color: active ? 'white' : '#64748B',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: '16px', marginTop: '4px' }}>
      {children}
    </div>
  )

  const lipidFields: { label: string; field: 'tc' | 'ldl' | 'hdl' | 'tg'; value: string; setter: (v: string) => void; placeholder: string; optional?: boolean }[] = [
    { label: '總膽固醇 (TC)', field: 'tc', value: tc, setter: setTc, placeholder: '200' },
    { label: 'LDL-C（壞膽固醇）', field: 'ldl', value: ldl, setter: setLdl, placeholder: '選填', optional: true },
    { label: 'HDL-C（好膽固醇）', field: 'hdl', value: hdl, setter: setHdl, placeholder: '55' },
    { label: '三酸甘油酯 (TG)', field: 'tg', value: tg, setter: setTg, placeholder: '150' },
  ]

  return (
    <div className="form-outer-wrap">
      <div className="form-layout">

      {/* 左欄：基本資料 + 血脂數值 */}
      <div className="form-left-col">

      {/* 基本資料 — 2x2 grid */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionTitle>基本資料</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>年齡（歲）</label>
            <input className="input-underline" type="number" placeholder="18–90" value={age} onChange={e => setAge(e.target.value)} min={18} max={90} />
          </div>
          <div>
            <label style={labelStyle}>性別</label>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
              <ToggleBtn active={sex === 'male'} onClick={() => setSex('male')}>男</ToggleBtn>
              <ToggleBtn active={sex === 'female'} onClick={() => setSex('female')}>女</ToggleBtn>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>收縮壓（mmHg）</label>
            <input className="input-underline" type="number" placeholder="120" value={sbp} onChange={e => setSbp(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>服用降壓藥？</label>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
              <ToggleBtn active={onBpMeds} onClick={() => setOnBpMeds(true)}>是</ToggleBtn>
              <ToggleBtn active={!onBpMeds} onClick={() => setOnBpMeds(false)}>否</ToggleBtn>
            </div>
          </div>
        </div>
      </div>

      {/* 血脂數值 — 含即時顏色提示 */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionTitle>血脂數值（mg/dL）</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {lipidFields.map(({ label, field, value, setter, placeholder, optional }) => {
            const hintColor = field === 'ldl' && !value && friedewaldLdl !== null
              ? '#F59E0B'
              : getLipidColor(field, value, sex)
            const isLdlEstimated = field === 'ldl' && !value && friedewaldLdl !== null
            return (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: isLdlEstimated ? 'none' : '1px solid #F0F0F0' }}>
                  <div style={{ flex: 1, fontSize: '0.9rem', color: '#0A2540', fontWeight: 500 }}>
                    {label}
                    {optional && (
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 400, marginLeft: '4px' }}>(選填)</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={isLdlEstimated ? String(friedewaldLdl) : placeholder}
                      style={{
                        width: '80px',
                        border: 'none',
                        borderBottom: `2px solid ${hintColor ?? '#E2E8F0'}`,
                        padding: '6px 4px',
                        textAlign: 'right',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: hintColor ?? '#0052CC',
                        background: 'transparent',
                        outline: 'none',
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748B', width: '40px' }}>mg/dL</span>
                  </div>
                </div>
                {/* Friedewald 估算提示行 */}
                {field === 'ldl' && !value && (
                  <div style={{
                    padding: '4px 0 8px 0',
                    borderBottom: '1px solid #F0F0F0',
                    fontSize: '0.72rem',
                  }}>
                    {tgTooHigh ? (
                      <span style={{ color: '#EF4444' }}>⚠️ TG ≥ 400 mg/dL，Friedewald 公式不適用，請輸入實測 LDL</span>
                    ) : friedewaldLdl !== null ? (
                      <span style={{ color: '#B45309' }}>🔶 由 Friedewald 公式估算：TC − HDL − TG/5 = <strong>{friedewaldLdl} mg/dL</strong></span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>輸入 TC、HDL、TG 後可自動估算 LDL</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {/* Non-HDL 即時計算 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#64748B' }}>Non-HDL（自動計算）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '80px', textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: '#64748B', padding: '6px 4px' }}>{nonHdl}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', width: '40px' }}>mg/dL</span>
            </div>
          </div>
        </div>
      </div>

      </div>{/* end form-left-col */}

      {/* 右欄：共病症 */}
      <div className="form-right-col">

      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionTitle>共病症 / 風險因子</SectionTitle>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>是否曾確診以下疾病？</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <ToggleBtn active={ascvd} onClick={() => setAscvd(!ascvd)}>心肌梗塞/中風/周邊動脈疾病</ToggleBtn>
            <ToggleBtn active={dm} onClick={() => setDm(!dm)}>糖尿病</ToggleBtn>
            <ToggleBtn active={fh} onClick={() => setFh(!fh)}>家族性高膽固醇血症 (FH)</ToggleBtn>
            <ToggleBtn active={smoker} onClick={() => setSmoker(!smoker)}>吸菸</ToggleBtn>
          </div>
        </div>

        {/* CKD — select dropdown */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>慢性腎臟病（CKD）分期</label>
          <select
            value={ckd}
            onChange={e => setCkd(e.target.value as CKDLevel)}
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
            <option value="none">無</option>
            <option value="G1">腎功能正常（G1）</option>
            <option value="G2">腎功能輕度下降（G2）</option>
            <option value="G3a">輕至中度下降（G3a）</option>
            <option value="G3b">中度下降（G3b）</option>
            <option value="G4">重度下降（G4）</option>
            <option value="G5">極重度下降/腎衰竭（G5）</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>早發 ASCVD 家族史</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ToggleBtn active={familyHistoryPrematureASCVD} onClick={() => setFamilyHistoryPrematureASCVD(true)}>有</ToggleBtn>
            <ToggleBtn active={!familyHistoryPrematureASCVD} onClick={() => setFamilyHistoryPrematureASCVD(false)}>無</ToggleBtn>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>CAC score</label>
            <input className="input-underline" type="number" placeholder="選填" value={cacScore} onChange={e => setCacScore(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Lp(a)（mg/dL）</label>
            <input className="input-underline" type="number" placeholder="選填" value={lpA} onChange={e => setLpA(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>ApoB（mg/dL）</label>
          <input className="input-underline" type="number" placeholder="選填" value={apoB} onChange={e => setApoB(e.target.value)} />
        </div>
      </div>

      {/* Desktop inline CTA */}
      <div className="desktop-only" style={{ marginTop: '8px' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: isValid ? '#0052CC' : '#E2E8F0',
            color: isValid ? 'white' : '#94A3B8',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}
        >
          查看分析結果 →
        </button>
      </div>

      </div>{/* end form-right-col */}
      </div>{/* end form-layout */}

      {/* Mobile inline CTA — placed after all content, no fixed overlay */}
      <div className="mobile-only" style={{ marginTop: '16px', paddingBottom: '24px' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: isValid ? '#0052CC' : '#E2E8F0',
            color: isValid ? 'white' : '#94A3B8',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed',
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
