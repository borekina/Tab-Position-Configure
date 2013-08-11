// Text by language. use InitTranslation Function.
var locale_i18n = [
  'extName',
  'open_tabTitle', 'close_tabTitle', 'otherTitle',
  'default', 'first', 'left', 'right', 'last', 'lastSelect', 'option',
  'export', 'import',
  'open_tab_current', 'close_tab_current', 'other_domain_open',
  'exclude_url', 'popup_exclude_url',
  'domain_regopt_insensitive', 'popup_regopt_insensitive',
  'popup_window_is_open_tab',

  'regex_confuse', 'regex_global',
  'regex_tool', 'regex_refURL', 'regex', 'regex_compare_string',
  'regex_reference', 'regex_option_reference', 'regix_result',
  'regex_information'
];

function LoadValues(document, values, debugCallback)
{
  if (getType(document) != 'object') {
    throw new Error('First argument is not object.');
  }

  // Get All Option Value.
  chrome.storage.local.get(null, function(items) {
    var debugList = []; // use Debug

    items = getType(values) == 'object' ? values : items;
    for (var key in items) {
      var value = items[key];

      var elName = key.match(/(^[\w]*)_(text|radio|checkbox|textarea)$/);
      if (elName) {
        switch (elName[2]) {
          case 'radio':
            var element = document.evaluate(
                '//input[@name="' + elName[1] + '"][@value="' + value + '"]',
                document, null, 7, null);
            if (element.snapshotLength != 1) {
              throw 'LoadValues() Get ' + elName[2] + ' error.';
            }
            element.snapshotItem(0).checked = true;
            debugList.push(elName[1]);
            break;
          case 'checkbox':
            var element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength != 1) {
              throw 'LoadValues() Get ' + elName[2] + ' error.';
            }
            element.snapshotItem(0).checked = value;
            debugList.push(elName[1]);
            break;
          case 'text':
            var element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength != 1) {
              throw 'LoadValues() Get ' + elName[2] + ' error.';
            }
            element.snapshotItem(0).value = Trim(value);
            debugList.push(elName[1]);
            break;
          case 'textarea':
            var element = document.evaluate(
                '//textarea[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength != 1) {
              throw 'LoadValues() Get ' + elName[2] + ' error.';
            }
            element.snapshotItem(0).value = Trim(value);
            debugList.push(elName[1]);
            break;
        }
      }
    }

    if (getType(debugCallback) == 'function') {
      debugCallback(debugList);
    }
  });
}

function SaveValues(values, debugCallback)
{
  if (getType(values) != 'object') {
    throw 'First argument is not object.';
  }

  var debug = [];

  // inputタグの保存するtype
  var saveTypes = ['checkbox', 'radio', 'text'];
  var types = '';
  for (var i = 0; i < saveTypes.length; i++) {
    types += '@type="' + saveTypes[i] + '"';
    if (i + 1 < saveTypes.length) {
      types += ' or ';
    }
  }

  var writeData = new Object();

  var inputs = document.evaluate(
      '//input[' + types + ']', document, null, 7, null);
  for (var i = 0; i < inputs.snapshotLength; i++) {
    var storageName = inputs.snapshotItem(i).name +
                      '_' + inputs.snapshotItem(i).type;
    if (!(storageName in values)) { // Skip if don't include the save values.
      continue;
    }

    switch (inputs.snapshotItem(i).type) {
      case 'radio':
        if (inputs.snapshotItem(i).checked) {
          writeData[storageName] = inputs.snapshotItem(i).value;
          debug.push(inputs.snapshotItem(i).name);
        }
        break;
      case 'checkbox':
        writeData[storageName] = inputs.snapshotItem(i).checked;
        debug.push(inputs.snapshotItem(i).name);
        break;
      case 'text':
        writeData[storageName] = Trim(inputs.snapshotItem(i).value);
        debug.push(inputs.snapshotItem(i).name);
        break;
    }
  }

  var textareas = document.evaluate('//textarea', document, null, 7, null);
  for (var i = 0; i < textareas.snapshotLength; i++) {
    var storageName = textareas.snapshotItem(i).name + '_' +
                      textareas.snapshotItem(i).tagName.toLowerCase();
    if (!(storageName in values)) { // Skip if don't include the save values.
      continue;
    }

    writeData[storageName] = Trim(textareas.snapshotItem(i).value);
    debug.push(textareas.snapshotItem(i).name);
  }

  chrome.storage.local.set(writeData, function() {
    if (getType(debugCallback) == 'function') {
      debugCallback(debug);
    }
  });
}

function InitValues(document, checkTagList, default_values)
{
  if (getType(document) != 'object' ||
      getType(checkTagList) != 'array' ||
      getType(default_values) != 'object') {
    throw 'InitValues Funciton. Argument Error.';
  }

  var debugs = {};
  for (var i = 0; i < checkTagList.length; i++) {
    var tag = checkTagList[i];
    var elements = document.getElementsByTagName(tag);
    for (var z = 0; z < elements.length; z++) {
      var el = elements[z];
      if (tag == 'textarea') {
        // textarea tags
        var storageName = el.name + '_' + el.tagName.toLowerCase();
        var value = default_values[storageName] ?
                    default_values[storageName] : '';
        el.value = value;
        debugs[storageName] = value;
      } else {
        // other tags
        var storageName = el.name + '_' + el.type;
        var value = default_values[storageName];
        switch (el.type) {
          case 'radio':
            if (el.value == value) {
              el.checked = true;
              debugs[storageName] = value;
            }
            break;
          case 'checkbox':
            el.checked = value;
            debugs[storageName] = default_values[storageName];
            break;
          case 'text':
            value = value ? value : '';
            el.value = value;
            debugs[storageName] = value;
            break;
        }
      }
    }
  }

  return debugs;
}

function InitTranslation(document)
{
  if (getType(document) != 'object') {
    throw 'InitTranslation Function is Argument Error.';
  }

  // テキストの設定
  for (var i = 0; i < locale_i18n.length; i++) {
    var el = document.getElementsByClassName(locale_i18n[i] + 'Text');
    var message = chrome.i18n.getMessage(locale_i18n[i]);
    for (var j = 0; j < el.length; j++) {
      var string = el[j].innerHTML;
      var index = string.lastIndexOf('</');
      el[j].innerHTML = string.substring(0, index) +
                        message + string.substring(index);
    }
  }
}


/**
* 正規表現検証ツールの一致文字列を置き換える際に使用する関数
* @param {string} str マッチした部分文字列.
* @param {integer} offset マッチが現れた文字列内のオフセット.
* @param {string} s マッチが現れた文字列自体.
*/
function replacer(str, offset, s) {
  return '<span style=\"background: red;\">' + str + '</span>';
}


/**
* 正規表現検証ツールの入力をチェック
*/
function checkRegex()
{
  var elRegularExpression =
      document.querySelector('input[name="regular_expression"]');
  var elOptions = document.querySelector('input[name="options"]');
  var elCompareString = document.querySelector('#compare_string');
  var elResult = document.querySelector('#result');

  // 正規表現で比較・置き換え
  var re = new RegExp(elRegularExpression.value,
                      elOptions.value ? elOptions.value : '');
  var replacedString = '';
  var compareStringSplit = elCompareString.value.split('\n');
  for (var i = 0; i < compareStringSplit.length; i++) {
    replacedString += compareStringSplit[i].replace(re, replacer) + '<br>';
  }

  // 結果を表示する領域の高さ変更
  elResult.style.height = compareStringSplit.length * 1.5 + 'em';

  // 表示
  elResult.innerHTML = replacedString;
}

/**
* 正規表現クイックリファレンスの生成と表示
*/
function createRegexReference()
{
  var regex_items = [
    { '[abc]' : 'regex_single' },
    { '.' : 'regex_any_single' },
    { '(...)' : 'regex_capture' },
    { '[^abc]' : 'regex_any_except' },
    { '\\s' : 'regex_whitespace' },
    { '(a|b)' : 'regex_or' },
    { '[a-z]' : 'regex_range' },
    { '\\S' : 'regex_non_whitespace' },
    { 'a?' : 'regex_zero_one' },
    { '[a-zA-Z]' : 'regex_range_or' },
    { '\\d' : 'regex_digit' },
    { 'a*' : 'regex_zero_more' },
    { '^' : 'regex_start' },
    { '\\D' : 'regex_non_digit' },
    { 'a+' : 'regex_one_more' },
    { '$' : 'regex_end' },
    { '\\w' : 'regex_word' },
    { 'a{3}' : 'regex_exactly' },
    { '\\W' : 'regex_non_word' },
    { 'a{3,}' : 'regex_three_or_more' },
    { '\\b' : 'regex_word_boundary' },
    { 'a{3,6}' : 'regex_between' }
  ];
  var regex_options = [
    { 'g' : 'regex_global' },
    { 'i' : 'regex_confuse' }
  ];

  // リファレンス作成
  var outputRegex = '<table>';
  var count = 0;
  for (var i in regex_items) {
    if (count == 0) {
      outputRegex += '<tr>';
    }

    for (var j in regex_items[i]) {
      outputRegex += '<th>' + j + '</th>';
      outputRegex +=
          '<td>' + chrome.i18n.getMessage(regex_items[i][j]) + '</td>';
    }

    if (count >= 2) {
      outputRegex += '</tr>';
      count = 0;
      continue;
    }
    count++;
  }
  if (count != 0) {
    outputRegex += '</tr>';
  }
  outputRegex += '</table>';

  // オプション部分作成
  var outputOption = '<table>';
  for (var i in regex_options) {
    if (count == 0) {
      outputOption += '<tr>';
    }

    for (var j in regex_options[i]) {
      outputOption += '<th>' + j + '</th>';
      outputOption +=
          '<td>' + chrome.i18n.getMessage(regex_options[i][j]) + '</td>';
    }

    if (count >= 3) {
      outputOption += '</tr>';
      count = 0;
      continue;
    }
    count++;
  }
  if (count != 0) {
    outputOption += '</tr>';
  }
  outputOption += '</table>';

  // 出力
  document.querySelector('#regex_reference').innerHTML = outputRegex;
  document.querySelector('#regex_option_reference').innerHTML = outputOption;
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize
  InitTranslation(document);
  InitValues(document, ['input', 'textarea'], default_values);
  LoadValues(document, null); // Config Load

  // buttons
  var status = document.getElementById('status');
  var timeoutTime = 1000;
  document.querySelector('#save').addEventListener('click', function(e) {
    SaveValues(default_values);

    status.innerHTML = 'Options Saved.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);
  document.querySelector('#load').addEventListener('click', function(e) {
    LoadValues(document, default_values);

    status.innerHTML = 'Options Loaded.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);
  document.querySelector('#init').addEventListener('click', function(e) {
    change_options = InitValues(
        document, ['input', 'textarea'], default_values);

    status.innerHTML = 'Options Initialized.';
    setTimeout(function() {
      status.innerHTML = '';
    }, timeoutTime);
  }, false);

  // Import and Export
  var config_view = document.getElementById('config_view');
  var config_view_status = document.getElementById('config_view_status');
  document.getElementById('export').addEventListener('click', function(e) {
    chrome.storage.local.get(null, function(items) {
      config_view.value = JSON.stringify(items);
    });
  }, false);
  document.getElementById('import').addEventListener('click', function(e) {
    try {
      var items = JSON.parse(config_view.value);
      LoadValues(document, items, function() {
        config_view_status.textContent = 'Success. Please, save';
        config_view_status.style.color = 'green';
        setTimeout(function() {
          config_view_status.innerHTML = '';
        }, 1000);
      });
    } catch (e) {
      config_view_status.textContent = 'Import error. invalid string.';
      config_view_status.style.color = 'red';
      return;
    }
  }, false);

  // 正規表現確認ツールの表示・非表示アニメーション
  var move_pixelY = 460; // 表示サイズ
  var elTool = document.querySelector('#tool_box');
  elTool.style.webkitTransitionProperty = '-webkit-transform';
  elTool.style.webkitTransitionDelay = '0.0s';
  elTool.style.webkitTransitionDuration = '1.0s';
  elTool.style.webkitTransitionTimingFunction = 'ease';
  elTool.style.height = move_pixelY + 'px';

  // toggle
  var clicked = false;
  var elOpenTool = document.querySelectorAll('.open_tool');
  for (var i = 0; i < elOpenTool.length; i++) {
    elOpenTool[i].addEventListener('click', function(event) {
      if (clicked) {
        elTool.style.webkitTransform = 'translate(0px, ' + move_pixelY + 'px)';
        clicked = false;
      } else {
        elTool.style.webkitTransform = 'translate(0px, ' + -move_pixelY + 'px)';
        clicked = true;
      }
    });
  }

  document.querySelector('input[name="regular_expression"]').addEventListener(
      'keyup', checkRegex);
  document.querySelector('input[name="options"]').addEventListener(
      'keyup', checkRegex);

  var elCompareString = document.querySelector('#compare_string');
  elCompareString.addEventListener('keyup', checkRegex);

  // 正規表現クイックリファレンス
  createRegexReference();
});
