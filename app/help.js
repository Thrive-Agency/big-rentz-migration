// help.js
// Lists all available npm scripts from package.json
import path from 'path';
import fs from 'fs';
import ScriptHeader from './utils/ScriptHeader.js';
import colors from './utils/colors.js';

import { exec } from 'child_process';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const header = new ScriptHeader('NPM Scripts Help', 'cyan');
header.print();

const scriptNames = Object.keys(pkg.scripts);
console.log(`${colors.yellow}Available npm scripts:${colors.reset}`);
console.log(`${colors.magenta}----------------------${colors.reset}`);
scriptNames.forEach((name, i) => {
  console.log(`${colors.green}${i + 1}${colors.reset}. ${colors.cyan}${name}${colors.reset} - (${colors.white}npm run ${name}${colors.reset})`);
});

process.stdout.write(`\n${colors.blue}Select a script number to run: ${colors.reset}`);
process.stdin.setEncoding('utf8');
process.stdin.once('data', input => {
  const num = parseInt(input.trim(), 10);
  if (isNaN(num) || num < 1 || num > scriptNames.length) {
    console.error(colors.red + 'Invalid selection.' + colors.reset);
    process.exit(1);
  }
  const selected = scriptNames[num - 1];
  console.log(`${colors.green}Running:${colors.reset} npm run ${selected}\n`);
  // Use stdio: 'inherit' to preserve colors and formatting
  import('child_process').then(({ spawn }) => {
    const child = spawn('npm', ['run', selected], { stdio: 'inherit', shell: true });
    child.on('exit', code => process.exit(code));
  });
});
