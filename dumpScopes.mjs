/// node dumpScopes.mjs | sort -u >langScopes

import jai from './src/languages/jai/jai.js';
/*
import hljs from 'highlight.js';
/*/
import hljs from './localHilightDebug.js';
/**/
hljs.registerLanguage('jai', jai);

const seen = new Set();
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

function walk(obj, matches, path = '$') {
	if (path === '$') {
		seen.clear();
		matches = matches.map(m => {
			const r = new RegExp(m.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\./g, '\\.').replace(/:/g, '').replace(/(.+)\?/g, '(?<=$1)[^\[$]+').replace(/\*/g, '[^.$]+') + '$');
			r.matchValue = m.endsWith(':');
			return r;
		});
	}

	matches.forEach(m => {
		const match = m.exec(path);
		if (match) {
			console.log(m.matchValue ? obj : match[0]);
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
			walk(obj[i], matches, `${path}[${i}]`);
		}
	} else if (obj && typeof obj === 'object') {
		if (seen.has(obj)) {
			//console.log('already seen {}', path);
			return;
		}
		seen.add(obj);
		const keys = Object.keys(obj);
		for (let key of keys) {
			walk(obj[key], matches, `${path}.${key}`);
		}
	}
}

const jaiDef = jai(hljs);
walk(jaiDef, ['keywords.?', 'scope:', 'beginScope.*:', `endScope[*]:`]);
