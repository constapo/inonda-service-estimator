# Update the INONDA estimator remotely

The website source is in the private repository:
https://github.com/constapo/inonda-service-estimator

Wasmer is connected to the `main` branch. A commit pushed to `main` triggers a new deployment. The same website stays at https://www.inonda.homes. Wasmer is configured to redirect https://inonda.homes to the www address.

## Edit manually in a browser

1. Sign into your own GitHub account and open this repository.
2. Open the file you want to change, then choose **Edit this file** (the pencil icon). You can also press `.` on the repository page to open GitHub's browser editor.
3. Make the change and choose **Commit changes**. A commit to `main` deploys automatically. For a larger change, use a branch and review it before merging into `main`.
4. Watch the new deployment at https://wasmer.io/apps/constapo/inonda-service-estimator/deployments.
5. Wait until the deployment is ready, then refresh the public website and check the result. A saved file alone does not guarantee a successful deployment.

| What to update | File |
| --- | --- |
| Headings, explanatory text and page structure | `dist/index.html` |
| Colours, typography, spacing and mobile layout | `dist/styles.css` |
| Default rates, service scopes, minimums and calculation rules | `dist/estimator.mjs` |
| Form interactions, download text, saved scenarios and print layout | `dist/app.js` |
| Six-language copy and formatting | `dist/i18n.mjs` |
| Automated service guide | `dist/assistant.mjs` |
| Search crawler access and language URLs | `dist/robots.txt`, `dist/sitemap.xml` |
| Official company logo | `dist/inonda-logo.png` |
| Public asset routes and host response rules | `server.py` and `host/server.py` |
| Wasmer build/runtime configuration | `Anybuild`, `wasmer.toml`, `app.yaml` |

Keep `server.py` and `host/server.py` identical. The first serves the Git-based Anybuild deployment; the second supports the filesystem mapping in `wasmer.toml`.

## Ask ChatGPT or Claude to update it

Give the assistant access to this private repository using your existing GitHub integration, then identify this repository and describe the changes. An assistant without authorized repository access cannot deploy changes just by seeing the website URL.

Example request:

> Update `constapo/inonda-service-estimator`. Keep the official INONDA logo, Ocean Blue / Dark Navy / white branding, public access without visitor login, private editing access and existing INONDA websites intact. Make [specific change]. Validate the relevant behaviour, commit it, and verify the Wasmer deployment at www.inonda.homes. Keep all prices inclusive of 19% VAT and rates labelled illustrative unless I supply approved rates.

For substantial changes, ask for a pull request before merging. For a direct live update, explicitly request a tested commit to `main`.

## Public viewing, private editing

The owner explicitly requested that everyone can open the estimator without a login or password. Do not add a visitor password gate. The old INONDA_PREVIEW_PASSWORD runtime setting is ignored and is not needed to view the website.

The GitHub repository remains private. Manual editing requires the owner's GitHub account; deployment settings require the owner's Wasmer account. Visitors can change their own estimate assumptions but cannot update the website's defaults or code.

Do not read, reveal, commit or embed credentials. Keep HTTPS enabled. The app exposes only its estimator assets and has no public source, configuration, admin or editing route. CDN caching remains disabled and responses remain no-store.

Saved estimate scenarios stay in each visitor's browser and do not change default prices for other visitors. To update defaults for everyone, edit dist/estimator.mjs and deploy the change.

## Checks and rollback

For calculation changes, run `node --test tests/estimator.test.mjs`. For host changes, run `python -m unittest discover -s tests -p 'test_*.py'`. Check desktop and mobile controls, one-off/monthly totals, input validation and anonymous visitor access as appropriate.

If a live update breaks the site, redeploy a previous working version from Wasmer's deployment history or revert the offending Git commit. Keep the repository private and preserve public read-only visitor access during repairs.

All service rates, minimums and travel inputs in `dist/estimator.mjs` include 19% VAT. Enter VAT-inclusive default prices; do not add VAT a second time. The calculator extracts the included VAT for the breakdown. Visitors can adjust their own rates and quantities without changing defaults for anyone else.

Commercial facilities keep the internal 20% factor on every service, including minimums and travel. The owner requested no public text about this factor. Controls and formulas show the applicable rates, including VAT; edits convert back to internal values. Do not apply the factor again to a visitor-entered applicable rate. Keep the included VAT breakdown.

Design and media sources are documented in DESIGN.md. Only use media from inonda.site and inonda.org. The local automated assistant is in dist/assistant.mjs; service questions, contact details and current-budget answers can be edited there. It uses no AI API, collects no leads and sends no messages.

The owner explicitly authorized removing noindex/nofollow for the live website. Preserve index/follow metadata, crawlable robots.txt, the six-language sitemap and per-language canonical/hreflang links. Greek is the default, and Hebrew must retain RTL support. Localized labels must never change stored option values or calculation totals.
