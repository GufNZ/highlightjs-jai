// @ts-check
// Programmatic profiling: warms up (compiles the language), then profiles JUST the highlight loop.
// Usage: node profileTargetLoop.cjs [iterations]  (default 500)
const hljs = require('highlight.js').default ?? require('highlight.js');
const jai = require('./src/languages/jai.js');
const fs = require('fs');
const path = require('path');
const inspector = require('inspector');

hljs.registerLanguage('jai', jai);

const code = fs.readFileSync('./test.jai', 'utf-8');
const iters = parseInt(process.argv[2] || '500', 10);

console.time('warm-up (compile + 1st highlight)');
hljs.highlight(code, { language: 'jai' });
console.timeEnd('warm-up (compile + 1st highlight)');

const session = new inspector.Session();
session.connect();

/**
 * @template T
 * @param {string} method
 * @param {any} [params]
 * @returns {Promise<T>}
 */
const post = (method, params) => new Promise((resolve, reject) => {
	session.post(method, params, (err, res) => err ? reject(err) : resolve(/** @type {T} */ (res)));
});

(async () => {
	await post('Profiler.enable');
	await post('Profiler.setSamplingInterval', { interval: 100 });		// 100µs
	await post('Profiler.start');

	console.time(`highlight x${iters} (${code.length} chars each)`);
	let totalChars = 0;
	for (let i = 0; i < iters; i++) {
		const r = hljs.highlight(code, { language: 'jai' });
		totalChars += r.value.length;
	}
	console.timeEnd(`highlight x${iters} (${code.length} chars each)`);

	const { profile } = /** @type {{ profile: object }} */ (await post('Profiler.stop'));
	fs.mkdirSync('profiles', { recursive: true });
	const outFile = path.join('profiles', `LOOP.${Date.now()}.cpuprofile`);
	fs.writeFileSync(outFile, JSON.stringify(profile));
	console.log(`Loop profile: ${outFile}`);
	console.log(`Produced ${totalChars} chars total.`);
	session.disconnect();
})();
