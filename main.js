var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;
    if(pathname == '/') {
        if(queryData.id == undefined) {
            fs.readdir('./data', function(error, filelist) {
                var list = `<ul>`;
                for (i = 0; i < filelist.length; i++) {
                    list += `<li><a href="?id=${filelist[i]}">${filelist[i]}</a></li>`;
                }

                list += `</ul>`;
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var template = `
                <!doctype html>
                <html>
                <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
                </head>
                <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                <h2>${title}</h2>
                <p>${description}</p>
                </body>
                </html>
                    `;
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var list = `<ul>`;
                for (i = 0; i < filelist.length; i++) {
                    list += `<li><a href="?id=${filelist[i]}">${filelist[i]}</a></li>`;
                }
                list += `</ul>`;
                fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, data) {
                    var title = queryData.id;
                    var description = data;
                    var template = `
                    <!doctype html>
                    <html>
                    <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                    </head>
                    <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    <h2>${title}</h2>
                    <p>${description}</p>
                    </body>
                    </html>
                    `;
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
