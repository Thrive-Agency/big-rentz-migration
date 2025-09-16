// Simple CLI progress bar for Node.js
export default function progressBar(current, total, barLength = 40) {
  const percent = Math.floor((current / total) * 100);
  const filledLength = Math.floor((barLength * current) / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(barLength - filledLength);
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`Progress: [${bar}] ${percent}% (${current}/${total})`);
  if (current === total) {
    process.stdout.write('\n');
  }
}
