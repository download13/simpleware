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
var Router = require('simpleware').Router;

var app = new Router();
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

http.createServer(app.dispatch).listen(80);
```


**`Router` and `mw` can be used in combination:**
```javascript
var http = require('http');
var simpleware = require('simpleware');
var mw = simpleware.mw;

var router = new simpleware.Router();
router.get('/', indexHandler);

http.createServer(mw(
	staticFileServer,
	router.dispatch,
	notFoundHandler
)).listen(80);
```
