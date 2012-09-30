var moka = require('moka');
var describe = moka.describe;
var expect = require('expect.js');
var simpleware = require('../simpleware');
var createRouter = simpleware.createRouter;

describe('Router', function(it) {
	it('should take a string as a pattern', function() {
		var r = createRouter();
		r.get('/test', handler3);
		var a = makeReqRes('GET', '/test');
		r(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
	});
	it('should take a regex as a pattern', function() {
		var r = createRouter();
		r.get(/^\/tork/, handler3);
		
		var a = makeReqRes('GET', '/torl');
		r(a.req, a.res);
		
		expect(a.res).to.not.have.property('done');
		
		a = makeReqRes('GET', '/torken');
		r(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
	});
	it('should only fire a handler with the correct method', function() {
		var r = createRouter();
		r.get('/test', handler3);
		r.post('/test', handler4);
		
		var a = makeReqRes('POST', '/test');
		r(a.req, a.res);
		
		expect(a.res).to.not.have.property('done');
		expect(a.res).to.have.property('what', 'something');
	});
	
	it('should parse the url into a path', function() {
		var r = createRouter();
		r.get('/test', handler3);
		
		var a = makeReqRes('GET', '/test/something.py?t=56&act=first');
		r(a.req, a.res);
		
		expect(a.req).to.have.property('path');
		expect(a.req.path).to.be('/test/something.py');
	});
	it('should parse the url into a query', function() {
		var r = createRouter();
		r.get('/test', handler3);
		
		var a = makeReqRes('GET', '/test?t=56&act=first');
		r(a.req, a.res);
		
		expect(a.req).to.have.property('query');
		expect(a.req.query).to.be.eql({t: '56', act: 'first'});
	});
	it('should have query object even if there was no query string', function() {
		var r = createRouter();
		r.get('/test', handler3);
		
		var a = makeReqRes('GET', '/');
		r(a.req, a.res);
		
		expect(a.req).to.have.property('query');
	});
	it('should put params on a request with a matching regex', function() {
		var r = createRouter();
		r.get(/^\/api\/([a-z.]+)/, handler3);
		
		var a = makeReqRes('GET', '/api/test.py');
		r(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
		expect(a.req).to.have.property('params');
		expect(a.req.params).to.have.length('1');
		expect(a.req.params[0]).to.be.equal('test.py');
	});
	
	it('should take middleware handlers per route', function() {
		var r = createRouter();
		r.get('/test', [handler1, handler2], handler4);
		
		var a = makeReqRes('GET', '/test');
		r(a.req, a.res);
		
		expect(a.req).to.have.property('test', 4);
		expect(a.res).to.have.property('what', 'something');
	});
	
	it('should pass execution to the next middleware when there is no valid handler', function(done) {
		var r = createRouter();
		r.get('/test', handler3);
		r.post('/python', handler4);
		
		var a = makeReqRes('HEAD', '/something');
		r(a.req, a.res, function() {
			expect(a.req).to.be.an('object');
			expect(a.res).to.be.eql({});
			done();
		});
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

function makeReqRes(method, url) {
	var req = {};
	var res = {};
	req.method = method;
	req.url = url;
	return {req: req, res: res};
}

moka.run({format: 'brief'});