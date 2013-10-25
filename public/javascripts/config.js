/*jshint globalstrict: true */
'use strict';

var lastFocusWindowId = null; // last focus window.
var tabIds = new TabIdList(); // the instance of a tab id for tab retrieval.
var tabIdHistory = new TabIdHistory(); // For Storing the tab id of the last.
var focusTabHistory = new TabIdHistory(); // Used last tab only.
var afterClosedFocusTab = 0; // This done lock after using ClosedFocusTab.
var afterOpeningTabInPopup = 0; // Lock after opening the tab in popup window.
var myOptions = null; // the list of my options.

/* Debug is comment out. */
console.log = function() {};
console.time = function() {};
console.timeEnd = function() {};

function getOptionsValue(name)
{
  return myOptions[name] || default_values[name];
}

/* functions */
function moveTab(moveOptions, callback)
{
  console.log('moveTab');

  var windowId = moveOptions.windowId;
  var tabId = moveOptions.tabId;
  var state = moveOptions.state;
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
        callback(index);
      });
      break;
    case 'left':
    case 'right':
      var stateGap = (state === 'left') ? 0 : 1;

      var lastPrevious = tabIdHistory.lastPrevious(windowId);
      // Adjust gap whether open in open normally or open background.
      var gap = (lastPrevious === tabId) ? -1 : 0;
      chrome.tabs.query({ windowId: windowId, active: true }, function(result) {
        if (result.length === 1) {
          callback(result[0].index + stateGap + gap);
        } else {
          throw new Error('The invalid result of the query.');
        }
      });
      break;
    case 'default':
      callback(null);
      break;
    default:
      throw new Error("Can't moving tab. Argument is unknown.");
  }
}

function closedTabFocus(focusOptions, callback)
{
  console.log('closedTabFocus');

  var windowId = focusOptions.windowId;
  var state = focusOptions.state;
  if (toType(windowId) !== 'number' ||
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

      var lastPrevious = tabIdHistory.lastPrevious(windowId);
      var findTab = tabIds.find({ windowId: windowId, id: lastPrevious });
      var index = findTab.index + stateGap;
      index = index < 0 ? 0 : index;
      chrome.tabs.query({ windowId: windowId, index: index }, function(result) {
        if (result.length === 1) {
          callback(result[0]);
        } else {
          throw new Error(
            "The length of the result isn't one." +
            " index: " + index + " length: " + result.length);
        }
      });
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
  }
}

function whileUrlOpen(tabs, whileOptions, callback)
{
  console.log('whileUrlOpen');

  if (toType(tabs) !== 'array' || toType(callback) !== 'function') {
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
      toType(whileOptions.begin) !== 'number' ||
      toType(whileOptions.end) !== 'number') {
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
        var ex = trim(exclude[i]);
        if (ex === '') {
          continue;
        }

        var re = new RegExp(ex, excludeOption);
        if (re.test(tab.url)) {
          clearInterval(timerId);
          callback(false);
          return;
        }
      }

      afterOpeningTabInPopup++;
      chrome.tabs.create(
          { windowId: windowId, url: tab.url, active: false }, function() {
            // run in chrome.tabs.onCreated.
            /* afterOpeningTabInPopup--; */
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

  tabIds.insert({ windowId: windowId, index: index, id: id });

  if (openerTabId === void 0 && afterOpeningTabInPopup <= 0) {
    console.log('onCreated skip.');
    return;
  }

  var state = getOptionsValue('open_pos_radio');
  moveTab({ windowId: windowId, tabId: id, state: state }, function(toIndex) {
        if (toIndex !== null) {
          // expect default.
          chrome.tabs.move(
              id, { windowId: windowId, index: toIndex }, function() {
                // Activating the tab of the popup window.
                if (afterOpeningTabInPopup > 0) {
                  chrome.tabs.update(id, { active: true }, function() {
                    // release the lock here.
                    afterOpeningTabInPopup--;
                  });
                }
              }
          );
        } else if (afterOpeningTabInPopup > 0) {
          // Activating the tab of the popup window.
          chrome.tabs.update(id, { active: true }, function() {
            // release the lock here.
            afterOpeningTabInPopup--;
          });
        }
  });
});

chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
  console.log('onMoved');

  tabIds.move({
    windowId: moveInfo.windowId,
    fromIndex: moveInfo.fromIndex,
    toIndex: moveInfo.toIndex
  });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  console.log('onRemoved');
  if (removeInfo.isWindowClosing) {
    return;
  }

  afterClosedFocusTab++;

  var windowId = removeInfo.windowId;
  var obj = { windowId: windowId, id: tabId };

  focusTabHistory.remove(obj);
  try {
    var lastPrevious = tabIdHistory.lastPrevious(windowId);
    if (lastPrevious !== tabId) {
      throw new Error('Skip');
    }
  } catch (e) {
    console.log('onRemoved Process skip.');
    tabIds.remove(obj);
    tabIdHistory.remove(obj);
    afterClosedFocusTab--;

    if (e.message !== 'Skip' &&
        e.message !== 'History is not found windowId object.') {
      throw e;
    } else {
      return;
    }
  }

  var state = getOptionsValue('close_focus_radio');
  try {
    closedTabFocus({ windowId: windowId, state: state }, function(result) {
      tabIds.remove(obj);
      tabIdHistory.remove(obj);
      if (afterClosedFocusTab-- !== 1) {
        console.log('focus another tab when closed tab. it has skipped.');
        return;
      }

      if (result === null) {
        // default process
        chrome.tabs.query(
          { windowId: windowId, active: true }, function(result) {
            if (result.length === 1) {
              tabIdHistory.add(
                { windowId: result[0].windowId, id: result[0].id });
            } else {
              throw new Error('Invalid the length of the result.');
            }
          }
        );
      } else {
        // your setting process.
        chrome.tabs.update(result.id, { active: true }, function(tab) {
          tabIdHistory.add({ windowId: windowId, id: tab.id });
        });
      }
    });
  } catch (e) {
    afterClosedFocusTab--;
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('onActivated');

  if (afterClosedFocusTab > 0) {
    console.log('chrome.tabs.onActivated is skipped.');
    return;
  }

  var obj = { windowId: activeInfo.windowId, id: activeInfo.tabId };
  tabIdHistory.add(obj);
  focusTabHistory.add(obj);
});

chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
  console.log('onAttached');

  var newWindowId = attachInfo.newWindowId;
  var newPosition = attachInfo.newPosition;
  chrome.tabs.get(tabId, function(tab) {
    var obj = { windowId: newWindowId, id: tab.id };
    tabIdHistory.add(obj);
    focusTabHistory.add(obj);
    tabIds.insert({ windowId: newWindowId, index: newPosition, id: tabId });
  });
});

chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  console.log('onDetached');

  afterClosedFocusTab++;

  var oldWindowId = detachInfo.oldWindowId;
  var oldPosition = detachInfo.oldPosition;
  var obj = { windowId: oldWindowId, id: tabId };
  focusTabHistory.remove(obj);

  var state = getOptionsValue('close_focus_radio');
  closedTabFocus({ windowId: oldWindowId, state: state }, function(tab) {
    chrome.tabs.update(tab.id, { active: true }, function() {
      tabIds.remove(obj);
      tabIdHistory.remove(obj);

      afterClosedFocusTab--;
    });
  });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  console.log('windows.onFocusChanged');
  lastFocusWindowId = windowId;
});

chrome.windows.onCreated.addListener(function(window) {
  console.log('windows.onCreated');

  var state = getOptionsValue('popup_window_is_open_tab_checkbox');
  if (window.type === 'popup' && state === true) {
    chrome.windows.get(window.id, { populate: true }, function(window) {
      var exclude = getOptionsValue('popup_exclude_url_textarea');
      var excludeOption = getOptionsValue('popup_regopt_insensitive_checkbox');
      whileUrlOpen(window.tabs,
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

chrome.windows.onRemoved.addListener(function(windowId) {
  console.log('windows.onRemoved');

  var obj = { windowId: windowId };
  tabIds.remove(obj);
  tabIdHistory.remove(obj);
  focusTabHistory.remove(obj);
});

function initialize()
{
  var i, j;
  var obj;
  chrome.storage.local.get(null, function(items) {
    myOptions = items;

    chrome.windows.getAll({ populate: true }, function(windows) {
      for (i = 0; i < windows.length; i++) {
        var windowId = windows[i].id;
        for (j = 0; j < windows[i].tabs.length; j++) {
          obj = { windowId: windowId, id: windows[i].tabs[j].id };
          tabIds.add(obj);
          tabIdHistory.add(obj);
        }
      }

      chrome.tabs.query({ active: true }, function(result) {
          if (result.length === 0) {
            throw new Error('Invalid the length of the result.');
          }

          for (i = 0; i < result.length; i++) {
            obj = { windowId: result[i].windowId, id: result[i].id };
            tabIdHistory.add(obj);
            focusTabHistory.add(obj);
          }
        }
      );
    });
  });
}

chrome.runtime.onMessage.addListener(function(message) {
  switch (message.event) {
    case 'initialize':
      initialize();
      break;
  }
});

initialize();
