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

chrome.runtime.sendMessage({ getKey: 'other_domain_open_checkbox' },
                           function(state) {
    if (state == undefined || state == null) {
        state = default_values['other_domain_open_checkbox'].toString();
    } else if (typeof(state) != 'string') {
        throw 'sendMessage Error. state is not string.';
    }
    if (state != 'true') {
        return;
    }

    chrome.runtime.sendMessage({ getKey: 'exclude_url_textarea' },
                               function(excludeUrl) {
        if (excludeUrl == undefined || excludeUrl == null) {
            excludeUrl = default_values['exclude_url_textarea'];
        } else if (typeof(excludeUrl) != 'string') {
            throw 'sendMessage Error. excludeUrl is not string.';
        }

        chrome.runtime.sendMessage(
            { getKey: 'domain_regopt_insensitive_checkbox' },
            function(insensitiveOption) {
            if (insensitiveOption == undefined || insensitiveOption == null) {
                insensitiveOption = default_values[
                        'domain_regopt_insensitive_checkbox'].toString();
            } else if (typeof(insensitiveOption) != 'string') {
                throw 'sendMessage Error. insensitiveOption is not string.';
            }

            var result = CheckExclude(
                excludeUrl.split('\n'), insensitiveOption == 'true' ? 'i' : '',
                location.href);
            if (!result) {
                var element = document.getElementsByTagName('a');
                for (var i = 0; i < element.length; i++) {
                    ChangeNewOpenTabLink(element[i]);
                }
            }
        });
    });
});
