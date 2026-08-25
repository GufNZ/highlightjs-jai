# Jai Highlight.js Grammar Audit

Audit target: Jai beta 0.2.030 (2 July 2026), using the installed language distribution in `../jai` and the grammar in `src/languages/jai.js`.

## Executive summary

The grammar has broad and unusually detailed coverage of Jai. It recognizes the core declaration syntax, procedure and procedure-type signatures, polymorphic types and baked arguments, comments, current literals, casts, compiler directives, module parameters, inline assembly, for-expansions, standard-library symbols, and generated-source annotations. Many constructs that initially look like likely omissions are already explicitly handled: `0h` literals, `---`, backtick export, `,,`, `#through`, `#location`, `#modify`, parameterized imports, unary enum tags, and trailing commas.

The largest verified mismatches are incomplete structured union parsing and an outdated/incomplete primitive-type inventory in structured type slots. Import modifiers such as `#import,dir`, underscore-containing library modifiers, and the varargs `..` marker also have scope defects. The dedicated top-level `#insert` mode is shadowed by the generic directive mode. Newer unprefixed struct literals and uncommon nested forms remain inherent or lightly tested limitations.

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
- Struct and enum bodies, enum flags, polymorphic structs, defaults, constants in records, and `#insert` bodies.
- Current casts (`cast`, `xx`, and suffix casts), operators, ranges, shifts/rotates and modifiers, `---`, backticks, and `,,` punctuation.
- `for` modifiers and named for-expansions.
- General directives plus dedicated modes for imports, loads, modifies, inserts, module parameters, foreign/library declarations, and assembly.
- Extensive generated standard-library symbol classification for the same Jai version as the installed compiler.

### High-confidence mismatch

#### Unions are not parsed as records

`STRUCT_DECLARATION` recognizes only names followed by `:: struct`, and `STRUCT_TYPE_DECLARATION` begins only on the `struct` keyword. The keyword table knows `union`, but there is no corresponding structured union mode.

Consequences:

- `Thing` in `Thing :: union ...` is not scoped as a class/type declaration by the dedicated declaration mode.
- Ordinary union members do not receive the same `property.declaration`, `type.property`, default-value, and nested-body handling as struct members.
- Tagged union headers such as `union fruit: Fruit { ... }` have no structural model for the tag declaration.
- Binding rows such as `.APPLE ,, x: int;` are only tokenized by generic enum-reference, punctuation, declaration, and type rules rather than as tagged-union bindings.

Current Jai examples: `../jai/CHANGELOG.txt` under beta 0.2.023 and 0.2.025.
Grammar locations: `src/languages/jai.js` around `STRUCT_DECLARATION`, `STRUCT_TYPE_DECLARATION`, and `_ALL`.

### Other verified mismatches

- Dedicated `#import` parsing does not model comma modifiers such as `#import,dir`. The whole construct remains inside `meta.directive.import`, and the path is recognized, but `,dir` is emitted as plain text rather than `punctuation.comma` plus `meta.directive.modifier`.
- Foreign/library modifier rules use `[A-Za-z]+`, so active modifiers containing underscores are split. For example, only `link` in `link_always` and `no` in `no_dll` / `no_static_library` receives `meta.directive.modifier`; the suffix is plain text. Chained modifiers otherwise remain parseable.
- `.. string` varargs stays safely inside the parameter mode, but `..` is emitted as plain text. The general range-operator mode does not fire in this structured parameter path, and there is no varargs-specific scope.
- The documented primitive is `float32`, but the keyword table contains `f32` and `f64` instead. `float32` is plain text even where it is known to be a type. The `typeIdentifierREFn` primitive set also omits `int`, `float32`, and `void`. In procedure parameters and struct properties these names are consequently reopened as another parameter/property declaration instead of being wrapped in `type.params` / `type.property`. `int` and `void` still get type keyword color from the keyword engine; `float32` does not.
- `INSERT_DIRECTIVE` is ordered after `_COMMON_EXCEPT_DIRECTIVES`, which still contains the generic `DIRECTIVE` rule and explicitly recognizes `insert`. At top level, `#insert` is therefore emitted as generic `meta`/`meta.directive`, not `meta.directive.insert`, and the dedicated expression/lambda-body handling is unreachable there. The dedicated rule can still win in selected nested lists where it is placed first, such as a struct body.

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
- The automated markup suite has only one full markup fixture plus a few targeted assertions. It is currently red in this checkout: the `BucketAllocator` expected HTML is out of sync with the grammar (the first difference is the current, richer type wrapper around `[$N]int`), and the returns-list assertion assumes an older exact span nesting. The much larger `test/visualTests` corpus is primarily for manual/browser inspection and its checked-in copy does not contain the current directive-modifier examples above. Until expectations are refreshed and reviewed, the suite cannot provide a trustworthy regression baseline.
- Some fixed identifier heuristics assume uppercase type names and uppercase constants. Jai style follows that convention, but legal unconventional names can receive generic variable scopes in contexts where structural type parsing does not take over.

## Recommendations

1. Add a union declaration/body mode parallel to the struct mode, including optional tagged-union tag declarations before `{` and `.TAG ,, member` bindings inside it.
2. Correct the primitive inventory in both the keyword table and `primativesRE`: add at least the built-in names `float32`, `int`, and `void`, while retaining `f32` and `f64` as commonly added aliases used by many Jai codebases.
3. Add dedicated import-modifier and varargs-marker modes, allow underscores in directive modifiers, and move the dedicated `#insert` rule ahead of its generic competitor.
4. Add automated markup fixtures for tagged and untagged unions, every primitive in parameters/properties/returns, `#type` variants, import/library modifiers, varargs, context `,,`, module arguments, here-strings, casts, and deeply nested procedure/type signatures.
5. Review and refresh the current `BucketAllocator` snapshot and make the returns-list assertion test scope closure without depending on incidental wrapper counts.
6. Promote a representative subset of `test/visualTests` to automated invariant tests that assert key scopes and that highlighting terminates without illegal/zero-width failures.
7. Keep the generated standard-library version marker tied to the compiler version used for generation and report drift in CI.
8. Treat unprefixed `{...}` struct literals as an intentional context-sensitive limitation unless a conservative expression-context rule can avoid misclassifying ordinary blocks.

## Overall rating

Lexical feature coverage is excellent; structured semantic highlighting is very good for procedures, structs, and enums, but incomplete for unions and inconsistent for several fundamental type names. Parsing is generally correct on valid common code. The highest-value fixes are union structure, primitive type classification, and directive-modifier handling; after those, the largest practical risk is regression from the complexity of nested Highlight.js modes rather than missing basic Jai tokens.
