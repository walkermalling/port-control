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
  fs.readdir(path, function cb(err, files) {
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

function getActor(path) {
  return function actOnFileName(fileName) {
    if (fileName === '.git') {
      // search siblings for .env
      logDotFiles(path);
    } else {
      // keep crawling path
      crawl(`${path}/${fileName}`);
    }
  };
}

function supressableError(err) {
  if (err) {
    switch(err.code) {
    case 'ENOTDIR':
    case 'ENOENT':
      return true;
    default:
      return false;
    }
  }
  return false;
}

function crawl(path) {
  fs.readdir(path, function cb(err, files) {
    if (supressableError(err)) {
      return;
    } else if (err) {
      console.log(err);
      return;
    } else {
      const handleFiles = getActor(path);
      files.map(handleFiles);
    }
  });
}

function start() {
  crawl(process.argv[2] || '/');
}

start();
