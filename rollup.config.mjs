import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const hljsVersion = require('highlight.js/package.json').version;
const banner = `/*! \`jai\` grammar built and tested with Highlight.js ${hljsVersion} */\n`;

export default {
	input: 'src/languages/jai.js',
	plugins: [commonjs()],
	output: [
		{
			file: 'dist/jai.es.js',
			format: 'es',
			banner
		},
		{
			file: 'dist/jai.cjs',
			format: 'cjs',
			exports: 'default',
			banner
		},
		{
			file: 'dist/jai.js',
			format: 'iife',
			name: 'hljsJai',
			banner,
			footer: 'hljs.registerLanguage("jai", hljsJai);'
		},
		{
			file: 'dist/jai.es.min.js',
			format: 'es',
			banner,
			plugins: [terser()]
		},
		{
			file: 'dist/jai.min.js',
			format: 'iife',
			name: 'hljsJai',
			banner,
			footer: 'hljs.registerLanguage("jai", hljsJai);',
			plugins: [terser()]
		}
	]
};
