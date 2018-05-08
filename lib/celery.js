var celery = require('node-celery'),
  client = celery.createClient({
      CELERY_BROKER_URL: 'amqp://',
      CELERY_RESULT_BACKEND: 'amqp://'
  });
 
client.on('error', function(err) {
  console.error('Backend error');
});

module.exports = client