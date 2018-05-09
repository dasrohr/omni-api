var   express        = require('express');                     // import express
const bodyParser     = require('body-parser');                 // import body-parser

var   app            = express();                              // load express
var   db             = require('./db');                        // load database setup

// import middleware functions
var   query          = require('./middleware/db_queries');     // load database queries
var   task           = require('./middleware/celery_tasks');   // load celery tasks

// accept JSON Data in the http-Body
app.use(bodyParser.json());

// === Routing ===
// set the Router for /files
var filesRouter = express.Router();
filesRouter.get('/', query.getAllFiles, function (req, res) {
  res.send(req.result);
});
filesRouter.get('/name/:filename', query.getOneFile, function (req, res) {
  res.send(req.file);
});
filesRouter.post('/name/:filename', query.addFile, function (req, res) {
  res.send(req.newFile);
});
// Router: files
app.use('/files', filesRouter);

// set the Router for /task
var taskRouter = express.Router();
taskRouter.get('/', task.getTaskStatus, function(req, res) {
  res.send(res.status);
 })
taskRouter.post('/:task', task.callTask, function(req, res) {
  res.send(req.result);  
 })
 app.use('/task', taskRouter);

 // default/fallback
app.use(function(req, res) {
  res.statusCode = 400;
  res.json({ errors: [ 'api call not supported' ] })
})

module.exports = app;