const static = require('node-static');
const http = require('http');

const file = new static.Server('./lib');
const PORT = process.env.PORT || 8080;

http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(PORT, function() {
    console.log('App running on http://localhost:' + PORT);
});
