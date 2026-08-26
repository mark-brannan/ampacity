# Contributing

Thanks for looking. This package is **reference data, not code**: ABYC E-11
derived tables for sizing DC wiring, published as language-neutral JSON so that
implementations in any language can share one source of truth and one fixture
set instead of each re-transcribing the tables.

That shape decides what a useful contribution looks like here.

## The most valuable contribution is a correction with a citation

A wrong number in `data/e11.json` propagates into every consumer, and the
consumers size wire on boats. If you find a value that does not match ABYC
E-11, that is the highest-value issue this repository can receive.

Say which value, what it should be, and **where you read the correct one** —
the table, the edition, and a link if it is published. `provenance` inside the
JSON records where the current values came from; a correction has to be at
least as traceable as what it replaces.

## What does not belong here

- **Calculation logic.** No code ships in this package, deliberately. A sizing
  algorithm belongs in a consumer such as
  [wire-wright](https://github.com/mark-brannan/wire-wright), or in a port to
  another language.
- **Data ABYC does not publish.** House rules, a builder's preference, or a
  number from a wire vendor's catalogue are not E-11. They may be right and
  still not belong in a package whose whole claim is traceability.
- **A reshaped schema for one consumer's convenience.** The keys are a
  cross-language contract; changing them breaks ports that this repository
  cannot see.

## New data is welcome if it is E-11 and it is cited

More of E-11 than is here could usefully be machine-readable — other tables,
other conductor materials, other correction factors. Open an issue describing
which table, and what a consumer would compute with it.

## Setting up

```shell
git clone https://github.com/mark-brannan/ampacity.git
cd ampacity
npm test
```

Node 20 or newer. There are no dependencies and no install step — `npm test`
runs against a fresh clone. The tests parse both JSON files, check the keys the
cross-language contract promises, and check the two files agree with each other
(every AWG size named in a fixture exists in the data).

## Before you open a pull request

```shell
npm test
```

Then:

- **A changed number carries its citation in the pull request body**, not only
  in the commit message. The reviewer has to be able to check it without
  guessing which edition you read.
- **Update `provenance` in `data/e11.json`** if the source of a value changed.
- **Add a fixture for a corrected value.** `fixtures/abyc-fixtures.json` is what
  stops the same error being re-introduced by a later transcription pass, and
  it is what every port is checked against.
- **Branch from latest `main`**, and rebase onto it rather than merging it in.
- **One logical change per pull request.**
- **Commits are conventional**: `<type>(<scope>): <subject>`, imperative,
  50 characters or fewer.

## Versions

Consumers pin this package by semver, so:

- A **corrected value** is a patch — but say so loudly in the pull request, so
  it can be called out in the release. A consumer's output changes.
- **New tables or new keys** are a minor.
- **A renamed or removed key** is a major, and needs a reason better than
  tidiness.

## Code of Conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

Contributions are licensed under the [MIT licence](LICENSE) that covers this
project. The ABYC tables themselves are republished with attribution recorded
in `provenance`; contributing a transcription does not change their ownership.
