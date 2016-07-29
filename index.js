const fs = require('fs');
const curry = require('ramda').curry;

function returnFullPath(path, fileName) {
  return `${path}/${fileName}`;
}

const fullPath = curry(returnFullPath);

function logDotFiles(path) {
  fs.readdir(path, function cb(err, files) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`dot file in ${path}: ${files}`);
  });
}

function isGit(path, files) {
  return files.filter(function removeNonGit(fileName) {
    return fileName === '.git';
  }).map(fullPath(path));
}

function notGit(path, files) {
  return files.filter(function removeGit(fileName) {
    return fileName !== '.git';
  }).map(fullPath(path));
}

function read(path) {
  fs.readdir(path, function cb(err, files) {
    if (err && err.code === 'ENOTDIR') {
      return;
    } else if (err) {
      console.log(err)
      return;
    } else {
      isGit(path, files).map(logDotFiles);
      notGit(path, files).map(read);
    }
  });
}

function start() {
  read(process.argv[2] || '/');
}

start();
