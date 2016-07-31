const fs = require('fs');
const R = require('ramda');
const async = require('async');
const lineFilter = require('./fileSearch');

const filter = R.filter;
const compose = R.compose;
const curry = R.curry;
const last = R.last;

/* string transforms */

const splitString = curry(function split(str, delimiter) {
  if (typeof str === 'string' && typeof delimiter === 'string') {
    return str.split(delimiter);
  } else {
    return [];
  }
});

function getFileNameFromPath(filePath) {
  if (typeof filePath !== 'string') {
    console.log(`warning: expected string for filePath: ${filePath}`);
    return '';
  }
  return compose(safeString, last, splitPath)(filePath);
}

const composeFilePath = curry(function joinStrings(path, fileName) {
  return `${path}/${fileName}`;
});

/* stupid type fallbacks */

const safe = curry(function safeTypeReturn(val, type) {
  if (typeof type !== 'string') {
    console.log(`warning: expected string for type: ${type}`);
    return undefined;
  } else {
    const baseCase;
    switch (type) {
    case 'string':
      baseCase = '';
      break;
    case 'number':
      baseCase = 0;
      break;
    case 'object':
      baseCase = {};
      break;
    case 'array':
      baseCase = [];
      break;
    default:
      baseCase = undefined;
    }
    if (typeof val !== type) {
      return baseCase;
    } else {
      return val;
    }
  }
});

/* curried */

const splitPath = splitString('/');
const safeString = safe('string');
                              

/* functions */

function logResults(results) {
  console.log(`\nDIR: ${results.path}`);
  Object.keys(results.files).forEach(function logFileResults(fileName) {
    console.log(`  FILE: ${fileName}`);
    if (results.files[fileName]) {
      results.files[fileName].scanResult.forEach(function logLine(line) {
        console.log(`    LINE: ${line}`);
      });
    }
  });
}

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
