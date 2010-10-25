var leaf = require('leaf');

/* Connect to our db */
var dbConfig = {
    dbname: 'bitbox',
    host: 'flame.mongohq.com',
    port: 27032,
    username: 'bitbox',
    password: 'bitbox'
};

var pair = exports.pair = (function() {

    var db = leaf.model({
            name: 'Pair',
            collectionName: 'pairs',
            fields: {
                domain: {
                    type: String,
                    required: true
                },
                dropboxId: {
                    type: String,
                    required: true
                }
            }
    })(dbConfig);

    var scope = {
        getDropboxId: function(domain, callback) {
            db.find({ domain: domain }).each(function(err, obj) {
                if (err) callback.call(scope, err);
                else callback.call(scope, err, obj.get('dropboxId'));
            });
        },

        getAll: function(callback) { db.all(callback); },

        store: function(data, callback) {
            var testSuite = new db.create(
                { domain: data.domain, dropboxId: data.dropboxId }
            );
            testSuite.save(callback);
        }
    };

    return scope;
})();