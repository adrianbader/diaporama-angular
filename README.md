# diaporama-angular

This project consists of two parts:

* Angular Web App, generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.4.
* Node.js App

The Node.js part generates server side a file listing of requested folder and serves the angular app, which requests the
file listing to generate the diaporama.json.

## Run diaporama-angular

Run `npm start` to build angular app to dist folder and start node.js app to serve the angular app. Navigate
to `http://localhost:8080` to open application.

## Development

### Angular App

* copy jpg files and/or mp4 files and its files.json to assets folder
* run `npm run ng serve`
* open http://localhost:4200/assets in your browser

### Query parameters

* `forceFileScan`: rebuild files.json
* `delay`: display time in ms of images and slides

## Docker
* Note: do not forget to build the angular app with `ng build` before creating the docker image!
* build the docker image: execute `docker build . -t angular-diaporama` from project root directory
* the image may be exported from the docker registry to a file: `docker save angular-diaporama:latest | gzip > angular-diaporama.tar.gz`
* the image may be imported into the docker registry: `docker load < angular-diaporama.tar.gz`
* run the image: `docker run -d --restart always -p 8080:8008 -e ROOT_DIR=/data -v "/home/<your-foto-folder>":/data angular-diaporama`
