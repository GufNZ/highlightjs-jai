/// node dumpScopes.mjs >langScopes
// @ts-check

import jai from './src/languages/jai.js';
/*
import hljs from 'highlight.js';
/*/
import hljs from './localHilightDebug.js';
/**/
hljs.registerLanguage('jai', /** @type {import('highlight.js').Language} */ jai);

/** @type {Set<unknown>} */
const seen = new Set();
/**
 * Deep-equality check that ignores `_inheritID` fields and avoids cycles via the shared `seen` set.
 * @param {any} a
 * @param {any} b
 * @param {string} [path]
 * @returns {boolean}
 */
function eq(a, b, path = '$') {
	if (path === '$') seen.clear();
	if (seen.has(a)) {
		//console.log('already seen', path);
		return true;
	}
	seen.add(a);
	console.log('eq', path, '\x1b[K\x1b[A');
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			console.log(`Different at ${path}`);
			return false;
		}
		for (let i = 0; i < a.length; i++) {
			if (!eq(a[i], b[i], `${path}[${i}]`)) return false;
		}
		return true;
	} else if (a && b && typeof a === 'object' && typeof b === 'object') {
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		for (let key of aKeys) {
			if (!eq(a[key], b[key], `${path}.${key}`)) return false;
		}
		for (let key of bKeys.filter(k => !aKeys.includes(k))) {
			console.log(`Different at ${path}.${key}`, { a: a[key], b: b[key] });
		}
		return true;
	} else if (typeof a === 'function' && typeof b === 'function') {
		if (a.toString() !== b.toString()) {
			console.log(`Different at ${path}`);
		}
		return a.toString() === b.toString();
	} else {
		if (path.endsWith('_inheritID')) return true;
		if (a !== b) {
			console.log(`Different at ${path}`, { a, b });
		}
		return a === b;
	}
}

/**
 * A `RegExp` augmented with a `matchValue` flag used by `walk` to decide whether to record the matched path-string or the matched object itself.
 * @typedef {RegExp & { matchValue: boolean }} MatchRegExp
 */

/**
 * Recursively walk `obj`, recording either matched paths or the values found at those paths.
 * On the top-level call (`path === '$'`), `matches` is mutated in place from a `string[]` of glob-ish patterns to a `MatchRegExp[]`.
 * @param {unknown} obj
 * @param {(string | MatchRegExp)[]} matches
 * @param {string} [path]
 * @returns {unknown[]}
 */
function walk(obj, matches, path = '$') {
	/** @type {unknown[]} */
	const result = [];
	if (path === '$') {
		seen.clear();
		const compiled = /** @type {MatchRegExp[]} */ (matches.map(m => {
			const r = /** @type {MatchRegExp} */ (new RegExp(
				/** @type {string} */ (m)
					.replace(/\[/g, '\\[')
					.replace(/\]/g, '\\]')
					.replace(/\./g, '\\.')
					.replace(/:/g, '')
					.replace(/(.+)\?/g, '(?<=$1)[^\\[$]+')
					.replace(/\*/g, '[^.$]+')
					+ '$'
			));
			r.matchValue = /** @type {string} */ (m).endsWith(':');
			return r;
		}));

		// Replace caller's array contents in place so subsequent recursive calls use the compiled form.
		matches.length = 0;
		matches.push(...compiled);
	}

	/** @type {MatchRegExp[]} */(matches).forEach(m => {
		const match = m.exec(path);
		if (match) {
			result.push(m.matchValue ? obj : match[0]);
		}
	});

	//console.log('walk', path, '\x1b[K\x1b[A');
	if (Array.isArray(obj)) {
		if (seen.has(obj)) {
			//console.log('already seen []', path);
			return result;
		}
		seen.add(obj);
		for (let i = 0; i < obj.length; i++) {
			const sub = walk(obj[i], matches, `${path}[${i}]`);
			result.push(...sub);
		}
	} else if (obj && typeof obj === 'object') {
		if (seen.has(obj)) {
			//console.log('already seen {}', path);
			return result;
		}
		seen.add(obj);
		const keys = Object.keys(obj);
		for (let key of keys) {
			const sub = walk(/** @type {Record<string, unknown>} */ (obj)[key], matches, `${path}.${key}`);
			result.push(...sub);
		}
	}

	return result;
}

const jaiDef = jai(hljs);
const langScopes = walk(jaiDef, ['keywords.?', 'scope:', 'beginScope.*:', `endScope.*:`]);
let prev = "";
langScopes
	.sort()
	.forEach(
		/** @param {unknown} s */
		s => {
			if (s !== prev) {
				console.log(s);
				prev = /** @type {string} */ (s);
			}
		}
	);
