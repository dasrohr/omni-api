var sqlite = require('better-sqlite3');
var config = require('../config.json')

var dbFile = config.databaseFile || './default.db';

var db = new sqlite(dbFile);

module.exports = db;
