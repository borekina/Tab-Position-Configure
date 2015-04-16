/*jshint maxlen: 100, unused: false*/
(function(window, document) {
  "use strict";

  var defaultValues = {
    'openPosition'    : 'default',
    'closedTabFocus'  : 'default',
    'openedTabFocus'  : 'default',
    'otherDomainOpen' : false,
    'excludeUrl':
        '^http*://(10.\\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\\d{1,3}.\\d{1,3}\n' +
        'localhost\n' +
        'google.(co.jp|com)',
    'excludeUrlRegexInsentive': true,
    'popupWindowIsOpenningTab': false,
    'popupExcludeUrl':
        'chrome[\\w-]*://\n' +
        '[\\w]*.feedly.com',
    'popupExcludeUrlRegexInsentive': true,
  };
  window.versionKey = 'version';
  defaultValues[versionKey] = '1.0.0';

  window.defaultValues = window.defaultValues || defaultValues;

  window.extensionExcludeUrl =
      '^chrome-*\\w*://\n' +
      '^view-source:\n' +
      '^file:///';

  window.translationPath = window.translationPath ||
                           chrome.runtime.getURL('_locales/ja/messages.json') ||
                           chrome.runtime.getURL('_locales/en/messages.json') ;

  window.optionPage = chrome.runtime.getURL('options.html');
})(window, document);
