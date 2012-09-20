var url = require('url');
var qs = require('querystring');

var slice = Array.prototype.slice;
var concat = Array.prototype.concat;
var SHORTCUT_METHODS = ['get', 'post', 'head', 'options', 'put', 'delete'];

function createRouter() {
	var routes = {};
	var router = dispatch.bind(null, routes);

	router.request = request.bind(null, routes);
	SHORTCUT_METHODS.forEach(function(method) {
		router[method] = request.bind(null, routes, method);
	});

	return router;
}

function request(routes, method, pattern) {
  method = method.toUpperCase();

	var args = slice.call(arguments, 3),
      routeMethod = routes[method] || (routes[method] = []);

	routeMethod.push({
		method: method,
		pattern: pattern,
		handler: args.length > 1 ? mw(args) : args[0]
	});
}

function dispatch(routes, req, res, next) {
	var parts = url.parse(req.url),
      method = req.method.toUpperCase(),
      routeMethod = routes[method];

  if (!routeMethod) return false; //If there are no routes for the current method, why bother?

	req.path = parts.pathname;
	if(parts.query) { // Does query parsing
		req.query = qs.parse(parts.query);
	}

	for(var i = 0, l = routeMethod.length; i < l; i++) {
		var route = routeMethod[i];

		//if(route.method != method) continue;

		if(typeof route.pattern !== 'string') {
			var m = req.path.match(route.pattern);
			if(m != null) {
				req.params = m.slice(1); // Gets matched parameters from regex routes
				route.handler(req, res, next);
				return;
			}
		} else if(req.path === route.pattern) {
			route.handler(req, res, next);
			return;
		}
	}
	next && next();
}


function mw() { // Middleware
	var list = concat.apply([], arguments);

	return function(req, res) {
		var listPlace = 0,
        listLength = list.length;

		_next();

		function _next() {
			if (listPlace < listLength) {
				list[listPlace++](req, res, _next);
			}
		}
	}
}

exports.mw = mw;
exports.createRouter = createRouter;

