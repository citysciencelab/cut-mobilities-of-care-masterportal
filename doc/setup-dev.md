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

**Known Issue**: Auf Windows 10 wurde mit genannter node-Version *PATH* nicht erweitert. Dies hat zur Folge, dass *grunt server* die Fehlermeldung *command not found* in der Konsole ausgab. 
* *Path* muss um *%USERPROFILE%\AppData\Roaming\npm* ergänzt sein
* *grunt.cmd* befindet sich unter *%USERPROFILE%\AppData\Roaming\npm*

# Installation des Masterportals
Mit der Git-Bash (als Admin ausführen) in den Ordner navigieren, in den das Repo geklont werden soll.
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/lgv-g12/lgv.git
# cd lgv
```

**Wichtig**: in der Datei package.json bei *repository* und den *dev-dependencies* "lgv-config" mit "lgv-config-public" ersetzen.

Dann in der Admin-cmd ausführen:
```
# npm run installMasterportal
```


Installiert unter anderem Ordner das Repository [build-config](https://bitbucket.org/lgv-g12/build-config)nach /node_modules, wo einige grunt-tasks enthalten sind. Außerdem das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json. Außerdem wird das Zusatzpackage browserMqtt.js als Erweiterung für MQTT.js installiert, das zur Live-Aktualisierung des SensorLayers notwendig ist.

## Grunt
[Grunt](http://gruntjs.com/) in der Admin-cmd global installieren:
```
# npm install -g grunt-cli
```

Test in normaler cmd:
```
# grunt
```

## Grunt Tasks ausführen
### grunt less
Bootstrap- und Masterportal-CSS Regeln werden in LESS erstellt und in CSS konvertiert. Die CSS-Dateien werden in der style.css ins Portal eingebunden.
```
@import "bootstrap.css";
@import "modules.css";
```
Sie liegen jedoch nicht im Repository und müssen nach einem clone noch erstellt werden.

*Einmalig nach clone* muss eine *bootstrap.css* Datei kompiliert werden. Dies geschieht mittels des nachfolgenden grunt-Tasks für LESS.
Die *modules.css* muss *nicht manuell* erzeugt werden. Diese wird über *grunt server* und fortlaufend über einen *watch-Task* automatisch generiert.

Nachfolgend die Aufrufe zur Erstellung der CSS aus LESS:

####bootstrap.css
Die eingebundene CSS unterscheidet sich hinsichtlich des Icon-Pfads zwischen Development- und Produktionsumgebung. 
```
# grunt less:bootstrapDev
```
wird die *css/bootstrap.css* anhand der *css/bootstrap.less* mit Masterportal-Variablen neu erstellt. Als icon-font-path wird "../node_modules/bootstrap/fonts/" gesetzt. *grunt server* beinhaltet *grunt less:bootstrapDev*.

Mit 
```
# grunt less:bootstrapBuild
```
wird die *css/bootstrap.css* anhand der *css/bootstrap.less* mit Masterportal-Variablen neu erstellt. Als icon-font-path wird ""../fonts/"" gesetzt. *grunt build* beinhaltet *grunt less:bootstrapBuild*.

####modules.css
Mit 
```
# grunt less:modules
```
wird die *css/modules.css* aus allen *.less Dateien* unter */modules/* erstellt.


### grunt server
Einen lokalen Entwicklungsserver starten.

```
# grunt server
```

Unter https://localhost:9001/portal/master gibt es eine umfassende Demo-Konfiguration des Masterportals.

Um Dienste von Servern in der lokalen Entwicklungsumgebung verwenden zu können müssen diese über einen Proxy weitergeleitet werden. Auf diese Datei wird im build-config/tasks/connect.js verwiesen. Als Default ist dort dort der lgv-config Ordner angegeben. Bei Verwendung eines eigenen Ordners mit anderer Bezeichnung für die Dienste-json-Dateien müsste der Pfad im connect.js entsprechend angepasst werden. Beispiele für die Weiterleitung sind in der proxy-conf.json des lgv-config-public Repositories zu finden. 

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
# grunt buildExamples
```
- erzeugt einen Ordner examples, in dem zwei lauffähige Portal-Instanzen (zurzeit master und masterTree) enthalten sind inkl. dem Ordner lgv-config und doc (wenn dieser zuvor erstellt wurde)
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
# npm run installMasterportal
```

Vorsicht: Explizites Aufrufen von npm install build-config installiert ein falsches build-config.

