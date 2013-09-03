/* jshint globalstrict: true, unused: false */
"use strict";

/* TabIdList class */
var TabIdList = function() {
  this.data = {};
};

TabIdList.prototype.get = function(getOptions) {
  var windowId = getOptions.windowId;
  var index = getOptions.index;
  if (toType(windowId) !== 'number' || toType(index) !== 'number') {
    throw new Error(
      'windowId or index key are not number type in argument object.');
  }

  if (!this.data.hasOwnProperty(windowId)) {
    throw new Error('TabIdList is not found windowId object.');
  }

  if (index < 0 || this.data[windowId].length <= index) {
    throw new Error('index out of range in argument object.');
  }

  return this.data[windowId][index];
};

TabIdList.prototype.find = function(findOptions) {
  var windowId = findOptions.windowId;
  var id = findOptions.id;
  if (toType(windowId) !== 'number' || toType(id) !== 'number') {
    throw new Error('Invalid argument. windowId or id key is not ' +
                    ' number in argument object.');
  }

  if (!this.data.hasOwnProperty(windowId)) {
    throw new Error("Can't find id of windowId at in data object.");
  }

  for (var i = 0; i < this.data[windowId].length; i++) {
    if (this.data[windowId][i] === id) {
      return { windowId: windowId, index: i };
    }
  }
};

TabIdList.prototype.add = function(addOptions) {
  var windowId = addOptions.windowId;
  var id = addOptions.id;
  if (toType(windowId) !== 'number' || toType(id) !== 'number') {
    throw new Error(
      'windowId or id key is not number type in argument object.');
  }

  if (!this.data.hasOwnProperty(windowId)) {
    this.data[windowId] = [];
  }
  this.data[windowId].push(id);
};

TabIdList.prototype.insert = function(insertOptions) {
  var windowId = insertOptions.windowId;
  var index = insertOptions.index;
  var id = insertOptions.id;
  if (toType(windowId) !== 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (toType(index) !== 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
  }
  if (toType(id) !== 'number') {
    throw new Error('Invalid argument. ' +
                    'id key is not number type in argument object.');
  }

  if (this.data.hasOwnProperty(windowId)) {
    this.data[windowId].splice(index, 0, id);
  } else {
    this.add({ windowId: windowId, id: id });
  }
};

TabIdList.prototype.move = function(moveOptions) {
  var windowId = moveOptions.windowId;
  var fromIndex = moveOptions.fromIndex;
  var toIndex = moveOptions.toIndex;

  if (toType(windowId) !== 'number' ||
      toType(fromIndex) !== 'number' ||
      toType(toIndex) !== 'number') {
      throw new Error(
        'windowId, fromIndex, and toIndex key' +
        ' are not number type in argument object.');
  }

  if (!this.data.hasOwnProperty(windowId)) {
    throw new Error("Don't find windowId to move function of TabIdList class.");
  }

  var length = this.data[windowId].length;
  if (0 < fromIndex && fromIndex < length || 0 < toIndex && toIndex < length) {
    var removed = this.data[windowId].splice(fromIndex, 1);
    this.data[windowId].splice(toIndex, 0, removed[0]);

    return removed[0];
  }

  throw new Error('Out of length.');
};

TabIdList.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var id = removeOptions.id;
  if (toType(windowId) !== 'number') {
    throw new Error('Invalid the value of the key in arguments.');
  }

  if (id === void 0) {
    delete this.data[windowId];
  } else {
    if (!this.data.hasOwnProperty(windowId)) {
      throw new Error('Invalid the value of the key in the arguments.');
    }

    for (var i = 0; i < this.data[windowId].length; i++) {
      if (this.data[windowId][i] === id) {
        this.data[windowId].splice(i, 1);
      }
    }
  }
};

TabIdList.prototype.Length = function(windowId) {
  if (windowId === void 0) {
    var length = 0;
    for (var i in this.data) {
      length++;
    }
    return length;
  } else if (this.data.hasOwnProperty(windowId)) {
      return this.data[windowId].length;
  } else {
    return 0;
  }
};

TabIdList.prototype.isEmpty = function(windowId) {
  if (windowId === void 0) {
    throw new Error('Invalid argument. not number.');
  }

  return this.data[windowId] === void 0 || this.data[windowId].length === 0;
};

/* TabIdHistory class */
var TabIdHistory = function() {
  this.history = {};
};

TabIdHistory.prototype.get = function(getOptions) {
  var windowId = getOptions.windowId;
  var index = getOptions.index;
  if (toType(windowId) !== 'number' ||
      toType(index) !== 'number') {
    throw new Error('Invalid type of the value of the key in the getOptions.');
  }

  if (this.history.hasOwnProperty(windowId)) {
    if (index < 0 || this.history[windowId].length <= index) {
      throw new Error('index out of range in argument object.');
    }

    return this.history[windowId][index];
  } else {
    throw new Error(
      "Can't find windowId to get function of TabIdHistory class.");
  }
};

TabIdHistory.prototype.lastPrevious = function(windowId, gap) {
  if (toType(windowId) !== 'number') {
    throw new Error('Invalid argument. First argument is not number type');
  }
  if (gap === void 0) {
    gap = 1;
  }
  if (!this.history.hasOwnProperty(windowId)) {
    throw new Error('History is not found windowId object.');
  }

  var index = this.history[windowId].length - Math.abs(gap);
  index = index > 0 ? index : 0;
  return this.history[windowId][index];
};

TabIdHistory.prototype.update = function(updateOptions) {
  var windowId = updateOptions.windowId;
  var id = updateOptions.id;
  if (toType(windowId) !== 'number' || toType(id) !== 'number') {
    throw new Error(
        'Invalid type of the value of the key in the updateOptions.');
  }

  if (!this.history.hasOwnProperty(windowId)) {
    this.history[windowId] = [];
  }

  var length = this.history[windowId].length;
  if (length === 0 || this.history[windowId][length - 1] !== id) {
    this.remove({ windowId: windowId, id: id });
    this.history[windowId].push(id);
  }
};

TabIdHistory.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var id = removeOptions.id;
  if (toType(windowId) !== 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }

  if (id === void 0) {
    // windowIdの履歴全体を削除
    delete this.history[windowId];
  } else {
    if (!this.history.hasOwnProperty(windowId)) {
      throw new Error("Don't find windowId in the history.");
    }

    for (var i = 0; i < this.history[windowId].length; i++) {
      if (this.history[windowId][i] === id) {
        this.history[windowId].splice(i, 1);
        i--;
      }
    }
  }
};

TabIdHistory.prototype.Length = function(windowId) {
  if (windowId === void 0) {
    var length = 0;
    for (var i in this.history) {
      length++;
    }
    return length;
  } else if (this.history.hasOwnProperty(windowId)) {
    return this.history[windowId].length;
  }
  return 0;
};

TabIdHistory.prototype.isEmpty = function(windowId) {
  if (windowId === void 0) {
    throw new Error('Invalid argument. not number.');
  }

  return this.history[windowId] === void 0 ||
         this.history[windowId].length <= 0;
};
