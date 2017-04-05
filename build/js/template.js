'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
	if (typeof window === 'undefined') console.log('Please be aware that this library is intended for use in the browser.');

	if (typeof define === 'function' && define.amd) {
		define(['Template'], factory);
	} else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.Template = factory();
	}
})(typeof window !== 'undefined' ? window : undefined, function () {

	var defineNewProperty = function defineNewProperty(target) {
		return function (prop, val, desc) {
			var descriptor = {
				enumerable: false,
				configurable: false
			};

			if (!val.get && !val.set) {
				descriptor.writable = typeof val !== 'function' || desc;
				descriptor.value = val;
			} else {
				desc = val;
			}

			_extends(descriptor, desc);

			Object.defineProperty(target, prop, descriptor);
		};
	};

	function loadJSON(url, callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType('application/json');
		xobj.open('GET', url, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(JSON.parse(xobj.responseText));
			}
		};
		xobj.send(null);
	}

	function Template(id, userOptions) {
		var options = _extends(Template.defaults, userOptions);
		var def = defineNewProperty(this);
		var element = document.getElementById(id);

		var _this = this;

		var templateNodes = document.importNode(element.content, true);

		def('element', element, {
			writable: false
		});

		def('options', {
			get: function get() {
				return options;
			},
			set: function set(val) {
				if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') _extends(options, val);
			}
		});

		this.flags = {
			'l': function l(str) {
				return str.toLowerCase();
			},
			'u': function u(str) {
				return str.toUpperCase();
			},
			'r': function r(str) {
				return str.split('').reverse().join('');
			}
		};

		this.inject = function (obj) {
			var pattern = options.pattern.replace('$0', '(.*?)(?:/(\\w+))?');
			var regex = new RegExp(pattern, 'g');

			function replacer(source) {
				return function (match, prop, flags) {
					var result = source[prop];
					if (flags) {
						flags = flags.split('');
						flags.forEach(function (flag) {
							if (_this.flags[flag]) {
								_this.flags[flag](result);
							} else {
								throw new Error('Invalid Flag in ' + match);
							}
						});
					}
					return result;
				};
			}

			if (Array.isArray(obj)) {
				var temp = document.importNode(templateNodes, true);
				templateNodes = document.createDocumentFragment();

				obj.forEach(function (item) {
					var newNodes = document.importNode(temp, true);
					for (var i = newNodes.childNodes.length - 1; i >= 0; i--) {
						var elem = newNodes.childNodes[i];

						if (elem.nodeType === 3) {
							elem.textContent = elem.textContent.trim();
							if (!elem.textContent) elem.remove();
						}
					}

					newNodes.querySelectorAll('*').forEach(function (elem) {
						elem.innerHTML = elem.innerHTML.replace(regex, replacer(item));

						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = elem.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var attr = _step.value;

								attr.value = attr.value.replace(regex, replacer(item));
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator.return) {
									_iterator.return();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}
					});

					templateNodes.appendChild(newNodes);
				});
			} else {
				templateNodes.children.forEach(function (elem) {
					elem.textContent = elem.textContent.replace(regex, replacer(obj));

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = elem.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var attr = _step2.value;

							attr.value = attr.value.replace(regex, replacer(obj));
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				});
			}

			return _this;
		};

		this.injectJSON = function (url) {
			return new Promise(function (resolve, reject) {
				loadJSON(url, function (data) {
					_this.inject(data);
					resolve(data);
					setTimeout(function () {
						return reject('Timed Out');
					}, 500);
				});
			});
		};

		this.render = function () {
			return insert('render');
		};

		this.appendTo = function (elem) {
			return insert('append', { elem: elem });
		};

		this.prependTo = function (elem) {
			return insert('prepend', { elem: elem });
		};

		function insert(method, data) {

			switch (method) {
				case 'append':
					data.elem.append(templateNodes);
					break;
				case 'prepend':
					data.elem.prepend(templateNodes);
					break;
				case 'render':
					element.parentNode.insertBefore(templateNodes, element);
					break;
			}

			element.remove();
		}
	}

	var stat = defineNewProperty(Template);

	var defaults = {
		saveOrigin: 'data',
		unwrap: true,
		pattern: '{{ $0 }}'
	};

	stat('defaults', {
		get: function get() {
			return defaults;
		},
		set: function set(val) {
			if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') _extends(defaults, val);
		}
	});

	stat('auto', function (data) {
		var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

		parent.querySelectorAll('template').forEach(function (template) {
			if (template.id) {
				var elem = new Template(template.id);

				if (data) elem.inject(data);

				elem.render();
			}
		});
	});

	return Template;
});