import { createServer } from 'vite'

const cases = {
  secondaryASCVD: {
    age: 66, sex: 'male', sbp: 128, onBpMeds: true, smoker: false,
    tc: 180, ldl: 92, hdl: 42, tg: 160, heightCm: 170, weightKg: 75, bmi: 26.0, egfr: 72, onStatin: true,
    ascvd: true, dm: false, ckd: 'G2', fh: false, familyHistoryPrematureASCVD: false, cacScore: null, lpA: null, apoB: null, ldlSource: 'measured'
  },
  severe190: {
    age: 42, sex: 'female', sbp: 118, onBpMeds: false, smoker: false,
    tc: 310, ldl: 212, hdl: 52, tg: 140, heightCm: 162, weightKg: 58, bmi: 22.1, egfr: 96, onStatin: false,
    ascvd: false, dm: false, ckd: 'none', fh: false, familyHistoryPrematureASCVD: false, cacScore: null, lpA: null, apoB: null, ldlSource: 'measured'
  },
  preventPrimary: {
    age: 58, sex: 'male', sbp: 134, onBpMeds: true, smoker: false,
    tc: 205, ldl: 132, hdl: 46, tg: 135, heightCm: 172, weightKg: 78, bmi: 26.4, egfr: 82, onStatin: false,
    ascvd: false, dm: false, ckd: 'G2', fh: false, familyHistoryPrematureASCVD: false, cacScore: null, lpA: null, apoB: null, ldlSource: 'measured'
  },
  cac320: {
    age: 61, sex: 'male', sbp: 126, onBpMeds: true, smoker: false,
    tc: 210, ldl: 128, hdl: 48, tg: 150, heightCm: 168, weightKg: 74, bmi: 26.2, egfr: 78, onStatin: false,
    ascvd: false, dm: false, ckd: 'G2', fh: false, familyHistoryPrematureASCVD: true, cacScore: 320, lpA: 60, apoB: 135, ldlSource: 'measured'
  },
  missingPreventInputs: {
    age: 55, sex: 'female', sbp: 122, onBpMeds: false, smoker: false,
    tc: 198, ldl: 121, hdl: 58, tg: 110,
    ascvd: false, dm: false, ckd: 'none', fh: false, familyHistoryPrematureASCVD: false, cacScore: null, lpA: null, apoB: null, ldlSource: 'measured'
  },
}

const expectations = {
  secondaryASCVD: { pathway: 'secondary-prevention-2026', riskLevel: 'very-high', ldlTarget: 70 },
  severe190: { pathway: 'severe-hypercholesterolemia-2026', riskLevel: 'high', ldlTarget: 100 },
  preventPrimary: { pathway: 'primary-prevention-prevent-2026', riskModel: 'PREVENT-ASCVD 10-year (base model)' },
  cac320: { pathway: 'primary-prevention-prevent-2026', riskLevel: 'extreme', ldlTarget: 55, nonHdlTarget: 85 },
  missingPreventInputs: { pathway: 'primary-prevention-prevent-2026', tenYearRisk: null },
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })

try {
  const { analyze } = await server.ssrLoadModule('/src/lib/analyze.ts')
  const failures = []

  for (const [name, input] of Object.entries(cases)) {
    const result = analyze(input)
    const acc = result.accaha
    const exp = expectations[name]
    const actual = {
      pathway: acc.pathway,
      riskLevel: acc.riskLevel,
      ldlTarget: acc.ldlTarget,
      nonHdlTarget: acc.nonHdlTarget ?? null,
      tenYearRisk: acc.tenYearRisk ?? null,
      riskModel: acc.riskModel ?? null,
      text: acc.ldlTargetText,
    }

    console.log(`\nCASE ${name}`)
    console.log(JSON.stringify(actual, null, 2))

    for (const [key, value] of Object.entries(exp)) {
      if (actual[key] !== value) {
        failures.push(`${name}: expected ${key}=${JSON.stringify(value)} got ${JSON.stringify(actual[key])}`)
      }
    }
  }

  if (failures.length > 0) {
    console.error('\nREGRESSION FAILURES:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log('\nAll regression expectations passed.')
  }
} finally {
  await server.close()
}
