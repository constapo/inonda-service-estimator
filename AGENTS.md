# INONDA LTD estimator: instructions for coding assistants

- This is the INONDA LTD service estimator for Cyprus, with public visitor access. The owner has explicitly authorized coordinated updates and cross-referrals across `inonda.homes`, `inonda.site` and `inonda.org`. Their repositories are `constapo/inonda-service-estimator`, `constapo/inonda-website` and `constapo/inonda-cy-website`. Preserve each site’s distinct role and do not change DNS for routine content updates.
- Always use the official supplied logo at `dist/inonda-logo.png`. Preserve its proportions and colours. Do not substitute a generated company mark. Use Ocean Blue `#0077B6`, Dark Navy `#023E8A` and white.
- The owner explicitly authorized visitor access without any login or password. Preserve public read-only access, private repository visibility, account-protected editing, disabled CDN caching, no-store responses and HTTPS. Do not add a visitor password gate or make the repository public without explicit new authorization.
- Never read, expose, commit or embed credentials. The obsolete INONDA_PREVIEW_PASSWORD setting is no longer read by the application; do not reuse it or change the owner's credentials.
- `Anybuild` is the Git-based hosting build. Use the Python host rather than serving `dist` publicly. `server.py` and `host/server.py` must remain identical.
- The estimator is a budget planner for potential customers: one-off jobs only, chosen by title, never by tapping photos. Maintenance, management, cleaning, garden care, contract repairs and urgent repairs are contract-only and must stay out of it (owner decision, 12 November 2026). Photos live in a separate information-only section below the planner.
- Prices include materials, installation and 19% VAT. Show only price ranges, never unit rates, material prices, complexity extras (+20% many cuts, +40% complex) or the commercial factor. The owner's rule is about 60% company income and 40% materials per job. Keep the planner mobile first. Do not present an estimate as a fixed quotation.
- Travel (owner rule, 12 November 2026): prices are for Nicosia; up to 20 km from Nicosia no charge, beyond that €10 for each further 10 km. The planner must ask for the job's town or village (or the visitor's location) before showing a total.
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

- Shared website journeys are generated by `tools/inonda_network.py` using `tools/network-copy.json`. Keep copies synchronized across the three repositories; run the tool with `homes`, `site` or `org` respectively. All six languages must link to both sister websites. inonda.org also applies the component in `build/gen.py`, so rebuilds preserve it.
- Carry only allowlisted service IDs, named areas and language between websites. Never transfer visitor notes, contacts, rates or saved scenarios through cross-site links. Specialist trades must not be presented as covered by a handyman or preventive inspection allowance.
- Keep current-site estimator links as #property anchors, preserving unsaved work. Retain versioned shared CSS/JS asset URLs for the static websites.

- The owner explicitly requested original WhatsApp and Viber brand icons. Local original files are whatsapp-official.svg and viber-official.svg; provenance is in BRAND-ASSETS.md. This is an explicit exception to the company-only media rule for communication-channel icons. Do not replace brand symbols with letters or recolour them.
- The same six-language guided chatbot runs on all three websites from tools/inonda_chat.js, tools/inonda_chat.css, tools/chat-copy.json and tools/chat-ui.json. It is an automated local service guide, not a generative AI or a human. Requests open WhatsApp/email drafts only on a visitor’s explicit click; no automatic sending, booking or quote confirmation.

- Footer social profiles use tools/social-links.json. Preserve the owner-supplied Facebook and Instagram company URLs. TikTok is the confirmed company profile https://www.tiktok.com/@inonda26; YouTube is https://www.youtube.com/@InondaLTD. Do not substitute guessed or generic profiles. LinkedIn remains excluded.

- The owner explicitly requested social-media brand icons in every footer. Preserve the self-hosted facebook-brand.svg, instagram-brand.svg, tiktok-brand.svg and youtube-brand.svg assets and their attribution comments. The company-only photography rule does not exclude these requested platform brand symbols.

- Increment the shared VERSION before changing cached shared assets, and regenerate all affected pages. Keep versioned static-asset URLs. The Staticfile host currently ignores legacy settings/config.toml overrides; verify actual response headers before claiming a cache change.

- Free-search promotion: see SEARCH-SETUP.md. Preserve tools/inonda_seo.py and tools/search-config.json across builds. Public search ownership tokens are deliberately public and are not login credentials. The owner confirmed a service-area business visiting customers; do not invent a walk-in office, opening hours, ratings or accreditation.

- Latest owner correction (25 October 2026): Facebook https://www.facebook.com/inondalimited and Instagram https://www.instagram.com/inondaltd replace all earlier profile URLs, including schema and listing drafts. Preserve the social brand icons.

- Mandatory owner rule (30 October 2026): all three INONDA websites must display social media brand symbols in their original brand colours, never monochrome or recoloured to the INONDA palette. Preserve Facebook blue, Instagram gradient, TikTok black/cyan/red, YouTube red, WhatsApp green and Viber purple, including hover/focus states.
- Photo rule (owner, 12 November 2026): a service photo must show exactly the service named beside it. If no company photo matches, leave the drawn icon (image key None/null) rather than reuse a near match.
