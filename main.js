var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;
    if(pathname == '/') {
        // root, show files
        if(queryData.id == undefined) {
            fs.readdir('./data', function(error, filelist) {
                var list = template.list(filelist);
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var html = template.html(title, list, `<h2>${title}</h2>${description}`, 
                `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });
        } 
        // not root, show files
        else {
            fs.readdir('./data', function(error, filelist) {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf-8', function(err, data) {
                    var list = template.list(filelist);
                    var title = queryData.id;
                    var description = data;
                    var html = template.html(title, list, `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a> 
                    <a href="/update?id=${title}">update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                    </form>
                    `);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    }
    // create form
    else if (pathname == '/create') {
        fs.readdir('./data', function(error, filelist) {
            var list = template.list(filelist);
            var title = 'WEB - create';
            var html = template.html(title, list, `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    } 
    // create_process
    else if (pathname == '/create_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
                response.writeHead(302, 
                    {Location: `/?id=${title}`});
                response.end();
            });
        });
    } 
    // modify (update) form
    else if (pathname == '/update') {
        fs.readdir('./data', function(error, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf-8', function(err, data) {
                var list = template.list(filelist);
                var title = queryData.id;
                var description = data;
                // input type, hidden을 통해 기존 title을 저장할 수 있음
                var html = template.html(title, list, `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });
    }
    // update_process
    else if (pathname == '/update_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(err) {
                fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
                    response.writeHead(302, 
                        {Location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    } 
    // delete_process
    else if (pathname == '/delete_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(err) {
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    }
    // invalid link, response 404
    else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
