# Responsive frontend audit

Stack: React 19, React Router 7, Tailwind 4, Vite 6 and existing component CSS.

## Fixes

- Fluid root/page containers, shrinking flex/grid children and dynamic viewport height.
- Five mobile navigation destinations, accessible off-canvas menu and persistent header.
- Safe-area spacing, 44px touch controls and 16px mobile form inputs.
- Natural-height vocabulary/notebook flashcards, mobile review controls and larger Kanji grid cells.
- Native ruby rendering for Furigana; alternative word spellings can wrap without crushing kana.
- Bounded scrollable dialogs above navigation, focus containment, Escape and focus restoration.
- Pitch explanation rendered outside transformed cards, bounded to the viewport.
- Mobile/tablet mascot shortcut in the header; compact installation prompt suppressed during focused exercises.
- Preview tables scroll inside their container.
- Positioned hidden exercise legends no longer cause outer-page scrolling and hide the header.
- Consolidated conflicting ruby and main-spacing rules.

No backend, API contract, database, authentication operations, route, scoring or progress-storage changes.

## Verification

17 routes × 18 viewport sizes: 306 measurements with no document/main horizontal overflow and no outer-page vertical overflow. Additional 54 measurements after the Japanese word rendering change.

Routes: `/`, `/tango`, `/kanji`, `/bunpo`, `/bai-hoc`, `/jlpt`, `/doc-hieu`, `/lo-trinh`, `/xep-hang`, `/so-tay`, `/shadowing`, `/tu-dien`, `/tai-khoan`, `/thanh-tich`, `/luyen-viet`, `/chat-ai`, `/cong-dong`.

Viewports: 320×568, 360×640, 375×667, 390×844, 393×852, 412×915, 430×932, 600×960, 768×1024, 810×1080, 820×1180, 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080, 844×390, 1080×810.

Interactions checked: vocabulary flip/quiz answer, Kanji flip, notebook flip/next card/add-word form, roadmap answer/next question and retained header, mobile menu, authentication dialog (without logging in), voice selection dialog, pitch explanation and keyboard dismissal.

`npm run lint` and `npm run build` pass. Existing large-bundle/pdfjs warnings remain.

Viewport emulation is not a physical Safari/iOS or Android device test. Admin-only screens were reviewed in source; no administrator sign-in or destructive data action was performed.
