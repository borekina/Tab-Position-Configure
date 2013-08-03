if (!ChangeNewOpenTabLink) {
  function ChangeNewOpenTabLink(a)
  {
    var host = location.protocol + '//' + location.hostname;

    if (a.target != '') {
      return;
    }
    if (a.href.indexOf('javascript:') == 0 || a.href.indexOf(host) == 0) {
      return;
    }

    a.target = '_blank';
  }
}

if (!CheckExclude) {
  function CheckExclude(ignores, ignoreOption, targetUrl) {
    if (!(ignores instanceof Array)) {
      throw "First Argument isn't array object.";
    }
    if (typeof(ignoreOption) != 'string') {
      throw "Second Argument isn't string.";
    }
    if (typeof(targetUrl) != 'string') {
      throw "Third Argument isn't string.";
    }

    for (var i = 0; i < ignores.length; i++) {
      if (Trim(ignores[i]) == '') {
        continue;
      }

      var re = new RegExp(ignores[i], ignoreOption);
      if (re.test(targetUrl)) {
        return true;
      }
    }
    return false;
  }
}

chrome.storage.local.get(null, function(items) {
  var storageName = 'other_domain_open_checkbox';
  var state = items[storageName] ?
              items[storageName] : default_values[storageName];
  if (state == false) {
    return;
  }

  var storageName = 'exclude_url_textarea';
  var excludeUrl = items[storageName] ?
                   items[storageName] : default_values[storageName];

  var storageName = 'domain_regopt_insensitive_checkbox';
  var insensitiveOption = items[storageName] ?
                          items[storageName] : default_values[storageName];
  var result = CheckExclude(
      excludeUrl.split('\n'), insensitiveOption ? 'i' : '', location.href);
  if (!result) {
    var element = document.getElementsByTagName('a');
    for (var i = 0; i < element.length; i++) {
      console.log('change');
      ChangeNewOpenTabLink(element[i]);
    }
  }
});
