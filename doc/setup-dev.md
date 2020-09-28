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

Jetzt müssen die Node-Module installiert werden:
```
# cd .. // wieder zurück ins Masterportal-Root-Verzeichnis
# npm install
```

Es werden alle Abhängigkeiten installiert.

Falls Addons genutzt werden sollen, siehe hier für weitere Informationen bezüglich **[Addons](/doc/addons_vue.md)**.

### npm start
Einen lokalen Entwicklungsserver starten.

```
# npm start
```

Unter https://localhost:9001/portal/master gibt es eine umfassende Demo-Konfiguration des Masterportals.

Um Dienste von Servern in der lokalen Entwicklungsumgebung verwenden zu können müssen diese über einen **[Proxy](/doc/proxyconf.md)** weitergeleitet werden. Auf diese Datei wird in webpack.dev.js verwiesen. Als Default ist dort die Datei "devtools/proxyconf_examples.json" angegeben. Ist eine Datei "devtools/proxyconf.json" vorhanden, wird diese genutzt. Sie wird im git-Prozess ignoriert und eignet sich daher seine eigenen Proxyserver dort zu verwalten.

### npm run test
Unittests durchführen. Dabei werden auch die Unittests der Addons ausgeführt (siehe **[addons](../addons_vue.md)**).

```
// npm run test
# npm run test
```
**Wichtig**: Falls nicht vorhanden muss der Ordner `portalconfigs/test` angelegt werden. Der Testrunner führt auch alle Tests in diesem Ordner aus.


- bündelt alle Tests
- die Unit-Tests werden in der Console ausgegeben.
- bei Änderungen am getesten Code oder den Unit-Tests selbst muss der Befehl `npm run test` erneut ausgeführt werden.


### npm run build
Erstellt den Code zur Veröffentlichung für alle Portale in einem Quellordner.

```
// npm run build
# npm run build
```

Die Ergebnisse werden im Ordner *dist* abgelegt. Dieser wird automatisch im Masterportal-Root-Ordner angelegt.


### npm run buildExamples
Ein Beispielportal erzeugen.

```
// npm run buildExamples
# npm run buildExamples
```

- erzeugt examples.zip und examples-x.x.x.zip (Version), in denen jeweils eine lauffähige Portal-Instanz (Basic) enthalten ist inkl. einem Ordner Ressources

## Aktualisieren der Abhängigkeiten

für alle npm-Pakete:

```
# npm update
```
