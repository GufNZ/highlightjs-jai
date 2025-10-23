repeat :: (s: string, n: int) -> string {
	if !n  return "";


	result: String_Builder;
	init_string_builder(*result);
	for 0..n-1 {
		append(*result, s);
	}
	return builder_to_string(*result);
};

collectScopesFromCSS :: (lines: []string, debug: bool) -> ([]string, []string) {
	vars: [..]string;

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
				var := advance(trimmed, dashIdx);
				commaIdx := find_index_of_any_from_left(var, ",:)");
				if var[commaIdx] == #char "," {
					var.count = commaIdx;
					array_add(*vars, var);
					if debug  print("%1%\n", repeat("  ", indentCount), var, to_standard_error=true);
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
		if prevPart == "stdLib" || prevPart == "symbol" {
			print("%->*\n", part, to_standard_error=true);
			name = "*";
		}
		append(*build, name);
		append(*build, underscores);
		prevPart = part;
	}
	return builder_to_string(*build);
};

scopeFromCSSClass :: (class: string, noPrefix := false) -> string {
	scope := class;
	if (!noPrefix) {
		scope = advance(scope, 6);
	}

	return replace(
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
		"symbol.",
		"symbol.*"
	);
}

verifyScopesInCSS :: (langScopes: []string, cssLines: []string, debug := false) -> []string {
	cssScopes, vars := collectScopesFromCSS(cssLines, debug);
	print("\nScopes missing from CSS:\n");
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

			if cssClass {
				print("%\n", cssClass);
			}

			continue;
		}


		if !array_find(cssScopes , cssClass) {
			print("%\n", cssClass);
		}
	}

	print("\nExtra CSS scopes:\n");
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

			if !scope {
				print("%\n", it);
			}

			continue;
		}


		if !array_find(langScopes , scope) {
			print("%\n", it);
		}
	}

	return vars;
};

verifyCSSClassesInReference :: (scopes: []string, ref: string) {
	print("\nCSS classes missing from reference:\n");
	for line: scopes {
		if (line == "") {
			continue;
		}


		cssClass := scopeToCSSClass(line);
		if !contains(ref, tprint("|`%`|", cssClass)) {
			print("%\n", line);
		}
	}
}

verifyCSSVarsInReference :: (vars: []string, ref: string) {
	print("\nCSS variables missing from reference:\n");
	for var: vars {
		if !var  continue;
		if !contains(ref, tprint("|`%`|", var)) {
			print("%\n", var);
		}
	}
};

main :: () {
	cssStr := read_entire_file("src/styles/jaiEverything.css");
	refStr := read_entire_file("css-class-reference.md");
	scopesStr := read_entire_file("langScopes");

	css := split(cssStr, "\n");
	scopes := split(scopesStr, "\n");

	vars := verifyScopesInCSS(scopes, css);

	verifyCSSClassesInReference(scopes, refStr);

	verifyCSSVarsInReference(vars, refStr);
};

#import "Basic";
#import "Hash_Table";
#import "File";
#import "String";
