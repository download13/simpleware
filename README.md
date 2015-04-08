# Deprecated!

This module's functionality has been moved into [http-router-fn](https://github.com/download13/http-router-fn) and [mw-compose](https://github.com/download13/mw-compose).


Simpleware
==========

Tiny, simple, Middleware and Routing tool.

**Install:** `npm install simpleware`

`mw` takes any number of arguments. Each argument must be a handler, or an array of handlers. Handlers will be run sequentially until one does not call `next`.

**Using the middleware functionality:**
```javascript
var http = require('http');
var mw = require('simpleware').mw;

var middlewareKit = [
	cookieParser,
	function(req, res, next) {
		req.user = getCurrentUser(req);
		next();
	}
];

var app = mw(middlewareKit, function(req, res) {
	console.log();
});

http.createServer(app).listen(80);
```

`Router` has minimal `req` changing functionality built-in.

**Using `Router`:**
```javascript
var http = require('http');

var app = require('simpleware').createRouter();
app.get('/', indexHandler); // Shortcuts for common methods
app.post('/', indexPostHandler);
app.request('head', '/', cacheCheckHandler); // Or use any method

// Regex handler matches are saved as req.params
app.get(/^\/api\/([a-z]+)/, function(req, res) {
	console.log('Called api method: ' + req.params[0]);
});

// req.path and req.query are parsed from req.url
app.get('/queryendpoint', function(req, res) {
	console.log('Called ' + req.path + 'with API key ' + req.query.key);
	console.log('Whole request url was ' + req.url);
});

// Any handlers that could be put into mw also work here
app.get('/authed', cookieParser, getUser, authedHandler);

http.createServer(app).listen(80);
```


**`Router` and `mw` can be used in combination:**
```javascript
var http = require('http');
var simpleware = require('simpleware');
var mw = simpleware.mw;

var router = simpleware.createRouter();
router.get('/', indexHandler);

http.createServer(mw(
	staticFileServer,
	router,
	notFoundHandler
)).listen(80);
```

### Caveats:
* Do not accidentally call a `next()` function more than once in the same handler. It will cause strange behavior like handlers being called out of order or too many times.
