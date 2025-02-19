# Translations

This directory contains the files needed to translate your project. Translatable strings are extracted into a template file, which translators use to create language-specific PO files.

- **Update the Translation Template:**
  Run `npm run create:translations` to extract all translatable strings from your source files (e.g. `dist/prefs.js` and `dist/extension.js`) into the template file (named, for example, `po/gluco-tracker@gluco.dev.pot`).

- **Merge New Strings:**
  If you already have PO files, run `npm run merge:translations` to merge any new strings from the template into the existing PO files. This ensures translators have the latest strings.

- **Compile Translations:**
  Once the PO files are updated, run `npm run build:translations` to compile them into binary MO files. These files will be placed under `resources/locale/<lang>/LC_MESSAGES/gluco-tracker.mo` and will be used by the extension at runtime.

For more details on managing translations for GNOME Shell extensions, please visit [gjs.guide Translations](https://gjs.guide/extensions/development/translations.html).
