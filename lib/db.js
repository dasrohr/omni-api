const mysql      = require( 'mysql' )                   // import mysql lib
    , configRead = require( 'read-config' );            // import config reader to import yml config

const api    = require( './middleware/api_response' );  // import the response class

const config = configRead( './config.yml' );           // load config


const mysqlConfig = {
  host     : config.database.host     || 'localhost',
  port     : config.database.port     || 3306,
  user     : config.database.user     || 'omni_api',
  password : config.database.password || 'secret',
  database : config.database.name     || 'omni_loader'
}

function errorHandler( err, res, database ) {
  if ( err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH' ) { 
    response = new api.Response( res, { error: true, code: 503, message: 'db - unreachable' } );
  } else if ( err.code === 'ER_DUP_ENTRY' ) { 
    response = new api.Response( res, { error: true, code: 400, message: 'db - duplicate entry' } );
    database.close();
  } else {
    response = new api.Response( res, { error: true, code: 400, message: 'db - unkown error' } );
    console.log( err );
    database.close();
  }
  return response;
}

class Database {
  constructor( dbConfig ) {
    this.dbConnection = mysql.createConnection( dbConfig );
  }

  ping() {
    return new Promise( ( resolve, reject ) => {
      this.dbConnection.ping( ( err ) => {
        if ( err ) {
          console.log( 'DB CON ERROR: ', err.code, err.address, err.port );
          return reject( err );
        };
        resolve();
      } );
    } );
  }

  execute( sqlStatement, sqlArguments ) {
    return new Promise( ( resolve, reject ) => {

      this.dbConnection.query( sqlStatement, sqlArguments, ( err, rows ) => {
        if ( err ) { 
          console.log( 'DB EXEC ERROR: ', err.code );
          console.log( 'DB EXEC ERROR: ', err.sqlMessage );
          console.log( 'DB EXEC ERROR: ', err.sql );
          return reject( err );
        };
        resolve( rows );
      } );
    } );
  }

  close() {
    return new Promise( ( resolve, reject ) => {
      this.dbConnection.end( ( err ) => {
        if ( err ) { 
          console.log('DB CLOSE ERROR: ', err.code );
          return reject( err );
        };
        resolve();
      } );
    } );
  }
}

module.exports = { Database, mysqlConfig, errorHandler };
