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
in der normalen shell **UND** in der Admin-shell (git-shell als Admin ausführen).
```
# git config --global http.proxy <proxy-url:port>
# git config --global https.proxy <proxy-url:port>
```

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

außerdem
# setx http_proxy <proxy-url:port>
# setx https_proxy <proxy-url:port>
--> danach alle cmds schließen und neu starten, damit die Änderungen wirksam werden

```

#### npm-Pakete global als Admin installieren
Einige npm-Pakete müssen in unserem Setup global und als Admin installiert werden, damit sie auf der Kommandozeile als normaler User ausführbar sind (wie normale Programme auch). Um das vorzubereiten in der Admin-cmd

```
# npm config set prefix C:\Programme\nodejs\
```

In diesen Pfad werden durch den Admin global installierte Pakete abgelegt. [Doku zu npm-Ordnern](https://docs.npmjs.com/files/folders).


## Installation des Masterportals
Repository klonen und in das erstellte Verzeichnis wechseln:
```
# git clone https://bitbucket.org/lgv-g12/lgv.git
# cd lgv
```

**Wichtig**: in der Datei package.json bei den dev-dependencies "lgv-config"  ggf. die eigenen Config-Repos (z.B. dieses [öffentliche Repo für lgv-config](https://bitbucket.org/lgv-g12/lgv-config-public/)) inkl. credentials einbinden, z.B.

```
# https://<user>:<pw>@bitbucket.org/lgv-g12/lgv-config.git#master
```


Installiert das Repository [lgv-config](https://bitbucket.org/lgv-g12/lgv-config) mit services.json und style.json.



für alle npm-Pakete:

```
# npm update
```
