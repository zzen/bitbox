var fs      = require('fs')
   ,sys     = require('sys')
   ,connect = require('connect')
   ,domain  = require('./lib/domain')
   ,dropbox = require('./lib/dropbox')
   ,storage = require('./lib/storage');

var PORT = 3000;

var cfg = {
    ip: '90.179.107.114',
    domain: 'localhost:3000',
    test: 'test1234.nesetril.cz'
};

function websiteRoutes(app) {
    app.post('/activate', function(req, res, next) {
        
        if (!req.body.domain) {
            res.writeHead(400, { 'Content-Type':'text/plain' });
            res.write('Parameters: '+sys.inspect(req.body));
            res.end('Please enter a domain name!');
        } else if (!req.body.dropbox || !dropbox.regexp.test(req.body.dropbox)) {
            res.writeHead(400, { 'Content-Type':'text/plain' });
            res.write('Parameters: '+sys.inspect(req.body));
            res.end('Please include path to your public dropbox file!');
        } else {

            var testHost = 'bitbox-verify.'+req.body.domain;

            domain.test(testHost, function(err, domains) {
                if (err) {
                    res.writeHead(400, { 'Content-Type':'text/plain' });
                    res.write('The DNS lookup for was not successful for '+testHost+'!'+"\n");
                    res.end(sys.inspect(err));
                } else {
                    dropbox.test(req.body.dropbox, function(err, user) {
                        if (err) {
                            res.writeHead(400, { 'Content-Type':'text/plain' });
                            res.write('File '+req.body.dropbox+' could not be found!'+"\n");
                            res.end(sys.inspect(err)+sys.inspect(user));
                        } else {
                            storage.pair.store({ domain: req.body.domain, dropboxId: user }, function(err, data) {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type':'text/plain' });
                                    res.write('Could not save setup into MongoHQ!'+"\n");
                                    res.end(sys.inspect(err)+sys.inspect(data));
                                } else {
                                    res.writeHead(200, { 'Content-Type':'text/plain' });
                                    console.log(sys.inspect(data));
                                    res.end('Pairing setup successfully!');
                                }
                            });
                        }
                    });
                }
            });

        }
    });
}

var website = connect.createServer(
    connect.bodyDecoder(),
    connect.router(websiteRoutes),
    connect.staticProvider(__dirname + '/public')
);


var bitbox = connect.createServer(function(req, res) {

    var domain = req.headers.host;

    storage.pair.getDropboxId('nesetril.cz', function(err, user) {
        if (err) {
            res.writeHead(404, { 'Content-Type':'text/plain' });
            res.write('Cannot find setup for this domain!'+"\n");
            res.end(sys.inspect(err)+sys.inspect(user));
        } else {
            fs.readFile(__dirname + '/frame.html', 'utf8', function(err, data) {
                res.writeHead('200', {'Content-Type':'text/html'});
                res.end(data.replace('{{url}}', 'http://dl.dropbox.com/u/'+user+req.url));
            });
        }
    });

});

var server = module.exports = connect.createServer(
    connect.logger(),
    connect.vhost('localhost', website),
    connect.vhost('(?!localhost)*', bitbox)
);

sys.puts('Server started on port '+PORT);
server.listen(PORT);