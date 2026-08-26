# Security Policy

## Supported versions

This package is maintained as a single moving line. Only the latest version
published to npm gets fixes; there are no maintenance branches.

| Version | Supported |
| ------- | --------- |
| latest `0.x` on [npm](https://www.npmjs.com/package/ampacity) | yes |
| anything older | no — upgrade first |

The package is data-only and has no dependencies, so upgrading is cheap: no
code changes hands, and the fixtures tell you immediately whether your
implementation still agrees with it.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.** Report it
privately through GitHub:

1. Go to
   [Security → Report a vulnerability](https://github.com/mark-brannan/ampacity/security/advisories/new).
2. Describe what you found and how to reproduce it.

You should get an acknowledgement within a week. This is a spare-time project
maintained by one person, so a fix may take longer than that — you will be told
where it stands rather than left waiting. If a report is valid and you want
credit, you will be named in the advisory.

If you get no response at all within two weeks, open a public issue saying only
that you are waiting on a private report — no details — and it will be picked
up.

## An incorrect value is not a vulnerability, and it matters more

This package ships no code, so the classic surfaces do not exist here. What it
ships instead is numbers that consumers size boat wiring with, and a wrong
number could under-size a conductor.

**That is a bug, and it belongs in a public issue**, not a private advisory —
being wrong in the open is how it gets found and fixed fastest, and there is
nothing to withhold from an attacker. See
[CONTRIBUTING.md](CONTRIBUTING.md#the-most-valuable-contribution-is-a-correction-with-a-citation);
bring the citation.

Use the private channel only for something that behaves like a vulnerability —
see below.

## What is in scope

- **The published tarball.** Anything shipped in `files` that should not be
  there, or a discrepancy between what is on npm and what is in this
  repository at the corresponding tag.
- **Malformed JSON that harms a consumer.** The files are parsed by
  implementations in several languages. A structure that crashes or hangs a
  reasonable parser is in scope.
- **The supply chain around publishing** — see below.

## What is out of scope

- Consumers of this data, including
  [wire-wright](https://github.com/mark-brannan/wire-wright). Report those in
  their own repositories.
- ABYC E-11 itself, and whether its guidance is adequate for your installation.
  This package transcribes a standard; it does not endorse it as a substitute
  for a qualified marine electrician.
- Transcription errors, per the section above — those are public issues.

## Notes on how this package is built

- **No dependencies at all**, runtime or development. `npm test` runs on a
  fresh clone with the network unavailable.
- Every value carries `provenance` inside the JSON, so a reader can check the
  data against its source without trusting this repository.
