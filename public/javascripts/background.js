/*jshint globalstrict: true*/
'use strict';

/**
 * Init is Run to initialize.
 */
function init(version)
{
  if (toType(version) !== 'string') {
    throw new Error('Invalid type of arguments.');
  }

  console.log('Extension Initialized.');

  chrome.storage.local.get(null, function(items) {
    // All remove invalid options.
    var removeKeys = [];
    for (var key in items) {
      if (!default_values.hasOwnProperty(key) && key !== version) {
        removeKeys.push(key);
      }
    }
    chrome.storage.local.remove(removeKeys, function() {
    });
  });
}

/**
 * onInstall is Run to Install.
 */
function onInstall() {
  console.log('Extension Installed.');
  // オプションを表示
  chrome.tabs.create({ url: '../../options.html' });
}

/**
 * onUpdate is Run to Extension Update.
 */
function onUpdate() {
  console.log('Extension Updated.');

  // ver 1.0.5 later
  // switch localStorage to chrome.storage.local.
  var switchData = {};
  for (var key in default_values) {
    var value = localStorage[key];
    if (value !== void 0) {
      var elName = key.match(/(^[\w]*)_(text|radio|checkbox|textarea)$/);
      switch (elName[2]) {
        case 'checkbox':
          switchData[key] = (value === 'true') ? true : false;
          break;
        default:
          switchData[key] = value;
          break;
      }

      localStorage.removeItem(key);
      console.log('switch key: ' + key +
                  ' | data: ' + switchData[key] +
                  ' | type: ' + toType(switchData[key]));
    }
  }
  chrome.storage.local.set(switchData, function() {
  });
}

/**
 * Return extension version.
 * @return {Number} extension version.
 */
function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}

document.addEventListener('DOMContentLoaded', function() {
  var versionKey = 'version';

  // この拡張機能外のスクリプトを使って行う初期化処理
  init(versionKey);

  // この拡張機能のバージョンチェック
  var currVersion = getVersion();
  chrome.storage.local.get(versionKey, function(storages) {
    // ver chrome.storage.
    var prevVersion = storages[versionKey];
    if (currVersion !== prevVersion) {
      // この拡張機能でインストールしたかどうか
      if (prevVersion === void 0) {
        onInstall();
      } else {
        onUpdate();
      }

      var write = {};
      write[versionKey] = currVersion;
      chrome.storage.local.set(write);
    }
  });
});
