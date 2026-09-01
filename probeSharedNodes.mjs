// Find object instances that are reachable through multiple non-recursive paths
// in a Highlight.js language definition.
//
// Usage:
//   node probeSharedNodes.mjs [path/to/language.js] [--all] [--max-paths=N]

// The walk stops when it reaches an object already seen by another route. This
// reports the minimal alias points without also listing every object below a
// shared subtree. Back-edges to ancestors are counted but not reported. By
// default, leaf data such as shared keyword arrays is omitted; --all includes it.

// @ts-check

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import hljs from 'highlight.js';

const args = process.argv.slice(2);
const languagePath = resolve(args.find(arg => !arg.startsWith('--')) ?? 'src/languages/jai.js');
const includeAllObjects = args.includes('--all');
const maxPaths = Number(args.find(arg => arg.startsWith('--max-paths='))?.split('=')[1] ?? 12);

if (!Number.isInteger(maxPaths) || maxPaths < 2) {
	throw new TypeError('--max-paths must be an integer greater than one');
}

const languageModule = await import(pathToFileURL(languagePath).href);
const languageFactory = languageModule.default ?? languageModule;

if (typeof languageFactory !== 'function') {
	throw new TypeError(`${languagePath} does not export a language factory`);
}

const root = languageFactory(hljs);
/** @type {WeakMap<object, string>} */
const firstPaths = new WeakMap();
/** @type {Map<object, { paths: string[], total: number }>} */
const sharedPaths = new Map();
let visitedObjects = 0;
let recursiveEdges = 0;

/** @param {unknown} value */
function isNode(value) {
	return value !== null && typeof value === 'object';
}

const modeKeys = new Set([
	'begin', 'beginScope', 'className', 'contains', 'end', 'endScope',
	'endsParent', 'endsWithParent', 'excludeBegin', 'excludeEnd', 'illegal',
	'keywords', 'match', 'relevance', 'returnBegin', 'returnEnd', 'scope',
	'skip', 'starts', 'subLanguage', 'variants'
]);

/** @param {object} node */
function isGrammarNode(node) {
	if (Array.isArray(node)) return node.some(isNode);
	return Object.keys(node).some(key => modeKeys.has(key));
}

/** @param {string} parentPath @param {string} key */
function childPath(parentPath, key) {
	return /^(?:0|[1-9]\d*)$/.test(key)
		? `${parentPath}[${key}]`
		: /^[A-Za-z_$][\w$]*$/.test(key)
			? `${parentPath}.${key}`
			: `${parentPath}[${JSON.stringify(key)}]`;
}

/** @param {object} node */
function describe(node) {
	if (Array.isArray(node)) return `Array(${node.length})`;
	if (node instanceof RegExp) return node.toString();

	const mode = /** @type {{ scope?: unknown, className?: unknown, begin?: unknown }} */ (node);
	const scope = mode.scope ?? mode.className;
	if (typeof scope === 'string') return `Mode(scope=${JSON.stringify(scope)})`;
	if (mode.begin instanceof RegExp) return `Mode(begin=${mode.begin})`;

	return node.constructor?.name ?? 'Object';
}

/**
 * @param {unknown} value
 * @param {string} path
 * @param {Set<object>} ancestors
 */
function walk(value, path, ancestors) {
	if (!isNode(value)) return;
	const node = /** @type {object} */ (value);

	if (ancestors.has(node)) {
		recursiveEdges++;
		return;
	}

	const firstPath = firstPaths.get(node);
	if (firstPath !== undefined) {
		const result = sharedPaths.get(node) ?? { paths: [firstPath], total: 1 };
		result.total++;
		if (result.paths.length < maxPaths) result.paths.push(path);
		sharedPaths.set(node, result);
		return;
	}

	firstPaths.set(node, path);
	visitedObjects++;
	ancestors.add(node);
	for (const [key, child] of Object.entries(node)) {
		walk(child, childPath(path, key), ancestors);
	}
	ancestors.delete(node);
}

walk(root, '$', new Set());

const results = [...sharedPaths.entries()]
	.filter(([node]) => includeAllObjects || isGrammarNode(node))
	.sort((left, right) => left[1].paths[0].localeCompare(right[1].paths[0]));

for (const [node, result] of results) {
	console.log(`\n${describe(node)}`);
	for (const path of result.paths) console.log(`  ${path}`);
	if (result.total > result.paths.length) {
		console.log(`  ... ${result.total - result.paths.length} more path(s)`);
	}
}

console.log(
	`\n${results.length} shared ${includeAllObjects ? 'object' : 'grammar node'}(s); ` +
	`${sharedPaths.size} shared object(s) in the complete graph; ` +
	`${visitedObjects} unique object(s) visited; ` +
	`${recursiveEdges} recursive edge(s) ignored.`
);
