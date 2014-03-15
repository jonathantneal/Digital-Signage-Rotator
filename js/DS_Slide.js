(function () {
	'use strict';

	function DS_Slide(data) {
		var
		template = data.template,
		isSchedule  = /\bschedule\b/.test(template),
		isDirectory = /\bdirectory\b/.test(template);

		return isDirectory ? new DS_Slide_Directory(data) : isSchedule ? new DS_Slide_Schedule(data) : new DS_Slide_Standard(data);
	}

	function DS_Slide_Standard() {
		this.construct.apply(this, arguments);
	}

	DS_Slide_Standard.prototype = {
		constructor: DS_Slide_Standard,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			self.isActive = !!data.isActive;

			// generate DOM
			node.main = 'section.ui-slide'.toNode();
				node.body = '.ui-slide-body'.toNode();
					node.heading    = 'h1.ui-slide-heading'.toNode(text.heading = ''.toText());
					node.subheading = 'subhead.ui-slide-subheading'.toNode(text.subheading = ''.toText());
					node.datetime   = 'p.ui-slide-datetime'.toNode(text.datetime = ''.toText());
					node.location   = 'p.ui-slide-location'.toNode(text.location = ''.toText());
					node.content    = '.ui-slide-content'.toNode();
				node.background = 'canvas.ui-slide-background'.toNode();
				node.foreground = 'canvas.ui-slide-foreground'.toNode();
				node.organizer  = 'footer.ui-slide-organizer'.toNode(text.organizer = ''.toText());
			node.menuItem = 'li.ui-menu-item'.toNode(text.menuItem = ''.toText());

			self.update(data);

			return self;
		},
		update: function (data) {
			var
			self = this,
			node = self.node,
			text = self.text;

			// update slide class name
			node.main.className = 'ui-slide' + (data.template ? data.template.split(' ').map(function (name) {
					return ' ui-slide--' + name;
				}).join('') : '') + (data.isActive ? ' ui-slide--active' : '');

			node.menuItem.className = 'ui-menu-item' + (data.isActive ? ' ui-menu-item--active' : '');

			// position DOM
			node.main.append(node.body, node.background, node.foreground, node.organizer);
			node.body.append(node.heading, node.subheading, node.datetime, node.location, node.content);

			// populate DOM
			if (data.heading) text.heading.content(data.heading); else node.heading.remove();
			if (data.subheading) text.subheading.content(data.subheading); else node.subheading.remove();
			if (data.datetime) text.datetime.content(data.datetime); else node.datetime.remove();
			if (data.location) text.location.content(data.location); else node.location.remove();
			if (data.content) node.content.content(data.content); else node.content.remove();
			if (data.background) node.background.dataset.image = data.background;
			if (data.foreground) node.foreground.dataset.image = data.foreground;
			if (data.backgroundSizing) node.background.dataset.sizing = data.backgroundSizing;
			if (data.foregroundSizing) node.foreground.dataset.sizing = data.foregroundSizing;
			if (data.organizer) text.organizer.content(data.organizer); else node.organizer.remove();
			if (data.menuItem) text.menuItem.content(data.menuItem);

			return self;
		}
	};

	function DS_Slide_Schedule() {
		this.construct.apply(this, arguments);
	}

	DS_Slide_Schedule.prototype = {
		constructor: DS_Slide_Schedule,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			// generate DOM
			node.main = 'section.ui-slide'.toNode(
				node.heading    = 'h1.ui-slide-heading'.toNode(),
				node.subheading = 'subhead.ui-slide-subheading'.toNode(),
				node.collection = 'p.ui-slide-collection'.toNode(),
				node.organizer  = 'p.ui-slide-organizer'.toNode()
			);
			node.menuItem = 'li.ui-menu-item'.toNode(text.menuItem = ''.toText());

			// update slide class name
			node.main.className = 'ui-slide' + (data.template ? data.template.split(' ').map(function (name) {
					return ' ui-slide--' + name;
				}).join('') : '') + (data.isActive ? ' ui-slide--active' : '');

			node.menuItem.className = 'ui-menu-item' + (data.isActive ? ' ui-menu-item--active' : '');

			// populate DOM
			if (data.heading) node.heading.append(text.heading = data.heading.toText()); else node.heading.remove();
			if (data.subheading) node.subheading.append(text.subheading = data.subheading.toText()); else node.subheading.remove();
			if (data.organizer) node.organizer.append(text.organizer = data.organizer.toText()); else node.organizer.remove();

			if (data.collection) {
				(self.collection = data.collection.map(function (data) {
					return new DS_Slide_Schedule_Event(data);
				})).forEach(function (slide) {
					node.collection.appendChild(slide.node.main);
				});
			} else node.collection.remove();

			return self;
		}
	};

	function DS_Slide_Schedule_Event() {
		this.construct.apply(this, arguments);
	}

	DS_Slide_Schedule_Event.prototype = {
		constructor: DS_Slide_Schedule_Event,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			// generate DOM
			node.main = 'article.ui-event'.toNode(
				node.body      = '.ui-event-body'.toNode(
					node.image   = 'img.ui-event-image'.toNode(),
					node.name    = 'h1.ui-event-name'.toNode(),
					node.content = '.ui-event-content'.toNode()
				),
				node.time      = 'p.ui-event-time'.toNode(),
				node.date      = 'p.ui-event-date'.toNode(),
				node.admission = 'p.ui-event-admission'.toNode(),
				node.audience  = 'p.ui-event-audience'.toNode()
			);

			// populate DOM
			if (data.name) node.name.append(text.name = data.name.toText()); else node.name.remove();
			if (data.time) node.time.append(text.time = data.time.toText()); else node.time.remove();
			if (data.date) node.date.append(text.date = data.date.toText()); else node.date.remove();
			if (data.admission) node.admission.append(text.admission = data.admission.toText()); else node.admission.remove();
			if (data.audience) node.audience.append(text.audience = data.audience.toText()); else node.audience.remove();
			if (data.image) node.image.src = data.image; else node.image.remove();
			if (data.content) node.content.innerHTML = data.content; else node.content.remove();

			return self;
		}
	};

	function DS_Slide_Directory() {
		this.construct.apply(this, arguments);
	}

	DS_Slide_Directory.prototype = {
		constructor: DS_Slide_Schedule,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			// generate DOM
			node.main = 'section.ui-slide'.toNode(
				node.heading    = 'h1.ui-slide-heading'.toNode(),
				node.subheading = 'subhead.ui-slide-subheading'.toNode(),
				node.collection = '.ui-slide-collection'.toNode(),
				node.organizer  = 'p.ui-slide-organizer'.toNode()
			);
			node.menuItem = 'li.ui-menu-item'.toNode(text.menuItem = ''.toText());

			// update slide class name
			node.main.className = 'ui-slide' + (data.template ? data.template.split(' ').map(function (name) {
					return ' ui-slide--' + name;
				}).join('') : '') + (data.isActive ? ' ui-slide--active' : '');

			node.menuItem.className = 'ui-menu-item' + (data.isActive ? ' ui-menu-item--active' : '');

			// populate DOM
			if (data.heading) node.heading.append(text.heading = data.heading.toText()); else node.heading.remove();
			if (data.subheading) node.subheading.append(text.subheading = data.subheading.toText()); else node.subheading.remove();
			if (data.organizer) node.organizer.append(text.organizer = data.organizer.toText()); else node.organizer.remove();

			if (data.collection) {
				(self.collection = data.collection.map(function (data) {
					return new DS_Slide_Directory_Member(data);
				})).forEach(function (slide) {
					node.collection.appendChild(slide.node.main);
				});
			} else node.collection.remove();

			return self;
		}
	};

	function DS_Slide_Directory_Member() {
		this.construct.apply(this, arguments);
	}

	DS_Slide_Directory_Member.prototype = {
		constructor: DS_Slide_Schedule_Event,
		construct: function (data) {
			var
			self = this,
			node = self.node = {},
			text = self.text = {};

			if (!data) return self;

			// generate DOM
			node.main = 'article.ui-member'.toNode(
				node.image    = 'img.ui-member-image'.toNode(),
				node.name     = 'h1.ui-member-name'.toNode(),
				node.location = 'p.ui-member-location'.toNode(),
				node.email    = 'p.ui-member-email'.toNode()
			);

			// populate DOM
			if (data.image) node.image.src = data.image; else node.image.src = '../img/member-mia.jpg';
			if (data.name) node.name.append(text.name = data.name.toText()); else node.name.remove();
			if (data.location) node.location.append(text.location = data.location.toText()); else node.location.remove();
			if (data.email) node.email.append(text.email = data.email.toText()); else node.email.remove();

			return self;
		}
	};

	window.DS_Slide = DS_Slide;
})();
