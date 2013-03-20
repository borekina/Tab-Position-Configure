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
    var currVersion = getVersion();
    var prevVersion = localStorage['version'];
    if (currVersion != prevVersion) {
        // この拡張機能でインストールしたかどうか
        if (typeof prevVersion == 'undefined') {
            onInstall();
        } else {
            onUpdate();
        }
        localStorage['version'] = currVersion;
    }
});
