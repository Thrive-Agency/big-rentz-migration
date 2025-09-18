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

process.stdout.write(`\n${colors.blue}Select a script number to run (Esc to exit): ${colors.reset}`);
process.stdin.setRawMode(true);
process.stdin.resume();
let inputBuffer = '';
process.stdin.on('data', chunk => {
  // Esc key (ASCII 27)
  if (chunk.length === 1 && chunk[0] === 27) {
    console.log(colors.cyan + '\nExiting help menu.' + colors.reset);
    process.exit(0);
  }
  // Enter key
  if (chunk.length === 1 && (chunk[0] === 10 || chunk[0] === 13)) {
    const num = parseInt(inputBuffer.trim(), 10);
    if (isNaN(num) || num < 1 || num > scriptNames.length) {
      console.error(colors.red + '\nInvalid selection.' + colors.reset);
      process.exit(1);
    }
    const selected = scriptNames[num - 1];
    console.log(`${colors.green}Running:${colors.reset} npm run ${selected}\n`);
    import('child_process').then(({ spawn }) => {
      const child = spawn('npm', ['run', selected], { stdio: 'inherit', shell: true });
      child.on('exit', code => process.exit(code));
    });
  } else {
    inputBuffer += chunk.toString();
  }
});
