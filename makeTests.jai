JAI_VERSION :: #run compiler_get_version_info(null);

main :: () {
	hljsVersion := "11.11.1";
	template, ok := read_entire_file("../highlight.js/package.json");
	if ok {
		advance(*template, find_index_from_left(template, "\"version\""));
		advance(*template, 12);	// "version": "

		hljsVersion = slice(template, 0, find_index_from_left(template, "\""));
	}

	template, ok = read_entire_file("indexTemplate.html");
	assert(ok);


	files: [..]string;
	assert(
			visit_files(
			"../highlight.js/src/styles",
			false,
			*files,
			(info, list) => {
				if !ends_with(info.short_name, ".css")  return;


				array_add(
					list,
					copy_string(slice(info.short_name, 0, info.short_name.count - 4))
				);
			},
			visit_directories = true
		)
	);


	sorted := quick_sort(files, compare_strings);

	parts := split(template, "~");
	if array_find(get_command_line_arguments(), "-debug") {
		parts[0] = replace(
			replace(
				parts[0],
				"https://unpkg.com/@highlightjs/cdn-assets@11.11.1/highlight.min.js",
				"../../localHilightDebug.js"
			),
			"../../dist/jai.min.js",
			"../../src/languages/jai.js"
		);
		print("~%~", parts[2]);
		parts[2] = replace(
			replace(
				parts[2],
				"dist/styles/",
				"src/styles/"
			),
			"// first:",
			"jaiDebug.debugInit();"
		);
		print("~%~", parts[2]);
	}

	builder: String_Builder;
	append(*builder, parts[0]);
	for sorted {
		append(*builder, replace(parts[1], "$", it));
	}
	append(*builder, parts[2]);
	template = builder_to_string(*builder);

	parts = split(template, "%");
	append(*builder, parts[0]);
	for sorted {
		append(*builder, replace(parts[1], "$", it));
	}
	append(*builder, parts[2]);
	template = builder_to_string(*builder);

	outputPath := path_join(get_working_directory(), "test", "visualTests");
	assert(make_directory_if_it_does_not_exist(outputPath));


	result, raw_path, err := run_command("where.exe", "jai.exe", capture_and_return_output=true);
	assert(result.type == .EXITED, err);


	path_overwrite_separators(raw_path, #char "/");
	raw_path = trim(raw_path);
	path := split(raw_path, "/");

	pop(*path);	// jai.exe or jai
	pop(*path);	// bin

	basePath := join(..path, "/");
	assert(set_working_directory(basePath));


	if !is_directory("modules") {
		print("Error: 'modules' directory not found in current working directory!\n");
		exit(1);
	}


	prefixLen := basePath.count + 1;

	array_reset(*files);
	assert(
		visit_files(
			basePath,
			recursive = true,
			*files,
			(info, list) => {
				if !ends_with(info.full_name, ".jai")  return;

				array_add(list, copy_string(info.full_name));
			}
		)
	);


	sorted = quick_sort(files, compare_strings);

	parts = split(template, "^");
	print(*builder, parts[0]);
	for sorted {
		file := advance(it, prefixLen);
		print(
			*builder,
			replace(
				replace(
					parts[1],
					"$",
					replace(file, "/", "$")
				),
				"*",
				file
			)
		);
	}
	print(*builder, parts[2]);
	template = builder_to_string(*builder);

	index := path_join(outputPath, "index.html");

	assert(write_entire_file(index, template));


	print("\n%\n", index);

	for sorted {
		//push_allocator(temp);
		//auto_release_temp();

		code, ok := read_entire_file(it);
		assert(ok);


		end := "";
		if code.count && code[code.count-1] != #char "\n" {
			end = ifx contains(code, #char "\r") "\r\n" else "\n";
		}
		reset_temporary_storage();

		title := advance(it, prefixLen);
		print("%\n", title);
		path_overwrite_separators(title, "/");
		path := path_join(outputPath, replace(title, "/", "$"));
		assert(write_entire_file(path, join(code, end)));
	}
}

#import "Basic";
#import "Compiler";
#import "File";
#import "File_Utilities";
#import "Process";
#import "Sort";
#import "String";
