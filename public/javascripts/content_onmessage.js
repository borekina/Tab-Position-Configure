/**
* コンテンツスクリプトからメッセージを取得し処理。
*/

// コンテンツスクリプトへ拡張機能内のストレージのデータを送る
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (getType(message.getKey) == 'string') {
            sendResponse(localStorage[message.getKey]);
        } else {
            throw 'Message Request Error. ' +
                    "Don't find message.geyKey or not string.";
        }
    }
);
