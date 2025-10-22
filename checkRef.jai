repeat :: (s: string, n: int) -> string {
	result: String_Builder;
	init_string_builder(*result);
	for 0..n {
		append(*result, s);
	}
	return builder_to_string(*result);
};

main :: () {
	css := read_entire_file("src/styles/jaiEverything.css");
	ref := read_entire_file("css-class-reference.md");
	scopes := read_entire_file("css");

	seenScopes: Table(string, bool);
	init(*seenScopes);
	lines := split(css, "\n");
	lastSeenScope := "";
	lastSeenIndent := 0;
	indentCount := 0;
	for line: lines {
		trimmed := line;
		indentCount = 0;
		while trimmed.count > 0 && trimmed[0] == #char "\t" {
			advance(*trimmed, 1);
			indentCount += 1;
		}

		if starts_with(trimmed, ".hljs-") {
			spaceIdx := find_index_from_left(trimmed, " ");
			if spaceIdx == -1 {
				spaceIdx = line.count;
			}
			scope := slice(trimmed, 6, spaceIdx - 6);
			lastSeenScope = scope;
			if (!table_find(*seenScopes, scope)) {
				table_add(*seenScopes, scope, true);
			}
		} else if starts_with(trimmed, "&.") {
			spaceIdx := find_index_from_left(trimmed, " ");
			if spaceIdx == -1 {
				spaceIdx = line.count;
			}

			if lastSeenIndent == indentCount {
				dotIdx := find_index_from_right(lastSeenScope, ".");
				if dotIdx != -1 {
					lastSeenScope.count = dotIdx;
				} else {
					assert(false, "Unexpected no parent scope!");
				}
			} else if lastSeenIndent > indentCount{
				for indentCount..lastSeenIndent-1 {
					dotIdx := find_index_from_right(lastSeenScope, ".");
					lastSeenScope.count = dotIdx;
				}
			}

			scope := tprint("%.%", lastSeenScope, slice(trimmed, 2, spaceIdx - 2));
			lastSeenScope = scope;
			lastSeenIndent = indentCount;
			if (!table_find(*seenScopes, scope)) {
				table_add(*seenScopes, scope, true);
			}
		}
	}

	lines = split(scopes, "\n");
	for line: lines {
		if (line == "") {
			continue;
		}


		// Build pattern so a.b.c -> a.b_.c__
		parts := split(line, ".");
		build: String_Builder;
		init_string_builder(*build);
		append(*build, ".hljs-");
		for part, i: parts {
			if i > 0 {
				append(*build, ".");
			}
			underscores := repeat("_", i,, temp);
			append(*build, part);
			append(*build, underscores);
		}
		append(*build, "`");
		re := builder_to_string(*build);
		if !contains(ref, re) {
			print("%\e[K\r", line);
			if (!(contains(line, "stdLib") || contains(line, "symbol."))) {
				print("\n");
			}
		}
	}

	//TODO: \b--[A-Za-z0-9-]+(?=-[a-z]+\b) | foreach line: if !contains(ref, "|\`$line\`|") { print(line); }
};

#import "Basic";
#import "Hash_Table";
#import "File";
#import "String";
