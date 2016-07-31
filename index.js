const crawler = require('./crawler');

function start() {
  crawler(process.argv[2] || '/');
}

start();
