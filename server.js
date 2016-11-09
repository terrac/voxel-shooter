var express = require('express');
var app = express();
var http = require('http').Server(app);


app.get('/', function(req, res) {
    res.sendfile('index.html');
});


app.use(express.static('dist'));


http.listen(process.env.PORT||8080, process.env.IP, function() {
    console.log('listening on server'+ process.env.IP);
});
