# Jai Highlight.js Grammar Audit

Audit target: Jai beta 0.2.030 (2 July 2026), using the installed language distribution in `../jai` and the grammar in `src/languages/jai.js`.

## Executive summary

The grammar has broad and unusually detailed coverage of Jai. It recognizes the core declaration syntax, procedure and procedure-type signatures, polymorphic types and baked arguments, comments, current literals, casts, compiler directives, module parameters, inline assembly, for-expansions, standard-library symbols, and generated-source annotations. Many constructs that initially look like likely omissions are already explicitly handled: `0h` literals, `---`, backtick export, `,,`, `#through`, `#location`, `#modify`, parameterized imports, unary enum tags, and trailing commas.

The largest mismatches found by the audit have now been corrected: structured union parsing covers named, anonymous, polymorphic, tagged, and bound unions; the primitive-type inventory recognizes the current built-in names in structured type slots; and directive modifiers, varargs markers, and dedicated `#insert` handling now receive structural scopes. Anonymous struct and union fields share an unlimited self-recursive record mode, allowing arbitrarily mixed nesting without a fixed depth limit. Newer unprefixed struct literals and uncommon nested forms remain inherent or lightly tested limitations.

Two original, distributable fixtures now exercise the non-standard-library grammar surface: `test/grammarCoverage/grammar-coverage.jai` contains the program syntax and `test/grammarCoverage/modules/Grammar_Coverage_Module/module.jai` contains module-only syntax such as `#module_parameters`. They do not copy source from the Jai distribution. Both are highlighted by an automated invariant, and the pair compiles and links with Jai's normal checks enabled. Matching `.txt` and `.expect.txt` pairs under `test/markup` also follow Highlight.js's documented Testing Markup pattern; run `npm run generateGrammarCoverageMarkup` to refresh them from the compiler-valid originals.

## Reference baseline

The review used:

- `../jai/how_to`, especially numbers, strings, declarations, calls, structs, enums, control flow, polymorphism, type variants, context `,,`, module parameters, metaprogramming, for-expansions, and inline assembly.
- Representative code in `../jai/examples` and examples under `../jai/modules`.
- `../jai/CHANGELOG.txt`, read newest-first as authored. The installed version matches the generated standard-library marker in the grammar: beta 0.2.030.
- The repository's visual corpus under `test/visualTests`, which mirrors much of `how_to` and many module/example files.

Recent syntax relevant to this audit includes tagged unions and bindings (0.2.023-0.2.025), trailing commas in procedure headers (0.2.025), unprefixed inferred struct literals (0.2.022), postfix `.*` replacing deprecated unary `<<` dereference (0.2.022), removal of `#must` and obsolete cast forms (0.2.022), removal of `#place` (0.2.027), and the current `void` semantics (0.2.029).

## Coverage assessment

### Strong coverage

- Nested `//` and `/* ... */` comments, with Jai-oriented doctags and generated-source annotations.
- Decimal, binary, hexadecimal, floating, exponent, and `0h` bit-pattern literals, including separators and unary minus.
- Quoted strings, documented escapes, `#char`, and delimiter-based `#string` here-strings.
- Variables, constants, fields, enum values, declarations, defaults, multiple returns, procedure calls, procedure types, and module-qualified types.
- Pointer, array, resizable-array, polymorphic type, baked type/value, and auto-baked syntax.
- Struct, union, and enum bodies; enum flags; polymorphic records; defaults; constants in records; and `#insert` bodies.
- Named and anonymous unions, optional polymorphic union parameters, tagged-union headers, and `.TAG ,, member` bindings with typed or inferred members.
- Unlimited mixed nesting of anonymous structs and unions using Highlight.js `self` recursion.
- Current casts (`cast`, `xx`, and suffix casts), operators, ranges, shifts/rotates and modifiers, `---`, backticks, and `,,` punctuation.
- `for` modifiers and named for-expansions.
- General directives plus dedicated modes for imports, loads, modifies, inserts, module parameters, foreign/library declarations, and assembly.
- Extensive generated standard-library symbol classification for the same Jai version as the installed compiler.

### Completed corrections

#### Structured unions

The grammar now has dedicated union declaration and type modes alongside the existing struct modes. It recognizes:

- Named untagged unions: `Thing :: union { ... }`.
- Anonymous/member unions, including `using value: union { ... }`.
- Polymorphic unions such as `SymbolBuffer :: union(name_length: u32 = 0) { ... }`.
- Tagged headers such as `Value :: union kind: Value_Kind { ... }`, with comments, notes, and directives allowed before the tag declaration.
- Bound members such as `.APPLE ,, x: int;` and `.ORANGE ,, z := "value";`.
- Arbitrarily nested anonymous structs and unions through a shared `type.record.anonymous` mode using lowercase Highlight.js `self` recursion.

Tagged bindings receive `meta.union.binding`, tag constants receive `property.constant.enum`, and their declarations reuse the existing property/default parser. Parameter modes now also terminate at `}`, preventing anonymous record fields from leaking into an enclosing record.

Current Jai examples: `../jai/CHANGELOG.txt` under beta 0.2.023 and 0.2.025.
Grammar locations: `src/languages/jai.js` around `UNION_DECLARATION`, `ANONYMOUS_RECORD_TYPE`, `TAGGED_UNION_BINDING`, `UNION_TYPE_DECLARATION`, and `_ALL`.

#### Primitive types

The primitive inventory now includes the current Jai built-ins needed in structured type positions, including `float32`, `int`, and `void`. The commonly used ecosystem aliases `f32` and `f64` remain recognized. Parameters, properties, and related type slots no longer reopen these names as declarations.

#### Highlight.js API usage

The markup test runner now uses the current `hljs.highlight(code, { language: 'jai' })` API. The deprecated positional `highlight(language, code, ...)` call has been removed, and a repository scan found no remaining project call sites using it. The compatibility warning text inside the bundled `localHilightDebug.js` implementation is vendor/debug code, not a deprecated invocation.

#### Directive modifiers, varargs, and inserts

Import modifiers such as `#import,file`, `#import,dir`, and `#import,string` now receive `punctuation.comma` and `meta.directive.modifier` scopes. Generic and foreign/library modifier names are identifier-shaped, so underscore-containing forms such as `no_dll`, `no_static_library`, and `link_always` are handled in chained, comment-separated lists. The `..` marker in parameter type slots now receives `operator.varargs` without affecting ordinary `operator.range` expressions. `INSERT_DIRECTIVE` now precedes the generic directive-containing list, so dedicated `meta.directive.insert` parsing wins consistently at top level and inside procedure bodies as it already did in record bodies.

#### Automated invariants and cast precedence

Targeted tests now cover every recognized primitive in parameter, property, and return slots; `#type` variants; context `,,`; module arguments; here-strings; all three cast generations; and deeply nested procedure and polymorphic type signatures. This coverage exposed an ordering bug in which the broad v1 cast modes claimed `xx(...)` and `cast(type, value)` before v2 could match. The v1 modes now defer based on the parenthesized form and top-level argument commas while preserving v1 casts whose type contains nested commas.

#### Compiler-valid coverage fixtures

The original fixture pair covers comments and doctags, generated-source annotations, literals, strings and here-strings, primitive and compound types, records, unions and tagged bindings, enums and flags, polymorphism, procedure types, quick lambdas, control flow, operators, casts, context arguments, custom for-expansions, directives, module parameters, and inline assembly. Disabled `#if false` code carries syntax that must remain parseable but cannot be linked in a self-contained fixture, such as synthetic foreign libraries and file imports.

The corresponding Mocha invariant highlights both files, rejects illegal parses, requires representative emitted classes from every major non-stdlib grammar family, and verifies that the Testing Markup `.txt` copies remain byte-for-byte synchronized. The markup runner compares the complete emitted HTML with the committed `.expect.txt` renderings. Exhaustively naming generated standard-library symbols is intentionally excluded because that inventory has its own generation/versioning path.

This fixture also exposed unreachable rotate highlighting: the earlier shift modes consumed `<<<` and `>>>` in pieces before `operator.rotate` could match. Shift matching now rejects adjacent third brackets and rotate matching precedes comparison operators. Ordinary `<<`, `>>`, `<<,small`, and `>>,logical` remain independently covered.

### Validated current forms

- `#type,distinct` and `#type,isa` correctly scope `#type`, the comma, the modifier, and the following base type.
- Parameterized imports correctly scope the import path and module/program argument list.
- Generic modifier forms including the newly documented `#run,host`, as well as `#run,stallable` and `#insert,scope`, correctly scope the comma and modifier.
- Context `,,`, `0h` literals, `---`, backtick exports, `#through`, and `#location()` all receive explicit scopes.
- Trailing commas in procedure headers are accepted without terminating the procedure-type mode early.
- Decimal scientific notation such as `1.0e10` is recognized. Exponent-only `1e10` is not recognized, correctly: beta 0.2.030 rejects it during parsing.

### Context-sensitive limitation

- Inferred struct literals written as `{...}` are naturally balanced as punctuation/code, but cannot be distinguished reliably from statement blocks by a regex highlighter; field names may therefore look like named arguments or ordinary assignments.
- Static recursive regexes cap special lookahead classification: nested block comments use a finite helper depth in lookaheads, and constant-declaration polymorphic lookaheads support three nested parenthesized levels. Runtime comment parsing itself uses Highlight.js self-recursion.

## Correctness and maintainability risks

- The grammar depends heavily on mode ordering, variable-length lookbehind, generated atomic backreferences, zero-width starts/ends, and manually coordinated `endsParent` behavior. This enables excellent scopes but raises regression risk for malformed or deeply nested input.
- Standard-library names are version-pinned generated data. Coverage is excellent for beta 0.2.030 but will drift with a newer compiler until `generateStdLib.jai` is rerun.
- The automated suite has one full markup snapshot, targeted assertions, and the two compiler-valid grammar coverage fixtures. It includes passing regressions for six-level anonymous struct recursion; named, anonymous, nested, polymorphic, tagged, and bound unions; every primitive in structured type slots; `#type` variants; context and module arguments; here-strings; all cast forms; rotates versus shifts; and deeply nested signatures. The `BucketAllocator` expected HTML has been reviewed and refreshed against the current grammar. The returns-list regression now parses emitted span scopes and verifies that no return scope remains active at the procedure body brace instead of depending on an incidental number of closing tags. The much larger `test/visualTests` corpus remains primarily for manual/browser inspection.
- Some fixed identifier heuristics assume uppercase type names and uppercase constants. Jai style follows that convention, but legal unconventional names can receive generic variable scopes in contexts where structural type parsing does not take over.

## Validation performed

- `npx tsc --noEmit` passes.
- Editor diagnostics report no errors in `src/languages/jai.js` or `test/index.js`.
- Focused anonymous-record and union regressions pass.
- Focused directive-modifier, varargs/range isolation, and top-level/procedure-body insert-precedence regressions pass.
- Focused primitive-slot, type-variant, context/module-argument, here-string/cast, and deeply nested signature regressions pass.
- Both original grammar coverage fixtures highlight without an illegal parse, and their broad emitted-scope invariant passes.
- `test/grammarCoverage/grammar-coverage.jai` compiles and links with normal checks using `jai test/grammarCoverage/grammar-coverage.jai -import_dir test/grammarCoverage/modules -verbose`.
- A direct operator probe confirms distinct rotate and shift scopes after the precedence correction.
- A direct runtime probe covers untagged, anonymous, `using`, tagged, bound, inferred-member, polymorphic, and mixed nested record forms.
- The current Highlight.js API emits no deprecation warning.
- `git diff --check` passes.
- The full automated test suite passes, including the refreshed `BucketAllocator` snapshot and direct returns-list scope-closure invariant.

## Remaining recommendations

1. Keep the generated standard-library version marker tied to the compiler version used for generation and report drift in CI.
2. Treat unprefixed `{...}` struct literals as an intentional context-sensitive limitation unless a conservative expression-context rule can avoid misclassifying ordinary blocks.

## Overall rating

Lexical feature coverage is excellent, and structured semantic highlighting is now strong across procedures, structs, unions, tagged unions, enums, directives, and varargs parameters. Fundamental primitive names are consistently classified in structured type slots, anonymous records can nest without a fixed grammar depth, and the principal syntax families now have targeted automated invariants plus original compiler-valid integration fixtures. The largest practical risk is regression from the complexity of nested Highlight.js modes rather than missing basic Jai tokens.
