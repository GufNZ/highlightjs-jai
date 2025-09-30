Mod :: struct {
	vars: [..]string;
	types: [..]string;
	procs: [..]string;
	const: [..]string;
	special: [..]string;
	namespaces: [..]string;
}

main :: () {
	if !is_directory("modules") {
		print("Error: 'modules' directory not found in current working directory!\n");
		exit(1);
	}


	table: Table(string, Mod);

	print("const STDLIB = {\n");

	files: [..]string;
	visit_files(
		"modules",
		false,
		*files,
		(info, list) => {
			array_add(
				list,
				ifx info.is_directory
					sprint("%/module.jai", info.full_name)
				else
					copy_string(info.full_name));
		},
		visit_directories = true
	);

	//NOTE: this will exclude things where the #import has a subpath, like Android/GLES, on purpose, to cut down on noise.
	for path: files {
		name := advance(path, 8);
		name.count = find_index_of_any_from_left(name, "./");
		if name == "Toolchains"	 continue;	// Not a real module.


		print("In module '%':\n", name, to_standard_error=true);
		mod := find_or_add(*table, name);
		subMod: Mod;
		if parseModule(path, name, *subMod) {
			for subMod.procs {
				array_add_if_unique(*mod.procs, it);
			}
			for subMod.types {
				array_add_if_unique(*mod.types, it);
			}
			for subMod.vars {
				array_add_if_unique(*mod.vars, it);
			}
			for subMod.const {
				array_add_if_unique(*mod.const, it);
			}
			for subMod.special {
				mergeSpecials(mod, it);
			}
		} else {
			print("  !Skipping file '%'\n", path, to_standard_error=true);
		}
	}

	keys: [..] string;
	for table {
		array_add(*keys, it_index);
	}
	quick_sort(keys, compare_strings);

	for keys {
		name := it;
		_, mod := table_find_new(*table, name);
		if mod.procs.count {
			print("  'built_in.stdLib.%': [\n", name);
			for mod.procs {
				print("    '%',\n", it);
			}
			print("  ],\n");
		}
		if mod.types.count {
			print("  'type.stdLib.%': [\n", name);
			for mod.types {
				print("    '%',\n", it);
			}
			print("  ],\n");
		}
		if mod.vars.count {
			print("  'variable.stdLib.%': [\n", name);
			for mod.vars {
				print("    '%',\n", it);
			}
			print("  ],\n");
		}
		if mod.const.count {
			print("  'variable.stdLib.%.constant': [\n", name);
			for mod.const {
				print("    '%',\n", it);
			}
			print("  ],\n");
		}
		if mod.special.count {
			for mod.special {
				found, kind, names := split_from_left(it, #char "|");
				print("  '%': [\n", kind);
				list := split(names, ",");
				for list {
					print("    '%',\n", it);
				}
				print("  ],\n");
			}
		}
	}

	print("}\n");
}

PRIMITIVES :: string.[
	"bool",
	"u8", "u16", "u32", "u64", "U128",
	"s8", "s16", "s32", "s64", "S128",
	"float", "float64",
	"string",
	"Any",
	"Type", "Type_Info",
	"void",
	"#Context"
];

isPrimative :: (line: string) -> bool {
	for PRIMITIVES {
		if starts_with(line, it) && line[it.count] == #char ";" {
			return true;
		}
	}

	return false;
}

mergeSpecials :: (mod: *Mod, entry: string) {
	_, kind, namesStr := split_from_left(entry, #char "|");
	for mod.special {
		found, k, n := split_from_left(it, #char "|");
		if found && k == kind {
			names := split(n, ",");
			newNames := split(namesStr, ",");
			namesList: [..]string;
			for names {
				array_add(*namesList, it);
			}
			for newNames {
				array_add_if_unique(*namesList, it);
			}
			mod.special[it_index] = sprint("%|%", kind, join(..namesList, ","));
			return;
		}
	}

	array_add(*mod.special, entry);
}

appendSpecial :: (mod: *Mod, kind: string, name: string) {
	for mod.special {
		found, k, names := split_from_left(it, #char "|");
		if found && k == kind {
			mod.special[it_index] = sprint("%,%", mod.special[it_index], name);
			return;
		}
	}


	array_add(*mod.special, sprint("%|%", kind, name));
}

ModuleParams :: enum {
	NONE;
	MODULE;
	PROGRAM;
};

parseModule :: (path: string, name: string, mod: *Mod) -> bool {
	print("  Parsing file '%'\n", path, to_standard_error=true);
	content, success := read_entire_file(path);
	if contains(path, "ps5") || ends_with(path, "switch.jai") {
		print("    404 file '%'\n", path, to_standard_error=true);
		return false;
	} else {
		assert(success, "Unable to read file '%'", path);
	}


	lines := split(content, "\n");
	commentDepth := 0;
	public := true;
	inContext := false;
	staticIfDepth := 0;
	delimiters :: "/:#";
	skipCount := 0;
	for it, lineNum: lines {
		if skipCount > 0 {
			skipCount -= 1;
			continue;
		}


		line := it;	// Need a mutable copy.
		if line.count == 0  continue;


		if line[line.count - 1] == #char "\r"  line.count -= 1;
		if line.count == 0  continue;

		nextLine := false;
		if staticIfDepth {
			index := 0;
			while index < staticIfDepth << 2 {
				if starts_with(line, "#if") {
					if !ends_with(line, ";") {
						staticIfDepth += 1;
					}

					advance(*line, 1);
				} else if line[0] == #char "\t" {
					advance(*line, 1);
					index += 4;
				} else if line[0] == #char " " && line.count > 3 && line[1] == #char " " && line[2] == #char " " && line[3] == #char " " {
					advance(*line, 4);
					index += 4;
				} else if line[0] == #char "}" {
					advance(*line, 1);
					line = eat_spaces(line);
					if starts_with(line, "else") {
						nextLine = true;
						break;
					};


					staticIfDepth -= 1;
					break;
				} else {
					nextLine = true;
					break;
				}
			}
		}

		if nextLine  continue;


		index := find_index_of_any_from_left(line, delimiters);
		if inContext {
			if line == "}" {
				inContext = false;
			} else {
				line = eat_spaces(line);
				if starts_with(line, "//") {
					// Just a comment, ignore.
				} else {
					found, proc := split_from_left_by_any(line, " \t:");
					if found && proc {
						if proc == "default_allocator" {
							appendSpecial(mod, "variable.context.constant", proc);
						} else {
							appendSpecial(mod, "variable.context", proc);
						}
					}
				}
			}

			continue;
		}


		while index > -1 {
			defer index = find_index_of_any_from_left(line, delimiters);;

			if line[index] == #char "#" {
				if starts_with(line, "#if") {
					if !ends_with(line, ";") {
						staticIfDepth += 1;
					}

					advance(*line, 1);
					continue;
				} else if starts_with(line, "#scope_file") || starts_with(line, "#scope_module") {
					public = false;
					break;
				} else if starts_with(line, "#scope_export") {
					public = true;
					break;
				} else if starts_with(line, "#load") {
					file := advance(line, 7);
					file.count = find_index_from_left(file, #char "\"");
					file = join(path_strip_filename(path), file);
					print("    Loading file '%' : %\n", file, public, to_standard_error=true);
					if public {
						subMod: Mod;
						if parseModule(file, name, *subMod) {
							for subMod.procs {
								array_add_if_unique(*mod.procs, it);
							}
							for subMod.types {
								array_add_if_unique(*mod.types, it);
							}
							for subMod.vars {
								array_add_if_unique(*mod.vars, it);
							}
							for subMod.const {
								array_add_if_unique(*mod.const, it);
							}
							for subMod.special {
								mergeSpecials(mod, it);
							}
						} else {
							print("  !Skipping file '%'\n", file, to_standard_error=true);
						}
					}
					break;
				} else if starts_with(line, "#add_context") {
					advance(*line, 12);
					line = eat_spaces(line);
					found, proc := split_from_left_by_any(line, " \t:");
					if found && proc {
						appendSpecial(mod, sprint("variable.stdLib.%.context", name), proc);
					}
					break;
				} else if starts_with(line, "#module_parameters") {
					skipCount = processModuleParams(lineNum, content, name, mod);
					break;
				} else {
					break;	//QUESTION: is it safe toignore other preprocessor directives?
				}
			}


			if line[index] == #char "/" {
				if index + 1 < line.count {
					if line[index + 1] == #char "/" {
						// line comment; next line:
						break;
					} else if line[index + 1] == #char "*" {
						// block comment start:
						commentDepth += 1;
						advance(*line, index + 2);
						continue;
					} else if index && line[index - 1] == #char "*" {
						// block comment end:
						commentDepth -= 1;
						assert(commentDepth >= 0, "Unmatched block comment end in %", line);
						advance(*line, index + 1);
						if commentDepth  continue;


						index = find_index_of_any_from_left(line, "/:");
						if index == -1 {
							break;
						}
					} else {
						advance(*line, index + 1);
						continue;
					}
				} else if index && line[index - 1] == #char "*" {
					// block comment end:
					commentDepth -= 1;
					assert(commentDepth >= 0, "Unmatched block comment end in %", line);
					advance(*line, index + 1);
					if commentDepth  continue;


					index = find_index_of_any_from_left(line, delimiters);
					if index == -1 {
						break;
					}
				} else {
					advance(*line, index + 1);
					continue;
				}
			}


			if line[index] == ":" {
				if commentDepth || !public {
					// inside a block comment or non-public scope, ignore.
					break;
				}


				if !(starts_with(line, " ") || starts_with(line, "\t")) {
					if index + 1 < line.count && line[index + 1] == ":" {
						found, proc := split_from_left_by_any(line, " \t:");
						if found && proc {
							if starts_with(proc, "operator") && !starts_with(proc, "operator_") {
								print("    -Skipping %\n", line, to_standard_error=true);
								break;
							}

							advance(*line, index + 2);
							line = eat_spaces(line);
							isProc := line[0] == #char "(" || starts_with(line, "inline") || starts_with(line, "no_inline");
							if isProc {
								if proc == "get_plugin" && name != "Program_Print" {
									print("    <Skipping plugin %\n", name, to_standard_error=true);
									return false;
								}

								if !(proc == "main" || proc == "for_expansion") {
									array_add_if_unique(*mod.procs, proc);
								}
							} else if starts_with(line, "struct") || starts_with(line, "enum") || starts_with(line, "#type") || isPrimative(line) {
								array_add_if_unique(*mod.types, proc);

								if proc == "Context_Base" {
									inContext = true;
								}
							} else if starts_with(line, "#import") {
								print("    ?found namespace: % :: %\n", proc, line, to_standard_error=true);
								array_add_if_unique(*mod.namespaces, proc);
							} else {
								namespace := line;
								namespace.count = find_index_from_left(namespace, #char ".");
								if array_find(mod.namespaces, namespace) {
									print("    #Skipping assign from namespaced import % :: %\n", proc, line, to_standard_error=true);
									break;
								}


								alias := line;
								while is_alnum(alias[0])  alias.data += 1;
								alias.count = alias.data - line.data;
								alias.data = line.data;
								if array_find(mod.procs, alias) {
									array_add_if_unique(*mod.procs, proc);
								} else {
									array_add_if_unique(*mod.const, proc);
								}
							}


							break;
						}
					} else if find_index_from_left(line, #char "=") > -1 {
						found, var := split_from_left_by_any(line, " \t:");
						if found && var {
							array_add_if_unique(*mod.vars, var);
							break;
						} else {
							advance(*line, index + 2);
						}
					} else {
						break;
					}
				} else {
					break;
				}
			}
		}
	}

	return true;
}

processModuleParams :: (lineNum: int, content: string, name: string, mod: *Mod) -> int {
	auto_release_temp();

	lexer: Lexer;
	while lineNum {
		index := find_index_from_left(content, #char "\n");
		advance(*content, find_index_from_left(content, #char "\n") + 1);
		lineNum -= 1;
	}
	set_input_from_string(*lexer, content);
	while 1 {
		token := peek_next_token(*lexer);
		defer eat_token(*lexer);

		if token.type == #char "#" {
			eat_token(*lexer);
			token = peek_next_token(*lexer);
			if token.type == .IDENT && token.ident_value.name == "module_parameters" {
				break;
			}
		}
	}

	// Expecting a "("
	token := peek_next_token(*lexer);
	assert(token.type == #char "(", "Expected '(' but got '%' after #module_parameters in module '%'", ifx token.type < 256  string.{1, *token.type.(u8)} else tprint("%", token.type), name);
	eat_token(*lexer);
	parseDeclarations(*lexer, name, mod, ModuleParams.MODULE);
	token = peek_next_token(*lexer);
	if token.type == #char "(" {
		eat_token(*lexer);
		parseDeclarations(*lexer, name, mod, ModuleParams.PROGRAM);
	}

	return lexer.current_line_number - 1;
}

parseDeclarations :: (lexer: *Lexer, name: string, mod: *Mod, mode: ModuleParams) {
	token := peek_next_token(lexer);
	if token.type == #char ")" {
		eat_token(lexer);
		return;
	}


	depth := 1;	// We start after the first "("
	while depth {
		defer token = peek_next_token(lexer);

		if token.type == .END_OF_INPUT {
			assert(false, "Unexpected end of input in #module_parameters in module '%'", name);
		}

		if token.type == .IDENT {
			ident := copy_string(token.ident_value.name);
			appendSpecial(mod, tprint("variable.stdLib.%.%", name, ifx mode == .MODULE  "moduleParam" else "programParam"), ident);
			eat_token(lexer);
			token = peek_next_token(lexer);
			assert(token.type == #char ":", "Expected ':' but got '%' after identifier in #module_parameters in module '%'", ifx token.type < 256  string.{1, *token.type.(u8)} else tprint("%", token.type), name);
			while (depth-1) || token.type != #char "," {
				eat_token(lexer);
				token = peek_next_token(lexer);
				if token.type == #char "(" || token.type == #char "{" || token.type == #char "[" || token.type == .BEGIN_ARRAY_LITERAL || token.type == .BEGIN_STRUCT_LITERAL {
					depth += 1;
				} else if token.type == #char ")" || token.type == #char "}" || token.type == #char "]" {
					depth -= 1;
					if !depth {
						break;
					}
				}
			}


			eat_token(lexer);
		} else {
			assert(false, "Unexpected token '%' in #module_parameters in module '%'", ifx token.type < 256  string.{1, *token.type.(u8)} else tprint("%", token.type), name);
		}
	}
}

//#run main();

#import "Basic";
#import "File";
#import "File_Utilities";
#import "Hash_Table";
#import "Jai_Lexer";
#import "Sort";
#import "String";
