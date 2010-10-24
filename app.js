var sys     = require('sys')
   ,domain  = require('./lib/domain')
   ,dropbox = require('./lib/dropbox')
   ,connect = require('connect');

var PORT = 3000;

var cfg = {
    ip: '90.179.107.114',
    domain: 'localhost:3000',
    test: 'test1234.nesetril.cz'
};

function website(app) {
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
            
            domain.test(req.body.domain, function(err, domains) {
                if (err) {
                    res.writeHead(400, { 'Content-Type':'text/plain' });
                    res.end(sys.inspect(err));
                } else {
                    dropbox.test(req.body.dropbox, function(err, data) {
                        if (err) {
                            res.writeHead(400, { 'Content-Type':'text/plain' });
                            res.end(sys.inspect(err)+sys.inspect(data));
                        } else {
                            res.writeHead(200, { 'Content-Type':'text/plain' });
                            res.end('Successful pairing!')
                        }
                    });
                }
            });

        }
    });
}


var server = module.exports = connect.createServer(
    // connect.logger(),
    connect.bodyDecoder(),
    connect.router(website),
    connect.staticProvider(__dirname + '/public')
);

sys.puts('Server started on port '+PORT);
server.listen(PORT);