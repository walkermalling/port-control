const fs = require('fs');
const R = require('ramda');
const async = require('async');
const lineFilter = require('./fileSearch');

const filter = R.filter;
const compose = R.compose;

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

function generateFileScan(path, fileName) {
  return function scanFile (callBack) {
    const filePath = `${path}/${fileName}`;
    fs.readFile(filePath, { encoding: 'utf-8' }, function taskCallBack(err, data) {
      if (err) {
        callBack({ warning: `Error reading ${filePath}`, code: err.code });
      } else {
        const scanResult = lineFilter(data);
        callBack(null, scanResult);
      }
    });
  };
}

function generateFileScanTasks(path, files) {
  const tasks = {};
  files.forEach(function generateTask(fileName) {
    tasks[fileName] = generateFileScan(path, fileName);
  });
  return tasks;
}

function inspectDotFiles(path, files) {
  var directoryResults = {
    path: path,
    files: {},
  };

  const tasks = generateFileScanTasks(path, files);

  async.parallel(tasks, function asyncDone(err, results) {
    if (err) {
      console.log(`error processing ${path}`);
    } else {
      Object.keys(results).forEach(function assignScanResults(key) {
        if (results[key] && results[key].length) {
          directoryResults.files[key] = {
            scanResult: results[key],
          };
        }
      });
      logResults(directoryResults);
    }
  });
}

function lookForProjectDotfiles(path) {
  fs.readdir(path, function callBack(err, files) {
    if (err) {
      console.log(err);
      return;
    }
    const dotfiles = files.filter(function findDotFiles(fileName) {
      return fileName[0] === '.' &&
        fileName[fileName.length - 1] !== '~' &&
        fileName.indexOf('.git') === -1 &&
        fileName.indexOf('ignore') === -1;
    });
    inspectDotFiles(path, dotfiles);
  });
}

module.exports = lookForProjectDotfiles;
