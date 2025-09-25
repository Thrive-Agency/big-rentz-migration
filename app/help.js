// help.js
// Lists all available npm scripts from package.json
import path from 'path';
import fs from 'fs';
import ScriptHeader from './utils/ScriptHeader.js';
import colors from './utils/colors.js';

import { exec } from 'child_process';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Array of scripts that should not be run from this interactive script
const dangerousScripts = [
  'reset-db',
  'delete',
  'delete-all',
  'init-db'
];

// Array of scripts that require arguments or special handling
const scriptsRequiringArgs = [
  'help',
  'get-post',
  'process-record',
  'add-column-to-map'
];

const header = new ScriptHeader('NPM Scripts Help', 'cyan');
header.print();

const allScriptNames = Object.keys(pkg.scripts);
const safeScripts = allScriptNames.filter(name => 
  !dangerousScripts.includes(name) && !scriptsRequiringArgs.includes(name)
);
const dangerScripts = allScriptNames.filter(name => dangerousScripts.includes(name));
const argsScripts = allScriptNames.filter(name => scriptsRequiringArgs.includes(name));

console.log(`${colors.yellow}Available npm scripts:${colors.reset}`);
console.log(`${colors.magenta}----------------------${colors.reset}`);
safeScripts.forEach((name, i) => {
  console.log(`${colors.green}${i + 1}${colors.reset}. ${colors.cyan}${name}${colors.reset} - (${colors.white}npm run ${name}${colors.reset})`);
});

if (argsScripts.length > 0) {
  console.log(`\n${colors.yellow}Scripts requiring arguments or special handling:${colors.reset}`);
  console.log(`${colors.yellow}----------------------------------------------${colors.reset}`);
  console.log(`${colors.white}(These scripts need additional parameters or manual execution)${colors.reset}`);
  argsScripts.forEach(name => {
    console.log(`${colors.yellow}${name}${colors.reset} - (${colors.white}npm run ${name}${colors.reset})`);
  });
}

if (dangerScripts.length > 0) {
  console.log(`\n${colors.red}Danger zone:${colors.reset}`);
  console.log(`${colors.red}------------${colors.reset}`);
  dangerScripts.forEach(name => {
    console.log(`${colors.red}${name}${colors.reset} - (${colors.white}npm run ${name}${colors.reset})`);
  });
}

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
  // Backspace key (ASCII 8 or 127)
  else if (chunk.length === 1 && (chunk[0] === 8 || chunk[0] === 127)) {
    if (inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1);
      process.stdout.write('\b \b'); // Move back, write space, move back again
    }
  }
  // Enter key
  else if (chunk.length === 1 && (chunk[0] === 10 || chunk[0] === 13)) {
    const num = parseInt(inputBuffer.trim(), 10);
    if (isNaN(num) || num < 1 || num > safeScripts.length) {
      console.error(colors.red + '\nInvalid selection.' + colors.reset);
      process.exit(1);
    }
    const selected = safeScripts[num - 1];
    console.log(`${colors.green}Running:${colors.reset} npm run ${selected}\n`);
    import('child_process').then(({ spawn }) => {
      const child = spawn('npm', ['run', selected], { stdio: 'inherit', shell: true });
      child.on('exit', code => process.exit(code));
    });
  }
  // Regular characters (numbers and other printable characters)
  else {
    const char = chunk.toString();
    // Only accept numeric input
    if (/^\d$/.test(char)) {
      inputBuffer += char;
      process.stdout.write(char); // Echo the character
    }
  }
});
