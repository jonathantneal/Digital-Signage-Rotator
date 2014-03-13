(function () {
	'use strict';

	function DS_Slide() {
		this.construct.apply(this, arguments);
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

			// generate DOM
			node.main = 'section.ui-slide'.toNode(
				node.body = '.ui-slide-body'.toNode(
					node.heading    = 'h1.ui-slide-heading'.toNode(),
					node.subheading = 'subhead.ui-slide-subheading'.toNode(),
					node.datetime   = 'p.ui-slide-datetime'.toNode(),
					node.location   = 'p.ui-slide-location'.toNode(),
					node.content    = '.ui-slide-content'.toNode()
				),
				node.background = 'canvas.ui-slide-background'.toNode(),
				node.foreground = 'canvas.ui-slide-foreground'.toNode(),
				node.organizer  = 'footer.ui-slide-organizer'.toNode()
			);

			if (data.template) data.template.split(' ').forEach(function (templateName) {
				node.main.classList.add('ui-slide--' + templateName);
			});

			// populate DOM
			if (data.heading) node.heading.append(text.heading = data.heading.toText()); else node.heading.remove();
			if (data.subheading) node.subheading.append(text.subheading = data.subheading.toText()); else node.subheading.remove();
			if (data.organizer) node.organizer.append(text.organizer = data.organizer.toText()); else node.organizer.remove();
			if (data.datetime) node.datetime.append(text.datetime = data.datetime.toText()); else node.datetime.remove();
			if (data.location) node.location.append(text.location = data.location.toText()); else node.location.remove();
			if (data.content) node.content.innerHTML = data.content; else node.content.remove();
			if (data.background) node.background.dataset.image = data.background;
			if (data.foreground) node.foreground.dataset.image = data.foreground;
			if (data.backgroundSizing) node.background.dataset.sizing = data.backgroundSizing;
			if (data.foregroundSizing) node.foreground.dataset.sizing = data.foregroundSizing;

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
				node.heading    = '.ui-slide-heading'.toNode(),
				node.subheading = '.ui-slide-subheading'.toNode(),
				node.collection = '.ui-slide-collection'.toNode(),
				node.organizer  = '.ui-slide-organizer'.toNode()
			);

			if (data.template) data.template.split(' ').forEach(function (templateName) {
				node.main.classList.add('ui-slide--' + templateName);
			});

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
				node.time      = '.ui-event-time'.toNode(),
				node.date      = '.ui-event-date'.toNode(),
				node.admission = '.ui-event-admission'.toNode(),
				node.audience  = '.ui-event-audience'.toNode()
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

	window.DS_Slide = DS_Slide;
	window.DS_Slide_Standard = DS_Slide_Standard;
	window.DS_Slide_Schedule = DS_Slide_Schedule;
})();
