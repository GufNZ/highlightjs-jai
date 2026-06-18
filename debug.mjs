function emitterStack() {
	return $emitter.stack.map(
		(s, i) => typeof(s) === 'string'
			? `${i}"${s}"`
			: `${i}!${s._id}:${s.scope ?? s.$name ?? '???'}[${s.children?.length ?? '-'}]`
				//+ `{${s.children.map((c, j) => typeof (c) === 'string' ? `${j}"${c}"` : `${j}/${c._id}:${c.scope ?? c.$name ?? '??'}[${c.children?.length ?? '-'}]`)}}`
	).toReversed();
}
function matchMode($m, matcher) {
	const extractName = re => /^\(\?!\n'([^']+).+$/.exec(re)?.[1];
	return $m
		.map((e, i) => ({ e, i }))
		.filter(e => e.e !== undefined)
		.map(e => `${e.i}:[${e.e}]`)
		.concat(
			[
				$m.type,
				(typeof($r = $m.rule) !== 'undefined'
					? $r.scope
						?? $r.$name
						?? (($b = $r.beginScope) && JSON.stringify($b))
						?? $r.beginRe
					: `${
						extractName(matcher?.rules?.[$m.position][0])
							?? `${($s = $emitter.stack.slice(-1)[0])._id}<${$s.scope}>`
					}`//+ `${($s = $emitter.stack.slice(-1)[0])._id}<${$s.scope}>`
				)
			]
		);
}
function textLeft(index, s) {
	return `${index}[${s.substr(index)}]`;
}
function matchNext(m) {
	switch (m.constructor.name) {
		case 'ResumableMultiRegex':
			return `[${m.regexIndex}/${m.rules.length}]${m.lastIndex}${m.rules[m.regexIndex % m.rules.length][0]}`;
		case 'MultiRegex':
			return m.regexes.map((r, i) => `${i}:${($r = r[0]).type} ${$r.type === 'begin' ? $r.rule.$name ?? $r.rule.scope : ''}`);
		default:
			return m.constructor.name;
	};
}

const seen = new Set();
function walk(obj, matches, proc, path = '$', key = "", parent = null, grandParent = null, parentName = null, grandParentName = null, namePath = []) {
	if (path.length === 1) {
		seen.clear();
		matches = matches.map(m => {
			const r = new RegExp(
				m.replace(/\[/g, '\\[')
					.replace(/\]/g, '\\]')
					.replace(/\./g, '\\.')
					.replace(/\$/g, '\\$')
					.replace(/:/g, '')
					.replace(/(.+)\?/g, '(?<=$1)[^\\[$]+')
					.replace(/^\^/, '(?<!:)')
					.replace(/\*/g, '[^.$]+')
					.replace(/\//, '\\[\\d+\\]')
					+ '$'
			);
			r.matchValue = m.endsWith(':');
			return r;
		});
	}

	const parentKey = grandParent && parent && Object.keys(grandParent).find(k => grandParent[k] === parent);
	let name = (
		obj.$name
		?? obj.scope
		?? obj.name
		?? (
			`${key}`.length && isFinite(Number(key))
				&& grandParent?.[parentKey.includes("Scope") ? parentKey.replace("Scope", "") : parentKey + "Scope"]?.[key + 1]
		)
	 ) || '';

	if (name) {
		if (/variants\[\d+\].\w+$/.test(path)) {
			name = `\t${name}`;
		}
	} else if (parentKey === 'begin' || parentKey === 'end') {
		name = `${grandParentName ?? grandParent?.[parentKey + 'Scope']?.[key + 1] ?? '...'}`;
	}

	namePath = [
		...namePath,
		`${`${key}`.length ? isFinite(Number(key)) ? `[${key}]` : `.${key}` : ''}${name}`
	];//console.debug(namePath.join(''));

	let reName = namePath[namePath.length - 1].replace(/^\[\d+\]/, '');
	if (reName == '.begin' || reName == '.end') {
		reName = namePath[namePath.length - 2].replace(/^\[\d+\]/, '');
	}

	matches.forEach(m => {
		const match = m.exec(path);
		if (match) {
			const result = proc(reName, obj, path, namePath);
			if (result !== obj) {
				obj = result;
			}
		}
	});

	//console.log('walk', path, '\x1b[K\x1b[A');
	if (Array.isArray(obj)) {
		if (seen.has(obj)) {
			return obj;
		}


		seen.add(obj);
		for (let i = 0; i < obj.length; i++) {
			const result = walk(obj[i], matches, proc, `${path}[${i}]`, i, obj, parent, name, parentName, namePath);
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
		for (let key of keys) {
			const result = walk(obj[key], matches, proc, `${path}.${key}`, key, obj, parent, name, parentName, namePath);
			if (result !== obj[key]) {
				obj[key] = result;
			}
		}
	}

	return obj;
}

function reError(re, i, path, message) {
	const min = Math.max(0, i - 20);
	const max = min + 40;
	const error = `${message} at position ${i} for ${path}:\n${min ? '...' : ''}${re.slice(min, max)}${max <= re.length ? '...' : ''}\n${' '.repeat(max <= re.length ? i - min + 3 : i - min)}^\n${re}`;
	console.error(error);
	//throw new Error(error);
}

function validateAtomics(re, path, validateParenthes = true) {
	if (!/\(\?=\(.+?\\\d/.test(re) || !validateParenthes || re.indexOf(('(')) === -1) {
		return;
	}


	const depthStack = [];
	const groups = [-1];
	const atomics = [];
	for (let i = 0, len = re.length, end = len - 1; i < len; i++) {
		if (/^\\[()]/.test(re.slice(i, i + 2))) {
			i += 1;
			continue;	// <- i++
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
			}


			depthStack.pop();
		} else if (match = /^\\(\d+)\b/.exec(re.slice(i))) {
			groupNum = +match[1];
			if (groupNum > groups.length) {
				reError(re, i, path, `Invalid backreference \\${groupNum} (only ${groups.length} groups)`);
			}


			if (atomics[atomics.length - 1] === groups[groups.length - 1]) {
				if (groupNum !== groups.length - 1) {
					reError(re, i, path, `Mismatched Atomic backref \\${groupNum} (expected ${groups.length})`);
				}
			}
		} else if (i === end && depthStack.length) {
			reError(re, i, path, 'Unterminated (');
		}
	}
}

function regexDebugPre(lang) {
	const defn = walk(lang, ['^begin', 'begin/', '^end', 'end/', '$pattern'], (name, value, _, namePath) => {
		if (Array.isArray(value)) {
			return value;
		}


		let re = value;
		if (typeof(re) !== 'string') {
			re = re.source;
		}

		if (re === undefined) {
			console.error('undefined regex at', namePath, value);
			debugger;
		}

		let i = 0;
		validateAtomics(re, namePath.reduce((s, p) => `${s}\n${'  '.repeat(i++)}${p}`, ''));

		re = `(?!\n'${name}')` + re;

		return re;
	});
	return () => defn;
}

function clearHilight() {
	[...document.getElementsByClassName('hover')].forEach(el => {
		el.setAttribute('class', el.getAttribute('class').replace(/ hover d\d/, ''));
	});
}
function hilightPath(clear) {
	return (e) => {
		if (clear) {
			clearHilight();
		}

		let el = e.target;
		for (let i = 1; el.tagName === 'SPAN'; i++) {
			el.classList.add('hover');
			el.classList.add(`d${i}`);
			el = el.parentElement;
		}
	};
}

function getClassPath(el) {
	if (!el.classList.length) {
		return '';
	}


	const classes = [];
	let e = el;
	while (e && e.tagName === 'SPAN') {
		classes.unshift('.' + e.getAttribute('class').replace(/ /g, '.'));
		e = e.parentElement;
	}
	return classes.reverse().join('\n <- ');
}

function applyDebugInfo() {
	setTimeout(() => [...document.getElementsByTagName('span')].forEach(span => {
		span.setAttribute('title', getClassPath(span));
		span.onmouseenter = hilightPath(true);
		span.onmousemove = hilightPath(false);
		span.onmouseleave = clearHilight;
	}), 1000);
}

function debugInit(langName = 'jai', lang) {
	if (!lang) {
		lang = hljs.getLanguage(langName);
	}

	hljs.debugMode();
	hljs.unregisterLanguage(langName);
	hljs.registerLanguage(langName, regexDebugPre(lang));
	console.log('starting...');
	console.time('hilight');
	hljs.highlightAll();//Element(document.getElementById('it').firstChild);
	console.timeEnd('hilight');
	applyDebugInfo();
}

//Breakpoints:
// localHilightDebug.js:238		[cond]		result._id==breakAtNodeId
// localHilightDebug.js:1244 	(disabled)		collect this.matcherRE.source ~= /!\\n/!\n/g;
// localHilightDebug.js:1813	[cond]		!skip
// localHilightDebug.js:2183	[log]		`step ${step}`
// localHilightDebug.js:2184	[cond]		!(skip&&--skip)
//
//Live expressions:
// emitterStack()
//
// matchMode(typeof match !== 'undefined'?match:result)
//
// textLeft(typeof index==='number'?index:this.lastIndex, typeof codeToHighlight!='undefined'?codeToHighlight:s)
//
// matchNext(top !== window.top && typeof top.matcher !== undefined ? top.matcher : this)

window.step = 0;
window.skip = 0;
window.breakAtNodeId = 0;

window.jaiDebug = {
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
};
