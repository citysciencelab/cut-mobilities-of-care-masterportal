**10. Dokumentation**

10.1 Erweitere die [config.js.md](../config.js.md), wenn du neue Konfigurationsparameter erzeugt hast die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.

10.2 Erweitere die [config.json.md](../config.json.md), wenn du neue Konfigurationsparameter für die Portaloberfläche erzeugt hast oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.

10.3 Es werden immer die folgenden Parameter in der Dokumentation für die Konfigurationsparameter befüllt:
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
Expert gibt es nur in der config.json.

10.4 Ein Parameter endet in der md Datei immer mit *** für die Darstellung einer Trennlinie.

10.5 Je nach Verschachtelung des Parameters wird die Überschrift ausgewählt. Auf der obersten Ebene mit # darunter mit ##.

Beispiel:
```
    # config.json
    .
    .
    .

    ## Portalconfig
```

10.6 Konfigurationsparamter die ein Objekt sind und selber weitere Parameter enthalten werden in einem eigenen Bereich einzeln beschrieben und verlinkt.

Beispiel:
```
    ## Portalconfig
    |Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
    |----|-------------|---|-------|------------|------|
    |controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
    ***

    ### Portalconfig.controls

```

10.7 Bei komplexen Konfigurationsparametern ist eine Beispielkonfiguration gefordert.

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
