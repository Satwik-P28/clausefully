# Security policy

## Supported version

Security fixes are applied to the latest tagged release and `main`.

## Reporting

Please do not open a public issue for a suspected vulnerability or exposed secret. Use GitHub’s **Report a vulnerability** private advisory flow for this repository. Include impact, affected version, reproduction steps, and any suggested mitigation. Expect an acknowledgement within seven days.

## Security model

- Draft/lock/voice preferences are local to the browser origin.
- UI-entered provider keys are held only in page memory. The same-origin route receives a key only for the request, intentionally logs neither key nor content, and returns no-store responses.
- Self-hosted environment keys are read server-side and must remain in ignored `.env*` files or the host’s secret store.
- Cloud-provider requests necessarily disclose submitted content to the chosen provider. Review that provider’s terms before use.

Never include real keys, sensitive writing, or personal data in a vulnerability report unless strictly necessary; redact and minimize first.
