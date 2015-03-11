# LGV Main

## Local Development Setup

Folgende Tools müssen lokal installiert werden:

### [Node.js](http://nodejs.org)

Via installer von der Seite.

### [NPM](http://npmjs.org)

Kommt automatisch mit der Node.js Installation mit (Node Package Manager).

### [Bower](http://bower.io)

Wird über NPM global auf dem System installiert:

```
# -g Für globale installation des Modules
$ npm install bower -g
```
## set proxies:

### npm 

### bower

### git

```
git config --global http.proxy http://wall.lit.hamburg.de:80
git config --global https.proxy http://wall.lit.hamburg.de:80
```


## Build Abhängigkeiten ziehen via NPM.

```
$ npm install
```

## App Abhängigkeiten ziehen via Bower

```
$ bower install
```

### Grunt Tasks

@TODO