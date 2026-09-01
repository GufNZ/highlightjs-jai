require('should');

const promisify = require('util').promisify;
const path = require('path');
const autodetectHljs = require('highlight.js');
const hljs = autodetectHljs.newInstance();
const fs = require('fs');

const hljsDefineJai = require('../src/languages/jai');

hljs.registerLanguage('jai', hljsDefineJai);
autodetectHljs.registerLanguage('jai', hljsDefineJai);

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

describe('Jai syntax highlighting', () => {
	before(function () {
		this.timeout(20000);
		hljs.highlight('', { language: 'jai' });
	});

	async function itShouldPerformSyntaxHighlighting() {
		const files = (await readdir(path.join(__dirname, 'markup')))
			.filter(f => !f.includes('.expect.'));
		const scenarios = files.map(f => f.replace(/\.txt$/, ''));
		scenarios.forEach(scenario => {
			it(`should perform syntax highlighting on ${scenario}`, async function () {
				this.timeout(20000);
				const file = `${scenario}.txt`;
				const filePath = path.join(__dirname, 'markup', file);
				const expectFilePath = filePath.replace('.txt', '.expect.txt');
				const code = await readFile(filePath, 'utf-8');
				const expected = await readFile(expectFilePath, 'utf-8');
				const markupHljs = autodetectHljs.newInstance();
				markupHljs.registerLanguage('jai', hljsDefineJai);
				const result = markupHljs.highlight(code, { language: 'jai' });
				const actual = result.value;
				actual.trim().should.eql(expected.trim(), file);
			});
		})
	}

	itShouldPerformSyntaxHighlighting();

	it('should detect jai language', async function () {
		this.timeout(20000);
		var code = await readFile(path.join(__dirname, 'detect', 'default.txt'), 'utf-8');
		var actual = autodetectHljs.highlightAuto(code).language;
		actual.should.eql('jai');
	});
	it('should not over-detect jai language', async () => {
		var code = `<responses xml:lang="en">
			${Array.from({ length: 20 }, (_, index) => `<response id="${index}" value="ok">Request completed successfully.</response>`).join('\n\t\t\t')}
		</responses>`;
		var actual = autodetectHljs.highlightAuto(code).language;
		actual.should.not.eql('jai');
	});

	it('should highlight #if conditions consistently inside records', () => {
		const code = `#if OS == .LINUX {
			global_value := 1;
		}
		Example :: struct {
			#if OS == .LINUX {
				field: int;
			}
		}`;
		const result = hljs.highlight(code, { language: 'jai' });
		const directiveMarkup = '<span class="hljs-operator hash_ directive__">#</span><span class="hljs-meta directive_">if</span>';

		result.illegal.should.equal(false);
		(result.value.split(directiveMarkup).length - 1).should.equal(2);
		result.value.should.match(/hljs-property declaration_">field<\/span><span class="hljs-operator define_">:<\/span> <span class="hljs-type property_">/);
	});

	it('should close structs containing braceless #if fields', () => {
		const code = `Thread :: struct {
			#if LOAD_THREAD_GROUP worker_info: *Thread_Group.Worker_Info;
			#if _STACK_TRACE stack_trace_sentinel: Stack_Trace_Node;
			using specific: Thread_Os_Specific;
		}
		after: int;`;
		const result = hljs.highlight(code, { language: 'jai' });
		const activeScopes = [];
		let scopesAtAfter;

		for (const token of result.value.matchAll(/<span class="([^"]+)">|<\/span>|([^<]+)/g)) {
			if (token[1]) {
				activeScopes.push(token[1]);
			} else if (token[0] === '</span>') {
				activeScopes.pop();
			} else if (token[2]?.includes('after')) {
				scopesAtAfter = [...activeScopes];
			}
		}

		result.illegal.should.equal(false);
		scopesAtAfter.should.not.containEql('hljs-type struct_ declaration__');
	});

	it('should highlight #load directives in braceless #if branches', () => {
		const code = `#if !USE_RAW
			#load "rpmalloc.jai";
		else
			#load "rpmalloc.raw.jai";`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		(result.value.split('hljs-meta directive_ load__').length - 1).should.equal(2);
		result.value.should.not.match(/stdLib_[^>]*>load<\/span>/);
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

	it('should contain bake prefixes inside parameter spans', () => {
		const code = `Holder :: struct ($T: Type, $N: s64) {
			array: [N] T;
		}
		hello2 :: (p: *[..] *Holder) {
			print("p.* is %\\n", p.*);
		}
		bake_probe :: ($T: Type, $$N: s64, value: $T) {
		}`;
		const result = hljs.highlight(code, { language: 'jai' });
		const parameterListStart = '<span class="hljs-_BalancedParens"><span class="hljs-punctuation paren_">(</span><span class="hljs-params">';

		(result.value.split(parameterListStart).length - 1).should.equal(3);
		result.value.should.match(/hljs-params"><span class="hljs-operator bake_">\$<\/span><span class="hljs-params declaration_">T/);
		result.value.should.match(/hljs-params"><span class="hljs-operator bake_">\$<\/span><span class="hljs-params declaration_">N/);
		result.value.should.match(/hljs-params"><span class="hljs-operator autobake_">\$\$<\/span><span class="hljs-params declaration_">N/);
		result.value.should.match(/hljs-params declaration_">value<\/span><span class="hljs-operator define_">:<\/span> <span class="hljs-operator bake_">\$<\/span>/);
		result.value.should.not.match(/<\/span>\$<span class="hljs-params">/);
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
		const taggedBindingCount = result.value.split('class="hljs-meta union_ binding__"').length - 1;

		namedUnionCount.should.equal(4);
		taggedBindingCount.should.equal(4);
		result.value.should.match(/hljs-type record_ anonymous__/);
		result.value.should.match(/hljs-keyword meta_">using/);
		result.value.should.match(/hljs-property tag_ declaration__">kind/);
		result.value.should.match(/hljs-meta union_ binding__ tag___"><span class="hljs-operator dot_">\.<\/span><span class="hljs-property constant_ enum__">ORANGE/);
		result.value.should.match(/hljs-punctuation commaComma_">,,/);
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

	it('should terminate expression inserts without breaking insert bodies', () => {
		const code = `if _cur_count > #insert peak {
			(#insert peak) = _cur_count;
		}
		#insert "generated();";
		#insert body;
		#insert #run generate();
		#insert #run () -> string { return "generated();"; }();
		#insert -> Code { return #code generated(); }`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		result.value.should.match(/>peak<\/span><\/span> <span class="hljs-punctuation brace_">\{<\/span>/);
		result.value.should.match(/>peak<\/span><\/span><span class="hljs-punctuation paren_">\)<\/span>/);
		(result.value.split('hljs-_BalancedBraces').length - 1).should.equal(2);
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
				auto_unchecked := xx,no_check value;
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
		result.value.should.match(/hljs-keyword cast_ v1__ auto___"><span class="hljs-keyword cast_">xx<\/span><span class="hljs-punctuation comma_">,<\/span><span class="hljs-meta directive_ modifier__">no_check<\/span>/);
		result.value.should.match(/hljs-keyword cast_ v1__/);
		v2CastCount.should.equal(2);
		result.value.should.match(/hljs-operator cast_ v3__/);
	});

	it('should highlight number prefixes case-insensitively', () => {
		const result = hljs.highlight('lower := 0b10 + 0xCAFE + 0h3f80; upper := 0B10 + 0XCAFE + 0H3f80;', { language: 'jai' });

		result.illegal.should.equal(false);
		['0b', '0B'].forEach(prefix => result.value.should.match(new RegExp(`hljs-number binary_ prefix__">${prefix}`)));
		['0x', '0X'].forEach(prefix => result.value.should.match(new RegExp(`hljs-number hex_ prefix__">${prefix}`)));
		['0h', '0H'].forEach(prefix => result.value.should.match(new RegExp(`hljs-number hexFloat_ prefix__">${prefix}`)));
	});

	it('should highlight deeply nested procedure and polymorphic type signatures', () => {
		const code = `deep :: (
			callback: (input: Wrapper(Map(string, Array(Array(int))))) -> (Nested(Result(float64))),
			fallback: (value: Array(Array(Array(u32)))) -> Array(Array(string))
		) -> (handler: (item: Wrapper(Array(int))) -> Result(string), ok: bool) {}
		ancestor_poly :: (direct: $T/Blentity, nested: *[..] *[3] $U/Blentity) {}`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		result.value.should.match(/hljs-title function_ declaration__">deep/);
		result.value.should.match(/hljs-type function_ params__/);
		result.value.should.match(/hljs-type params_ return__/);
		result.value.should.match(/hljs-type params_"><span class="hljs-operator bake_">\$<\/span><span class="hljs-type baked_">T<\/span><span class="hljs-operator math_">\/<\/span>Blentity/);
		result.value.should.match(/hljs-type baked_">U<\/span><span class="hljs-operator math_">\/<\/span>Blentity<\/span>/);
		(result.value.split('hljs-_BalancedParens').length - 1).should.be.above(10);
	});

	it('should highlight unnamed pointer parameters and empty returns in procedure types', () => {
		const code = `Popup_Info :: struct {
			callback: (*void) -> ();
		}
		add_popup :: (callback: (*void) -> (), data: *void) {}`;
		const result = hljs.highlight(code, { language: 'jai' });
		const signatureMarkup = '<span class="hljs-_BalancedParens"><span class="hljs-punctuation paren_">(</span><span class="hljs-type"><span class="hljs-operator pointerTo_">*</span><span class="hljs-type void_">void</span></span><span class="hljs-punctuation paren_">)</span></span> <span class="hljs-operator returns_">-&gt;</span> <span class="hljs-params returns_"><span class="hljs-_BalancedParens"><span class="hljs-punctuation paren_">(</span><span class="hljs-punctuation paren_">)</span></span></span>';

		result.illegal.should.equal(false);
		(result.value.split(signatureMarkup).length - 1).should.equal(2);
		result.value.should.match(/hljs-type function_ params__">[\s\S]*?<\/span><span class="hljs-punctuation comma_">,<\/span> <span class="hljs-params"><span class="hljs-params declaration_">data/);
	});

	it('should distinguish procedure-type defaults from parameter defaults', () => {
		const code = `draw_text: (x: float = 0, y: float, str: string, color: Vector4) = dummy_draw_text;
		text_width: (s: string) -> float = dummy_text_width;
		LARGE_SIZE_LIMIT :: (A * B) - C;`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		(result.value.split('hljs-type function_ declaration__').length - 1).should.equal(2);
		result.value.should.match(/hljs-type params_"><span class="hljs-type float_">float<\/span> <span class="hljs-operator assign_">=<\/span><span class="hljs-params default_"> <span class="hljs-number integer_">0/);
		result.value.should.match(/hljs-params returns_"><span class="hljs-params return_">[\s\S]*?hljs-type float_">float<\/span><\/span><\/span><\/span> <span class="hljs-operator assign_">=<\/span> <span class="hljs-variable">dummy_text_width/);
		result.value.should.not.match(/hljs-title function_ declaration__">LARGE_SIZE_LIMIT/);
	});

	it('should not treat typed constant values as implicit procedure types', () => {
		const groupedValue = hljs.highlight('MASK0: u8 : (0b1111 << 4);', { language: 'jai' });
		const declarationShapedValue = hljs.highlight('MASK1: u8 : (value: int);', { language: 'jai' });
		const explicitProcType = hljs.highlight('Explicit_Proc_Type: Type : #type (value: int) -> int;', { language: 'jai' });

		groupedValue.value.should.not.match(/hljs-type function_ declaration__/);
		groupedValue.value.should.match(/hljs-number binary_/);
		groupedValue.value.should.match(/hljs-operator shift_/);
		declarationShapedValue.value.should.not.match(/hljs-type function_ declaration__/);
		explicitProcType.value.should.match(/hljs-type function_ declaration__/);
	});

	it('should not treat parenthesized expressions as procedure declarations', () => {
		const code = `check :: (left: s64, right: s64, oldsize: s64) {
			if (left >= right) && (right >= (oldsize / 2)) {}
			if left <= (oldsize / 2) {}
			if left == (oldsize / 2) {}
			if left != (oldsize / 2) {}
			callback := (value: s64) -> s64 { return value; };
			empty = () {};
		}
		LARGE_SIZE_LIMIT :: (LARGE_CLASS_COUNT * MEMORY_SPAN_SIZE) - SPAN_HEADER_SIZE;`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		(result.value.split('hljs-type function_ declaration__').length - 1).should.equal(3);
		result.value.should.not.match(/hljs-operator comparison_">(?:&gt;=|&lt;=|==|!=)<\/span>\s*<span class="hljs-type function_ declaration__"/);
		result.value.should.match(/hljs-variable constant_ declaration__">LARGE_SIZE_LIMIT/);
		result.value.should.not.match(/hljs-title function_ declaration__">LARGE_SIZE_LIMIT/);
		const d3dConstant = hljs.highlight('_FACD3D11DEBUG :: ( _FACD3D11 + 1 );', { language: 'jai' });
		d3dConstant.value.should.match(/hljs-variable stdLib_ d3d11__ constant___">_FACD3D11DEBUG/);
		d3dConstant.value.should.not.match(/hljs-built_in stdLib_ d3d11__">_FACD3D11DEBUG/);
		['>=', '<=', '==', '!=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='].forEach(operator => {
			const operatorResult = hljs.highlight(`target ${operator} (value: s64) {}`, { language: 'jai' });
			operatorResult.value.should.not.match(/hljs-type function_ declaration__/);
		});
	});

	it('should not treat code after a trailing comment colon as a type', () => {
		const code = `// File path functions:
		assert(path_filename("/foo/bar/filename.ext") == "filename.ext");
		assert(path_filename("/foo/bar/file.name.ext") == "file.name.ext");`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		(result.value.split('hljs-string').length - 1).should.equal(4);
		(result.value.split('hljs-built_in stdLib_ Basic__">assert').length - 1).should.equal(2);
		(result.value.split('hljs-built_in stdLib_ String__">path_filename').length - 1).should.equal(2);
		result.value.should.not.match(/hljs-type"><span class="hljs-built_in stdLib_ Basic__">assert/);
		result.value.should.not.match(/hljs-variable"><span class="hljs-built_in stdLib_ Basic__">assert/);
	});

	it('should close return scopes before trailing directives', () => {
		const code = `c_malloc  :: (size: u64) -> *void                #foreign crt "malloc";
		c_free    :: (memory: *void)                     #foreign crt "free";
		c_realloc :: (memory: *void, size: u64) -> *void #foreign crt "realloc";`;
		const result = hljs.highlight(code, { language: 'jai' });

		result.illegal.should.equal(false);
		(result.value.split('hljs-params returns_').length - 1).should.equal(2);
		result.value.should.match(/hljs-operator returns_">-&gt;<\/span> <span class="hljs-params returns_"><span class="hljs-operator pointerTo_">\*<\/span><span class="hljs-params return_"><span class="hljs-params return_ declaration__"><span class="hljs-type void_">void<\/span><\/span><\/span><\/span>\s+<span class="hljs-meta directive_ foreignOrLibrary__"/);
		const activeScopes = [];
		let foreignDirectiveCount = 0;
		for (const match of result.value.matchAll(/<span class="([^"]+)">|<\/span>/g)) {
			if (match[1]) {
				if (match[1] === 'hljs-meta directive_ foreignOrLibrary__') {
					activeScopes.should.not.containEql('hljs-params returns_');
					activeScopes.should.not.containEql('hljs-params return_');
					foreignDirectiveCount += 1;
				}
				activeScopes.push(match[1]);
			} else {
				activeScopes.pop();
			}
		}
		foreignDirectiveCount.should.equal(6);
	});

	it('should exercise the compiler-valid grammar coverage fixtures', async function () {
		this.timeout(20000);
		const fixturePaths = [
			path.join(__dirname, 'grammarCoverage', 'grammar-coverage.jai'),
			path.join(__dirname, 'grammarCoverage', 'modules', 'Grammar_Coverage_Module', 'module.jai')
		];
		const markupPaths = [
			path.join(__dirname, 'markup', 'GrammarCoverage.txt'),
			path.join(__dirname, 'markup', 'GrammarCoverageModule.txt')
		];
		const sources = await Promise.all(fixturePaths.map(filePath => readFile(filePath, 'utf-8')));
		const markupSources = await Promise.all(markupPaths.map(filePath => readFile(filePath, 'utf-8')));
		const results = sources.map(code => hljs.highlight(code, { language: 'jai' }));
		const coverageSourceLines = sources[0].split(/\r?\n/);
		const coverageMarkupLines = results[0].value.split(/\r?\n/);
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

		markupSources.should.eql(sources, 'Run npm run generateGrammarCoverageMarkup to refresh markup copies');
		coverageSourceLines.forEach((line, index) => {
			if (/^proc_value_/.test(line)) {
				coverageMarkupLines[index].should.match(/hljs-type function_ declaration__/);
			}
			if (/^proc_(?:params|returns)_/.test(line)) {
				coverageMarkupLines[index].should.match(/hljs-title function_ declaration__/);
				coverageMarkupLines[index].should.match(/hljs-type function_ declaration__/);
			}
		});
		const asmAddressLine = coverageSourceLines.findIndex(line => line.includes('mov.64 result, [source + 16]'));
		asmAddressLine.should.be.aboveOrEqual(0);
		coverageMarkupLines[asmAddressLine].should.match(/hljs-variable">source<\/span>[\s\S]*hljs-number integer_">16<\/span>/);
		sources[0].should.match(/for values \{\s*total \+= it \+ it_index;/);
		sources[0].should.match(/for :for_expansion values \{\s*mapped \+= it \+ it_index;/);
		results.forEach(result => result.illegal.should.equal(false));
		expectedClasses.forEach(className =>
			emittedClasses.has(className).should.equal(true, `Missing fixture scope class: ${className}`)
		);
	});
});
