/** background.js */


/**
 * Init is Run to initialize.
 */
function Init()
{
  console.log('Extension Initialized.');
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
  var switchData = new Object();
  for (key in default_values) {
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
  Init();

  // この拡張機能のバージョンチェック
  var version = 'version';
  chrome.storage.local.get(version, function(items) {
    var currVersion = getVersion();
    var prevVersion = items[version] || localStorage[version];
    if (currVersion !== prevVersion) {
      // この拡張機能でインストールしたかどうか
      if (prevVersion === void 0) {
        onInstall();
      } else {
        onUpdate();
      }

      var writeData = new Object();
      writeData[version] = currVersion;
      chrome.storage.local.set(writeData, function() {
      });
    }
  });
});
