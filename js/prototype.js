(function () {
	'use strict';

	/* global Date, Element, String */

	/* HELPER FUNCTIONS
	   ================ */

	var
	MATCH = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)',
	REGEX = '^(?:' + MATCH + ')|^#' + MATCH + '|^\\.' + MATCH + '|^\\[' + MATCH + '(?:([*$|~^]?=)(["\'])((?:(?=(\\\\?))\\8.)*?)\\6)?\\]',

	DatePrototype     = Date.prototype,
	ElementPrototype  = Element.prototype,
	StringPrototype   = String.prototype;

	// Element

	ElementPrototype.remove = ElementPrototype.remove || function () {
		return this.parentNode && this.parentNode.removeChild(this);
	};

	ElementPrototype.append = ElementPrototype.append || function () {
		for (var node = this, nodes = arguments, index = 0, length = nodes.length; index < length; ++index) {
			node.appendChild(nodes[index]);
		}
	};

	// Date

	DatePrototype.getPeriodHours = function () {
		return this.getHours() % 12 || 12;
	};

	DatePrototype.getPeriod = function () {
		return this.getHours() < 12 ? 'a.m.' : 'p.m.';
	};

	DatePrototype.getMinutesPadded = function () {
		return ('0' + this.getMinutes()).slice(-2);
	};

	DatePrototype.getMonthName = function () {
		return 'January February March April May June July August September October November December'.split(' ')[this.getMonth()];
	};

	// String

	StringPrototype.toNode = function () {
		for (var selector = this, node = document.createElement('div'), match, className = ''; selector && (match = selector.match(REGEX));) {
			if (match[1]) node = document.createElement(match[1]);
			if (match[2]) node.id = match[2];
			if (match[3]) className += ' ' + match[3];
			if (match[4]) node.setAttribute(match[4], match[7] || '');

			selector = selector.slice(match[0].length);
		}

		if (className) node.className = className.slice(1);

		ElementPrototype.append.apply(node, arguments);

		return node;
	};

	StringPrototype.toText = function () {
		return document.createTextNode(this);
	};

	// JSON

	JSON.fetch = function (url) {
		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, false);

		xhr.send();

		return JSON.parse(xhr.responseText);
	};
})();
