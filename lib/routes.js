const express    = require( 'express' )                     // import express
    , bodyParser = require( 'body-parser' )                 // import body-parser
    , configRead = require( 'read-config' );                // import config reader to import yml config

const app        = express();                               // load express

// import middleware functions
const dbQuery    = require( './middleware/db_queries' )     // load database queries
    , task       = require( './middleware/celery_tasks' )   // load celery tasks
    , status     = require( './middleware/status' )         // load status functions

    , api        = require( './middleware/api_response' );  // import the response class

const config     = configRead( './config.yml' )             // load config

// ===== configure express =====
// accept JSON Data in the http-Body
app.use( bodyParser.json() );
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

// ===== ROUTING =====
// Router
const rootRouter    = express.Router()
    , historyRouter = express.Router()
    , taskRouter    = express.Router();

// Routes
app.use( '/',        rootRouter );
app.use( '/history', historyRouter );
app.use( '/task',    taskRouter );


// === / ===
// GETs
rootRouter.get( '/ping' , status.ping );         // run a ping against all backends (db & celery)
// POSTs
rootRouter.post( '/dummy', dbQuery.dummyCall );  // sandbox


// === /history ===
// GETs
historyRouter.get( '/', dbQuery.getHistory );
// POSTs
historyRouter.post( '/', dbQuery.addHistoryEntry );


// === /task ===
// GETs
taskRouter.get('/', task.getTaskStatus );                // return the status of a taskId
taskRouter.get('/queue/active', task.getActiveTasks );   // return all active tasks in an array
taskRouter.get('/queue/waiting', task.getQueuedTasks );  // return all queued tasks in an array
taskRouter.get('/queue/all', task.getAllTasks );         // return all active and queued tasks in two seperate arrays within one object
// POSTs
taskRouter.post('/:task', task.callTask );               // start a task with the given name. needs to be allowed by config (celery.allowedTasks)

// default/fallback
app.use(function( req, res ) {
  console.log( 'rejected...' )
  res.send( new api.Response( res, { error: true, code: 400, message: 'not supported' } ) );
})

module.exports = app;