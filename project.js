/**global module*/
// Project configuration.
var project = {};
//artifactory
project.artifactory = "http://default:8081";
//group id
project.groupId = "net.gmc";
//artifact id
project.artifactId = "project-id";
//package json
project.package = "package.json";
//build files location
project.resource = "bin/";
//library files location
project.library = "libraries/";
//tests files location
project.tests = "tests/";
//coverage data location
project.coverage = "coverage/";
//coverage data location
project.example = "example/";
//style
project.style = "styles/";
//all watched dirs
project.directories = ["sources", "styles"];
//jquery
project.lib0001 = {
	name: "lib.js"
};
//vendors
project.vendors = [
	project.library + project.lib0001.name
];

//settings
project.settings = {
	//name
	name: "demo.js",
	min: "demo.min.js",
	//less
	less: [project.style + "*.less"],
	//css
	css: "demo.css",
	//src
	src: {
		helper: [
			"sources/init.js"
		],
		base: [
			"sources/demo.js"
		],
		files: [
			"sources/**/*.js"

		]
	},
	//get all files
	getFiles: function () {
		"use strict";

		var src = project.settings.src;

		return [].concat(src.helper).concat(src.base).concat(src.files);
	}
};
//spec
project.spec = {
	//default
	default: [project.tests + "**/*.js"],

	//coverage runner
	runnerDefault: project.tests + "index.html"
};
//demo
project.demo = {
};
/**
 * get css style
 * @return {Array.<string>}
 */
project.getCssStyles = function () {
	"use strict";

	return [
	];
};
/**
 * get all src files
 * @return {Array.<string>}
 */
project.getAllSrc = function () {
	"use strict";

	return [].concat(project.settings.getFiles());
};

/**
 * get all helper files
 * @returns {Array.<string>}
 */
project.getHelpers = function () {
	"use strict";

	return [project.library + project.lib0001.name].concat(project.settings.src.helper);
};

//exports project data
module.exports = project;