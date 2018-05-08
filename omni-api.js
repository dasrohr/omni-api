#!/usr/bin/env node

var app = require('./lib/routes');
var config = require('./config.json');

var port = config.httpPort;

// Which port to listen on
app.set('port', port || 3000);

// Start listening for HTTP requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Example app listening at :%s', port);
});