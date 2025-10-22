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

	//TODO: verify all scopes covered by css.  Needs a nesting-aware search.

	lines := split(scopes, "\n");
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
#import "File";
#import "String";
