#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
// Import chalk in a way that works for both CJS and ESM-installed chalk (v4/v5+)
let chalk;
try {
  const _c = require('chalk');
  chalk = _c && _c.default ? _c.default : _c;
} catch (err) {
  // fallback: minimal no-op coloring functions
  chalk = {
    red: (s) => s,
    yellow: (s) => s,
    green: (s) => s,
    blue: (s) => s,
    bold: (s) => s,
  };
}
const { Command } = require('commander');

const program = new Command();

program
  .option(
    '-s, --source <glob>',
    'Source code glob to scan',
    'src/**/*.{js,jsx,ts,tsx}'
  )
  .option('-l, --locales <dir>', 'Locales directory', 'src/locales')
  .option(
    '-b, --base <file>',
    'Base locale file (e.g., en-US.json)',
    'en-US.json'
  )
  .option(
    '-t, --targets <files>',
    'Target locale files (comma-separated)',
    'zh-CN.json'
  )
  .option('-e, --extract', 'Extract keys and generate/update JSON files')
  .option('--quiet', 'Only return exit code, minimal output')
  .parse(process.argv);

const options = program.opts();

function extractKeysFromCode(sourceGlob) {
  const files = glob.sync(sourceGlob, { nodir: true });
  const keys = new Set();
  const reIntlGet = /intl\.get\(\s*['"`]{1}([^'"`]+?)['"`]{1}\s*\)/g;
  const reFormattedMessage = /<FormattedMessage[^>]*id=\s*["'`]([^"'`]+)["'`]/g;
  const reFormatMessage =
    /formatMessage\(\s*\{[^}]*id\s*:\s*['"`]([^'"`]+)['"`][^}]*\}\s*\)/g;

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let m;
      while ((m = reIntlGet.exec(content))) keys.add(m[1]);
      while ((m = reFormattedMessage.exec(content))) keys.add(m[1]);
      while ((m = reFormatMessage.exec(content))) keys.add(m[1]);
    } catch (err) {
      // ignore
    }
  });

  return Array.from(keys).sort();
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(chalk.red(`Failed to parse JSON: ${filePath}`));
    return {};
  }
}

function getNestedValue(obj, dottedKey) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return undefined;
  }
  return cur;
}

function setNestedValue(obj, dottedKey, value) {
  const parts = dottedKey.split('.');
  let cur = obj;
  parts.slice(0, -1).forEach((part) => {
    if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
    cur = cur[part];
  });
  cur[parts[parts.length - 1]] = value;
}

function extractAndGenerate(sourceKeys, localePath) {
  const data = loadJson(localePath);
  sourceKeys.forEach((key) => {
    if (getNestedValue(data, key) === undefined) {
      setNestedValue(data, key, `TODO: ${key}`);
    }
  });
  fs.writeFileSync(localePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  if (!options.quiet)
    console.log(chalk.green(`Updated ${localePath} with new keys.`));
}

function runValidation(sourceKeys, opts) {
  const basePath = path.join(opts.locales, opts.base);
  const baseData = loadJson(basePath);

  const targets = opts.targets
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  let problems = 0;

  targets.forEach((targetFile) => {
    const targetPath = path.join(opts.locales, targetFile);
    const targetData = loadJson(targetPath);

    const missing = [];
    sourceKeys.forEach((k) => {
      if (getNestedValue(targetData, k) === undefined) missing.push(k);
    });

    if (missing.length) {
      problems += missing.length;
      console.log(
        chalk.red(`\nMissing ${missing.length} keys in ${targetFile}:`)
      );
      missing.forEach((k) => console.log('  ' + chalk.yellow(k)));
    } else if (!options.quiet) {
      console.log(chalk.green(`No missing keys in ${targetFile}`));
    }
  });

  return problems;
}

// Main
(function main() {
  const sourceKeys = extractKeysFromCode(options.source);

  if (sourceKeys.length === 0 && !options.quiet) {
    console.log(chalk.yellow('No i18n keys found in source.'));
  }

  if (options.extract) {
    const basePath = path.join(options.locales, options.base);
    extractAndGenerate(sourceKeys, basePath);
    options.targets
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((target) => {
        extractAndGenerate(sourceKeys, path.join(options.locales, target));
      });
    process.exit(0);
  }

  const problems = runValidation(sourceKeys, options);
  if (problems > 0) process.exit(2);
  process.exit(0);
})();
