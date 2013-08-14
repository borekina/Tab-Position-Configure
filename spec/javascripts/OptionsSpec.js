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
              if (getValues != null && getType(getValues) != 'object') {
                throw new Error('chrome.storage.local.get mock error.');
              }
              if (getType(callback) != 'function') {
                throw new Error('chrome.storage.local.get mock error.' +
                                ' callback is not function.');
              }

              if (getValues != null) {
                var returnData = new Object();
                for (var key in getValues) {
                  returnData[key] = this.data[key];
                }
                callback(returnData);
              } else {
                callback(this.data);
              }
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

        SaveValues(
          document, ['checkbox', 'radio', 'text', 'number'], function(debug) {
        SaveValues(values, function(debug) {
          expect(debug.length).toEqual(4);
        });
    });
});
