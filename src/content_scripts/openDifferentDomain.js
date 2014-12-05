/*jshint scripturl: true */
(function(window, document) {
  'use strict';

  function changeNewOpenTabLink(a)
  {
    var host = window.location.protocol + '//' + window.location.hostname;

    if (a.target !== '' ||
        a.href.indexOf('javascript:') === 0 ||
        a.href.indexOf(host) === 0) {
      return;
    }

    a.target = '_blank';
  }

  function checkExclude(ignores, ignoreOption, targetUrl) {
    for (var i = 0, len = ignores.length; i < len; i++) {
      if (trim(ignores[i]) === '') {
        continue;
      }

      var re = new RegExp(ignores[i], ignoreOption);
      if (re.test(targetUrl)) {
        return true;
      }
    }
    return false;
  }

  chrome.storage.local.get(null, function(items) {
    var options = {};
    ['otherDomainOpen', 'excludeUrl', 'excludeUrlRegexInsentive']
    .forEach(function(v) {
      if (defaultValues.hasOwnProperty(v)) {
        options[v] = items.hasOwnProperty(v) ? items[v] : defaultValues[v];
      } else {
        console.error("Don't find in defaultValues.", v);
      }
    });

    if (options.otherDomainOpen === false) {
      return;
    }

    var result = checkExclude(
      options.excludeUrl.split('\n'),
      options.excludeUrlRegexInsentive ? 'i' : '',
      window.location.href);
    if (!result) {
      var element = document.getElementsByTagName('a');
      for (var i = 0, len = element.length; i < len; i++) {
        changeNewOpenTabLink(element[i]);
      }
    }
  });

  console.log('Tab Position Configure is loaded.');
})(window, document);
