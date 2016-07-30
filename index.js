const fs = require('fs');
const curry = require('ramda').curry;
const async = require('async');

function logResults(results) {
  console.log(results.path);
  Object.keys(results.files).forEach(function logFileResults(fileName) {
    console.log(`├──${fileName}`);
    if (results.files[fileName]) {
      results.files[fileName].scanResult.forEach(function logLine(line) {
        console.log(`|  ├──${line}`);
      });
    }
  });
}

function generateFileScan(path, fileName) {
  return function scanFile (callBack) {
    const filePath = `${path}/${fileName}`;
    fs.readFile(filePath, { encoding: 'utf-8' }, function taskCallBack(err, data) {
      if (err) {
        console.log({ warning: `Error reading ${filePath}`, code: err.code });
        callBack(err);
      } else {
        const scanResult = data.split('\n').filter(function findPortConfig(line) {
          return line.indexOf('port') > -1 ||
            line.indexOf('localhost') > -1;
        });
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

function getHandler(path) {
  return function scanFileName(fileName) {
    if (fileName === '.git') {
      lookForProjectDotfiles(path);
    } else {
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
