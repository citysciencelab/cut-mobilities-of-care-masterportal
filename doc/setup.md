> In wenigen Schritten zum ersten, eigenen Portal

# Quickstart für Anwender

[TOC]

So setzen Sie in wenigen Schritten das erste Portal auf Ihrem eigenen Server auf und passen es nach Ihren Wünschen an.

#### Beispiel-Anwendungen auf Ihren Server legen
1. Um ein eigenes Portal aufzusetzen, laden Sie bitte zunächst mit einem Klick auf den nachfolgenden Link die [letzte stabile Version aus Bitbucket](https://bitbucket.org/lgv-g12/lgv/downloads/examples.zip) herunter.

2. Um das Portal öffentlich zugänglich zu machen (zum Beispiel im Internet), ist es notwendig, das Portal auf einem Webserver bereitzustellen. Dazu verschieben Sie die ZIP-Datei auf Ihren Webserver (z.B. in das htdocs-Verzeichnis eines Apache-Servers) und entpacken Sie dort.

3. Der Ordner examples enthält die folgende Struktur:

    - lgv-config/
        - services*.json
        - rest-services*.json
        - style.json
        - img/
    - portal/
        - Basic/
            - css/
            - js/
            - config.js
            - config.json
            - indexc.html

    Der Ordner *lgv-config* enthält die globalen Konfigurationsdateien [*services.json*](services.json.md), [*rest-services.json*](rest-services.json.md) und [*style.json*](style.json.md), sowie die benötigten Bilder(Ordner *img*).

    Im Ordner *portal* befindet sich eine Beispiel-Anwendungen (Basic) mit den portalspezifischen Konfigurationsdateien [*config.js*](config.js.md) und [*config.json*](config.json.md).

4. Wenn Sie den Ordnernamen *examples* belassen haben, können Sie die Beispielportale mit folgenden URLs über einen Browser aufrufen (anderenfalls ersetzen Sie *examples* durch den von Ihnen gewählten Ordnernamen):
    - http://[Name-des-Webservers]/examples/portal/Basic/index.html

    Hier geht es zu den Beispielportalen auf unserem Server:

    - Basic: [Portal](https://geoportal-hamburg.de/examples/portal/Basic/), [config.json](https://geoportal-hamburg.de/examples/portal/Basic/config.json), [config.js](https://geoportal-hamburg.de/examples/portal/Basic/config.js)


#### Beispiel-Anwendung anpassen
So wird aus einer Beispiel-Anwendung ein individuelles Portal:

1. Gegebenenfalls können Sie die globalen Konfigurationsdateien im Ordner *lgv-config* anpassen (z.B. Luftbilder anderer Bundesländer verfügbar machen, neue Icons hinzufügen, bestehende Icons verändern etc.)

2. Anschließend duplizieren Sie bitte den Ordner *Basic* im Verzeichnis *portal* und benennen ihn um (z.B. in *mein_portal*), sodass Sie nun zwei Ordner im Verzeichnis *portal* haben.

3. Sie können nun die Konfigurationsdateien config.js und config.json innerhalb des neuen Ordners *mein_portal* anpassen (z.B. die Themen im Themenbaum festlegen, die passenden Werkzeuge zur Verfügung stellen, die Hintergrundkarten anpassen, den Namen des Portals ändern ...) Hier finden Sie die Dokumentation der [config.js](config.js.md) und der [config.json](config.json.md).

4. Ihr neues Portal können Sie nun mit folgender URL über den Browser abrufen:
    - http://[Name des Webservers]/examples/portal/mein_portal/index.html
