#!/bin/bash
node dumpScopes.mjs | sort -u >css
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
rm check
grep -Eo -e '--[a-z0-9-]+' src/styles/jaiEverything.css | sed 's/-[a-z]\+$//' | sort -u >check
while read -r line; do
	if ! grep -F -e "\`$line\`" css-class-reference.md >/dev/null; then
		echo $line;
	fi;
done < check
rm check
echo -en '\e[K';
