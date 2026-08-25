# Jai Highlight.js Grammar Audit

Audit target: Jai beta 0.2.030 (2 July 2026), using the installed language distribution in `../jai` and the grammar in `src/languages/jai.js`.

## Executive summary

The grammar has broad and unusually detailed coverage of Jai. It recognizes the core declaration syntax, procedure and procedure-type signatures, polymorphic types and baked arguments, comments, current literals, casts, compiler directives, module parameters, inline assembly, for-expansions, standard-library symbols, and generated-source annotations. Many constructs that initially look like likely omissions are already explicitly handled: `0h` literals, `---`, backtick export, `,,`, `#through`, `#location`, `#modify`, parameterized imports, unary enum tags, and trailing commas.

The two largest mismatches found by the audit have now been corrected: structured union parsing covers named, anonymous, polymorphic, tagged, and bound unions, and the primitive-type inventory recognizes the current built-in names in structured type slots. Anonymous struct and union fields now share an unlimited self-recursive record mode, allowing arbitrarily mixed nesting without a fixed depth limit. Import modifiers such as `#import,dir`, underscore-containing library modifiers, and the varargs `..` marker still have scope defects. The dedicated top-level `#insert` mode remains shadowed by the generic directive mode. Newer unprefixed struct literals and uncommon nested forms remain inherent or lightly tested limitations.

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

### Other verified mismatches

- Dedicated `#import` parsing does not model comma modifiers such as `#import,dir`. The whole construct remains inside `meta.directive.import`, and the path is recognized, but `,dir` is emitted as plain text rather than `punctuation.comma` plus `meta.directive.modifier`.
- Foreign/library modifier rules use `[A-Za-z]+`, so active modifiers containing underscores are split. For example, only `link` in `link_always` and `no` in `no_dll` / `no_static_library` receives `meta.directive.modifier`; the suffix is plain text. Chained modifiers otherwise remain parseable.
- `.. string` varargs stays safely inside the parameter mode, but `..` is emitted as plain text. The general range-operator mode does not fire in this structured parameter path, and there is no varargs-specific scope.
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
- The automated markup suite has only one full markup fixture plus targeted assertions. It now includes passing regressions for six-level anonymous struct recursion and named, anonymous, nested, polymorphic, tagged, and bound unions. The full suite is still red for two pre-existing stale expectations: the `BucketAllocator` expected HTML is out of sync with the grammar (the first difference is the current, richer type wrapper around `[$N]int`), and the returns-list assertion assumes an older exact span nesting. The much larger `test/visualTests` corpus is primarily for manual/browser inspection and its checked-in copy does not contain the current directive-modifier examples above. Until those two expectations are refreshed and reviewed, the suite cannot provide a fully trustworthy regression baseline.
- Some fixed identifier heuristics assume uppercase type names and uppercase constants. Jai style follows that convention, but legal unconventional names can receive generic variable scopes in contexts where structural type parsing does not take over.

## Validation performed

- `npx tsc --noEmit` passes.
- Editor diagnostics report no errors in `src/languages/jai.js` or `test/index.js`.
- Focused anonymous-record and union regressions pass.
- A direct runtime probe covers untagged, anonymous, `using`, tagged, bound, inferred-member, polymorphic, and mixed nested record forms.
- The current Highlight.js API emits no deprecation warning.
- `git diff --check` passes.
- The full test suite reaches only the two known stale failures described above; the new union and recursion tests pass.

## Remaining recommendations

1. Add dedicated import-modifier and varargs-marker modes, allow underscores in directive modifiers, and move the dedicated `#insert` rule ahead of its generic competitor.
2. Extend automated coverage to every primitive in parameters/properties/returns, `#type` variants, import/library modifiers, varargs, context `,,`, module arguments, here-strings, casts, and deeply nested procedure/type signatures.
3. Review and refresh the current `BucketAllocator` snapshot and make the returns-list assertion test scope closure without depending on incidental wrapper counts.
4. Promote a representative subset of `test/visualTests` to automated invariant tests that assert key scopes and that highlighting terminates without illegal/zero-width failures.
5. Keep the generated standard-library version marker tied to the compiler version used for generation and report drift in CI.
6. Treat unprefixed `{...}` struct literals as an intentional context-sensitive limitation unless a conservative expression-context rule can avoid misclassifying ordinary blocks.

## Overall rating

Lexical feature coverage is excellent, and structured semantic highlighting is now strong across procedures, structs, unions, tagged unions, and enums. Fundamental primitive names are consistently classified in structured type slots, and anonymous records can nest without a fixed grammar depth. The highest-value remaining correctness work is directive/import modifier handling, varargs scoping, and restoring a clean full-suite baseline. After those, the largest practical risk is regression from the complexity of nested Highlight.js modes rather than missing basic Jai tokens.
