//alert(1);debugger;alert(2);

function emitterStack() {
	return $emitter.stack.map((s, i) => typeof (s) === 'string' ? `${i}"${s}"` : `${i}!${s._id}:${s.scope ?? s.$name ?? '???'}[${s.children?.length ?? '-'}]{${s.children.map((c, j) => typeof (c) === 'string' ? `${j}"${c}"` : `${j}/${c._id}:${c.scope ?? c.$name ?? '??'}[${c.children?.length ?? '-'}]`)}}`).toReversed();
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

hljs.debugMode();
console.log('starting...');
console.time('hilight');
hljs.highlightElement(document.getElementById('it').firstChild);
console.timeEnd('hilight');
//Breakpoints: processLexeme(bef; [const match = this.matcherRe.exec(s);]+1.
//Live expressions:
//emitterStack()
//
//matchMode(typeof match !== 'undefined'?match:result)
//
//textLeft(typeof index!=='undefined'?index:this.lastIndex, typeof codeToHighlight!='undefined'?codeToHighlight:s)
//
//matchNext(top !== window.top && typeof top.matcher !== undefined ? top.matcher : this)
