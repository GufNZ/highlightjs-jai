require('should');

const promisify = require('util').promisify;
const path = require('path');
const hljs = require('highlight.js');
const fs = require('fs');

const hljsDefineJai = require('../src/languages/jai');

hljs.registerLanguage('jai', hljsDefineJai);

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

describe('Jai syntax highlighting', () => {
	async function itShouldPerformSyntaxHighlighting() {
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
				const result = hljs.highlight(code, { language: 'jai' });
				const actual = result.value;
				actual.trim().should.eql(expected.trim(), file);
			});
		})
	}

	itShouldPerformSyntaxHighlighting();

	it('should detect jai language', async () => {
		var code = await readFile(path.join(__dirname, 'detect', 'default.txt'), 'utf-8');
		var actual = hljs.highlightAuto(code).language;
		actual.should.eql('jai');
	});
	it('should not over-detect jai language', async () => {
		var code = '<response value="ok" xml:lang="en"></response>';
		var actual = hljs.highlightAuto(code).language;
		actual.should.not.eql('jai');
	});

	it('should close returns lists before a proc body brace', () => {
		const code = 'setup_xr :: () -> app: Xr_App = .{}, success := false {\n    // ...\n}';
		const result = hljs.highlight(code, { language: 'jai' });
		result.value.should.match(/false<\/span><\/span>\s*<span class="hljs-punctuation brace_">\{/);
	});

	it('should highlight recursively nested anonymous structs', () => {
		const code = `Machine_Options_X86 :: struct {
			features: struct {
				leaves: [Leaf.NUMBER] u32;
				nested: struct { a: struct { b: struct { c: struct { d: struct { value: int; } } } } }
			}
		}`;
		const result = hljs.highlight(code, { language: 'jai' });
		const anonymousStructCount = result.value.split('hljs-type record_ anonymous__').length - 1;

		anonymousStructCount.should.equal(6);
		result.value.should.match(/hljs-property declaration_">features/);
		result.value.should.match(/hljs-property declaration_">leaves/);
		result.value.should.match(/hljs-type arrayOf_/);
		result.value.should.match(/hljs-property constant_">\.NUMBER/);
		result.value.should.match(/hljs-type integer_ unsigned__">u32/);
		result.value.should.match(/hljs-property declaration_">value/);
	});

	it('should highlight named, anonymous, polymorphic, and tagged unions', () => {
		const code = `Plain :: union { x: int; }
			Holder :: struct {
				using value: union kind: Value_Kind {
					.SCALAR ,, scalar: float64;
					nested: struct { code: int; }
				}
			}
			Value :: union /* note */ #align 8 kind: Value_Kind { scalar: float64; }
			Thing :: union fruit: Fruit {
				.APPLE ,, x: int;
				.BANANA ,, y: float;
				.ORANGE ,, z := "value";
			}
			SymbolBuffer :: union(name_length: u32 = 0) { data: [name_length] u8; }`;
		const result = hljs.highlight(code, { language: 'jai' });
		const namedUnionCount = result.value.split('hljs-type union_ declaration__').length - 1;
		const taggedBindingCount = result.value.split('hljs-meta union_ binding__').length - 1;

		namedUnionCount.should.equal(4);
		taggedBindingCount.should.equal(4);
		result.value.should.match(/hljs-type record_ anonymous__/);
		result.value.should.match(/hljs-keyword meta_">using/);
		result.value.should.match(/hljs-property tag_ declaration__">kind/);
		result.value.should.match(/hljs-property constant_ enum__">ORANGE/);
		result.value.should.match(/hljs-property declaration_">z/);
		result.value.should.match(/hljs-params declaration_">name_length/);
	});
});
