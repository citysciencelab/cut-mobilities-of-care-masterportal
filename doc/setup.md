> In wenigen Schritten zum ersten, eigenen Portal

# Quickstart für Anwender

[TOC]

So setzen Sie in wenigen Schritten das erste Portal auf Ihrem eigenen Server auf und passen es nach Ihren Wünschen an.

## Beispiel-Anwendungen auf Ihren Server legen
1. Um ein eigenes Portal aufzusetzen, laden Sie bitte zunächst mit einem Klick auf den nachfolgenden Link die **[letzte stabile Version aus Bitbucket](https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/examples.zip)** herunter.

2. Um das Portal öffentlich zugänglich zu machen (zum Beispiel im Internet), ist es notwendig, das Portal auf einem Webserver bereitzustellen. Dazu verschieben Sie die ZIP-Datei auf Ihren Webserver (z.B. in das htdocs-Verzeichnis eines Apache-Servers) und entpacken Sie dort.

3. Der Ordner examples enthält die folgende Struktur:

    - Basic/
        -resources/
            - img/
                - ...
            - rest-services-internet.json
            - services-internet.json
            - style_v3.json
        - config.js
        - config.json
        - index.html
    - mastercode/
        - [version]/
            - css/
                - masterportal.css
            - img/
                - compass/
                    - ... (Bilder zur Darstellung des Kompass im 3D-Modus)
                - tools
                    - draw
                        - ... (svg-Dateien fürs Zeichen-Tool)
                - ajax-loader.gif
                - mapMarker.svg
            - js/
                - masterportal.js

    Im Ordner *Basic* befindet sich eine Beispiel-Anwendungen mit den portalspezifischen Konfigurationsdateien **[*config.js*](config.js.md)** und **[*config.json*](config.json.md)** und der index.html.

    Darin enthalten ist auch der Ordner *resources*, der die globalen Konfigurationsdateien **[*services.json*](services.json.md)**, **[*rest-services.json*](rest-services.json.md)** und **[*style.json*](style.json.md)** enthält sowie die benötigten Bilder (Ordner *img*) dieser Portalinstanz.

    Der Ordner *mastercode* enthält die komprimierte Javascript-Datei und die css-Dateien des Masterportals. Im Ordner *img* sind die für das Masterportal notwendigen Bilder abgelegt (Der Kompass für den 3D-Modus, das Ladebild, das MapMarker-icon sowie svg-Dateien fürs Zeichen-Tool.)


4. Wenn Sie den Ordnernamen *examples* belassen haben, können Sie die Beispielportale mit folgenden URLs über einen Browser aufrufen (anderenfalls ersetzen Sie *examples* durch den von Ihnen gewählten Ordnernamen):
    - https://[Name-des-Webservers]/examples/Basic/index.html


## Beispiel-Anwendung anpassen
So wird aus einer Beispiel-Anwendung ein individuelles Portal:

1. Gegebenenfalls können Sie die globalen Konfigurationsdateien im Ordner *resources* anpassen (z.B. Luftbilder anderer Bundesländer verfügbar machen, neue Icons hinzufügen, bestehende Icons verändern etc.)

2. Anschließend duplizieren Sie bitte den Ordner *Basic* und benennen ihn um (z.B. in *mein_portal*).

3. Sie können nun die Konfigurationsdateien config.js und config.json innerhalb des neuen Ordners *mein_portal* anpassen (z.B. die Themen im Themenbaum festlegen, die passenden Werkzeuge zur Verfügung stellen, die Hintergrundkarten anpassen, den Namen des Portals ändern ...) Hier finden Sie die Dokumentation der **[config.js](config.js.md)** und der **[config.json](config.json.md)**.

4. Ihr neues Portal können Sie nun mit folgender URL über den Browser abrufen:
    - https://[NameDesWebservers]/examples/mein_portal/index.html
