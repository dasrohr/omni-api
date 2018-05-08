var sqlite = require('sqlite3');
var config = require('../config.json')

var dbFile = config.databaseFile || './default.db';

var db = new sqlite.Database(dbFile);

module.exports = db;
