# INONDA LTD estimator: instructions for coding assistants

- This is the INONDA LTD service estimator for Cyprus, with public visitor access. It is a separate project from `inonda.site` and `inonda.org`; do not modify those websites, their repositories or their DNS.
- Always use the official supplied logo at `dist/inonda-logo.png`. Preserve its proportions and colours. Do not substitute a generated company mark. Use Ocean Blue `#0077B6`, Dark Navy `#023E8A` and white.
- The owner explicitly authorized visitor access without any login or password. Preserve public read-only access, private repository visibility, account-protected editing, disabled CDN caching, no-store responses and HTTPS. Do not add a visitor password gate or make the repository public without explicit new authorization.
- Never read, expose, commit or embed credentials. The obsolete INONDA_PREVIEW_PASSWORD setting is no longer read by the application; do not reuse it or change the owner's credentials.
- `Anybuild` is the Git-based hosting build. Use the Python host rather than serving `dist` publicly. `server.py` and `host/server.py` must remain identical.
- Rates and multipliers are illustrative assumptions until the owner provides approved tariffs. Keep the range and exclusions clear; do not present an estimate as a fixed quotation. Separate one-off and recurring monthly budgets.
- Commercial properties retain the internal 20% pricing factor on every service, including minimums and travel. The owner explicitly requested that this factor and its percentage do not appear in page copy, formulas, assistant replies, printed plans or downloads. Show and edit the applicable VAT-inclusive rates instead, converting to internal rates without adding the factor twice.
- All public monetary inputs and prices must include 19% VAT. Preserve the gross-price model and separate included VAT breakdown; never add VAT a second time. Migrate legacy VAT-exclusive saved scenarios only once.
- Use photos and videos only from the owner's inonda.site and inonda.org websites; keep the original supplied company logo. Reference scullion.ie for image-led composition, not its assets or brand.
- Keep the frontend responsive and accessible. All service quantities, rates, minimums and assumptions must remain configurable. Do not add fabricated reviews, recommendations or customer claims.
- Read `EDITING.md` before deployment. Wasmer automatically deploys commits to `main`. A user asking for a direct live update authorizes that deployment while preserving public visitor access and private editing; a request for a draft or pull request does not authorize merging it.
- Before modifying existing source, inspect the current remote branch and preserve concurrent edits. Use a lease when moving the branch.
- Run relevant meaningful checks for changed behaviour. Calculation tests: `node --test tests/estimator.test.mjs`. Host tests: `python -m unittest discover -s tests -p 'test_*.py'`. Inspect the deployed UI when access is available, and report any verification blocker accurately.
- Default website: `https://www.inonda.homes`. Root `https://inonda.homes` is configured in Wasmer to redirect to www. Repository: `constapo/inonda-service-estimator`.

- Contact links: Irina +357 94 091 616 and Constantin +357 94 091 613, each with WhatsApp, Viber and telephone. Email inonda2026@outlook.com. Use published INONDA source data; do not send messages during validation.
- The on-page assistant is a local automated service guide, not a human or a generative AI service. It may explain scope and current estimates and direct visitors to the team. It must not promise bookings or confirmed quotes.

- The owner explicitly authorized live search indexing and removal of noindex/nofollow. Preserve robots.txt, sitemap.xml, canonical/hreflang and index/follow metadata.
- Support Greek (default), English, Russian, Ukrainian, Hebrew (RTL) and Romanian. Preserve numeric/internal option values while translating labels. Locales must not change calculation amounts. Keep current-page questions and visitor-written notes unaltered by translation.
- Company registration HE490415; all-Cyprus service; minimum six-month written workmanship warranty on labour per the company website. The working process is call, inspection, then written offer. Book-an-inspection buttons arrange contact rather than claiming a confirmed booking.

- Preserve the page-level translate=no / notranslate markers: the owner’s Chrome profile otherwise overlays machine translation on the built-in locales. These markers are separate from search indexing and must not reintroduce noindex.
