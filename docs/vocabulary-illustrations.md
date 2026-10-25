# N4 vocabulary illustrations

The word side of a flashcard renders a local illustration above its Japanese word when that item has an entry in `src/data/vocabularyIllustrations.json`. The example side and answer side retain their existing content. Missing or failed images do not show a broken image or an unrelated fallback.

## Assets and coverage

- Source vocabulary: `src/data/tangoN4Vocab.ts` (894 items).
- Shipped images: `public/vocabulary-illustrations/n4/tango_n4_<number>.webp`.
- Image index: `src/data/vocabularyIllustrations.json`. Its entry count is the actual completed coverage, not the full vocabulary count.
- Images are 288 × 288 WebP files, displayed at 112 × 112 pixels on desktop and 104 × 104 pixels on phones.

## Generation specification

Images are generated using the built-in image generation tool. Each new image illustrates the individual word's English meaning and the scene from its English example translation in the source vocabulary. The visual specification is a square, black-and-white Japanese textbook illustration with thin gray outlines, light shading, a plain white background, a readable composition at small size, and no text, numerals, logos or watermark. Scenes must be family friendly. Each word receives its own scene rather than a random stock image. The illustration for `tango_n4_7` reuses the project's existing conversation illustration, which matches its example about meeting someone recently.

## Add a completed image

Run `node scripts/save-vocab-illustration.mjs <source-image-path> tango_n4_<number>` to encode a completed image and rebuild the index. The helper needs `sharp` locally or the directory containing it in `NIHON_IMAGE_NODE_MODULES`. Save operations write temporary files before renaming them so the development server does not read partially written assets. Temporary Windows file-sharing locks are retried before an update is reported as failed.

Run `node scripts/build-vocab-illustration-index.mjs` to rebuild the index from the files already present. This command also prints the completed and total counts. It does not create missing illustrations.
