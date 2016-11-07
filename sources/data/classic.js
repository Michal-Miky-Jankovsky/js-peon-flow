(function () {
	"use strict";

	//@flow
	demoProject.Classic = function () {
		this.time = new Date().getTime();

	};

	demoProject.Classic.prototype.getTime = function (): number {
		return this.time;
	};
}());