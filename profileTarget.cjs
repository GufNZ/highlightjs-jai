// @ts-check
// Profile-friendly runner: warms up (triggers language compile), then highlights test.jai N times in a loop.
// Usage: node profileTarget.cjs [iterations]  (default 20)
const hljs = require('highlight.js').default ?? require('highlight.js');
const jai = require('./src/languages/jai.js');
const fs = require('fs');

hljs.registerLanguage('jai', jai);

const code = fs.readFileSync('./test.jai', 'utf-8');
const iters = parseInt(process.argv[2] || '20', 10);

// Warm up: forces compileLanguage to run so it doesn't dominate the profile.
console.time('compile+first-highlight (warm-up)');
hljs.highlight(code, { language: 'jai' });
console.timeEnd('compile+first-highlight (warm-up)');

console.time(`highlight x${iters} (${code.length} chars each)`);
let totalChars = 0;
for (let i = 0; i < iters; i++) {
	const r = hljs.highlight(code, { language: 'jai' });
	totalChars += r.value.length;
}
console.timeEnd(`highlight x${iters} (${code.length} chars each)`);
console.log(`Produced ${totalChars} chars total.`);
