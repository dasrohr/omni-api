const childProcess   = require( 'child_process' )     // import child_process lib
    , configRead     = require( 'read-config' );      // import config reader to import yml config

const celery         = require( '../celery' )         // import celery-client
    , api            = require( './api_response' );   // import the response class

const config         = configRead( './config.yml' );  // load config

/*

this code is structured like shit!
... but works. needs rework!

use some classes maybe and helper to get rid of repeating code

*/

// run celery task
function callTask( req, res ) {
  if ( !req.body.date || !req.params.task ) {
    new api.Response( res, { error: true, code: 400, message: 'queue - missing data' } ).send( res );
    return;
  } else if ( config.celery.availableTasks.indexOf(req.params.task) < 0 ) {
    new api.Response( res, { error: true, code: 400, message: 'queue - unkown task' } ).send( res );
    return;
  }

  const result = celery.call('test.' + req.params.task, [req.body]);
  if (!result || !result.taskid) {
    new api.Response( res, { error: true, code: 400, message: 'queue - broker unreachable' } ).send( res );
    return;
  }
  new api.Response( res, { data: result.taskid } ).send( res );
}
  
// collect status from a given task by ID
function getTaskStatus( req, res ) {
  var cmd = childProcess.spawnSync( 'celery', [ 'inspect', '-j', 'ping' ] );
  if ( cmd.stderr.toString() !== '' ) {
    new api.Response( res, { error: true, code: 503, message: 'queue - no worker available' } ).send( res );
    return;
  };

  if ( !req.query.taskId ) {
    new api.Response( res, { error: true, code: 400, message: 'queue - missing task id' } ).send( res );
    return;
  }

  // run celery command localy as there is no lib to query the task_queue
  var cmd = childProcess.spawnSync( 'celery', [ 'inspect', '-j', 'query_task', req.query.taskId ] );
  const stdout = JSON.parse( cmd.stdout );
  Object.keys( stdout ).forEach( function( key, value ){
    taskStatus = stdout[ key ];
  });

  // if first key is not the taskId, then the id is invalid or task has completed
  if ( !taskStatus[ req.query.taskId ] ) {
    new api.Response( res, { message: 'queue - taskId not found or completed' } ).send( res );
    return;
  } else if ( taskStatus[ req.query.taskId ][0] === 'active' ) {
    new api.Response( res, { message: 'active' } ).send( res );
    return;
  } else if ( taskStatus[ req.query.taskId ][0] === 'reserved' ) {
    new api.Response( res, { message: 'queued' } ).send( res );
    return;
  }

  new api.Response( res, { error: true, code: 500, message: 'task state is unknown - ' + taskStatus[ req.query.taskId ][0] } ).send( res );
}

// get status from all active tasks
function getActiveTasks( req, res ) {
  // run celery command localy as there is no lib to query the task_queue
  const cmd = childProcess.spawnSync('celery', [ 'inspect', '-j', 'active' ]);
  if ( cmd.stderr.toString() !== '' ) {
    new api.Response( res, { error: true, code: 503, message: 'queue - no worker available' } ).send( res );
    return;
  };
  const stdout = JSON.parse( cmd.stdout );
  var active;
  Object.keys( stdout ).forEach( function( key, value ){
    active = stdout[ key ];
  });

  new api.Response( res, { data: active } ).send( res );
}


// get status from all queued tasks
function getQueuedTasks( req, res ) {
  // run celery command localy as there is no lib to query the task_queue
  const cmd = childProcess.spawnSync('celery', [ 'inspect', '-j', 'reserved' ]);
  if ( cmd.stderr.toString() !== '' ) {
    new api.Response( res, { error: true, code: 503, message: 'queue - no worker available' } ).send( res );
    return;
  };

  const stdout = JSON.parse( cmd.stdout );
  var queued;
  Object.keys( stdout ).forEach( function( key, value ){
    queued = stdout[ key ];
  });

  new api.Response( res, { data: queued } ).send( res );
}

// get status from all tasks queued and active
function getAllTasks( req, res, next ) {
  // run celery command localy as there is no lib to query the task_queue
  var cmd = childProcess.spawnSync( 'celery', [ 'inspect', '-j', 'active' ] );
  if ( cmd.stderr.toString() !== '' ) {
    new api.Response( res, { error: true, code: 503, message: 'queue - no worker available' } ).send( res );
    return;
  };

  var stdout = JSON.parse( cmd.stdout );
  var active;
  Object.keys(stdout).forEach(function(key, value){
    active = stdout[ key ]
  });

  // run celery command localy as there is no lib to query the task_queue
  var cmd = childProcess.spawnSync( 'celery', [ 'inspect', '-j', 'reserved' ] );
  var stdout = JSON.parse( cmd.stdout );
  var queued;
  Object.keys(stdout).forEach(function(key, value){
    queued = stdout[ key ]
  });
  
  new api.Response( res, { data: { active: active, queued: queued } } ).send( res );
}

module.exports = {
  callTask,

  getTaskStatus,
  getActiveTasks,
  getQueuedTasks,
  getAllTasks
}