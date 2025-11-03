repeat :: (s: string, n: int) -> string {
	if !n  return "";


	result: String_Builder;
	init_string_builder(*result);
	for 0..n-1 {
		append(*result, s);
	}
	return builder_to_string(*result);
};

// Build pattern so a.b.c -> a.b_.c__
scopeToCSSClass :: (scope: string, noPrefix := false) -> string {
	parts := split(scope, ".");
	build: String_Builder;
	init_string_builder(*build);
	if !noPrefix {
		append(*build, ".hljs-");
	}
	prevPart := "";
	for part, i: parts {
		if i > 0 {
			append(*build, ".");
		}
		underscores := repeat("_", i,, temp);
		name := part;
		if (prevPart == "stdLib"
			|| prevPart == "symbol" && (
				part[0] <= #char "_"
			)
		) {
			name = "*";
			underscores = "";
		}
		append(*build, name);
		append(*build, underscores);
		prevPart = part;
	}
	return replace(builder_to_string(*build), ".*", "*");
};

scopeFromCSSClass :: (cssClass: string, noPrefix := false) -> string {
	scope := cssClass;
	if (!noPrefix) {
		scope = advance(scope, 6);
	}

	scope = replace(
		replace(
			replace(
				replace(
					replace(
						replace(
							scope,
							"_",
							""
						),
						"builtin",
						"built_in"
					),
					"moduleparameters",
					"module_parameters"
				),
				"stdLib",
				"stdLib.*"
			),
			".<module>",
			""
		),
		".<flag>",
		""
	);

	if contains(scope, "symbol.") && (scope.count == 7 || scope[7] <= #char "_") {
		scope = replace(scope, "symbol.", "symbol.*");
	}

	return scope;
}

Var :: struct {
	base: string;
	suffix: string;
	path: [..]string;
	line: int;
}

collectScopesFromCSS :: (lines: []string, debug: bool) -> ([]string, []Var) {
	vars: [..]Var;

	seenScopes: Table(string, int);
	init(*seenScopes);
	indentCount := 0;

	STACK_SIZE :: 10;
	operatorStack: [STACK_SIZE]string;
	stackTop := 0;

	push :: (stack: *[STACK_SIZE]string, s: string, top: *int) {
		stack.*[top.*] = s;
		top.* += 1;
	};
	pop :: (top: *int, n: int = 1) {
		top.* -= n;
	};
	reset :: (top: *int) {
		top.* = 0;
	};
	stackScope :: (stack: [STACK_SIZE]string, top: int) -> string {
		result: String_Builder;
		init_string_builder(*result);
		for 0..top - 1 {
			if starts_with(stack[it], "& ") {
				reset(*result);
				cssVar := advance(stack[it], 2);
				if cssVar[0] == #char ">"  advance(*cssVar, 2);
				advance(*cssVar, ifx starts_with(cssVar, ".hljs-") 6 else 1);
				cssVar.count = find_index_from_left(cssVar, #char " ");
				append(*result, cssVar);
				continue;
			}


			if it > 0 {
				append(*result, ".");
			}
			append(*result, stack[it]);
		}
		return builder_to_string(*result);
	};

	for line, lineNum: lines {
		trimmed := line;
		indentCount = 0;
		while trimmed.count > 0 && trimmed[0] == #char "\t" {
			advance(*trimmed, 1);
			indentCount += 1;
		}

		if trimmed == "}" {
			if debug  print("%\n", replace(line, "\t", "  "), to_standard_error=true);
			pop(*stackTop);
		} else if starts_with(trimmed, ".hljs-") || starts_with(trimmed, "&.") {
			spaceIdx := find_index_from_left(trimmed, " ");
			if spaceIdx == -1 {
				spaceIdx = line.count;
			}
			size := ifx starts_with(trimmed, ".hljs-") 6 else 2;
			scope := slice(trimmed, size, spaceIdx - size);
			colonIdx := find_index_from_left(scope, ":");
			if colonIdx != -1 {
				scope.count = colonIdx;
			}
			push(*operatorStack, scope, *stackTop);
			if debug  print("%1%\n", repeat("  ", indentCount), scope, to_standard_error=true);
			fullScope := stackScope(operatorStack, stackTop);
			duplicate, origLine := table_find(*seenScopes, fullScope);
			if (duplicate) {
				print("Warning: Duplicate scope found on line %: % (first defined on line %)\n", lineNum + 1, fullScope, origLine + 1, to_standard_error=true);
			} else {
				table_add(*seenScopes, fullScope, lineNum);
			}
		} else if starts_with(trimmed, "& > .hljs-") {
			special := advance(trimmed, 10);
			special.count = find_index_of_any_from_left(special, " ,:");
			if (!table_find(*seenScopes, special)) {
				table_add(*seenScopes, special, lineNum);
			}
			if ends_with(trimmed, "{") {
				push(*operatorStack, trimmed, *stackTop);
			}
			if debug  print("%1%\n", repeat("  ", indentCount), special, to_standard_error=true);
		} else if ends_with(trimmed, "{") {
			push(*operatorStack, trimmed, *stackTop);
			if debug  print("%(%)\n", repeat("  ", indentCount), trimmed, to_standard_error=true);
		} else {
			dashIdx := find_index_from_left(trimmed, "--");
			if dashIdx != -1 {
				cssVar := advance(trimmed, dashIdx);
				commaIdx := find_index_of_any_from_left(cssVar, ",:)");
				if cssVar[commaIdx] == #char "," {
					cssVar.count = commaIdx;
					var := New(Var, false);
					split := find_index_from_right(cssVar, #char "-");
					var.base = copy_string(.{split, cssVar.data});
					var.suffix = copy_string(.{cssVar.count - var.base.count - 1, cssVar.data + var.base.count + 1});
					var.line = lineNum;
					advance(*trimmed, dashIdx + commaIdx + 1);
					dashIdx = find_index_from_left(trimmed, "--");
					pathStr := advance(trimmed, dashIdx);
					while 1 {
						commaIdx = find_index_of_any_from_left(pathStr, ",:)");
						dashIdx = find_index_from_left(pathStr, "--", commaIdx + 1);
						array_add(*var.path, copy_string(.{commaIdx - var.suffix.count - 1, pathStr.data}));
						if dashIdx == -1  break;
						advance(*pathStr, dashIdx);
					}
					array_add(*vars, var);
					if debug  print("%1%\n", repeat("  ", indentCount), var.*, to_standard_error=true);
				}
			}
		}
	}

	seen: [..]string;
	array_reserve(*seen, lines.count);
	for 0..lines.count - 1 {
		array_add(*seen, "---");
	}
	for n, scope: seenScopes {
		seen[n] = scope;
	}
	return seen, vars;
};

verifyScopesInCSS :: (langScopes: []string, cssLines: []string, debug := false, expectedFromCSS: []string, expectedExtra: ..string) -> []Var {
	cssScopes, vars := collectScopesFromCSS(cssLines, debug);
	reported: [..]string;
	print("\n#Scopes missing from CSS:\n");
	for langScopes {
		cssClass := scopeToCSSClass(it, true);
		if contains(cssClass, "*") {
			parts := split(cssClass, "*");
			for cssScope: cssScopes {
				if starts_with(cssScope, parts[0]) && ends_with(cssScope, parts[1]) {
					cssClass = "";
					break;
				}
			}

			if cssClass && !array_find(reported, cssClass) {
				array_add(*reported, cssClass);
				if array_find(expectedFromCSS, cssClass) {
					print("(%)\n", cssClass);
				} else {
					print("%\n", cssClass);
				}
			}

			continue;
		}


		if !array_find(cssScopes , cssClass) && !array_find(reported, cssClass) {
			array_add(*reported, cssClass);
			if array_find(expectedFromCSS, cssClass) {
				print("(%)\n", cssClass);
			} else {
				print("%\n", cssClass);
			}
		}
	}

	array_reset(*reported);
	print("\n#Extra CSS scopes:\n");
	for cssScopes {
		if it == "---" || contains(it, "<")  continue;


		scope := scopeFromCSSClass(it, true);
		if contains(scope, "*") {
			parts := split(scope, "*");
			for langScope: langScopes {
				if starts_with(langScope, parts[0]) && ends_with(langScope, parts[1]) {
					scope = "";
					break;
				}
			}

			if scope && !array_find(reported, scope) {
				array_add(*reported, scope);
				if array_find(expectedExtra, it) {
					print("(%)\n", it);
				} else {
					print("%: %\n", FormatInt.{value=it_index + 1, minimum_digits=4, padding=95}, it);
				}
			}

			continue;
		}


		if !array_find(langScopes , scope) && !array_find(reported, scope) {
			array_add(*reported, scope);
			if array_find(expectedExtra, it) {
				print("(%)\n", it);
			} else {
				print("%: %\n", FormatInt.{value=it_index + 1, minimum_digits=4, padding=95}, it);
			}
		}
	}

	for < cssScopes {
		if it == "---"  remove it;
	}
	write_entire_file("css", join(..quick_sort(cssScopes, compare_strings), separator="\n"));

	return vars;
};

verifyCSSClassesInReference :: (langScopes: []string, ref: string, expected: []string, extra: ..string) -> []string {
	reported: [..]string;
	print("\n#CSS classes missing from reference:\n");
	for line: langScopes {
		if (line == "") {
			continue;
		}


		cssClass := scopeToCSSClass(line);
		if contains(cssClass, "*") {
			cssClass = replace(cssClass, "*", ifx contains(cssClass, "symbol") ".<flag>_" else ".<module>__",, temp);
		}
		if !contains(ref, tprint("|`%`|", cssClass)) {
			if array_find(reported, cssClass)  continue;
			array_add(*reported, cssClass);
			if array_find(expected, cssClass) {
				print("(%)\n", cssClass);
			} else {
				print("%\n", cssClass);
			}
		}
	}

	array_reset(*reported);
	print("\n#Extra CSS classes in reference:\n");
	refLines := split(ref, "\n");
	for refLine: refLines {
		line := eat_spaces(refLine);
		if !starts_with(line, "|`.hljs-")  continue;
		endIdx := find_index_from_left(line, "|", 1);
		cssClass := slice(line, 2, endIdx - 3);
		scope := scopeFromCSSClass(cssClass);
		if contains(scope, "*") {
			parts := split(scope, "*");
			for langScope: langScopes {
				if starts_with(langScope, parts[0]) && ends_with(langScope, parts[1]) {
					scope = "";
					break;
				}
			}

			if scope && !array_find(reported, scope) {
				array_add(*reported, scope);
				if array_find(extra, cssClass) {
					print("(%)\n", cssClass);
				} else {
					print("%: %\n", FormatInt.{value=it_index + 1, minimum_digits=4, padding=95}, cssClass);
				}
			}

			continue;
		}


		if !array_find(reported, cssClass) && !array_find(langScopes, scope) {
			array_add(*reported, cssClass);
			if array_find(extra, cssClass) {
				print("(%)\n", cssClass);
			} else {
				print("%: %\n", FormatInt.{value=it_index + 1, minimum_digits=4, padding=95}, cssClass);
			}
		}
	}

	return refLines;
}

findVar :: (vars: []Var, base: string, suffix: string) -> bool {
	i := 0;
	while i < vars.count {
		defer i += 5;
		if vars[i].base != base {
			continue;
		}


		for 0..4 {
			if vars[i + it].suffix == suffix  return true;
		}
	}


	return false;
}

verifyCSSVarsInReference :: (vars: []Var, ref: string, refLines: []string, expectedPathDiffs: []string, expectedExtra: ..string) {
	suffixes := string.["fg", "bg", "style", "weight", "decoration"];
	assert(vars.count % 5 == 0);
	for 0..vars.count / 5 - 1 {
		i := it * 5;
		base := vars[i].base;
		for suffix: suffixes {
			assert(vars[i].base == base && vars[i].suffix == suffix);
			i += 1;
		}
	}

	reported: [..]string;
	print("\n#CSS variables missing from reference:\n");
	for var: vars {
		base := var.base;
		found, remaining := contains(ref, tprint("|`%`|", base));
		if found {
			eol := find_index_from_left(remaining, #char "\n");
			path := join(..var.path, separator = "`=>`");
			validPathAt := find_index_from_left(remaining, join("`", path, "`"));
			if validPathAt == -1 || validPathAt > eol {
				line := slice(remaining, 0, eol);
				advance(*line, find_index_from_right(line, "|`") + 2);
				line.count -= 2;
				print("%-% has incorrect path\n    ;should be: `%`\n    ;  but was: `%`\n", base, var.suffix, path, line);
			}
		} else {
			if array_find(reported, base)  continue;
			array_add(*reported, base);
			print("|`%`||`%`|\n", base, join(..var.path, separator = "`=>`"));
		}
	}

	array_reset(*reported);
	print("\n#Extra CSS variables in the reference:\n");
	for line: refLines {
		if starts_with(line, "|`--") {
			base := advance(line, 2);
			base.count = find_index_from_left(base, #char "`");
			for suffix: suffixes {
				if !findVar(vars, base, suffix) {
					var := join(base, suffix, separator = "-");
					if !array_find(reported, var) {
						array_add(*reported, var);
						test := var;
						test.count = find_index_from_right(var, #char "-");
						if array_find(expectedExtra, test) {
							print("(%)\n", var);
						} else {
							print("%: %\n", FormatInt.{value=it_index + 1, minimum_digits=4, padding=95}, var);
						}
					}
				}
			}
		}
	}
};

main :: () {
	cssStr := read_entire_file("src/styles/jaiEverything.css");
	refStr := read_entire_file("css-class-reference.md");
	scopesStr := read_entire_file("langScopes");

	css := split(cssStr, "\n");
	langScopes := split(scopesStr, "\n");

	vars := verifyScopesInCSS(
		langScopes,
		css,
		//true,	// Debug css parse.
		expectedFromCSS = .["_BalancedBraces"],
		"built_in",
		"comment",
		"keyword",
		"_BalancedParens",
		"number.prefix__",
		"operator.asm_",
		"operator.asm_.size__",
		"params",
		"string.path_",
		"symbol",
		"symbol.size_",
		"title",
		"title.class_",
		"type.enum_",
		"type.integer_",
		"literal.bool_"
	);

	refLines := verifyCSSClassesInReference(
		langScopes,
		refStr,
		.[],
		".hljs-comment",
		".hljs-keyword",
		".hljs-symbol.size_",
		".hljs-type.integer_",
		".hljs-type.enum_",
		".hljs-symbol",
		".hljs-symbol.<flag>_",
		".hljs-_BalancedParens",
		".hljs-_BalancedBraces",
		".hljs-literal.bool_"
	);

	verifyCSSVarsInReference(vars, refStr, refLines, .[], "--declaration");
};

#import "Basic";
#import "Hash_Table";
#import "File";
#import "Sort";
#import "String";
