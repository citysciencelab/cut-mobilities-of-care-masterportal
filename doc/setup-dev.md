>So wird die lokale Entwicklungsumgebung eingerichtet.

[TOC]

# Systemvoraussetzungen

## git
**[git](http://git-scm.com/)** installieren.

## Node.js
**[Node.js](http://nodejs.org)** installieren. Letzte als funktionierend bekannte Version: 10.15.3 LTS mit NPM 6.4.1

Test in cmd:

```
# node -v
```

Mit Node.js wird auch der Node Package Manager **[NPM](http://npmjs.org)** installiert.

Test in cmd:

```
# npm -v
```


# Installation des Masterportals
Mit der Git-Bash (als Admin ausführen) in den Ordner navigieren, in den das Repo geklont werden soll.
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal.git
# cd lgv
```


Dann in der Admin-cmd ausführen:
```
# npm install
```

Es werden alle Abhängigkeiten installiert.


### npm start
Einen lokalen Entwicklungsserver starten.

```
# npm start
```

Unter https://localhost:9001/portal/master gibt es eine umfassende Demo-Konfiguration des Masterportals.

Um Dienste von Servern in der lokalen Entwicklungsumgebung verwenden zu können müssen diese über einen **[Proxy](/proxyconf.md)** weitergeleitet werden. Auf diese Datei wird in webpack.dev.js verwiesen. Als Default ist dort die Datei "devtools/proxyconf_examples.json" angegeben. Ist eine Datei "devtools/proxyconf.json" vorhanden, wird diese genutzt. Sie wird im git-Prozess ignoriert und eignet sich daher seine eigenen Proxyserver dort zu verwalten.


### npm start mit customModule
Sofern ein eigenes Skript mit Abhängigkeiten zum Masterportal in die Entwicklungsumgebung eingebunden werden soll, so besteht in der Konsole über Eingabe eines weiteren Parameters die Möglichkeit hierzu. _CUSTOMMODULE_ wird als relativer Pfad zum JavaScript ausgehend von der _js/main.js_ angegeben.

```
# npm start -- --CUSTOMMODULE "../portalconfigs/verkehrsportal/custom"
```

Der genutzte Mechanismus wird über **[webpackMode: eager](https://webpack.js.org/api/module-methods)** gesteuert, indem zur Kompilierzeit der Pfad im übergebenen Parameter importiert wird.


### npm run test
Unittests durchführen

```
// npm run test
# npm run test
```
**Wichtig**: Falls nicht vorhanden muss der Ordner `portalconfigs/test` angelegt werden. Der Testrunner führt auch alle Tests in diesem Ordner aus.


- bündelt alle Tests
- die Unit-Tests werden in der Console ausgegeben.
- bei Änderungen am getesten Code oder den Unit-Tests selbst muss der Befehl `npm run test` erneut ausgeführt werden.


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


### npm run buildExamples
Ein Beispielportal erzeugen.

```
// npm run buildExamples
# npm run buildExamples
```

- erzeugt examples.zip und examples-x.x.x.zip (Version), in denen jeweils eine lauffähige Portal-Instanz (Basic) enthalten ist inkl. einem Ordner Ressources


### npm run buildPortalsFromPortalconfigs
Mit diesem Kommando lassen sich mehrere Portale auf einemal bauen. Die Konfigurationen der Portale müssen in einem Ordner "portalconfigs" abgelegt werden. In portalconfigs kann eine Datei conf-buildPortalconfigs.js abgelegt werden zur Angabe von Portalen die nicht gebaut werden sollen oder ein Custommoudl enthalten

```
// npm run buildPortalsFromPortalconfigs
# npm run buildPortalsFromPortalconfigs
```

|Name|Typ|Beschreibung|
|----|---|------------|
|modulesBlackList|String[]|Portale die nicht gebaut werden sollen.|
|customModules|Object|Portale die mit einem Custommodul gebaut werdne sollen.|
|portalname|Object|Name des Portals.|
|initFile|String|Pfad zu dem Custommodul.|
|ignoreList|String[]|Dateien die nicht im gebauten Portal enthalten sein sollen.|


**Beispiel**
```
#!json
const
    conf = {
        modulesBlackList: [
            "artenkataster",
            "badegewaesser"
        ],

        // relative paths to custom modules entry js files
        // although custom modules creation script does not expect the .js suffix, it is redundantly added
        // for the sake of readability
        customModules: {
            "portalname": {
                "initFile": "../portalconfigs/boris/bodenrichtwertabfrage/view.js",
                "ignoreList": ["bodenrichtwertabfrage"]
            }
        }
    };
```
***

- Die Portale werden in den Ordner dist/ gebaut
- Portale ohne Custommodul verweisen auf eine zentral gebaute Instanz des Masterportals im Ordner Mastercode, unter der gebauten Version
- Portale mit Custommodul werden separat gebaut und erhalten eine eigene Instanz des Masterportals, mit dem angegebenen Custommodul
- Pfade in index.html werden automatisch ersetzt


## Aktualisieren der Abhängigkeiten

für alle npm-Pakete:

```
# npm update
```
