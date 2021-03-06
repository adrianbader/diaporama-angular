const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const getVideoDuration = require('get-video-duration');


const appRootFolder = './dist/slideshow';
const slideShowRootFolder = '/home/adrian/Y/home/datastorage/pub/03_Fotos/01_Fotos';

const ipaddress = "0.0.0.0";
const port = 8080;

const videoFileEndings = ['.MOV', 'MP4'];

async function buildFilesList(folder) {
    const fileList = fs.readdirSync(folder);
    const files = [];
    for (const fileName of fileList) {
        files.push({
            name: path.basename(fileName),
            videoDurationInSeconds: isVideo(fileName) ? (await videoDuration(`${folder}/${fileName}`)) : undefined
        })
    }

    return {
        files: files
    }
}

function isVideo(fileName) {
    return videoFileEndings.find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase()));
}

async function videoDuration(file) {
    return await getVideoDuration.getVideoDurationInSeconds(file) * 1000;
}

try {
    var app = express();

    var processRequest = function (req, res) {
        var url = path.extname(req.params[0]) ? req.params[0] : 'index.html';
        if (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.map') || url.endsWith('.ico')) {
            var filename = path.basename(url);
            if (fs.existsSync(`${appRootFolder}/${filename}`)) {
                res.sendFile(filename, {root: appRootFolder}, function (err) {
                    if (err) {
                        // res.status(500).send(err);
                        console.log('%s: ERROR - %s', Date(Date.now()), err);
                    }
                });
            } else {
                res.status(404).send('Not found');
            }
        } else {
            if (fs.existsSync(`${slideShowRootFolder}/${url}`)) {
                res.sendFile(url, {root: slideShowRootFolder}, function (err) {
                    if (err) {
//                        res.status(500).send(err);
                        console.log('%s: ERROR - %s', Date(Date.now()), err);
                    }
                });
            } else if (path.basename(url) === 'files.json') {
                buildFilesList(`${slideShowRootFolder}/${path.dirname(url)}`).then(data => res.send(data));
            } else {
                res.status(404).send('Not found');
            }
        }

        // if (path == 'main.html' || path == 'login.html' || path == 'index.html' || path == 'activation.js') {
        //     res.setHeader('Cache-Control', 'no-cache');
        //     res.setHeader('Pragma', 'no-cache');
        // }
        // res.setHeader('X-Frame-Options', 'DENY');
        // res.setHeader('Strict-Transport-Security', 'max-age=31536000');
        //
        // if (path.includes('..')) {
        //     console.log('%s: ERROR - prevent from serving %s', path);
        //     res.status(404).send('Not found');
        //     return;
        // }
    };

    app.get('/*', function (req, res) {
        processRequest(req, res);
    });

    // Start HTTP server
    http.createServer(app).listen(port, ipaddress);

} catch (err) {
    console.log('%s: ERROR - Problem starting node server%s',
        Date(Date.now()), err);
}
