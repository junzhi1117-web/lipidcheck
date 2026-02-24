import type { RiskLevel } from '../types'
import { RISK_LABELS, RISK_COLORS } from '../types'

interface Props {
  level: RiskLevel
  size?: 'sm' | 'md' | 'lg'
}

export function RiskBadge({ level, size = 'md' }: Props) {
  const color = RISK_COLORS[level]
  const label = RISK_LABELS[level]
  const padding = size === 'sm' ? '3px 10px' : size === 'lg' ? '8px 20px' : '5px 14px'
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem'

  return (
    <span style={{ backgroundColor: color, color: 'white', padding, borderRadius: '8px', fontWeight: 600, fontSize, display: 'inline-block', letterSpacing: '0.02em' }}>
      {label}
    </span>
  )
}
