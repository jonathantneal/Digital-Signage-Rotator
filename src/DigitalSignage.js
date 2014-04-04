// ~1700 bytes gzipped
(function () {
	'use strict';

	/* global cancelAnimationFrame, Promise, Ractive, requestAnimationFrame */

	function DigitalSignage(src) {
		var self = this;

		self.data = {
			index: 1,
			isResizing: true,
			style: {}
		};
		self.templates = {};
		self.src = src;

		DigitalSignage.initTemplates(self)
		         .then(DigitalSignage.initRactive)
		         .then(DigitalSignage.initPolling)
		         .then(DigitalSignage.initDrawing)
		         .then(DigitalSignage.initResizing);
	}

	// initializes all template functionality
	DigitalSignage.initTemplates = function (self) {
		return new Promise(function (resolve, reject) {
			if (DigitalSignage.templates) return resolve(self);

			// TODO: this should be collected from the slides
			var templates = 'default directoryDark directoryLight scheduleDark scheduleLight standardDarkLeft standardDarkRight standardLightLeft standardLightRight'.split(' ');

			window.request({
				src: templates.map(function (key) {
					return 'templates/'+key+'.mustache';
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

	// initializes all Ractive functionality
	DigitalSignage.initRactive = function (self) {
		return new Promise(function (resolve) {
			self.ractive = new Ractive({
				el: document.body,
				template: self.templates['default'],
				data: self.data,
				partials: self.templates
			});

			self.ractive.observe({
				index: function () {
					DigitalSignage.updateMenuDisplay(self);
				},
				isResizing: function () {
					DigitalSignage.updateMenuDisplay(self);
				},
				location: function () {
					DigitalSignage.updateMenuDisplay(self);
				},
				timestamp: function () {
					DigitalSignage.updateTimestampDisplay(self);
					DigitalSignage.updateMenuDisplay(self);
				},
				'collection.*.background': function (newValue, oldValue, keypath) {
					var
					index = keypath.replace(/^[^\.]+\.|\.[^\.]+$/g, ''),
					item  = self.data.collection[index];

					if (item.canvas) {
						cancelAnimationFrame(item.backgroundFrame);

						delete item.backgroundMedia;
					}

					setTimeout(function () {
						DigitalSignage.initVideo(self, item, index);
					}, 0);
				}
			});

			resolve(self);
		});
	};

	// initializes all polling functionality
	DigitalSignage.initPolling = function (self) {
		var data = self.data;

		// return new promise
		return new Promise(function (resolve, reject) {
			window.longpoll({
				src: self.src,
				maxInterval: 200,
				onLoad: function (xhr) {
					// get server data
					var serverData = JSON.parse(xhr.responseText);

					// if server data contains time, set offset
					if (serverData.serverTime) {
						serverData.timestampOffset = Date.now() - serverData.serverTime;
					}
					// otherwise use current time, set no offset
					else {
						serverData.serverTime = Date.now();
						serverData.timestampOffset = 0;
					}

					// iterate each server data key
					Object.keys(serverData).forEach(function (key) {
						// if the server data differs, update data
						if (serverData[key] !== data[key]) {
							self.ractive.set(key, serverData[key]);
						}
					});

					// resolve promise
					resolve(self);
				},
				onError: reject
			});
		});
	};

	// initializes all drawing functionality
	DigitalSignage.initDrawing = function (self) {
		return new Promise(function (resolve) {
			var data = self.data, ractive = self.ractive, last = 0;

			function ondraw() {
				var
				thisIndex = data.index || 0,
				duration  = data.collection[thisIndex].duration * 1000,
				now = Date.now() - data.timestampOffset,
				length = data.collection.length,
				nextIndex = Math.floor((now / duration) % length);

				if (thisIndex !== nextIndex) ractive.set('index', nextIndex);

				if (now - 1000 >= last) {
					ractive.set('timestamp', new Date(now));

					last = now;
				}

				requestAnimationFrame(ondraw);
			}

			requestAnimationFrame(ondraw);

			resolve(self);
		});
	};

	// initializes all resizing functionality
	DigitalSignage.initResizing = function (self) {
		var ractive = self.ractive, resizeTimeout;

		return new Promise(function (resolve) {
			function onresize() {
				resizeTimeout = clearTimeout(resizeTimeout);

				resizeTimeout = setTimeout(function () {
					resizeTimeout = clearTimeout(resizeTimeout);

					ractive.set('isResizing', false);
				}, 20);

				ractive.set('isResizing', true);
			}

			window.addEventListener('resize', onresize);

			onresize();

			resolve(self);
		});
	};

	DigitalSignage.initVideo = function (self, item, index) {
		return new Promise(function (resolve) {
			var video;

			if (false && item.backgroundType === 'video') {
				item.backgroundMedia = document.createElement('video');
				item.backgroundCanvas = document.getElementById('background-' + index);

				video = item.backgroundMedia;

				video.oncanplay = function () {
					item.duration = video.duration;
					item.naturalWidth = video.videoWidth;
					item.naturalHeight = video.videoHeight;
					item.naturalAspectRatio = item.naturalHeight / item.naturalWidth;

					video.play();
				};

				video.onplay = function () {
					DigitalSignage.updateVideo(self, item);
				};

				video.loop = true;

				video.src = item.background;

				video.load();
			}

			resolve(self);
		});
	};

	DigitalSignage.updateMenuDisplay = function (self) {
		var
		data        = self.data,
		ractive     = self.ractive,
		nextIndex   = data.index,
		lastOffset  = data.style.lastMenuOffset || 0,
		menu        = document.querySelector('.ui-menu-list'),
		parentRect  = menu.parentNode.getBoundingClientRect(),
		nextRect    = menu.querySelectorAll('.ui-menu-item')[nextIndex].getBoundingClientRect(),
		menuOffset  = Math.max(Math.floor(parentRect.left - nextRect.left + lastOffset), 0),
		caretOffset = -Math.min(Math.floor(parentRect.left - nextRect.left + lastOffset), 0),
		caretWidth  = Math.floor(nextRect.width);

		// set style properties
		ractive.set('style.menuOffset', menuOffset);

		ractive.set('style.caretOffset', caretOffset);
		ractive.set('style.caretWidth', caretWidth);

		ractive.set('style.lastMenuOffset', menuOffset);
	};

	DigitalSignage.updateTimestampDisplay = function (self) {
		var
		time   = new Date(self.data.timestamp),
		month  = 'January February March April May June July August September October November December'.split(' ')[time.getMonth()],
		date   = time.getDate(),
		hour   = (time.getHours() % 12) || 12,
		minute = ('0' + time.getMinutes()).slice(-2),
		period = time.getHours() > 11 ? 'p.m.' : 'a.m.';

		self.ractive.set('datetime', month + ' ' + date + ', ' + hour + ':' + minute + ' ' + period);
	};

	DigitalSignage.updateVideo = function (self, item) {
		var media = item.backgroundMedia, canvas = item.backgroundCanvas, context = canvas.getContext('2d');

		DigitalSignage.resizeVideo(self, item, canvas, media);

		function ondraw() {
			context.drawImage(media, media.offsetX, media.offsetY, media.width, media.height);

			item.animationFrame = requestAnimationFrame(ondraw);
		}

		item.animationFrame = requestAnimationFrame(ondraw);
	};

	DigitalSignage.resizeVideo = function (self, item, canvas, media) {
		canvas.width = canvas.clientWidth * 0.5;
		canvas.height = canvas.clientHeight * 0.5;
		canvas.aspectRatio = canvas.height / canvas.width;

		var
		canvasAspect = canvas.aspectRatio,
		imageAspect = item.naturalAspectRatio || canvasAspect,
		aspectLarger = imageAspect > canvasAspect,
		aspectSmaller = imageAspect < canvasAspect,
		sizing = canvas.getAttribute('data-sizing'),
		sizingCover = sizing === 'cover',
		sizingContain = sizing === 'contain',
		sizingNone = !sizingCover && !sizingContain;

		// size
		media.width  = sizingNone ? item.naturalWidth || canvas.width : (sizingCover && aspectLarger) || (sizingContain && aspectSmaller) ? canvas.width : canvas.height / imageAspect;
		media.height = sizingNone ? item.naturalHeight || canvas.height : (sizingCover && aspectLarger) || (sizingContain && aspectSmaller) ? canvas.width * imageAspect : canvas.height;

		// align
		if (sizingCover) {
			media.offsetX = -((media.width  - canvas.width)  / 2) || 0;
			media.offsetY = -((media.height - canvas.height) / 2) || 0;
		}

		if (sizingNone || sizingContain) {
			media.offsetX = ((canvas.width - media.width)  / 2) || 0;
			media.offsetY = ((canvas.height - media.height) / 2) || 0;
		}
	};

	window.DigitalSignage = DigitalSignage;
})();