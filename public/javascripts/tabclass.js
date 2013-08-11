/* TabIdList class */
var TabIdList = function() {
  this.data = new Object();
};

TabIdList.prototype.get = function(getOptions) {
  var windowId = getOptions.windowId;
  var index = getOptions.index;
  if (getType(getOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(index) != 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
  }
  if (getType(this.data[windowId]) == 'undefined') {
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
  if (getType(findOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' &&
      getType(windowId) != 'undefined') {
    throw new Error('Invalid argument. windowId key is not ' +
                    ' number or undefined type in argument object.');
  }

  var searchObj = new Object();
  if (getType(windowId) == 'undefined') {
    searchObj = this.data;
  } else if (getType(id) == 'number') {
    searchObj[windowId] = this.data[windowId];
  } else {
    throw new Error('Invalid argument. ' +
                    'id key is not number type in argument object.');
  }

  for (var key in searchObj) {
    for (var i = 0; i < this.data[key].length; i++) {
      if (this.data[key][i] == id) {
        return { windowId: parseInt(key), index: i };
      }
    }
  }

  throw new Error("Can't find id.");
};

TabIdList.prototype.add = function(addOptions) {
  var windowId = addOptions.windowId;
  var id = addOptions.id;
  if (getType(addOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(id) != 'number') {
    throw new Error('Invalid argument. ' +
                    'id key is not number type in argument object.');
  }

  if (getType(this.data[windowId]) == 'undefined') {
    this.data[windowId] = new Array();
  }
  this.data[windowId].push(id);
};

TabIdList.prototype.insert = function(insertOptions) {
  var windowId = insertOptions.windowId;
  var index = insertOptions.index;
  var id = insertOptions.id;

  if (getType(insertOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' && getType(windowId) != 'undefined') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(index) != 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
  }
  if (getType(id) != 'number') {
    throw new Error('Invalid argument. ' +
                    'id key is not number type in argument object.');
  }

  if (getType(this.data[windowId]) == 'undefined') {
    this.add({ windowId: windowId, id: id });
  } else {
    this.data[windowId].splice(index, 0, id);
  }
};

TabIdList.prototype.move = function(moveOptions) {
  var windowId = moveOptions.windowId;
  var fromIndex = moveOptions.fromIndex;
  var toIndex = moveOptions.toIndex;

  if (getType(moveOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(fromIndex) != 'number') {
    throw new Error('Invalid argument. ' +
                    'fromIndex key is not number type in argument object.');
  }
  if (getType(toIndex) != 'number') {
    throw new Error('Invalid argument. ' +
                    'toIndex key is not number type in argument object.');
  }

  var length = this.data[windowId].length;
  if (0 < fromIndex && fromIndex < length || 0 < toIndex && toIndex < length) {
    var removed = this.data[windowId].splice(fromIndex, 1);
    this.data[windowId].splice(toIndex, 0, removed[0]);

    return removed[0];
  } else {
    console.log('Out of length. fromIndex, toIndex, length',
                fromIndex, toIndex, length);
    throw new Error('Out of length.');
  }
};

TabIdList.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var id = removeOptions.id;
  if (getType(removeOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }

  if (id == undefined) {
    if (getType(windowId) != 'number') {
      throw new Error('Invalid the value of the key in arguments.');
    }

    delete this.data[windowId];
  } else {
    for (var windowId in this.data) {
      if (getType(removeOptions.windowId) == 'number' &&
          removeOptions.windowId != parseInt(windowId)) {
        continue;
      }

      for (var i = 0; i < this.data[windowId].length; i++) {
        if (this.data[windowId][i] == id) {
          this.data[windowId].splice(i, 1);
        }
      }
    }
  }
};

TabIdList.prototype.Length = function(windowId) {
  if (getType(windowId) == 'undefined') {
    var length = 0;
    for (var i in this.data) {
      length++;
    }
    return length;
  } else if (getType(windowId) == 'number') {
    return this.data[windowId].length;
  } else {
    throw new Error('Invalid argument. not number or undefined.');
  }
};

TabIdList.prototype.isEmpty = function(windowId) {
  if (getType(windowId) == 'undefined') {
    throw new Error('Invalid argument. not number.');
  }

  return getType(this.data[windowId]) == 'undefined' ||
         this.data[windowId].length == 0;
};

/* TabIdHistory class */
var TabIdHistory = function() {
  this.history = new Object();
};

TabIdHistory.prototype.get = function(getOptions) {
  var windowId = getOptions.windowId;
  var index = getOptions.index;
  if (getType(getOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' ||
      getType(index) != 'number') {
    throw new Error('Invalid type of the value of the key in the getOptions.');
  }

  if (getType(this.history[windowId]) == 'undefined' ||
      this.history[windowId].length <= 0) {
    throw new Error('History is not found windowId object.');
  }
  if (index < 0 || this.history[windowId].length <= index) {
    throw new Error('index out of range in argument object.');
  }

  return this.history[windowId][index];
};

TabIdHistory.prototype.lastPrevious = function(windowId, gap) {
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. First argument is not number type');
  }
  if (gap == undefined || gap == null) {
    gap = 1;
  } else if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. Second argument is not number type');
  }
  if (getType(this.history[windowId]) == 'undefined') {
    throw new Error('History is not found windowId object.');
  }

  var index = this.history[windowId].length - Math.abs(gap);
  index = index > 0 ? index : 0;
  return this.history[windowId][index];
};

TabIdHistory.prototype.update = function(updateOptions) {
  var windowId = updateOptions.windowId;
  var id = updateOptions.id;
  if (getType(updateOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' || getType(id) != 'number') {
    throw new Error(
        'Invalid type of the value of the key in the updateOptions.');
  }

  if (this.history[windowId] == undefined) {
    this.history[windowId] = new Array();
  }

  var length = this.history[windowId].length;
  if (length == 0 || this.history[windowId][length - 1] != id) {
    this.remove({ windowId: windowId, id: id });
    this.history[windowId].push(id);
  }
};

TabIdHistory.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var id = removeOptions.id;
  if (getType(removeOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }

  if (getType(id) == 'undefined') {
    if (getType(windowId) != 'number') {
      throw new Error('Invalid argument. ' +
                      'windowId key is not number type in argument object.');
    }

    // windowIdの履歴全体を削除
    delete this.history[windowId];
  } else {
    for (var winId in this.history) {
      winId = parseInt(winId);
      if (getType(windowId) == 'number' && windowId != winId) {
        continue;
      }

      for (var i = 0; i < this.history[winId].length; i++) {
        if (this.history[winId][i] == id) {
          this.history[winId].splice(i, 1);
          i--;
        }
      }
    }
  }
};

TabIdHistory.prototype.length = function(windowId) {
  if (windowId == undefined) {
    var length = 0;
    for (var i in this.history) {
      length++;
    }
    return length;
  } else {
    if (getType(this.history[windowId]) == 'array') {
      return this.history[windowId].length;
    } else {
      return 0;
    }
  }
};

TabIdHistory.prototype.isEmpty = function(windowId) {
  if (getType(windowId) == 'undefined') {
    throw new Error('Invalid argument. not number.');
  }

  return getType(this.history[windowId]) == 'undefined' ||
         this.history[windowId].length <= 0;
};
