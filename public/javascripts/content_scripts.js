/*jshint globalstrict: true */
/*jshint scripturl: true */
'use strict';

function changeNewOpenTabLink(a)
{
  var host = location.protocol + '//' + location.hostname;

  if (a.target !== '') {
    return;
  }
  if (a.href.indexOf('javascript:') === 0 || a.href.indexOf(host) === 0) {
    return;
  }

  a.target = '_blank';
}

function checkExclude(ignores, ignoreOption, targetUrl) {
  if (toType(ignores) !== 'array' ||
      toType(ignoreOption) !== 'string' ||
      toType(targetUrl) !== 'string') {
    throw new Error('Invalid type of arguments.');
  }

  for (var i = 0; i < ignores.length; i++) {
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
  var storageName = 'other_domain_open_checkbox';
  var state = items[storageName] || default_values[storageName];
  if (state === false) {
    return;
  }

  storageName = 'exclude_url_textarea';
  var excludeUrl = items[storageName] || default_values[storageName];

  storageName = 'domain_regopt_insensitive_checkbox';
  var insensitiveOption = items[storageName] || default_values[storageName];
  var result = checkExclude(
      excludeUrl.split('\n'), insensitiveOption ? 'i' : '', location.href);
  if (!result) {
    var element = document.getElementsByTagName('a');
    for (var i = 0; i < element.length; i++) {
      changeNewOpenTabLink(element[i]);
    }
  }
});
