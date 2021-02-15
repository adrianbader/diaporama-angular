# diaporama-angular

This project consists of two parts:
 * Angular Web App, generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.4.
 * Node.js App

The Node.js part generates server side a file listing of requested folder and serves the angular app, which requests the file listing to generate the diaporama.json. 

## Run diaporama-angular

Run `npm start` to build angular app to dist folder and start node.js app to serve the angular app.
Navigate to `http://localhost:8080` to open application.

## Development server of Angular App

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Angular code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

