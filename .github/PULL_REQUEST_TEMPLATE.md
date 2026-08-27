## What and why

<!--
Motivation, not mechanics — the diff shows what changed. If this closes an
issue, say so here: closes #12
-->

## Citation

<!--
REQUIRED for any changed or added number. The table, the edition or revision
year, and a link if it is published. The reviewer has to be able to check it
without guessing which edition you read. Delete this section only if the change
touches no values at all.
-->

## Version

<!--
A corrected value is a PATCH — but call it out, because a consumer's output
changes. New tables or keys are a minor. A renamed or removed key is a major,
and needs a reason better than tidiness. See CONTRIBUTING.md → Versions.
-->

- [ ] patch (including a corrected value — say so above)
- [ ] minor (new table, new key, new fixture)
- [ ] major (renamed or removed key — describe the break above)

## Checks

- [ ] `npm test` passes
- [ ] `provenance` in `data/e11.json` updated, if the source of a value changed
- [ ] A fixture covers any corrected value, so a later transcription pass cannot re-introduce it
- [ ] Branched from latest `main` (rebased, not merged)
- [ ] One logical change

## Anything the maintainer should look at

<!--
A value you are unsure about, a disagreement between two printings of the
table, or a schema choice that a port in another language would have to follow.
Delete if there is nothing.
-->
