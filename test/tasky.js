/*
Adapted from tasklist, but with proper UTF-8
encoding
*/

'use strict';
const childProcess = require('child_process');
const pify = require('pify');
const neatCsv = require('neat-csv');
const utf8 = require('utf8');
const sec = require('sec');

module.exports = (options = {}) => {
	if (process.platform !== 'win32') {
		return Promise.reject(new Error('Windows only'));
	}

	const args = ['/nh', '/fo', 'csv'];

	if (options.verbose) {
		args.push('/v');
	}

	if (options.system && options.username && options.password) {
		args.push(
			'/s', options.system,
			'/u', options.username,
			'/p', options.password
		);
	}

	if (Array.isArray(options.filter)) {
		for (const filter of options.filter) {
			args.push('/fi', filter);
		}
	}

	const defaultHeaders = [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage'
	];

	const verboseHeaders = defaultHeaders.concat([
		'status',
		'username',
		'cpuTime',
		'windowTitle'
	]);

	const headers = options.verbose ? verboseHeaders : defaultHeaders;
	

	const cmd = '@chcp 65001 >nul & tasklist /v /nh /fo csv'
	const callback = (err, stdout, stderr) => stdout
	// childProcess.exec(cmd, {encoding: "UTF-8"}, callback);
	
	// @chcp 65001 >nul ensures output is UTF-6
	return pify(childProcess.exec)(
		cmd, {encoding: "UTF-8"}
	).then(stdout => {
		// `INFO:` means no matching tasks. See #9.
		let starts = stdout.startsWith('INFO:');
		if (starts) {
			return [] 
		} else {
			//console.log(utf8.encode(stdout))
			return neatCsv(stdout, {headers})
		}
	})
	.then(data => data.map(task => {
		// Normalize task props
		task.pid = Number(task.pid);
		task.sessionNumber = Number(task.sessionNumber);
		task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;
		//task.windowTitle = utf8.decode(task.windowTitle)

		if (options.verbose) {
			task.cpuTime = sec(task.cpuTime);
		}

		return task;
	}));
};