// Default Values. use InitValues Function.
if (!default_values) {
    var default_values = {
        'open_pos_radio': 'default',
        'close_focus_radio': 'default',
        'other_domain_open_checkbox': false,
        'exclude_url_textarea':
        '(10.\\d{0,3}|172.(1[6-9]|2[0-9]|3[0-1])|192.168).\\d{1,3}.\\d{1,3}\n' +
            'localhost\n' +
            'google.(co.jp|com)',
        'domain_regopt_insensitive_checkbox': true,
        'popup_window_is_open_tab_checkbox': false,
        'popup_exclude_url_textarea':
            'chrome[\\w-]*://\n' +
            '*.feedly.com',
        'popup_regopt_insensitive_checkbox': true
    };
}

if (!getType) {
    function getType(obj)
    {
        if (obj instanceof Boolean || typeof obj == 'boolean') return 'boolean';
        if (obj instanceof Number || typeof obj == 'number') return 'number';
        if (obj instanceof String || typeof obj == 'string') return 'string';
        if (obj instanceof Array) return 'array';
        if (obj instanceof Function) return 'function';
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (obj instanceof Object) return 'object';

        throw 'Unknown type';
    }
}

if (!Trim) {
    function Trim(string)
    {
        if (getType(string) != 'string') {
            throw 'Argument error. used not string object.';
        }
        return string.replace(/(^\s+)|(\s+$)/g, '');
    }
}

if (!Unique) {
    function Unique(array)
    {
        if (getType(array) != 'array') {
            throw 'Argument error. used not array object.';
        }

        var tempdict = {};
        var unique = [];
        for (var i = 0; i < array.length; i++) {
            var val = array[i];
            if (!(val in tempdict)) {
                tempdict[val] = true;
                unique.push(val);
            }
        }

        return unique;
    }
}

if (!ArrayEqual) {
    function ArrayEqual(x1, x2)
    {
        if (x1.length != x2.length) {
            return false;
        }

        var i = 0, j = 0;
        while (i < x1.length && j < x2.length) {
            if (x1[i] != x2[j]) {
                return false;
            }
            i++;
            j++;
        }
        return true;
    }
}

if (!Sleep) {
    function Sleep(T) {
        var d1 = new Date().getTime();
        var d2 = new Date().getTime();
        while (d2 < d1 + T) {
            d2 = new Date().getTime();
        }
    }
}
