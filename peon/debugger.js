/* globals require, console, exports*/
var Debugger = {};

(function () {
	"use strict";

	var path = require("path"),
		baseDir = path.dirname(require.main.filename),
		project = require(baseDir + "/project"),
		exec = require("child_process").execSync,
		fileList = require("filelist"),
		fs = require("fs"),
		build = false,
		directories,
		buildFile,
		copyFile;

	//Load data
	directories = project.directories;
	buildFile = baseDir + "/" + project.resource + project.settings.name;
	copyFile = baseDir + "/.copy";

	/**
	 * Run debug
	 * @param {boolean} tests
	 */
	Debugger.runDebug = function (tests) {
		setDebugWatchers(tests);
	};

	/**
	 * Build
	 * @returns {boolean}
	 */
	Debugger.build = function () {
		return build;
	};

	/**
	 * Send response after build
	 * @param {*} req
	 * @param {*} res
	 * @param {number=} counter
	 */
	Debugger.sendResponseAfterBuild = function (req, res, counter) {
		var readStream;

		counter = counter || 0;

		// timeout
		if (counter > 20) {
			res.writeHead(404, {
				"Content-Type": "text/html"
			});
			res.end();
			return;
		}

		// wait for build
		if (Debugger.build()) {
			setTimeout(function () {
				Debugger.sendResponseAfterBuild(req, res, counter + 1);
			}, 100);
			return;
		}

		// send response
		readStream = fs.createReadStream(baseDir + req.url);
		readStream.pipe(res);
	};

	/**
	 * Concat files
	 * @param {Array.<*>} list
	 * @param {string} outputFile
	 * @param {function} callback
	 */
	function concatFiles(list, outputFile, callback) {
		var fl = new fileList.FileList(),
			result = "",
			data;

		fl.include(list);

		fl.forEach(function (file, index) {
			data = fs.readFileSync(file, "utf8");
			result += data;
			if (index === fl.length() - 1) {
				fs.writeFileSync(outputFile, result);
				callback();
			}
		});
	}

	/**
	 * Uglify file
	 */
	function uglifyFile() {
		exec(baseDir + "/node_modules/.bin/uglifyjs " + project.resource + project.settings.name + " -o " + project.resource + project.settings.min);
		writeMessage("Uglify done.");
	}

	/**
	 * Run build
	 * @param {boolean=} uglify
	 * @param {boolean=} tests
	 * @param {string=} type
	 * @param {string=} filename
	 */
	Debugger.runBuild = function (uglify, tests, type, filename) {
		var productionFile = false;

		//build in progress
		if (build) {
			return;
		}
		//skip min files and not js files
		if (filename) {
			productionFile = productionFile || filename.indexOf(".js") >= 0;
			productionFile = productionFile || filename.indexOf(".less") >= 0;
			productionFile = productionFile && filename.indexOf(".min.js") === -1;
			if (!productionFile) {
				return;
			}
		}
		//clear files
		writeMessage("Clear build files.", true);
		//delete and run build
		fs.unlink(buildFile, function () {
			writeMessage("Running build.");

			concatFiles(project.getAllSrc(), project.resource + project.settings.flow, function () {
				writeMessage("Concat done.");
				exec(baseDir + "/node_modules/.bin/flow-remove-types " + project.resource + project.settings.flow + " > " + project.resource + project.settings.name);
				writeMessage("Remove flow.");

				uglifyFile();
				concatFiles(project.getLessStyles(), project.resource + project.settings.less, function () {
					writeMessage("Less done.");
					exec(baseDir + "/node_modules/.bin/lessc " + project.resource + project.settings.less + " " + project.resource + project.settings.css);
					afterBuild(uglify, tests, type, filename);
				});
			});
		});
		build = true;
	};

	/**
	 * Set debug watchers
	 * @param {boolean} tests
	 * @param {number=} counter
	 */
	function setDebugWatchers(tests, counter) {
		var settings,
			dirs,
			p,
			i;

		counter = counter || 0;
		//error
		if (counter > 30) {
			throw "Cannot start debug watchers.";
		}
		//build in progress
		if (Debugger.build()) {
			setTimeout(function () {
				setDebugWatchers(tests, counter + 1);
			}, 100);
			return;
		}
		//read async
		dirs = fs.readdirSync(baseDir);
		//settings
		settings = {};
		settings.recursive = true;
		//watch
		writeMessage("Run file watchers.", true);
		for (i = 0; i < dirs.length; i++) {
			for (p = 0; p < directories.length; p++) {
				if (dirs[i].substring(0, directories[p].length) === directories[p]) {
					fs.watch(dirs[i], settings, Debugger.runBuild.bind(null, false, tests));
				}
			}
		}
		//done
		writeMessage("Done. Now you can start prompting commands.", true);
	}

	/**
	 * After build
	 * @param {boolean=} uglify
	 * @param {boolean=} tests
	 * @param {string=} type
	 * @param {string=} filename
	 */
	function afterBuild(uglify, tests, type, filename) {
		fs.exists(buildFile, function (exists) {
			//mark as build
			build = false;
			//error, try build again
			if (!exists) {
				Debugger.runBuild(uglify, tests, type, filename);
				return;
			}
			//build done
			writeMessage("Build done.");
			//copy
			copy();
		});
	}

	/**
	 * Copy files
	 */
	function copy() {
		fs.exists(copyFile, function (exists) {
			if (!exists) {
				return;
			}
			//copy
			fs.readFile(copyFile, function (err, data) {
				// each line of file as separate directory
				var destinationsArray = data.toString().split(/\r?\n/),
					destinationArrayIndex,
					destination;

				if (err) {
					return;
				}

				for (destinationArrayIndex = 0; destinationArrayIndex < destinationsArray.length; destinationArrayIndex++) {
					destination = destinationsArray[destinationArrayIndex];

					//copy dir
					copyDir(baseDir + "/" + project.resource, destination);
					//build done
					writeMessage("Files copied into '" + destination + "'.");
				}

			});

		});
	}

	/**
	 * Copy dir
	 * @param {string} src
	 * @param {string} dest
	 */
	function copyDir(src, dest) {
		var i,
			current,
			files = fs.readdirSync(src);

		for (i = 0; i < files.length; i++) {
			current = fs.lstatSync([src, files[i]].join("/"));
			if (!current.isDirectory() && !current.isSymbolicLink()) {
				fs.createReadStream([src, files[i]].join("/")).pipe(fs.createWriteStream([dest, files[i]].join("/")));
			}
		}
	}

	/**
	 * Write message
	 * @param {string} text
	 * @param {boolean=} separator
	 */
	function writeMessage(text, separator) {
		if (separator) {
			console.log("---------------------------------------------");
		}
		console.log(new Date().toLocaleTimeString() + " => " + text);
	}
}());

exports.runDebug = Debugger.runDebug;
exports.runBuild = Debugger.runBuild;
exports.build = Debugger.build;
exports.sendResponseAfterBuild = Debugger.sendResponseAfterBuild;