# INONDA LTD service estimator

Public, password-free property service estimator for Cyprus, hosted on Wasmer at https://www.inonda.homes. The root domain https://inonda.homes is configured to redirect to www.

The owner explicitly requested public access without passwords. Visitors open the estimator directly. Source code and editing remain protected by the owner's private GitHub and Wasmer accounts. The app has no public editing endpoint.

Always use the supplied official INONDA LTD logo (`dist/inonda-logo.png`). Preserve its colours and proportions. Use Ocean Blue #0077B6, Dark Navy #023E8A and white.

## What works

- A budget planner dashboard for potential customers, separate from the photos. Visitors tick job titles; there is no picture-based selection.
- One-off jobs only: flooring & tiling, kitchens, bathrooms, painting, gypsum board & plastering, plumbing, electrical, roofing & waterproofing, doors & carpentry, outdoor works, aluminium, HPL cladding, decorative panels and renovation.
- Maintenance, management, cleaning, garden care, contract repairs and urgent repairs are contract-only work and are deliberately not in the planner.
- Each job has a type of work, a quantity in its own unit, a job complexity and (gypsum) a board type. A skip & site preparation line is added automatically and can be unticked.
- Prices always include materials, installation and 19% VAT. The page shows only price ranges per job and in total, never unit rates, material prices or internal factors.
- Below the planner, an information-only "What we do" photo section links to the service pages on inonda.org.
- Mobile first: the hero button lands on the planner, every control is at least 44 px tall and a sticky bottom bar shows the current total. Book an inspection opens WhatsApp to Irina with the job list, only on the visitor's click. Save as PDF prints the plan.

All prices are planning guides for the owner to adjust in `dist/estimator.mjs`; they are not quotations.

## Hosting and remote updates

See [EDITING.md](EDITING.md) for remote editing by the owner, ChatGPT or Claude. Wasmer automatically deploys commits to the connected `main` branch.

`server.py` serves only a fixed list of estimator assets. There is no visitor authentication and the old INONDA_PREVIEW_PASSWORD environment setting is ignored. Server source, environment files and editing paths return 404; POST requests return 405. Responses are no-store, CDN caching stays disabled, and HTTPS stays enabled. The owner explicitly authorized live search indexing. There is no noindex header or metadata; robots.txt allows crawling and sitemap.xml lists all six language versions. Search engines decide when to crawl and index.

`Anybuild` configures the Git-based Python deployment. `server.py` and `host/server.py` must stay identical. `wasmer.toml` keeps the package private while the website itself is public. A blank INONDA_ASSETS value falls back to the bundled dist directory.

## Validation

Run `node --test tests/*.test.mjs` for calculation and assistant checks and `python -m unittest discover -s tests -p 'test_*.py'` for the 6 public-host checks. Host checks cover anonymous asset access, ignored obsolete password settings, unavailable source/editing routes, HEAD responses and rejected submissions.

Desktop and mobile UI checks cover service combinations, monthly versus one-off totals, saved scenarios, validation and layout. Saved scenarios remain local to each browser.

## Calculation rules

Job price = max(quantity × (unit price + gypsum board extra), minimum job price) × complexity × property factor. Complexity: standard ×1, many cuts & details ×1.2, complex / hard access ×1.4. Commercial properties ×1.2; residential ×1. Skip & site preparation = (skips × €250 + max(€100, 5% of the job total)) × property factor. Each line shows ±15% rounded outward to €5; the total is the sum of the lines. Travel: prices are for Nicosia. The visitor must give the job's town or village (a built-in list of Cyprus places, matched in English or Greek) or tap "Use my location"; the total stays hidden until then. Road distance from Nicosia centre ≈ straight line × 1.3. Up to 20 km there is no charge; beyond that €10 for each further 10 km or part (e.g. Larnaca ≈48 km → €30, Limassol ≈80 km → €70). Travel is a fixed line: no range, no complexity or commercial factor. A position more than 260 km away is refused. No address or position leaves the browser except in the WhatsApp text the visitor chooses to send. All amounts include 19% VAT (included VAT = gross × 19/119). The complexity extras, the commercial factor, unit prices and the materials share are internal and must never appear in page copy, the PDF, the WhatsApp text or the guide. The owner's pricing rule: about 60% of each job price is company income and about 40% materials.

This repository does not change inonda.site or inonda.org.

## Design, contact and automated guide

The image-led redesign is inspired by scullion.ie. All property photos and videos are referenced directly from inonda.site and inonda.org, and the supplied company logo is preserved. External media requests are restricted by the host CSP to those company domains. See DESIGN.md for exact sources.

Both company contact lines offer WhatsApp, Viber and call links, plus the published email and address. Clicking a contact link is visitor-controlled; the site sends no enquiry automatically. Viber links require the Viber app and a reachable account for the selected number.

`dist/assistant.mjs` provides a deterministic local service guide with typed questions, suggestions, dynamic current-budget answers and navigation to property, services, estimate and contact sections. It is labelled automated, uses no AI API, keeps questions only in the current page and does not book visits or issue binding quotes.

## Languages and inspection workflow

Greek is the default. English, Russian, Ukrainian, Hebrew and Romanian are available through the header selector, matching the company websites. Language selection updates the page, service controls, validation, current-budget guide, export text, currency formatting and metadata. Hebrew uses RTL layout. Explicit ?lang=en/ru/uk/he/ro URLs override the saved local preference; Greek uses the canonical root. Locale changes preserve calculation state and numeric select values.

Translations are in dist/i18n.mjs. The private repository and server configuration remain protected, while browser-delivered JavaScript is naturally readable by visitors. The commercial pricing factor is omitted from public text; it is not a secret credential.

Book an inspection directs visitors to contact the company; the contact-section booking button calls Irina. The stated process is call, property inspection, then written offer. INONDA LTD registration HE490415, all-Cyprus coverage, published address/email and minimum six-month labour workmanship warranty appear in the footer and guide. These details come from the company website and owner instructions.

## Shared chatbot and contact icons

The same automated INONDA service and request guide is installed on all three websites. Source: tools/inonda_chat.js, tools/inonda_chat.css, tools/chat-copy.json and tools/chat-ui.json. Keep these copies synchronized alongside the network generator. It supports six languages, service combinations, referrals and a guided request draft. On inonda.homes it can explain the actual current budget. Visitor messages stay in page memory; no AI service or shared conversation database is configured.

Visitors review a request before opening a WhatsApp or email draft. Viber buttons open the selected person’s chat; the visitor can copy their visible request. No message is sent automatically. Original communication icons are self-hosted; see BRAND-ASSETS.md.

Company footer social profiles are in tools/social-links.json. Facebook and Instagram use the owner’s previously supplied company URLs. TikTok uses the confirmed company profile @inonda26; YouTube uses @InondaLTD. Preserve these exact company channels. Keep the configuration synchronized across all three repositories. LinkedIn is excluded by the owner.

### Current static hosting cache behaviour

Wasmer’s Staticfile runtime currently ignores the legacy settings/config.toml overrides and sends Cache-Control: max-age=86400 for HTML. Refresh the page after a deployment; use a hard refresh if a browser retains an earlier page. Changing that TOML file alone does not change the live headers. The original management-site CSS/JS and shared assets now use versioned URLs to avoid stale layouts. The estimator uses its own no-store Python host.
