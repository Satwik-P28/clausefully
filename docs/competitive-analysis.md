# Competitive analysis

## Core workflow

Grammarly runs alongside an editor, automatically underlines detected issues, shows a proposed change, and lets the user accept or dismiss it ([official desktop guide](https://support.grammarly.com/hc/en-us/articles/4412816078349-Grammarly-for-Windows-and-Grammarly-for-Mac-user-guide)). Grammarly also groups related suggestions and has explored faster multi-suggestion acceptance ([official product article](https://www.grammarly.com/blog/product/grouped-writing-suggestions/), [engineering article](https://www.grammarly.com/blog/engineering/accepting-multiple-suggestions/)).

## Recurring problem

The primary weakness is **loss of authorial intent during suggestions, combined with too little control over when and how broad assistance appears**.

- A September 2024 thread reports changed context, lost voice, repeated rejected suggestions, and correction loops: [“Grammarly suggestions are getting bad”](https://www.reddit.com/r/Grammarly/comments/1fpzrqc/grammarly_suggestions_are_getting_bad/).
- A March 2025 thread reports that more suggestions progressively remove meaning: [“Is Grammarly going downhill?”](https://www.reddit.com/r/Grammarly/comments/1jbdsg0/is_grammarly_going_down_hill/).
- A separate March 2025 thread describes suggestions changing intended meaning and unwanted tone normalization: [“What the hell is going on with Grammarly?”](https://www.reddit.com/r/Grammarly/comments/1j38chq/what_the_hell_is_going_on_with_grammarly/).
- A July 2024 thread describes paragraph-wide highlighting, obscure synonym pressure, and intrusive behavior: [“Grammarly is extremely annoying”](https://www.reddit.com/r/Grammarly/comments/1e1yrwy/grammarly_is_extremely_annoying/).

These are self-selected reports, not a representative satisfaction survey. Their value is the recurrence of the same failure mode across dates and authors.

## Affected users and why it matters

Clausefully targets writers of consequential everyday messages—freelancers, job seekers, students, non-native English writers, and small-team professionals—who want help with clarity but cannot allow dates, commitments, scope, names, or interpersonal tone to drift. A grammatically smooth sentence that changes a commitment is a worse outcome than an unpolished sentence.

## Existing workarounds

- **Manually inspect every suggestion:** necessary but cognitively expensive when suggestions are numerous or span paragraphs.
- **Prompt a general chatbot:** flexible, but the user must repeatedly reconstruct constraints and often receives a full rewrite that is harder to audit.
- **Disable suggestion categories:** reduces noise, but does not express draft-specific facts or commitments.
- **Use deterministic grammar tools:** useful for surface correctness, but generally do not combine writer-defined intent locks with optional provider-powered advice.

## Differentiation thesis

> For writers of consequential everyday messages, paid writing assistants can propose edits that alter documented meaning or voice. Clausefully improves the experience with writer-defined intent locks, exact-substring suggestions, automatic lock checks, and one-at-a-time consent, measured by 100% preservation-or-blocking of affected locks in the evaluation set and zero automatic edits.

## Verifiable comparison

| Capability                       | Grammarly (public documentation)                                                                                                                                         | Clausefully v0.2                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Detect issues while typing       | Automatically underlines detected issues ([guide](https://support.grammarly.com/hc/en-us/articles/4412816078349-Grammarly-for-Windows-and-Grammarly-for-Mac-user-guide)) | Review runs only when the writer requests it           |
| Accept/dismiss suggestions       | Yes ([guide](https://support.grammarly.com/hc/en-us/articles/4412816078349-Grammarly-for-Windows-and-Grammarly-for-Mac-user-guide))                                      | Yes, one exact replacement at a time                   |
| Grouped/multiple suggestions     | Documented ([product article](https://www.grammarly.com/blog/product/grouped-writing-suggestions/))                                                                      | Deliberately no bulk accept                            |
| Draft-specific protected phrases | No verified public claim found in reviewed docs                                                                                                                          | Up to 12 locks; a touched missing lock blocks apply    |
| Provider choice                  | No verified public BYOK claim found                                                                                                                                      | Demo, OpenAI, Anthropic                                |
| Account requirement              | Account-based plans                                                                                                                                                      | No application account                                 |
| Key storage                      | Not applicable                                                                                                                                                           | Page memory only; optional server environment variable |
| Export                           | Editor behavior varies by integration                                                                                                                                    | Full current draft to Markdown                         |

“No verified public claim found” means this research did not establish the capability; it is not proof that no form of the feature exists.

## Success metrics

1. Every suggestion references an exact substring of the submitted draft.
2. Every lock inside the edited substring remains in the replacement or the suggestion is blocked.
3. No suggestion applies without an explicit action.
4. Draft export is byte-complete apart from the documented Markdown heading wrapper.
5. Demo mode completes the workflow without an account, network provider, or key.
6. Switching among all three adapters does not require domain or UI rewrites.

## Legal and trademark considerations

Clausefully uses original branding, source, copy, visual design, and implementation. Its familiar document-and-review layout follows a generic editor pattern while retaining distinct colors, wording, components, controls, and information architecture. It uses no Grammarly/Superhuman assets, screenshots, private APIs, code, icons, or copied interface text. Comparative references are nominative and evidence-linked. The project describes itself as an independent open-source alternative and includes a clear non-affiliation disclaimer. “Clausefully” received a practical web and GitHub conflict screen on 2026-09-04; no exact software-name conflict surfaced. This is not a trademark opinion, and maintainers should seek counsel before commercial registration.
