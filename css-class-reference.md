# CSS Class Reference
## For the jai language

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

  |Tag| CSS class | Definition |
  |-|-|-|
  |`BUG:`|`.hljs-doctag.bug_`|Marks a bug that needs attention.|
  |`FIXME:`|`.hljs-doctag.fixme_`|Marks something that needs fixing.|
  |`HACK:`|`.hljs-doctag.hack_`|Marks something dodgy or unusual.|
  |`LABEL:`|`.hljs-doctag.label_`|A label.|
  |`LATER:`|`.hljs-doctag.later_`|Marks something we need to come back to later.|
  |`MAYBE:`|`.hljs-doctag.maybe_`|A thought we aren't sure about yet.|
  |`NO_CHECKIN:`|`.hljs-doctag.no_checkin_`|For repos with the right hooks set up, blocks commits till this is resolved & removed.|
  |`NOTE:`|`.hljs-doctag.note_`|Something important to take note of.|
  |`OPTIMISE:`|`.hljs-doctag.optimise_`|Something we really should come back and optimise.|
  |`OPTIMIZE:`|`.hljs-doctag.optimize_`|Same as above, but for Americans.|
  |`QUESTION:`|`.hljs-doctag.question_`|An outstanding question that needs an answer.|
  |`TEST:`|`.hljs-doctag.test_`|Marks something that still needs to be tested.|
  |`TODO:`|`.hljs-doctag.todo_`|Marks something we need to come back and do.|
  |`XXX:`|`.hljs-doctag.xxx_`|Marks a hack or a bug that needs attention.|
</details>

### Literals
| CSS class | Definition |
|-|-|
|`.hljs-literal`|All literals, but specifically including `null`.|
|`.hljs-literal.bool_`|`true` and `false`|

### Numbers
| CSS class | Definition |
|-|-|
|`.hljs-number`|Numbers of any kind.|
|`.hljs-number.binary`|Numbers specified in binary via the `0b` prefix.|
|`.hljs-number.hex`|Numbers specified in hex via the `0x` prefix.|
|`.hljs-number.hexFloat`|Floats specified in hex via the `0h` prefix.|

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
|`.hljs-operator.bitwise_`|Bitwise operators.|
|`.hljs-operator.shift_`|Bit-shift operators.|
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
|`.hljs-punctuation.hash_.directive__`|`#`|

### Variables
| CSS class | Definition |
|-|-|
|`.hljs-variable`|All variables.|
|`.hljs-variable.constant_`|All constants (`ALL_UPPER`).|
|`.hljs-variable.constant_.declaration__`|A constant being defined.|
|`.hljs-variable.constant_.enum__`|An enum value reference (`.ALL_UPPER`)|
|`.hljs-variable.context_`|Fields on the context (`thread_index`, `allocator` et al).|
|`.hljs-variable.context_.constant__`|Constants on the context (`default_allocator`).|
|`.hljs-variable.declaration_`|A variable being defined.|
|`.hljs-variable.language_`|Language-special variables - `context`, `temp`, `it`, `it_index`.|
|`.hljs-punctuation.backslash_`|Mid-identifier alignment backslash, e.g. `my_var\   _name`|
|`.hljs-variable.param_.baked__`|A proc parameter that is being baked (`$`-prefixed).|

### Types
| CSS class | Definition |
|-|-|
|`.hljs-type`|All types (`TitleCase`)|
|`.hljs-type.declaration_`|A type being defined.|
|`.hljs-type.any_`|The `Any` type.|
|`.hljs-type.type_`|The `Type` and `Type_Info` types.|
|`.hljs-type.bool_`|The `bool` type.|
|`.hljs-type.float_`|`float` and `float64`, as well as the common aliases of `f32` and `f64`.|
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
|`.hljs-punctuation.clue_.asm__.size___`|`?` in `#asm` after mnemonics to specify data witdh based on a variable or type.|
|`.hljs-punctuation.dot_.asm__.size___`|`.` in `#asm` after mnemonics to specify data witdh based a literal number.|
|`.hljs-meta.keyword_.asm__.register___`||

### Other
| CSS class | Definition |
|-|-|
|`.hljs-_BalancedParens`|Used in a few places that need exactly balanced `()`s, such as casts or module/program parameters.|

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
