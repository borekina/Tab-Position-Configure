(function() {
  'use strict';

  var myOptions = null;
  var tabsCache = null;
  var latestHistory = {};
  var latestHistoryLock = false;

  /**
   * 拡張機能がインストールされたときの処理
   */
  function onInstall() {//{{{
    debug('Extension Installed.');

    return new Promise(function(resolve) {
      // インストール時にオプションページを表示
      chrome.tabs.create({ url: optionPage }, resolve);
    });
  }//}}}

  /**
   * 拡張機能がアップデートされたときの処理
   */
  function onUpdate() {//{{{
    debug('Extension Updated.');

    return new Promise(function(resolve) {
      resolve();
    });
  }//}}}

  /**
   * 拡張機能のバージョンを返す
   * @return {String} 拡張機能のバージョン.
   */
  function getVersion() {//{{{
    debug('getVersion');
    var details = chrome.app.getDetails();
    return details.version;
  }//}}}

  function versionCheckAndUpdate()//{{{
  {
    debug('versionCheckUpdate');

    var deferred = Promise.defer();
    var currVersion = getVersion();
    chrome.storage.local.get(versionKey, function(storages) {
      function update()
      {
        return new Promise(function(resolve) {
          var write = {};
          write[versionKey] = currVersion;
          chrome.storage.local.set(write, resolve);
        });
      }

      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError.message);
        deferred.reject();
        return;
      }

      // ver chrome.storage.
      var prevVersion = storages[versionKey];
      if (currVersion !== prevVersion) {
        // この拡張機能でインストールしたかどうか
        if (prevVersion === void 0) {
          onInstall().then(update).then(deferred.resolve, deferred.reject);
        } else {
          onUpdate().then(update).then(deferred.resolve, deferred.reject);
        }
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  }//}}}

  function getCurrentTab()//{{{
  {
    debug('getCurrentTab');

    var deferred = Promise.defer();
    chrome.tabs.getSelected(function(tab) {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError.message);
        deferred.reject();
        return;
      }
      deferred.resolve(tab);
    });
    return deferred.promise;
  }//}}}

  function getTabsQuery(object)//{{{
  {
    return new Promise(function(resolve, reject) {
      chrome.tabs.query(object || {}, function(results) {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          reject();
          return;
        }
        resolve(results);
      });
    });
  }//}}}

  function getIdDiff(x, y)//{{{
  {
    debug('getIdDiff', x, y);
    return x.filter(function(v) {
      for (var i = 0, len = y.length; i < len; i++) {
        if (v.id === y[i].id) {
          return false;
        }
      }
      return true;
    });
  }//}}}

  function getIdDiffInSameWindow(x, y, windowId)//{{{
  {
    debug('getIdDiffInSameWindow', x, y, windowId);
    function filterFunc(v)
    {
      return v.windowId === windowId;
    }

    var t1 = x.filter(filterFunc);
    var t2 = y.filter(filterFunc);
    return getIdDiff(t1, t2);
  }//}}}

  function closedTabFocus(tabId, info)//{{{
  {
    debug('closedTabFocus', tabId, info);

    latestHistoryLock = true;

    var deferred = Promise.defer();
    setTimeout(function() {
      var windowId = info.windowId || info.oldWindowId;
      var tabIds = latestHistory[windowId];

      var p1 = [];
      p1.push(
        new Promise(function(resolve, reject) {
          if (myOptions.closedTabFocus === 'default' ||
              info.isWindowClosing === true ||
              tabId !== tabIds[tabIds.length - 1]) {
            debug("closedTabFocus is skipped.");
            reject();
            return;
          }
          resolve(true);
        })
      );
      p1.push(getTabsQuery());

      Promise.all(p1).then(function(v) {
        var di = Promise.defer();

        function callbackFunc(updated)
        {
          if (chrome.runtime.lastError) {
            error(chrome.runtime.lastError.message);
            di.reject();
            return;
          }
          di.resolve(updated);
        }

        var results = v[1];

        setTimeout(function() {
          var p2 = [];
          p2.push(
            new Promise(function(resolve) {
              var t = results.filter(function(v) {
                return v.windowId === windowId;
              });
              resolve(t);
            })
          );
          p2.push(
            new Promise(function(resolve) {
              var t2 = getIdDiffInSameWindow(tabsCache, results, windowId);
              resolve(t2);
            })
          );

          Promise.all(p2).then(function(v) {
            var di = Promise.defer();

            var sameWinTabs = v[0];
            var sameWinDiff = v[1];

            setTimeout(function() {
              var index;
              var type = myOptions.closedTabFocus;
              switch (type) {
              case 'first':
                chrome.tabs.update(
                  sameWinTabs[0].id, { active: true }, callbackFunc);
                break;
              case 'last':
                chrome.tabs.update(
                  sameWinTabs[sameWinTabs.length - 1].id,
                  { active: true }, callbackFunc);
                break;
              case 'left':
                index = sameWinDiff[0].index;
                chrome.tabs.update(
                  sameWinTabs[index > 0 ? index - 1 : index].id,
                  { active: true }, callbackFunc);
                break;
              case 'right':
                index = sameWinDiff[0].index;
                chrome.tabs.update(
                  sameWinTabs[index].id, { active: true }, callbackFunc);
                break;
              case 'latest':
                tabIds = latestHistory[windowId].filter(function(v) {
                  return v !== tabId;
                });

                if (tabIds.length - 1 > 0) {
                  chrome.tabs.update(
                    tabIds[tabIds.length - 1], { active: true }, callbackFunc);
                } else {
                  di.reject();
                }
                break;
              default:
                error('closedTabFocus is invalid parameter.');
                di.reject();
                break;
              }
              di.resolve();
            }, 0);
            return di.promise;
          }).catch(di.reject);
        }, 0);
        return di.promise;
      })
      .then(function() {
        latestHistoryLock = false;
        deferred.resolve();
      })
      .catch(function() {
        latestHistoryLock = false;
        deferred.reject();
      });
    }, 0);
    return deferred.promise;
  }//}}}

  chrome.tabs.onActivated.addListener(function(activeInfo) {//{{{
    debug('tabs.onActivated', activeInfo);

    if (!latestHistoryLock) {
      if (!latestHistory.hasOwnProperty(activeInfo.windowId)) {
        latestHistory[activeInfo.windowId] = [];
      }
      latestHistory[activeInfo.windowId].push(activeInfo.tabId);
    }
  });//}}}

  function updateTabsCache()//{{{
  {
    debug('updateTabsCache');

    return new Promise(function(resolve, reject) {
      getTabsQuery()
      .then(function(results) {
        return new Promise(function(resolve) {
          tabsCache = results;
          resolve(results);
        });
      })
      .then(resolve, reject);
    });
  }//}}}

  chrome.tabs.onReplaced.addListener(function(addedTabId, removeTabId) {//{{{
    debug('tabs.onReplaced', addedTabId, removeTabId);

    updateTabsCache();
  });//}}}

  chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {//{{{
    debug('tabs.onMoved', tabId, moveInfo);

    updateTabsCache();
  });//}}}

  function removeLatestHistory(windowId, tabId)//{{{
  {
    debug('removeLatestHistory', windowId, tabId);
    return new Promise(function(resolve) {
      latestHistory[windowId] =
        latestHistory[windowId].filter(function(v) {
          return v !== tabId;
        });
      resolve();
    });
  }//}}}

  function afterOnRemoveds(windowId, tabId)//{{{
  {
    debug('afterOnRemoveds', windowId, tabId);
    return new Promise(function(resolve) {
      removeLatestHistory(windowId, tabId);
      updateTabsCache();
      resolve();
    });
  }//}}}

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {//{{{
    debug('tabs.onRemoved', tabId, removeInfo);

    closedTabFocus(tabId, removeInfo)
    .then(function() {
      return afterOnRemoveds(removeInfo.windowId, tabId);
    }, function() {
      return afterOnRemoveds(removeInfo.windowId, tabId);
    });
  });//}}}

  chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {//{{{
    debug('tabs.onDetached', tabId, detachInfo);

    closedTabFocus(tabId, detachInfo)
    .then(function() {
      return afterOnRemoveds(detachInfo.oldWindowId, tabId);
    }, function() {
      return afterOnRemoveds(detachInfo.oldWindowId, tabId);
    });
  });//}}}

  chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {//{{{
    debug('tabs.onAttached', tabId, attachInfo);

    updateTabsCache();
  });//}}}

  function openPosition(tab)//{{{
  {
    debug('openPosition', tab);

    var deferred = Promise.defer();
    setTimeout(function() {
      var p = [];
      p.push(
        new Promise(function(resolve, reject) {
          if (myOptions.openPosition === 'default') {
            debug('openPosition is skipped.');
            reject();
            return;
          }
          resolve(true);
        })
      );
      p.push(getCurrentTab());
      p.push(
        new Promise(function(resolve, reject) {
          if (tab.openerTabId) {
            chrome.tabs.get(tab.openerTabId, function(parentTab) {
              if (chrome.runtime.lastError) {
                error(chrome.runtime.lastError.message);
                reject();
                return;
              }
              resolve(parentTab);
            });
          } else {
            resolve(null);
          }
        })
      );

      Promise.all(p).then(function(values) {
        var parentTab = values[2] || values[1];

        function callbackFunc(tabs) {
          if (chrome.runtime.lastError) {
            error(chrome.runtime.lastError.message);
            deferred.reject();
            return;
          }
          deferred.resolve(tabs);
        }

        switch (myOptions.openPosition) {
        case 'first':
          chrome.tabs.move(tab.id, { index: 0 }, callbackFunc);
          break;
        case 'last':
          chrome.tabs.move(tab.id, { index: -1 }, callbackFunc);
          break;
        case 'right':
          chrome.tabs.move(
            tab.id, { index: parentTab.index + 1 }, callbackFunc);
          break;
        case 'left':
          chrome.tabs.move(tab.id, { index: parentTab.index }, callbackFunc);
          break;
        default:
          deferred.reject();
          break;
        }
      }, deferred.reject);
    }, 0);
    return deferred.promise;
  }//}}}

  chrome.tabs.onCreated.addListener(function(tab) {//{{{
    debug('tabs.onCreated', tab);

    updateTabsCache()
    .then(function() {
      return openPosition(tab);
    });
  });//}}}

  function getAllWindows(obj)//{{{
  {
    debug('getAllWindows', obj);

    return new Promise(function(resolve, reject) {
      chrome.windows.getAll(obj || {}, function(windows) {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          reject();
          return;
        }
        resolve(windows);
      });
    });
  }//}}}

  function popupWindowIsOpenningTab(window)//{{{
  {
    debug('popupWindowIsOpenningTab', window);

    var deferred = Promise.defer();
    setTimeout(function() {
      (function() {
        return new Promise(function(resolve, reject) {
          if (window.type !== 'popup' ||
              myOptions.popupWindowIsOpenningTab === false) {
              debug('popupWindowIsOpenningTab is skipped.');
            reject();
            return;
          }
          resolve();
        });
      })()
      .then(function() {
        return getTabsQuery({ windowId: window.id });
      })
      .then(function(results) {
        var deferred = Promise.defer();
        setTimeout(function() {
          var list = myOptions.popupExcludeUrl.split('\n');
          var regexs = [];
          list.forEach(function(v) {
            regexs.push(
              new RegExp(v,
                myOptions.popupExcludeUrlRegexInsentive ? 'i' : ''));
          });

          var t = results.filter(function(v) {
            for (var i = 0, len = regexs.length; i < len; i++) {
              if (regexs[i].test(v.url)) {
                return false;
              }
            }
            return true;
          });

          if (t.length === 0) {
            deferred.reject();
            return;
          }

          getAllWindows()
          .then(function(windows) {
            return new Promise(function(resolve, reject) {
              var wTargets = windows.filter(function(v) {
                return v.id !== window.id;
              });

              if (wTargets.length === 0) {
                error("Don't find target window.");
                reject();
                return;
              }

              (function(t, wTargets) {
                var deferred = Promise.defer();
                setTimeout(function() {
                  var ids = [];
                  t.forEach(function(v) {
                    ids.push(v.id);
                  });

                  chrome.tabs.move(
                    ids, { windowId: wTargets[0].id, index: -1 },
                    function(tabs) {
                      if (chrome.runtime.lastError) {
                        error(chrome.runtime.lastError.message);
                        deferred.reject();
                        return;
                      }
                      deferred.resolve(tabs);
                  });
                }, 0);
                return deferred.promise;
              })(t, wTargets)
              .then(resolve, reject);
            });
          })
          .then(deferred.resolve)
          .catch(deferred.reject);
        }, 0);
        return deferred.promise;
      })
      .then(deferred.resolve)
      .catch(deferred.reject);
    }, 0);
    return deferred.promise;
  }//}}}

  chrome.windows.onCreated.addListener(function(window) {//{{{
    debug('windows.onCreated', window);

    (function() {
      return new Promise(function(resolve) {
        if (!latestHistory.hasOwnProperty(window.id)) {
          latestHistory[window.id] = [];
        }
        resolve();
      });
    })()
    .then(function() {
      return popupWindowIsOpenningTab(window);
    });
  });//}}}

  chrome.windows.onRemoved.addListener(function(windowId) {//{{{
    debug('windows.onRemoved', windowId);

    if (latestHistory.hasOwnProperty(windowId)) {
      delete latestHistory[windowId];
    }
  });//}}}

  function initOptions()//{{{
  {
    debug('initOptions');

    var deferred = Promise.defer();
    setTimeout(function() {
      chrome.storage.local.get(null, function(items) {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          deferred.reject();
          return;
        }

        var options = {};
        for (var key in defaultValues) {
          if (defaultValues.hasOwnProperty(key)) {
            if (items.hasOwnProperty(key)) {
              options[key] = items[key];
            } else {
              options[key] = defaultValues[key];
            }
          }
        }
        deferred.resolve(options);
      });
    }, 0);
    return deferred.promise;
  }//}}}

  function loadOptions()//{{{
  {
    debug('loadOptions');

    return new Promise(function(resolve, reject) {
      initOptions()
      .then(function(options) {
        return new Promise(function(resolve) {
          myOptions = options;
          resolve();
        });
      })
      .then(resolve)
      .catch(reject);
    });
  }//}}}

  function initialize()//{{{
  {
    debug('initialize');
    return new Promise(function(resolve, reject) {
      var p = [];
      p.push(versionCheckAndUpdate());
      p.push(loadOptions());
      Promise.all(p).then(resolve, reject);
    });
  }//}}}

  chrome.runtime.onMessage.addListener(function(message) {//{{{
    debug('chrome.runtime.onMessage.', message);

    switch (message.event) {
    case 'initialize':
      loadOptions();
      break;
    }
  });//}}}

  initialize();
})();
