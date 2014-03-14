(function () {
	'use strict';

	/* global requestAnimationFrame */

	/* HELPER FUNCTIONS
	   ================ */

	var
	MATCH = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)',
	REGEX = '^(?:' + MATCH + ')|^#' + MATCH + '|^\\.' + MATCH + '|^\\[' + MATCH + '(?:([*$|~^]?=)(["\'])((?:(?=(\\\\?))\\8.)*?)\\6)?\\]';

	// returns a new element node by css selector, optionally appended to a container
	function new_node(selector, container) {
		for (var node = document.createElement('div'), match, className = ''; selector && (match = selector.match(REGEX));) {
			if (match[1]) node = document.createElement(match[1]);
			if (match[2]) node.id = match[2];
			if (match[3]) className += ' ' + match[3];
			if (match[4]) node.setAttribute(match[4], match[7] || '');

			selector = selector.slice(match[0].length);
		}

		if (className) node.className = className.slice(1);

		return container ? container.appendChild(node) : node;
	}

	// returns a new text node, optionally appended to a container
	function new_text(content, container) {
		var node = document.createTextNode(content);

		return container ? container.appendChild(node) : node;
	}

	// returns the current date & time
	function get_datetime(time) {
		var
		month = 'January February March April May June July August September October November December'.split(' ')[time.getMonth()],
		date   = time.getDate(),
		hour   = (time.getHours() % 12) || 12,
		minute = ('0' + time.getMinutes()).slice(-2),
		period = time.getHours() > 11 ? 'p.m.' : 'a.m.';

		return month + ' ' + date + ', ' + hour + ':' + minute + ' ' + period;
	}

	// animates a text node to always display the current time 
	function animate_datetime(text) {
		function draw() {
			var
			datetime = get_datetime(new Date());

			if (text.nodeValue !== datetime) text.nodeValue = datetime;

			requestAnimationFrame(draw);
		}

		requestAnimationFrame(draw);
	}

	// animates a background on a canvas
	function animate_background(canvas, src) {
		var
		image = new Image(),
		context = canvas.getContext('2d');

		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		image.addEventListener('load', function () {
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
		});

		image.src = src;
	}

	/* DS_Signage
	   ================ */

	function DS_Signage(data) {
		var
		self = this,
		node = self.node = {},
		text = self.text = {};

		node.main = new_node('body.ui-feed');
			node.head  = new_node('header.ui-head[role="banner"]', node.main);
				node.logo     = new_node('h1.ui-logo', node.head);
				node.location = new_node('subhead.ui-location', node.head);
					node.locationName = new_node('p.ui-location-name', node.location);
						text.location = new_text(data.location, node.locationName);
					node.locationTime = new_node('p.ui-location-datetime', node.location);
						text.datetime = new_text('January 1, 12:00 a.m.', node.locationTime);
				node.menu     = new_node('nav.ui-menu[role="navigation"]', node.head);
					node.menuCaret = new_node('.ui-menu-caret', node.menu);
					node.menuList  = new_node('ul.ui-menu-list', node.menu);
			node.body  = new_node('main.ui-body[role="main"]', node.main);

		self.currentIndex = 0;

		if (data.slides) {
			data.slides.parent = self;

			self.slides = data.slides.map(DS_Slide.create);

			delete data.slides.parent;
		}
	}

	DS_Signage.create = function (data) {
		return new DS_Signage(data);
	};

	DS_Signage.prototype.init = function (element, index) {
		var
		self = this;

		animate_datetime(self.text.datetime);

		element.appendChild(self.node.main);

		self.slides.forEach(function (slide) {
			slide.init();
		});

		self.activate(index);
	};

	DS_Signage.prototype.activate = function (index) {
		var
		self = this,
		mainA = self.slides[self.currentIndex].node.main,
		mainB = self.slides[index].node.main;

		mainA.classList.remove('ui-slide--active');
		mainB.classList.add('ui-slide--active');
	}

	/* DS_Slide
	   ================ */

	function DS_Slide(data, parent) {
		var
		self = this,
		node = self.node = {},
		text = self.text = {};

		self.duration = data.duration;

		node.menuItem = new_node('li.ui-menu-item', parent.node.menuList);
			text.menuItem = new_text(data.navLabel, node.menuItem);

		node.main = new_node('section.ui-slide', parent.node.body);

		if (/standard/.test(data.template)) DS_Slide.extend.standard(self, parent, data);
	}

	DS_Slide.create = function (data, index, array) {
		return new DS_Slide(data, array.parent);
	};

	DS_Slide.prototype.init = function () {
		var
		self = this;

		animate_background(self.node.background, self.node.background.dataset.image);
	};

	DS_Slide.extend = {
		standard: function (self, parent, data) {
			var
			node = self.node,
			text = self.text;

			data.template.split(' ').forEach(function (template) {
				node.main.classList.add('ui-slide--' + template);
			});

			// background
			node.background = new_node('canvas.ui-slide-background', node.main);
				node.background.dataset.color = data.backgroundColor || '';
				node.background.dataset.image  = data.backgroundImage || '';
				node.background.dataset.type   = data.backgroundType || '';
				node.background.dataset.sizing = data.backgroundSizing || '';

			// foreground
			node.foreground = new_node('canvas.ui-slide-foreground', node.main);
				node.foreground.dataset.color = data.foregroundColor || '';
				node.foreground.dataset.image  = data.foregroundImage || '';
				node.foreground.dataset.type   = data.foregroundType || '';
				node.foreground.dataset.sizing = data.foregroundSizing || '';

			// organizer
			node.organizer  = new_node('p.ui-slide-organizer', node.main);
				text.organizer = new_text(data.organizer, node.organizer);

			// content
			node.body = new_node('.ui-slide-body', node.main);

			if (data.heading) {
				node.heading    = new_node('h1.ui-slide-heading', node.body);
					text.heading    = new_text(data.heading, node.heading);
			}
			if (data.subheading) {
				node.subheading = new_node('subhead.ui-slide-subheading', node.body);
					text.subheading = new_text(data.subheading, node.subheading);
			}
			if (data.datetime) {
				node.datetime   = new_node('p.ui-slide-datetime', node.body);
					text.datetime   = new_text(data.datetime, node.datetime);
			}
			if (data.location) {
				node.location   = new_node('p.ui-slide-location', node.body);
					text.location   = new_text(data.location, node.location);
			}
			if (data.content) {
				node.content    = new_node('.ui-slide-content', node.body);
				node.content.innerHTML = data.content;
			}
		},
		directory: function (self) {
			var
			node = self.node,
			text = self.text;

			node.main.classList.add('ui-slide--directory');

			// heading
			node.heading = new_node('h1.ui-slide-heading', node.main);
				text.heading = new_text(self.location, node.heading);

			// directory
			node.body    = new_node('.ui-slide-body', node.main);

			node.collection = self.directory.map(function (member) {
				var
				body = {},
				node = body.node = {},
				text = body.text = {};

				node.main = new_node('article.ui-content', node.body);
					node.name  = new_node('h1.ui-member-name', node.main);
						text.name      = new_text(member.name, node.name);
					node.image = new_node('img.ui-member-image', node.main);
						node.image.src = member.image;
					node.email = new_node('p.ui-member-email', node.main);
						text.email     = new_text(member.email, node.email);
					node.location = new_node('p.ui-member-location', node.main);
						text.location  = new_text(member.location, node.location);

				return body;
			});
		},
		schedule: function (self) {
			var
			node = self.node,
			text = self.text;

			node.main.classList.add('ui-slide--schedule');

			// heading
			node.heading  = new_node('h1.ui-slide-heading', node.main);
				text.heading = new_text(self.location, node.heading);

			// directory
			node.body = new_node('.ui-slide-body', node.main);

			node.collection = self.schedule.map(function (event) {
				var
				body = {},
				node = body.node = {},
				text = body.text = {};

				node.main = new_node('article.ui-event', node.body);
					node.name = new_node('h1.ui-event-name', node.main);
						text.name = new_text(event.name, node.name);
					node.image = new_node('img.ui-event-image', node.main);
						node.image.src = event.image;
					node.date = new_node('p.ui-event-date', node.main);
						text.date = new_text(event.date, node.date);
					node.time = new_node('p.ui-event-time', node.main);
						text.time = new_text(event.time, node.time);
					node.body = new_node('p.ui-event-body', node.main);
						text.body = new_text(event.body, node.body);
					node.admission = new_node('p.ui-event-admission', node.main);
						text.admission = new_text(event.admission, node.admission);
					node.audience = new_node('p.ui-event-audience', node.main);
						text.audience = new_text(event.audience, node.audience);

				return body;
			});
		}
	};

	window.DS = DS_Signage;
})();
