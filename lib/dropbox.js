var http = require('http')
    ,url = require('url');

exports.regexp = /http\:\/\/dl\.dropbox\.com\/u\/([0-9]+)\/.*/;
exports.publicFile = 'http://dl.dropbox.com/u/12345/file-sample.txt';

exports.test = function(dropbox, callback) {
    var user = exports.regexp.exec(dropbox)[1];
    var file = url.parse(exports.publicFile);
    if (!user) {
        callback(true, 'No user string found!');
    } else {
        var request = http.createClient(80, file.host).request('HEAD', file.pathname.replace('12345',user), { 'host': file.host });
        request.on('response', function(response) {
            if (response.statusCode !== 200) {
                callback(true, response);
            } else {
                callback(false, user);
            }
        });
        request.end();
    }
};
