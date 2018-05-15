var   express    = require('express');                     // import express
const bodyParser = require('body-parser');                 // import body-parser

var   app        = express();                              // load express

// import middleware functions
var   query      = require('./middleware/db_queries');     // load database queries
var   task       = require('./middleware/celery_tasks');   // load celery tasks

const config     = require('../config.json');              // load config
var   api        = require('./middleware/api_response');   // import the response class



// accept JSON Data in the http-Body
app.use(bodyParser.json());

// add headers to every response
app.use( ( req, res, next ) => {
  // Website you wish to allow to connect
  res.setHeader( 'Access-Control-Allow-Origin', 'http://' + config.http.hostname || "localhost" );
  // Request methods you wish to allow
  res.setHeader( 'Access-Control-Allow-Methods', config.http.allowMethods || "GET" );
  // Request headers you wish to allow
  res.setHeader( 'Access-Control-Allow-Headers', 'X-Requested-With,content-type' );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader( 'Access-Control-Allow-Credentials', true );
  // Pass to next layer of middleware
  next();
} );

// log every access and print method, ip and url
app.use( ( req, res , next ) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log( req.method + ' - [' + ip + '] - ' + req.originalUrl );
  next();
} );

// ===== ROUTES =====

// /history
var historyRouter = express.Router();
historyRouter.get('/', query.getHistory, ( req, res ) => {
  res.send(res.response);
})
historyRouter.post('/', query.addHistoryEntry, ( req, res ) => {
  res.send(res.response);
})
app.use('/history', historyRouter);

// /task
var taskRouter = express.Router();
taskRouter.get('/', task.getTaskStatus, ( req, res ) => {
  res.send(res.status);
 })
taskRouter.post('/:task', task.callTask, ( req, res ) => {
  console.log(res.response);
  res.send(res.response);  
 })
 taskRouter.get('/active', task.getActiveTasks, ( req, res ) => {
  console.log(res.response);
  res.send(res.response);
 })
 taskRouter.get('/queued', task.getQueuedTasks, ( req, res ) => {
   console.log(res.response);
   res.send(res.response);
 })
 taskRouter.get('/queue/status', task.getAllTasks, ( req, res ) => {
   console.log(res.response);
   res.send(res.response);
 })
 app.use('/task', taskRouter);

// /ping
app.use( '/ping', query.ping, ( req, res ) => {
  res.send( response );
})

 // /dummy
app.use('/dummy', query.dummyCall, ( req, res ) => {
  res.send( response );
})

 // default/fallback
app.use(function( req, res ) {
  console.log( 'rejected...' )
  res.send( new api.Response( res, { error: true, code: 400, message: 'api call not supported' } ) );
})

module.exports = app;