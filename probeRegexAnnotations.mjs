// Verify regexDebugPre annotation provenance and copy/reuse behavior.
// @ts-check

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

/** @typedef {RegExp & { _orig: RegExp | string }} AnnotatedRegExp */

const sandbox = { console, performance, RegExp };
// debug.mjs is loaded as a classic browser script and publishes jaiDebug on window.
// @ts-ignore - the self-reference models the browser global.
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(await readFile('debug.mjs', 'utf8'), sandbox, { filename: 'debug.mjs' });

const regexDebugPre = /** @type {any} */ (sandbox).jaiDebug.regexDebugPre;
const original = /shared/;
const language = {
	name: 'annotation-probe',
	contains: [
		{ scope: 'first', begin: original },
		{ scope: 'second', begin: original },
		{ scope: 'string', begin: 'string-source' }
	]
};

regexDebugPre(language)();
const firstPass = /** @type {AnnotatedRegExp[]} */ (language.contains.map(mode => mode.begin));
assert(firstPass.every(value => value instanceof RegExp));
assert.notStrictEqual(firstPass[0], firstPass[1]);
assert.strictEqual(firstPass[0]._orig, original);
assert.strictEqual(firstPass[1]._orig, original);
assert.strictEqual(firstPass[2]._orig, 'string-source');
assert.match(firstPass[0].source, /'first'/);
assert.match(firstPass[1].source, /'second'/);

regexDebugPre(language)();
assert.strictEqual(language.contains[0].begin, firstPass[0]);
assert.strictEqual(language.contains[1].begin, firstPass[1]);
assert.strictEqual(language.contains[2].begin, firstPass[2]);

language.contains[1].scope = 'changed';
regexDebugPre(language)();
const changed = /** @type {AnnotatedRegExp} */ (language.contains[1].begin);
assert.strictEqual(language.contains[0].begin, firstPass[0]);
assert.notStrictEqual(changed, firstPass[1]);
assert.strictEqual(changed._orig, original);
assert.match(changed.source, /'changed'/);
assert.doesNotMatch(changed.source, /'second'/);
assert(changed._orig instanceof RegExp);
assert.doesNotMatch(changed._orig.source, /\(\?!/);

console.log('Regex annotation copy/reuse probe passed.');
