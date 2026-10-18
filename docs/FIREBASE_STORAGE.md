# Firebase persistence

Production uses Firebase Authentication and the existing Firestore service account (`SHADOWING_FIREBASE_SERVICE_ACCOUNT`). No PostgreSQL configuration is required. All private collections below are accessed only by server endpoints after verifying the Firebase ID token; clients cannot submit a different owner UID or import admin/VIP privileges.

| Data | Firestore location |
| --- | --- |
| Profiles, XP, learning progress and roles | `app_users/{uid}` |
| Vocabulary, grammar, kanji and lessons | `curriculum_seeds` plus `curriculum_*` overrides/tombstones |
| Confirmed grammar content | `grammar_ai_contents` |
| Grammar repetition progress | `app_users/{uid}/grammar_progress` |
| Browser learning state, notebooks, flashcards, annotations and history | `app_users/{uid}/learning_state` |
| Imported PDFs | `app_users/{uid}/files` with chunked private uploads |
| Listening JSON data and packaged imports | `persistent_json` |
| AI configuration | `server_settings` (server-only) |
| Shadowing, reading catalog and roadmaps | Existing `shadowing_*`, `reading_*`, `learning_profiles` collections |

Bundled curriculum and JSON files are seed inputs and offline fallbacks. First reads import them to Firestore without overwriting existing records. Confirmed edits and deletion tombstones override seed data. The original repository files remain available for recovery.

On login a versioned import transfers the matching account's cached profile (or unowned guest progress) once. Existing server progress and privileges are preserved. Browser learning keys are synced privately; credentials and login state are excluded. Pending changes remain on the device until acknowledged. A per-account IndexedDB backup isolates offline caches when switching accounts. Imported PDFs are uploaded privately when imported by a signed-in user or when the saved PDF library is opened. Guests retain local data until they sign in.

Large learning values and PDFs use small HTTP chunks. File publication happens only after all parts are present. File deletion leaves a tombstone so stale devices cannot silently recreate it. Keep operational backups and retention policies appropriate to the deployment.

Validation: `npm run lint`, `npm run build`, `node --import tsx --test tests/*.test.ts tests/*.test.tsx`. The Firebase persistence suite verifies profile import, privilege protection, content tombstones, transaction-based progress, large values, stale updates, private PDF parts and deletion.
