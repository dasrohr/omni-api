const db  = require('../db');           // load database setup
const api = require('./api_response');  // import the response class

// ping check
function ping( req, res ) {
  database = new db.Database( db.mysqlConfig );

  database.ping()
  .then( () => { 
    response = new api.Response( res, { message: 'pong' } );
    database.close(); 
  } )
  .catch( err => response = db.errorHandler( err, res, database ) )
  .then( () => response.send( res ) );
}

module.exports = { ping }