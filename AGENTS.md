# INONDA LTD estimator: instructions for coding assistants

- This is the INONDA LTD service estimator for Cyprus, with public visitor access. It is a separate project from `inonda.site` and `inonda.org`; do not modify those websites, their repositories or their DNS.
- Always use the official supplied logo at `dist/inonda-logo.png`. Preserve its proportions and colours. Do not substitute a generated company mark. Use Ocean Blue `#0077B6`, Dark Navy `#023E8A` and white.
- The owner explicitly authorized visitor access without any login or password. Preserve public read-only access, private source visibility, account-protected editing, disabled CDN caching, no-store responses and HTTPS. Do not add a visitor password gate or make the repository public without explicit new authorization.
- Never read, expose, commit or embed credentials. The obsolete INONDA_PREVIEW_PASSWORD setting is no longer read by the application; do not reuse it or change the owner's credentials.
- `Anybuild` is the Git-based hosting build. Use the Python host rather than serving `dist` publicly. `server.py` and `host/server.py` must remain identical.
- Rates and multipliers are illustrative assumptions until the owner provides approved tariffs. Keep the range and exclusions clear; do not present an estimate as a fixed quotation. Separate one-off and recurring monthly budgets.
- Keep the frontend responsive and accessible. All service quantities, rates, minimums and assumptions must remain configurable. Do not add fabricated reviews, recommendations or customer claims.
- Read `EDITING.md` before deployment. Wasmer automatically deploys commits to `main`. A user asking for a direct live update authorizes that deployment while preserving public visitor access and private editing; a request for a draft or pull request does not authorize merging it.
- Before modifying existing source, inspect the current remote branch and preserve concurrent edits. Use a lease when moving the branch.
- Run relevant meaningful checks for changed behaviour. Calculation tests: `node --test tests/estimator.test.mjs`. Host tests: `python -m unittest discover -s tests -p 'test_*.py'`. Inspect the deployed UI when access is available, and report any verification blocker accurately.
- Default website: `https://www.inonda.homes`. Root `https://inonda.homes` is configured in Wasmer to redirect to www. Repository: `constapo/inonda-service-estimator`.
