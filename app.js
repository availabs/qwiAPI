"use strict";


var app = require('express')() ;

var port = (require('process').env.PORT || 10101);


app.get('/*', (req, res) => 
    res.status(200).json(req.url.split('/').filter(s => s))
);


app.listen(port, function () {
  console.log('App listening on port ' + port);
});
