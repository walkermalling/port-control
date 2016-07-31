const fs = require('fs');
const inspector = require('./inspector');


function handleReadError(err, path) {
  if (err && err.code === 'ENOTDIR' || err.code === 'ENOENT') {
    // no need to log this
  } else {
    console.log({
      warning: 'Error tyring to read directory',
      path: path,
      code: err.code,
    });
  }
}

function getHandler(path) {
  return function scanFileName(fileName) {
    if (fileName === '.git') {
      inspector(path);
    } else {
      crawl(`${path}/${fileName}`);
    }
  };
}


function crawl(path) {
  fs.readdir(path, function callBack(err, files) {
    if (err) {
      handleReadError(err, path);
    } else {
      files.map(getHandler(path));
    }
  });
};

module.exports = crawl;

