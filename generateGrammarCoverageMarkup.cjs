const fs = require('fs');
const path = require('path');
const hljs = require('highlight.js');

const hljsDefineJai = require('./src/languages/jai');

hljs.registerLanguage('jai', hljsDefineJai);

const fixtures = [
	{
		source: path.join('test', 'grammarCoverage', 'grammar-coverage.jai'),
		markup: path.join('test', 'markup', 'GrammarCoverage.txt')
	},
	{
		source: path.join('test', 'grammarCoverage', 'modules', 'Grammar_Coverage_Module', 'module.jai'),
		markup: path.join('test', 'markup', 'GrammarCoverageModule.txt')
	}
];

for (const fixture of fixtures) {
	const code = fs.readFileSync(fixture.source, 'utf-8');
	const expected = hljs.highlight(code, { language: 'jai' }).value;

	fs.writeFileSync(fixture.markup, code);
	fs.writeFileSync(fixture.markup.replace(/\.txt$/, '.expect.txt'), `${expected}\n`);
}
