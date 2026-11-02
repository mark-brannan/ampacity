import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const data = read('../data/uscg-33cfr183.json')
const e11 = read('../data/e11.json')
const fixtures = read('../fixtures/uscg-fixtures.json')

// Spelled out, not read from the file: a test that walks the data's own keys
// passes just as happily after a row is deleted.
const RATINGS = ['60', '75', '80', '90', '105', '125', '200']
const SIZES = [
  '18', '16', '14', '12', '10', '8', '6', '4', '3', '2', '1',
  '1/0', '2/0', '3/0', '4/0',
]

test('data/uscg-33cfr183.json carries every key the contract promises', () => {
  for (const key of [
    'provenance',
    'awg_order',
    'insulation_ratings_c',
    'ampacity_outside_engine_spaces',
    'engine_space_factor',
    'bundle_factors_50v_and_above',
  ]) {
    assert.ok(key in data, `missing key: ${key}`)
  }
})

test('awg_order and insulation_ratings_c are exactly what Table 5 covers, in order', () => {
  assert.deepEqual(data.awg_order, SIZES)
  assert.deepEqual(data.insulation_ratings_c, RATINGS)
})

test('every rating names every size, and every rating has an engine-space factor', () => {
  assert.deepEqual(Object.keys(data.ampacity_outside_engine_spaces).sort(), [...RATINGS].sort())
  assert.deepEqual(Object.keys(data.engine_space_factor).sort(), [...RATINGS].sort())
  for (const rating of RATINGS) {
    for (const awg of SIZES) {
      const v = data.ampacity_outside_engine_spaces[rating][awg]
      assert.ok(Number.isFinite(v) && v > 0, `no ${rating}C ampacity for ${awg}`)
    }
    const f = data.engine_space_factor[rating]
    assert.ok(f > 0 && f <= 1, `engine_space_factor ${rating}C: ${f}`)
  }
})

test('ampacity never falls as the conductor grows or the rating rises', () => {
  for (const rating of RATINGS) {
    const row = data.ampacity_outside_engine_spaces[rating]
    for (let i = 1; i < SIZES.length; i++) {
      assert.ok(row[SIZES[i]] > row[SIZES[i - 1]], `${rating}C not ascending at ${SIZES[i]}`)
    }
  }
  for (const awg of SIZES) {
    for (let i = 1; i < RATINGS.length; i++) {
      const lo = data.ampacity_outside_engine_spaces[RATINGS[i - 1]][awg]
      const hi = data.ampacity_outside_engine_spaces[RATINGS[i]][awg]
      assert.ok(hi >= lo, `${awg}: ${RATINGS[i]}C below ${RATINGS[i - 1]}C`)
    }
  }
})

test('bundling factors cover from one conductor up, ascend in size and fall in factor', () => {
  const bands = data.bundle_factors_50v_and_above
  assert.equal(bands[0].factor, 1.0)
  assert.equal(bands.at(-1).max_conductors, null)
  for (let i = 1; i < bands.length; i++) {
    if (bands[i].max_conductors !== null) {
      assert.ok(bands[i].max_conductors > bands[i - 1].max_conductors)
    }
    assert.ok(bands[i].factor < bands[i - 1].factor, `factor not falling at band ${i}`)
  }
})

// 33 CFR 183.425 Table 5 and ABYC E-11 Table 6A carry the same numbers. That
// is recorded in both files' provenance, and this pins it: if either file is
// corrected and the other is not, one of them is now wrong.
test('Table 5 agrees with the E-11 table wherever both speak', () => {
  for (const rating of RATINGS) {
    assert.deepEqual(
      data.ampacity_outside_engine_spaces[rating],
      e11.ampacity_outside_engine_spaces[rating],
      `${rating}C row differs from data/e11.json`,
    )
    if (e11.engine_space_factor[rating] !== null) {
      assert.equal(data.engine_space_factor[rating], e11.engine_space_factor[rating])
    }
  }
  // E-11 has no explicit 1-2 conductor band; the rest must match exactly.
  assert.deepEqual(data.bundle_factors_50v_and_above.slice(1), e11.bundle_factors_dc.slice(1))
})

// The fixtures are a contract for ports, so the reference derivation is spelled
// out here too: a port disagreeing with this is wrong, not the fixture.
test('ampacity fixtures reproduce Table 5 with the note 1 and note 2 factors', () => {
  const sizes = new Set(data.awg_order)
  assert.ok(fixtures.ampacity.length > 0)
  for (const f of fixtures.ampacity) {
    assert.ok(sizes.has(f.awg), `fixture names unknown AWG size: ${f.awg}`)
    let amps = data.ampacity_outside_engine_spaces[String(f.insulation_c)][f.awg]
    if (f.engine_space) amps *= data.engine_space_factor[String(f.insulation_c)]
    if (f.volts >= 50 && f.bundle >= 3) {
      amps *= data.bundle_factors_50v_and_above.find((b) =>
        b.max_conductors === null || f.bundle <= b.max_conductors).factor
    }
    assert.equal(Math.round(amps * 100) / 100, f.amps, JSON.stringify(f))
  }
})
