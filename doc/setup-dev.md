>So wird die lokale Entwicklungsumgebung eingerichtet.

[TOC]

## Systemvoraussetzungen

###git
[git](http://git-scm.com/) installieren.
Der Installationspfad von Git (C:\Program Files\Git\bin\) muss in der systemweiten PATH-Umgebungsvariable stehen.

Da das git-Protokoll von Firewalls geblockt werden kann, git so konfigurieren, dass stattdessen https verwendet wird:

```
# git config --global url.https://.insteadof git://
```

Ggf. müssen Proxy-Einstellungen gesetzt werden:

```
# git config --global http.proxy <proxy-url:port>
# git config --global https.proxy <proxy-url:port>
```

### Node.js
[Node.js](http://nodejs.org) installieren. Letzte als funktionierend bekannte Version: node-v4.2.2-x64 mit NPM 2.14.7

Test in cmd:

```
# node -v
```

Mit Node.js wird auch der Node Package Manager [NPM](http://npmjs.org) installiert.

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
npm legt einen Paket-Cache an. Per Default liegt der unter C:\Users\<user>\AppData\Roaming\npm-cache. Das ist nicht gut, weil dieser Ordner beim An-/Abmelden synchronisiert wird. Daher den Pfad zum npm-cache außerhalb des Roaming-Profils setzen. Dazu die .npmrc-Dateien entsprechend anpassen oder in der cmd **UND** Admin-cmd (cmd als Admin ausführen):

```
npm config set cache D:\npm-cache
```

#### Proxy-Einstellungen
in der normalen cmd **UND** in der Admin-cmd (cmd als Admin ausführen).

```
# npm config set proxy <proxy-url:port>
# npm config set https-proxy <proxy-url:port>
```

#### npm-Pakete global als Admin installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config set prefix C:\Programme\nodejs\
```

In diesen Pfad werden durch den Admin global installierte Pakete abgelegt. [Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders).

### Grunt
[Grunt](http://gruntjs.com/) in der Admin-cmd global installieren:
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

### Bower
[Bower](http://bower.io) in der Admin-cmd global installieren

```
# npm install -g bower
```

## Installation des Masterportals
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/lgv-g12/lgv.git
# cd lgv
```

Dann die Build-Abhängigkeiten ziehen via NPM (alle Abhängigkeiten in der [package.json](../package.json)):

```
# npm install
```

Dann die App-Abhängigkeiten ziehen via Bower (alle Abhängigkeiten in der [bower.json](../bower.json)):

**Wichtig für externe Entwickler**: die Datei bower-public.json in bower.json umbenennen und in der Datei .bowerrc die Proxy-Einstellungen anpassen.

```
# bower install
```

Installiert unter anderem Ordner das Repository [build-config](https://bitbucket.org/lgv-g12/build-config)nach /components, wo einige grunt-tasks enthalten sind. Außerdem das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json.
**Für externe Entwickler** sind es nach Umbenennen der bower-public.json diese Repositories: [build-config-public](https://bitbucket.org/lgv-g12/build-config-public) und [lgv-config-public](https://bitbucket.org/lgv-g12/lgv-config-public).

## Grunt Tasks ausführen
### grunt server
Einen lokalen Entwicklungsserver starten.

```
# grunt server
```

yeaih!

### grunt test
Unter Firefox funktioniert grunt server nicht, hier muss statt dessen mit "grunt test" gearbeitet werden

```
# grunt test
```

anschließend "localhost:8001" im Firefox öffnen

### grunt build
Ein Portal vor Veröffentlichung optimieren.

```
// grunt build --path=<pfad-zum-portal> --name=<Portalname> [--env=internet| default:fhhnet]
# grunt build --path=portale/local --name=FHH-Atlas
```

- baut das Portal und alles, was es braucht in den Ordner dist/<pkg.version>
- Pfade in index.html werden automatisch ersetzt
 - Pfade zu *Conf in config.js werden automatisch ersetzt
- components/lgv-config, also Konfigs, die zwischen den Portalen geteilt werden, werden in den Ordner /lgv-config kopiert, da wird die auch auf den 'echten' Servern erwartet

### grunt buildExamples
```
# grunt buildExamples --env=internet
```
- erzeugt einen Ordner examples, in dem zwei lauffähige Portal-Instanzen (zurzeit simple und simpleTree) enthalten sind inkl. dem Ordner lgv-config und doc (wenn dieser zuvor erstellt wurde)
- erzeugt zusätzlich examples.zip

### grunt copyExamples
```
# grunt copyExamples --env=internet
```
- leert den Ordner examples
- kopiert den aktuellen dist-Ordner nach examples
- kopiert notwednige Dateien aus lgv-config und die beiden Portale und nimmt Ersetzungen vor
- wird aus grunt buildExamples aufgerufen

### Alle grunt-Tasks

```
# grunt -h
```

## Aktualisieren von build-config und lgv-config

```
# bower update build-config
# bower update lgv-config
```

aktualisiert die Verzeichnisse components/lgv-config und components/build-config, wenn dort neue Commits vorhanden sind.
