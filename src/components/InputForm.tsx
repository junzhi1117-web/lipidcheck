import { useState } from 'react'
import type { UserInput } from '../types'

interface Props {
  onSubmit: (input: UserInput) => void
}

type CKDLevel = 'none' | 'G3a' | 'G3b' | 'G4' | 'G5'

export function InputForm({ onSubmit }: Props) {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [sbp, setSbp] = useState('')
  const [onBpMeds, setOnBpMeds] = useState(false)
  const [smoker, setSmoker] = useState(false)
  const [tc, setTc] = useState('')
  const [ldl, setLdl] = useState('')
  const [hdl, setHdl] = useState('')
  const [tg, setTg] = useState('')
  const [ascvd, setAscvd] = useState(false)
  const [dm, setDm] = useState(false)
  const [ckd, setCkd] = useState<CKDLevel>('none')
  const [fh, setFh] = useState(false)

  const nonHdl = tc && hdl ? (parseFloat(tc) - parseFloat(hdl)).toFixed(1) : '—'

  const isValid =
    age && sex && sbp && tc && ldl && hdl && tg &&
    parseInt(age) >= 18 && parseInt(age) <= 90 &&
    parseFloat(tc) > 0 && parseFloat(ldl) > 0 &&
    parseFloat(hdl) > 0 && parseFloat(tg) > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      age: parseInt(age),
      sex: sex as 'male' | 'female',
      sbp: parseFloat(sbp),
      onBpMeds,
      smoker,
      tc: parseFloat(tc),
      ldl: parseFloat(ldl),
      hdl: parseFloat(hdl),
      tg: parseFloat(tg),
      ascvd, dm, ckd, fh,
    })
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#6C757D',
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
        border: `1.5px solid ${active ? '#006A7A' : '#DEE2E6'}`,
        background: active ? '#006A7A' : 'white',
        color: active ? 'white' : '#6C757D',
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
    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C757D', marginBottom: '16px', marginTop: '4px' }}>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '24px 20px 100px' }}>

      {/* 基本資料 */}
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

      {/* 血脂數值 */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionTitle>血脂數值（mg/dL）</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { label: '總膽固醇 (TC)', value: tc, setter: setTc, placeholder: '200' },
            { label: 'LDL-C（壞膽固醇）', value: ldl, setter: setLdl, placeholder: '130' },
            { label: 'HDL-C（好膽固醇）', value: hdl, setter: setHdl, placeholder: '55' },
            { label: '三酸甘油酯 (TG)', value: tg, setter: setTg, placeholder: '150' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ flex: 1, fontSize: '0.9rem', color: '#212529', fontWeight: 500 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '80px', border: 'none', borderBottom: '2px solid #DEE2E6', padding: '6px 4px', textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: '#006A7A', background: 'transparent', outline: 'none' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6C757D', width: '40px' }}>mg/dL</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#6C757D' }}>Non-HDL（自動計算）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '80px', textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: '#6C757D', padding: '6px 4px' }}>{nonHdl}</span>
              <span style={{ fontSize: '0.75rem', color: '#6C757D', width: '40px' }}>mg/dL</span>
            </div>
          </div>
        </div>
      </div>

      {/* 共病症 */}
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

        <div>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>慢性腎臟病（CKD）分期</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(['none', 'G3a', 'G3b', 'G4', 'G5'] as CKDLevel[]).map(level => (
              <ToggleBtn key={level} active={ckd === level} onClick={() => setCkd(level)}>
                {level === 'none' ? '無' : level}
              </ToggleBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', backgroundColor: 'rgba(248,249,250,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid #DEE2E6', zIndex: 10 }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: isValid ? '#FF6F61' : '#DEE2E6',
              color: isValid ? 'white' : '#9AA0A6',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            查看分析結果 →
          </button>
        </div>
      </div>
    </div>
  )
}
