const express = require("express");
const compression = require("compression");
const app = express();
const proxy = require("express-http-proxy");

app.set('port', 5000);
app.use(compression({ threshold: 1024 }));

app.get('/*', function (req, res, next) {
  if (req.url.indexOf("/assets/") === 0) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  next();
});

app.use(express.static(__dirname + '/public', {
    extensions: ['html']
}));

app.use(
    "/api",
    proxy("http://0.0.0.0:3000", {
        proxyReqPathResolver: req => req.url
    })
);

app.use((req, res, next) => {
	res.status(404);
	res.redirect('/404.html');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(app.get('port'), () => {
	console.log('Node app is running on port ' + app.get('port'));
});
