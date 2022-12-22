// The server reads the JavaScript files and returns them as a string, allowing for local debugging. In the production environment, the JavaScript files will be uploaded to IPFS and the IPFS hash will be used to load the code.

var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {

    var args = req.url.split('/');

    var file = {
        path: process.cwd() + '/src/server/' + args[2] + '.js',
        name: args[2],
        req: '/api/' + args[2],
    }

    if (req.url === file.req) {

        fs.readFile(file.path, function (err, data) {

            if (err) {
                res.writeHead(404);
                res.write("console.log('404 not found');");
                return res.end();
            }

            // return as pure string
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(data.toString());
            return res.end();

        });
    }
});

server.on('request', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
});


console.log("Listening on port 8181...");
server.listen(8181);