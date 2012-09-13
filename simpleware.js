var url = require('url');
var qs = require('querystring');

var slice = Array.prototype.slice;
var concat = Array.prototype.concat;
var SHORTCUT_METHODS = ['get', 'post', 'head', 'options', 'put', 'delete'];

function Router() {
	this._routes = [];
	
	SHORTCUT_METHODS.forEach(function(method) {
		this[method] = this.request.bind(this, method);
	}, this);
	this.request = this.request.bind(this);
	this.dispatch = this.dispatch.bind(this);
}
Router.prototype = {
	dispatch: function(req, res, next) {
		var parts = url.parse(req.url);
		req.path = parts.pathname;
		if(parts.query) { // Does query parsing
			req.query = qs.parse(parts.query);
		}
		
		var method = req.method.toUpperCase();
		var routes = this._routes;
		
		for(var i = 0; i < routes.length; i++) {
			var route = routes[i];
			if(route.method != method) continue;
			
			if(typeof route.pattern != 'string') {
				var m = req.path.match(route.pattern);
				if(m != null) {
					req.params = m.slice(1); // Gets matched parameters from regex routes
					route.handler(req, res);
					return;
				}
			} else if(req.path == route.pattern) {
				route.handler(req, res);
				return;
			}
		}
		
		next && next();
	},
	request: function(method, pattern) {
		var args = slice.call(arguments, 2);
		
		this._routes.push({
			method: method.toUpperCase(),
			pattern: pattern,
			handler: args.length > 1 ? mw.apply(null, args) : args[0]
		});
	}
};

function mw() { // Middleware
	var list = concat.apply([], arguments);
	
	return function(req, res) {
		var wares = list.slice(0);
		_next();
		
		function _next() {
			if(wares.length > 0) {
				wares.shift()(req, res, _next);
			}
		}
	}
}

exports.Router = Router;
exports.mw = mw;