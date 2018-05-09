var   express    = require('express');                     // import express
const bodyParser = require('body-parser');                 // import body-parser
var   celery     = require('./celery');                    // import celery-client

var   app        = express();                              // load express
var   db         = require('./db');                        // load database setup

// import middleware functions
var   query      = require('./middleware/db_queries');     // load database queries
var   task       = require('./middleware/celery_tasks');   // load celery tasks

var   config     = require('../config.json');              // load config-file
const availableTasks = config.availableTasks;


// accept JSON Data in the http-Body
app.use(bodyParser.json());

// === Routing ===
// set the Router for /files
var filesRouter = express.Router();
filesRouter.get('/', getAllFiles, function (req, res) {
  res.send(req.result);
});
filesRouter.get('/name/:filename', getOneFile, function (req, res) {
  res.send(req.file);
});
filesRouter.post('/name/:filename', addFile, function (req, res) {
  res.send(req.newFile);
});
app.use('/files', filesRouter);

// non routed APIs
app.post('/celery/:task', callTask, function(req, res) {
  res.send(req.result);  
 })

 // default/fallback
app.use(function(req, res) {
  res.statusCode = 400;
  res.json({ errors: [ 'api call not supported' ] })
})

module.exports = app;