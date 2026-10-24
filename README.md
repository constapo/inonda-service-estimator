# INONDA LTD service estimator

Public, password-free property service estimator for Cyprus, hosted on Wasmer at https://www.inonda.homes. The root domain https://inonda.homes is configured to redirect to www.

The owner explicitly requested public access without passwords. Visitors open the estimator directly. Source code and editing remain protected by the owner's private GitHub and Wasmer accounts. The app has no public editing endpoint.

Always use the supplied official INONDA LTD logo (`dist/inonda-logo.png`). Preserve its colours and proportions. Use Ocean Blue #0077B6, Dark Navy #023E8A and white.

## What works

- Six combinable services: maintenance, renovation, cleaning, handyman, landscaping and management.
- Residential/commercial property, Cyprus location, size and condition.
- Editable quantities, rates, minimums and frequencies, with clear scope and exclusions.
- Separate one-off and monthly budget ranges, optional reserve and travel, with 19% VAT included in every price.
- Up to three scenarios saved in the visitor's browser; download a detailed text plan or print/save as PDF.
- Responsive layout, labelled controls, reduced-motion support and no external frontend dependencies.

All starting prices are illustrative assumptions, not approved INONDA tariffs or verified Cyprus market prices. No enquiry, booking or payment is submitted.

## Hosting and remote updates

See [EDITING.md](EDITING.md) for remote editing by the owner, ChatGPT or Claude. Wasmer automatically deploys commits to the connected `main` branch.

`server.py` serves only a fixed list of estimator assets. There is no visitor authentication and the old INONDA_PREVIEW_PASSWORD environment setting is ignored. Source files, environment files and editing paths return 404; POST requests return 405. Responses are no-store, CDN caching stays disabled, and HTTPS stays enabled. The prototype retains noindex metadata; public access does not require search-engine indexing.

`Anybuild` configures the Git-based Python deployment. `server.py` and `host/server.py` must stay identical. `wasmer.toml` keeps the package private while the website itself is public. A blank INONDA_ASSETS value falls back to the bundled dist directory.

## Validation

Run `node --test tests/estimator.test.mjs` for the 17 calculation checks and `python -m unittest discover -s tests -p 'test_*.py'` for the 5 public-host checks. Host checks cover anonymous asset access, ignored obsolete password settings, unavailable source/editing routes, HEAD responses and rejected submissions.

Desktop and mobile UI checks cover service combinations, monthly versus one-off totals, saved scenarios, validation and layout. Saved scenarios remain local to each browser.

## Calculation rules

Service allowance = max(quantity × rate, minimum) × condition factor × recurring frequency, plus travel. Management has no condition factor. Maintenance quantity is inspection visits per period; its minimum is per project/month. Other on-site minimums apply per visit. Weekly frequency averages 52/12 visits per month. All monetary inputs are VAT-inclusive. Reserve applies to these gross allowances; VAT is extracted once as gross × 19/119 and shown separately. Range bounds round outward to €5. Older locally saved net rates migrate once to VAT-inclusive amounts.

Location adds no automatic surcharge. Commercial properties have a clearly displayed 20% uplift on every service, including minimum charges and travel, applied to VAT-inclusive base prices. Residential properties have no uplift. Cleaning and renovation areas cannot exceed indoor size; garden area is independent.

This repository does not change inonda.site or inonda.org.
