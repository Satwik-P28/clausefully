# Comparative evaluation

## Claim under test

Clausefully does not claim universally better grammar or prose. The predeclared claim is narrower: **for writers protecting consequential facts or phrases, Clausefully makes AI-assisted edits more auditable and prevents applying a local suggestion that deletes a lock inside the touched text.**

Targets, set before implementation:

1. 100% of suggestions identify an exact substring of the submitted draft.
2. 100% of locks inside the touched substring are preserved or the suggestion is blocked.
3. 100% of unsafe fixture edits are blocked; 100% of safe fixture edits remain applyable.
4. Zero edits occur without explicit writer action.
5. Export contains every draft byte, with only a documented Markdown title/newline wrapper.
6. The complete review journey works with no account, key, or paid network call.

## Comparison basis

Direct comparative product testing was neither necessary nor appropriate: no subscription or account was created. The baseline is Grammarly’s public workflow documentation. Its desktop guide says issues are underlined automatically and suggestions can be accepted or dismissed ([official guide](https://support.grammarly.com/hc/en-us/articles/4412816078349-Grammarly-for-Windows-and-Grammarly-for-Mac-user-guide)); Grammarly also documents grouped suggestions and work on accepting multiple suggestions faster ([product article](https://www.grammarly.com/blog/product/grouped-writing-suggestions/), [engineering article](https://www.grammarly.com/blog/engineering/accepting-multiple-suggestions/)). No public document reviewed for this project established draft-specific literal locks that block a touched edit. That is an evidence gap, not proof of absence.

## Method

Five transparent fixtures cover a date, person, scope phrase, and budget. Three proposals retain the affected lock; two intentionally replace/remove it. `normalizeSuggestions` verifies that `original` occurs exactly in the draft, finds locks inside that substring, and marks the suggestion `blocked` if the replacement omits any. A separate fixture checks lossless draft serialization. The component journey test confirms review results do not alter the draft until **Accept** is activated.

Raw inputs are in [`tests/fixtures/comparative-cases.json`](../tests/fixtures/comparative-cases.json). Machine-readable results are in [`evaluation-results.json`](evaluation-results.json).

## Raw results

| Fixture        | Protected value      | Proposal                       | Expected  | Actual               |
| -------------- | -------------------- | ------------------------------ | --------- | -------------------- |
| `date-safe`    | Friday               | reorder while retaining Friday | applyable | low risk / applyable |
| `date-drift`   | Friday               | replace with Monday            | blocked   | blocked              |
| `name-safe`    | Maya                 | add courtesy word              | applyable | low risk / applyable |
| `scope-safe`   | smaller launch scope | add courtesy word              | applyable | low risk / applyable |
| `budget-drift` | $500                 | remove numeric cap             | blocked   | blocked              |

## Results

- Affected locks preserved or blocked: **5/5 (100%)**.
- Exact-substring suggestion scope: **5/5 (100%)**.
- Unsafe drift cases blocked: **2/2 (100%)**.
- Safe cases left applyable: **3/3 (100%)**.
- Automatic edits observed: **0**.
- Export fixture: **1/1 byte-complete draft payload** after the documented wrapper.
- Demo journey: passed with **0 accounts, 0 keys, and 0 paid provider calls**.
- Provider paths: Demo, OpenAI, and Anthropic share the same request/result boundary. Paid adapters were tested with mocks/static behavior only; no real credential was available or required.

## Conclusion

The implementation meets its narrow target: unlike a workflow that presents unscoped suggestions without writer-defined non-negotiables, Clausefully gives the writer a literal enforcement mechanism and makes every application explicit. This supports README claims about **lock preservation-or-blocking, exact local proposals, explicit consent, no-key demo completion, and export completeness**. It does not support claims of superior grammar detection, overall writing quality, speed versus Grammarly, or semantic equivalence.

## Limitations

- Five fixtures are a small engineering regression set, not a user study.
- Literal matching cannot detect paraphrased factual drift or contradictions outside the edited substring.
- LLM behavior varies by model. The normalizer can reject malformed/broad output but cannot prove truth.
- Public documentation may not expose every competitor feature or experiment.
- No paid competitor workflow, real OpenAI key, or real Anthropic key was exercised.
