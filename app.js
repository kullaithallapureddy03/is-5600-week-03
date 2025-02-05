const http = require('http');
const url = require('url');
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const chatEmitter = new EventEmitter();

const port = process.env.PORT || 3000

const app = express();

app.use(express.static(__dirname + '/public'));

const respondText = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hi');
}

const respondJson = (req, res) => {
    res.json({
        text: 'hi',
        'numbers': [1,2,3],
    });
}

const respondNotFound = (req, res) => {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
}

const respondEcho = (req, res) => {
    const { input = '' } = req.query;

    res.setHeader('Content-Type', 'application/json');
    res.json({
        normal: input,
        shouty: input.toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join(''),
    });

}

const chatApp = () => {
    res.sendFile(path.join(__dirname, '/chat.html'));
}

const respondSSE = () => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
    });

    const onMessage = message => res.write(`data: ${message}\n\n`);
    chatEmitter.on('message', onMessage);

    res.on('close', () => {
        chatEmitter.off('message', onMessage);
    });
}

const respondChat = () => {
    const { message } = req.query;

    chatEmitter.emit('message', message);
    res.end();
}

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);



const server = http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') return respondText(request, response);
    if (pathname === '/json') return respondJson(request, response);
    if (pathname.match(/^\/echo/)) return respondEcho(request, response);

    respondNotFound(request, response);
});

server.listen(port, function() {
    console.log(`Server is listening on port ${port}`);
})