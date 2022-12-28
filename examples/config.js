const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('./examples/test-website/index.html').pipe(res)
})

const config = {

    // The GTM Container ID used on the test website
    containerId: "GTM-NXRWX4M",

    // Seves the test website on localhost:3000
    serveTestPage: function() {
        server.listen(process.env.PORT || 3000)
    },

    // Stops the test website
    stopTestPage: function() {
        server.close();
    }
    
}

module.exports = config;