# LGV Main

## Local Development Setup

Da wir an vielen Stellen von der cmd ins Internet wollen, die Umgebungsvariablen HTTP_PROXY und HTTPS_PROXY je auf http://wall.lit.hamburg.de:80 setzen.

Dann folgende Tools lokal installieren.

### [git](http://git-scm.com/)
Der Installationspfad von Git (C:\Program Files\Git\bin\) muss in der systemweiten PATH-Umgebungsvariable stehen.

Da das git-Protokoll von unserer Firewall geblockt wird, git sagen, dass es, bei git-URLs stattdessen das https-Protokoll nutzen soll
```
# git config --global url.https://.insteadof=git://
```

ggf. durch HTTP*_PROXY Umgebungsvariablen nicht mehr notwendig:

```
git config --global http.proxy http://wall.lit.hamburg.de:80
git config --global https.proxy http://wall.lit.hamburg.de:80
```

### [Node.js](http://nodejs.org)

Via Windows-Installer von der Seite.

Test in cmd:

```
# node -v
```

### [NPM](http://npmjs.org)

Kommt automatisch mit der Node.js Installation mit (Node Package Manager). 
Test in cmd:

```
# npm -v
```

npm lädt Pakete aus dem Netz. 

#### Einstellungen
npm-config Einträge werden je in die Dateien C:\Users\<user>\.npmrc geschrieben. Übersicht über alle npm configs:

```
# npm config list
# npm config ls -l
```

Sinnvoll denke noch den Pfad zum npm-cache außerhalb des Roaming-Profils zu legen (cmd und Admin-cmd oder die .npmrc-Dateien entsprechend anpassen)

```
npm config set npm-cache <D:\npm-cache>
```

#### Proxy-Einstellungen

ggf. durch HTTP*_PROXY Umgebungsvariablen nicht mehr notwendig:

in der normalen cmd **UND** in der Admin-cmd (cmd als Admin ausführen). 

```
# npm config set proxy http://wall.lit.hamburg.de:80
# npm config set https-proxy http://wall.lit.hamburg.de:80
```

#### npm-Pakete global installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config prefix = C:\Programme\nodejs\
```

Durch den Admin global installierte Pakete werden in diesen Pfad installiert. [Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders).

### [Grunt](http://gruntjs.com/)
Grunt-cli (Command Line Interface) in der Admin-cmd global installieren
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

Das 'echte' grunt wird später lokal (und durch den normalen User) installiert.

### [Bower](http://bower.io)
Paketmanager für das Web.

In der Admin-cmd global installieren
```
$ npm install -g bower
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

```
# grunt server
```

yeaih!


Alle grunt-Tasks 

```
# grunt -h
```