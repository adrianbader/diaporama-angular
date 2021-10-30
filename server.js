const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const getVideoDuration = require('get-video-duration');
const imageSize = require('image-size');


const appRootFolder = './dist/slideshow';
const slideShowRootFolder = process.env.ROOT_DIR;

const ipaddress = "0.0.0.0";
const port = 8080;

const videoFileEndings = ['.MOV', 'MP4'];
const imageFileEndings = ['.jpg'];

async function buildFilesList(folder) {
  const fileList = fs.readdirSync(folder);
  const files = [];
  for (const fileName of fileList) {
    if (isImage(fileName) || isVideo(fileName)) {
      const imageDimensions = isImage(fileName) ? imageSize(`${folder}/${fileName}`) : {};
      files.push({
        name: path.basename(fileName),
        videoDurationInSeconds: isVideo(fileName) ? (await videoDuration(`${folder}/${fileName}`)) : undefined,
        imageWidth: imageDimensions.width,
        imageHeight: imageDimensions.height
      })
    }
  }

  return {
    files: files
  }
}

function isVideo(fileName) {
  return videoFileEndings.find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase()));
}

function isImage(fileName) {
  return imageFileEndings.find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase()));
}

async function videoDuration(file) {
  return await getVideoDuration.getVideoDurationInSeconds(file) * 1000;
}

try {
  if (!slideShowRootFolder) {
    console.error("ROOT_DIR not specified!");
    return 1;
  }
  const app = express();

  const processRequest = function (req, res) {

    const buildStoreAndSendFilesJson = function () {
      buildFilesList(`${slideShowRootFolder}/${path.dirname(url)}`).then(data => {
        fs.writeFileSync(`${slideShowRootFolder}/${path.dirname(url)}/files.json`, JSON.stringify(data, null, 2));
        res.send(data)
      });
    }

    const url = path.extname(req.params[0]) ? req.params[0] : 'index.html';
    if (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.map') || url.endsWith('.ico')) {
      const filename = path.basename(url);
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
        if (path.basename(url) === 'files.json' && req.query['forceFileScan'] !== undefined) {
          buildStoreAndSendFilesJson();
        } else {
          res.sendFile(url, {root: slideShowRootFolder}, function (err) {
            if (err) {
              console.log('%s: ERROR - %s', Date(Date.now()), err);
            }
          });
        }
      } else if (path.basename(url) === 'files.json') {
        buildStoreAndSendFilesJson();
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
