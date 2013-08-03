var chrome = null;
describe('Options Function', function() {
    beforeEach(function() {
      chrome = {
        storage: {
          local: {
            data: {
              'open_pos_radio': 'default',
              'close_focus_radio': 'default',
              'other_domain_open_checkbox': false,
              'exclude_url_textarea':
      '(10.\\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\\d{1,3}.\\d{1,3}\n' +
                  'localhost\n' +
                  'google.(co.jp|com)',
            },
            get: function(getValues, callback) {
              if (getType(getValues) != 'object') {
                throw new Error('chrome.storage.local.get mock error.');
              }
              if (getType(callback) != 'function') {
                throw new Error('chrome.storage.local.get mock error.' +
                                ' callback is not function.');
              }

              var returnData = new Object();
              for (var key in getValues) {
                returnData[key] = this.data[key];
              }

              callback(returnData);
            },
            set: function(setObject, callback) {
              for (var key in setObject) {
                this.data[key] = setObject[key];
              }

              callback();
            }
          }
        }
      };
    });

    it('Load Settings', function() {
        loadFixtures('../../options.html');

        expect(function() { LoadValues(document, {}); }).not.toThrow();
        expect(function() { LoadValues(function() {}); }).toThrow();
        expect(function() { LoadValues(document, 1); }).toThrow();

        var values = {
            'open_pos_radio': 'default',
            'close_focus_radio': 'default',
            'other_domain_open_checkbox': false,
            'exclude_url_textarea':
    '(10.\\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\\d{1,3}.\\d{1,3}\n' +
                'localhost\n' +
                'google.(co.jp|com)',
        };
        LoadValues(document, values, function(debugList) {
          expect(debugList).toEqual([
            'open_pos',
            'close_focus',
            'other_domain_open',
            'exclude_url',
          ]);
        });
    });

    it('Save Settings', function() {
        loadFixtures('../../options.html');

        var values = {
            'open_pos_radio': 'default',
            'close_focus_radio': 'default',
            'other_domain_open_checkbox': false,
            'exclude_url_textarea':
    '(10.\\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\\d{1,3}.\\d{1,3}\n' +
                'localhost\n' +
                'google.(co.jp|com)',
        };
        SaveValues(values, function(debug) {
          expect(debug.length).toEqual(4);
        });
    });

    it('Initalize Settings', function() {
        loadFixtures('../../options.html');

        expect(function() { InitValues({}, [], {}); }).not.toThrow();
        expect(function() { InitValues([], [], {}); }).toThrow();
        expect(function() { InitValues({}, {}, {}); }).toThrow();
        expect(function() { InitValues({}, [], []); }).toThrow();

        var default_values = {
            'open_pos_radio': 'default',
            'close_focus_radio': 'default',
            'other_domain_open_checkbox': false,
            'exclude_url_textarea': '',
            'popup_window_is_open_tab_checkbox': false
        };
        var change_options = InitValues(
            document, ['input', 'textarea'], default_values);

        expect(change_options['open_pos_radio']).toEqual('default');
        expect(change_options['close_focus_radio']).toEqual('default');
        expect(change_options['other_domain_open_checkbox']).toBeFalsy();
        expect(change_options['exclude_url_textarea']).toEqual('');
        expect(change_options[
               'popup_window_is_open_tab_checkbox']).toBeFalsy(false);
    });
});
