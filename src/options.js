(function(window, document) {
  "use strict";

  var myOptions = null;

  function setSettingsToStorage(settings)//{{{
  {
    var deferred = Promise.defer();
    setTimeout(function() {
      chrome.storage.local.set(settings, function() {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          deferred.reject();
          return;
        }
        deferred.resolve();
      });
    }, 0);
    return deferred.promise;
  }//}}}

  function getSettingsFromStorage()//{{{
  {
    var deferred = Promise.defer();
    setTimeout(function() {
      chrome.storage.local.get(null, function(items) {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError.message);
          deferred.reject();
          return;
        }
        deferred.resolve(items);
      });
    }, 0);
    return deferred.promise;
  }//}}}

  function showStatusMessage(targetId, message, showTime)//{{{
  {
    if (showTime === void 0 || showTime === null) {
      showTime = 1000;
    }

    var deferred = Promise.defer();
    setTimeout(function() {
      var t = document.getElementById(targetId);
      t.textContent = message;
      setTimeout(function() {
        t.textContent = '';
      }, showTime);

      deferred.resolve();
    }, 0);
    return deferred.promise;
  }//}}}

  function loadOptions()//{{{
  {
    var deferred = Promise.defer();

    getSettingsFromStorage().then(function(options) {
      myOptions = options;
      return setOptions(myOptions);
    })
    .then(function() {
      return showStatusMessage('storageStatus', 'Loaded.');
    }).then(deferred.resolve, deferred.reject);

    return deferred.promise;
  }//}}}

  function initOptions()//{{{
  {
    var deferred = Promise.defer();

    myOptions = defaultValues;
    setOptions(myOptions)
    .then(function() {
      return showStatusMessage('storageStatus', 'Initialized.');
    }).then(deferred.resolve, deferred.reject);

    return deferred.promise;
  }//}}}

  function setButtonEvent()//{{{
  {
    function onClicked(e)//{{{
    {
      var config;

      switch (e.target.id) {
      case 'save':
        setSettingsToStorage(myOptions)
        .then(function() {
          return showStatusMessage('storageStatus', 'Saved.');
        })
        .then(function() {
          return new Promise(function(resolve) {
            chrome.runtime.sendMessage({ event: 'initialize' }, resolve);
          });
        });
        break;
      case 'load':
        loadOptions();
        break;
      case 'init':
        initOptions();
        break;
      case 'export':
        config = document.getElementById('config');
        config.value = JSON.stringify(myOptions, null, '   ');
        showStatusMessage('setValuesStatus', 'Exported.');
        break;
      case 'import':
        config = document.getElementById('config');
        myOptions = JSON.parse(trim(config.value));
        setOptions(myOptions)
        .then(function() {
          return showStatusMessage('setValuesStatus', 'Imported.');
        });
        break;
      }
    }//}}}

    var deferred = Promise.defer();
    setTimeout(function() {
      var item;
      var els = document.evaluate('//button', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        item.onclick = onClicked;
      }
    }, 0);
    return deferred.promise;
  }//}}}

  function setOptionElementsEvent()//{{{
  {
    function onChanged(e) {//{{{
      switch (e.target.type) {
      case 'radio':
        myOptions[e.target.name] = e.target.value;
        break;
      case 'checkbox':
        myOptions[e.target.name] = e.target.checked;
        break;
      case 'textarea':
        myOptions[e.target.name] = trim(e.target.value);
        break;
      }
    }//}}}

    var deferred = Promise.defer();
    setTimeout(function() {
      var item;
      var els = document.evaluate(
        '//input|//textarea', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        item.onchange = onChanged;
      }
      deferred.resolve();
    }, 0);
    return deferred.promise;
  } //}}}

  function setOptions(settings)//{{{
  {
    var deferred = Promise.defer();
    setTimeout(function() {
      var item;
      var els = document.evaluate(
        '//input|//textarea', document, null, 7, null);
      for (var i = 0, len = els.snapshotLength; i < len; i++) {
        item = els.snapshotItem(i);
        if (!settings.hasOwnProperty(item.name)) {
          continue;
        }

        switch (item.type) {
        case 'radio':
          if (item.value === settings[item.name]) {
            item.checked = true;
          }
          break;
        case 'checkbox':
          item.checked = settings[item.name];
          break;
        case 'textarea':
          item.value = settings[item.name];
          break;
        }
      }
      deferred.resolve();
    }, 0);
    return deferred.promise;
  }//}}}

  document.addEventListener('DOMContentLoaded', function() {//{{{
    getFile(translationPath)
    .then(function(response) {
      return setTranslations(document, JSON.parse(response));
    })
    .then(initOptions)
    .then(loadOptions)
    .then(setOptionElementsEvent)
    .then(setButtonEvent);
  });//}}}
})(window, document);
