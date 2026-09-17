# ampacity

Conductor ampacity and wire-sizing reference data, published as
language-neutral JSON. No code — just the tables every implementation needs,
one file per standard, each carrying its own provenance.

- `data/e11.json` — **ABYC E-11**, for DC wiring on boats and RVs. AWG
  circular-mil areas; allowable amperage by insulation temperature rating
  outside engine spaces (Table 6A); engine-space correction factors; DC
  bundling derates; the copper voltage-drop constant (K = 10.75); standard
  fuse ratings.
- `data/nec.json` — **NEC (NFPA 70)**, for land-based US installations.
  Table 310.16 ampacities at 30 °C for copper and aluminium across the 60/75/90 °C
  columns, 18 AWG to 2000 kcmil; ambient correction factors; adjustment
  factors for more than three current-carrying conductors; the 83% dwelling
  service and feeder table.
- `data/uscg-33cfr183.json` — **33 CFR 183.425**, the US Coast Guard
  regulation for recreational boats. Table 5 allowable amperage by
  insulation temperature rating; engine-space correction factors; bundling
  factors for circuits of 50 V or more. A work of the US Government, so
  public domain. The numbers are E-11 Table 6A's, with one difference: the
  regulation permits 60 °C conductors in engine spaces at 0.58, E-11 does not.
- `fixtures/abyc-fixtures.json`, `fixtures/nec-fixtures.json`,
  `fixtures/uscg-fixtures.json` — spot-check cases per standard. An implementation in any language that consumes this
  data should reproduce these outputs exactly.

The standards are not interchangeable and the package does not pretend
they are. E-11 derates for engine spaces and bundling; the NEC derates for
ambient and for conductor count in a raceway. Their shapes differ because the
tables differ, and a consumer picks the one its jurisdiction adopted.

## Provenance

Every value's source is recorded in the JSON itself under `provenance`, with a
URL. Summarised:

- **ABYC E-11** values are transcribed from Table 6A as republished with ABYC's
  permission at <https://boathowto.com/wiresize/wiresize_tables_abyc.pdf>.
- **NEC** values are transcribed from attributed third-party technical
  reproductions — manufacturer and distributor ampacity publications, and a US
  state fire marshal's reproduction of an adopted amendment — cross-checked so
  that every cell agrees across at least two independent sources. Nothing was
  taken from NFPA's own free-access portal, whose terms forbid redistribution.
  The 2011, 2017 and 2023 editions carry identical values for these tables;
  pre-2008 reprints do not, and are still in circulation.

NFPA asserts copyright in the NEC and ABYC in E-11. What is published here is
the numeric content, attributed, not the standards themselves. Size to the
edition your jurisdiction has adopted.

## Consumers

- [wire-wright](https://www.npmjs.com/package/wire-wright) — JavaScript
  library + CLI, and a [browser demo](https://mark-brannan.github.io/wire-wright/)
  that bundles these tables straight in, no re-transcription.

This package is data-only so ports (Python, Kotlin, anything) can share one
source of truth and one fixture set instead of re-transcribing tables.

## License

MIT, covering this compilation and the fixtures. Standards bodies retain
whatever rights they hold in their own tables; neither ABYC nor NFPA is
affiliated with this project or has endorsed it.
