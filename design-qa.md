# INONDA redesign verification

final result: passed

The comparison target is the requested Scullion-inspired adaptation, using only INONDA media and the official supplied logo. It is not a claim of pixel-perfect cloning or an audit of Scullion's mobile implementation.

## Evidence and comparison setup

- Source visual truth: /workspace/scratch/inonda-reference-1792915308020.jpg; https://scullion.ie/?ref=siteinspire.
- Final rendered local desktop: /workspace/scratch/inonda-preview-desktop-1792917714940.jpg.
- Final rendered mobile: /workspace/scratch/inonda-preview-mobile-1792917714940.jpg.
- Actual side-by-side comparison inspected: /workspace/scratch/inonda-design-comparison.jpg.
- Desktop CSS viewport: 1363 × 936, device scale 1 for source and implementation. Source pixels 1363 × 936; implementation pixels 1348 × 926. Browser normalization was accounted for by resizing both full views uniformly to 1200 × 824; no page content was cropped for that comparison.
- Mobile: 390 × 844 iframe CSS viewport, content width 375, device scale 1; screenshot crop is 390 × 844. All six languages reported scrollWidth equal to clientWidth.
- State: homepage, menu closed, default planning example, Greek selected, hero poster visible. The reference has an automatic reel; paired-image and colour/inset variants were both inspected. The saved reference captures its full-photo variant.

## Comparison history and fixes

1. [P1, resolved] The initial no-source hero video did not reliably display its poster. Added a real company-sourced image fallback, hidden only after video playback begins. Post-fix image appears in the final desktop and mobile captures. Video subsequently reported readyState 4, advancing currentTime and no media error.
2. [P2, resolved] The first mobile hero gave too little prominence to the estimate action. Reduced mobile media height while preserving its crop and moved the inspection action into a full-width header row. Final mobile capture shows both actions.
3. [P2, resolved] The floating assistant overlapped longer Greek and Hebrew hero actions. Moved it into the mobile bottom dock, mirrored the dock for RTL, and reserved desktop hero footer space. Final Greek mobile/desktop evidence shows the estimate action unobscured.
4. [P2, resolved] Localized monetary ranges could be visually reordered by RTL marks. Isolated ranges in LTR formatting while retaining Hebrew labels and RTL layout. Currency remains EUR in every locale.

No actionable P0/P1/P2 findings remain for this requested adaptation.

## Required fidelity surfaces

- Typography: regular-weight grotesk headings and generous scale follow the reference direction; the freely available system stack intentionally replaces proprietary Founders Grotesk. Greek, Cyrillic, Hebrew and Romanian text were rendered and inspected. No heading or navigation clipping was observed at the tested desktop/mobile sizes.
- Spacing/layout: split hero, inset imagery, generous whitespace, simple menu and flat forms preserve the reference direction. The header logo, service estimator, contact workflow and bottom dock are intentional INONDA additions. Mobile form controls remain usable and no horizontal overflow was measured in any locale.
- Colours/tokens: INONDA Ocean Blue, Dark Navy and white intentionally replace the reference's changing reel colours. Selection, focus and error states are distinct. The estimate uses light text on navy.
- Image quality: real INONDA media replaces all reference imagery by explicit owner instruction. All page images loaded with nonzero natural width. The supplied logo is unchanged. No generated property pictures or reconstructed decorative artwork are used.
- Copy/content: encourages self-estimation and then contact. Labels distinguish planning estimates from binding offers. VAT is included; commercial rates are reflected in the displayed values without percentage text. Company identity and warranty come from the named company websites and owner. Greek default and all six requested language choices are available.

Focused inspection covered the native-size logo/header, rate/minimum controls, one-off/monthly estimate, contact lines and assistant dialog in the actual browser. The added estimator and contact panels have no Scullion equivalents, so these regions were evaluated for usability and consistency rather than invented pixel fidelity. Desktop and mobile screenshots plus live DOM-backed checks were used; the source comparison was not inferred from code alone.

## Interactions checked

- Property type/location, all six service selections, scope variants and mixed one-off/monthly budgets.
- Commercial applicable rates; editing an applicable rate does not add the pricing factor again.
- Invalid size blocks the estimate/export and displays a localized error.
- Saved scenario persistence and restore, main navigation/menu, estimate shortcut and inspection/contact navigation.
- Contact hrefs for both WhatsApp numbers, both Viber numbers, telephone and email. No message or call was sent; recipient app/account availability is outside browser validation.
- Automated guide: typed service question, Greek current-budget question, VAT/warranty handling, contact guidance and section navigation. It is labelled automated and cannot confirm bookings.
- Six-language title, labels, price formatting and state preservation; Hebrew RTL; mobile width in all locales.
- Hero video play/pause and advancing playback. Presentation is a native controlled video from the company source; the entire film was not watched as a content audit.
- No application-origin console errors observed. Unrelated browser-extension metadata warnings were excluded from the application finding list.
- 25 calculation/assistant/localization checks and 6 host checks pass. Host checks include anonymous asset delivery, no visitor authentication, server/config path isolation, prohibited submissions and indexable metadata/robots/six-language sitemap.

## Practical limits / follow-up polish

- The guide is a deterministic local FAQ and estimator guide, not a generative AI backend or a human operator.
- Remote media depends on the two existing INONDA websites. No changes were made to those websites.
- Native-language commercial/legal copy can be reviewed by the owner as part of future copy updates. Browser verification establishes rendering and interactions, not a certified translation.
- Download uses a normal browser-generated text file and print uses the browser dialog. Automated download-event capture was inconclusive; no download artifact is represented as verified or returned.
- Search crawling is enabled; actual indexing and ranking remain search-engine decisions.

## Implementation checklist

- [x] Preserve the official logo and owner-only photo/video sources.
- [x] Retain VAT and commercial calculation behaviour.
- [x] Add inspection/contact flow and automated guide.
- [x] Add all six languages and Hebrew RTL.
- [x] Remove noindex/nofollow under the owner's explicit live-publication instruction.
- [x] Verify locally in the browser and pass relevant checks.
- [x] Confirm the deployed revision and inspect the live domain after publication.

## Live publication verification

On 2026-10-25 Wasmer reported revision 1f65d223098f77365339f3afcb3167b1c5c75f92 as Ready and active (deployment ro_0DIktOzfZgxY). A fresh anonymous cloud-browser navigation to https://inonda.homes redirected to https://www.inonda.homes/ and loaded the redesigned Greek page without a login.

The live site was checked for commercial rate display, mixed one-off/monthly services, the automated guide’s actual current-budget answer, all six locale/direction states, index/follow metadata, canonical URL, the published robots.txt and six-language sitemap, both WhatsApp/Viber/call lines, email, company registration and warranty. No application-origin console error was observed. The final accessibility follow-up also localizes composed service-scope labels and is covered by the locale checks.

Owner-browser production mobile verification also reported a 375px content width without horizontal overflow and confirmed the new composed Greek service-scope label. The owner profile was automatically translating Greek into Romanian on top of the built-in locales. The document now declares translate=no and the Google notranslate marker, so browser machine translation does not overwrite the application’s own selected language. This does not alter index/follow search access.
