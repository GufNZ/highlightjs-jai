// @ts-check
/** @type {import('highlight.js').HLJSApi} */
const hljs = require('highlight.js').default ?? require('highlight.js');
const jai = require('./src/languages/jai.js');
const fs = require('fs');

hljs.registerLanguage('jai', jai);
const code = fs.readFileSync('./test.jai', 'utf-8');
const result = hljs.highlight(code, { language: 'jai' });
// Print first N chars of output:
const N = parseInt(process.argv[2] || '4000', 10);
console.log(result.value.slice(0, N));
console.log('--- end (', result.value.length, 'chars) ---');
