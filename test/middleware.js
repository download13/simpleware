var moka = require('moka');
var describe = moka.describe;
var expect = require('expect.js');
var simpleware = require('../simpleware');
var mw = simpleware.mw;

describe('mw', function(it) {
	it('should take handlers as arguments', function() {
		var m = mw(handler1, handler2, handler3);
		verify(m);
	});
	it('should take an array as an argument', function() {
		var m = mw([handler1, handler2, handler3]);
		verify(m);
	});
	it('should take arrays as arguments', function() {
		var m = mw([handler1, handler2], [handler3]);
		verify(m);
	});
	it('should take an array and handler as arguments', function() {
		var m = mw([handler1, handler2], handler3);
		verify(m);
	});
	it('should take an array and handlers as arguments', function() {
		var m = mw([handler1], handler2, handler3);
		verify(m);
	});
	
	it('should stop running handlers if one doesn\'t call next', function() {
		var m = mw(handler3, handler1, handler4);
		var req = {};
		var res = {};
		m(req, res);
		
		expect(res).to.have.property('done', true);
		expect(res).to.not.have.property('what');
	});
	
	it('should make it to the end of this sequence', function() {
		var m = mw(handler1, handler2, handler1, handler4);
		var req = {};
		var res = {};
		m(req, res);
		
		expect(req).to.have.property('test', 4);
		expect(res).to.have.property('what', 'something');
	});
});

function handler1(req, res, next) {
	next();
}
function handler2(req, res, next) {
	req.test = 4;
	next();
}
function handler3(req, res) {
	res.done = true;
}
function handler4(req, res) {
	res.what = 'something';
}

function verify(m) {
	var req = {};
	var res = {};
	m(req, res);
	
	expect(req).to.have.property('test', 4);
	expect(res).to.have.property('done', true);
}

moka.run({format: 'brief'});