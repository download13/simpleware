var url = require('url');
var qs = require('querystring');

var slice = Array.prototype.slice;

function Router() {
	var methods = {};
	['get', 'post'].forEach(function(method) {
		methods[method] = {
			patterns: [],
			handlers: []
		};
	});
	this._methods = methods;
	
	this.dispatch = this.dispatch.bind(this);
}
Router.prototype = {
	dispatch: function(req, res, next) {
		var parts = url.parse(req.url);
		req.path = parts.pathname;
		if(parts.query) {
			req.query = qs.parse(parts.query);
		}
		
		var method = this._methods[req.method.toLowerCase()];
		var patterns = method.patterns;
		
		for(var i = 0; i < patterns.length; i++) {
			var pattern = patterns[i];
			
			if(typeof pattern != 'string') {
				var m = req.path.match(pattern);
				if(m != null) {
					req.params = m.slice(1);
					method.handlers[i](req, res);
					return;
				}
			} else if(req.path == pattern) {
				var fn = method.handlers[i];
				console.log(fn);
				fn(req, res);
				return;
			}
		}
		
		next();
	},
	get: function(pattern, args) {
		//var args = slice.call(arguments, 1); // TODO: Maybe add a way to use per-route middleware later
		this._request(this._methods.get, pattern, args);
	},
	post: function(pattern, args) {
		//var args = slice.call(arguments, 1);
		this._request(this._methods.post, pattern, args);
	},
	_request: function(method, pattern, args) {
		method.patterns.push(pattern);
		method.handlers.push(args);
	}
};

function Middleware(list) {
	this.list = list;
	this.server = this.server.bind(this);
}
Middleware.prototype = {
	server: function(req, res) {
		var list = this.list.slice(0);
		
		function _next() {
			if(list.length > 0) {
				list.shift()(req, res, _next);
			}
		}
		
		_next();
	}
};

exports.Router = Router;
exports.Middleware = Middleware;