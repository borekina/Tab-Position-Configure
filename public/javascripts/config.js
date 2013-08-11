var lastFocusWindowId = undefined;
var tabIds = new TabIdList();
var tabIdHistory = new TabIdList();
var focusTabHistory = new TabIdHistory();

var Lock = function() {
  this.__lock__ = 0;
};

Lock.prototype.Lock = function() {
  this.__lock__++;
};

Lock.prototype.UnLock = function() {
  if (this.__lock__ > 0) {
    this.__lock__--;
  }
};

Lock.prototype.IsLocked = function() {
  return this.__lock__ > 0;
};

// This has become true after using ClosedFocusTab.
// It is closed, you should set false.
var afterClosedFocusTab = new Lock();

/* functions */
function MoveTab(TabIdHistory, moveOptions, callback)
{
  var windowId = moveOptions.windowId;
  var tabId = moveOptions.tabId;
  var state = moveOptions.state;
  if (getType(TabIdHistory) != 'object') {
    throw new Error('Invalid argument. first argument is not class.');
  }
  if (getType(moveOptions) != 'object') {
    throw new Error('Invalid argument. second argument is not object.');
  }
  if (getType(windowId) != 'number' ||
      getType(tabId) != 'number' ||
      getType(state) != 'string') {
    throw new Error(
        'Invalid a type of the value of the key in the moveOptions.');
  }
  if (getType(callback) != 'function') {
    throw new Error('Third argument is not callback functions.');
  }

  // use both first and last process.
  var index_of_tip = undefined;

  // use both left and right process.
  var length = TabIdHistory.Length(windowId);
  var index = length - 1 > 0 ? length - 1 : 0;
  var lastPrevious = TabIdHistory.get({ windowId: windowId, index: index });
  console.log(tabIds.data[windowId]);
  console.log(lastPrevious,
      TabIdHistory.get({ windowId: windowId, index: index - 1 }));
  // Adjust gap whether open in open normally or open background.
  var gap = (lastPrevious == tabId) ? -1 : 0;
  // Adjust gap whether select in the left or the right.
  var stateGap = undefined;

  switch (state) {
    case 'first':
      index_of_tip = (index_of_tip != undefined) ? index_of_tip : 0;
    case 'last':
      index_of_tip = (index_of_tip != undefined) ? index_of_tip : 65535;
      if (getType(callback) == 'function') {
        callback(index_of_tip);
      }
      break;
    case 'left':
      stateGap = (stateGap != undefined) ? stateGap : 0;
    case 'right':
      stateGap = (stateGap != undefined) ? stateGap : 1;

      chrome.tabs.query({ windowId: windowId, active: true }, function(result) {
        if (result.length == 1) {
          if (getType(callback) == 'function') {
            callback(result[0].index + stateGap + gap);
          }
        } else {
          throw new Error('The invalid result of the query.');
        }
      });
      break;
    case 'default':
      if (getType(callback) == 'function') {
        callback(null);
      }
      break;
    default:
      throw new Error("Can't moving tab. Argument is unknown.");
      break;
  }
}

function ClosedTabFocus(
    TabIdList, TabIdHistory, focusTabHistory, focusOptions, callback)
{
  var windowId = focusOptions.windowId;
  var tabId = focusOptions.tabId;
  var state = focusOptions.state;

  if (getType(TabIdList) != 'object' ||
      getType(TabIdHistory) != 'object' ||
      getType(focusOptions) != 'object') {
    throw new Error('First-Third arguments is not class.');
  }
  if (getType(focusOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number' ||
      getType(tabId) != 'number' ||
      getType(state) != 'string') {
    throw new Error(
        'Invalid a type of the value of the key in the focusOptions.');
  }
  if (getType(callback) != 'function') {
    throw new Error("callback isn't function.");
  }

  // use both the left andthe right process.
  var length = TabIdHistory.Length(windowId);
  var index = length - 1 > 0 ? length - 1 : 0;
  var lastPrevious = TabIdHistory.get({ windowId: windowId, index: index });
  var targetIndex =
      TabIdList.find({ windowId: windowId, id: lastPrevious }).index;
  // Adjust gap whether select in the left or the right.
  var stateGap = undefined;

  switch (state) {
    case 'first':
      chrome.tabs.query({ windowId: windowId, index: 0 }, function(result) {
        if (result.length == 1) {
          callback(result[0]);
        } else {
          throw new Error("The length of the result isn't one. length: " +
                          result.length);
        }
      });
      break;
    case 'last':
      chrome.tabs.query({ windowId: windowId }, function(result) {
        callback(result[result.length - 1]);
      });
      break;
    case 'left':
      stateGap = (stateGap != undefined) ? stateGap : -1;
    case 'right':
      stateGap = (stateGap != undefined) ? stateGap : 0;

      chrome.tabs.query(
          { windowId: windowId, index: targetIndex + stateGap },
          function(result) {
            if (result.length == 1) {
              callback(result[0]);
            } else {
              throw new Error("The length of the result isn't one. length: " +
                              result.length);
            }
          }
      );
      break;
    case 'lastSelect':
      chrome.tabs.get(focusTabHistory.lastPrevious(windowId), function(tab) {
        callback(tab);
      });
      break;
    case 'default':
      callback(null);
      break;
    default:
      throw new Error("Can't focus close tab. Argument is unknown.");
      break;
  }
}

function WhileUrlOpen(tabs, whileOptions, callback)
{
  if (getType(tabs) != 'array') {
    throw new Error('Invalid argument. first argument is not array.');
  }
  if (getType(whileOptions) != 'object') {
    throw new Error('Invalid argument. Second argument is not object.');
  }
  if (getType(whileOptions.windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number in Second argument.');
  }
  if (getType(whileOptions.startIndex) == 'undefined') {
    whileOptions.startIndex = 0;
  } else if (getType(whileOptions.startIndex) != 'number') {
    throw new Error('Invalid argument. ' +
                    'startIndex key is not number or undefined ' +
                    'in Second argument.');
  }
  if (getType(whileOptions.exclude) != 'array') {
    throw new Error('Invalid argument. ' +
                    'exclude key is not array of string in Second argument.');
  }
  if (getType(whileOptions.excludeOption) != 'string') {
    throw new Error('Invalid argument. ' +
                    'excludeOption key is not string in Second argument.');
  }
  if (getType(callback) != 'function') {
    throw new Error('Invalid argument. ' +
                    'Third argument is not callback functions.');
  }

  if (whileOptions.startIndex >= tabs.length) {
    callback(true);
    return;
  }

  chrome.tabs.get(tabs[whileOptions.startIndex].id, function(tab) {
    if (tab.url.length == 0) {
      Sleep(1);
      WhileUrlOpen(tabs, whileOptions, callback);
    } else {
      for (var i = 0; i < whileOptions.exclude.length; i++) {
        var exclude = Trim(whileOptions.exclude[i]);
        if (exclude == '') {
          continue;
        }

        var re = new RegExp(exclude, whileOptions.excludeOption);
        if (re.test(tab.url)) {
          callback(false);
          return;
        }
      }

      chrome.tabs.create(
          { windowId: whileOptions.windowId, url: tab.url },
          function(createdTab) {
            whileOptions.startIndex++;
            WhileUrlOpen(tabs, whileOptions, callback);
          }
      );
      return;
    }
  });
}

chrome.tabs.onCreated.addListener(function(tab) {
  console.log('onCreated');
  chrome.storage.local.get(null, function(items) {
    tabIds.insert({ windowId: tab.windowId, index: tab.index, id: tab.id });

    var storageName = 'open_pos_radio';
    var state = items[storageName] ? items[storageName] :
                                     default_values[storageName];
    MoveTab(
        tabIdHistory,
        { windowId: tab.windowId, tabId: tab.id, state: state },
        function(toIndex) {
          chrome.tabs.move(
              tab.id,
              { windowId: tab.windowId, index: toIndex },
              function(moveTab) {
              }
          );
        }
    );
  });
});

chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
  console.log('onMoved');

  var windowId = moveInfo.windowId;
  var fromIndex = moveInfo.fromIndex;
  var toIndex = moveInfo.toIndex;

  tabIds.move({ windowId: windowId, fromIndex: fromIndex, toIndex: toIndex });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  console.log('onRemoved');
  if (removeInfo.isWindowClosing) {
    return;
  }
  afterClosedFocusTab.Lock();

  var windowId = removeInfo.windowId;

  focusTabHistory.remove({ windowId: windowId, id: tabId });

  if (tabIdHistory.isEmpty(windowId)) {
    console.log('onRemoved Process skip(isEmpty).');

    tabIds.remove({ windowId: windowId, id: tabId });
    tabIdHistory.remove({ windowId: windowId, id: tabId });
    afterClosedFocusTab.UnLock();
    return;
  }

  var length = tabIdHistory.Length(windowId);
  var index = length - 1 > 0 ? length - 1 : 0;
  var lastPrevious = tabIdHistory.get({ windowId: windowId, index: index });
  console.log(lastPrevious, tabId);
  if (lastPrevious != tabId) {
    console.log('onRemoved Process skip.');

    tabIds.remove({ windowId: windowId, id: tabId });
    tabIdHistory.remove({ windowId: windowId, id: tabId });
    afterClosedFocusTab.UnLock();
    return;
  }

  chrome.storage.local.get(null, function(items) {
    var storageName = 'close_focus_radio';
    var state = items[storageName] ? items[storageName] :
                                     default_values[storageName];
    ClosedTabFocus(tabIds,
                   tabIdHistory,
                   focusTabHistory,
                   { windowId: windowId, tabId: tabId, state: state },
                   function(result) {
          if (result == null) {
            // default process
            tabIds.remove({ windowId: windowId, id: tabId });
            tabIdHistory.remove({ windowId: windowId, id: tabId });
            chrome.tabs.query(
                { windowId: windowId, active: true }, function(result) {
                  if (result.length == 1) {
                    tabIdHistory.add(
                        { windowId: result[0].windowId, id: result[0].id });
                    afterClosedFocusTab.UnLock();
                  } else {
                    afterClosedFocusTab.UnLock();
                    throw new Error('Invalid the length of the result.');
                  }
                }
            );
          } else {
            // your settings process.
            chrome.tabs.update(result.id, { active: true }, function(tab) {
              tabIds.remove({ windowId: windowId, id: tabId });
              tabIdHistory.remove({ windowId: windowId, id: tabId });
              tabIdHistory.add({ windowId: windowId, id: tab.id });
              afterClosedFocusTab.UnLock();
            });
          }
        });
  });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  var windowId = activeInfo.windowId;
  var tabId = activeInfo.tabId;

  console.log('onActivated');
  console.log('onActivated activeTab', tabId);

  if (afterClosedFocusTab.IsLocked()) {
    console.log('chrome.tabs.onActivated is skipped.');
    return;
  }

  tabIdHistory.remove({ windowId: windowId, id: tabId });
  tabIdHistory.add({ windowId: windowId, id: tabId });

  focusTabHistory.update({ windowId: windowId, id: tabId });
});

chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
  console.log('onAttached');
  var newWindowId = attachInfo.newWindowId;
  var newPosition = attachInfo.newPosition;
  chrome.tabs.get(tabId, function(tab) {
    tabIdHistory.remove({ windowId: newWindowId, id: tab.id });
    tabIdHistory.add({ windowId: newWindowId, id: tab.id });

    focusTabHistory.update({ windowId: newWindowId, id: tab.id });

    tabIds.insert({ windowId: newWindowId, index: newPosition, id: tabId });
  });
});

chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  console.log('onDetached');
  chrome.storage.local.get(null, function(items) {
    var storageName = 'open_focus_radio';
    var state = items[storageName] ? items[storageName] :
                                     default_values[storageName];

    var oldWindowId = detachInfo.oldWindowId;
    var oldPosition = detachInfo.oldPosition;

    try {
      chrome.tabs.query(
          { windowId: oldWindowId, index: oldPosition }, function(result) {
            if (result.length == 1) {
              ClosedTabFocus(
                  tabIds,
                  tabIdHistory,
                  focusTabHistory,
                  { windowId: oldWindowId, tabId: result[0].id, state: state },
                  function(t) {
                  }
              );
            } else {
              throw new Error("The length of the result isn't one. length: " +
                              result.length);
            }
          }
      );
    } catch (e) {
      console.log(e.message);
    } finally {
      tabIdHistory.remove({ windowId: oldWindowId, id: tabId });
      tabIds.remove({ windowId: windowId, id: tabId });
    }
  });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  console.log('windows.onFocusChanged');
  lastFocusWindowId = windowId;
});

chrome.windows.onCreated.addListener(function(window) {
  console.log('windows.onCreated');
  chrome.storage.local.get(null, function(items) {
    var storageName = 'popup_window_is_open_tab_checkbox';
    var state = items[storageName] ?
                items[storageName] :
                default_values[storageName];
    if (window.type == 'popup' && state == true) {
      chrome.windows.get(window.id, { populate: true }, function(window) {
        var storageName = 'popup_exclude_url_textarea';
        var exclude = getType(items[storageName]) == 'string' ?
                      items[storageName] : default_values[storageName];

        var storageName = 'popup_regopt_insensitive_checkbox';
        var excludeOption = items[storageName] ?
                            items[storageName] :
                            default_values[storageName];
        excludeOption = excludeOption == true ? 'i' : '';
        WhileUrlOpen(window.tabs,
                     { windowId: lastFocusWindowId,
                       startIndex: 0,
                       exclude: exclude.split('\n'),
                       excludeOption: excludeOption },
                     function(closed) {
              if (closed) {
                chrome.windows.remove(window.id);
              }
            }
        );
      });
    }
  });
});

chrome.windows.onRemoved.addListener(function(windowId) {
  console.log('windows.onRemoved');
  tabIdHistory.remove({ windowId: windowId });
  tabIds.remove({ windowId: windowId });

  focusTabHistory.remove({ windowId: windowId });
});

chrome.windows.getAll({ populate: true }, function(windows) {
  for (var i = 0; i < windows.length; i++) {
    var windowId = windows[i].id;
    for (var j = 0; j < windows[i].tabs.length; j++) {
      var tabId = windows[i].tabs[j].id;
      tabIds.add({ windowId: windowId, id: tabId });
      tabIdHistory.add({ windowId: windowId, id: tabId });
    }

    chrome.tabs.query({ windowId: windowId, active: true }, function(result) {
      if (result.length == 1) {
        var windowId = result[0].windowId;
        var tabId = result[0].id;

        tabIdHistory.remove({ windowId: windowId, id: tabId });
        tabIdHistory.add({ windowId: windowId, id: tabId });

        focusTabHistory.update({ windowId: windowId, id: tabId });
      } else {
        throw new Error('Invalid the length of the result.');
      }
    });
  }
});
