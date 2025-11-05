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

|Section|Scope|Fallback chain|
|-|-|-|
|**Comments**|
|`--comment`|All comments.|`--default`|
|`--comment-line`|All line comments.|`--comment`=>`--default`|
|`--comment-block`|All block comments.|`--comment`=>`--default`|
|**DocTags**|
|`--doctag`|All doctags within comments.|`--comment`=>`--default`|
|`--doctag-bug`|E.g. `BUG:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-fixme`|E.g. `FIXME:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-hack`|E.g. `HACK:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-later`|E.g. `LATER:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-maybe`|E.g. `MAYBE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-noCheckin`|E.g. `NO_CHECKIN:` or `nocheckin:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-note`|E.g. `NOTE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-optimise`|E.g. `OPTIMISE:` or `OPTIMIZE:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-test`|E.g. `TEST:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-todo`|E.g. `TODO:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-question`|E.g. `QUESTION:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-xxx`|E.g. `XXX:`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-reminder`|E.g. `@Speed`.|`--doctag`=>`--comment`=>`--default`|
|`--doctag-label`|E.g. `:Something`.|`--doctag`=>`--comment`=>`--default`|
||||
|**Literals**|
|`--literal`|Non-numeric, non-string literals: `true`, `false`, `null`.|`--default`|
|`--literal-bool`|Boolean literals: `true`, `false`|`--literal`=>`--default`|
|`--literal-bool-true`|`true`|`--literal-bool`=>`--literal`=>`--default`|
|`--literal-bool-false`|`false`|`--literal-bool`=>`--literal`=>`--default`|
||||
|**Numbers**|
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
|**Chars**|
|`--char`|The `#char` directive and it's following quoted char value.|`--string`=>`--default`|
|`--char-hash`|The `#` in the `#char` directive.|`--operator-hash-directive`=>`--operator`=>`--default`|
|`--keyword-char`|The `char` keyword in the `#char` directive.|`--keyword`=>`--default`|
|**Strings**|
|`--string`|Strings.|`--default`|
|`--hereString`|Here-Strings.|`--string`=>`--default`|
|`--hereString-hash`|The `#` in the `#string` directive.|`--hereString`=>`--string`=>`--default`|
|`--hereString-directive`|The `string` in the `#string` directive.|`--directive`=>`--meta`=>`--default`|
|`--hereString-directive-modifier`|The `,cr` in the `#string,cr` directive.|`--directive-modifier`=>`--directive`=>`--meta`=>`--default`|
|`--hereString-termiator`|Here-String terminators.|`--hereString`=>`--string`=>`--default`|
|`--string-path`|Strings in `#load` and `#import` directives.|`--string`=>`--default`|
|`--char-escape`|Escaped things in strings, e.g. `\n`.|`--string`=>`--default`|
|`--subst`|Substituted things in strings that are args to known `@PrintLike` functions, e.g. `%`.|`--string`=>`--default`|
|`--string-path`|The path-containing string in `#import` and `#load` directives.|`--string`=>`--default`|
|`--string-path-import`|The path-containing string in an `#import` directive.|`--string-path`=>`--string`=>`--default`|
|`--string-path-load`|The path-containing string in a `#load` directive.|`--string-path`=>`--string`=>`--default`|
||||
|**Keywords**|
|`--keyword`|Keywords|`--default`|
|`--keyword-char`|The `char` keyword in the `#char` directive.|`--keyword`=>`--default`|
|`--keyword-context`|The `push_context` and `defer_pop` keywords.|`--keyword`=>`--default`|
|`--keyword-enum`|The `enum` and `enum_flags` keywords.|`--keyword`=>`--default`|
|`--keyword-if`|`if`, `ifx`, `then`, `else` and `case`.|`--keyword`=>`--default`|
|`--keyword-for`|`for`, `remove` and `while`|`--keyword`=>`--default`|
|`--keyword-flowControl`|`continue`, `break`, `defer` and `return`.|`--keyword`=>`--default`|
|`--keyword-meta`|`type_of`, `type_info`, `size_of`, `initializer_of`, `code_of`, `is_constant` and `using`|`--keyword`=>`--default`|
|`--keyword-proc`|`inline`, `no_inline` and `interface`.|`--keyword`=>`--default`|
|`--keyword-struct`|`struct` and `union`.|`--keyword`=>`--default`|
|`--keyword-cast`|The `cast` keyword, its parameters, and `()`s and `,`, as used in Option 1 and Option 2, and the `xx` autocast keyword.|`--keyword`=>`--default` for the keyword;<br/>`--keyword`=>`--punctuation`=>`--default` for the `()`s and `,`;|
|`--keyword-cast-v1`|The `cast` keyword & parameters, as used in Option 1.|`--keyword-cast`=>`--keyword`=>`--default`|
|`--keyword-cast-v2`|The `cast` keyword & parameters, as used in Option 2.|`--keyword-cast`=>`--keyword`=>`--default`|
|`--operator-cast-v3`|The `.(Type)` Option 3 suffix cast.|`--operator`=>`--default`|
||||
|**Operators**|
|`--operator`|All operators.|`--default`|
|`--operator-bake`|The `$` operator.|`--operator`=>`--default`|
|`--operator-autobake`|The `$$` operator.|`--operator`=>`--default`|
|`--operator-assign`|All assignment operators, `=`, and all the `+=`, `-=` etc. versions.|`--operator`=>`--default`|
|`--operator-backtick`|The scope-modifying <code>`</code> operator.|`--operator`=>`--default`|
|`--operator-bitwise`|All bitwise operators (`&`, `|`, `~`, `^`).|`--operator`=>`--default`|
|`--operator-comparison`|All comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`).|`--operator`=>`--default`|
|`--operator-define`|The `:` operator.|`--operator`=>`--default`|
|`--operator-define-assign`|The compound, type-inferred `:=` operator.|`--operator-define`=>`--operator`=>`--default`|
|`--operator-define-constant`|The constant-defining operator `::`.|`--operator-define`=>`--operator`=>`--default`|
|`--operator-dereference`|The `.*` operator|`--operator`=>`--default`|
|`--operator-dot`|The `.` operator.|`--operator`=>`--default`|
|`--operator-hash-directive`|The `#` operator.|`--operator`=>`--default`|
|`--operator-logical`|All logical operators (`!`, `&&`, `||`).|`--operator`=>`--default`|
|`--operator-math`|All math binary operators (`+`, `-`, `*`, `/`, `%`).|`--operator`=>`--default`|
|`--operator-math-unaryNegate`|The unary `-` in front of a numeric literal.|`--operator-math`=>`--operator`=>`--default`|
|`--operator-quickLambda`|The `=>` operator.|`--operator`=>`--default`|
|`--operator-range`|The `..` operator.|`--operator`=>`--default`|
|`--operator-returns`|The `->` operator.|`--operator`=>`--default`|
|`--operator-rotate`|The bitwise rotate operators (`<<<`, `>>>`).|`--operator`=>`--default`|
|`--operator-shift`|The bitwise shift operators (`<<`, `>>`).|`--operator`=>`--default`|
|`--operator-shift-modifier`|Things like `,small` or `,logical` for the bit-shift operators.|`--operator-shift`=>`--operator`=>`--default`|
|`--operator-uninitialised`|The `---` operator.|`--operator`=>`--default`|
|`--operator-pinRegister`|The `===` operator.|`--operator`=>`--default`|
|`--operator-asm-broadcastValueOrSuppressFloatExceptions`|The `!` operator in inline ASM.|`--operator`=>`--default`|
|`--operator-asm-maskControl`|The `&` and `&*` operators in inline ASM.|`--operator`=>`--default`|
|`--operator-asm-roundingControl`|The `!n`, `!d`, `!u` and `!z` operators in inline ASM.|`--operator`=>`--default`|
|**Punctuation**|
|`--punctuation`|All punctuation.|`--default`|
|`--punctuation-bracket`|`[` and `]`.|`--punctuation`=>`--default`|
|`--punctuation-paren`|`(` and `)`.|`--punctuation`=>`--default`|
|`--punctuation-brace`|`{` and `}`.|`--punctuation`=>`--default`|
|`--punctuation-quote`|`"`s.|`--punctuation`=>`--default`|
|`--punctuation-comma`|`,`s.|`--punctuation`=>`--default`|
|`--punctuation-commaComma`|The `,,` context-arg delimiter.|`--punctuation-comma`=>`--punctuation`=>`--default`|
|`--punctuation-semicolon`|`;`s.|`--punctuation`=>`--default`|
|`--punctuation-forModifier`|The `<` and `*` modifiers for a `for` statement.|`--punctuation`=>`--default`|
|`--punctuation-forExpansionInvoke`|The `:` prefix on for-expansion invocations.|`--punctuation`=>`--default`|
|`--punctuation-backslash`|Mid-identifier alignment backslash.|`--punctuation`=>`--default`|
|`--punctuation-alignmentWS`|Mid-identifier alignment whitespace.|`--punctuation`=>`--default`|
||||
|**Declarations**|
|`--declaration`|All declarations - if they fall back to this.|`--default`|
|`--variable-declaration`|Variable declarations.|`--declaration`=>`--variable`=>`--default`|
|`--variable-constant-declaration`|A constant being declared.|`--variable-declaration`=>`--declaration`=>`--variable-constant`=>`--variable`=>`--default`|
|`--struct-declaration`|Struct variable declarations.|`--declaration`=>`--struct`=>`--title`=>`--default`|
|`--field-declaration`|Struct field declarations.|`--declaration`=>`--field`=>`--default`|
|`--field-constant-declaration`|Struct constant-field declarations.|`--declaration`=>`--field-constant`=>`--field`=>`--default`|
|`--proc-declaration`|Proc/functions declarations.|`--declaration`=>`--proc`=>`--title`=>`--default`|
|`--params-declaration`|All proc parameter declarations in the proc signature.|`--declaration`=>`--params`=>`--default`|
|`--type-declaration`|Type declarations.|`--declaration`=>`--type`=>`--default`|
|`--type-enum-declaration`|An `enum` or `enum_flags` type being declared.|`--type-declaration`=>`--declaration`=>`--type`=>`--default`|
|`--type-enum-value-declaration`|An enum value being declared.|`--type-enum-declaration`=>`--type-declaration`=>`--declaration`=>`--type`=>`--default`|
|`--module-params-declaration`|Module parameter declarations in the `#module_parameters` directive.|`--declaration`=>`--module-params`=>`--params`=>`--default`|
|`--program-params-declaration`|Program parameter declarations in the `#module_parameters` directive.|`--declaration`=>`--program-params`=>`--params`=>`--default`|
||||
|**Variables**|
|`--variable`|All otherwise-uncategorised variable identifiers.|`--default`|
|`--variable-declaration`|A variable being declared.|`--declaration`=>`--variable`=>`--default`|
|`--variable-language`|Language-defined variables: `context`, `it`, `it_index` & `temp`.|`--variable`=>`--default`|
|`--variable-constant`|Constants (`ALL_UPPER` names).|`--variable`=>`--default`|
|`--variable-constant-declaration`|A constant being declared.|`--variable-declaration`=>`--declaration`=>`--variable-constant`=>`--variable`=>`--default`|
|`--variable-param-baked`|A parameter variable which is being value-baked, i.e. `$myVar`.|`--variable`=>`--default`|
|`--variable-context`|Variables on the Context.|`--variable`=>`--default`|
|`--variable-context-constant`|Constants on the Context.|`--variable-constant`=>`--variable`=>`--default`|
|`--variable-stdLib`|Variables defined in a standard lib module.|`--variable`=>`--default`|
|`--variable-stdLib-constant`|Constants defined in a module.|`--variable-stdLib`=>`--variable-constant`=>`--variable`=>`--default`|
|`--variable-stdLib-context`|Context additions defined a module.|`--variable-stdLib`=>`--variable`=>`--default`|
|`--variable-stdLib-moduleParam`|A standard lib module's module-parameter.|`--params`=>`--variable`=>`--default`|
|`--variable-stdLib-programParam`|A standard lib module's program-parameter.|`--params`=>`--variable`=>`--default`|
|`--field`|Struct field references (things following the `.` operator).|`--default`|
|`--field-declaration`|A struct field declaration.|`--field`=>`--default`|
|`--field-constant`|Struct constant-field references (`ALL_UPPER`).|`--field`=>`--default`|
|`--field-enum`|Enum value references (`.ALL_UPPER` or `.PascalCase`).|`--field-constant`=>`--field`=>`--default`|
|`--punctuation-backslash`|Mid-identifier alignment backslash.|`--punctuation`=>`--default`|
|`--punctuation-alignmentWS`|Mid-identifier alignment whitespace.|`--punctuation`=>`--default`|
||**Fields**|
|`--field`|Struct field references (things following the `.` operator).|`--default`|
|`--field-declaration`|A struct field declaration.|`--field`=>`--default`|
|`--field-constant`|Struct constant-field references (`ALL_UPPER`).|`--field`=>`--default`|
|`--field-constant-declaration`|Struct constant-field declarations.|`--declaration`=>`--field-constant`=>`--field`=>`--default`|
|`--field-enum`|Enum value references (`.ALL_UPPER` or `.PascalCase`).|`--field-constant`=>`--field`=>`--default`|
||||
|**Types**|
|`--type`|All types (PascalCase).|`--default`|
|`--type-declaration`|Type declarations.|`--declaration`=>`--type`=>`--default`|
|`--type-enum`|All Enum types.|`--type`=>`--default`|
|`--type-any`|The `Any` type.|`--type`=>`--default`|
|`--type-bool`|The `bool` type.|`--type`=>`--default`|
|`--type-code`|The `Code` type.|`--type`=>`--default`|
|`--type-context`|The `#Context` type|`--type`=>`--default`|
|`--type-enum-declaration`|An `enum` or `enum_flags` type being declared.|`--type-declaration`=>`--declaration`=>`--type`=>`--default`|
|`--type-enum-value-declaration`|An enum value being declared.|`--type-enum-declaration`=>`--type-declaration`=>`--declaration`=>`--type`=>`--default`|
|`--type-float`|Both floating point types (`float`, `float64`).|`--type`=>`--default`|
|`--type-function`|All procs/functions.|`--type`=>`--default`|
|`--type-function-declaration`|Proc/function declarations.|`--type-declaration`=>`--declaration`=>`--type-function`=>`--type`=>`--default`|
|`--type-function-declaration-quickLambda`|QuickLambda declarations.|`--type-function-declaration`=>`--type-declaration`=>`--declaration`=>`--type-function`=>`--type`=>`--default`|
|`--type-integer`|All integer types.|`--type`=>`--default`|
|`--type-integer-signed`|All signed integer types (`int`, `s8`, `s16`, `s32`, `s64`).|`--type-integer`=>`--type`=>`--default`|
|`--type-integer-unsigned`|All unsigned integer types (`u8`, `u16`, `u32`, `u64`).|`--type-integer`=>`--type`=>`--default`|
|`--type-string`|The `string` type.|`--type`=>`--default`|
|`--type-stdLib`|Any types defined in the standard library.|`--type`=>`--default`|
|`--type-struct`|All struct types.|`--type`=>`--default`|
|`--type-struct-declaration`|Struct type declarations.|`--type-declaration`=>`--declaration`=>`--struct`=>`--type`=>`--default`|
|`--type-type`|The `Type` type.|`--type`=>`--default`|
|`--type-void`|The `void` type.|`--type`=>`--default`|
|`--type-asm`|The `reg` (and `__reg`) types.|`--type`=>`--default`|
|`--type-baked`|Any polymorphic type that is baked, e.g. `$T`.|`--type`=>`--default`|
||||
|**Enums**|
|`--enum`|All enum variables.|`--title`=>`--default`|
|`--enum-declaration`|Enum variable declarations.|`--declaration`=>`--enum`=>`--title`=>`--default`|
||||
|`--title`|The names of structs, procs & functions.|`--default`|
||||
|**Structs**|
|`--struct`|Structs.|`--title`=>`--default`|
|`--struct-inherited`|Struct fields marked with `#as`.|`--struct`=>`--title`=>`--default`|
|`--struct-declaration`|A struct being declared.|`--declaration`=>`--struct`=>`--title`=>`--default`|
||||
|**Procs/Functions**|
|`--proc`|Procedures & functions.|`--title`=>`--default`|
|`--proc-printLike`|Known stdLib procs marked with `@PrintLike`, enabling substitution marker highlighting.|`--proc`=>`--title`=>`--default`|
|`--proc-declaration`|A proc/function being declared.|`--declaration`=>`--proc`=>`--title`=>`--default`|
|`--params-declaration`|All proc parameter declarations in the proc signature.|`--declaration`=>`--params`=>`--default`|
|`--directive-modify`|The `#modify` directive on a proc declaration.`|`--directive`=>`--meta`=>`--default`|
|**Specials**|
|`--forExpansion`|Procs named `for_expansion`.|`--proc`=>`--title`=>`--default`|
|`--operatorProc`|Procs named `operator`.|`--proc`=>`--title`=>`--default`|
||||
|**Standard Lib**|
|`--builtIn`|All built-in procs & functions.|`--default`|
|`--builtIn-stdLib`|Procs and functions defined in a standard lib module|`--builtIn`=>`--default`|
||||
|**Meta Information**|
|`--meta`|Meta-information, e.g. directives and notes.|`--default`|
|`--meta-comma`|Commas in directives.|`--punctuation`=>`--default`|
|`--note`|Notes, e.g. `@PrintLike`|`--meta`=>`--default`|
|**Directives**|
|`--directive`|Directives.|`--meta`=>`--default`|
|`--directive-modifier`|Directive modifiers.|`--directive`=>`--meta`=>`--default`|
|`--directive-import`|The `#import` directive.|`--directive`=>`--meta`=>`--default`|
|`--directive-load`|The `#load` directive.|`--directive`=>`--meta`=>`--default`|
|`--directive-modify`|The `#modify` directive on a proc declaration.`|`--directive`=>`--meta`=>`--default`|
|`--directive-module_parameters`|The `#module_parameters` directive.|`--directive`=>`--meta`=>`--default`|
|`--module-params-declaration`|Module parameter declarations in the `#module_parameters` directive.|`--declaration`=>`--module-params`=>`--params`=>`--default`|
|`--program-params-declaration`|Program parameter declarations in the `#module_parameters` directive.|`--declaration`=>`--program-params`=>`--params`=>`--default`|
|`--directive-module_parameters-block`|The block that is optionally part of the `#module_parameters` directive, where things to be used in the module parameters are defined.|`--directive-module_parameters`=>`--directive`=>`--meta`=>`--default`|
||||
|**Specifics**|
|`--params`|A module's module or program parameters in an `#import` directive.|`--default`|
|`--module-params`|A module's module in an `#import` directive.|`--params`=>`--default`|
|`--program-params`|A module's program parameters in an `#import` directive.|`--params`=>`--default`|
||||
|**Inline ASM**|
|`--asm`|All inline ASM.|`--meta`=>`--default`|
|`--asm-directive`|The `#asm` directive.|`--directive`=>`--meta`=>`--default`|
|`--asm-directive-flags`|Any CPU feature flags list on the `#asm` directive.|`--directive-modifier`=>`--directive`=>`--meta`=>`--default`|
|`--asm-directive-flags-comma`|`,`s in the CPU feature flags list on the `#asm` directive.|`--meta-comma`=>`--punctuation`=>`--default`|
|`--asm-directive-flag`|Each CPU feature flags on the `#asm` directive.|`--asm-directive-flags`=>`--directive-modifier`=>`--directive`=>`--meta`=>`--default`|
|`--asm-directive-block`|The entire `{}`-bounded block after the `#asm` directive.|`--asm`=>`--asm-directive`=>`--directive`=>`--meta`=>`--default`|
|`--operator-pinRegister`|The `===` operator.|`--operator`=>`--default`|
|`--operator-asm-broadcastValueOrSuppressFloatExceptions`|The `!` operator in inline ASM.|`--operator`=>`--default`|
|`--operator-asm-maskControl`|The `&` and `&*` operators in inline ASM.|`--operator`=>`--default`|
|`--operator-asm-roundingControl`|The `!n`, `!d`, `!u` and `!z` operators in inline ASM.|`--operator`=>`--default`|
||||
|`--asm-register`|CPU register names.|`--keyword`=>`--default`|
|`--asm-mnemonic`|Instruction opcodes, e.g. `mov`.|`--default`|
|`--asm-size`|A size specifier on an opcode, e.g. in `mov.8` or `mov?T`.|`--asm-mnemonic`=>`--default`|
|`--asm-size-numeric`|A numeric-literal size specifier, e.g. `mov.8`.|`--asm-size`=>`--asm-mnemonic`=>`--default`|
|`--asm-size-const`|A constant opcode size specifier, e.g. `mov.BITS`.|`--asm-size`=>`--asm-mnemonic`=>`--default`|
|`--asm-size-type`|A variable opcode size specifier, e.g. `mov?T`.|`--asm-size`=>`--asm-mnemonic`=>`--default`|
|`--operator-asm-size`|The `.` or `?` in an opcode size specifier, e.g. in `mov.8` or `mov?T`.|`--operator`=>`--default`|
|`--operator-asm-size-clue`|The `?` in an opcode size specifier, e.g. in `mov?T`.|`--operator-asm-size`=>`--operator`=>`--default`|
|`--operator-asm-size-dot`|The `.` in an opcode size specifier, e.g. in `mov.8`.|`--operator-asm-size`=>`--operator`=>`--default`|


---
## CSS Classes

If you feel it necessary, you can alter the structural CSS that uses the variables by referencing the CSS classes used below.

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
|`.hljs-literal.bool_`|`true` and `false`.|
|`.hljs-literal.bool_.true__`|`true`.|
|`.hljs-literal.bool_.false__`|`false`.|

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

### Chars
| CSS class | Definition |
|-|-|
|`.hljs-char`|The `#char` directive and it's quoted char value.|
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
|`.hljs-keyword.char_`|The `char` keyword in the `#char` directive.|
|`.hljs-keyword.context_`|The `push_context` keyword.|
|`.hljs-keyword.enum_`|`enum` and `enum_flags`.|
|`.hljs-keyword.flowCtrl_`|`continue`, `break`, `return` and `defer`.|
|`.hljs-keyword.if_`|`if`, `then`, `else`, `case` and `ifx`.|
|`.hljs-keyword.meta_`|`using`, `is_constant`, `type_of`, `size_of`, `code_of` and `initializer_of`.|
|`.hljs-keyword.proc_`|`interface`, `inline` and `no_inline`.|
|`.hljs-keyword.struct_`|`struct` and `union`.|
|`.hljs-keyword.for_`|`for`, `while` and `remove`.|
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
|`.hljs-punctuation.forModifier_`|The `<` and `*` modifiers for a `for` statement.|
|`.hljs-punctuation.forExpansionInvoke_`|The `:` before a **for_expansion** name.|
|`.hljs-punctuation.backslash_`|Mid-identifier alignment backslash, e.g. `my_var\   _name`|
|`.hljs-punctuation.alignmentWS_`|Mid-identifier alignment whitespace, e.g. `my_var\   _name`|

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
|`.hljs-punctuation.alignmentWS_`|Mid-identifier alignment whitespace, e.g. `my_var\   _name`|
|`.hljs-variable.param_.baked__`|A proc parameter that is being baked (`$`-prefixed).|

### Fields
| CSS class | Definition |
|-|-|
|`.hljs-property`|A field reference (`something.camelCase`)|
|`.hljs-property.declaration_`|A field declaration (`camelCase: type` inside a struct definition)|
|`.hljs-property.constant_.declaration__`|A constant field declaration in a struct definition.|
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
|`.hljs-type.enum_`|All enums declarations.|
|`.hljs-type.enum_.declaration__`|Enum type declarations.|
|`.hljs-type.enum_.value__.declaration___`|Enum value declarations.|
|`.hljs-type.function_`|All proc/function/quickLambda declarations.|
|`.hljs-type.function_.declaration__`|Proc/function type declarations.|
|`.hljs-type.function_.declaration__.quickLambda___`|QuickLambda declarations.|
|`.hljs-type.struct_.declaration__`|Struct type declarations.|
|`.hljs-type.code_`|The `Code` type.|
|`.hljs-type.void_`|The `void` type.|
|`.hljs-type.baked_`|Types on parameters that are being baked (`$`-prefixed).|
|`.hljs-type.asm_`|Register types: `reg`, `gpr` and `vec`.|

### Enums
| CSS class | Definition |
|-|-|
|`.hljs-title.enum_.declaration__`|Enum variable declaration.|

### Structs
| CSS class | Definition |
|-|-|
|`.hljs-title.class_.declaration__`|Struct variable declaration.|
|`.hljs-title.class_.inherited__`|`#as` fields.|

### Procs/Functions
| CSS class | Definition |
|-|-|
|`.hljs-title.function_`|Proc/Function call.|
|`.hljs-title.function_.printLike__`|Known stdLib procs marked with `@PrintLike`, enabling substitution marker highlighting.|
|`.hljs-title.function_.declaration__`|Proc/Function declaraion.|
|`.hljs-params.declaration_`|All proc parameter declarations in the proc signature.|

#### Specials
| CSS class | Definition |
|-|-|
|`.hljs-title.function_.forExpansion__`|`for_expansion` special function name.|
|`.hljs-title.function_.operatorProc__`|`operator` special function name.|

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
|`.hljd-params`|All `#import` or `#module_parameters` parameters.|
|`.hljs-params.moduleOrProgram_`|The module or program parameters in either an import directive or the `#module_parameters` directive.|
|`.hljs-params.moduleOrProgram_.declaration__`|The module or program parameters in the `#module_parameters` directive.|
|`.hljs-meta.directive_.module_parameters__`|The `#module_parameters` directive.|
|`.hljs-meta.directive_.module_parameters__.block___`|The block that is optionally part of the `#module_parameters` directive, where things to be used in the module parameters are defined.|

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
