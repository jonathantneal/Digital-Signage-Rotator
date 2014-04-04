(function () {
	'use strict';

	/* global Promise, Ractive */

	function DigitalSignageSlidePreview(data) {
		var self = this;

		self.data = Object.extend({
			isResizing: true,
			style: {}
		}, data);
		self.templates = {};

		DigitalSignageSlidePreview.initTemplates(self).then(DigitalSignageSlidePreview.initRactive);
	}

	DigitalSignageSlidePreview.initTemplates = function (self) {
		return new Promise(function (resolve, reject) {
			if (DigitalSignageSlidePreview.templates) return resolve(self);

			var templates = 'default directoryDark directoryLight scheduleDark scheduleLight standardDarkLeft standardDarkRight standardLightLeft standardLightRight'.split(' ');

			window.request({
				src: templates.map(function (key) {
					return 'tpl/'+key+'.mustache';
				}),
				onLoad: function (xhrs) {
					templates.forEach(function (key, index) {
						self.templates[key] = Ractive.parse(xhrs[index].responseText);
					});

					return resolve(self);
				},
				onError: reject
			});
		});
	};

	DigitalSignageSlidePreview.initRactive = function (self) {
		return new Promise(function (resolve) {
			self.ractive = new Ractive({
				el: document.body,
				template: self.templates[self.data.template],
				data: self.data
			});

			self.ractive.observe({
				index: function () {
					DigitalSignageSlidePreview.updateMenuDisplay(self);
				},
				isResizing: function () {
					DigitalSignageSlidePreview.updateMenuDisplay(self);
				},
				location: function () {
					DigitalSignageSlidePreview.updateMenuDisplay(self);
				},
				timestamp: function () {
					DigitalSignageSlidePreview.updateTimestampDisplay(self);
					DigitalSignageSlidePreview.updateMenuDisplay(self);
				}
			});

			resolve(self);
		});
	};

	window.DigitalSignageSlidePreview = DigitalSignageSlidePreview;
})();