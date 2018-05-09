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
  })
}
}
