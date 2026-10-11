import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const data = read('../data/nec.json')
const fixtures = read('../fixtures/nec-fixtures.json')

// Spelled out rather than read back off the data, for the same reason as the
// E-11 suite: a test that walks the file's own keys passes just as happily
// after a row is deleted. These are the sizes and columns Table 310.16 covers.
const SIZES = [
  '18', '16', '14', '12', '10', '8', '6', '4', '3', '2', '1',
  '1/0', '2/0', '3/0', '4/0',
  '250', '300', '350', '400', '500', '600', '700', '750', '800', '900',
  '1000', '1250', '1500', '1750', '2000',
]
const RATINGS = ['60', '75', '90']
// 18 and 16 AWG are 90C-only; the aluminum columns start at 12 AWG. A consumer
// that assumes every size exists in every column sizes wire that isn't listed.
const COPPER_ONLY_90 = ['18', '16']
const NOT_IN_ALUMINUM = ['18', '16', '14']

test('data/nec.json carries every key the contract promises', () => {
  for (const key of [
    'provenance',
    'conditions',
    'conductor_sizes',
    'ampacity_30c',
    'ambient_correction',
    'adjustment_factors',
    'dwelling_83_percent',
  ]) {
    assert.ok(key in data, `missing key: ${key}`)
  }
})

test('provenance names its sources, because the numbers are only as good as those', () => {
  assert.ok(data.provenance.sources.length >= 2, 'fewer than two sources')
  for (const source of data.provenance.sources) {
    assert.match(source.url, /^https:\/\//, `source url is not https: ${source.url}`)
    assert.ok(source.what, `source ${source.url} does not say what it is`)
  }
})

test('conductor_sizes is exactly what 310.16 lists, smallest to largest', () => {
  assert.deepEqual(data.conductor_sizes, SIZES)
})

test('Table 310.16 covers every size in every column it is supposed to', () => {
  assert.deepEqual(Object.keys(data.ampacity_30c).sort(), ['aluminum', 'copper'])
  for (const material of ['copper', 'aluminum']) {
    assert.deepEqual(
      Object.keys(data.ampacity_30c[material]).sort(),
      [...RATINGS].sort(),
      `${material} does not carry the three temperature columns`,
    )
    for (const rating of RATINGS) {
      const column = data.ampacity_30c[material][rating]
      for (const size of SIZES) {
        const omitted =
          (material === 'aluminum' && NOT_IN_ALUMINUM.includes(size)) ||
          (material === 'copper' && rating !== '90' && COPPER_ONLY_90.includes(size))
        if (omitted) {
          assert.ok(
            !(size in column),
            `${material} ${rating}C lists ${size}, which 310.16 does not`,
          )
        } else {
          assert.ok(
            Number.isFinite(column[size]),
            `no ${material} ${rating}C ampacity for ${size}`,
          )
        }
      }
      // A stray key would be a size the fixtures never check and a consumer
      // might still find by iterating.
      for (const size of Object.keys(column)) {
        assert.ok(SIZES.includes(size), `${material} ${rating}C has unknown size ${size}`)
      }
    }
  }
})

test('ampacity rises with conductor size and with temperature rating', () => {
  for (const material of ['copper', 'aluminum']) {
    for (const rating of RATINGS) {
      const column = data.ampacity_30c[material][rating]
      const present = SIZES.filter((s) => s in column)
      for (let i = 1; i < present.length; i++) {
        assert.ok(
          column[present[i]] > column[present[i - 1]],
          `${material} ${rating}C does not increase from ${present[i - 1]} to ${present[i]}`,
        )
      }
    }
    for (const size of SIZES) {
      const [c60, c75, c90] = RATINGS.map((r) => data.ampacity_30c[material][r][size])
      if (c60 !== undefined && c75 !== undefined) {
        assert.ok(c75 >= c60, `${material} ${size}: 75C (${c75}) below 60C (${c60})`)
      }
      if (c75 !== undefined && c90 !== undefined) {
        assert.ok(c90 >= c75, `${material} ${size}: 90C (${c90}) below 75C (${c75})`)
      }
    }
  }
  // Copper carries more than aluminum at every size and column both list.
  for (const rating of RATINGS) {
    const cu = data.ampacity_30c.copper[rating]
    const al = data.ampacity_30c.aluminum[rating]
    for (const size of Object.keys(al)) {
      assert.ok(cu[size] > al[size], `aluminum ${size} ${rating}C is not below copper`)
    }
  }
})

test('ambient correction bands are contiguous and cover 30C at unity', () => {
  const rows = data.ambient_correction.rows
  assert.equal(data.ambient_correction.basis_c, 30)
  for (let i = 1; i < rows.length; i++) {
    assert.equal(
      rows[i].ambient_c_min,
      rows[i - 1].ambient_c_max + 1,
      `gap or overlap between band ${i - 1} and ${i}`,
    )
  }
  const at30 = rows.find(
    (r) => (r.ambient_c_min ?? -Infinity) <= 30 && 30 <= r.ambient_c_max,
  )
  assert.ok(at30, 'no band contains the 30C basis')
  for (const rating of RATINGS) {
    assert.equal(at30.factors[rating], 1.0, `${rating}C is not unity at the 30C basis`)
  }
  // Each column falls monotonically as it gets hotter, and stops rather than
  // running past the insulation's rating.
  for (const rating of RATINGS) {
    let previous = Infinity
    let ended = false
    for (const row of rows) {
      const factor = row.factors[rating]
      if (factor === undefined) { ended = true; continue }
      assert.ok(!ended, `${rating}C column resumes after ending`)
      assert.ok(factor <= previous, `${rating}C correction rises at ${row.ambient_c_max}C`)
      previous = factor
    }
  }
})

test('adjustment factors are contiguous, descending, and open-ended at the top', () => {
  const rows = data.adjustment_factors.rows
  assert.equal(rows[0].min_conductors, 4, 'adjustment does not start at 4 conductors')
  assert.equal(rows.at(-1).max_conductors, null, 'the top band is not open-ended')
  for (let i = 0; i < rows.length; i++) {
    if (i > 0) {
      assert.equal(
        rows[i].min_conductors,
        rows[i - 1].max_conductors + 1,
        `gap or overlap between adjustment band ${i - 1} and ${i}`,
      )
      assert.ok(rows[i].factor < rows[i - 1].factor, `adjustment band ${i} does not decrease`)
    }
    assert.ok(rows[i].factor > 0 && rows[i].factor <= 1)
  }
})

// The fixtures are the cross-language contract. A fixture naming a size or a
// band the data does not describe would let a port pass while disagreeing with
// the tables it exists to reproduce.
test('every ampacity fixture matches the table', () => {
  assert.ok(fixtures.ampacity.length > 0, 'no ampacity fixtures')
  for (const c of fixtures.ampacity) {
    assert.equal(
      data.ampacity_30c[c.material][String(c.insulation_c)][c.size],
      c.amps,
      `${c.material} ${c.size} at ${c.insulation_c}C`,
    )
  }
})

test('every not_listed fixture really is absent from the table', () => {
  assert.ok(fixtures.not_listed.length > 0, 'no not_listed fixtures')
  for (const c of fixtures.not_listed) {
    assert.ok(
      !(c.size in data.ampacity_30c[c.material][String(c.insulation_c)]),
      `${c.material} ${c.size} at ${c.insulation_c}C is listed after all`,
    )
  }
})

test('every ambient fixture resolves to the band the table puts it in', () => {
  const bandFor = (ambient) =>
    data.ambient_correction.rows.find(
      (r) => (r.ambient_c_min ?? -Infinity) <= ambient && ambient <= r.ambient_c_max,
    )
  for (const c of fixtures.ambient_correction) {
    assert.equal(
      bandFor(c.ambient_c).factors[String(c.insulation_c)],
      c.factor,
      `${c.ambient_c}C ambient on the ${c.insulation_c}C column`,
    )
  }
  for (const c of fixtures.ambient_not_permitted) {
    const band = bandFor(c.ambient_c)
    assert.ok(
      band === undefined || band.factors[String(c.insulation_c)] === undefined,
      `${c.ambient_c}C ambient has a factor on the ${c.insulation_c}C column after all`,
    )
  }
})

test('every adjustment fixture resolves to the band the table puts it in', () => {
  for (const c of fixtures.adjustment) {
    const row = data.adjustment_factors.rows.find(
      (r) => r.min_conductors <= c.conductors && c.conductors <= (r.max_conductors ?? Infinity),
    )
    const factor = row ? row.factor : 1.0
    assert.equal(factor, c.factor, `${c.conductors} current-carrying conductors`)
  }
})

// This is the case a consumer actually gets wrong: base ampacity, then ambient,
// then grouping, multiplied in that order and not rounded along the way.
test('every derated fixture is the product of base, ambient and adjustment', () => {
  assert.ok(fixtures.derated.length > 0, 'no derated fixtures')
  for (const c of fixtures.derated) {
    const base = data.ampacity_30c[c.material][String(c.insulation_c)][c.size]
    const ambient = data.ambient_correction.rows.find(
      (r) => (r.ambient_c_min ?? -Infinity) <= c.ambient_c && c.ambient_c <= r.ambient_c_max,
    ).factors[String(c.insulation_c)]
    const adjustmentRow = data.adjustment_factors.rows.find(
      (r) => r.min_conductors <= c.conductors && c.conductors <= (r.max_conductors ?? Infinity),
    )
    const adjustment = adjustmentRow ? adjustmentRow.factor : 1.0
    const got = Math.round(base * ambient * adjustment * 1e6) / 1e6
    assert.equal(got, c.amps, `${c.why}: ${c.material} ${c.size} at ${c.insulation_c}C`)
  }
})

test('the dwelling 83% table agrees between data and fixtures, and is derivable', () => {
  const rows = data.dwelling_83_percent.rows
  for (const c of fixtures.dwelling_83_percent) {
    const row = rows.find((r) => r.amperes === c.amperes)
    assert.ok(row, `no dwelling row for ${c.amperes} A`)
    assert.equal(row.copper, c.copper, `${c.amperes} A copper`)
    assert.equal(
      row.aluminum_or_copper_clad,
      c.aluminum_or_copper_clad,
      `${c.amperes} A aluminum`,
    )
  }
  // The table is 83% of the rating looked up in the 75C column. Deriving it
  // rather than trusting the transcription is what catches a keyed-in typo.
  const smallestAtLeast = (material, amps) =>
    data.conductor_sizes.find((size) => data.ampacity_30c[material]['75'][size] >= amps)
  for (const row of rows) {
    const target = row.amperes * 0.83
    assert.equal(
      smallestAtLeast('copper', target),
      row.copper,
      `${row.amperes} A copper is not the smallest 75C conductor carrying ${target} A`,
    )
    assert.equal(
      smallestAtLeast('aluminum', target),
      row.aluminum_or_copper_clad,
      `${row.amperes} A aluminum is not the smallest 75C conductor carrying ${target} A`,
    )
  }
})
