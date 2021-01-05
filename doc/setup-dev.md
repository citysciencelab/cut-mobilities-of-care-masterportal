>So wird die lokale Entwicklungsumgebung eingerichtet.

[TOC]

# Systemvoraussetzungen

## git
**[git](http://git-scm.com/)** installieren.
Der Installationspfad von Git (C:\Program Files\Git\bin\) muss in der systemweiten PATH-Umgebungsvariable stehen.

Da das git-Protokoll von Firewalls geblockt werden kann, git so konfigurieren, dass stattdessen https verwendet wird:

```
# git config --global url.https://.insteadof git://
```

Falls ein Proxy verwendet wird, müssen enstprechende Proxy-Einstellungen gesetzt werden:
in der normalen shell **UND** in der Admin-shell (git-shell als Admin ausführen).

```
# git config --global http.proxy <proxy-url:port>
# git config --global https.proxy <proxy-url:port>
```


## Node.js
**[Node.js](https://nodejs.org)** installieren. Letzte als funktionierend bekannte Version: v10.18.0 LTS mit NPM 6.13.4

Test in cmd:

```
# node -v
```

Mit Node.js wird auch der Node Package Manager **[NPM](https://npmjs.org)** installiert.

Test in cmd:

```
# npm -v
```

npm lässt sich über die Kommandozeile konfigurieren. Config-Einträge werden je in die Dateien C:\Users\<user>\.npmrc geschrieben, die man auch direkt editieren kann. Übersicht über alle npm configs:

```
# npm config list
# npm config ls -l
```


### Cache-Einstellungen
npm legt einen Paket-Cache an. Per Default liegt dieser unter C:\Users\<user>\AppData\Roaming\npm-cache. Dieser sollte geändert werden, falls ein Roaming-profil benutzt wird. Dazu die .npmrc-Dateien entsprechend anpassen oder in der cmd **UND** Admin-cmd (cmd als Admin ausführen):

```
npm config set cache D:\npm-cache
```


### Proxy-Einstellungen
Nur relevant, wenn ein Proxy verwendet wird.
In der normalen cmd **UND** in der Admin-cmd (cmd als Admin ausführen).

```
# npm config set proxy <proxy-url:port>
# npm config set https-proxy <proxy-url:port>

außerdem
# setx http_proxy <proxy-url:port>
# setx https_proxy <proxy-url:port>
# setx proxy <proxy-url:port>
--> Danach alle cmds schließen und neu starten, damit die Änderungen wirksam werden

Die Proxies müssen ebenfalls in den Systemvariablen eingetragen werden.
```


### npm-Pakete global als Admin installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config set prefix C:\Programme\nodejs\
```

In diesen Pfad werden durch den Admin global installierte Pakete abgelegt. **[Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders)**.

**ACHTUNG:** Bitte **vor** Konfiguration dieses Parameters den korrekten Systempfad ermitteln!
(Auf einem deutschsprachigen Win10 ist dies bspw. ```C:\Program Files\nodejs```)


# Installation des Masterportals
Mit der Git-Bash (als Admin ausführen) in den Ordner navigieren, in den das Repository geklont werden soll.
Repository klonen und in das erstellte Verzeichnis wechseln:

```
# git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal.git
# cd masterportal
```

Jetzt müssen die Node-Modules installiert werden:

```
# cd .. // wieder zurück ins Masterportal-Root-Verzeichnis
# npm install
```

Es werden alle Abhängigkeiten installiert.

Falls Addons genutzt werden sollen, siehe hier für weitere Informationen bezüglich **[Addons](/doc/addons_vue.md)**.


## npm start
Einen lokalen Entwicklungsserver starten.

```
# npm start
```

- Unter den folgenden URLs gibt es umfassende Demo-Konfigurationen des Masterportals
    - https://localhost:9001/portal/basic Einfaches Portal, mit übersichtlicher Konfiguration
    - https://localhost:9001/portal/master Einfacher Themenbaum
    - https://localhost:9001/portal/masterCustom Komplexer Themenbaum, mit Ordnerstruktur
    - https://localhost:9001/portal/masterDefault Default Themenbaum, alle WMS-Layer aus der services.json werden geladen


## npm run test
Unittests durchführen. Dabei werden auch die Unittests der Addons ausgeführt (siehe **[addons](../addons_vue.md)**).

```
// Alle Unit Tests
# npm run test:all

// Unit Tests Backbone-Module
# npm run test

// Unit Tests Vue-Komponenten
# npm run test:vue
```

- bündelt alle Tests
- die Unit-Tests werden in der Console ausgegeben.
- bei Änderungen am getesten Code oder den Unit-Tests selbst muss der entsprechende Befehl erneut ausgeführt werden.
- Es kann an den jeweiligen Befehl **:watch** z.B. ```npm run test:watch```angehangen werden, um die Tests bei Veränderungen automatisch neu durchlaufen zu lassen.


## npm run build
Erstellt den Code zur Veröffentlichung für alle Portale in einem Quellordner.

```
# npm run build
```

- Die Ergebnisse werden im Ordner *dist* abgelegt. Dieser wird automatisch im Masterportal-Root-Ordner angelegt. Der Quellcode wird in den Ordner **Mastercode** unter der aktuellen Version gebündelt.


## npm run buildExamples
Ein Beispielportal erzeugen.

```
# npm run buildExamples
```

- erzeugt examples.zip und examples-x.x.x.zip (Version), in denen jeweils eine lauffähige Portal-Instanz (Basic) enthalten ist inkl. einem Ordner Resources


## Aktualisieren der Abhängigkeiten
für alle npm-Pakete:

```
# npm update
```


# Debugging im Visual Studio Code einrichten

## 1.	Firefox/Chrome-Debugger als Erweiterung installieren
![Debugger for Chrome im Marketplace](https://vscode-westus.azurewebsites.net/assets/docs/nodejs/reactjs/debugger-for-chrome.png)

## 2.	In die Debugger-Sicht wechseln
 ![Debugger Sicht](https://i0.wp.com/www.mattgoldspink.co.uk/wp-content/uploads/2019/02/Screenshot-2019-02-01-at-21.03.13.png?w=640&ssl=1)

## 3.	Die Konfiguration launch.json öffnen
![Konfiguration launch.json öffnen](https://docs.microsoft.com/ja-jp/windows/images/vscode-debug-launch-configuration.png)

## 4.	Hinzufügen einer neuen Konfiguration für Firefox in die gerade geöffnete launch.json…

```javascript

    {
        "name": "Launch localhost",
        "type": "firefox",
        "request": "launch",
        "reAttach": true,
        "url": "https://localhost:9001/",
        "webRoot": "${workspaceFolder}/build",
        "pathMappings": [
            {
            "url": "webpack:///modules/core",
            "path": "${workspaceFolder}/modules/core"
            }
        ]
    },
```

…oder/und  für Chrome

```javascript

    {
        "name": "Launch Chrome",
        "type": "chrome",
        "request": "launch",
        "url": "https://localhost:9001/",
        "webRoot": "${workspaceFolder}/build",
    },
```

## 5.  Server starten
```
> npm start
```

## 6.	Debugger auswählen (1) und starten (2)
![Debugger auswählen und starten](https://i.stack.imgur.com/aJatw.png)


## 7.	Breakpoint setzen
![Breakpoint setzen](https://docs.microsoft.com/en-us/sharepoint/dev/images/vscode-debugging-breakpoint-configured.png)
