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
  }
}
