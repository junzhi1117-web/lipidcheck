interface Props {
  type: 'diet' | 'exercise'
  items: string[]
}

export function RecommendationCard({ type, items }: Props) {
  const isDiet = type === 'diet'

  const Icon = () => isDiet ? (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="10" r="7" stroke="#0052CC" strokeWidth="1.8" fill="none" />
      <path d="M9 10 Q14 6 19 10" stroke="#0052CC" strokeWidth="1.5" fill="none" />
      <path d="M11 18 Q14 16 17 18 L17 24 Q14 26 11 24 Z" stroke="#0052CC" strokeWidth="1.5" fill="none" />
    </svg>
  ) : (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="18" cy="6" r="2.5" stroke="#0052CC" strokeWidth="1.8" fill="none" />
      <path d="M18 9 L16 15 L12 18 M16 15 L20 19 L18 24" stroke="#0052CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 14 L12 12 L16 15" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0A2540' }}>
            {isDiet ? '飲食聰明選' : '規律動起來'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            {isDiet ? '依您的血脂狀況客製建議' : '依您的風險等級建議'}
          </div>
        </div>
      </div>
      <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: '0.88rem', color: '#0A2540', lineHeight: 1.65 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
