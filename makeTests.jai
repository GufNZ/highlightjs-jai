JAI_VERSION :: #run compiler_get_version_info(null);

INDEX_HTML :: #string HTML
<!DOCTYPE html>
<html>
<head>
	<title>Jai for highlight.js</title>
</head>
<body>
{}
</body>
</html>
HTML;

main :: () {
	template, ok := read_entire_file("indexTemplate.html");
	assert(ok);

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


	indexBuilder: String_Builder;
	data: struct {
		outputPath: string;
		template: string;
		basePathCount: int;
		prevFile: string;
		indexHtml: *String_Builder;
	} = .{outputPath, template, basePath.count, "", *indexBuilder};

	assert(
		visit_files(
			basePath,
			recursive = true,
			*data,
			(info, data) => {
				if !ends_with(info.full_name, ".jai")  return;

				//push_allocator(temp);
				//auto_release_temp();

				code, ok := read_entire_file(info.full_name);
				assert(ok);
				title := advance(info.full_name, data.basePathCount);
				print("%\n", title);
				path_overwrite_separators(title, "/");
				test := replace(
					replace(
						copy_string(data.template),
						"{}",
						title
					),
					"[]",
					replace(
						replace(
							replace(
								replace(
									replace(
										code,
										"&",
										"&amp;"
									),
									"<",
									"&lt;"
								),
								">",
								"&gt;"
							),
							"'",
							"&apos;"
						),
						"\"",
						"&quot;"
					)
				);
				if data.prevFile {
					test = replace(test, "</pre>", tprint("</pre><hr/><a href=\"file:///%\">%1</a>", data.prevFile));
				}
				path := path_join(data.outputPath, replace(replace(title, ".jai", ".html"), "/", "$"));
				data.prevFile = copy_string(path,, context.default_allocator);
				append(data.indexHtml, tprint("<a href=\"file:///%\">%1</a><br/>\n", path));
				assert(write_entire_file(path, test));
			},
		)
	);

	index := path_join(outputPath, "index.html");
	assert(write_entire_file(index, replace(INDEX_HTML, "{}", builder_to_string(*indexBuilder))));
	print("\n%\n", index);
}

#import "Basic";
#import "Compiler";
#import "File";
#import "File_Utilities";
#import "Process";
#import "String";
