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
    
    let timeDisplay;
    if (durationMs >= 60000) {
      // 60+ seconds: show minutes and seconds
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      timeDisplay = `${minutes}m ${seconds}s`;
    } else if (durationMs >= 1000) {
      // 1+ seconds: show seconds with decimals
      timeDisplay = `${(durationMs / 1000).toFixed(2)}s`;
    } else {
      // Less than 1 second: show milliseconds
      timeDisplay = `${durationMs.toFixed(2)} ms`;
    }
    
    console.log(`${this.color}______________________________________________________ ${colors.reset}`);
    console.log(`${this.color}[${this.label}] Finished at: ${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${this.color}[${this.label}] Execution time: ${timeDisplay}${colors.reset}\n`);
  }
}

export default ScriptTimer;
