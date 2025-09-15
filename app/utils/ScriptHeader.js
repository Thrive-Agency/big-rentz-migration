import colors from './colors.js';

class ScriptHeader {
  constructor(name, color = 'green') {
    this.name = name;
    this.color = colors[color] || colors.green;
  }

  print() {
    const line = '--------------------------------';
    console.log(`\n${this.color}${line}\nRunning: ${this.name}\n${line}${colors.reset}\n`);
  }
}

export default ScriptHeader;
