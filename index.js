const fs = require('fs');
const curry = require('ramda').curry;

function returnFullPath(path, fileName) {
  return `${path}/${fileName}`;
}

const fullPath = curry(returnFullPath);

function logFile(fileName) {
  console.log(`├──${fileName}`);
}

function logDotFiles(path) {
  fs.readdir(path, function callBack(err, files) {
    if (err) {
      console.log(err);
      return;
    }
    const dotfiles = files.filter(function findDotFiles(fileName) {
      return fileName[0] === '.';
    });
    console.log(path);
    dotfiles.map(logFile);
  });
}

function getHandler(path) {
  return function scanFileName(fileName) {
    if (fileName === '.git') {
      // search siblings for .env
      logDotFiles(path);
    } else {
      // keep crawling path
      crawl(`${path}/${fileName}`);
    }
  };
}

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

function crawl(path) {
  fs.readdir(path, function callBack(err, files) {
    if (err) {
      handleReadError(err, path);
    } else {
      files.map(getHandler(path));
    }
  });
}

function start() {
  crawl(process.argv[2] || '/');
}

start();
