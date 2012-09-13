var expect = require('chai').expect;
var simpleware = require('../simpleware');
var Router = simpleware.Router;

describe('Router', function() {
	it('should take a string as a pattern', function() {
		var r = new Router();
		r.get('/test', handler3);
		var a = makeReqRes('GET', '/test');
		r.dispatch(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
	});
	it('should take a regex as a pattern', function() {
		var r = new Router();
		r.get(/^\/tork/, handler3);
		
		var a = makeReqRes('GET', '/torl');
		r.dispatch(a.req, a.res);
		
		expect(a.res).to.not.have.property('done');
		
		a = makeReqRes('GET', '/torken');
		r.dispatch(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
	});
	it('should only fire a handler with the correct method', function() {
		var r = new Router();
		r.get('/test', handler3);
		r.post('/test', handler4);
		
		var a = makeReqRes('POST', '/test');
		r.dispatch(a.req, a.res);
		
		expect(a.res).to.not.have.property('done');
		expect(a.res).to.have.property('what', 'something');
	});
	
	it('should parse the url into a path', function() {
		var r = new Router();
		r.get('/test', handler3);
		
		var a = makeReqRes('GET', '/test/something.py?t=56&act=first');
		r.dispatch(a.req, a.res);
		
		expect(a.req).to.have.property('path');
		expect(a.req.path).to.be.equal('/test/something.py');
	});
	it('should parse the url into a query', function() {
		var r = new Router();
		r.get('/test', handler3);
		
		var a = makeReqRes('GET', '/test?t=56&act=first');
		r.dispatch(a.req, a.res);
		
		expect(a.req).to.have.property('query');
		expect(a.req.query).to.be.deep.equal({t: '56', act: 'first'});
	});
	it('should put params on a request with a matching regex', function() {
		var r = new Router();
		r.get(/^\/api\/([a-z.]+)/, handler3);
		
		var a = makeReqRes('GET', '/api/test.py');
		r.dispatch(a.req, a.res);
		
		expect(a.res).to.have.property('done', true);
		expect(a.req).to.have.property('params');
		expect(a.req.params).to.have.length('1');
		expect(a.req.params[0]).to.be.equal('test.py');
	});
	
	it('should take middleware handlers per route', function() {
		var r = new Router();
		r.get('/test', [handler1, handler2], handler4);
		
		var a = makeReqRes('GET', '/test');
		r.dispatch(a.req, a.res);
		
		expect(a.req).to.have.property('test', 4);
		expect(a.res).to.have.property('what', 'something');
	});
	
	it('should pass execution to the next middleware when there is no valid handler', function(done) {
		var r = new Router();
		r.get('/test', handler3);
		r.post('/python', handler4);
		
		var a = makeReqRes('HEAD', '/something');
		r.dispatch(a.req, a.res, function() {
			expect(a.req).to.be.an('object');
			expect(a.res).to.be.deep.equal({});
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