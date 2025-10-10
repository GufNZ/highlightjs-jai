require('should');

const promisify = require('util').promisify;
const path = require('path');
const hljs = require('highlightjs');
const fs = require('fs');

const hljsDefineJai = require('../src/jai');

hljs.registerLanguage('jai', hljsDefineJai);

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

describe('Jai syntax highlighting', () =>
{
	async function itShouldPerformSyntaxHighlighting()
	{
		const files = (await readdir(path.join(__dirname, 'markup')))
			.filter(f => !f.includes('.expect.'));
		const scenarios = files.map(f => f.replace(/\.txt$/, ''));
		scenarios.forEach(scenario => {
			it(`should perform syntax highlighting on ${scenario}`, async () => {
				const file = `${scenario}.txt`;
				const filePath = path.join(__dirname, 'markup', file);
				const expectFilePath = filePath.replace('.txt', '.expect.txt');
				const code = await readFile(filePath, 'utf-8');
				const expected = await readFile(expectFilePath, 'utf-8');
				const result = hljs.highlight('jai', code);
				const actual = result.value;
				actual.trim().should.eql(expected.trim(), file);
			});
		})
	}

	itShouldPerformSyntaxHighlighting();

	it('should detect jai language', async () =>
	{
		var code = await readFile(path.join(__dirname, 'detect', 'default.txt'), 'utf-8');
		var actual = hljs.highlightAuto(code).language;
		actual.should.eql('jai');
	});
});
