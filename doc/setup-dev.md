>So wird die lokale Entwicklungsumgebung eingerichtet.

[TOC]

# Systemvoraussetzungen

##git
[git](http://git-scm.com/) installieren.

## Node.js
[Node.js](http://nodejs.org) installieren. Letzte als funktionierend bekannte Version: node-v8.11.2-x64 mit NPM 5.6.0

Test in cmd:

```
# node -v
```

Mit Node.js wird auch der Node Package Manager [NPM](http://npmjs.org) installiert.

Test in cmd:

```
# npm -v
```


# Installation des Masterportals
Mit der Git-Bash (als Admin ausführen) in den Ordner navigieren, in den das Repo geklont werden soll.
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/lgv-g12/lgv.git
# cd lgv
```

**Wichtig**: in der Datei package.json bei den *dev-dependencies* "lgv-config" mit "lgv-config-public" ersetzen.

Dann in der Admin-cmd ausführen:
```
# npm install
```


Installiert das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json.


### npm start
Einen lokalen Entwicklungsserver starten.

```
# npm start
```

Unter https://localhost:9001/portal/master gibt es eine umfassende Demo-Konfiguration des Masterportals.

Um Dienste von Servern in der lokalen Entwicklungsumgebung verwenden zu können müssen diese über einen Proxy weitergeleitet werden. Auf diese Datei wird in webpack.dev.js verwiesen. Als Default ist dort dort der lgv-config Ordner angegeben. Bei Verwendung eines eigenen Ordners mit anderer Bezeichnung für die Dienste-json-Dateien müsste der Pfad entsprechend angepasst werden. Beispiele für die Weiterleitung sind in der proxyconf.json des lgv-config-public Repositories zu finden.


### npm start mit customModule
Sofern ein eigenes Skript mit Abhängigkeiten zum Masterportal in die Entwicklungsumgebung eingebunden werden soll, so besteht in der Konsole über Eingabe eines weiteren Parameters die Möglichkeit hierzu. _CUSTOMMODULE_ wird als relativer Pfad zum JavaScript ausgehend von der _js/main.js_ angegeben.

```
# npm start -- --CUSTOMMODULE "../portalconfigs/verkehrsportal/custom"
```

Der genutzte Mechanismus wird über [webpackMode: eager](https://webpack.js.org/api/module-methods) gesteuert, indem zur Kompilierzeit der Pfad im übergebenen Parameter importiert wird.


### npm test
Unittests durchführen

```
// npm test
# npm test
```

- bündelt alle Tests
- Unter http://localhost:9009/test/unittests/TestRunner.html werden alle Tests durchgeführt
- bei Änderungen am getesten Code oder den Tests selbst wird die Seite erneut geladen und die Tests werden durchgeführt.


### npm run build
Ein Portal vor Veröffentlichung optimieren/bauen.

```
// npm run build
# npm run build
```

- baut das Portal und alles, was es braucht in den Ordner dist/
 - Sucht im angegebenen Ordner nach einem customModule mit angegebenem Namen und importiert dieses Skript in den current chunk.
- Pfade in index.html werden automatisch ersetzt
 - Pfade zu Conf in config.js werden automatisch ersetzt


## Aktualisieren der Abhängigkeiten

für alle npm-Pakete:

```
# npm update
```
