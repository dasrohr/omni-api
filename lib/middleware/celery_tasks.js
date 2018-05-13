const childProcess   = require('child_process');      // import child_process
var   celery         = require('../celery');          // import celery-client
var   config         = require('../../config.json');  // load config-file
const availableTasks = config.availableTasks;         // load available celery tasks from config to catch invalid task requests

function responseBody() {
  return {
    code: 200,      
    errors: {
      error: false,
      messages: []
    },
    data: {}
  }
}

function buildResponse(res, response) {
  if (response.code !== 200) {
    response.errors.error = true;
  }

  res.statusCode = response.code
  res.response = response
}

module.exports = {
  // run celery task
  callTask: function(req, res, next) {
    console.log('task - start -', req.params.task);
    console.log(req.body);
    var response = responseBody();

    if (!req.body.data.url) {
      response.code = 400;
      response.errors.messages.push('missing task data');
      buildResponse(res, response);
      return next();
    }
    if (!req.params.task) {
      response.code = 400;
      response.errors.messages.push('missing task name');
      buildResponse(res, response);
      return next();
    }
    if (availableTasks.indexOf(req.params.task) < 0) {
      response.code = 400;
      response.errors.messages.push('unkown task');
      buildResponse(res, response);
      return next();
    }

    var result = celery.call('test.' + req.params.task, [req.body]);
    if (!result || !result.taskid) {
      response.code = 500;
      response.errors.messages.push('unable to connect to backend');
      buildResponse(res, response);
      return next();
    }
    response.data = { subitted: true, taskid: result.taskid };

    buildResponse(res, response);
    return next();
  },
  
  // collect status from a given task by ID
  getTaskStatus: function(req, res, next) {
    if (!req.query.taskId) {
      res.statusCode = 400;
      return res.json({ errors: 'missing task id' });
    }
    // run celery command localy as there is no lib to query the task_queue
    var command = childProcess.spawnSync('celery', [ 'inspect', '-j', 'query_task', req.query.taskId ]);
    stdout = JSON.parse(command.stdout);
    Object.keys(stdout).forEach(function(key, value){
      taskStatus = stdout[key]
    });
    // if first key is not the taskId, then the id is invalid or task has completed
    if (!taskStatus[req.query.taskId]) {
      res.status = { message: 'taskId not found or complete' };
    } else {
      res.status = taskStatus
    }
    return next();
  },

  // get status from all active tasks
  getActiveTasks: function(req, res, next) {
    console.log('task - status - active')
    var response = responseBody()

    // run celery command localy as there is no lib to query the task_queue
    var command = childProcess.spawnSync('celery', [ 'inspect', '-j', 'active' ]);
    stdout = JSON.parse(command.stdout);
    Object.keys(stdout).forEach(function(key, value){
      response.data = stdout[key]
    });

    buildResponse(res, response);
    return next();
  },

    // get status from all queued tasks
    getQueuedTasks: function(req, res, next) {
      console.log('task - status - queued')
      var response = responseBody()
  
      // run celery command localy as there is no lib to query the task_queue
      var command = childProcess.spawnSync('celery', [ 'inspect', '-j', 'reserved' ]);
      stdout = JSON.parse(command.stdout);
      Object.keys(stdout).forEach(function(key, value){
        response.data = stdout[key]
      });
  
      buildResponse(res, response);
      return next();
    },

    // get status from all tasks queued and active
    getAllTasks: function(req, res, next) {
      console.log('task - status - all')
      var response = responseBody()
  
      // run celery command localy as there is no lib to query the task_queue
      var command = childProcess.spawnSync('celery', [ 'inspect', '-j', 'active' ]);
      stdout = JSON.parse(command.stdout);
      Object.keys(stdout).forEach(function(key, value){
        response.data.active = stdout[key]
      });

      // run celery command localy as there is no lib to query the task_queue
      var command = childProcess.spawnSync('celery', [ 'inspect', '-j', 'reserved' ]);
      stdout = JSON.parse(command.stdout);
      Object.keys(stdout).forEach(function(key, value){
        response.data.queued = stdout[key]
      });
  
      buildResponse(res, response);
      return next();
    }
}
