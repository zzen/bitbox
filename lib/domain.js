var dns = require('dns');

exports.test = function(domain, callback) {
    dns.resolve(domain, 'A', function(err, addresses) {
        if (err) callback(err);
        else {
            callback(false, addresses);
        }
    });
};