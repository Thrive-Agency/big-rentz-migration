import colors from './colors.js';

class ScriptTimer {
  constructor(label = 'Script', color = 'cyan') {
    this.label = label;
    this.color = colors[color] || colors.cyan;
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = process.hrtime.bigint();
  }

  end() {
    this.endTime = process.hrtime.bigint();
    const durationMs = Number(this.endTime - this.startTime) / 1e6;
    console.log(`${this.color}______________________________________________________ ${colors.reset}`);
    console.log(`${this.color}[${this.label}] Finished at: ${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${this.color}[${this.label}] Execution time: ${durationMs.toFixed(2)} ms${colors.reset}\n`);
  }
}

export default ScriptTimer;
