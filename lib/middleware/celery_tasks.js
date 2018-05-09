var   celery         = require('../celery');          // import celery-client
var   config         = require('../../config.json'); // load config-file
const availableTasks = config.availableTasks;        // load available celery tasks from config to catch invalid task requests

const childProcess = require('child_process');

module.exports = {
  // run celery task
  callTask: function(req, res, next) {
    if (!req.body.echo) {
      res.statusCode = 400;
      return res.json({ errors: 'missing task data' });
    }
    if (!req.params.task) {
      res.statusCode = 400;
      return res.json({ errors: ['missing task name'] });
    }
    if (availableTasks.indexOf(req.params.task) < 0) {
      res.statusCode = 400;
      return res.json({ errors: ['unkown task'] });
    }
    var data = req.body.echo;
    var result = celery.call('test.' + req.params.task, [data]);
    if (!result || !result.taskid) {
      res.statusCode = 500;
      return res.json({ errors: ['unable to connect to backend'] });
    }
    return res.json({ subitted: true, taskid: result.taskid });
  },
  // run celery task
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
    next();
  }
}
