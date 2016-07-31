const fs = require('fs');
const R = require('ramda');
const async = require('async');
const lineFilter = require('./fileSearch');
const util = require('./transformUtilities');

const filter = R.filter;
const compose = R.compose;

const splitPath = util.splitString('/');
const safeString = util.safeBaseType('string');
const composeFilePath = util.composeFilePath;

function generateFileScan(filePath) {
  return function scanFile (callBack) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function taskCallBack(err, data) {
      if (err) {
        callBack({ warning: `Error reading ${filePath}`, code: err.code });
      } else {
        callBack(null, {
          file: filePath,
          line: lineFilter(data),
        });
      }
    });
  };
}

function removeZeroMatch(resultObj) {
  return resultObj && resultObj.line && resultObj.line.length;
}

function inspectDotFiles(filePaths) {
  const tasks = filePaths.map(generateFileScan);
  async.parallel(tasks, function asyncDone(err, results) {
    if (err) {
      console.log({ message: `error processing dir`, err: err });
    } else {
      (function sideEffect() {
        compose(R.map(console.log), filter(removeZeroMatch))(results);
      })();
    }
  });
}

function findDotFiles(fileName) {
  return fileName[0] === '.' &&
    fileName[fileName.length - 1] !== '~' &&
    fileName.indexOf('.git') === -1 &&
    fileName.indexOf('ignore') === -1;
}

function lookForProjectDotfiles(path) {
  fs.readdir(path, function callBack(err, files) {
    if (err) {
      console.log(err);
    } else {
      inspectDotFiles(
        compose(R.map(composeFilePath(path)), filter(findDotFiles))(files)
      );
    }
  });
}

module.exports = lookForProjectDotfiles;
