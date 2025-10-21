#!/bin/bash
node dumpScopes.mjs | sort -u >css
if [ "$1" != "-1" ]; then
	rm check
	echo -n >check
	while read -r line; do
		re="hljs-${line//./_*\\.}_*\`";
		if ! grep "$re" css-class-reference.md >/dev/null; then
			echo -en "$line"'\e[K\r';
			if ! grep -E 'stdLib|symbol.' <<<"$line" >/dev/null; then
				echo;
			fi;
			echo $line >>check;
		fi;
	done < css
	echo -e '\e[K';
	grep -Ev 'stdLib|symbol.' check
fi
if [ "$1" != "-2" ]; then
	rm check
	grep -Eoe '--[A-Za-z0-9-]+' src/styles/jaiEverything.css | sed 's/-[a-z]\+$//' | sort -u >check
	while read -r line; do
		if ! grep -Fe "|\`$line\`|" css-class-reference.md >/dev/null; then
			echo $line;
		fi;
	done < check
	echo -en '\e[K';
fi
if [ $# -lt 2 ]; then
	rm check
fi
