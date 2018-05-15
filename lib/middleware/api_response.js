class Response {
  constructor( res, { message = undefined, data = undefined, error = undefined, code = undefined } = {} ) {
    this.error = error;    
    this.message = message;
    this.data = data;
    if ( code ) res.statusCode = code;
    if ( message ) console.log( message );
  }
}

module.exports = { Response };