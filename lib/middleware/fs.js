const fs         = require('fs')                  // load fs module
    , configRead = require( 'read-config' )       // import config reader to import yml config

    , api        = require('./api_response')      // import the response class
    , config     = configRead( './config.yml' );  // load config



function getAlbum( req, res ) {
  const getDirectories = source => readdirSync(config.path.plexRoot).map(name => join(config.path.plexRoot, name)).filter(isDirectory)

  albums = fs.readdirSync( config.path.plexRoot );
  var response = new api.Response( res, { data: albums });
  response.send( res );
}

function getArtist() {

}

module.exports = {
  getAlbum,
  getArtist
}
