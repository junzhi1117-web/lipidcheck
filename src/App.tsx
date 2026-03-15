import { useState, useEffect } from 'react'
import type { UserInput, AnalysisResult, HistoryEntry } from './types'
import { analyze } from './lib/analyze'
import { InputForm } from './components/InputForm'
import { ResultPage } from './components/ResultPage'
import { WaveHeader } from './components/WaveHeader'
import { saveHistory } from './components/HistoryChart'

type Page = 'input' | 'result'

function parseUrlParams(): Partial<UserInput> | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('age')) return null

  const age = parseInt(params.get('age') || '')
  const sex = params.get('sex') === 'f' ? 'female' : params.get('sex') === 'm' ? 'male' : undefined
  const sbp = parseFloat(params.get('sbp') || '')
  const bp = params.get('bp')
  const sm = params.get('sm')
  const tc = parseFloat(params.get('tc') || '')
  const ldl = parseFloat(params.get('ldl') || '')
  const hdl = parseFloat(params.get('hdl') || '')
  const tg = parseFloat(params.get('tg') || '')
  const ascvd = params.get('ascvd')
  const dm = params.get('dm')
  const ckd = params.get('ckd') as UserInput['ckd'] | null
  const fh = params.get('fh')
  const fhPremature = params.get('fhPrem')
  const cac = params.get('cac')
  const lpa = params.get('lpa')
  const apob = params.get('apob')

  if (!sex || isNaN(age) || isNaN(tc) || isNaN(ldl) || isNaN(hdl) || isNaN(tg)) return null

  return {
    age,
    sex,
    sbp: isNaN(sbp) ? 120 : sbp,
    onBpMeds: bp === '1',
    smoker: sm === '1',
    tc,
    ldl,
    hdl,
    tg,
    ascvd: ascvd === '1',
    dm: dm === '1',
    ckd: ckd && ['none', 'G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'].includes(ckd) ? ckd : 'none',
    fh: fh === '1',
    familyHistoryPrematureASCVD: fhPremature === '1',
    cacScore: cac ? parseFloat(cac) : null,
    lpA: lpa ? parseFloat(lpa) : null,
    apoB: apob ? parseFloat(apob) : null,
  }
}

function writeUrlParams(input: UserInput) {
  const params = new URLSearchParams()
  params.set('age', String(input.age))
  params.set('sex', input.sex === 'male' ? 'm' : 'f')
  params.set('sbp', String(input.sbp))
  params.set('bp', input.onBpMeds ? '1' : '0')
  params.set('sm', input.smoker ? '1' : '0')
  params.set('tc', String(input.tc))
  params.set('ldl', String(input.ldl))
  params.set('hdl', String(input.hdl))
  params.set('tg', String(input.tg))
  params.set('ascvd', input.ascvd ? '1' : '0')
  params.set('dm', input.dm ? '1' : '0')
  params.set('ckd', input.ckd)
  params.set('fh', input.fh ? '1' : '0')
  if (input.familyHistoryPrematureASCVD) params.set('fhPrem', '1')
  if (input.cacScore !== undefined && input.cacScore !== null && !Number.isNaN(input.cacScore)) params.set('cac', String(input.cacScore))
  if (input.lpA !== undefined && input.lpA !== null && !Number.isNaN(input.lpA)) params.set('lpa', String(input.lpA))
  if (input.apoB !== undefined && input.apoB !== null && !Number.isNaN(input.apoB)) params.set('apob', String(input.apoB))
  const newUrl = `${window.location.pathname}?${params.toString()}`
  history.replaceState(null, '', newUrl)
}

export default function App() {
  const [page, setPage] = useState<Page>('input')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [historyEntry, setHistoryEntry] = useState<HistoryEntry | null>(null)
  const [initialInput, setInitialInput] = useState<Partial<UserInput> | null>(null)

  // Read URL params on mount
  useEffect(() => {
    const parsed = parseUrlParams()
    if (parsed && parsed.age && parsed.sex && parsed.tc && parsed.ldl && parsed.hdl && parsed.tg) {
      setInitialInput(parsed)
      // Auto-submit if all required fields present
      const input = parsed as UserInput
      const r = analyze(input)
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ldl: input.ldl,
        target: r.consensus.strictestTarget,
        achieved: r.consensus.achieved,
      }
      saveHistory(entry)
      setResult(r)
      setHistoryEntry(entry)
      setPage('result')
    }
  }, [])

  const handleSubmit = (input: UserInput) => {
    const r = analyze(input)
    writeUrlParams(input)
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ldl: input.ldl,
      target: r.consensus.strictestTarget,
      achieved: r.consensus.achieved,
    }
    saveHistory(entry)
    setResult(r)
    setHistoryEntry(entry)
    setPage('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    // Clear URL params when going back
    history.replaceState(null, '', window.location.pathname)
    setPage('input')
    window.scrollTo({ top: 0 })
  }

  if (page === 'result' && result && historyEntry) {
    return <ResultPage result={result} onBack={handleBack} historyEntry={historyEntry} />
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <WaveHeader />
      <InputForm onSubmit={handleSubmit} initialInput={initialInput ?? undefined} />
    </div>
  )
}
