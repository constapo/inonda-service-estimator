# Update the INONDA estimator remotely

The website source is in the private repository:
https://github.com/constapo/inonda-service-estimator

Wasmer is connected to the `main` branch. A commit pushed to `main` triggers a new deployment. The same website stays at https://www.inonda.homes. Wasmer is configured to redirect https://inonda.homes to the www address.

## Edit manually in a browser

1. Sign into your own GitHub account and open this repository.
2. Open the file you want to change, then choose **Edit this file** (the pencil icon). You can also press `.` on the repository page to open GitHub's browser editor.
3. Make the change and choose **Commit changes**. A commit to `main` deploys automatically. For a larger change, use a branch and review it before merging into `main`.
4. Watch the new deployment at https://wasmer.io/apps/constapo/inonda-service-estimator/deployments.
5. Wait until the deployment is ready, then refresh the private website and check the result. A saved file alone does not guarantee a successful deployment.

| What to update | File |
| --- | --- |
| Headings, explanatory text and page structure | `dist/index.html` |
| Colours, typography, spacing and mobile layout | `dist/styles.css` |
| Default rates, service scopes, minimums and calculation rules | `dist/estimator.mjs` |
| Form interactions, download text, saved scenarios and print layout | `dist/app.js` |
| Official company logo | `dist/inonda-logo.png` |
| Server access protection and asset routes | `server.py` and `host/server.py` |
| Wasmer build/runtime configuration | `Anybuild`, `wasmer.toml`, `app.yaml` |

Keep `server.py` and `host/server.py` identical. The first serves the Git-based Anybuild deployment; the second supports the filesystem mapping in `wasmer.toml`.

## Ask ChatGPT or Claude to update it

Give the assistant access to this private repository using your existing GitHub integration, then identify this repository and describe the changes. An assistant without authorized repository access cannot deploy changes just by seeing the website URL.

Example request:

> Update `constapo/inonda-service-estimator`. Keep the official INONDA logo, Ocean Blue / Dark Navy / white branding, private access and existing INONDA websites intact. Make [specific change]. Validate the relevant behaviour, commit it, and verify the Wasmer deployment at www.inonda.homes. Keep rates labelled illustrative unless I supply approved rates.

For substantial changes, ask for a pull request before merging. For a direct live update, explicitly request a tested commit to `main`.

## Keep access private

The username is `inonda`. The private access password belongs only in Wasmer's runtime environment variable `INONDA_PREVIEW_PASSWORD`, and must contain at least 16 characters. Enter it yourself in Wasmer's Environment Vars and choose **Save and Redeploy**. Do not put it in source files, commits, URLs, screenshots, issue comments or chat messages.

No configured password: the server stays locked and returns HTTP 503. Missing or incorrect login credentials: HTTP 401. Valid login: estimator assets are served. CDN caching must stay disabled; HTTPS redirect must stay enabled.

Saved estimate scenarios are local to the visitor's browser. They do not update the website's default rates. To change defaults for every visitor, edit `dist/estimator.mjs` and deploy the change.

## Checks and rollback

For calculation changes, run `node --test tests/estimator.test.mjs`. For host changes, run `python -m unittest discover -s tests -p 'test_*.py'`. Check desktop and mobile controls, one-off/monthly totals, input validation and access protection as appropriate.

If a live update breaks the site, redeploy a previous working version from Wasmer's deployment history or revert the offending Git commit. Do not fix a broken private deployment by removing authentication or exposing the repository.
