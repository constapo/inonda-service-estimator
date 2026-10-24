# INONDA LTD service estimator

Always use the supplied official INONDA LTD logo (`dist/inonda-logo.png`) for this company. Preserve its colours and proportions; do not substitute an invented mark.

Private prototype for Cyprus residential and commercial property service planning.
Hosting: Wasmer. Domain: https://www.inonda.homes, with the root domain configured to redirect to www. Both domains are verified in Wasmer. The private access password must be configured before the estimator can be viewed.

For remote updates by the owner, ChatGPT or Claude, see [EDITING.md](EDITING.md). Wasmer automatically deploys commits to the connected `main` branch.

## What works

- Six combinable services with editable quantities, rates, minimums and frequency.
- Separate one-off and monthly planning ranges, condition factors, reserve, configurable tax and travel.
- Local comparison of up to three saved scenarios; download a complete plain-text brief or print/save as PDF.
- Responsive layout, accessible labelled controls, reduced-motion support, no external frontend dependencies.
- All starting prices are illustrative assumptions, not approved INONDA tariffs or verified market data.

## Private hosting on Wasmer

`server.py` requires HTTP Basic authentication on every HTML, JavaScript, CSS and image path. It uses username `inonda` and reads `INONDA_PREVIEW_PASSWORD` from the server environment. The owner must set a unique password of at least 16 characters in Wasmer's Environment Vars. Do not put it in client code, version control, this archive or a chat message.

Without a configured password the host returns HTTP 503, with no estimator assets. Without valid credentials it returns HTTP 401. CDN caching is disabled, and all responses are private/no-store. The package is marked private. There is no directory listing or arbitrary file-serving route. This small read-only prototype does not collect leads, process payments or submit notes.

Upload this project ZIP as a **new** Wasmer app; use the included `wasmer.toml` and `app.yaml`, not a Staticfile/static hosting preset. Preserve the Python command and private package flag. The ZIP maps `host/server.py` to `/app/server/server.py` and `dist` to `/app/dist`.

After the owner sets the password, verify both unauthenticated (401) and authenticated (200) access, then test UI interactions on the deployed app. Add `inonda.homes` through the new app's Domains settings using Wasmer's returned DNS records. Do not attach it to either existing INONDA app. No DNS records are invented here.

Basic authentication is suitable for this small private prototype over HTTPS. Use Wasmer's HTTPS redirect. Do not expose the app over plain HTTP or enable CDN caching. A public launch or a broader audience needs separate approval.

## Local verification

```
node --test tests/estimator.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
```

For a private local run, set `INONDA_PREVIEW_PASSWORD` through your secure environment, then run `python server.py`. The default port is 8080. A normal local static server can serve `dist` only for development; that path has no access protection and must not be used for the requested private Wasmer deployment.

## Scope and pricing

`dist/estimator.mjs` holds the illustrative defaults and pure calculation engine. A service allowance is `max(quantity × unit rate, minimum) × condition factor × recurring frequency`, plus travel. Management is unaffected by property condition. Maintenance quantity is visits per period; the minimum is per project/month. Other on-site services apply minimums per visit. Weekly frequency averages 52/12 visits monthly. Reserve is added before user-configured tax; range bounds round outward to €5.

Location and residential/commercial type do not add hidden price multipliers. These change the project context and checklist. Renovation/cleaning areas cannot exceed the indoor size; garden area is independent. The download describes excluded work and every assumption.

## Validation completed

- 12 calculation tests: totals, recurring separation, weekly averages, condition/minimum rules, reserve/tax order, travel counting, area constraints, invalid inputs, no hidden location multipliers and zero/empty plans.
- 4 host tests: fail-closed setup, authentication across every asset, cache headers, valid access, forbidden source paths, malformed credentials and unsupported submissions.
- Desktop and 375 px mobile viewport checked in browser with no horizontal overflow; mixed one-off/monthly interaction, live mobile budget, saved scenario restoration and invalid-input blocking verified.

No existing INONDA website source or domain configuration is included or altered.
