#### Beschreibung
Für Portale mit einer komplexen Baumstruktur, wie zum Beispiel der FHH-Atlas.
Die Layer werden in Hintergrundkarten und Fachdaten aufgeteilt. In Fachdaten werden alle
Layer einsortiert, die nicht in tree.baseLayer konfiguriert sind.

#### Konfiguration
FHH-Atlas

    tree: {
        type: "default",
        baseLayer: [
            {id: "453", visibility: true},
            ...
        ]
        ...
    }
Custom

    tree: {
        type: "custom",
        baseLayer: [
            {id: "452", visibility: true},
            ...
        ],
        ...
    }
