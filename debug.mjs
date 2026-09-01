// @ts-check
// NOTE: Despite the .mjs extension, this file is loaded into visual-test HTML pages via `<script type="text/javascript">` (NOT `type="module"`), so it runs as a classic script.
// Top-level `var` declarations therefore become globals on `window`, which is what the DevTools "Live Expressions" at the bottom of this file depend on.

// `hljs` is provided by `localHilightDebug.js` (or by a real `highlight.js` build) on the global scope as `var hljs = ...`.
/** @type {import('highlight.js').HLJSApi} */
// eslint-disable-next-line no-var
var hljs;

/** @typedef {{ _id: number, scope?: string, language?: string, children: Node[], $name?: string } } DataNode */
// Inspection globals: these are intentionally mutated as a side-effect of larger expressions so DevTools can watch their values.
// Declared as top-level `var`s so they merge with classic-script globals on `window`.
/** @type {{ stack: DataNode[] }} */ var $emitter; // populated by hljs debug build.
/** @type {RegExpExecArray | null} */ var match = null;
/** @type {number} */ var groupNum = 0;

/**
 * Render the current emitter stack as an array of `"<depth><sep><id>:<scope>[<childCount>]"` strings, top-of-stack first.
 * Reads from the global `$emitter`.
 * @returns {string[]}
 */
function emitterStack() {
	return $emitter.stack.map(
		/**
		 * @param {DataNode} s
		 * @param {number} i
		 */
		(s, i) => typeof(s) === 'string'
			? `${i}"${s}"`
			: `${i}!${s._id}:${s.scope ?? s.$name ?? '???'}[${s.children?.length ?? '-'}]`
				//+ `{${s.children.map((c, j) => typeof (c) === 'string' ? `${j}"${c}"` : `${j}/${c._id}:${c.scope ?? c.$name ?? '??'}[${c.children?.length ?? '-'}]`)}}`
	).toReversed();
}

/**
 * Make a thing you can click in the console log to select the matching text.
 * @param {any} $m
 * @returns {unknown}
 */
function clicker($m) {
	return {
		get "\u2693"() {
			// @ts-ignore - supplied by localHilightDebug.js
			_sel($m.index, $m[0].length);
			return clicker($m);
		}
	}
}

/**
 * Summarise an hljs match-record (`$m`) into a printable array, alongside the rule that fired it (extracted from `matcher.rules[$m.position]`).
 * @param {any} $m
 * @param {any} matcher
 * @returns {string[]}
 */
function matchMode($m, matcher) {
	/** @param {string} re */
	const extractName = re => /^\(\?!\n'([^']+).+$/.exec(re)?.[1];
	const $r = matcher?.rule;
	const $b = $r?.beginScope;
	const $s = $emitter.stack.slice(-1)[0];
	return $m
		.map(/** @param {any} e @param {number} i */ (e, i) => ({ e, i }))
		.filter(/** @param {{ e: any }} e */ e => e.e !== undefined)
		.map(/** @param {{ e: any, i: number }} e */ e => `${e.i}:[${e.e}]`)
		.concat(
			[
				$m.type,
				(typeof($r) !== 'undefined'
					? $r.scope
						?? $r.$name
						?? ($b && JSON.stringify($b))
						?? $r.beginRe
					: `${
						extractName(matcher?.rules?.[$m.position][0])
							?? `${$s._id}<${$s.scope}>`
					}`//+ `${$s._id}<${$s.scope}>`
				),
				clicker($m)
			]
		);
}
/**
 * Display the substring of `s` starting at `index`, with the offset bracketed in front.
 * @param {number} index
 * @param {string} s
 * @returns {string}
 */
function textLeft(index, s) {
	return `${index}[${s.substr(index)}]`;
}
/**
 * Describe the next rule(s) that the supplied hljs matcher will try.
 * @param {any} m
 * @returns {string | string[]}
 */
function matchNext(m) {
	switch (m.constructor.name) {
		case 'ResumableMultiRegex':
			return `[${m.regexIndex}/${m.rules.length}]${m.lastIndex}${m.rules[m.regexIndex % m.rules.length][0]}`;
		case 'MultiRegex':
			return m.regexes.map(/** @param {any[]} r @param {number} i */ (r, i) => {
				const $r = r[0];
				return `${i}:${$r.type} ${$r.type === 'begin' ? $r.rule.$name ?? $r.rule.scope : ''}`;
			});
		default:
			return m.constructor.name;
	};
}

/** @typedef {RegExp & { matchValue: boolean }} MatchRegExp */
/** @typedef {RegExp & { _orig?: RegExp | string }} AnnotatedRegExp */

/** @type {Set<unknown>} */
const seen = new Set();
/**
 * Recursively walk a hljs language definition (or any nested object/array graph), invoking`proc` for every value whose dotted-path matches one of the supplied patterns.
 * `proc`'s return value (when not strictly `===` to the input) replaces the value in-place.
 *
 * On the top-level call (`path.length === 1`), the `matches` parameter is mutated in place from a `string[]` of glob-ish patterns to a `MatchRegExp[]` for use by recursive frames.
 *
 * @param {(import('highlight.js').Mode & { _id: number, $name?: string } | import('highlight.js').Language)} obj
 * @param {(string | MatchRegExp)[]} matches
 * @param {(name: string, value: any, path: string, namePath: string[], parentInsert: string) => any} proc `parentInsert` is a ready-to-prepend `(?!\n'<parentName>')` sentinel when this is the first-matched child of a `begin[]`/`end[]` sub-scope group, otherwise `''`.
 * @param {string} [path]
 * @param {string | number} [key]
 * @param {any} [parent]
 * @param {any} [grandParent]
 * @param {string | null} [parentName]
 * @param {string | null} [grandParentName]
 * @param {string[]} [namePath]
 * @param {{ firstMatch: boolean } | null} [iterCtx] Shared across the current parent's child iteration so walk can fire the parent-insert exactly once regardless of key order.
 * @param {string | null} [currentScope] The scope currently in effect at this frame (i.e. the nearest scope-holding ancestor's `name`, including this frame's own if it has one). Propagates through unscoped intermediate frames.
 * @param {string | null} [outerScope] The scope *above* the current scope-holder — i.e. the nearest ancestor scope that is not the immediate one already reflected by `currentScope`. Used as the primary `parentInsert` fallback so the parent-header shows the enclosing context (e.g. `doctag`) rather than repeating the current scope (`doctag.workspace`), which is already redundant with the sub-scope annotations.
 * @returns {any}
 */
function walk(obj, matches, proc, path = '$', key = "", parent = null, grandParent = null, parentName = null, grandParentName = null, namePath = [], iterCtx = null, currentScope = null, outerScope = null) {
	if (path.length === 1) {
		seen.clear();
		const compiled = /** @type {string[]} */ (matches).map(m => {
			const r = /** @type {MatchRegExp} */ (new RegExp(
				m
					.replace(/\[/g, '\\[')
					.replace(/\]/g, '\\]')
					.replace(/\./g, '\\.')
					.replace(/\$/g, '\\$')
					.replace(/:/g, '')
					.replace(/(.+)\?/g, '(?<=$1)[^\\[$]+')
					.replace(/^\^/, '(?<!:)')
					.replace(/\*/g, '[^.$]+')
					.replace(/\//, '\\[\\d+\\]')
					+ '$'
			));
			r.matchValue = m.endsWith(':');
			return r;
		});
		matches.length = 0;
		matches.push(...compiled);
	}

	const parentKey = grandParent && parent && Object.keys(grandParent).find(k => grandParent[k] === parent);
	// Detect the `begin: [/re1/, /re2/], beginScope: { 1: "sub1", 2: "sub2" }` (and end/endScope) idiom:
	//  each element of the array is a *sub-scope* of the containing mode, named by the sibling `*Scope` object.
	const isSubScopeElement = !!(
		`${key}`.length && isFinite(Number(key))
			&& parentKey && /^(begin|end)(Scope)?$/.test(parentKey)
	);
	const subScopeName = isSubScopeElement
		? grandParent?.[parentKey.includes("Scope")
			? parentKey.replace("Scope", "")
			: parentKey + "Scope"]?.[/** @type {number} */ (key) + 1]
		: undefined;

	let name = (
		/** @type {{ $name?: string }} */(obj).$name
		?? obj.scope
		?? /** @type {import('highlight.js').Language} */(obj).name
		?? subScopeName
	 ) || '';

	if (name) {
		if (subScopeName || /variants\[\d+\].\w+$/.test(path)) {
			name = `\t${name}`;
		}
	} else if (parentKey === 'begin' || parentKey === 'end') {
		// Unscoped `begin[i]`/`end[i]` element: keep the same sub-scope indent as its scoped siblings, but leave the name blank so it's visually distinct:
		name = `\t`;
	}

	namePath = [
		...namePath,
		`${`${key}`.length ? isFinite(Number(key)) ? `[${key}]` : `.${key}` : ''}${name}`
	];//console.debug(namePath.join(''));

	let reName = namePath[namePath.length - 1].replace(/^\[\d+\]/, '');
	if (reName == '.begin' || reName == '.end') {
		reName = namePath[namePath.length - 2].replace(/^\[\d+\]/, '');
	}

	/** @type {MatchRegExp[]} */(matches).forEach(m => {
		const match = m.exec(path);
		if (match) {
			// Compute parentInsert here (in walk) so proc doesn't need to know about the `begin[]`/`end[]` + `*Scope` idiom or the first-child bookkeeping. Emit '' rather than null when there's nothing to prepend, so proc has no branch to execute:
			let parentInsert = '';
			if (iterCtx?.firstMatch && (parentKey === 'begin' || parentKey === 'end')) {
				const scopeObj = grandParent?.[parentKey + 'Scope'];
				// Prefer `outerScope` so the header shows the *enclosing* context (skipping the immediate scope-holder whose scope is already implied by the sub-scope annotations). Fall back to `currentScope` for the top-level case where there's nothing above:
				const parentName = scopeObj?.[0] ?? outerScope ?? currentScope;
				if (parentName) {
					parentInsert = `(?!\n'${parentName}>')`;
					iterCtx.firstMatch = false;
				}
			}

			const result = proc(reName, obj, path, namePath, parentInsert);
			if (result !== obj) {
				obj = result;
			}
		}
	});

	// Propagate scope context to children:
	//  - If this frame has a `name`, it's a new scope-holder: children see it as their `currentScope`, and our previously-current scope becomes their `outerScope`.
	//  - Otherwise (unscoped intermediate frame like a `variants[i]` entry with no `scope`, or a plain array), pass both through unchanged.
	const childCurrentScope = name || currentScope;
	const childOuterScope = name ? currentScope : outerScope;

	//console.log('walk', path, '\x1b[K\x1b[A');
	if (Array.isArray(obj)) {
		if (seen.has(obj)) {
			return obj;
		}


		seen.add(obj);
		const childIterCtx = { firstMatch: true };
		for (let i = 0; i < obj.length; i++) {
			const result = walk(obj[i], matches, proc, `${path}[${i}]`, i, obj, parent, name, parentName, namePath, childIterCtx, childCurrentScope, childOuterScope);
			if (result !== obj[i]) {
				obj[i] = result;
			}
		}
	} else if (obj && typeof obj === 'object') {
		if (seen.has(obj)) {
			return obj;
		}


		seen.add(obj);
		const keys = Object.keys(obj);
		const childIterCtx = { firstMatch: true };
		for (let key of keys) {
			// @ts-ignore
			const result = walk(obj[key], matches, proc, `${path}.${key}`, key, obj, parent, name, parentName, namePath, childIterCtx, childCurrentScope, childOuterScope);
			// @ts-ignore
			if (result !== obj[key]) {
				// @ts-ignore
				obj[key] = result;
			}
		}
	}

	return obj;
}

/**
 * Pretty-print a regex error: shows a window of the source around the offending position with a caret underneath, then logs the whole regex on a second line.
 * @param {string} re
 * @param {number} i
 * @param {string} path
 * @param {string} message
 * @returns {void}
 */
function reError(re, i, path, message) {
	const min = Math.max(0, i - 20);
	const max = min + 40;
	const error = `${message} at position ${i} for ${path}:\n${min ? '...' : ''}${re.slice(min, max)}${max <= re.length ? '...' : ''}\n${' '.repeat(max <= re.length ? i - min + 3 : i - min)}^\n${re}`;
	console.error(error);
	//throw new Error(error);
}

/**
 * Statically validate the atomic-group-with-backreference idiom (`(?=(...\\N`)`) used throughout the Jai grammar:
 *  the `\\N` backreference must point at the immediately-preceding atomic group.
 * @param {string} re
 * @param {string} path
 * @param {boolean} [validateParenthes]
 * @returns {number}
 */
function validateAtomics(re, path, validateParenthes = true) {
	if (!/\(\?=\(.+?\\\d/.test(re) || !validateParenthes || re.indexOf(('(')) === -1) {
		return 0;
	}


	let errors = 0;

	/** @type {number[]} */
	const depthStack = [];
	/** @type {number[]} */
	const groups = [-1];
	/** @type {number[]} */
	const atomics = [];
	for (let i = 0, len = re.length, end = len - 1; i < len; i++) {
		if (/^\\[()[\]]/.test(re.slice(i, i + 2))) {
			i += 1;
			continue;	// <- i++
		} else if (re[i] === '[') {
			// Character class - `(`, `)`, `|` etc. inside are literals, NOT regex tokens.
			// Skip to the matching `]`, accounting for `\]` escapes. A leading `]` right after `[` or `[^` is treated as a literal `]` by JS regex, so allow that:
			let j = i + 1;
			if (re[j] === '^') j++;
			if (re[j] === ']') j++; // literal `]` at start of class.
			while (j < len && re[j] !== ']') {
				if (re[j] === '\\') j++;
				j++;
			}
			i = j;	// land on `]`; loop's i++ moves past it.
			continue;
		} else if (re[i] === '(') {
			depthStack.push(i);
			if (!(re[i + 1] === '?' && ':=!<'.includes(re[i + 2]))) {
				groups.push(i);
			} else if (re.slice(i, i + 4) === '(?=(') {
				atomics.push(i + 3);
				i += 2;
				continue;	// <- i++
			}
		} else if (re[i] === ')') {
			if (!depthStack.length) {
				reError(re, i, path, 'Unmatched )');
				errors++;
			}


			depthStack.pop();
		} else if (match = /^\\(\d+)\b/.exec(re.slice(i))) {
			groupNum = +match[1];
			if (groupNum > groups.length) {
				reError(re, i, path, `Invalid backreference \\${groupNum} (only ${groups.length} groups)`);
				errors++;
			}


			if (atomics[atomics.length - 1] === groups[groups.length - 1]) {
				if (groupNum !== groups.length - 1) {
					reError(re, i, path, `Mismatched Atomic backref \\${groupNum} (expected ${groups.length - 1})`);
					errors++;
				}
			}
		} else if (i === end && depthStack.length) {
			reError(re, i, path, 'Unterminated (');
			errors++;
		}
	}

	return errors;
}

/**
 * Returns a `LanguageFn`-shaped factory: when invoked it returns the same `lang` object, but with every `begin`/`end`/`$pattern` regex rewritten to embed a sentinel comment naming the rule.
 * The sentinel is invisible to hljs (it's a never-matching lookahead) but makes the regex inspectable in DevTools as "match rule X at position Y".
 * Also runs `validateAtomics` over every regex during preprocessing.
 * @param {import('highlight.js').Language} lang
 * @returns {import('highlight.js').LanguageFn}
 */
function regexDebugPre(lang) {
	let errors = 0;
	const defn = walk(lang, ['^begin', 'begin/', '^end', 'end/', '$pattern'], (name, value, _, namePath, parentInsert) => {
		if (Array.isArray(value)) {
			return value;
		}

		const original = value instanceof RegExp
			? /** @type {AnnotatedRegExp} */ (value)._orig ?? value
			: value;
		const re = typeof(original) === 'string' ? original : original?.source;

		if (re === undefined) {
			console.error('undefined regex at', namePath, value);
			debugger;
			return value;
		}

		let i = 0;
		errors += validateAtomics(re, namePath.reduce((s, p) => `${s}\n${'  '.repeat(i++)}${p}`, ''));

		const annotated = /** @type {AnnotatedRegExp} */ (
			new RegExp(parentInsert + `(?!\n'${name}')` + re)
		);
		if (
			value instanceof RegExp
			&& /** @type {AnnotatedRegExp} */ (value)._orig !== undefined
			&& value.source === annotated.source
			&& value.flags === annotated.flags
		) {
			return value;
		}


		Object.defineProperty(annotated, '_orig', { value: original });

		return annotated;
	});

	if (errors) {
		throw new Error(`regexDebugPre: ${errors} error${errors === 1 ? '' : 's'} found in ${lang.name} regexes!`);
	}

	return () => defn;
}

/**
 * Clear all hover-highlight classes from the page.
 * @returns {void}
 */
function clearHilight() {
	[...document.getElementsByClassName('hover')].forEach(el => {
		el.setAttribute('class', (el.getAttribute('class') ?? '').replace(/ hover d\d/, ''));
	});
}
/**
 * Event handler factory: highlights the chain of ancestor `<span>`s above the hovered element, tagging each one with its depth.
 * Pass `clear === true` to first wipe any existing highlights (used for `mouseenter`); pass `false` for the cheaper `mousemove` version.
 * @param {boolean} clear
 * @returns {(e: MouseEvent) => void}
 */
function hilightPath(clear) {
	return (e) => {
		if (clear) {
			clearHilight();
		}

		let el = /** @type {HTMLElement | null} */ (e.target);
		for (let i = 1; el && el.tagName === 'SPAN'; i++) {
			el.classList.add('hover');
			el.classList.add(`d${i}`);
			el = el.parentElement;
		}
	};
}

/**
 * Build a `class-chain` string describing the nested-span class path leading to `el`, used as the `title` attribute so it appears on hover.
 * @param {Element} el
 * @returns {string}
 */
function getClassPath(el) {
	if (!el.classList.length) {
		return '';
	}


	/** @type {string[]} */
	const classes = [];
	/** @type {Element | null} */
	let e = el;
	while (e && e.tagName === 'SPAN') {
		classes.unshift('.' + (e.getAttribute('class') ?? '').replace(/ /g, '.'));
		e = e.parentElement;
	}
	return classes.reverse().join('\n <- ');
}

/** @type {{ setup?: number, highlight?: number, debugInfo?: number, lines: number }} */
const timings = { lines: 0 };
/** @type {ReturnType<typeof setTimeout> | undefined} */
let applyDebugInfoTimeout;

/** Format a duration as a timestamp.
 * @param {number} milliseconds
 * @param {boolean} [long] @returns {string}
 */
function formatDuration(milliseconds, long = false) {
	const totalHundredths = Math.round(milliseconds / 10);
	const minutes = Math.floor(totalHundredths / 6000);
	const seconds = Math.floor(totalHundredths / 100) % 60;
	const hundredths = totalHundredths % 100;
	const rest = milliseconds - totalHundredths * 10;
	return `${('' + minutes).padStart(2, '0')}:${('' + seconds).padStart(2, '0')}.${('' + hundredths).padStart(2, '0')}${long ? `${(rest / 1e3).toFixed(7).replace(/^0\./, '')}` : ''}`;
}

/** @param {boolean} [setupIsNew] */
function renderTimings(setupIsNew = false) {
	const stats = document.getElementById('stats');
	if (!stats) {
		return;
	}


	stats.replaceChildren();
	[
		['setup', timings.setup, !setupIsNew],
		['highlight', timings.highlight, false],
		['debug', timings.debugInfo, false]
	].forEach(([label, duration, stale]) => {
		if (typeof duration !== 'number') {
			return;
		}


		const item = document.createElement('li');
		item.className = stale ? 'stale' : '';
		if (label != 'setup') {
			item.setAttribute('title', `${(duration / timings.lines).toFixed(4)}ms/line (${timings.lines} line${timings.lines === 1 ? '' : 's'})`);
		}
		item.textContent = `${label} ${formatDuration(duration)}`;
		stats.append(item);
	});
}

/**
 * After hljs has rendered the page (we give it a generous 1 s window via `setTimeout`), walk every `<span>` and attach the hover handlers plus a `title` attribute showing the full scope path.
 * @returns {void}
 */
function applyDebugInfo() {
	clearTimeout(applyDebugInfoTimeout);
	applyDebugInfoTimeout = setTimeout(() => {
		const start = performance.now();
		[...document.getElementsByTagName('span')].forEach(span => {
			span.setAttribute('title', getClassPath(span));
			span.onmouseenter = hilightPath(true);
			span.onmousemove = hilightPath(false);
			span.onmouseleave = clearHilight;
		});
		timings.debugInfo = performance.now() - start;
		renderTimings();
	}, 1000);
}

/**
 * Fast way to count the number of lines in a string.
 * @param {string} text
 * @returns {number} The number of lines in the string.
 */
function countLines(text) {
	let lines = 1;
	for (let i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) === 10) {	// '\n'
			lines++;
		}
	}
	return lines;
}

/**
 * One-shot debug init: re-registers `langName` with the `regexDebugPre`-wrapped definition, triggers `highlight`, times it, and attaches the hover decorations.
 * @param {string} [langName]
 * @param {import('highlight.js').Language} [lang]
 * @returns {void}
 */
function debugInit(langName = 'jai', lang) {
	if (!lang) {
		lang = hljs.getLanguage(langName);
	}
	if (!lang) {
		throw new Error(`Language ${langName} not found; cannot debugInit!`);
	}


	const setupStart = performance.now();
	hljs.debugMode();
	hljs.unregisterLanguage(langName);
	hljs.registerLanguage(langName, regexDebugPre(lang));
	timings.setup = performance.now() - setupStart;
	renderTimings(true);

	const w = /** @type {any} */ (window);
	w.highlight = (/** @type {HTMLElement} */node) => {
		try {
			timings.lines = countLines(node.textContent ?? '');
			const highlightStart = performance.now();
			hljs.highlightElement(node);
			timings.highlight = performance.now() - highlightStart;
			delete timings.debugInfo;
			renderTimings();
			applyDebugInfo();
		} catch (e) {
			alert(/** @type {Error} */(e).message);
		}
	};
}

//Breakpoints:
/* localHilightDebug.js:324		[cond]		result._id==breakAtNodeId
		const result = { _id: _nodeID++, children: [] };
?>		Object.assign(result, opts);
		return result;
*/
/* localHilightDebug.js:1330 	(disabled)		collect this.matcherRE.source ~= /!\\n/!\n/g;
				this.matcherRe.lastIndex = this.lastIndex;
[>]				const match = this.matcherRe.exec(s);
				if (!match) { return null; }
*/
/* localHilightDebug.js:1899	[cond]		console.log({keyword:match[0], cssClass}), !(skip-1)
							const cssClass = language.classNameAliases[kind] || kind;
?>							emitKeyword(match[0], cssClass);
						}
*/
// localHilightDebug.js:2269	[log]		`step ${step++}`
/* localHilightDebug.js:2270	[cond]		skip&&!--skip
						if (!match) break;
->_sel(match.index, Math.max(1, match[0].length));console.log(matchMode(match, top.matcher));
?>						const beforeMatch = codeToHighlight.substring(index, match.index);
						const processedCount = processLexeme(beforeMatch, match);
*/

//Live expressions:
// emitterStack()
//
// matchMode(typeof match !== 'undefined'?match:result)
//
// textLeft(typeof index==='number'?index:this.lastIndex, typeof codeToHighlight!='undefined'?codeToHighlight:s)
//
// matchNext(top !== window.top && typeof top.matcher !== undefined ? top.matcher : this)

const windowAdditions = {
	step: 0,
	skip: 0,
	breakAtNodeId: -1,

	jaiDebug: {
		emitterStack,
		matchMode,
		textLeft,
		matchNext,
		walk,
		regexDebugPre,
		clearHilight,
		hilightPath,
		getClassPath,
		applyDebugInfo,
		debugInit
	}
};
Object.assign(window, windowAdditions);
