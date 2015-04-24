# LGV Main

## Local Development Setup

Da wir an vielen Stellen von der cmd ins Internet wollen, die Umgebungsvariablen HTTP_PROXY und HTTPS_PROXY je auf http://wall.lit.hamburg.de:80 setzen.  Über Rechtsklick Computer/Einstellungen/Erweiterte Systemeinstellungen/Umgebungsvariablen/Systemvariablen

Testen in neu geöffneter cmd:
```
# echo %HTTP_PROXY%
```

Dann folgende Tools lokal installieren.

### [git](http://git-scm.com/)
Der Installationspfad von Git (C:\Program Files\Git\bin\) muss in der systemweiten PATH-Umgebungsvariable stehen.

Da das git-Protokoll von unserer Firewall geblockt wird, git sagen, dass es, bei git-URLs stattdessen das https-Protokoll nutzen soll
```
# git config --global url.https://.insteadof=git://
```

ggf. durch HTTP*_PROXY Umgebungsvariablen nicht mehr notwendig / auf git Bash benötigt, cmd nicht:

```
# git config --global http.proxy http://wall.lit.hamburg.de:80
# git config --global https.proxy http://wall.lit.hamburg.de:80
```

### python in PATH
python haben alle wegen ArcGIS schon installiert.
Der Pfad zur python.exe muss in der PATH-Umgebungsvariable stehen, meist: C:\Program Files\Python27

Test in cmd

```
# python
```

### [Node.js](http://nodejs.org)

Via Windows-Installer von der Seite.

Test in cmd:

```
# node -v
```

### [NPM](http://npmjs.org)

Kommt automatisch mit der Node.js Installation mit (Node Package Manager). npm lädt Pakete aus dem Netz.

Test in cmd:

```
# npm -v
```

npm lässt sich über die Kommandozeile konfigurieren. Konfig-Einträge werden je in die Dateien C:\Users\<user>\.npmrc geschrieben, die man auch direkt editieren kann. Übersicht über alle npm configs:

```
# npm config list
# npm config ls -l
```

#### Cache-Einstellungen

npm legt einen Paket-Cache an. Per Default liegt der unter C:\Users\<user>\AppData\Roaming\npm-cache. Das ist nicht gut, weil dieser Ordner beim An-/Abmelden synchronisiert wird. Daher den Pfad zum npm-cache außerhalb des Roaming-Profils setzen. Dazu die .npmrc-Dateien entsprechend anpassen oder in der cmd und Admin-cmd:

```
npm config set cache D:\npm-cache
```

#### Proxy-Einstellungen

ggf. durch HTTP*_PROXY Umgebungsvariablen nicht mehr notwendig:

in der normalen cmd **UND** in der Admin-cmd (cmd als Admin ausführen).

```
# npm config set proxy http://wall.lit.hamburg.de:80
# npm config set https-proxy http://wall.lit.hamburg.de:80
```

#### npm-Pakete global als Admin installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config set prefix C:\Programme\nodejs\
```

In diesen Pfad werden durch den Admin global installierte Pakete abgelegt. [Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders).

### [Grunt](http://gruntjs.com/)
Grunt ist ein JavaScript Task Runner.

Grunt-cli (Command Line Interface) in der Admin-cmd global installieren
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

### [Bower](http://bower.io)
Paketmanager für das Web.

In der Admin-cmd global installieren

```
# npm install -g bower
```

## Repository klonen

Unser Repository irgendwohin klonen. Zurzeit noch das lokale auf G:.

```
# git clone G:\AG_GeoDaten_Anwendungen\Projekte\Master-Portal\lgv.git
```

in das erstellte Verzeichnis wechseln und den branch merge/bitbucket-local-dev auschecken

```
# git checkout merge/bitbucket-local-dev
```


## Build Abhängigkeiten ziehen via NPM.

```
# npm install
```

liest package.json.


## App Abhängigkeiten ziehen via Bower

```
# bower install
```

liest bower.json. Installiert unter anderem Ordner das Repo build-config nach /components, wo einige grunt-tasks enthalten sind. Außerdem das Repo lgv-config mit services.json und style.json. Beide liegen neben dem lgv.git Repo im Master-Portal-Projekt-Ordner.

## Grunt Tasks ausführen


```
# grunt server
```

yeaih! das Portal local ist für lokale Entwicklung konfiguriert.


```
// grunt build --path=<pfad-zum-portal>
# grunt build --path=portale/local
```

- baut das Portal und alles, was es braucht in den Ordner dist/<pkg.version>
- Pfade in index.html werden automatisch ersetzt
- components/lgv-config, also Konfigs, die zwischen den Portalen geteilt werden, werden in den Ordner /lgv-config kopiert, da wird die auch auf den 'echten' Servern erwartet
 - Pfade zu *Conf in config.js werden automatisch ersetzt

#### Alle grunt-Tasks

```
# grunt -h
```

## Aktualisieren von build-config und lgv-config

```
# bower update build-config
# bower update lgv-config
```

aktualisiert die Verzeichnisse components/lgv-config und components/build-config, wenn dort neue Commits vorhanden sind.
