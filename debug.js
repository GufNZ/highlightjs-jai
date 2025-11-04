function emitterStack() {
	return $emitter.stack.map((s, i) => typeof (s) === 'string' ? `${i}"${s}"` : `${i}!${s._id}:${s.scope ?? s.$name ?? '???'}[${s.children?.length ?? '-'}]`
	//{${s.children.map((c, j) => typeof (c) === 'string' ? `${j}"${c}"` : `${j}/${c._id}:${c.scope ?? c.$name ?? '??'}[${c.children?.length ?? '-'}]`)}}`
	).toReversed();
}
function matchMode($m) {
	return $m.map((e, i) => ({ e, i })).filter(e => e.e !== undefined).map(e => `${e.i}:[${e.e}]`).concat([$m.type, (typeof ($r = $m.rule) != 'undefined' ? $r.scope ?? (($b = $r.beginScope) && JSON.stringify($b)) ?? $r.$name ?? $r.beginRe : `${($s = $emitter.stack.slice(-1)[0])._id}<${$s.scope}>`)]);
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
function walk(obj, matches, proc, path = '$', key = "", parent = null, grandParent = null) {
	if (path === '$') {
		seen.clear();
		matches = matches.map(m => {
			const r = new RegExp(
				m.replace(/\[/g, '\\[')
					.replace(/\]/g, '\\]')
					.replace(/\./g, '\\.')
					.replace(/\$/g, '\\$')
					.replace(/:/g, '')
					.replace(/(.+)\?/g, '(?<=$1)[^\[$]+')
					.replace(/^\^/, '(?<!:)')
					.replace(/\*/g, '[^.$]+')
					+ '$'
			);
			r.matchValue = m.endsWith(':');
			return r;
		});
	}

	matches.forEach(m => {
		const match = m.exec(path);
		if (match) {
			proc(m.matchValue ? obj : match[0], parent, parent[key], key, path, grandParent);
		}
	});

	//console.log('walk', path, '\x1b[K\x1b[A');
	if (Array.isArray(obj)) {
		if (seen.has(obj)) {
			//console.log('already seen []', path);
			return;
		}


		seen.add(obj);
		for (let i = 0; i < obj.length; i++) {
			walk(obj[i], matches, proc, `${path}[${i}]`, key, obj, parent);
		}
	} else if (obj && typeof obj === 'object') {
		if (seen.has(obj)) {
			//console.log('already seen {}', path);
			return;
		}


		seen.add(obj);
		const keys = Object.keys(obj);
		for (let key of keys) {
			walk(obj[key], matches, proc, `${path}.${key}`, key, obj, parent);
		}
	}
}

function regexDebugPre(lang) {
	const defn = lang(hljs);
	walk(defn, ['^begin', 'begin.?', '^end', 'end.?', '$pattern'], (match, parent, value, key, path, grandParent) => {
		if (Array.isArray(value)) {
			return;
		}


		let re = value;
		if (typeof(re) !== 'string') {
			re = re.source;
		}

		if (re === undefined) {
			console.error('undefined regex at', path, value);
			debugger;
		}

		const parentKey = Object.keys(grandParent).find(k => grandParent[k] === parent);
		let name = parent.$name
			?? (
				(key === "$pattern")
					? grandParent.$name ?? grandParent.scope
					: null
			)?? (
				isFinite(Number(key))
					? grandParent[parentKey.replace("Scope", "")][+key]
					: parent.$name ?? parent.scope
			) ?? path.slice(2);

		if (key === 'end' || parentKey === 'endScope') {
			name = 'end:' + name;
		}

		re = `(?!\n'${name}')` + re;

		parent[key] = re
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

hljs.debugMode();
hljs.unregisterLanguage('jai');
hljs.registerLanguage('jai', regexDebugPre(jai));
console.log('starting...');
console.time('hilight');
hljs.highlightElement(document.getElementById('it').firstChild);
console.timeEnd('hilight');
setTimeout(() => [...document.getElementsByTagName('span')].forEach(span => {
	span.setAttribute('title', span.getAttribute('class'));
	span.onmouseenter = hilightPath(true);
	span.onmousemove = hilightPath(false);
	span.onmouseleave = clearHilight;
}), 1000);

//Breakpoints: processLexeme(bef; [const match = this.matcherRe.exec(s);]+1.
//Live expressions:
//emitterStack()
//
//matchMode(typeof match !== 'undefined'?match:result)
//
//textLeft(typeof index!=='undefined'?index:this.lastIndex, typeof codeToHighlight!='undefined'?codeToHighlight:s)
//
//matchNext(top !== window.top && typeof top.matcher !== undefined ? top.matcher : this)
