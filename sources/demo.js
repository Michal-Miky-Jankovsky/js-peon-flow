(function () {
	"use strict";

	//@flow
	demoProject.mainFunction = function (classic: demoProject.Classic) {
		var element = document.querySelector("#content"),
			value: string = "value",
			valueInt: number = 1;

		console.log("Param example: ", classic.getTime());

		if (element) {
			element.innerHTML = "Hello " + lib0001.doSomething("w", "o", "r", "l", "d");
			element.innerHTML += "<br />String: " + doStringMagic(value) + "<br />Number: " +  doNumberMagic(valueInt);
		} else {
			throw "Element was not found!";
		}
	};

	function doStringMagic(value: string): string {
		return value + "_expanded";
	}

	function doNumberMagic(value: number): number {
		return value * 5;
	}
}());