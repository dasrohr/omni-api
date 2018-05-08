var express = require('express');
const bodyParser = require('body-parser');
var celery = require('./celery');
var config = require('../config.json');

var app = express();
var db = require('./db');

const availableTasks = config.availableTasks;




// === Routung Middleware ===
// run celery task
function callTask(req, res, next) {
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

// get all Files in DB
function getAllFiles(req, res, next) {
  db.all("SELECT * FROM files", function(err, rows) {
    req.result = rows;
    next();
  });
}

// get specific Filename from DB
function getOneFile(req, res, next) {
  db.all("SELECT * FROM files WHERE filename == ?", req.params.filename, function(err, rows) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: ['unkonwn error'] });
    }
    if (rows.length === 0) {
      res.statusCode = 404;
      return res.json({ errors: ['file not found'] });
    }
    req.file = rows;
    next();
  })
}

// add File to DB
function addFile(req, res, next) {
  if (!req.body.path) {
    res.statusCode = 400;
    return res.json({ errors: ['missing path'] });
  }
  sql = db.prepare("INSERT INTO files (filename, path) VALUES (?, ?)");
  sql.run(req.params.filename, req.body.path);
  sql.finalize();

  // return the new file
  db.all("SELECT * FROM files WHERE filename == ?", req.params.filename, function(err, rows) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: ['unkonwn error'] });
    }
    if (rows.length === 0) {
      res.statusCode = 404;
      return res.json({ errors: ['file not created'] });
    }
    req.newFile = rows;

    next();
  })
}

// accept JSON Data in the http-Body
app.use(bodyParser.json());

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