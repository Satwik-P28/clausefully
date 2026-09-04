# Product selection research

_Researched 2026-09-02. Prices are USD list prices shown to a US visitor unless noted. “Risk” is scored with 5 meaning lower legal/platform risk._

## Method

I screened paid consumer software with a frequently repeated workflow, a public user community, and a scope that one engineer can reproduce lawfully. Official pricing and help pages establish current plans and limits; public community threads are treated as qualitative complaint evidence, not market statistics. No account, subscription, private API, or restricted content was used.

| Candidate                        | Frequent use | Pricing friction | Complaints | Buildable | BYOK fit | Differentiation | Distribution | Low risk | Portfolio | Total /45 |
| -------------------------------- | -----------: | ---------------: | ---------: | --------: | -------: | --------------: | -----------: | -------: | --------: | --------: |
| Grammarly / writing assistance   |            5 |                4 |          5 |         4 |        5 |               5 |            5 |        4 |         5 |    **42** |
| Evernote / personal notes        |            4 |                5 |          5 |         4 |        3 |               4 |            4 |        5 |         4 |        38 |
| Otter / transcription            |            4 |                4 |          4 |         3 |        5 |               4 |            4 |        5 |         4 |        37 |
| Notion AI / knowledge workspace  |            5 |                3 |          3 |         3 |        5 |               3 |            5 |        5 |         5 |        37 |
| MyFitnessPal / nutrition logging |            5 |                5 |          4 |         3 |        3 |               4 |            5 |        3 |         4 |        36 |
| Todoist / task management        |            5 |                3 |          3 |         4 |        4 |               3 |            5 |        5 |         3 |        35 |
| Quizlet / study tools            |            4 |                4 |          4 |         4 |        4 |               3 |            4 |        4 |         4 |        35 |
| Headspace / meditation           |            4 |                4 |          3 |         3 |        3 |               4 |            4 |        2 |         3 |        30 |

## Evidence notes

- **Grammarly:** Pro is $144/year ($12/month averaged) on the [official support page](https://support.grammarly.com/hc/en-us/articles/115000090011-How-much-does-Grammarly-Pro-cost). Independent user threads repeatedly describe intrusive premium prompts and suggestions that change meaning or voice ([March 2025](https://www.reddit.com/r/Grammarly/comments/1j38chq/what_the_hell_is_going_on_with_grammarly/), [September 2024](https://www.reddit.com/r/Grammarly/comments/1fpzrqc/grammarly_suggestions_are_getting_bad/), [March 2025](https://www.reddit.com/r/Grammarly/comments/1jbdsg0/is_grammarly_going_down_hill/)). Text editing is a compact, high-frequency workflow and model calls map naturally to BYOK.
- **Evernote:** the [official comparison](https://evernote.com/compare-plans) limits Free to 50 notes, one notebook, and one synced device. A local notes substitute is feasible, but the mature import/sync surface is much larger and AI is secondary to the core job.
- **Otter:** Pro is $16.99 monthly or $8.49/month billed annually, while Basic limits file imports to three and history to 25 recent conversations ([pricing](https://otter.ai/pricing), [limits](https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan)). It is a strong BYOK fit, but accurate streaming transcription, diarization, and long-audio handling raise MVP risk.
- **Notion AI:** [official pricing](https://www.notion.com/pricing) puts AI and advanced collaboration inside broader workspace plans. The product is extremely broad; a narrow alternative would compete more with many mature open-source editors than with Notion’s primary paid value.
- **MyFitnessPal:** Premium is $79.99/year or $19.99/month, with barcode, meal scan, and voice logging paid ([official pricing](https://www.myfitnesspal.com/premium), [official 2025 tier explainer](https://blog.myfitnesspal.com/myfitnesspal-membership-pricing-tiers/)). Distribution is strong, but nutrition data and advice increase privacy and safety sensitivity.
- **Todoist:** Pro is $60/year and gates custom reminders, calendar layout, and longer history ([official pricing](https://www.todoist.com/pricing/)). The workflow is highly reproducible, but BYOK does not create a strong primary advantage and the free tier is capable.
- **Quizlet:** Plus starts at $35.99/year and Plus Unlimited at $44.99/year, with Learn rounds and practice tests limited on the lower plan ([official upgrade page](https://quizlet.com/upgrade)). The workflow is feasible, but student integrity and copyrighted study-set concerns require extra policy care.
- **Headspace:** the app uses a free trial followed by subscription plans ([official subscription page](https://www.headspace.com/subscriptions)); a January 2026 benefits page cites a $69.99 standard annual rate ([Adobe benefits FAQ](https://benefits.adobe.com/document/629)). Mental-health positioning and audio-production demands make it a poorer one-engineer fit.

## Selection

**Selected category: paid AI writing assistance, with Grammarly as the comparison point.**

The decisive opportunity is not “free grammar checking.” Multiple user reports describe edits that erase voice, reverse meaning, or create correction loops. Official documentation confirms that Grammarly detects and underlines issues automatically, then asks users to accept or dismiss them ([desktop guide](https://support.grammarly.com/hc/en-us/articles/4412816078349-Grammarly-for-Windows-and-Grammarly-for-Mac-user-guide)); its own engineering article discusses grouping multiple suggestions for faster acceptance ([engineering article](https://www.grammarly.com/blog/engineering/accepting-multiple-suggestions/)). Clausefully instead begins with the writer’s non-negotiables, constrains each proposal to an exact local replacement, blocks a proposal when it removes a touched lock, and never offers bulk acceptance.

The name **Clausefully** was checked through general web and GitHub repository search on 2026-09-04. No exact software-name conflict surfaced. Alternatives including Adjectively, Syntaxly, and Phrasely were rejected after current results showed existing businesses or writing products. This is a practical clearance screen, not a trademark opinion.
