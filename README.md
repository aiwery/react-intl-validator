# react-intl-validator

A simple Node.js script to validate i18n keys in React projects using react-intl-universal. Scans code for intl.get() calls and checks against JSON files for missing/inconsistent translations.

## Quick Start

Install dependencies (for the CLI):

```bash
npm install
```

Run the validator against the example project:

```bash
node ./bin/i18n-check.js -s examples/simple-react-app/src/**/*.{js,jsx} -l examples/simple-react-app/src/locales -b en-US.json -t zh-CN.json
```

Extract keys and update locale files automatically:

```bash
node ./bin/i18n-check.js -s examples/simple-react-app/src/**/*.{js,jsx} -l examples/simple-react-app/src/locales -b en-US.json -t zh-CN.json --extract
```

See `examples/README.md` for more details.
