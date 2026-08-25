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
		const activeScopes = [];
		let bodyBraceScopes;
		let passedFinalReturnDefault = false;
		const htmlTokens = /<span class="([^"]+)">|<\/span>|([^<]+)/g;
		let token;

		while ((token = htmlTokens.exec(result.value))) {
			if (token[1]) {
				activeScopes.push(token[1]);
			} else if (token[0] === '</span>') {
				activeScopes.pop();
			} else if (token[2]?.includes('false')) {
				passedFinalReturnDefault = true;
			} else if (passedFinalReturnDefault && token[2]?.includes('{') && activeScopes.at(-1)?.includes('brace_')) {
				bodyBraceScopes = [...activeScopes];
				break;
			}
		}

		bodyBraceScopes.should.be.Array();
		bodyBraceScopes.should.not.matchAny(scope => /\b(?:returns?_)\b/.test(scope));
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

	it('should highlight directive modifiers, varargs, and insert directives', () => {
		const code = `Files :: #import,file "files.jai";
			Subdir :: #import, /* comment */ dir "folder";
			library :: #library,no_dll, /* comment */ link_always "library";
			consume :: (first: int, args: .. Any, loc := #caller_location) {
				for 0..3 {}
				#insert #run generate();
			}
			#insert #run generate();`;
		const result = hljs.highlight(code, { language: 'jai' });
		const insertDirectiveCount = result.value.split('hljs-meta directive_ insert__').length - 1;

		result.value.should.match(/hljs-meta directive_ modifier__">file/);
		result.value.should.match(/hljs-meta directive_ modifier__">dir/);
		result.value.should.match(/hljs-meta directive_ modifier__">no_dll/);
		result.value.should.match(/hljs-meta directive_ modifier__">link_always/);
		result.value.should.match(/hljs-operator varargs_">\.\./);
		result.value.should.match(/hljs-operator range_">\.\./);
		insertDirectiveCount.should.equal(4);
	});

	it('should highlight every primitive in parameter, property, and return slots', function () {
		this.timeout(20000);
		const primitives = [
			'u8', 'u16', 'u32', 'u64',
			's8', 's16', 's32', 's64',
			'int', 'float', 'float32', 'float64', 'f32', 'f64',
			'bool', 'string', 'void'
		];
		const fields = primitives.map((type, index) => `field_${index}: ${type};`).join('\n');
		const params = primitives.map((type, index) => `param_${index}: ${type}`).join(', ');
		const returns = primitives.map((type, index) => `return_${index}: ${type}`).join(', ');
		const code = `Primitive_Record :: struct {\n${fields}\n}\nprimitive_proc :: (${params}) -> (${returns}) {}`;
		const result = hljs.highlight(code, { language: 'jai' });

		(result.value.split('hljs-type property_').length - 1).should.equal(primitives.length);
		(result.value.split('hljs-type params_">').length - 1).should.equal(primitives.length);
		(result.value.split('hljs-type params_ return__').length - 1).should.equal(primitives.length);
		primitives.forEach(type => result.value.should.match(new RegExp(`>${type}<`)));
	});

	it('should highlight type variants, context arguments, and module arguments', () => {
		const code = `Distinct :: #type,distinct u32;
			Alias :: #type,isa Distinct;
			Module :: #import "Module"()(COUNT = 4, ENABLED = true);
			main :: () { init(*value, 42,, temp); }`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.value.should.match(/hljs-meta directive_ modifier__">distinct/);
		result.value.should.match(/hljs-meta directive_ modifier__">isa/);
		result.value.should.match(/hljs-params moduleOrProgram_/);
		result.value.should.match(/hljs-punctuation commaComma_">,,/);
	});

	it('should highlight here-strings and every cast form', () => {
		const code = `message :: #string DONE
			Hello from Jai.
			DONE
			main :: () {
				a := xx value;
				b := cast,no_check(*u8) value;
				c := cast(*u8, value, no_check);
				d := value.(*u8, no_check);
				e := xx(value, no_check);
				f := cast(Pair(u8, u16)) value;
			}`;
		const result = hljs.highlight(code, { language: 'jai' });
		const v2CastCount = result.value.split('hljs-keyword cast_ v2__').length - 1;

		result.value.should.match(/hljs-string here_/);
		result.value.should.match(/hljs-meta stringTerminator_">DONE/);
		result.value.should.match(/hljs-keyword cast_ v1__ auto___/);
		result.value.should.match(/hljs-keyword cast_ v1__/);
		v2CastCount.should.equal(2);
		result.value.should.match(/hljs-operator cast_ v3__/);
	});

	it('should highlight deeply nested procedure and polymorphic type signatures', () => {
		const code = `deep :: (
			callback: (input: Wrapper(Map(string, Array(Array(int))))) -> (Nested(Result(float64))),
			fallback: (value: Array(Array(Array(u32)))) -> Array(Array(string))
		) -> (handler: (item: Wrapper(Array(int))) -> Result(string), ok: bool) {}`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		result.value.should.match(/hljs-title function_ declaration__">deep/);
		result.value.should.match(/hljs-type function_ params__/);
		result.value.should.match(/hljs-type params_ return__/);
		(result.value.split('hljs-_BalancedParens').length - 1).should.be.above(10);
	});

	it('should exercise the compiler-valid grammar coverage fixtures', async function () {
		this.timeout(20000);
		const fixturePaths = [
			path.join(__dirname, 'grammarCoverage', 'grammar-coverage.jai'),
			path.join(__dirname, 'grammarCoverage', 'modules', 'Grammar_Coverage_Module', 'module.jai')
		];
		const sources = await Promise.all(fixturePaths.map(filePath => readFile(filePath, 'utf-8')));
		const results = sources.map(code => hljs.highlight(code, { language: 'jai' }));
		const emittedClasses = new Set(results.flatMap(result =>
			Array.from(result.value.matchAll(/class="([^"]+)"/g), match => match[1].split(' ')).flat()
		));
		const expectedClasses = [
			'shebang__', 'block_', 'todo_', 'reminder_',
			'binary_', 'hex_', 'hexFloat_', 'float_', 'exponent__', 'integer_',
			'here_', 'stringTerminator_', 'char_', 'escape_',
			'arrayOf_', 'dynamicArray_', 'pointerTo_', 'unsigned__', 'signed__', 'bool_', 'void_', 'any_',
			'struct_', 'union_', 'anonymous__', 'binding__', 'tag__', 'enum_', 'flags___',
			'quickLambda_', 'rotate_', 'shift_', 'modifier__', 'varargs_', 'commaComma_',
			'uninitialised_', 'dereference_', 'range_', 'backtick_',
			'v1__', 'v2__', 'v3__',
			'import__', 'load__', 'modify__', 'insert__', 'foreignOrLibrary__', 'module_parameters__',
			'forExpansion__', 'forExpansionInvoke_', 'forModifier_',
			'asm__', 'statement__', 'mnemonic__', 'clue___',
			'moduleOrProgram_', 'returns_', 'return__', 'proc_',
			'workspace_', 'fileName__', 'addBuildString_'
		];

		results.forEach(result => result.illegal.should.equal(false));
		expectedClasses.forEach(className =>
			emittedClasses.has(className).should.equal(true, `Missing fixture scope class: ${className}`)
		);
	});
});
