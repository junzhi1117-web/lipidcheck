import { useState } from 'react'
import type { HistoryEntry } from '../types'

const STORAGE_KEY = 'lipidcheck_history'

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(entry: HistoryEntry) {
  const history = getHistory()
  history.push(entry)
  // Keep max 30 entries
  while (history.length > 30) history.shift()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

interface Props {
  currentEntry: HistoryEntry
}

export function HistoryChart({ currentEntry }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [, setVersion] = useState(0) // for re-render after clear

  const allHistory = getHistory()
  // Include currentEntry if it's not already saved (by id)
  const history = allHistory.find(h => h.id === currentEntry.id)
    ? allHistory
    : [...allHistory, currentEntry]

  if (history.length < 1) return null

  const handleClear = () => {
    clearHistory()
    setVersion(v => v + 1)
  }

  // SVG chart dimensions
  const svgWidth = 600
  const svgHeight = 200
  const padLeft = 45
  const padRight = 20
  const padTop = 20
  const padBottom = 35
  const chartW = svgWidth - padLeft - padRight
  const chartH = svgHeight - padTop - padBottom

  const ldlValues = history.map(h => h.ldl)
  const minY = Math.max(0, Math.min(...ldlValues) - 20)
  const maxY = Math.max(...ldlValues) + 20

  const toX = (i: number) => padLeft + (history.length > 1 ? (i / (history.length - 1)) * chartW : chartW / 2)
  const toY = (v: number) => padTop + chartH - ((v - minY) / (maxY - minY)) * chartH

  // Check if target is consistent across entries
  const targetsWithValue = history.filter(h => h.target !== null)
  const consistentTarget = targetsWithValue.length > 0 &&
    targetsWithValue.every(h => h.target === targetsWithValue[0].target)
    ? targetsWithValue[0].target
    : null

  const linePath = history.length > 1
    ? history.map((h, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(h.ldl).toFixed(1)}`).join(' ')
    : null

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid #DEE2E6',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#006A7A',
        }}
      >
        <span>📊 查看歷史記錄（{history.length} 筆）</span>
        <span style={{ fontSize: '0.75rem', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* SVG Chart */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: '200px' }}
          >
            {/* Y axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const val = Math.round(minY + (maxY - minY) * (1 - frac))
              const y = padTop + chartH * frac
              return (
                <g key={frac}>
                  <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#F0F0F0" strokeWidth="1" />
                  <text x={padLeft - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9AA0A6">{val}</text>
                </g>
              )
            })}

            {/* Target line */}
            {consistentTarget !== null && (
              <g>
                <line
                  x1={padLeft}
                  y1={toY(consistentTarget)}
                  x2={padLeft + chartW}
                  y2={toY(consistentTarget)}
                  stroke="#DC3545"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                />
                <text x={padLeft + chartW + 4} y={toY(consistentTarget) + 3} fontSize="9" fill="#DC3545">
                  目標 {consistentTarget}
                </text>
              </g>
            )}

            {/* Line path */}
            {linePath && (
              <path d={linePath} fill="none" stroke="#006A7A" strokeWidth="2" strokeLinejoin="round" />
            )}

            {/* Dots + X axis labels */}
            {history.map((h, i) => (
              <g key={h.id}>
                <circle
                  cx={toX(i)}
                  cy={toY(h.ldl)}
                  r="5"
                  fill={h.achieved === true ? '#28A745' : h.achieved === false ? '#DC3545' : '#6C757D'}
                  stroke="white"
                  strokeWidth="2"
                >
                  <title>{`${formatFullDate(h.date)} — LDL: ${h.ldl} mg/dL`}</title>
                </circle>
                {/* Show X label for first, last, and every ~5th */}
                {(history.length <= 8 || i === 0 || i === history.length - 1 || i % Math.ceil(history.length / 6) === 0) && (
                  <text
                    x={toX(i)}
                    y={svgHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9AA0A6"
                  >
                    {formatDate(h.date)}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Recent entries table (last 5) */}
          <div style={{ marginTop: '12px', fontSize: '0.78rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #DEE2E6' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: '#6C757D', fontWeight: 600 }}>日期</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: '#6C757D', fontWeight: 600 }}>LDL</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: '#6C757D', fontWeight: 600 }}>目標</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px', color: '#6C757D', fontWeight: 600 }}>狀態</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-5).reverse().map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '6px 4px', color: '#333' }}>{formatFullDate(h.date)}</td>
                    <td style={{ padding: '6px 4px', color: '#333', textAlign: 'right' }}>{h.ldl}</td>
                    <td style={{ padding: '6px 4px', color: '#333', textAlign: 'right' }}>{h.target !== null ? `< ${h.target}` : '—'}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      {h.achieved === true ? '✅' : h.achieved === false ? '❌' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clear button */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              onClick={handleClear}
              style={{
                border: 'none',
                background: 'none',
                color: '#9AA0A6',
                fontSize: '0.72rem',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              清除所有記錄
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
