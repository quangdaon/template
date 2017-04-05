/**
 * Created by Quangdao on 4/3/2017.
 */

(function () {
	'use strict';

	console.log(Template);

	var test1 = new Template('test1', {
		saveOrigin: 'id',
		unwrap: true
	});

	test1.inject([{
		name: 'Pete'
	}, {
		name: 'Dave'
	}, {
		name: 'Martha'
	}]);

	test1.appendTo(meep);

	var test2 = new Template('test2');

	test2.injectJSON('./data/students.json').then(function () {
		test2.render();
	}).catch(function (error) {
		console.log(error);
	});

})();