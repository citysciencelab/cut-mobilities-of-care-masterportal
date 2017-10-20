>So wird die lokale Entwicklungsumgebung eingerichtet.

[TOC]

## Systemvoraussetzungen

###git
[git](http://git-scm.com/) installieren.

### Node.js
[Node.js](http://nodejs.org) installieren. Letzte als funktionierend bekannte Version: node-v6.11.4-x64 mit NPM 3.10.10

Test in cmd:

```
# node -v
```

Mit Node.js wird auch der Node Package Manager [NPM](http://npmjs.org) installiert.

Test in cmd:

```
# npm -v
```

## Installation des Masterportals
Mit der Git-Bash (als Admin ausführen) in den Ordner navigieren, in den das Repo geklont werden soll.
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/lgv-g12/lgv.git
# cd lgv
```
**Für Teilnehmer des ITS-Hackathons:**
Den branch "its-hackathon" auschecken

```
# git fetch && git checkout its-hackathon
```


**Wichtig**: in der Datei package.json bei *repository* und den *dev-dependencies* "lgv-config" mit "lgv-config-public" ersetzen.

Dann in der Admin-cmd ausführen:
```
# npm install
```


Installiert unter anderem Ordner das Repository [build-config](https://bitbucket.org/lgv-g12/build-config)nach /node_modules, wo einige grunt-tasks enthalten sind. Außerdem das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json.

### Grunt
[Grunt](http://gruntjs.com/) in der Admin-cmd global installieren:
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

## Grunt Tasks ausführen
### grunt server
Einen lokalen Entwicklungsserver starten.

```
# grunt server
```


### grunt test
Unter Firefox funktioniert grunt server nicht, hier muss statt dessen mit "grunt test" (ohne live reload) gearbeitet werden

```
# grunt test
```

anschließend "localhost:8001" im Firefox öffnen

### grunt build
Ein Portal vor Veröffentlichung optimieren/bauen.

```
// grunt build --path=<pfad-zum-portal> --name=<Portalname> [--env=internet| default:fhhnet]
# grunt build --path=portal/master --name=master
```

- baut das Portal und alles, was es braucht in den Ordner dist/<pkg.version>
- Pfade in index.html werden automatisch ersetzt
 - Pfade zu *Conf in config.js werden automatisch ersetzt
- components/lgv-config, also Configs, die zwischen den Portalen geteilt werden, werden in den Ordner /lgv-config kopiert, an dieser Stelle wird die Config auch auf den 'echten' Servern erwartet

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

## Aktualisieren der Abhängigkeiten

für alle npm-Pakete:

```
# npm update
```

für build-config und lgv-config:

```
# npm install
```

Vorsicht: Explizites Aufrufen von npm install build-config installiert ein falsches build-config.


