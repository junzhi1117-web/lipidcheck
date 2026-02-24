import { RISK_COLORS } from '../types'
import type { RiskLevel } from '../types'

interface Props {
  riskLevel?: RiskLevel
}

export function WaveHeader({ riskLevel }: Props) {
  const waveColor = riskLevel ? RISK_COLORS[riskLevel] : '#006A7A'

  return (
    <div style={{ position: 'relative', backgroundColor: '#006A7A', paddingTop: '48px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center', overflow: 'hidden' }}>
      {/* Background circles */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: 10, left: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
            <path d="M12 26 L18 20 L24 28 L30 16 L36 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: 0, fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.01em' }}>
          LipidCheck
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
          血脂智能判讀
        </p>
      </div>

      {/* Wave SVG */}
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '48px', transition: 'fill 0.6s ease' }}
      >
        <path
          d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,80 L0,80 Z"
          fill={waveColor}
          opacity="0.25"
        />
        <path
          d="M0,55 C200,20 400,70 600,50 C800,30 1000,65 1200,45 L1200,80 L0,80 Z"
          fill="#F8F9FA"
        />
      </svg>
    </div>
  )
}
