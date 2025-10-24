# CSS Class Reference for the jai language
<!--
To check we got them all, run `checkRef.sh` and deal with any output.
-->
## CSS Variables
The included `jaiEverything.css` is built with inheriting variables so for best results, to make a new jai theme, copy it and just modify the variables.

Each kind of thing has 5 properties you can adjust, namely:
| CSS Property | Variable Suffix | Example Values |
|-|-|-|
|Foreground Colour|`-fg`|`#F00`, `red`, `rgba(255, 0, 0, 0.75)` etc.|
|Background Colour|`-bg`|Same as above.|
|Font Style|`-style`|`normal`, `italic` etc.|
|Font Weight|`-weight`|`normal`, `bold`, `400` etc.|
|Text Decoration|`-decoration`|`none`, `underline` etc.|

Everything apart from `default` has a fallback of at least `--default-x`, but some have several layers of fallback, getting less and less specific.

To create a theme using them, only set things that need to change from the defaults.

### Available Variable Sections

Each section below can be defined up to 5 times (once for each suffix above), e.g. `--comment`s can be configured with `--comment-fg`, `--comment-bg`, `--comment-style`, `--comment-weight` and `--comment-decoration`, or any subset of those (with the rest falling back to the defaults).

//FIXME: more sensible ordering - see top of .css
|Section|Scope|Fallback chain|
|-|-|-|
|`--keyword`|Keywords|`--default`|
|`--keyword-cast`|The `cast` keyword, its parameters, and `()`s and `,`, as used in Option 1 and Option 2.|`-keyword`=>`--default` for the keyword;<br/>`--keyword`=>`--punctuation`=>`--default` for the `()`s and `,`;|
|`--keyword-cast-v1`|The `cast` keyword & parameters, as used in Option 1.|`-keyword-cast`=>`-keyword`=>`--default`|
|`--keyword-cast-v2`|The `cast` keyword & parameters, as used in Option 2.|`-keyword-cast`=>`-keyword`=>`--default`|
|`--operator-cast-v3`|The `.(Type)` Option 3 suffix cast.|`--operator`=>`--default`|
||||
|`--variable`|All otherwise-uncategorised variable identifiers.|`--default`|
|`--variable-language`|Language-defined variables: `context`, `it`, `it_index` & `temp`.|`--variable`=>`--default`|
|`--variable-constant`|Constants (`ALL_UPPER` names).|`--variable`=>`--default`|
|`--variable-context`|Variables on the Context.|`--variable`=>`--default`|
|`--variable-context-constant`|Constants on the Context.|`--variable-constant`=>`--variable`=>`--default`|
|`--variable-stdLib`|Variables defined in a standard lib module.|`--variable`=>`--default`|
|`--variable-stdLib-constant`|Constants defined in a module.|`--variable-constant`=>`--variable`=>`--default`|
|`--variable-stdLib-context`|Context additions defined a module.|`--variable`=>`--default`|
|`--variable-stdLib-moduleParam`|A standard lib module's module-parameter.|`--params`=>`--variable`=>`--default`|
|`--variable-stdLib-programParam`|A standard lib module's program-parameter.|`--params`=>`--variable`=>`--default`|
|`--punctuation-backslash`|Mid-identifier backslashed whitespace.|`--punctuation`=>`--default`|
||||
|`--field`|Struct field references.|`--default`|
|`--field-constant`|Struct constant-field references.|`--field`=>`--default`|
|`--field-enum`|Enum value references (`.ALL_UPPER` or `.PascalCase`).|`--field-constant`=>`--field`=>`--default`|
||||
|`--builtIn`|All built-in procs & functions.|`--default`|
|`--builtIn-stdLib`|Procs and functions defined in a standard lib module|`--builtIn`=>`--default`|
|`--builtIn-special`|Specially recognised functions: `for_expansion`, `operator...`|`--builtIn`=>`--default`|
||||
|`--type`|All types (PascalCase).|`--default`|
|`--type-enum`|All Enum types.|`--type`=>`--default`|
|`--type-baked`|Any polymorphic type that is baked, e.g. `$T`.|`--type`=>`--default`|
||||
|`--literal`|Non-numeric, non-string Literals: `true`, `false`, `null`.|`--default`|
||||
|`--number`|All numeric literals.|`--default`|
|`--number-prefix`|The prefix on any non-decimal numeric literal, e.g. `0x`, `0b` etc.|`--number`=>`--default`|
|`--number-integer`|All integer literals.|`--number`=>`--default`|
|`--number-float`|All floating-point literals.|`--number`=>`--default`|
|`--number-float-exponent`|The exponent suffix on a float literal, if present.|`--number-float`=>`--number`=>`--default`|
|`--number-binary`|All binary (`0b`) literals.|`--number`=>`--default`|
|`--number-binary-prefix`|The `0b` prefix.|`--number-prefix`=>`--number`=>`--default`|
|`--number-hexadecimal`|All hexadecimal (`0x`) literals.|`--number`=>`--default`|
|`--number-hex-prefix`|The `0x` prefix.|`--number-prefix`=>`--number`=>`--default`|
|`--number-hexFloat`|All hexFloat (`0h`) literals.|`--number`=>`--default`|
|`--number-hexFloat-prefix`|The `0h` prefix.|`--number-prefix`=>`--number`=>`--default`|
||||
|`--operator`|All operators.|`--default`|
|`--operator-bake`|The `$` and `$$` operators.|`--operator`=>`--default`|
|`--operator-modifier`|Things like `,small` or `,logical` for the bit-shift operators.|`--operator`=>`--default`|
||||
|`--punctuation`|All punctuation.|`--default`|
|`--punctuation-forExpansionInvoke`|The `:` prefix on for-expansion invocations.|`--punctuation`=>`--default`|
|`--punctuation-quote`|`"`s.|`--punctuation`=>`--default`|
|`--punctuation-directive`|`#`s.|`--punctuation`=>`--default`|
|`--punctuation-dot`|`.`s in `#asm` opcode size specifiers.|`--punctuation`=>`--default`|
|`--punctuation-clue`|`?`s in `#asm` opcode size specifiers.|`--punctuation`=>`--default`|
||||
|`--field`|Things following the `.` operator.|`--default`|
|`--field-constant`|Constant fields (ALL_UPPER).|`--field`=>`--default`|
|`--field-enum`|Enum fields (PascalCase).|`--field-constant`=>`--field`=>`--default`|
||||
|`--string`|Strings.|`--default`|
|`--string-here`|Here-Strings.|`--string`=>`--default`|
|`--string-here-termiator`|Here-String terminators.|`--string-here`=>`--string`=>`--default`|
|`--string-path`|Strings in `#load` and `#import` directives.|`--string`=>`--default`|
|`--char-escape`|Escaped things in strings, e.g. `\n`.|`--string`=>`--default`|
|`--subst`|Substituted things in strings that are args to known `@PrintLike` functions, e.g. `%`.|`--string`=>`--default`|
||||
|`--declaration`|All declarations.|`--default`|
||||
|`--struct`|Structs.|`--default`|
|`--struct-inherited`|Struct fields marked with `#as`.|`--struct`=>`--default`|
||||
|`--proc`|Procedures & functions.|`--default`|
|`--forExpansion`|Procs named `for_expansion`.|`--proc`=>`--default`|
||||
|`--params`|A module's module or program parameters in an `#import` directive.|`--default`|
|`--module-params`|A module's module in an `#import` directive.|`--params`=>`--default`|
|`--program-params`|A module's program parameters in an `#import` directive.|`--params`=>`--default`|
||||
|`--comment`|All comments.|`--default`|
|`--comment-line`|All line comments.|`--comment`=>`--default`|
|`--comment-block`|All block comments.|`--comment`=>`--default`|
|`--doctag`|All doctags within comments.|`--comment`=>`--default`|
|`--doctag-bug`|E.g. `BUG:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-fixme`|E.g. `FIXME:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-hack`|E.g. `HACK:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-later`|E.g. `LATER:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-maybe`|E.g. `MAYBE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-no_checkin`|E.g. `NO_CHECKIN:` or `nocheckin:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-note`|E.g. `NOTE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-optimise`|E.g. `OPTIMISE:` or `OPTIMIZE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-test`|E.g. `TEST:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-todo`|E.g. `TODO:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-question`|E.g. `QUESTION:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-xxx`|E.g. `XXX:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-reminder`|E.g. `@Speed`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-label`|E.g. `:Something`.|`--doctag`=>`--comment`=>`--default`|
||||
|`--meta`|Meta-information, e.g. directives and notes.|`--default`|
|`--meta-comma`|Commas in directives.|`--punctation`=>`--default`|
|`--note`|Notes, e.g. `@PrintLike`|`--meta`=>`--default`|
|`--directive`|Directives.|`--meta`=>`--default`|
|`--directive-modifier`|Directive modifiers.|`--directive`=>`--meta`=>`--default`|
|`--directive-import`|The `#import` directive.|`--directive`=>`--meta`=>`--default`|
|`--directive-load`|The `#load` directive.|`--directive`=>`--meta`=>`--default`|
|`--directive-module_parameters`|The `#module_parameters` directive.|`--directive`=>`--meta`=>`--default`|
|`--directive-modify`|The `#modify` directive on a proc declaration.`|`--directive`=>`--meta`=>`--default`|
||||
|`--asm-directive`|The `#asm` directive.|`--directive`=>`--meta`=>`--default`|
|`--asm-directive-flags`|Any CPU feature flags list on the `#asm` directive.|`--directive-modifier`=>`--directive`=>`--meta`=>`--default`|
|`--asm-directive-flags-comma`|`,`s in the CPU feature flags list on the `#asm` directive.|`--meta-comma`=>`--punctuation`=>`--default`|
|`--asm-directive-flag`|Each CPU feature flags on the `#asm` directive.|`--asm-directive-flags`=>`--directive-modifier`=>`--directive`=>`--meta`=>`--default`|
|`--asm-directive-block`|The entire `{}`-bounded block after the `#asm` directive.|`--asm-directive`=>`--directive`=>`--meta`=>`--default`|
|`--asm-register`|CPU register names.|`--keyword`=>`--default`|
|`--asm-mnemonic`|Instruction opcodes, e.g. `mov`.|`--default`|
|`--asm-size`|A size specifier on an opcode, e.g. in `mov.8` or `mov?T`.|`--asm-mnemonic`=>`--default`|
|`--asm-size-const`|A constant (literal) opcode size specifier, e.g. `mov.8`|`--asm-size`=>`--asm-mnemonic`=>`--default`|
|`--asm-size-type`|A variable opcode size specifier, e.g. `mov?T`|`--asm-size`=>`--asm-mnemonic`=>`--default`|
|`--asm-size-punctuation`|The `.` or `?` in an opcode size specifier, e.g. in `mov.8` or `mov?T`.|`--punctuation`=>`--default`|
|`--asm-dot-size-punctuation`|The `.` in an opcode size specifier, e.g. in `mov.8`.|`--punctuation-dot`=>`--punctuation`=>`--default`|
|`--asm-clue-size-punctuation`|The `?` in an opcode size specifier, e.g. in `mov?T`.|`--punctuation-clue`=>`--punctuation`=>`--default`|


---
## CSS Classes

### Comments
| CSS class | Definition |
|-|-|
|`.hljs-comment`|All comments.|
|`.hljs-comment.block_`|All block-comments.|
|`.hljs-comment.line_`|All line-comments.|
|`.hljs-doctag`|All doctags found in comments.|

#### Doctags
<details>
  <summary>List of recognised doctags:</summary>

  | CSS class | Tag | Definition |
  |-|-|-|
  |`.hljs-doctag.bug_`|`BUG:`|Marks a bug that needs attention.|
  |`.hljs-doctag.fixme_`|`FIXME:`|Marks something that needs fixing.|
  |`.hljs-doctag.hack_`|`HACK:`|Marks something dodgy or unusual.|
  |`.hljs-doctag.later_`|`LATER:`|Marks something we need to come back to later.|
  |`.hljs-doctag.maybe_`|`MAYBE:`|A thought we aren't sure about yet.|
  |`.hljs-doctag.noCheckin_`|`NO_CHECKIN:`|For repos with the right hooks set up, blocks commits till this is resolved & removed.|
  |`.hljs-doctag.note_`|`NOTE:`|Something important to take note of.|
  |`.hljs-doctag.optimise_`|`OPTIMISE:`|Something we really should come back and optimise.|
  |`.hljs-doctag.optimise_`|`OPTIMIZE:`|Same as above, but for Americans.|
  |`.hljs-doctag.question_`|`QUESTION:`|An outstanding question that needs an answer.|
  |`.hljs-doctag.test_`|`TEST:`|Marks something that still needs to be tested.|
  |`.hljs-doctag.todo_`|`TODO:`|Marks something we need to come back and do.|
  |`.hljs-doctag.xxx_`|`XXX:`|Marks a hack or a bug that needs attention.|
  ||||
  |`.hljs-doctag.reminder_`|`@Something`|Reminder tags, e.g. `@Incomplete` or `@Speed`.|
  ||||
  |`.hljs-doctag.label_`|`:Label`|A label likely used somewhere else near related code.|
</details>

### Literals
| CSS class | Definition |
|-|-|
|`.hljs-literal`|All literals, but specifically including `null`.|
|`.hljs-literal.bool_`|`true` and `false`|

### Numbers
| CSS class | Definition |
|-|-|
|`.hljs-number`|Numbers literals of any kind.|
|`.hljs-number.integer_`|Integer values.|
|`.hljs-number.float_`|Floating point values.|
|`.hljs-number.float_.exponent__`|Floating point value exponents.|
|`.hljs-number.binary_`|Numbers specified in binary via the `0b` prefix.|
|`.hljs-number.binary_.prefix__`|The `0b` prefix.|
|`.hljs-number.hex_`|Numbers specified in hex via the `0x` prefix.|
|`.hljs-number.hex_.prefix__`|The `0x` prefix.|
|`.hljs-number.hexFloat_`|Floats specified in hex via the `0h` prefix.|
|`.hljs-number.hexFloat_.prefix__`|The `0h` prefix.|

### Strings
| CSS class | Definition |
|-|-|
|`.hljs-string`|All strings.|
|`.hljs-char.escape_`|Any escaped character in a string.|
|`.hljs-subst`|Only for `@PrintLike` procs, the value substitution `%`.|
|`.hljs-string.here_`|HereDoc strings.|
|`.hljs-meta.stringTerminator_`|The terminator of a HereDoc string.|

### Keywords
| CSS class | Definition |
|-|-|
|`.hljs-keyword`|All keywords.|
|`.hljs-keyword.cast_`|The `cast` and `xx` keywords.|
|`.hljs-keyword.cast_.v1__`|Specifically the Option 1 cast kind.|
|`.hljs-keyword.cast_.v2__`|Specifically the Option 2 cast kind.|
||_Note: Option 3 is an operator._|
|`.hljs-keyword.context_`|The `push_context` keyword.|
|`.hljs-keyword.enum_`|`enum` and `enum_flags`.|
|`.hljs-keyword.flowCtrl_`|`continue`, `break`, `return` and `defer`.|
|`.hljs-keyword.if_`|`if`, `then`, `else`, `case` and `ifx`.|
|`.hljs-keyword.meta_`|`using`, `is_constant`, `type_of`, `size_of`, `code_of` and `initializer_of`.|
|`.hljs-keyword.proc_`|`interface`, `inline` and `no_inline`.|
|`.hljs-keyword.struct_`|`struct` and `union`.|
|`.hljs-keyword.for_`|`for`, `while` and `remove`.|
|`.hljs-punctuation.forExpansionInvoke_`|The `:` before a **for_expansion** name.|
|`.hljs-title.function_.forExpansion__`|A named for_expansion invocation.|

### Operators
| CSS class | Definition |
|-|-|
|`.hljs-operator`|All operators.|
|`.hljs-operator.assign_`|Assignment operators.|
|`.hljs-operator.bake_`|`$`.|
|`.hljs-operator.autobake_`|`$$`.|
|`.hljs-operator.backtick_`|Parent-scope indicator in macros.|
|`.hljs-operator.comparison_`|Comparison operators.|
|`.hljs-operator.logical_`|Logical operators.|
|`.hljs-operator.math_`|Math operators.|
|`.hljs-operator.math_.unaryNegate__`|The unary `-`.|
|`.hljs-operator.bitwise_`|Bitwise operators.|
|`.hljs-operator.shift_`|Bit-shift operators.|
|`.hljs-operator.shift_.modifier__`|Shift operator modifiers, e.g. `,small`.|
|`.hljs-operator.rotate_`|Bit-rotate operators.|
|`.hljs-operator.define_`|`:`.|
|`.hljs-operator.define_.assign__`|`:=`.|
|`.hljs-operator.define_.constant__`|`::`.|
|`.hljs-operator.uninitialised_`|`---`.|
|`.hljs-operator.dot_`|`.`.|
|`.hljs-operator.dereference_`|`.*`.|
|`.hljs-operator.cast_.v3__`|`.(`...`)`.|
|`.hljs-operator.pinRegister_`|`===` in `#asm` code.|
|`.hljs-operator.quickLambda_`|`=>`|
|`.hljs-operator.returns_`|`->`|
|`.hljs-operator.range_`|`..` - Range or spread.|
|`.hljs-operator.hash_.directive__`|`#` - The start of a directive.|

### Punctuation
| CSS class | Definition |
|-|-|
|`.hljs-punctuation`|All punctuation.|
|`.hljs-punctuation.brace_`|`{` and `}`.|
|`.hljs-punctuation.bracket_`|`[` and `]`.|
|`.hljs-punctuation.paren_`|`(` and `)`.|
|`.hljs-punctuation.comma_`|`,`.|
|`.hljs-punctuation.commaComma_`|`,,`, for overriding context values like allocator.|
|`.hljs-punctuation.quote_`|`"`.|
|`.hljs-punctuation.semicolon_`|`;`.|

### Variables
| CSS class | Definition |
|-|-|
|`.hljs-variable`|All variables.|
|`.hljs-variable.constant_`|All constants (`ALL_UPPER`).|
|`.hljs-variable.constant_.declaration__`|A constant being defined.|
|`.hljs-variable.context_`|Fields on the context (`thread_index`, `allocator` et al).|
|`.hljs-variable.context_.constant__`|Constants on the context (`default_allocator`).|
|`.hljs-variable.declaration_`|A variable being defined.|
|`.hljs-variable.language_`|Language-special variables - `context`, `temp`, `it`, `it_index`.|
|`.hljs-punctuation.backslash_`|Mid-identifier alignment backslash, e.g. `my_var\   _name`|
|`.hljs-variable.param_.baked__`|A proc parameter that is being baked (`$`-prefixed).|

### Fields
| CSS class | Definition |
|-|-|
|`.hljs-property`|An field reference (`something.camelCase`)|
|`.hljs-property.constant_`|A constant field reference (`something.ALL_UPPER`)|
|`.hljs-property.constant_.enum__`|An enum value reference (`.ALL_UPPER` or `.PascalCase`)|

### Types
| CSS class | Definition |
|-|-|
|`.hljs-type`|All types (`TitleCase`)|
|`.hljs-type.declaration_`|A type being defined.|
|`.hljs-type.any_`|The `Any` type.|
|`.hljs-type.type_`|The `Type` and `Type_Info` types.|
|`.hljs-type.bool_`|The `bool` type.|
|`.hljs-type.float_`|`float` and `float64`, as well as the common aliases of `f32` and `f64`.|
|`.hljs-type.integer_`|All integer types.|
|`.hljs-type.integer_.signed__`|Any signed integer type: `s8`, `s16` etc, and also `int`.|
|`.hljs-type.integer_.unsigned__`|Any unsigned integer type: `u8`, `u16` etc.|
|`.hljs-type.string_`|The `string` type.|
|`.hljs-type.context_`|The special `#Context` type.|
|`.hljs-type.enum_`|All enums declaration.|
|`.hljs-type.enum_.declaration__`|Enum type declarations.|
|`.hljs-type.enum_.value__.declaration___`|Enum value declarations.|
|`.hljs-type.code_`|The `Code` type.|
|`.hljs-type.void_`|The `void` type.|
|`.hljs-type.baked_`|Types on parameters that are being baked (`$`-prefixed).|
|`.hljs-type.asm_`|Register types: `reg`, `gpr` and `vec`.|

### Structs
| CSS class | Definition |
|-|-|
|`.hljs-title.class_.declaration__`|Struct declaration.|
|`.hljs-title.class_.inherited__`|`#as` fields.|

### Procs/Functions
| CSS class | Definition |
|-|-|
|`.hljs-title.function_`|Proc/Function call.|
|`.hljs-title.function_.declaration__`|Proc/Function declaraion.|

#### Specials
| CSS class | Definition |
|-|-|
|`.hljs-built_in.special_`|`for_expansion` special function name.|

### StdLib
| CSS class | Definition |
|-|-|
|`.hljs-variable.stdLib_.<module>__.context___`|Context additions from the `<module>` in the stdLib.|
|`.hljs-variable.stdLib_.<module>__.constant___`|Constants from the `<module>` in the stdLib.|
|`.hljs-variable.stdLib_.<module>__.moduleParam___`|Nodule Parameters for the `<module>` in the stdLib.|
|`.hljs-variable.stdLib_.<module>__.programParam___`|Program Parameters for the `<module>` in the stdLib.|
|`.hljs-variable.stdLib_.<module>__`|Variables from the `<module>` in the stdLib.|
|`.hljs-type.stdLib_.<module>__`|Structs/Enums from the `<module>` in the stdLib.|
|`.hljs-built_in.stdLib_.<module>__`|Procs/Functions from the `<module>` in the stdLib.|

### Meta Information
| CSS class | Definition |
|-|-|
|`.hljs-meta`|All meta information.|
|`.hljs-meta.note_`|All notes (e.g. `@PrintLike`).|
|||
|`.hljs-meta.directive_`|All directives.|
|`.hljs-meta.directive_.modifier__`|All directive modifiers.|

#### Specifics
| CSS class | Definition |
|-|-|
|`.hljs-meta.directive_.modify__`|Modify directives and their block.|
|||
|`.hljs-meta.directive_.load__`|Load directives.|
|`.hljs-string.path_.load__`|The file-path in the load directive.|
|||
|`.hljs-meta.directive_.import__`|Import directives.|
|`.hljs-string.path_.import__`|The module name or path in import directives.|
|`.hljs-params.moduleOrProgram_`|The module or program parameters in either an import directive or the `#module_parameters` directive.|
|`.hljs-meta.directive_.module_parameters__`|The `#module_parameters` directive.|

### Inline ASM
| CSS class | Definition |
|-|-|
|`.hljs-meta.asm_`|Inline Assembly|
|`.hljs-meta.directive_.asm__`|The `#asm` directive.|
|`.hljs-meta.directive_.asm__.flags___`|Any CPU FeatureFlags required for this `#asm` block.|
|`.hljs-meta.directive_.asm__.flag___`|Individual CPU FeatureFlags.|
|`.hljs-meta.directive_.asm__.block___`|The block containing the inline assembly.|
|`.hljs-operator.asm_.size__.clue___`|`?` in `#asm` after mnemonics to specify data width based on a variable or type.|
|`.hljs-operator.asm_.size__.dot___`|`.` in `#asm` after mnemonics to specify data width based a constant.|
|`.hljs-symbol.size_`|All mnemonic data width specifiers.|
|`.hljs-symbol.size_.numeric__`|The mnemonic data width specifier when specified using a number after the `.`.|
|`.hljs-symbol.size_.type__`|The mnemonic data width specifier when specified using a variable or type after the `?`.|
|`.hljs-symbol.size_.const__`|The mnemonic data width specifier when specified using a constant after the `?`.|
|`.hljs-meta.asm_.keyword__.register___`|A register name.|
|`.hljs-operator.asm_.maskControl__`|The `&` and `&*` masking operators - part of the EVEX encoding available under the AVX512F feature.|
|`.hljs-operator.asm_.roundingControl__`|The `!n`, `!u`, `!d` and `!z` operators - part of the EVEX encoding available under the AVX512F feature.|
|`.hljs-operator.asm_.broadcastValueOrSuppressFloatExceptions__`|The `!` operator, either broadcast loads or SuppressAllExceptions - part of the EVEX encoding available under the AVX512F feature.|
|`.hljs-symbol`|All `#asm` mnemonics.|
|`.hljs-symbol.<flag>_`|All `#asm` mnemonics available for the given CPU FeatureFlag.|

### Other
| CSS class | Definition |
|-|-|
|`.hljs-_BalancedParens`|Used in a few places that need exactly balanced `()`s, such as casts or module/program parameters.|
|`.hljs-_BalancedBraces`|Used in a few places that need exactly balanced `{}`s, such as the modify directive.|

## Notes
### Recomendations
- Tab size:
```css
.language-jai {
	tab-size: 4;
}
```
- Check the `jaiEverything` theme CSS for how cast variants are handled.
- Note that `subst` markers are only processed in known stdLib `@PrintLike` procs.
- To address all declarations:
```css
.hljs .declaration_,
	.hljs .declaration__:not(.enum_),
	.hljs-type.enum_:not(.declaration__) { font-style: italic; }
```
- To differentiate Module Parameters and Program Parameters:
```css
.hljs-params { background-color: #400; }

/* Module Parameters: */
.hljs-params.moduleOrProgram_ {
	background-color: #044;

	/* Program Parameters: */
	& > .hljs-_BalancedParens:nth-of-type(2) { background-color: #004; }
}
```
