import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const data = read('../data/e11.json')
const fixtures = read('../fixtures/abyc-fixtures.json')

// Spelling the domains out, rather than iterating whatever the file happens to
// contain, is the point: a test that walks the data's own keys passes just as
// happily after a row is deleted. These are the E-11 columns and the AWG sizes
// a consumer in another language is entitled to find.
const RATINGS = ['60', '75', '80', '90', '105', '125', '200']
const SIZES = [
  '18', '16', '14', '12', '10', '8', '6', '4', '3', '2', '1',
  '1/0', '2/0', '3/0', '4/0',
]

// The keys are a cross-language contract: a port in another language reads
// these names, so losing one is a breaking change rather than a tidy-up.
test('data/e11.json carries every key the contract promises', () => {
  for (const key of [
    'provenance',
    'circular_mils',
    'awg_order',
    'ampacity_outside_engine_spaces',
    'engine_space_factor',
    'bundle_factors_dc',
    'k_copper_dc',
    'standard_fuse_ratings',
  ]) {
    assert.ok(key in data, `missing key: ${key}`)
  }
})

test('awg_order is exactly the sizes E-11 covers, in order', () => {
  assert.deepEqual(data.awg_order, SIZES)
})

test('every AWG size in awg_order has an area, at every temperature rating', () => {
  assert.deepEqual(
    Object.keys(data.ampacity_outside_engine_spaces).sort(),
    [...RATINGS].sort(),
    'the set of temperature ratings changed',
  )
  assert.deepEqual(
    Object.keys(data.engine_space_factor).sort(),
    [...RATINGS].sort(),
    'engine_space_factor does not cover the same ratings',
  )
  for (const awg of data.awg_order) {
    assert.ok(
      Number.isFinite(data.circular_mils[awg]),
      `no circular_mils for ${awg}`,
    )
  }
  // Keyed rating-first, then size: a size missing from one column would let a
  // consumer silently fall through to a wider conductor's number.
  for (const rating of RATINGS) {
    const row = data.ampacity_outside_engine_spaces[rating]
    for (const awg of SIZES) {
      assert.ok(
        Number.isFinite(row[awg]),
        `no ${rating}C ampacity for ${awg}`,
      )
    }
  }
})

test('awg_order runs smallest conductor to largest', () => {
  const areas = data.awg_order.map((awg) => data.circular_mils[awg])
  for (let i = 1; i < areas.length; i++) {
    assert.ok(areas[i] > areas[i - 1], `awg_order is not ascending at index ${i}`)
  }
})

test('standard_fuse_ratings ascend and are all positive', () => {
  assert.ok(data.standard_fuse_ratings.length > 0, 'standard_fuse_ratings is empty')
  for (let i = 0; i < data.standard_fuse_ratings.length; i++) {
    assert.ok(data.standard_fuse_ratings[i] > 0)
    if (i > 0) {
      assert.ok(data.standard_fuse_ratings[i] > data.standard_fuse_ratings[i - 1])
    }
  }
})

// A fixture naming a conductor the data does not describe would let a port
// pass this suite while disagreeing with the tables it is meant to reproduce.
test('every AWG size a fixture expects exists in the data', () => {
  const sizes = new Set(data.awg_order)
  let checked = 0
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'awg' || key === 'expected_awg') {
          assert.ok(sizes.has(value), `fixture names unknown AWG size: ${value}`)
          checked++
        }
        walk(value)
      }
    }
  }
  walk(fixtures)
  // Without this the test passes on an empty or restructured fixture file,
  // which is the failure it exists to catch.
  assert.ok(checked > 0, 'no fixture named an AWG size at all')
})
