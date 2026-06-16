// Launch Chrome on the visual-tests index page using an absolute file:// URL.
// Using a relative path doesn't work reliably: when Chrome is already running,
//  the new `chrome` process forwards the argument to the existing instance via
//  IPC, and that instance doesn't resolve the path against this shell's cwd.
//
// NOTE: --allow-file-access-from-files only takes effect on a *fresh* Chrome process.
// If Chrome is already running, our flag is silently ignored because the URL is just handed to the existing instance.
// We inspect the existing browser-process command lines:
//  if one already has the flag, we reuse it;
//  otherwise we either warn or (with --kill) terminate Chrome first.
//
// Usage:
//   npm run browserTest                # warns if Chrome is already running
//   npm run browserTest -- --kill      # kills running Chrome first, then launches

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const isWin = process.platform === 'win32';
const isWsl = (() => {
	if (process.platform !== 'linux') {
		return false;
	}


	if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
		return true;
	}


	try {
		return /microsoft|wsl/i.test(readFileSync('/proc/version', 'utf8'));
	} catch {
		return false;
	}
})();
// Whether to drive Chrome through Windows tools (chrome.exe, tasklist, etc.).
// True on real Windows AND under WSL (WSL Node is Linux but Chrome is Windows).
const useWinTools = isWin || isWsl;

// Names for Windows executables.
// On real Windows, the bare name resolves;
//  under WSL we must use the .exe suffix to invoke the Win32 binary via interop.
const WIN_TASKLIST = isWsl ? 'tasklist.exe' : 'tasklist';
const WIN_TASKKILL = isWsl ? 'taskkill.exe' : 'taskkill';
const WIN_POWERSHELL = isWsl ? 'powershell.exe' : 'powershell.exe'; // explicit on both.
const WIN_CMD = isWsl ? 'cmd.exe' : 'cmd';

const shouldKill = process.argv.includes('--kill');
const REQUIRED_FLAG = '--allow-file-access-from-files';

// Returns the command lines of the Chrome *browser* processes currently running
//  (i.e. not renderer/gpu/utility helpers, which carry --type=...).
// The browser process is the one whose flags actually govern the session
//  - helpers inherit from it.
// Returns [] if Chrome isn't running.
function chromeBrowserCommandLines() {
	if (useWinTools) {
		// PowerShell's Get-CimInstance is the modern replacement for WMIC and is shipped with every supported Windows.
		// We pick CommandLine and emit one line per process, separated by NUL so embedded newlines/quotes can't confuse us.
		const ps =
			"Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" " +
			"| ForEach-Object { $_.CommandLine + [char]0 }";
		const r = spawnSync(
			WIN_POWERSHELL,
			['-NoProfile', '-NonInteractive', '-Command', ps],
			{ encoding: 'utf8' }
		);
		if (r.status !== 0 || !r.stdout) return [];
		return r.stdout
			.split('\0')
			.map(s => s.replace(/\r?\n/g, '').trim())
			.filter(s => s.length > 0)
			.filter(s => !/--type=/.test(s));
	}
	// Native POSIX: `ps -A -o args=` prints the full argv for every process.
	const r = spawnSync('ps', ['-A', '-o', 'args='], { encoding: 'utf8' });
	if (r.status !== 0 || !r.stdout) return [];
	return r.stdout
		.split('\n')
		.map(line => line.trim())
		.filter(line => /(^|[\\/])chrome(\.exe)?\b/i.test(line) || /google chrome/i.test(line))
		.filter(line => !/--type=/.test(line));
}

function chromeIsRunning() {
	if (useWinTools) {
		const r = spawnSync(
			WIN_TASKLIST,
			['/FI', 'IMAGENAME eq chrome.exe', '/NH', '/FO', 'CSV'],
			{ encoding: 'utf8' }
		);
		return r.status === 0 && /chrome\.exe/i.test(r.stdout);
	}
	const r = spawnSync('pgrep', ['-i', 'chrome'], { encoding: 'utf8' });
	return r.status === 0;
}

// True iff at least one running Chrome browser process was launched with the required flag (so the existing session will honour file:// access).
function existingChromeHasFlag() {
	const cmdlines = chromeBrowserCommandLines();
	return cmdlines.some(cl => cl.includes(REQUIRED_FLAG));
}

function sleepMs(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function killChrome() {
	if (useWinTools) {
		spawnSync(WIN_TASKKILL, ['/F', '/IM', 'chrome.exe', '/T'], { stdio: 'ignore' });
	} else {
		spawnSync('pkill', ['-i', 'chrome'], { stdio: 'ignore' });
	}
	// Give the OS a moment to release Chrome's singleton lock:
	const until = Date.now() + 3000;
	while (Date.now() < until && chromeIsRunning()) {
		sleepMs(200);
	}
}

if (chromeIsRunning()) {
	if (existingChromeHasFlag()) {
		console.log(`Chrome is already running with ${REQUIRED_FLAG} - reusing existing instance.`);
	} else if (shouldKill) {
		console.log(`Chrome is already running without ${REQUIRED_FLAG} - terminating it...`);
		killChrome();
		if (chromeIsRunning()) {
			console.warn(`WARNING: Chrome processes still running after kill; ${REQUIRED_FLAG} will likely be ignored.`);
		}
	} else {
		console.warn(
			`WARNING: Chrome is already running without ${REQUIRED_FLAG}.\n`
			+ '         That flag only applies to a freshly-launched Chrome process;\n'
			+ '         the existing instance will open the page without it, and file://\n'
			+ '         XHR/fetch/module loads may fail.\n'
			+ '         Re-run with `npm run browserTest -- --kill` to close Chrome first,\n'
			+ '         or quit Chrome manually before re-running.'
		);
	}
}

const target = resolve('test/visualTests/index.html');

// Build the file:// URL Chrome will see.
// On WSL we must translate to a Windows path so Windows Chrome (which is what's actually being launched) can resolve it.
// wslpath handles both /mnt/<drive>/... and \\wsl$\... cases.
let url;
if (isWsl) {
	const r = spawnSync('wslpath', ['-w', target], { encoding: 'utf8' });
	if (r.status !== 0) {
		console.error('wslpath failed; cannot translate path for Windows Chrome:', r.stderr || r.error);
		process.exit(1);
	}


	const winPath = r.stdout.trim();
	// pathToFileURL on Linux can't make a Windows file URL; build it manually.
	// Use forward slashes and percent-encode spaces / unsafe chars.
	const slashed = winPath.replace(/\\/g, '/');
	url = 'file:///' + encodeURI(slashed).replace(/#/g, '%23').replace(/\?/g, '%3F');
} else {
	url = pathToFileURL(target).href;
}

let cmd, args;
if (useWinTools) {
	// `start` is a cmd.exe builtin, so we must invoke it via cmd. The empty
	// quoted "" is the window title (start treats the first quoted arg that
	// way). Backgrounded by start itself.
	cmd = WIN_CMD;
	args = ['/c', 'start', '', 'chrome', url, REQUIRED_FLAG];
} else {
	cmd = 'sh';
	args = ['-c', `chrome "${url}" ${REQUIRED_FLAG} &`];
}

const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
child.unref();
