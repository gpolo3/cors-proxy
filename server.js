var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        const targetURL = req.headers['target-url']
        if (!Boolean(targetURL)) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        const headers = {}

       // headers['x-api-key'] = req.headers['x-api-key'];
        
        if(Boolean(req.headers['authorization'])) {
            headers['authorization'] = req.headers['authorization']; 
        }
        
        request({ url: targetURL + req.url, method: req.method, json: req.body, headers },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
//                console.log(body);
            }).pipe(res);
    }
});

app.set('port', process.env.PORT || 3012);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});