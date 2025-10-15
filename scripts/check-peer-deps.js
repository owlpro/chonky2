#!/usr/bin/env node
import { createRequire } from 'module';
import chalk from 'chalk';

const require = createRequire(import.meta.url);

const peers = [
  'react',
  'react-dom',
  '@mui/material',
  '@mui/styled-engine-sc',
  'styled-components',
  '@emotion/react',
  '@emotion/styled',
];

console.log(chalk.cyan('\n[chonky2] Checking peer dependencies...\n'));

const missing = peers.filter(pkg => {
  try {
    require.resolve(pkg);
    return false;
  } catch {
    return true;
  }
});

if (missing.length) {
  console.log(chalk.yellow('⚠️  Some required peer dependencies are missing:'));
  missing.forEach(pkg => console.log('   - ' + chalk.red(pkg)));
  console.log(
    chalk.gray(
      '\nPlease install them manually:\n  ' +
        chalk.green(`npm install ${missing.join(' ')}`) +
        '\n'
    )
  );
} else {
  console.log(chalk.green('✅ All peer dependencies are installed.\n'));
}
