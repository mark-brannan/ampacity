# ampacity

Conductor ampacity and wire-sizing reference data, published as
language-neutral JSON. No code — just the tables every implementation needs,
one file per standard, each carrying its own provenance.

- `data/e11.json` — ABYC E-11 wire sizing and derating for DC wiring on boats and RVs.
- `data/nec.json` — NEC (NFPA 70) ampacity, ambient and conductor-count derating for land installations.
- `data/uscg-33cfr183.json` — 33 CFR 183.425 amperage and derating for US recreational boats.
- `fixtures/` — spot-check cases per standard; an implementation should reproduce them exactly.

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
  The 2011, 2017 and 2023 editions carry identical values (the table numbers
  moved between editions, and the dwelling table was prose-only in 2017);
  pre-2008 reprints differ, and are still in circulation.

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
