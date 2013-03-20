describe('Options Function', function() {
    it('Load Settings', function() {
        loadFixtures('../../options.html');

        expect(function() { LoadValues(document, {}); }).not.toThrow();
        expect(function() { LoadValues(function() {}); }).toThrow();
        expect(function() { LoadValues(document, 1); }).toThrow();

        var values = {
            'open_pos_radio': 'default',
            'close_focus_radio': 'default',
            'other_domain_open_checkbox': true,
            'exclude_url_textarea':
        '(10.\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\d{1,3}.\d{1,3}\n' +
                'localhost\n' +
                'google.(co.jp|com)',
            'popup_window_is_open_tab_checkbox': false
        };
        var values = LoadValues(document, values);
        expect(values).toEqual([
            'open_pos',
            'close_focus',
            'other_domain_open',
            'exclude_url',
            'popup_window_is_open_tab'
        ]);
    });

    it('Save Settings', function() {
        loadFixtures('../../options.html');

        var debug = SaveValues();
        // 最初の要素は空白の要素。evaluteを使った時になぜか入る。
        // loadFixturesが原因？
        expect(debug.length).toEqual(12);
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
