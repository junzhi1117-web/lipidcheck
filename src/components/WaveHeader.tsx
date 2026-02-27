export function WaveHeader() {
  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '16px 20px',
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* ECG line icon */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M4 18 L9 18 L11 12 L14 22 L17 8 L20 20 L22 14 L24 18 L28 18"
            stroke="#0052CC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <div>
          <h1 style={{
            color: '#0052CC',
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            LipidCheck
          </h1>
          <p style={{
            color: '#64748B',
            fontSize: '0.75rem',
            margin: 0,
            fontWeight: 500,
          }}>
            血脂智能判讀
          </p>
        </div>
      </div>
    </header>
  )
}
