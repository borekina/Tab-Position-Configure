describe('Google Chrome Extensions Content Scripts', function() {
    it('handling before execute', function() {
        var ignoreStrings =
            'localhost\n' +
            'feedly.com\n' +
            'google.(co.jp|com)';
        var testString = [
            'http://www.feedly.com/home',
            'localhost:8080',
            'https://www.google.co.jp/'
        ];

        var ignores = ignoreStrings.split('\n');
        for (var i = 0; i < testString.length; i++) {
            var result = CheckExclude(ignores, 'i', testString[i]);
            expect(result).toBeTruthy();
        }
        var result = CheckExclude(ignores, 'i', 'http://192.168.0.1/');
        expect(result).toBeFalsy();

        expect(function() {
            CheckExclude('', '', 'http://www.feedly.com/home') }).toThrow();
        expect(function() { CheckExclude(ignores, '',[]) }).toThrow();
    });
});
