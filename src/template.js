(function (root, factory) {
	if (typeof window === 'undefined') console.log('Please be aware that this library is intended for use in the browser.');

	if (typeof define === 'function' && define.amd) {
		define(['Template'], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.Template = factory();
	}
})(typeof window !== 'undefined' ? window : this, function () {

	const defineNewProperty = (target) => {
		return (prop, val, desc) => {
			const descriptor = {
				enumerable: false,
				configurable: false,
			};

			if (!val.get && !val.set) {
				descriptor.writable = typeof val !== 'function' || desc;
				descriptor.value = val;
			} else {
				desc = val;
			}

			Object.assign(descriptor, desc);

			Object.defineProperty(target, prop, descriptor);
		};
	};

	function loadJSON(url, callback) {
		const xobj = new XMLHttpRequest();
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
		const options = Object.assign(Template.defaults, userOptions);
		const def = defineNewProperty(this);
		const element = document.getElementById(id);

		const _this = this;

		let templateNodes = document.importNode(element.content, true);


		def('element', element, {
			writable: false
		});

		def('options', {
			get: () => options,
			set: val => {
				if (typeof val === 'object') Object.assign(options, val);
			}
		});

		this.flags = {
			'l': str => str.toLowerCase(),
			'u': str => str.toUpperCase(),
			'r': str => str.split('').reverse().join('')
		};

		this.inject = obj => {
			const pattern = options.pattern.replace('$0', '(.*?)(?:/(\\w+))?');
			const regex = new RegExp(pattern, 'g');

			function replacer(source) {
				return (match, prop, flags) => {
					let result = source[prop];
					if (flags) {
						flags = flags.split('');
						flags.forEach(flag => {
							if(_this.flags[flag]) {
								_this.flags[flag](result);
							} else {
								throw new Error(`Invalid Flag in ${match}`);
							}
						});

					}
					return result;
				};
			}

			if (Array.isArray(obj)) {
				let temp = document.importNode(templateNodes, true);
				templateNodes = document.createDocumentFragment();

				obj.forEach(item => {
					const newNodes = document.importNode(temp, true);
					for (let i = newNodes.childNodes.length - 1; i >= 0; i--) {
						const elem = newNodes.childNodes[i];

						if (elem.nodeType === 3) {
							elem.textContent = elem.textContent.trim();
							if (!elem.textContent) elem.remove();
						}
					}

					newNodes.querySelectorAll('*').forEach(elem => {
						elem.innerHTML = elem.innerHTML.replace(regex, replacer(item));

						for (let attr of elem.attributes) {
							attr.value = attr.value.replace(regex, replacer(item));
						}
					});

					//console.log(newNodes);

					templateNodes.appendChild(newNodes);
				});

			} else {
				templateNodes.children.forEach(elem => {
					elem.textContent = elem.textContent.replace(regex, replacer(obj));

					for (let attr of elem.attributes) {
						attr.value = attr.value.replace(regex, replacer(obj));
					}
				});
			}
			//console.log(templateNodes);

			return _this;
		};

		this.injectJSON = url => {
			return new Promise((resolve, reject) => {
				loadJSON(url, (data) => {
					_this.inject(data);
					resolve(data);
					setTimeout(() => reject('Timed Out'), 500);
				});
			});
		};

		this.render = () => insert('render');

		this.appendTo = elem => insert('append', { elem });

		this.prependTo = elem => insert('prepend', { elem });

		function insert(method, data) {
			//console.log(templateNodes.childNodes);

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

			//unwrap(wrapper);
			element.remove();
		}
	}

	const stat = defineNewProperty(Template);

	const defaults = {
		saveOrigin: 'data',
		unwrap: true,
		pattern: '{{ $0 }}'
	};

	stat('defaults', {
		get: () => defaults,
		set: val => {
			if (typeof val === 'object') Object.assign(defaults, val);
		}
	});

	stat('auto', (data, parent = document) => {
		parent.querySelectorAll('template').forEach(template => {
			if (template.id) {
				const elem = new Template(template.id);

				if (data) elem.inject(data);

				elem.render();
			}
		});
	});

	return Template;
});
