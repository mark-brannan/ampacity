# ampacity

ABYC E-11 derived reference data for sizing DC wiring on boats and RVs,
published as language-neutral JSON. No code — just the tables every
implementation needs:

- `data/e11.json` — AWG circular-mil areas; allowable amperage by
  insulation temperature rating, outside engine spaces (E-11 Table 6A);
  engine-space correction factors; DC bundling derates; the copper
  voltage-drop constant (K = 10.75); standard fuse ratings.
- `fixtures/abyc-fixtures.json` — spot-check cases verified against the
  ABYC published 3%/10% voltage-drop lookup tables and Table 6A. An
  implementation in any language that consumes this data should reproduce
  these outputs exactly.

## Provenance

Ampacity values, correction factors, and derates are transcribed from ABYC
E-11 Table 6A as republished with ABYC's permission at
<https://boathowto.com/wiresize/wiresize_tables_abyc.pdf>. Provenance is
also embedded in the JSON itself under `provenance`.

## Consumers

- [wire-wright](https://www.npmjs.com/package/wire-wright) — JavaScript
  library + CLI.

This package is data-only so ports (Python, Kotlin, anything) can share
one source of truth and one fixture set instead of re-transcribing tables.

## License

MIT. ABYC table values used per the republication permission noted above;
ABYC is not affiliated with this project and has not endorsed it.
