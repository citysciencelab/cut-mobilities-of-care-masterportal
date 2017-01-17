LGV Master-Portal
=================

[TOC]

#Allgemeines

#Readmeund Kommentare/md Dateien stylen:
http://markdown.de/


# lokale Entwicklungsumgebung einrichten

## [git](http://git-scm.com/)
Der Installationspfad von Git (C:\Program Files\Git\bin\) muss in der systemweiten PATH-Umgebungsvariable stehen.

Da das git-Protokoll von unserer Firewall geblockt wird, git sagen, dass es, bei git-URLs stattdessen das https-Protokoll nutzen soll
```
# git config --global url.https://.insteadof git://
```

Proxies setzen:

```
# git config --global http.proxy <proxy-url:port>
# git config --global https.proxy <proxy-url:port>
```

## python in PATH
python haben alle wegen ArcGIS schon installiert. Der Pfad zur python.exe muss in der PATH-Umgebungsvariable stehen, meist: C:\Program Files\Python27

Test in cmd:

```
# python
```

## [Node.js](http://nodejs.org)

Via Windows-Installer von der Seite. Letzte als funktionierend bekannte Version: node-v4.2.2-x64 mit NPM 2.14.7

Test in cmd:

```
# node -v
```

## [NPM](http://npmjs.org)

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

### Cache-Einstellungen
npm legt einen Paket-Cache an. Per Default liegt der unter C:\Users\<user>\AppData\Roaming\npm-cache. Das ist nicht gut, weil dieser Ordner beim An-/Abmelden synchronisiert wird. Daher den Pfad zum npm-cache außerhalb des Roaming-Profils setzen. Dazu die .npmrc-Dateien entsprechend anpassen oder in der cmd **UND** Admin-cmd (cmd als Admin ausführen):

```
npm config set cache D:\npm-cache
```

### Proxy-Einstellungen
in der normalen cmd **UND** in der Admin-cmd (cmd als Admin ausführen).

```
# npm config set proxy <proxy-url:port>
# npm config set https-proxy <proxy-url:port>
```

### npm-Pakete global als Admin installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config set prefix C:\Programme\nodejs\
```

In diesen Pfad werden durch den Admin global installierte Pakete abgelegt. [Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders).

## [Grunt](http://gruntjs.com/)
Grunt ist ein JavaScript Task Runner.

Grunt-cli (Command Line Interface) in der Admin-cmd global installieren
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

## [Bower](http://bower.io)
Paketmanager für das Web.

In der Admin-cmd global installieren

```
# npm install -g bower
```

# Repository klonen

Unser Repository irgendwohin klonen.

```
# git clone https://bitbucket.org/lgv-g12/lgv.git
```

Dann in das erstellte Verzeichnis wechseln.


# Build Abhängigkeiten ziehen via NPM.

```
# npm install
```

liest package.json.


# App Abhängigkeiten ziehen via Bower

Wichtig für Öffentliche Nutzer: die Datei bower-public.json in bower.json umbenennen und in der Datei .bowerrc die Proxy-Einstellungen anpassen.

```
# bower install
```

liest bower.json. Installiert unter anderem Ordner das Repository [build-config](https://bitbucket.org/lgv-g12/build-config) nach /components, wo einige grunt-tasks enthalten sind. Außerdem das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json.



# Grunt Tasks ausführen


## grunt server
Einen lokalen Entwicklungsserver starten.

```
# grunt server
```

yeaih! das Portal local ist für lokale Entwicklung konfiguriert.


## grunt build
Ein Portal für die Veröffentlichung fertig machen.

```
// grunt build --path=<pfad-zum-portal> --name=<Portalname> [--env=internet| default:fhhnet]
# grunt build --path=portale/local --name=FHH-Atlas
```

- baut das Portal und alles, was es braucht in den Ordner dist/<pkg.version>
- Pfade in index.html werden automatisch ersetzt
 - Pfade zu *Conf in config.js werden automatisch ersetzt
- components/lgv-config, also Konfigs, die zwischen den Portalen geteilt werden, werden in den Ordner /lgv-config kopiert, da wird die auch auf den 'echten' Servern erwartet

## grunt doc
Die Dokumentation erzeugen. Zurzeit nur für portale/master/config.js.


```
// läuft nur in der Admin-cmd
# grunt doc
```

- schreibt die Dokumentation nach doc

## grunt buildExamples
```
# grunt buildExamples --env=internet
```
- erzeugt einen Ordner examples, in dem zwei lauffähige Portal-Instanzen (zurzeit simple und simpleTree) enthalten sind inkl. dem Ordner lgv-config und doc (wenn dieser zuvor erstellt wurde)
- erzeugt zusätzlich examples.zip

## grunt copyExamples
```
# grunt copyExamples --env=internet
```
- leert den Ordner examples
- kopiert den aktuellen dist-Ordner nach examples
- kopiert notwednige Dateien aus lgv-config und die beiden Portale und nimmt Ersetzungen vor
- wird aus grunt buildExamples aufgerufen


## Alle grunt-Tasks

```
# grunt -h
```

# Aktualisieren von build-config und lgv-config

```
# bower update build-config
# bower update lgv-config
```

aktualisiert die Verzeichnisse components/lgv-config und components/build-config, wenn dort neue Commits vorhanden sind.
