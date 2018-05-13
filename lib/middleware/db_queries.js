var   db = require('../db'); // load database setup

function buildResponse(res, response) {
  if (response.code !== 200) {
    response.errors.error = true;
  }

  res.statusCode = response.code
  res.response = response
}

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

module.exports = {
  // get all Files from DB
  getAllFiles: function(req, res, next) {
    db.all("SELECT * FROM files", function(err, rows) {
      req.result = rows;
      next();
    });
  },

  // get specific Filename from DB
  getOneFile: function(req, res, next) {
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
  },

  // add File to DB
  addFile: function(req, res, next) {
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
    });
  },

  // get 25 histoy entries, joined with thier filenames
  getHistory: function(req, res, next) {
    var response = responseBody()

    sqlData = db.prepare('SELECT f.date AS f_date, h.source_title, f.albart, f.alb, f.type, f.target FROM files as f JOIN history AS h USING (id) ORDER BY f_date DESC LIMIT 25').all();
    if (!sqlData) {
      response.code = 404;
      response.errors.messages.push('no history');
      buildResponse(res, response);
      return next();
    }
    response.data = sqlData;
    buildResponse(res, response);
    next();
  },

  addHistoryEntry: function(req, res, next) {
    var response = responseBody()

    if (!req.body.data) {
      response.code = 400;
      response.errors.messages.push('missing data');
      buildResponse(res, response);
      return next();
    }

    data = req.body.data;    
    if (!data.id || !data.source || !data.date || !data.url || !data.source_title) {
      response.code = 400;
      response.errors.messages.push('data incomplete');
      buildResponse(res, response);
      return next();
    }

    try {
      db.prepare('INSERT INTO history VALUES (:id, :source, :date, :playlist, :playlist_id, :url, :source_title)').run(data);
    } catch(err) {
      response.code = 400;
      response.errors.messages.push('error during sql execution');
      buildResponse(res, response);
      return next();
    }

    sqlData = db.prepare('SELECT * FROM history WHERE id == :id').get(data);
    if (!sqlData) {
      response.code = 404;
      response.errors.messages.push('entry not created');
      buildResponse(res, response);
      return next();
    }
    response.data = sqlData;
    buildResponse(res, response);
    next();
  }
}
