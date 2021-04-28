#### Beschreibung
Dieses Modul ist eine Alternative zu der Flurstückssuche in searchbar/gaz. Hier werden die Gemarkungen
(Name und Nummer) in einem Auswahlmenü aufgelistet. Die Gemarkungen werden im lgv-config Repository
in der Datei gemarkung.json gepflegt. Für die Suche wird der/die/das? StoredQuery mit der ID
"Flurstueck" genutzt. In der Portaloberfläche befindet sich die Flurstückssuche im Menüreiter
Werkzeuge.
#### Konfiguration
    tools: {
        parcelSearch: true,
        ...
    },
    gemarkungen: https://geodienste.hamburg.de/lgv-config/gemarkung.json",
    ...
