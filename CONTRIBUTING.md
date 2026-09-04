# Contributing to Clausefully

Thank you for helping make careful editing more trustworthy.

1. Search existing issues, then open one for substantial behavior or provider changes.
2. Fork the repository and create a focused branch.
3. Run `npm ci`, then `npm run dev`.
4. Add or update tests. Never use a real provider credential in a fixture, screenshot, log, or pull request.
5. Run `npm run check` and describe manual UI checks in the pull request.
6. Keep comparative claims linked to public evidence and evaluation results.

Provider adapters must preserve the provider-independent `ReviewRequest` / `ReviewResult` boundary, use timeouts, normalize errors, and pass the lock-enforcement tests. UI work must remain keyboard operable at 320px and desktop widths.

By contributing, you agree that your contribution is licensed under MIT and follows the [Code of Conduct](CODE_OF_CONDUCT.md).
