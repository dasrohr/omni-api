/*
CREATE TABLE IF NOT EXISTS `files` (

  `id`             INT(16)                          NOT NULL AUTO_INCREMENT, 
  `videoId`        VARCHAR(24)   CHARACTER SET utf8 NOT NULL UNIQUE,
  `fileType`       VARCHAR(1)    CHARACTER SET utf8 NOT NULL,
  `filePath`       VARCHAR(64)   CHARACTER SET utf8 NOT NULL,
  `fileName`       VARCHAR(12)   CHARACTER SET utf8 NOT NULL UNIQUE, 
  `linkTarget`     VARCHAR(64)   CHARACTER SET utf8          DEFAULT NULL,
  `tagTitle`       VARCHAR(64)   CHARACTER SET utf8 NOT NULL,
  `tagAlbumAritst` VARCHAR(32)   CHARACTER SET utf8 NOT NULL,
  `tagArtist`      VARCHAR(32)   CHARACTER SET utf8 NOT NULL,
  `tagAlbum`       VARCHAR(32)   CHARACTER SET utf8 NOT NULL,
  `date`           DATETIME                         NOT NULL,

PRIMARY KEY ( `id`, `videoId` )
);

CREATE TABLE IF NOT EXISTS `history` (

  `id`             INT(16)                          NOT NULL AUTO_INCREMENT, 
  `videoId`        VARCHAR(24)   CHARACTER SET utf8 NOT NULL UNIQUE,
  `videoTitle`     VARCHAR(64)   CHARACTER SET utf8 NOT NULL,
  `playlistId`     VARCHAR(32)   CHARACTER SET utf8          DEFAULT NULL,
  `playlistTitle`  VARCHAR(64)   CHARACTER SET utf8          DEFAULT NULL,
  `url`            VARCHAR(256)  CHARACTER SET utf8 NOT NULL,
  `downloadSource` VARCHAR(16)   CHARACTER SET utf8 NOT NULL,
  `date`           DATETIME                         NOT NULL, 

PRIMARY KEY ( `id`, `videoId` )
);

CREATE TABLE IF NOT EXISTS `user` (

  `id`       INT(16)                         NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(24)  CHARACTER SET utf8 NOT NULL UNIQUE,
  `sectet`   VARCHAR(256) CHARACTER SET utf8 NOT NULL,
  `salt`     VARCHAR(24)  CHARACTER SET utf8 NOT NULL,

PRIMARY KEY ( `id`, `username` )
);

CREATE TABLE IF NOT EXISTS `info` (

  `setting`  VARCHAR(16) CHARACTER SET utf8 NOT NULL UNIQUE,
  `value`    VARCHAR(16) CHARACTER SET utf8 NOT NULL,

PRIMARY KEY ( `setting` )
);
*/

const db  = require('../db')            // load database setup
    , api = require('./api_response');  // import the response class

// dummy call
function dummyCall( req, res ) {
  req.body.id = Math.random().toString(36).substring(7);

  if ( !req.body.id || !req.body.source || !req.body.url || !req.body.title ) {
    response = new api.Response( res, { error: true, code: 400, message: 'data incomplete' } );
    return response.send( res );
  }

  database = new db.Database( db.mysqlConfig );
  
  sqlStatementValues = {
    videoId:        req.body.id,
    videoTitle:     req.body.title,
    playlistId:     req.body.playlistId || null,
    playlistTitle:  req.body.playlistTitle || null,
    url:            req.body.url,
    downloadSource: req.body.source,
  };

  database.ping()
  .then( () => database.execute( 'INSERT INTO `history` SET `date` = NOW(), ?', sqlStatementValues ) )
  .then( () => database.execute( 'SELECT  *, DATE_FORMAT(`date`, "%Y-%m-%d %T") AS `date` FROM `history` WHERE `videoId` = ?', sqlStatementValues.videoId ) )
  .then( rows => { 
    response = new api.Response( res, { data: rows } );
    database.close();
  } )
  .catch( err => db.errorHandler( err, res ) )
  .then( () => response.send( res ) );

}

// ================================= dummy ende

// add a file to the files table
function addFile( req, res ) {
  if ( !req.body.id || !req.body.path || !req.body.filename || !req.body.title || !req.body.albart || !req.body.art || !req.body.alb ) {
    response = new api.Response( res, { error: true, code: 400, message: 'data incomplete' } );
    return response.send( res );
  }

  database = new db.Database( db.mysqlConfig );

  sqlStatementValues = {
    videoId:        req.body.id,
    fileType:       req.body.type || 'f',
    filePath:       req.body.path,
    fileName:       req.body.filename,
    linkTarget:     req.body.target || null,
    tagTitle:       req.body.title,
    tagAlbumAritst: req.body.albart,
    tagArtist:      req.body.art,
    tagAlbum:       req.body.alb,
  };

  database.ping()
  .then( () => database.execute( 'INSERT INTO `files` SET `date` = NOW(), ?', sqlStatementValues ) )
  .then( () => database.execute( 'SELECT *, DATE_FORMAT(`date`, "%Y-%m-%d %T") AS `date` FROM `files` WHERE `fileName` = ?', sqlStatementValues.fileName ) )
  .then( rows => { 
    response = new api.Response( res, { data: rows } );
    database.close();
  } )
  .catch( err => db.errorHandler( err, res, database ) )
  .then( () => response.send( res ) );
}
 
// get 25 histoy entries, joined with thier filenames
function getHistory( req, res ) {
  database = new db.Database( db.mysqlConfig );
 
  database.ping()
  .then( () => database.execute( 'SELECT `f.date` AS `f_date`, `h.source_title`, `f.albart`, `f.alb`, `f.type`, `f.target` FROM `files` AS `f` JOIN `history` AS `h` USING ( `id` ) ORDER BY `f_date` DESC LIMIT 25' ) )
  .then( rows => {
    response = new api.Response( res, { data: rows } );
    database.close();
  } )
  .catch( err => db.errorHandler( err, res, database ) )
  .then( () => response.send( res ) );
}

// add an entry to the history table
function addHistoryEntry( req, res ) {
  if ( !req.body.id || !req.body.source || !req.body.url || !req.body.title ) {
    response = new api.Response( res, { error: true, code: 400, message: 'data incomplete' } );
    return response.send( res );
  }

  database = new db.Database( db.mysqlConfig );

  sqlStatementValues = {
    videoId:        req.body.id,
    videoTitle:     req.body.title,
    playlistId:     req.body.playlistId || null,
    playlistTitle:  req.body.playlistTitle || null,
    url:            req.body.url,
    downloadSource: req.body.source,
  };

  database.ping()
  .then( () => database.execute( 'INSERT INTO `history` SET ?', sqlStatementValues ) )
  .then( () => database.execute( 'SELECT  *, DATE_FORMAT(`date`, "%Y-%m-%d %T") AS date FROM `history` WHERE `videoId` = ?', sqlStatementValues.videoId ) )
  .then( rows => {
    response = new api.Response( res, { data: rows } );
    database.close();
  } )
  .catch( err => db.errorHandler( err, res, database ) )
  .then( () => response.send( res ) );
}

module.exports = {
  dummyCall,

  addFile,

  addHistoryEntry,
  getHistory
 }