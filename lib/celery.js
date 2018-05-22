const celery     = require( 'node-celery' )     // import celery lib
    , configRead = require( 'read-config' );    // import config reader to import yml config

const config = configRead( './config.yml' );   // load config


client = celery.createClient({
    CELERY_BROKER_URL     : config.celery.broker  || 'amqp://',
    CELERY_RESULT_BACKEND : config.celery.backend || 'amqp://'
});
 
client.on('error', function(err) {
  console.log('CELERY ERROR: ', err);
});

module.exports = client