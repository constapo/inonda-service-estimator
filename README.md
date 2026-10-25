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

`server.py` serves only a fixed list of estimator assets. There is no visitor authentication and the old INONDA_PREVIEW_PASSWORD environment setting is ignored. Server source, environment files and editing paths return 404; POST requests return 405. Responses are no-store, CDN caching stays disabled, and HTTPS stays enabled. The owner explicitly authorized live search indexing. There is no noindex header or metadata; robots.txt allows crawling and sitemap.xml lists all six language versions. Search engines decide when to crawl and index.

`Anybuild` configures the Git-based Python deployment. `server.py` and `host/server.py` must stay identical. `wasmer.toml` keeps the package private while the website itself is public. A blank INONDA_ASSETS value falls back to the bundled dist directory.

## Validation

Run `node --test tests/*.test.mjs` for calculation and assistant checks and `python -m unittest discover -s tests -p 'test_*.py'` for the 6 public-host checks. Host checks cover anonymous asset access, ignored obsolete password settings, unavailable source/editing routes, HEAD responses and rejected submissions.

Desktop and mobile UI checks cover service combinations, monthly versus one-off totals, saved scenarios, validation and layout. Saved scenarios remain local to each browser.

## Calculation rules

Service allowance = max(quantity × rate, minimum) × condition factor × recurring frequency, plus travel. Management has no condition factor. Maintenance quantity is inspection visits per period; its minimum is per project/month. Other on-site minimums apply per visit. Weekly frequency averages 52/12 visits per month. All monetary inputs are VAT-inclusive. Reserve applies to these gross allowances; VAT is extracted once as gross × 19/119 and shown separately. Range bounds round outward to €5. Older locally saved net rates migrate once to VAT-inclusive amounts.

Location adds no automatic surcharge. Commercial properties retain an internal 20% factor on every service, including minimums and travel. Public controls, formulas and exports show applicable VAT-inclusive rates without identifying the factor, as requested by the owner. Residential properties have no uplift. Cleaning and renovation areas cannot exceed indoor size; garden area is independent.

This repository does not change inonda.site or inonda.org.

## Design, contact and automated guide

The image-led redesign is inspired by scullion.ie. All property photos and videos are referenced directly from inonda.site and inonda.org, and the supplied company logo is preserved. External media requests are restricted by the host CSP to those company domains. See DESIGN.md for exact sources.

Both company contact lines offer WhatsApp, Viber and call links, plus the published email and address. Clicking a contact link is visitor-controlled; the site sends no enquiry automatically. Viber links require the Viber app and a reachable account for the selected number.

`dist/assistant.mjs` provides a deterministic local service guide with typed questions, suggestions, dynamic current-budget answers and navigation to property, services, estimate and contact sections. It is labelled automated, uses no AI API, keeps questions only in the current page and does not book visits or issue binding quotes.

## Languages and inspection workflow

Greek is the default. English, Russian, Ukrainian, Hebrew and Romanian are available through the header selector, matching the company websites. Language selection updates the page, service controls, validation, current-budget guide, export text, currency formatting and metadata. Hebrew uses RTL layout. Explicit ?lang=en/ru/uk/he/ro URLs override the saved local preference; Greek uses the canonical root. Locale changes preserve calculation state and numeric select values.

Translations are in dist/i18n.mjs. The private repository and server configuration remain protected, while browser-delivered JavaScript is naturally readable by visitors. The commercial pricing factor is omitted from public text; it is not a secret credential.

Book an inspection directs visitors to contact the company; the contact-section booking button calls Irina. The stated process is call, property inspection, then written offer. INONDA LTD registration HE490415, all-Cyprus coverage, published address/email and minimum six-month labour workmanship warranty appear in the footer and guide. These details come from the company website and owner instructions.
