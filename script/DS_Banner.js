(function () {
	'use strict';

	/* global DS_Slide */

	function DS_banner() {
		this.construct.apply(this, arguments);
	}

	DS_banner.prototype = {
		constructor: DS_banner,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			// generate DOM
			node.main = 'body.ui-feed'.toNode(
				node.head = 'header.ui-head[role="banner"]'.toNode(
					node.logo          = 'h1.ui-logo'.toNode(),
					node.location      = 'subhead.ui-location'.toNode(
						node.locationName = 'p.ui-location-name'.toNode(),
						node.locationTime = 'p.ui-location-time'.toNode()
					),
					node.menu = 'nav.ui-menu[role="navigation"]'.toNode(
						node.menuCaret = '.ui-menu-caret'.toNode(),
						node.menuList  = 'ul.ui-menu-list'.toNode()
					)
				),
				node.body = 'main.ui-body[role="main"]'.toNode()
			);

			// populate DOM
			if (data.location) node.locationName.append(text.locationName = data.location.toText()); else node.locationName.remove();

			node.locationTime.append(text.locationTime = 'January 1, 12:00 a.m.'.toText());

			if (data.collection) {
				(self.collection = data.collection.map(function (data) {
					return new DS_Slide(data);
				})).forEach(function (slide) {
					node.menuList.append(slide.node.menuItem);
				});
			}

			return self;
		}
	};

	window.DS_banner = DS_banner;
})();