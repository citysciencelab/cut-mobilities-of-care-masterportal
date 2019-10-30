**8. Konfiguration**

8.1. Schreibe den Code so, dass sich möglichst viel konfigurieren lässt

8.2. Halte dich an die **[Vorgabe](../doc.md)** für Konfigurationsdateien

8.3 Erweitere die Dokumentation in den md-Dateien wie im folgenden beschrieben:

8.3.1 Erweitere die **[config.js.md](../config.js.md)**, wenn du neue Konfigurationsparameter erzeugt hast die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.

8.3.2 Erweitere die **[config.json.md](../config.json.md)**, wenn du neue Konfigurationsparameter für die Portaloberfläche erzeugt hast oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.

8.3.3 Es werden immer die folgenden Parameter in der Dokumentation für die Konfigurationsparameter befüllt:
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
Expert gibt es nur in der config.json.

8.3.4 Ein Parameter endet in der md Datei immer mit *** für die Darstellung einer Trennlinie.

8.3.5 Je nach Verschachtelung des Parameters wird die Überschrift ausgewählt. Auf der obersten Ebene mit # darunter mit ##.

Beispiel:
```
    # config.json
    .
    .
    .

    ## Portalconfig
```

8.3.6 Konfigurationsparamter die ein Objekt sind und selber weitere Parameter enthalten werden in einem eigenen Bereich einzeln beschrieben und verlinkt.

Beispiel:
```
    ## Portalconfig
    |Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
    |----|-------------|---|-------|------------|------|
    |controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
    ***

    ### Portalconfig.controls

```

8.3.7 Bei komplexen Konfigurationsparametern ist eine Beispielkonfiguration gefordert.

Beispiel:
```
    "osm": {
        "minChars": 3,
        "serviceId": "10",
        "limit": 60,
        "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
        "classes": "place,highway,building,shop,historic,leisure,city,county"
    }
```
8.3.8 Erweitere ebenso die Dateien **[services.json.md](../services.json.md)**, **[rest-services.json.md](../rest-services.json.md)** und **[style.json.md](../style.json.md)**, wenn du für diese globalen Konfigurationsdateien neue Parameter benötigst/verwendest.
