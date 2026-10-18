// Compatibility entry point; the importer now persists directly to Firebase.
require('node:child_process').execFileSync(process.execPath, ['--import','tsx','scripts/import_n4_all_to_system.ts'], {stdio:'inherit'});
