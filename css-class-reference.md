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
  |`REMINDER:`|`.hljs-doctag.reminder_`|A reminder about something important.|
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
|`.hljs-keyword.for_`|`for`, `while` and `remove`.|
|`.hljs-keyword.if_`|`if`, `then`, `else`, `case` and `ifx`.|
|`.hljs-keyword.meta_`|`using`, `is_constant`, `type_of`, `size_of`, `code_of` and `initializer_of`.|
|`.hljs-keyword.proc_`|`interface`, `inline` and `no_inline`.|
|`.hljs-keyword.struct_`|`struct` and `union`.|

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
|`.hljs-punctuation.forExpansionInvoke_`|The `:` before a **for_expansion** name.|
|`.hljs-punctuation.hash_.directive__`|`#`|
|`.hljs-punctuation.clue_.asm__.size___`|`?` in `#asm` after mnemonics to specify data witdh based on a variable or type.|
|`.hljs-punctuation.dot_.asm__.size___`|`.` in `#asm` after mnemonics to specify data witdh based a literal number.|

punctuation.backslash
variable
variable.constant
variable.constant.declaration
variable.constant.enum
variable.context
variable.context.constant
variable.declaration
variable.language
variable.param.baked

type
type.any
type.asm
type.baked
type.bool
type.code
type.context
type.declaration
type.enum
type.enum.declaration
type.enum.value.declaration
type.float
type.integer.signed
type.integer.unsigned
type.string
type.type
type.void

title.class.declaration
title.class.inherited
title.function
title.function.declaration
title.function.forExpansion

built_in.special	for_expansion

meta
meta.note

meta.directive
meta.directive.modifier

meta.directive.load
string.path.load

meta.directive.import
string.path.import
meta.directive.module_parameters
params.moduleOrProgram

meta.asm
meta.directive.asm
meta.directive.asm.block
meta.directive.asm.flag
meta.directive.asm.flags

_BalancedParens
