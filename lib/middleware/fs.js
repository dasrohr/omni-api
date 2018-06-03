const fs         = require('fs')                  // load fs module
    , configRead = require( 'read-config' )       // import config reader to import yml config

    , api        = require('./api_response')      // import the response class
    , config     = configRead( './config.yml' );  // load config

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

function getFolders( req, res ) {
  const path = join( config.path.plexRoot, req.query.depth || '' );
  var folders = [];

  const pathContent = readdirSync( path );

  for ( content of pathContent ) {
    if ( lstatSync( join( path, content ) ).isDirectory() ) {
      folders.push( content );
    }
  };

  var response = new api.Response( res, { data: folders });
  response.send( res );
}

module.exports = {
  getFolders
}
