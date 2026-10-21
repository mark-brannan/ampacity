# Contributing

Thanks for looking. This package is **reference data, not code**: conductor
ampacity and wire-sizing tables, published as language-neutral JSON so that
implementations in any language can share one source of truth and one fixture
set instead of each re-transcribing the tables. One file per standard — ABYC
E-11 and the NEC today — each carrying its own provenance.

That shape decides what a useful contribution looks like here.

## The most valuable contribution is a correction with a citation

A wrong number in `data/` propagates into every consumer, and the consumers
size wire that carries current. If you find a value that does not match the
standard it claims to come from, that is the highest-value issue this
repository can receive.

Say which value, what it should be, and **where you read the correct one** —
the standard, the table, the **edition**, and a link if it is published.
`provenance` inside each file records where its current values came from; a
correction has to be at least as traceable as what it replaces. Edition matters
more than it looks: the NEC tables here are stable across 2011–2023, but
pre-2008 reprints of Table 310.16 differ in about a dozen cells and are still
widely circulated.

## What does not belong here

- **Calculation logic.** No code ships in this package, deliberately. A sizing
  algorithm belongs in a consumer such as
  [wire-wright](https://github.com/mark-brannan/wire-wright), or in a port to
  another language.
- **Data no standard publishes.** House rules, a builder's preference, or a
  number from a wire vendor's catalogue are not a standard. They may be right
  and still not belong in a package whose whole claim is traceability. A
  manufacturer document is a fine *source* for a standard's table; it is not
  itself a source of new tables.
- **Tables from a standard we cannot source lawfully.** Several bodies sell
  their standards and publish nothing free. Wanting the data is not a reason to
  transcribe a paid document or a pirated copy of one; see the open issues,
  which track that research separately.
- **A reshaped schema for one consumer's convenience.** The keys are a
  cross-language contract; changing them breaks ports that this repository
  cannot see.

## New data is welcome if it is cited and lawfully sourced

More of E-11 and of the NEC than is here could usefully be machine-readable —
other tables, other conductor materials, other correction factors. Other
standards are in scope too.

Open an issue first, describing which table, what a consumer would compute with
it, and **where the numbers come from**. Two independent sources that agree
beats one authoritative-looking PDF; the NEC tables here were accepted only
after every cell matched across separate reproductions.

## Setting up

```shell
git clone https://github.com/mark-brannan/ampacity.git
cd ampacity
npm test
```

Node 20 or newer. There are no dependencies and no install step — `npm test`
runs against a fresh clone. The tests parse every JSON file, check the keys the
cross-language contract promises, and check that data and fixtures agree with
each other — every size a fixture names exists in the data, every derate a
fixture asserts is the product the tables give.

## Before you open a pull request

```shell
npm test
```

Then:

- **A changed number carries its citation in the pull request body**, not only
  in the commit message. The reviewer has to be able to check it without
  guessing which edition you read.
- **Update `provenance`** in the data file you touched, if the source of a
  value changed.
- **Add a fixture for a corrected value.** The files in `fixtures/` are what
  stop the same error being re-introduced by a later transcription pass, and
  they are what every port is checked against.
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

Participation is governed by the
[Code of Conduct](https://github.com/mark-brannan/.github/blob/main/CODE_OF_CONDUCT.md),
the org-wide default now that this repo doesn't carry its own copy.

## Licence

Contributions are licensed under the [MIT licence](LICENSE) that covers this
project. The standards bodies retain whatever rights they hold in their own
tables; attribution is recorded in each file's `provenance`, and contributing a
transcription does not change that ownership.
