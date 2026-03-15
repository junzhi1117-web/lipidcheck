# LipidCheck — ACC/AHA Rule Spec v1

Status: draft after audit  
Scope: ACC/AHA cholesterol logic only  
Basis: 2018 ACC/AHA Blood Cholesterol Guideline (using accessible secondary summaries for rule normalization)

---

## 1. Goal

This spec replaces the current over-simplified ACC/AHA branching logic with a rule set that is closer to guideline intent:

- ACC/AHA is **statin-intensity / % LDL reduction first**
- Fixed LDL targets are used mainly as **nonstatin intensification thresholds** in specific groups
- PCE is for **primary prevention risk discussion**, not a universal LDL target generator

So the app should stop forcing a fake LDL target in scenarios where the guideline is really about:

- lifestyle only
- moderate vs high-intensity statin
- ≥30% or ≥50% LDL-C reduction
- consider risk enhancers / CAC
- add ezetimibe / PCSK9 when threshold persists

---

## 2. Audit Summary: current code vs guideline

## A. Secondary prevention (ASCVD)

### Current code
- Any `ascvd=true` => `very-high` + `LDL target <70`
- `dm / ckd / fh` are treated as extra residual risk

### Problem
- ACC/AHA does **not** treat every ASCVD patient as identical “LDL <70” logic.
- Base recommendation:
  - age ≤75: high-intensity statin, aim **≥50% LDL reduction**
  - if not tolerated: moderate intensity
- `LDL-C >=70 mg/dL` is mainly the threshold for **adding nonstatins** in **very high-risk ASCVD**.
- “Very high-risk ASCVD” requires:
  - multiple major ASCVD events, **or**
  - one major ASCVD event + multiple high-risk conditions
- Current inputs cannot determine this faithfully.

### Spec correction
- Split into:
  1. `ASCVD`
  2. `Very-high-risk ASCVD` (only if enough data exists)
- Default ASCVD output should emphasize:
  - high-intensity statin
  - LDL reduction goal ≥50%
- Only surface `<70 mg/dL threshold` as **intensification threshold** when classified as very high-risk ASCVD.

---

## B. Severe primary hypercholesterolemia (LDL >=190)

### Current code
- `ldl >= 190 || fh` => `high` + `LDL target <70`

### Problem
- Guideline intent is:
  - age 20–75
  - maximally tolerated statin
  - goal **≥50% LDL reduction**
  - if LDL remains **>=100 mg/dL** or reduction <50%, consider ezetimibe
- `<70` is too aggressive as the default target here.

### Spec correction
- Use **percentage-first output**:
  - primary recommendation: `≥50% LDL-C reduction`
  - intensification threshold: `LDL-C >=100 mg/dL on maximal statin`
- Do not map this group to universal `<70`.

---

## C. FH handling

### Current code
- `fh=true` is merged into severe hypercholesterolemia bucket and simplified to `<70`

### Problem
- A boolean FH alone is not enough to justify universal `<70`.
- FH is a strong risk context, but ACC/AHA logic still depends on LDL level, age, treatment response, and sometimes nonstatin escalation thresholds.

### Spec correction
- If `fh=true` and `ldl>=190`, handle under severe hypercholesterolemia pathway.
- If `fh=true` but `ldl<190`, do **not** auto-force `<70`.
- Use FH as:
  - a risk enhancer in primary prevention
  - an intensification context note

---

## D. Diabetes mellitus (age 40–75)

### Current code
- `dm && age 40–75` => moderate/high bucket with generic note

### Problem
- This is directionally close, but incomplete.
- Guideline intent:
  - diabetes + age 40–75 + LDL 70–189 => at least **moderate-intensity statin**
  - if multiple ASCVD risk factors or age 50–75 => **high-intensity** reasonable
  - goal is usually **30–49% reduction** or **≥50% reduction** depending on risk
- Not every diabetes patient gets fixed LDL <70.

### Spec correction
- Restrict diabetes statin pathway to:
  - `age 40–75`
  - `LDL 70–189`
- Output:
  - baseline: moderate-intensity statin, LDL reduction 30–49%
  - escalate to high-intensity / ≥50% reduction if:
    - age 50–75, or
    - multiple risk factors
- Need explicit input support for “multiple risk factors”.

---

## E. Primary prevention without diabetes

### Current code
- Uses PCE for age 40–79
- Does not require LDL 70–189
- `5–7.5%` directly becomes “可考慮降低 30–50%”

### Problem
- Treatment decision pathway is mainly for:
  - age 40–75
  - LDL 70–189
  - no diabetes
- Risk bins:
  - low: <5%
  - borderline: 5–7.4%
  - intermediate: 7.5–19.9%
  - high: >=20%
- Borderline risk should **not** auto-trigger statin language unless risk enhancers are present.
- Intermediate risk should recommend moderate-intensity statin.
- High risk should target ≥50% reduction.

### Spec correction
- Apply PCE treatment pathway only if:
  - no ASCVD
  - no diabetes
  - LDL 70–189
  - age 40–75
- Outputs:
  - `<5%` => lifestyle
  - `5–7.4%` => consider statin **only if risk enhancers present**
  - `7.5–19.9%` => moderate-intensity statin; if enhancers favor, intensify
  - `>=20%` => high-intensity statin; aim ≥50% reduction

---

## F. CKD handling

### Current code
- CKD contributes to ASCVD residual risk logic directly

### Problem
- In ACC/AHA primary prevention, CKD is a **risk enhancer**, not an automatic fixed-target category by itself.
- Current model overweights CKD as if it directly creates a universal LDL target.

### Spec correction
- Use CKD mainly as a risk enhancer in primary prevention discussions.
- If ASCVD is present, CKD may be part of high-risk conditions, but current input granularity is still insufficient to declare true “very high-risk ASCVD” confidently.

---

## G. Young adults (20–39)

### Current code
- Falls through to lifestyle / insufficient data

### Problem
- ACC/AHA has a specific young-adult concept:
  - emphasize lifestyle
  - consider statin if family history of premature ASCVD and LDL >=160

### Spec correction
- Add a young-adult branch:
  - age 20–39
  - if LDL >=160 and family history premature ASCVD => statin can be considered
  - otherwise lifestyle-first

Note: current data model does not yet include `familyHistoryPrematureASCVD`.

---

## H. CAC pathway

### Current code
- Not modeled

### Problem
- CAC is an important tie-breaker when statin decision is uncertain in borderline/intermediate primary prevention.

### Spec correction
- Add optional future field `cacScore`
- Use only in uncertain primary prevention cases:
  - CAC = 0: may defer statin unless smoker / diabetes / strong family history
  - CAC 1–99: favors statin, especially age >=55
  - CAC >=100 or >=75th percentile: statin indicated

---

## 3. Required data model changes

Current `UserInput` is insufficient for faithful ACC/AHA logic.

## v1 required additions

```ts
familyHistoryPrematureASCVD?: boolean
riskEnhancersCount?: number
```

## Better explicit fields (preferred)

```ts
familyHistoryPrematureASCVD?: boolean
metabolicSyndrome?: boolean
chronicInflammatoryDisorder?: boolean
prematureMenopauseOrPreeclampsia?: boolean
southAsianAncestry?: boolean
persistentTriglycerides175?: boolean
apoB130?: boolean
hsCRP2?: boolean
abiBelow09?: boolean
lpA50?: boolean
cacScore?: number | null
multipleMajorASCVDEvents?: boolean
multipleHighRiskConditions?: boolean
```

If UI simplicity matters, v1 can ship with a compact model:

```ts
familyHistoryPrematureASCVD?: boolean
riskEnhancersCount?: number
possibleVeryHighRiskASCVD?: boolean
```

But this is less auditable.

---

## 4. Output model revision

Current output overuses `ldlTarget`.

## Proposed ACC/AHA output shape

```ts
interface AccAhaResultV1 {
  guideline: 'accaha'
  pathway:
    | 'secondary-prevention'
    | 'secondary-prevention-very-high-risk'
    | 'severe-hypercholesterolemia'
    | 'diabetes-primary-prevention'
    | 'primary-prevention-pce'
    | 'young-adult'
    | 'lifestyle-only'

  riskLevel: 'low' | 'moderate' | 'high' | 'very-high'

  statinRecommendation:
    | 'none'
    | 'consider-moderate'
    | 'moderate'
    | 'high'
    | 'maximally-tolerated'

  ldlReductionGoalPercent: 30 | 50 | null
  ldlReductionGoalText: string

  ldlThresholdForIntensification: number | null
  ldlThresholdText: string | null

  tenYearRisk: number | null
  achieved: boolean | null
  notes?: string
  disclaimer?: string
}
```

### Key principle
- `achieved` should be based on:
  - `% reduction goal` when that is the true guideline endpoint
  - LDL threshold only when the branch legitimately uses one

Because the app currently does not store pretreatment LDL, a true `% reduction achieved` cannot yet be calculated. So for now:

- if branch is percentage-based only -> `achieved = null`
- if branch includes real threshold (`>=70`, `>=100`) -> can compare current LDL

---

## 5. ACC/AHA decision tree for LipidCheck v1

Apply rules in this order.

### Step 1 — Secondary prevention
If `ascvd = true`:

#### 1A. Very high-risk ASCVD
If explicit data supports:
- `multipleMajorASCVDEvents = true`, or
- `multipleHighRiskConditions = true`

Output:
- pathway: `secondary-prevention-very-high-risk`
- statin: `high` or `maximally-tolerated`
- LDL reduction goal: `>=50%`
- intensification threshold: `LDL >=70 mg/dL`
- note: consider ezetimibe first, then PCSK9 if still above threshold

#### 1B. Other ASCVD
Otherwise:
- pathway: `secondary-prevention`
- statin: `high` or `maximally-tolerated`
- LDL reduction goal: `>=50%`
- no universal LDL target
- if age >75: individualized continuation/initiation note

---

### Step 2 — Severe hypercholesterolemia
Else if `age 20–75` and `ldl >=190`:
- pathway: `severe-hypercholesterolemia`
- statin: `maximally-tolerated`
- LDL reduction goal: `>=50%`
- intensification threshold: `LDL >=100 mg/dL` or reduction <50%
- note: consider ezetimibe if above threshold despite statin

If `fh=true`, add note that FH increases lifetime risk and supports aggressive treatment.

---

### Step 3 — Diabetes primary prevention
Else if:
- `dm = true`
- `age 40–75`
- `ldl 70–189`

Output baseline:
- pathway: `diabetes-primary-prevention`
- statin: `moderate`
- LDL reduction goal: `30–49%` (represented as 30 in structured field + clear text)

Escalate to high-intensity / >=50% if:
- age `50–75`, or
- multiple ASCVD risk factors / enhancers present

No default fixed LDL target.

---

### Step 4 — Young adults
Else if `age 20–39`:
- default: lifestyle
- if `ldl >=160` and `familyHistoryPrematureASCVD=true`:
  - statin can be considered
  - pathway: `young-adult`

---

### Step 5 — PCE-based primary prevention
Else if:
- no ASCVD
- no diabetes
- `age 40–75`
- `ldl 70–189`
- PCE calculable

Risk categories:

#### Low risk: `<5%`
- lifestyle
- no statin by default

#### Borderline risk: `5–7.4%`
- consider moderate-intensity statin **only if risk enhancers present**
- if no enhancers: lifestyle

#### Intermediate risk: `7.5–19.9%`
- recommend moderate-intensity statin
- LDL reduction goal: `>=30%`
- if enhancers push higher concern, can favor stronger treatment discussion
- if uncertain, CAC can refine

#### High risk: `>=20%`
- high-intensity statin
- LDL reduction goal: `>=50%`

---

### Step 6 — Lifestyle-only fallback
Else:
- pathway: `lifestyle-only`
- emphasize heart-healthy lifestyle
- insufficient data / outside validated treatment buckets

---

## 6. UI copy rules

## Do not say
- “ACC/AHA target LDL <70” for all ASCVD
- “FH = target <70” automatically
- “DM = target <70” automatically
- “PCE 5–7.5% => should reduce 30–50%” without enhancer condition

## Prefer saying
- “ACC/AHA here focuses on statin intensity and LDL reduction percentage.”
- “This group is generally managed toward >=30% or >=50% LDL-C reduction.”
- “LDL >=70 mg/dL is an intensification threshold in very-high-risk ASCVD, not a universal target for all users.”
- “This PCE estimate is based on U.S. cohorts and may overestimate risk in Taiwanese users.”

---

## 7. Minimal implementation plan

### Phase 1 — Safe correction
1. Remove universal `<70` logic from:
   - all ASCVD
   - all FH
   - all LDL>=190
2. Restrict PCE treatment branch to:
   - age 40–75
   - LDL 70–189
   - no diabetes
3. Make borderline risk depend on risk enhancers
4. Add young-adult branch note
5. Change result UI language from target-first to reduction-first where appropriate

### Phase 2 — Better fidelity
1. Add risk enhancer inputs
2. Add very-high-risk ASCVD explicit inputs
3. Add CAC optional input
4. Add baseline/pre-treatment LDL field so true `% achieved` can be computed

---

## 8. Recommended product stance

For LipidCheck, ACC/AHA should be presented as:

- **Action style**: statin intensity + % reduction
- **Not**: a universal fixed LDL target engine

That keeps the product closer to guideline intent and reduces false precision.

---

## 9. Short verdict

The current ACC/AHA branch is directionally useful but too simplified in a way that systematically **overstates fixed LDL target behavior**, especially:

- all ASCVD -> `<70`
- all LDL >=190 / FH -> `<70`
- borderline PCE -> too treatment-forward without enhancer gate

Rule Spec v1 should switch ACC/AHA from **target-first** to **pathway-first** logic.
