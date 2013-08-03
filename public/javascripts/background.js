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

  // switch localStorage to chrome.storage.local.
  var switchData = new Object();
  for (key in default_values) {
    var value = localStorage[key];
    if (value !== undefined) {
      var elName = key.match(/(^[\w]*)_(text|radio|checkbox|textarea)$/);
      switch (elName[2]) {
        case 'checkbox':
          switchData[key] = (value == 'true') ? true : false;
          break;
        default:
          switchData[key] = value;
          break;
      }

      localStorage.removeItem(key);
      console.log('switch key: ' + key +
                  ' | data: ' + switchData[key] +
                  ' | type: ' + getType(switchData[key]));
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
  // この拡張機能外のスクリプトを使って行う初期化処理
  Init();

  // この拡張機能のバージョンチェック
  var version = 'version';
  chrome.storage.local.get(version, function(items) {
    var currVersion = getVersion();
    var prevVersion = items[version] ? items[version] : localStorage[version];
    if (currVersion != prevVersion) {
      // この拡張機能でインストールしたかどうか
      if (typeof prevVersion == 'undefined') {
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
