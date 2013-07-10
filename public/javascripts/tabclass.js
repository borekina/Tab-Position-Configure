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

TabIdList.prototype.add = function(addOptions) {
  var windowId = addOptions.windowId;
  var tabId = addOptions.tabId;
  if (getType(addOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(tabId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'tabId key is not number type in argument object.');
  }

  if (getType(this.data[windowId]) == 'undefined') {
    this.data[windowId] = new Array();
  }
  this.data[windowId].push(tabId);
};

TabIdList.prototype.insert = function(insertOptions) {
  var windowId = insertOptions.windowId;
  var index = insertOptions.index;
  var tabId = insertOptions.tabId;
  if (getType(insertOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' &&
      getType(windowId) != 'undefined') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(index) != 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
  }
  if (getType(tabId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'tabId key is not number type in argument object.');
  }

  if (getType(this.data[windowId]) == 'undefined') {
    this.add({ windowId: windowId, tabId: tabId });
  } else {
    this.data[windowId].splice(index, 0, tabId);
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

  var removed = this.data[windowId].splice(fromIndex, 1);
  this.data[windowId].splice(toIndex, 0, removed[0]);

  return removed[0];
};

TabIdList.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var tabId = removeOptions.tabId;
  if (getType(removeOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }

  if (getType(tabId) == 'undefined') {
    if (getType(windowId) != 'number') {
      throw new Error('Invalid argument. ' +
                      'windowId key is not number type in argument object.');
    }

    // windowIdのタブ情報全体を削除
    delete this.data[windowId];
  } else {
    var searchObj = new Object();
    if (getType(windowId) == 'undefined') {
      searchObj = this.data;
    } else if (getType(tabId) == 'number') {
      searchObj[windowId] = this.data[windowId];
    } else {
      throw new Error('Invalid argument. ' +
                      'tabId key is not number type in argument object.');
    }

    // windowId内のIDを削除
    for (var key in searchObj) {
      for (var i = 0; i < this.data[key].length; i++) {
        if (this.data[key][i] == tabId) {
          return this.data[key].splice(i, 1);
        }
      }
    }
  }
};

TabIdList.prototype.find = function(findOptions) {
  var windowId = findOptions.windowId;
  var tabId = findOptions.tabId;
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
  } else if (getType(tabId) == 'number') {
    searchObj[windowId] = this.data[windowId];
  } else {
    throw new Error('Invalid argument. ' +
                    'tabId key is not number type in argument object.');
  }

  for (var key in searchObj) {
    for (var i = 0; i < this.data[key].length; i++) {
      if (this.data[key][i] == tabId) {
        return { windowId: parseInt(key), index: i };
      }
    }
  }

  throw new Error("Can't find tabId.");
};

TabIdList.prototype.length = function(windowId) {
  if (getType(windowId) == 'undefined') {
    var i = 0;
    for (; this.data[i] != undefined; i++) { }
    return i;
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

  return getType(this.data[windowId]) == 'undefined';
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
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(index) != 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
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
  var tabId = updateOptions.tabId;
  if (getType(updateOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type in argument object.');
  }
  if (getType(tabId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'tabId key is not number type in argument object.');
  }

  if (this.isEmpty(windowId)) {
    this.history[windowId] = new Array();
  }

  var length = this.history[windowId].length;
  if (length == 0 ||
      this.get({ windowId: windowId, index: length - 1 }) != tabId) {
    this.remove({ windowId: windowId, tabId: tabId });
    this.history[windowId].push(tabId);
    return this.history[windowId].length - 1;
  } else {
    return null;
  }
};

TabIdHistory.prototype.remove = function(removeOptions) {
  var windowId = removeOptions.windowId;
  var tabId = removeOptions.tabId;
  if (getType(removeOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }

  if (getType(tabId) == 'undefined') {
    if (getType(windowId) != 'number') {
      throw new Error('Invalid argument. ' +
                      'windowId key is not number type in argument object.');
    }

    // windowIdの履歴全体を削除
    delete this.history[windowId];
  } else {
    var searchObj = new Object();
    if (getType(windowId) == 'undefined') {
      searchObj = this.history;
    } else if (getType(tabId) == 'number') {
      searchObj[windowId] = this.history[windowId];
    } else {
      throw new Error('Invalid argument. ' +
                      'tabId key is not number type in argument object.');
    }

    // windowId内の履歴を削除
    var count = 0;
    for (var key in searchObj) {
      for (var i = 0; i < this.history[key].length; i++) {
        if (this.history[key][i] == tabId) {
          this.history[key].splice(i, 1);
          i--;
          count++;
        }
      }
    }

    return count;
  }
};

TabIdHistory.prototype.isEmpty = function(windowId) {
  if (getType(windowId) == 'undefined') {
    throw new Error('Invalid argument. not number.');
  }

  return getType(this.history[windowId]) == 'undefined' ||
         this.history[windowId].length <= 0;
};
