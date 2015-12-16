#### Beschreibung
Hier tauchen alle Funktionen auf, die sich unter dem Menüpunkt "Werkzeuge" befinden.
Die Einträge werden in einer Liste verwaltet. Jeder Eintrag hat einen Titel, ein Glyphicon
und "Aktivierungs-Attribut" (default = false). Alle Attribute sind optional und werden über
die config.js gesteuert. Die Konfiguration gibt die Reihenfolge der Tools in der Werkzeuge-Liste
im Portal wieder. Auflistung der verfügbaren Tools:

* parcelSearch (Flurstückssuche)
* gfi (GetFeatureInfo)
* coord (Koordinaten Abfrage)
* print (Drucken)
* measure (Messen)
* draw (Zeichnen)
* record (WFS-T)

#### Konfiguration

    tools: {
        parcelSearch: {
            title: "Flurstückssuche",
            glyphicon: "glyphicon-search"
        },
        gfi: {
            title: "Informationen abfragen",
            glyphicon: "glyphicon-info-sign",
            isActive: true
        },
        coord: {},
        ...
    }
