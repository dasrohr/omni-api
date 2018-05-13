var   express        = require('express');                     // import express
const bodyParser     = require('body-parser');                 // import body-parser

var   app            = express();                              // load express

// import middleware functions
var   query          = require('./middleware/db_queries');     // load database queries
var   task           = require('./middleware/celery_tasks');   // load celery tasks

// accept JSON Data in the http-Body
app.use(bodyParser.json());

// === Routing ===
// // set the Router for /files
// var filesRouter = express.Router();
// filesRouter.get('/', query.getAllFiles, function (req, res) {
//   res.send(req.result);
// });
// filesRouter.get('/name/:filename', query.getOneFile, function (req, res) {
//   res.send(req.file);
// });
// filesRouter.post('/name/:filename', query.addFile, function (req, res) {
//   res.send(req.newFile);
// });
// // Router: files
// app.use('/files', filesRouter);


// Add headers
app.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


var historyRouter = express.Router();
historyRouter.get('/', query.getHistory, function(req, res){
  res.send(res.response);
})
historyRouter.post('/', query.addHistoryEntry, function(req, res) {
  res.send(res.response);
})
app.use('/history', historyRouter);


// set the Router for /task
var taskRouter = express.Router();
taskRouter.get('/', task.getTaskStatus, function(req, res) {
  res.send(res.status);
 })
taskRouter.post('/:task', task.callTask, function(req, res) {
  console.log(res.response);
  res.send(res.response);  
 })
 taskRouter.get('/active', task.getActiveTasks, (req, res) => {
  console.log(res.response);
  res.send(res.response);
 })
 taskRouter.get('/queued', task.getQueuedTasks, (req, res) => {
   console.log(res.response);
   res.send(res.response);
 })
 taskRouter.get('/queue/status', task.getAllTasks, (req,res) => {
   console.log(res.response);
   res.send(res.response);
 })
 app.use('/task', taskRouter);

 // default/fallback
app.use(function(req, res) {
  res.statusCode = 400;
  res.json({ errors: [ 'api call not supported' ] })
})


module.exports = app;