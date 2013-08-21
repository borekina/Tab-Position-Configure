/*jshint globalstrict: true */
/*jshint loopfunc: true*/
/*global generateRegexTool: true*/
'use strict';

// Text by language. use InitTranslation Function.
function loadValues(document, values, debugCallback)
{
  if (document === void 0 ||
      toType(values) !== 'object' && values !== null || values === void 0) {
    throw new Error('Arguments type error.');
  }

  // Get All Option Value.
  chrome.storage.local.get(null, function(items) {
    var debugList = []; // use Debug

    var element = null;
    items = values || items;
    for (var key in items) {
      var value = items[key];
      var elName = key.match(
          /(^[\w]*)_(text|password|radio|checkbox|number|textarea)$/);
      if (elName) {
        switch (elName[2]) {
          case 'number':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = value;
            debugList.push(elName[1]);
            break;
          case 'radio':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"][@value="' + value + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = true;
            debugList.push(elName[1]);
            break;
          case 'checkbox':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = value;
            debugList.push(elName[1]);
            break;
          case 'password':
          case 'text':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
          case 'textarea':
            element = document.evaluate(
                '//textarea[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
        }
      }
    }

    if (toType(debugCallback) === 'function') {
      debugCallback(debugList);
    }
  });
}

function saveValues(document, saveTypes, callback)
{
  if (document === void 0 || toType(saveTypes) !== 'array') {
    throw new Error('Invalid argument.');
  }
  var i = 0;
  var storageName = null;

  // inputタグの保存するtype
  var types = '';
  for (i = 0; i < saveTypes.length; i++) {
    types += '@type="' + saveTypes[i] + '"';
    if (i + 1 < saveTypes.length) {
      types += ' or ';
    }
  }

  var writeData = {};

  var inputs = document.evaluate(
      '//input[' + types + ']', document, null, 7, null);
  for (i = 0; i < inputs.snapshotLength; i++) {
    storageName = inputs.snapshotItem(i).name +
                      '_' + inputs.snapshotItem(i).type;
    switch (inputs.snapshotItem(i).type) {
      case 'radio':
        if (inputs.snapshotItem(i).checked) {
          writeData[storageName] = inputs.snapshotItem(i).value;
        }
        break;
      case 'checkbox':
        writeData[storageName] = inputs.snapshotItem(i).checked;
        break;
      case 'text':
        writeData[storageName] = trim(inputs.snapshotItem(i).value);
        break;
      case 'number':
        writeData[storageName] = inputs.snapshotItem(i).value;
        break;
    }
  }

  var textareas = document.evaluate('//textarea', document, null, 7, null);
  for (i = 0; i < textareas.snapshotLength; i++) {
    storageName = textareas.snapshotItem(i).name + '_' +
                      textareas.snapshotItem(i).tagName.toLowerCase();
    writeData[storageName] = trim(textareas.snapshotItem(i).value);
  }

  // writeData options.
  chrome.storage.local.set(writeData, function() {
    // writeDatad key catalog
    var debug = [];
    for (var key in writeData) {
      debug.push(key);
    }

    if (toType(callback) === 'function') {
      callback(debug);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initTranslations(document, translation_path, 'Text');
  loadValues(document, default_values, function() { // Config Init.
    loadValues(document, null); // Config Load.
  });

  // buttons
  var status = document.getElementById('status');
  var timeoutTime = 1000;
  document.querySelector('#save').addEventListener('click', function() {
    saveValues(document, ['checkbox', 'radio', 'text']);

    status.innerHTML = 'Options Saved.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);
  document.querySelector('#load').addEventListener('click', function() {
    loadValues(document, null);

    status.innerHTML = 'Options Loaded.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);
  document.querySelector('#init').addEventListener('click', function() {
    loadValues(document, default_values);

    status.innerHTML = 'Options Initialized.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);

  // Import and Export
  var config_view = document.getElementById('config_view');
  var config_view_status = document.getElementById('config_view_status');
  document.getElementById('export').addEventListener('click', function() {
    chrome.storage.local.get(null, function(items) {
      config_view.value = JSON.stringify(items);
    });
  }, false);
  document.getElementById('import').addEventListener('click', function() {
    try {
      var items = JSON.parse(config_view.value);
      loadValues(document, items, function() {
        config_view_status.textContent = 'Success. Please, save';
        config_view_status.style.color = 'green';
        setTimeout(function() {
          config_view_status.innerHTML = '';
        }, 1000);
      });
    } catch (error) {
      config_view_status.textContent = 'Import error. invalid string.';
      config_view_status.style.color = 'red';
      return;
    }
  }, false);

  // 正規表現確認ツールの表示・非表示アニメーション
  var switch_button_name = 'close_button';
  var tool_box = document.getElementById('tool_box');
  tool_box.appendChild(
    generateRegexTool('460px', switch_button_name, 'Text'));

  // toggle
  var switchButton = document.getElementsByClassName('open_tool');
  for (var i = 0; i < switchButton.length; i++) {
    switchButton[i].addEventListener('click', function() {
      var close_button = tool_box.getElementsByClassName(switch_button_name);
      for (var j = 0; j < close_button.length; j++) {
        var evt = document.createEvent('UIEvent');
        evt.initEvent('click', false, false);
        close_button[j].dispatchEvent(evt);
      }
    });
  }
});
