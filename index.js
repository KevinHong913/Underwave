var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 8081));

// app.use(express.static('public'));
app.use(express.static('./'));

// views is directory for all template files
// app.set('views', __dirname);
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

// Initialize the app.
var server = app.listen(process.env.PORT || 8081, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});

