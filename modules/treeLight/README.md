#### Beschreibung
Für Portale mit wenigen Layern ohne komplexe Baumstruktur.
Die Layer werden nicht gruppiert, sondern einfach nur aufgelistet.
Es wird nicht zwischen Baselayern und Overlayern unterschieden.
Die Layer werden in umgekehrter Reihenfolge im Portal dargestellt.
#### Konfiguration
    tree: {
        type: "light",
        layer:
        [
            {id: "453", visibility: true},
            {id: "452", visibility: false},
            {id: "1748", visibility: false},
            ...
        ]
    }
