const R = require('ramda');

const compose = R.compose;
const curry = R.curry;
const last = R.last;

const safeBaseType = curry(function safeTypeReturn(val, type) {
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

const splitString = curry(function split(str, delimiter) {
  if (typeof str === 'string' && typeof delimiter === 'string') {
    return str.split(delimiter);
  } else {
    return [];
  }
});

const safeString = safeBaseType('string');
const splitPath = splitString('/');

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

module.exports = {
  splitString, getFileNameFromPath, composeFilePath, safeBaseType,
};
