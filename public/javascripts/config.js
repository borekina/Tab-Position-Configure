var lastFocusWindowId = undefined;
var tabIds = new TabIdList();
var focusTabHistory = new TabIdHistory();

// When using MovingTab, because it is also called chrome.tabs.onMoved,
// it is used to prevent changes to the double.
var created = false;

// This become true after using ClosedFocusTab,.
// Then be calling chrome.tabs.onActivated. and you should false in it.
var afterClosedFocusTab = false;

/* functions */
function MovingTab(TabIdHistory, moveOptions, callback)
{
  var windowId = moveOptions.windowId;
  var tabId = moveOptions.tabId;
  var index = moveOptions.index;
  var state = moveOptions.state;
  if (getType(TabIdHistory) != 'object') {
    throw new Error('First argument is not class object.');
  }
  if (getType(moveOptions) != 'object') {
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
  if (getType(index) != 'number') {
    throw new Error('Invalid argument. ' +
                    'index key is not number type in argument object.');
  }
  if (getType(state) != 'string') {
    throw new Error('Invalid argument. ' +
                    'state key is not number type in argument object.');
  }
  if (getType(callback) != 'function' &&
      getType(callback) != 'undefined') {
    throw new Error('Third argument is not callback functions.');
  }

  switch (state) {
    case 'first':
      chrome.tabs.move(tabId, { index: 0 }, function(moveTab) {
        if (getType(callback) == 'function') {
          callback(moveTab);
        }
      });
      break;
    case 'last':
      chrome.tabs.move(tabId, { index: 65536 }, function(moveTab) {
        if (getType(callback) == 'function') {
          callback(moveTab);
        }
      });
      break;
    case 'left':
      chrome.tabs.get(TabIdHistory.lastPrevious(windowId), function(getTab) {
        chrome.tabs.move(tabId, { index: getTab.index }, function(moveTab) {
          if (getType(callback) == 'function') {
            callback(moveTab);
          }
        });
      });
      break;
    case 'right':
      chrome.tabs.get(TabIdHistory.lastPrevious(windowId), function(getTab) {
        chrome.tabs.move(tabId, { index: getTab.index + 1 }, function(moveTab) {
          if (getType(callback) == 'function') {
            callback(moveTab);
          }
        });
      });
      break;
    case 'default':
      if (getType(callback) == 'function') {
        chrome.tabs.get(tabId, function(tab) {
          callback(tab);
        });
      }
      break;
    default:
      throw new Error("Can't moving tab. Argument is unknown.");
      break;
  }
}

function ClosedTabFocus(TabIdList, TabIdHistory, focusOptions, callback)
{
  var windowId = focusOptions.windowId;
  var closedTabPosition = focusOptions.closedTabPosition;
  var state = focusOptions.state;

  // error check
  if (getType(TabIdList) != 'object') {
    throw new Error('First argument is not class.');
  }
  if (getType(TabIdHistory) != 'object') {
    throw new Error('Second argument is not class.');
  }
  if (getType(focusOptions) != 'object') {
    throw new Error('Invalid argument. argument is not object.');
  }
  if (getType(windowId) != 'number') {
    throw new Error('Invalid argument. ' +
                    'windowId key is not number type ' +
                    ' in third argument object.');
  }
  if (getType(closedTabPosition) != 'number') {
    throw new Error('Invalid argument. closedTabPosition key ' +
                    ' is not number type in third argument object.');
  }
  if (getType(state) != 'string') {
    throw new Error('Invalid argument. ' +
                    'state key is not string type in third argument object.');
  }
  if (getType(callback) != 'function' &&
      getType(callback) != 'undefined') {
    throw new Error('Third argument is not callback functions.');
  }
  // error check end.

  afterClosedFocusTab = true; // flag

  switch (state) {
    case 'first':
      chrome.tabs.update(TabIdList.get({ windowId: windowId, index: 0 }),
          { active: true }, function(tab) {
            if (getType(callback) == 'function') {
              callback(tab);
            }
          }
      );
      break;
    case 'last':
      var index = TabIdList.length(windowId) > 0 ?
                  TabIdList.length(windowId) - 1 : 0;
      chrome.tabs.update(TabIdList.get({ windowId: windowId, index: index }),
          { active: true }, function(tab) {
            if (getType(callback) == 'function') {
              callback(tab);
            }
          }
      );
      break;
    case 'left':
      var index = closedTabPosition > 1 ? closedTabPosition - 1 : 0;
      chrome.tabs.update(TabIdList.get({ windowId: windowId, index: index }),
          { active: true }, function(tab) {
            if (getType(callback) == 'function') {
              callback(tab);
            }
          }
      );
      break;
    case 'right':
      var index = closedTabPosition < TabIdList.length(windowId) ?
                  closedTabPosition + 1 : TabIdList.length(windowId) - 1;
      chrome.tabs.update(TabIdList.get({ windowId: windowId, index: index }),
          { active: true }, function(tab) {
            if (getType(callback) == 'function') {
              callback(tab);
            }
          }
      );
      break;
    case 'lastSelect':
      var previousId = TabIdHistory.lastPrevious(windowId, 2);
      chrome.tabs.update(previousId, { active: true }, function(tab) {
        if (getType(callback) == 'function') {
          callback(tab);
        }
      });
      break;
    case 'default':
      chrome.tabs.getSelected(windowId, function(tab) {
        if (getType(callback) == 'function') {
          callback(tab);
        }
      });
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
      chrome.tabs.create({ windowId: whileOptions.windowId, url: tab.url });
      whileOptions.startIndex++;
    }
    WhileUrlOpen(tabs, whileOptions, callback);
  });
}

chrome.tabs.onCreated.addListener(function(tab) {
  if (tabIds.isEmpty(tab.windowId)) {
    tabIds.add({ windowId: tab.windowId, tabId: tab.id });
  } else {
    chrome.storage.local.get(null, function(items) {
      var storageName = 'open_pos_radio';
      var state = items[storageName] ? items[storageName] :
                                       default_values[storageName];
      created = true;
      MovingTab(focusTabHistory,
                { windowId: tab.windowId,
                  tabId: tab.id,
                  index: tab.index,
                  state: state },
                function(moveTab) {
            tabIds.insert({
              windowId: moveTab.windowId,
              index: moveTab.index,
              tabId: moveTab.id
            });
          }
      );
    });
  }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (removeInfo.isWindowClosing) {
    return;
  }
  var windowId = removeInfo.windowId;

  chrome.storage.local.get(null, function(items) {
    var storageName = 'close_focus_radio';
    var state = items[storageName] ? items[storageName] :
                                     default_values[storageName];
    var found = tabIds.find({ windowId: windowId, tabId: tabId });
    if (focusTabHistory.lastPrevious(windowId) == tabId) {
      ClosedTabFocus(tabIds,
                     focusTabHistory,
                     { windowId: windowId,
                       closedTabPosition: found.index,
                       state: state });
    }

    var removeTabId = tabIds.get({ windowId: windowId, index: found.index });
    if (removeTabId != tabId) {
      throw new Error('no match is removeTabid and tabId.');
    }
    tabIds.remove({ windowId: windowId, tabId: removeTabId });
    focusTabHistory.remove({ windowId: windowId, tabId: removeTabId });
  });
});

chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
  if (created) {
    created = false;
    return;
  }

  tabIds.move({
    windowId: moveInfo.windowId,
    fromIndex: moveInfo.fromIndex,
    toIndex: moveInfo.toIndex
  });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  if (afterClosedFocusTab) {
    afterClosedFocusTab = false;
    return;
  }

  focusTabHistory.update(
      { windowId: activeInfo.windowId, tabId: activeInfo.tabId });
});

chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
  tabIds.insert({
    windowId: attachInfo.newWindowId,
    index: attachInfo.newPosition,
    tabId: tabid
  });
  focusTabHistory.update({ windowId: attachInfo.windowId, tabId: tabId });
});

chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  chrome.storage.local.get(null, function(items) {
    var storageName = 'open_focus_radio';
    var state = items[storageName] ? items[storageName] :
                                     default_values[storageName];

    var oldWindowId = detachInfo.oldWindowId;
    var oldPosition = detachInfo.oldPosition;
    ClosedTabFocus(tabIds,
                   focusTabHistory,
                   { windowId: oldWindowId,
                     closedTabPosition: oldPosition,
                     state: state });
    tabIds.remove({ windowId: oldWindowId, tabId: tabId });
    focusTabHistory.remove({ windowId: oldWindowId, tabId: tabId });
  });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  lastFocusWindowId = windowId;
});

chrome.windows.onCreated.addListener(function(window) {
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
  focusTabHistory.remove({ windowId: windowId });
  tabIds.remove({ windowId: windowId });
});

chrome.windows.getAll({ populate: true }, function(windows) {
  for (var i = 0; i < windows.length; i++) {
    var windowId = windows[i].id;
    for (var j = 0; j < windows[i].tabs.length; j++) {
      var tabId = windows[i].tabs[j].id;
      tabIds.add({ windowId: windowId, tabId: tabId });
    }
    chrome.tabs.getSelected(windowId, function(tab) {
      focusTabHistory.update({ windowId: windowId, tabId: tab.id });
    });
  }
});
