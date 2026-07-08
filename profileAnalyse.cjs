// Usage: node profileAnalyse.cjs [profileFile]  (defaults to newest .cpuprofile in profiles/)
const fs = require('fs');
const path = require('path');

const dir = 'profiles';
const file = process.argv[2] ?? path.join(dir, fs.readdirSync(dir)
	.filter(n => n.endsWith('.cpuprofile'))
	.map(n => ({ n, t: fs.statSync(path.join(dir, n)).mtimeMs }))
	.sort((a, b) => b.t - a.t)[0].n);

const j = JSON.parse(fs.readFileSync(file, 'utf8'));
const nodes = Object.fromEntries(j.nodes.map(n => [n.id, n]));
const wallMs = (j.endTime - j.startTime) / 1000;

// Self time per node.
const self = new Map();
for (let i = 0; i < j.samples.length; i++) {
	const id = j.samples[i], t = j.timeDeltas[i];
	self.set(id, (self.get(id) || 0) + t);
}

// Parent map.
const parent = new Map();
for (const n of j.nodes) for (const c of (n.children || [])) parent.set(c, n.id);

// Total (self + descendants) via propagating self up the parent chain.
const total = new Map(self);
for (const [id, t] of self) {
	let p = parent.get(id);
	while (p !== undefined) { total.set(p, (total.get(p) || 0) + t); p = parent.get(p); }
}

const fmt = n => {
	const f = n.callFrame;
	const fn = f.functionName || '(anonymous)';
	const u = (f.url || '').replace(/^.*[\\/]/, '');
	const loc = u ? `${u}:${(f.lineNumber ?? -1) + 1}` : '(no url)';
	return `${fn} @ ${loc}`;
};

console.log(`File: ${file}`);
console.log(`Wall: ${wallMs.toFixed(1)} ms   Samples: ${j.samples.length}   Nodes: ${j.nodes.length}\n`);

const row = (id, t) =>
	`${(t / 1000).toFixed(2).padStart(8)} ms  ${((t / (wallMs * 1000)) * 100).toFixed(1).padStart(5)}%   ${fmt(nodes[id])}`;

console.log('=== TOP 25 by SELF time ===');
[...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([id, t]) => console.log(row(id, t)));

console.log('\n=== TOP 25 by TOTAL time (self + descendants) ===');
[...total.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([id, t]) => console.log(row(id, t)));

// Grouped totals: which script contributes what SELF time?
const byUrl = new Map();
for (const [id, t] of self) {
	const url = (nodes[id].callFrame.url || '(builtin)').replace(/^.*[\\/]/, '') || '(builtin)';
	byUrl.set(url, (byUrl.get(url) || 0) + t);
}
console.log('\n=== SELF time grouped by file ===');
[...byUrl.entries()].sort((a, b) => b[1] - a[1]).forEach(([u, t]) =>
	console.log(`${(t / 1000).toFixed(2).padStart(8)} ms  ${((t / (wallMs * 1000)) * 100).toFixed(1).padStart(5)}%   ${u}`)
);
