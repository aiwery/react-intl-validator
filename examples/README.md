# Examples

This folder holds a minimal React example to demonstrate how to use the `bin/i18n-check.js` CLI.

Usage (from repo root):

1. Install dependencies for the example (optional):

```bash
cd examples/simple-react-app
npm install
```

2. Run the validator from the project root to check for missing keys:

```bash
node ../../bin/i18n-check.js -s examples/simple-react-app/src/**/*.{js,jsx} -l examples/simple-react-app/src/locales -b en-US.json -t zh-CN.json
```

3. To extract keys and update the locale files automatically:

```bash
node ../../bin/i18n-check.js -s examples/simple-react-app/src/**/*.{js,jsx} -l examples/simple-react-app/src/locales -b en-US.json -t zh-CN.json --extract
```

The example intentionally leaves `greeting.hello` out of `zh-CN.json` so you can see how the validator reports missing keys and how `--extract` will add them.
