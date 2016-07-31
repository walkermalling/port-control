const R = require('ramda');

const filter = R.filter;
const compose = R.compose;

function splitOnNewline(string) {
  if (typeof string === 'string') {
    return string.split('\n');
  } else {
    return [];
  }
}

function lineFilter(line) {
  return !!/(:\d{4,5})|port|host/ig.exec(line) &&
    !/import|important/ig.exec(line);
}

const searchFile = compose(filter(lineFilter), splitOnNewline);

module.exports = searchFile;
