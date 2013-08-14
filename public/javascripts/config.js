var lastFocusWindowId = void 0;
/*
 * The list of the tab id for the tab retrieval.
 *
 * If the information in the tab can be acquired without this,
 * don't use this as much as possible.
 */
var tabIds = new TabIdList();
/* For Storing the tab id of the last. */
var tabIdHistory = new TabIdHistory();
/* Used last tab only. */
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

// This done lock after using ClosedFocusTab.
var afterClosedFocusTab = new Lock();
// Lock after opening the tab in popup window.
var afterOpeningTabInPopup = new Lock();

/* functions */
function MoveTab(TabIdHistory, moveOptions, callback)
{
  console.log(arguments.callee.name);

  var windowId = moveOptions.windowId;
  var tabId = moveOptions.tabId;
  var state = moveOptions.state;
  if (toType(TabIdHistory) !== 'object') {
    throw new Error('Invalid argument. first argument is not class.');
  }
  if (toType(moveOptions) !== 'object') {
    throw new Error('Invalid argument. second argument is not object.');
  }
  if (toType(windowId) !== 'number' ||
      toType(tabId) !== 'number' ||
      toType(state) !== 'string') {
    throw new Error(
        'Invalid a type of the value of the key in the moveOptions.');
  }
  if (toType(callback) !== 'function') {
    throw new Error('Third argument is not callback functions.');
  }

  switch (state) {
    case 'first':
    case 'last':
      chrome.tabs.query({ windowId: windowId }, function(results) {
        var index = (state === 'first') ? 0 : results[results.length - 1].index;
        if (toType(callback) === 'function') {
          callback(index);
        }
      });
      break;
    case 'left':
    case 'right':
      var stateGap = (state === 'left') ? 0 : 1;

      var lastPrevious = TabIdHistory.lastPrevious(windowId);
      // Adjust gap whether open in open normally or open background.
      var gap = (lastPrevious === tabId) ? -1 : 0;
      chrome.tabs.query({ windowId: windowId, active: true }, function(result) {
        if (result.length === 1) {
          if (toType(callback) === 'function') {
            callback(result[0].index + stateGap + gap);
          }
        } else {
          throw new Error('The invalid result of the query.');
        }
      });
      break;
    case 'default':
      if (toType(callback) === 'function') {
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
  console.log(arguments.callee.name);

  var windowId = focusOptions.windowId;
  var tabId = focusOptions.tabId;
  var state = focusOptions.state;

  if (toType(TabIdList) !== 'object' ||
      toType(TabIdHistory) !== 'object' ||
      toType(focusOptions) !== 'object') {
    throw new Error('First-Third arguments is not class.');
  }
  if (toType(focusOptions) !== 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (toType(windowId) !== 'number' ||
      toType(tabId) !== 'number' ||
      toType(state) !== 'string') {
    throw new Error(
        'Invalid a type of the value of the key in the focusOptions.');
  }
  if (toType(callback) !== 'function') {
    throw new Error("callback isn't function.");
  }

  switch (state) {
    case 'first':
    case 'last':
      chrome.tabs.query({ windowId: windowId }, function(result) {
        var index = (state === 'first') ? 0 : result.length - 1;
        callback(result[index]);
      });
      break;
    case 'left':
    case 'right':
      var stateGap = (state === 'left') ? -1 : 0;

      var lastPrevious = TabIdHistory.lastPrevious(windowId);
      var findTab = TabIdList.find({ windowId: windowId, id: lastPrevious });
      chrome.tabs.query(
          { windowId: windowId, index: findTab.index + stateGap },
          function(result) {
            if (result.length === 1) {
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
  console.log(arguments.callee.name);

  if (toType(tabs) !== 'array' ||
      toType(whileOptions) !== 'object' ||
      toType(callback) !== 'function') {
    throw new Error(
        'Invalid a type of arguments. you check a type of arguments.');
  }

  var windowId = whileOptions.windowId;
  var exclude = whileOptions.exclude;
  var excludeOption = whileOptions.excludeOption;
  whileOptions.begin = whileOptions.begin || 0;
  whileOptions.end = whileOptions.end || tabs.length;
  if (toType(windowId) !== 'number' ||
      toType(exclude) !== 'array' ||
      toType(excludeOption) !== 'string' ||
      toType(whileOptions.begin) != 'number' ||
      toType(whileOptions.end) != 'number') {
    throw new Error('Invalid type of the value of keys in the whileOptions.');
  }

  // end process.
  var timerId = setInterval(function() {
    if (whileOptions.begin >= whileOptions.end) {
      clearInterval(timerId);
      callback(true);
      return;
    }

    chrome.tabs.get(tabs[whileOptions.begin].id, function(tab) {
      if (tab.status === 'loading' && tab.url.length === 0) {
        return;
      }

      whileOptions.begin++;

      // check regex.
      for (var i = 0; i < exclude.length; i++) {
        var ex = Trim(exclude[i]);
        if (ex === '') {
          continue;
        }

        var re = new RegExp(ex, excludeOption);
        if (re.test(tab.url)) {
          callback(false);
          return;
        }
      }

      afterOpeningTabInPopup.Lock();
      chrome.tabs.create(
          { windowId: windowId, url: tab.url, active: false },
          function(createdTab) {
            // run in chrome.tabs.onCreated.
            /* afterOpeningTabInPopup.UnLock(); */
          }
      );
    });
  }, 100);
}

chrome.tabs.onCreated.addListener(function(tab) {
  console.log('onCreated');

  var windowId = tab.windowId;
  var id = tab.id;
  var index = tab.index;
  var openerTabId = tab.openerTabId;
  if (openerTabId === void 0 && !afterOpeningTabInPopup.IsLocked()) {
    console.log('onCreated skip.');
    return;
  }

  chrome.storage.local.get(null, function(items) {
    tabIds.insert({ windowId: windowId, index: index, id: id });

    var storageName = 'open_pos_radio';
    var state = items[storageName] || default_values[storageName];
    MoveTab(
        tabIdHistory,
        { windowId: windowId, tabId: id, state: state },
        function(toIndex) {
          if (toIndex !== null) {
            // expect default.
            chrome.tabs.move(
                id, { windowId: windowId, index: toIndex }, function(moveTab) {
                  // Activating the tab of the popup window.
                  if (afterOpeningTabInPopup.IsLocked()) {
                    chrome.tabs.update(id, { active: true },
                        function(updatedTab) {
                          // release the lock here.
                          afterOpeningTabInPopup.UnLock();
                        }
                    );
                  }
                }
            );
          } else {
            // Activating the tab of the popup window.
            if (afterOpeningTabInPopup.IsLocked()) {
              chrome.tabs.update(id, { active: true },
                  function(updatedTab) {
                    // release the lock here.
                    afterOpeningTabInPopup.UnLock();
                  }
              );
            }
          }
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
  try {
    var lastPrevious = tabIdHistory.lastPrevious(windowId);
    if (lastPrevious !== tabId) {
    }
  } catch (e) {
    if (e.message !== 'History is not found windowId object.') {
      console.log(e.message);
    }

    console.log('onRemoved Process skip.');
    tabIds.remove({ windowId: windowId, id: tabId });
    tabIdHistory.remove({ windowId: windowId, id: tabId });
    afterClosedFocusTab.UnLock();
    return;
  }

  chrome.storage.local.get(null, function(items) {
    var storageName = 'close_focus_radio';
    var state = items[storageName] || default_values[storageName];
    ClosedTabFocus(tabIds,
                   tabIdHistory,
                   focusTabHistory,
                   { windowId: windowId, tabId: tabId, state: state },
                   function(result) {
          if (result === null) {
            // default process
            tabIds.remove({ windowId: windowId, id: tabId });
            tabIdHistory.remove({ windowId: windowId, id: tabId });
            chrome.tabs.query(
                { windowId: windowId, active: true }, function(result) {
                  if (result.length === 1) {
                    tabIdHistory.update(
                        { windowId: result[0].windowId, id: result[0].id });
                    afterClosedFocusTab.UnLock();
                  } else {
                    afterClosedFocusTab.UnLock();
                    throw new Error('Invalid the length of the result.');
                  }
                }
            );
            return;
          } else {
            // your setting process.
            chrome.tabs.update(result.id, { active: true }, function(tab) {
              tabIds.remove({ windowId: windowId, id: tabId });
              tabIdHistory.remove({ windowId: windowId, id: tabId });

              tabIdHistory.update({ windowId: windowId, id: tab.id });
              afterClosedFocusTab.UnLock();
            });
            return;
          }
        });
  });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('onActivated');

  var windowId = activeInfo.windowId;
  var tabId = activeInfo.tabId;
  if (afterClosedFocusTab.IsLocked()) {
    console.log('chrome.tabs.onActivated is skipped.');
    return;
  }

  tabIdHistory.update({ windowId: windowId, id: tabId });
  focusTabHistory.update({ windowId: windowId, id: tabId });
});

chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
  console.log('onAttached');

  var newWindowId = attachInfo.newWindowId;
  var newPosition = attachInfo.newPosition;
  chrome.tabs.get(tabId, function(tab) {
    tabIdHistory.update({ windowId: newWindowId, id: tab.id });
    focusTabHistory.update({ windowId: newWindowId, id: tab.id });

    tabIds.insert({ windowId: newWindowId, index: newPosition, id: tabId });
  });
});

chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  console.log('onDetached');

  chrome.storage.local.get(null, function(items) {
    var storageName = 'open_focus_radio';
    var state = items[storageName] || default_values[storageName];

    var oldWindowId = detachInfo.oldWindowId;
    var oldPosition = detachInfo.oldPosition;
    try {
      chrome.tabs.query(
          { windowId: oldWindowId, index: oldPosition }, function(result) {
            if (result.length === 1) {
              ClosedTabFocus(
                  tabIds,
                  tabIdHistory,
                  focusTabHistory,
                  { windowId: oldWindowId, tabId: result[0].id, state: state },
                  function(t) {
                    tabIdHistory.remove({ windowId: oldWindowId, id: tabId });
                    tabIds.remove({ windowId: windowId, id: tabId });
                  }
              );
            } else {
              throw new Error("The length of the result isn't one. length: " +
                              result.length);
            }
          }
      );
    } catch (e) {
      tabIdHistory.remove({ windowId: oldWindowId, id: tabId });
      tabIds.remove({ windowId: windowId, id: tabId });
      throw e;
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
    var state = items[storageName] || default_values[storageName];
    if (window.type === 'popup' && state === true) {
      chrome.windows.get(window.id, { populate: true }, function(window) {
        var storageName = 'popup_exclude_url_textarea';
        var exclude = toType(items[storageName]) === 'string' ?
                      items[storageName] : default_values[storageName];

        var storageName = 'popup_regopt_insensitive_checkbox';
        var excludeOption = items[storageName] || default_values[storageName];
        WhileUrlOpen(window.tabs,
                     { windowId: lastFocusWindowId,
                       exclude: exclude.split('\n'),
                       excludeOption: excludeOption ? 'i' : '' },
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
      tabIdHistory.update({ windowId: windowId, id: tabId });
    }

    chrome.tabs.query({ windowId: windowId, active: true }, function(result) {
      if (result.length === 1) {
        var windowId = result[0].windowId;
        var tabId = result[0].id;

        tabIdHistory.update({ windowId: windowId, id: tabId });

        focusTabHistory.update({ windowId: windowId, id: tabId });
      } else {
        throw new Error('Invalid the length of the result.');
      }
    });
  }
});
