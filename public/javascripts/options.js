var locale_i18n = [
  "open_tabTitle", "close_tabTitle", "otherTitle", 
  "default", "first", "left", "right", "last", 
  "open_tab_current", "close_tab_current", "other_domain_open", 
  "exclude_url", "popup_window_is_open_tab", 
];

/**
* ロケール文字列の読み込み
* @return なし
*/
function InitTranslation(doc)
{
    // テキストの設定
    for (var i = 0; i < locale_i18n.length; i++) {
        var el      = doc.getElementsByClassName(locale_i18n[i] + 'Text');
        var message = chrome.i18n.getMessage(locale_i18n[i]);
        for (var j = 0; j < el.length; j++) {
            var string      = el[j].innerHTML;
            var index       = string.lastIndexOf('</');
            el[j].innerHTML = string.substring(0, index) + message
                                    + string.substring(index);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    InitTranslation(document);
});
