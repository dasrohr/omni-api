var mysql  = require('mysql');
var config = require('../config.json');

const mysqlConfig = {
  host     : config.database.host     || 'localhost',
  port     : config.database.port     || 3306,
  user     : config.database.user     || 'omni_api',
  password : config.database.password || 'secret',
  database : config.database.name     || 'omni_loader'
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

module.exports = { Database, mysqlConfig };
