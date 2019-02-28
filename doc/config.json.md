>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

***

# config.json
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv/src/stable/portal/master/config.json).
Die config.json besteht aus der [Portalconfig](#markdown-header-Portalconfig) und der [Themenconfig](#markdown-header-Themenconfig)
```
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

***

## Portalconfig
In der *Portalconfig* kann die Oberfläche des Portals konfiguriert werden:
1.  der Titel mit Logo, falls erforderlich
2.  welche/r Suchdienst/e angesprochen werden soll/en
3.  welche Themenbaumart genutzt werden soll (einfach/light oder mit Unterordnern/custom)
4.  welche Werkzeuge an welcher Stelle geladen werden sollen
5.  welche Interaktionen mit der Karte möglich sein sollen (zoomen, Menüzeile ein/ausblenden, Standortbestimmung des Nutzers, Vollbildmodus, etc.)
6.  welche Layer genutzt werden und ggf. in welchen Ordnern, sie in der Themenauswahl erscheinen sollen.

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Baumtyp|ja|enum["light", "default", "custom"]||Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|
|controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|
|LogoLink|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalitle).|
|LogoToolTip|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalitle).|
|mapView|nein|[mapView](#markdown-header-portalconfigmapview)||Mit verschiedenen  Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|
|menu|nein|[menu](#markdown-header-portalconfigmenu)||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge, in der config.json (siehe [Tools](#markdown-header-portalconfigmenutools)).|
|PortalLogo|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportaltitle).|
|PortalTitle|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportaltitle).|
|portalTitle|nein|[portalTitle](#markdown-header-portalconfigportaltitle)||Der Titel und weitere Parameter die  in der Menüleiste angezeigt werden können.|
|scaleLine|nein|Boolean||Ist die Maßstabsleiste = true , dann wird sie unten rechts dargestellt, sofern kein footer vorhanden ist! Ist ein footer vorhanden, wird die Maßstabsleiste unten links angezeigt.|
|searchbar|nein|[searchbar](#markdown-header-portalconfigsearchbar)||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|

***

### Portalconfig.searchbar
Konfiguration der Searchbar

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|bkg|nein|[bkg](#markdown-header-portalconfigsearchbarbkg)||Konfiguration des BKG Suchdienstes.|
|gazetteer|nein|[gazetteer](#markdown-header-portalconfigsearchbargazetteer)||Konfiguration des Gazetteer Suchdienstes.|
|gdi|nein|[gdi](#markdown-header-portalconfigsearchbargdi)|Konfiguration des GDI (elastic) Suchdienstes.|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|placeholder|nein|String|"Suche"|Placeholder für das Freitextfeld.|
|recommendedListlenth|nein|Integer|5|Anzahl der Einträge in der Vorschlagsliste.|
|quickHelp|nein|Boolean|false|Gibt an ob eine Schnellhilfe angeboten wird.|
|specialWFS|nein|[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)||Konfiguration des specialWFS Suchdienstes.|
|tree|nein|[tree](#markdown-header-portalconfigsearchbartree)||Konfiguration der Suche im Themenbaum.|
|visibleWFS|nein|[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)||Konfiguration der Suche über die sichtbaren WFS Layer.|
|visibleVector|nein|[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)||Konfiguration der Suche über die sichtbaren WFS Layer.|
|zoomLevel|nein|Integer||ZoomLevel, auf das die Searchbar maximal hineinzoomt.|
|renderToDOM|nein|String||HTML-Id an diese sich die Searchbar rendert. Bei "#searchbarInMap" zeichnet sich die Searchbar auf der Karte. Wird verwendet in MeldeMichel.|

***

#### Portalconfig.searchbar.bkg

[type:Extent]: # (Datatypes.Extent)

Konfiguration des BKG Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|epsg|nein|String|"EPSG:25832"|EPSG-Code des zu verwendenden Koordinatensystems.|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmuss suchen soll.|
|filter|nein|String|"filter=(typ:*)"|Filter string der an die BKG-Schnittstelle geschickt wird.|
|geosearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|score|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|
|suggestCount|nein|Integer|20|Anzahl der Vorschläge.|
|suggestServiceId|ja|String||Id des Vorschlagsdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|

**Beispiel**
```
#!json
"bkg": {
    "minChars": 3,
    "suggestServiceId": "4",
    "geosearchServiceId": "5",
    "extent": [454591, 5809000, 700000, 6075769],
    "suggestCount": 10,
    "epsg": "EPSG:25832",
    "filter": "filter=(typ:*)",
    "score": 0.6
}
```

***

#### Portalconfig.searchBar.osm ####
Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer; wird durch Klick auf die Lupe oder Enter ausgelöst

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|
|serviceID|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor.|
|limit|nein|Number|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|
|states|nein|string|kann die Namen der Bundesländer (entsprechend der Ausgabe für "address.state" der Treffer), für die Ergebnisse erzielt werden sollen, enthalten; Trenner beliebig|
|classes|nein|string|kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten|

**Beispiel**

```
#!json

"osm": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg Nordhrein-Westfalen Niedersachsen"
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

***

#### Portalconfig.searchbar.gazetteer
Konfiguration des Gazetteer Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|searchDistricts|nein|Boolean|false|Gibt an ob nach Bezirken gesucht werden soll.|
|searchHouseNumbers|nein|Boolean|false|Gibt an ob nach Straßen und Hausnummern gesucht werden soll. Bedingt **searchStreets**=true.|
|searchParcels|nein|Boolean|false|Gibt an ob nach Flurstücken gesucht werden soll.|
|searchStreetKey|nein|Boolean|false|Gibt an ob nach Straßenschlüsseln gesucht werden soll.|
|searchStreet|nein|Boolean|false|Gibt an ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|

**Beispiel**
```
#!json
"gazetteer": {
    "minChars": 3,
    "serviceId": "6",
    "searchStreets": true,
    "searchHouseNumbers": true,
    "searchDistricts": true,
    "searchParcels": true,
    "searchStreetKey": true
}
```

***

#### Portalconfig.searchbar.gdi
Konfiguration des GDI Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|

**Beispiel**
```
#!json
"gdi": {
    "minChars": 3,
    "serviceId": "elastic"
}
```

***


#### Portalconfig.searchbar.specialWFS
Konfiguration der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|glyphicon|nein|String|"glyhicon-home"|Default glyphicon das in der Vorschlagsliste erscheint. Kann in der [definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition) überschrieben werden.|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der [definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition) überschrieben werden.|
|timeout|nein|Integer|6000|Timeout in ms für die Dienste Anfrage.|
|definitions|nein|[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)[]||Definition der speziellen WFS suchen|

**Beispiel**
```
#!json
"specialWFS": {
    "minChars": 5,
    "timeout": 10000,
    "definitions": [
        {
            "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren"
        }
    ]
}
```

***

#### Portalconfig.searchbar.specialWFS.definition
Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|url|nein|String||URL des WFS.|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|
|glyphicon|nein|String|"glyhicon-home"|CSS Klasse des Glyphicons das in der Vorschlagsliste erscheint.|
|typeName|nein|String||TypeName des WFS layers.|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|
|data|nein|String||@deprecated in 3.0.0 Filterparameter für den WFS request.|

**Beispiel**
```
#!json
{
    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

#### Portalconfig.searchbar.tree
Konfiguration der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|

**Beispiel**
```
#!json
"tree": {
    "minChars": 5
}
```

***

#### Portalconfig.searchbar.visibleWFS
Konfiguration der Suche über die sichtbaren WFS. @deprecated in 3.0.0. Verwenden Sie [visibleVector](#markdown-header-portalconfigsearchbarvisiblevector).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|

**Beispiel**
```
#!json
"visibleWFS": {
    "minChars": 3
}
```

***

#### Portalconfig.searchbar.visibleVector
Konfiguration der Suche über die sichtbaren WFS

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|
|layerTypes|nein|String[]|["WFS"]|Vector Typen die verwendet werden sollen.|

**Beispiel**
```
#!json
"visibleVector": {
    "minChars": 3,
    "layerTypes": ["WFS", "GeoJSON"]
}
```

***

### Portalconfig.controls

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attributions|nein|[attributions](#markdown-header-portalconfigcontrolsattributions)|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|
|mousePosition|nein|Boolean|false|Die Koordinaten des Mauszeigers werden angeziegt.|
|orientation|nein|[orientation](#markdown-header-portalconfigcontrolsorientation)||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|
|overviewmap|nein|[overviewmap](#markdown-header-portalconfigcontrolsoverviewmap)|false|Übersichtskarte|
|totalview|nein|Boolean|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|
|orientation3d|nein|Boolean|false|Legt fest, ob im 3D Modus eine Navigationsrose angezeigt werden soll.|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|

***

#### Portalconfig.controls.attributions

Das Attribut attributions kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob vorhandene Attributions angezeigt werden sollen oder nicht. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|

**Beispiel als Boolean**
```
#!json
"attributions": true
```

**Beispiel als Object**
```
#!json
"attributions": {
    "isInitOpenDesktop": true,
    "isInitOpenMobile": false,
}
```

***

#### Portalconfig.controls.orientation

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|zoomMode|nein|enum["none", "once", "always"]|"once"|*none* (Die Standortbestimmung ist deaktiviert.), *once* (Es wird einmalig beim Laden der Standort bestimmt und einmalig auf den Standort gezoomt.), *always* (Die Karte bleibt immer auf den Nutzerstandort gezoomt.)|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte  verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|

**Beispiel mit poiDistances vom Typ Boolean**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": true
}
```

**Beispiel mit poiDistances vom Typ Integer[]**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

#### Portalconfig.controls.overviewmap

Das Attribut overviewmap kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean, zeigt es die Overviewmap mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||Legt die Resolution fest, die in der Overviewmap verwendet werden soll.|
|baselayer|nein|String||Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|

**Beispiel overviewmap als Object:**
```
#!json
"overviewmap": {
    "resolution": 305.7487246381551,
    "baselayer": "452"
}
```

**Beispiel overviewmap als Boolean:**
```
#!json
"overviewmap": true
```

***

### Portalconfig.portalTitle
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|nein|String|"Master"|Name des Portals.|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|
|link|nein|String|"http://geoinfo.hamburg.de"|URL der externen Seite, auf die verlinkt wird.|
|tooltip|nein|String|"Landesbetrieb Geoinformation und Vermessung"|Tooltip beim Hovern über dem Portaltitel angezeigt wird.|

**Beispiel portalTitle:**
```
#!json
"portalTitle": {
    "title": "Master",
    "logo": "../../img/hh-logo.png",
    "link": "http://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```

***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)

[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|backgroundImage|nein|String||Pfad zum alternativen Hintergrund angeben.|
|startCenter|nein|[Coordinate](#markdown-header-datatypescoordinate)|[565874, 5934140]|Die initiale Zentrumskoordinate.|
|options|nein|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|
|zoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|

**Beispiel:**
```
#!json
"mapView": {
    "backgroundImage": "/lgv-config/img/backgroundCanvas.jpeg",
    "startCenter": [561210, 5932600],
    "options": [
        {
            "resolution": 611.4974492763076,
            "scale": 2311167,
            "zoomLevel": 0
        },
        {
            "resolution": 305.7487246381551,
            "scale": 1155583,
            "zoomLevel": 1
        },
        {
            "resolution": 152.87436231907702,
            "scale": 577791,
            "zoomLevel": 2
        },
        {
            "resolution": 76.43718115953851,
            "scale": 288896,
            "zoomLevel": 3
        },
        {
            "resolution": 38.21859057976939,
            "scale": 144448,
            "zoomLevel": 4
        },
        {
            "resolution": 19.109295289884642,
            "scale": 72223,
            "zoomLevel": 5
        },
        {
            "resolution": 9.554647644942321,
            "scale": 36112,
            "zoomLevel": 6
        },
        {
            "resolution": 4.7773238224711605,
            "scale": 18056,
            "zoomLevel": 7
        },
        {
            "resolution": 2.3886619112355802,
            "scale": 9028,
            "zoomLevel": 8
        },
        {
            "resolution": 1.1943309556178034,
            "scale": 4514,
            "zoomLevel": 9
        },
        {
            "resolution": 0.5971654778089017,
            "scale": 2257,
            "zoomLevel": 10
        }
    ],
    "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
    "resolution": 15.874991427504629,
    "zoomLevel": 1,
    "epsg": "EPSG:25832"
    }
```

***

#### Portalconfig.mapView.option

Eine option definiert eine Zoomstufe. Diese muss defineirt werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das zoomLevel ist, desto kleiner ist die scale. und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|

**Beispiel einer mapview Option**
```
#!json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

### Portalconfig.menu
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|info|nein|[info](#markdown-header-portalconfigmenuinfo)||Ordner im Menü, der [tools](#markdown-header-portalconfigmenutools) oder [staticlinks](#markdown-header-portalconfigmenustaticlinks) darstellt.|
|tools|nein|[tools](#markdown-header-portalconfigmenutools)||Ordner im Menü, der Werkzeuge darstellt.|
|tree|nein|[tree](#markdown-header-portalconfigmenutree)||Darstellung udn Position des Themenbaums.|

***

### Portalconfig.menu.info

[inherits]: # (Portalconfig.menu.folder)

Informations-Ordner in dem Werkzeuge oder staticlinks eingetragen werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|children|nein|[children](#markdown-header-portalconfigmenuinfochildren)||Konfiguration der Kindelemente des Informations Ordners.|

***

### Portalconfig.menu.info.children

[type:tools]: # (Portalconfig.menu.tools)

[type:staticlinks]: # (Portalconfig.menu.staticlinks)

Liste der Werkzeuge oder Staticlinks die im Info-Ordner erscheinen sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|children|nein|[tools](#markdown-header-portalconfigmenutoolschildren)/[staticlinks](#markdown-header-portalconfigmenustaticlinks)||Konfiguration der Kindelemente des Informations Ordners.|

***

#### Portalconfig.menu.tree
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des Themenbaumes.|
|glyphicon|nein|String||CSS Klasse des glyphicons.|
|isInitOpen|nein|Boolean|false|Gibt an ob der Themenbaum initial geöffnet ist.|

***

#### Portalconfig.menu.folder

[type:tool]: # (Portalconfig.menu.tool)

[type:staticlinks]: # (Portalconfig.menu.staticlinks)

Ein Ordner-Object wird dadurch definiert, dass es neben "name" und "glyphicon" noch das attribut "children" besitzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des Ordners im Menu.|
|glyphicon|ja|String|"glyphicon-folder-open"|CSS Klasse des Glyphicons, das vor dem Ordnernamen im Menu angezeigt wird.|
|children|nein|[tool](#markdown-header-portalconfigmenutool)/[staticlinks](#markdown-header-portalconfigmenustaticlinks)||Kindelemente dieses Ordners.|

**Beispiel eines folders**
```
#!json
"tools":{
    "name": "Werkzeuge",
    "glyphicon": "glyphicon-wrench",
    "children": {
        {
            "name": "Legende",
            "glyphicon": "glyphicon-book"
        }
    }
}
```

***

#### Portalconfig.menu.tools

[inherits]: # (Portalconfig.menu.folder)

[type:tool]: # (Portalconfig.menu.tool)

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|children|nein|[children](#markdown-header-portalconfigmenutoolschildren)||Konfiguration der Werkzeuge.|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)

[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)

[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)

[type:print]: # (Portalconfig.menu.tool.print)

[type:routing]: # (Portalconfig.menu.tool.routing)

[type:featureLister]: # (Portalconfig.menu.tool.featureLister)

[type:lines]: # (Portalconfig.menu.tool.lines)

[type:animation]: # (Portalconfig.menu.tool.animation)

[type:layerslider]: # (Portalconfig.menu.tool.layerslider)

[type:contact]: # (Portalconfig.menu.tool.contact)

[type:schulwegrouting]: # (Portalconfig.menu.tool.schulwegrouting)

[type:filter]: # (Portalconfig.menu.tool.filter)

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von [tool](#markdown-header-portalconfigmenutool) und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|einwohnerabfrage|nein|[tool](#markdown-header-portalconfigmenutool)||Hamburg spezifisches Werkzeug um die Einwohner in der FHH (Freie und Hansestadt Hamburg) und der MRH (Metropol Region Hamburg) über eine zu zeichnende Geometrie abfragen zu können.|
|compareFeatures|nein|[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)|| Vergleichsmöglichkeit von Vector-Features.|
|parcelSearch|nein|[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)||Flurstückssuche.|
|measure|nein|[tool](#markdown-header-portalconfigmenutool)||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km bzw m²/km² gewechselt werden.|
|coord|nein|[tool](#markdown-header-portalconfigmenutool)||Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in dei Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|
|gfi|nein|[tool](#markdown-header-portalconfigmenutool)||GetFeatureInfo(gfi). Werkzeug um Informationen abzufragen. Dabei wird entweder ein WMS-Request gestellt oder die Vectordaten im Browser abgefragt. Anschließend werden die Attribute der gefundenen Features dargestellt.|
|print|nein|[print](#markdown-header-portalconfigmenutoolprint)||Druckmodul mit dem die Karte als PDF exportiert werden kann.|
|searchByCoord|nein|[tool](#markdown-header-portalconfigmenutool)||Koordinatensuche. Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf.|
|kmlimport|nein|[tool](#markdown-header-portalconfigmenutool)||Import von KML Dateien. Über dieses Werkzeug können KML Dateien importiert werden.|
|wfsFeatureFilter|nein|[tool](#markdown-header-portalconfigmenutool)||Filtern von WFS Features. Über dieses Werkzeug können WFS features gefiltert werden. Dies setzt jedoch eine Konfiguration der "filterOptions" am WFS-Layer-Objekt vorraus.|
|extendedFilter|nein|[tool](#markdown-header-portalconfigmenutool)||Dynamisches Filtern von WFS Features. Über dieses Werkzeug können WFS features dynamisch gefiltert werden. Dies setzt jedoch eine Konfiguration der "extendedFilter" am WFS-Layer-Objekt vorraus.|
|routing|nein|[routing](#markdown-header-portalconfigmenutoolrouting)||Routing. Über dieses Werkzeug können Routen berechnet werden.|
|draw|nein|[tool](#markdown-header-portalconfigmenutool)||Zeichnen. Mithilfe dieses Werkzeuges können Punkte, Linien, Polygone, Kreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Das Gezeichnete kann auch als KML exportiert werden.|
|styleWMS|nein|[tool](#markdown-header-portalconfigmenutool)||Klassifizierung vom WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Requuest wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.|
|featureLister|nein|[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)||Listet alle Features eines Vektor Layers auf.|
|lines|nein|[lines](#markdown-header-portalconfigmenutoollines)||Pendlerdarstellung als linenhafte Objekte.|
|animation|nein|[animation](#markdown-header-portalconfigmenutoolanimation)||Pendleranimation als punkthafte Objekte.|
|saveSelection|nein|[tool](#markdown-header-portalconfigmenutool)||Werkzeug zum Zustand Speichern. Mithilfe dieses Werkzeuges kann der Kartenzustand als URL zum Abspeichern erzeugt werden. Dabei werden die Layer in deren Reihenfolge, Transparenz und Sichtbarkeit dargestellt. Zusätzlich wird auch noch die Zentrumskoordinate mit abgespeichert.|
|layerslider|nein|[layerslider](#markdown-header-portalconfigmenutoollayerslider)||Werkzeug zum Abspielen einer Reihendfolge von Layers.|
|legend|nein|[tool](#markdown-header-portalconfigmenutool)||Legende. Stellt die Legende aller sichtbaren Layer dar.|
|contact|nein|[contact](#markdown-header-portalconfigmenutoolcontact)||Kontaktformular. Stellt dem User eine Möglichkeit zur Verfügung, mit dem einem Konfigurierten Postfach in Verbindung zu treten um Fehler zu melden oder Wünsche und Anregungen zu äußern.|
|schulwegrouting|nein|[schulwegrouting](#markdown-header-portalconfigmenutoolschulwegrouting)||Schulwegrouting.|
|filter|nein|[filter](#markdown-header-portalconfigmenutoolfilter)||Neues Filtermodul.|

***

#### Portalconfig.menu.tool
Über den Attribut-key des Werkzeuges wird definiert, welches Werkzeug mit welchen Eigenschaften geladen wird. Jedes Tool besitzt mindestens die unten aufgeführten Attribute. Welche Tools konfigurierbar sind, finden Sie unter [tools](#markdown-header-portalconfigmenutools).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des Werkzeuges im Menu.|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|
|onlyDesktop|nein|Boolean|false|Flag ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|

**Beispiel eines Tools**
```
#!json
"legend":{
    "name": "Legende",
    "glyphicon": "glyphicon-book"
}
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

Der Filter bietet eine vielzahl von Möglichkeiten um Vektor-Daten filtern zu können.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isGeneric|nein|Boolean|false|Zeigt an ob sich der Filter dynamisch erzeugen lässt. Ist momentan noch nicht umgesetzt.|
|minScale|nein|Integer||Minimale Zoomstufe auf die der Filter bei der Darstellung der Ergebnisse heranzoomt.|
|liveZoomToFeatures|nein|Boolean|false|Gibt an ob der Filter sofort nach der Filterung auf die Filterergebnisse zoomt.|
|predefinedQueries|nein|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Definition der Filterabfragen.|

**Beispiel**
```
#!json
"filter":{
    "name": "Filter",
    "glyphicon": "glyphicon-filter",
    "deactivateGFI": false,
    "isGeneric": false,
    "isInitOpen": false,
    "allowMultipleQueriesPerLayer": false,
    "predefinedQueries": [
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Grundschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Grundschulen", "Langformschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Stadtteilschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Stadtteilschulen", "Langformschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Gymnasien",
            "info": "Sie finden berufliche Gymnasien ab der Klassenstufe 11 bei den Beruflichen Schulen.",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Gymnasien"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
        },
        {
            "layerId": "8712",
            "isActive": false,
            "isSelected": false,
            "name": "Sonderschulen",
            "predefinedRules": [
                {
                    "attrName": "kapitelbezeichnung",
                    "values": ["Sonderschulen"]
                }
            ],
            "attributeWhiteList": ["bezirk", "stadtteil", "ganztagsform", "foerderart", "abschluss"]
        },
        {
        "layerId": "1711",
        "isActive": true,
        "isSelected": true,
        "name": "Krankenhäuser",
        "predefinedRules": [],
        "attributeWhiteList": ["teilnahme_geburtsklinik", "teilnahme_notversorgung"]
        }
    ]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery
Objekt, das eine Filtereinstelung definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||Id des Layers. Muss auch in der Themenconfig konfiguriert sein.|
|isActive|nein|Boolean|false|Gibt an ob diese Filtereinstellung initial durchgeführt werden soll.|
|isSelected|nein|Boolean|false|Gibt an ob diese Filtereinstellung initial angezeigt werden soll.|
|searchInMapExtent|nein|Boolean|false|Gibt an ob nur die Features im Kartenauschnitt gefiltert werden sollen.|
|info|nein|String||Kurzer Info text der über der Filtereinstellung erscheint.|
|predefinedRules|nein|[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)[]||Filterregel die die Daten vorfiltert.|
|attributeWhiteList|nein|String[]/[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)[]||Whitelist an Attributen die verwendet werden sollen.|
|snippetType|nein|String||Datentyp des Attributes. Wenn nciht angegeben wird der Datentyp automatisch ermittelt. Er kann in Ausnahmefällen auch manuell überschrieben werden. Beispielsweise mit "checkbox-classic". Dies wird benötigt im Projekt DIPAS auf der Touchtabl-Variante des Portals.|

**Beispiel**
```
#!json
{
    "layerId": "8712",
    "isActive": false,
    "isSelected": false,
    "name": "Grundschulen",
    "predefinedRules": [
        {
            "attrName": "kapitelbezeichnung",
            "values": ["Grundschulen", "Langformschulen"]
        }
    ],
    "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.predefinedRule
Filterregel die die Daten immer vorfiltert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attrName|ja|String||Attributname nach dem vorgefiltert werden soll.|
|values|ja|String[]||Attributwerte für das Vorfiltern.|

**Beispiel**
```
#!json
{
    "attrName": "kapitelbezeichnung",
    "values": ["Grundschulen", "Langformschulen"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.attributeWhiteListObject
Ein AttributeWhiteList Objekt kann entweder ein String sein, welcher den Attributnamen repräsentiert.
Er kann aber auch ein Objekt sein.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Attributname.|
|matchingMode|nein|enum["AND", "OR"]|"OR"|Logische Verknüpfung mehrerer Attributwerte (bei Mehrfachauswahl) innerhalb eines Attributes.|

**Beispiel als String**
```
#!json
"Grundschulen"
```

**Beispiel als Objekt**
```
#!json
{
    "name": "Grundschulen",
    "matchingMode": "AND"
}
```

***

#### Portalconfig.menu.tool.schulwegrouting

[inherits]: # (Portalconfig.menu.tool)

Mit diesem hamburgspezifischen Tool kann von jeder hamburgischen Addresse zu jeder hamburgischen Schule die Route berechnet werden. Dabei werden auch die offiziellen Schuleingänge betrachtet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||Id des Layers der de Schulen enthält. Dieser Layer muss auch in den [Themenconfig](#markdown-header-themenconfig) konfiguriert sein.|

**Beispiel**
```
#!json
"schulwegrouting": {
    "name": "Schulweg-Routing",
    "glyphicon": "glyphicon-filter",
    "layerId": "8712"
}
```

***

#### Portalconfig.menu.tool.compareFeatures

[inherits]: # (Portalconfig.menu.tool)

Hier können Vector Features miteinander verglichen werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|numberOfFeaturesToShow|nein|Integer|3|Anzahl der Features die maximal miteinander vergleichen werden können.|
|numberOfAttributesToShow|nein|Integer|12|Anzahl der Attribute die angezeigt wird. Gibt es mehr Attribute können diese über einen Button zusätzlich ein-/ bzw. ausgeblendet werden.|

**Beispiel**
```
#!json
"compareFeatures": {
    "name": "Vergleichsliste",
    "glyphicon": "glyphicon-th-list",
    "numberOfFeaturesToShow": 5,
    "numberOfAttributesToShow": 10
}
```

***

#### Portalconfig.menu.tool.parcelSearch

[inherits]: # (Portalconfig.menu.tool)

Flurstückssuche. Je nach konfiguration werden spezielle Stored Queries eines WFS abgefragt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceId|ja|String||Id des Dienstes der abgefragt werden soll. Wird in der rest-services.json abgelegt.|
|storedQueryId|ja|String||Id der stored query die verwendet werden soll.|
|configJSON|ja|String||Pfad zur Konfigurationsdatei, die die Gemarkungen enthält.|
|parcelDenominator|nein|Boolean|false|Flag ob Flurnummern auch zur Suche verwendet werden sollen. Besonderheit Hamburg: Hamburg besitzt als Stadtstaat keine Fluren.|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben.|

**Beispiel**
```
#!json
"parcelSearch": {
    "name": "Flurstückssuche",
    "glyphicon": "glyphicon-search",
    "serviceId": "6",
    "storedQueryID": "Flurstueck",
    "configJSON": "/lgv-config/gemarkungen_hh.json",
    "parcelDenominator": false,
    "styleId": "flaecheninfo"
}
```

***

#### Portalconfig.menu.tool.print

[inherits]: # (Portalconfig.menu.tool)

Druckmodul. Liegt zur Zeit noch in 2 varianten vor. Entweder der alte Druckdienst über MapfishPrint 2 oder der moderne Druckdienst, der MapfishPrint 3 verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|mapfishServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat|
|filename|nein|String|"report"|Dateiname des Druckergebnisses|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|
|version|nein|String||@deprecated in 3.0.0. Flag ob das alte oder neue Druckmodul verwendet werden soll. Bei "mapfsih_print_3" wird das neue modul verwendet, sonst das alte.|
|printID|nein|String|"9999"|@deprecated in 3.0.0. Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|outputFilename|nein|String|"report"|@deprecated in 3.0.0. Dateiname des Druckergebnisses.|
|gfi|nein|Boolean|false|@deprecated in 3.0.0. Dateiname des Druckergebnisses.|
|configYAML|nein|String|"/master"|@deprecated in 3.0.0. Configuration des Templates das verwendet werden soll.|

**Beispiel alte Konfiguration mit MapfishPrint2**
```
#!json
"print": {
    "name": "Karte drucken",
    "glyphicon": "glyphicon-print",
    "printID": "123456",
    "configYAML": "/master",
    "outputFilename": "report",
    "title": "Mein Titel",
    "gfi": true
}
```

**Beispiel neue Konfiguration mit MapfishPrint3**
```
#!json
"print": {
    "name": "Karte drucken",
    "glyphicon": "glyphicon-print",
    "mapfishServiceId": "mapfish_printservice_id",
    "printAppId": "mrh",
    "filename": "Ausdruck",
    "title": "Mein Titel",
    "version" : "mapfish_print_3"
}
```

***

#### Portalconfig.menu.tool.routing

[inherits]: # (Portalconfig.menu.tool)

Routing Modul. Das Routing findet auf externen Daten statt und ist nur wenigen Portalen vorenthalten, u.a. das [Verkehrsportal](https://geoportal-hamburg.de/verkehrsportal).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|viomRoutingID|ja|String||Id des Routingdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|bkgSuggestID|ja|String||Id des Vorschlagsdienstes des BKG. Er wird verwendet um Addressvorschläge zu liefern. Wird in der rest-services.json abgelegt.|
|bkgGeosearchID|ja|String||Id des Geokodierungsdienstes des BKG. Er wird verwendet um gewählte Addressen in Koordinaten umzuwandeln. Wird in der rest-services.json abgelegt.|
|isInitOpen|nein|Boolean|false|Flag ob das tool initial geöffnet sein soll.|

**Beispiel**
```
#!json
"routing": {
    "name": "Routenplaner",
    "glyphicon": "glyphicon-road",
    "viomRoutingID": "1",
    "bkgSuggestID": "2",
    "bkgGeosearchID": "3",
    "isInitOpen": false
}
```

***

#### Portalconfig.menu.tool.featureLister

[inherits]: # (Portalconfig.menu.tool)

Modul, das Vektor Features darstellt. Durch hovern über ein feature in der Liste wird auf der Karte der Marker gesetzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere features in dieser Anzahl zugeladen werden.|

**Beispiel**
```
#!json
"featureLister": {
    "name": "Liste",
    "glyphicon": "glyphicon-menu-hamburger",
    "maxFeatures": 10
}
```

***

#### Portalconfig.menu.tool.lines

[inherits]: # (Portalconfig.menu.tool)

Die Linienhafte Darstellung der Pendler wird für das Pendlerportal der MRh(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)

**Beispiel**
```
#!json
"animation": {
    "name": "Pendler (Animation)",
    "glyphicon": "glyphicon-play-circle",
    "url": "http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
    "params": {
        "REQUEST": "GetFeature",
        "SERVICE": "WFS",
        "TYPENAME": "app:mrh_kreise",
        "VERSION": "1.1.0",
        "maxFeatures": "10000"
    },
    "featureType": "mrh_einpendler_gemeinde",
    "attrAnzahl": "anzahl_einpendler",
    "attrGemeinde": "wohnort",
    "zoomlevel": 1,
}
```

***

#### Portalconfig.menu.tool.animation

[inherits]: # (Portalconfig.menu.tool.pendlerCore)

Die Pendleranimation wird für das Pendlerportal der MRh(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|steps|nein|Integer|50|Anzahl der Schritte, die in der Animation durchgeführt werden sollen.|
|minPx|nein|Integer|5|Minimalgröße der Kreisdarstellung der Pendler.|
|maxPx|nein|Integer|20|Maximalgröße der Kreisdarstellung der Pendler.|
|colors|nein|String[]|[]|Anzahl der Farben im RGBA-Muster ("rgba(255,0,0,1)").|

**Beispiel**
```
#!json
"animation": {
    "name": "Pendler (Animation)",
    "glyphicon": "glyphicon-play-circle",
    "steps": 30,
    "url": "http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
    "params": {
        "REQUEST": "GetFeature",
        "SERVICE": "WFS",
        "TYPENAME": "app:mrh_kreise",
        "VERSION": "1.1.0",
        "maxFeatures": "10000"
    },
    "featureType": "mrh_einpendler_gemeinde",
    "attrAnzahl": "anzahl_einpendler",
    "attrGemeinde": "wohnort",
    "minPx": 5,
    "maxPx": 30,
    "zoomlevel": 1,
    "colors": ["rgba(255,0,0,0.5)", "rgba(0,255,0,0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,255,0.5)"]
}
```

***

#### Portalconfig.menu.tool.pendlerCore

[inherits]: # (Portalconfig.menu.tool)

Der PendlerCore ist die Kernkomponente der Werkzeuge "Lines" und "Animation". Seine Eigenschaften werden überschrieben durch [lines](#markdown-header-portalconfigmenutoollines) und [animation](#markdown-header-portalconfigmenutoolanimation)

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|zoomLevel|nein|Integer|1|Zoomstufe auf die gezoomt wird bei Auswahl einer Gemeinde.|
|url|nein|String|"http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung"|Url des WFS Dienstes der abgefragt werden soll.|
|params|nein|[param](#markdown-header-portalconfigmenutoolpendlercoreparam)||Parameter mit denen der Dienst abgefragt werden soll.|
|featureType|nein|String|"mrh_einpendler_gemeinde"|FeatureType (Layer) des WFS Dienstes.|
|attrAnzahl|nein|String|"anzahl_einpendler"|Attributname das die Anzahl der Pendler pro Gemeinde enthält.|
|attrGemeinde|nein|String|"wohnort"|Attributname das die Gemeinde enthält.|

***

#### Portalconfig.menu.tool.pendlerCore.param
Parameter die für die Anfrage des Dienstes relevant sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|REQUEST|nein|String|"GetFeature"|Art des Requests.|
|SERVICE|nein|String|"WFS"|Typ des Dienstes.|
|TYPENAME|nein|String|"app:mrh_kreise"|Typename des Layers.|
|VERSION|nein|String|"1.1.0"|Version des WFS.|
|maxFeatures|nein|String|"10000"|Maximale Anzahl an Features die geholt werden sollen.|

***

#### Portalconfig.menu.tool.contact

[inherits]: # (Portalconfig.menu.tool)

Werkzeug, wodurch der Nutzer mit einem definierten Postfach Kontakt aufnehmen kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceID|ja|String||Id des Emaildienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|from|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name":"LGVGeoportalHilfe"}]|Absender der Email.|
|to|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name": "LGVGeoportalHilfe"}]|Addressat der Email.|
|cc|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[]|CC der Email.|
|bcc|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[]|BCC der Email.|
|ccToUser|nein|Boolean|false|Flag ob der Absender auch als CC eingetragen werden soll.|
|textPlaceholder|nein|String|"Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;"|Platzhaltertext im Freitextfeld.|
|includeSystemInfo|nein|Boolean|false|Flag ob systeminfos des Absendern mitgeschickt werden sollen.|

**Beispiel**
```
#!json
"contact":{
    "name": "Kontakt",
    "glyphicon": "glyphicon-envelope",
    "serviceID": "123",
    "from": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name":"LGVGeoportalHilfe"
        }
    ],
    "to": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name":"LGVGeoportalHilfe"
        }
    ],
    "cc": [],
    "bcc": [],
    "ccTouser": true,
    "textPlaceholder": "Hier Text eingeben."
    "includeSystemInfo": true
}
```

***

#### Portalconfig.menu.tool.contact.email
Email Objekt bestehend aus der email und aus dem Anzeigename.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String||Email.|
|name|nein|String||Anzeigename.|

**Beispiel**
```
#!json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerslider

[inherits]: # (Portalconfig.menu.tool)

Der Layerslider ist ein Werkzeug um verschiedene Layer in der Anwendung hintereinander an bzw auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|ja|String||Titel der im Werkzeug vorkommt.|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|
|layerIds|ja|[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)[]||Array von Objekten aus denen die Layerinformationen herangezogen werden.|

**Beispiel**
```
#!json
"layerslider": {
    "name": "Zeitreihe",
    "glyphicon": "glyphicon-film",
    "title": "Simulation von Beispiel-WMS",
    "timeInterval": 2000,
    "layerIds": [
        {
            "title": "Dienst 1",
            "layerId": "123"
        },
        {
            "title": "Dienst 2",
            "layerId": "456"
        },
        {
            "title": "Dienst 3",
            "layerId": "789"
        }
    ]
}
```

***

#### Portalconfig.menu.tool.layerslider.layerId
Definiert einen Layer für den Layerslider.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|ja|String||Name des Diestes, wie er im Portal angezeigt werden soll.|
|layerId|ja|String||Id des Diestes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|

**Beispiel**
```
#!json
{
    "title": "Dienst 1",
    "layerId": "123"
}
```

***

#### Portalconfig.menu.staticlinks
Das Array staticlink beinhaltet Objekte die entweder als link zu einer anderen Webressource dienen oder als Trigger eines zu definierenden Events.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|staticlinks|nein|[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)[]||Array von Statischen links.|


**Beispiel als onClickTrigger**
```
#!json
"staticlinks": [
    {
        "name": "Alert",
        "glyphicon": "glyphicon-globe",
        "onClickTrigger": [
            {
                "channel": "Alert",
                "event": "alert",
                "data": "Hello World!"
            }
        ]
    }
]
```

***

#### Portalconfig.menu.staticlinks.staticlink
Ein Staticlink-Objekt enthält folgende attribute.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des staticLink-Objekts im Menu.|
|glyphicon|nein|String|"glyphicon-globe"|CSS Klasse des Glyphicons, das vor dem staticLink-Objekt im Menu angezeigt wird.|
|url|nein|String||Url welche in einem neuen Tab angezeigt werden soll.|
|onClickTrigger|nein|[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)[]||Array von OnClickTrigger events.|

**Beispiel als url**
```
#!json
{
    "name": "Hamburg",
    "glyphicon": "glyphicon-globe",
    "url": "http://www.hamburg.de"
}
```

**Beispiel als onClickTrigger**
```
#!json
{
    "name": "Alert",
    "glyphicon": "glyphicon-globe",
    "onClickTrigger": [
        {
            "channel": "Alert",
            "event": "alert",
            "data": "Hello World!"
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink.onClickTrigger
Über einen onClickTrigger wird ein Event getriggert und eventuell daten mitgeschickt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|channel|ja|String||Name des Radio channels.|
|event|ja|String||Event des Radio channels das getriggered werden soll.|
|data|nein|String/Boolean/Number||Daten die mit geschickt werden sollen.|

**Beispiel**
```
#!json
{
    "channel": "Alert",
    "event": "alert",
    "data": "Hello World!"
}
```

***

## Themenconfig
Die Themenconfig definiert welche Inhalte an welche Stelle im Themenbaum vorkommen. Je nach vonfiguration des Baumtyps können auch Ordner Strukturen in den [Fachdaten](#markdown-header-themenconfigfachdaten) angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Hintergrundkarten|ja|[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)||Definition der Hintergrundkarten|
|Fachdaten|ja|[Fachdaten](#markdown-header-themenconfigfachdaten)||Definition der Fachdaten.|

**Beispiel**
```
#!json
"Themenconfig": {
    "Hintergrundkarten": {},
    "Fachdaten": {}
}
```

***

### Themenconfig.Hintergrundkarten

[type:Layer]: # (Themenconfig.Layer)

[type:GroupLayer]: # (Themenconfig.GroupLayer)

Hier werden die Hintergrundkarten definiert

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|

**Beispiel**
```
#!json
"Hintergrundkarten": {
    "Layer": [
        {
            "id": "123
        }
    ]
},
```

***

### Themenconfig.Fachdaten

[type:Layer]: # (Themenconfig.Layer)

[type:GroupLayer]: # (Themenconfig.GroupLayer)

[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Fachdaten definiert

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|
|Ordner|nein|[Ordner](#markdown-header-themenconfigordner)[]||Definition der Ordner.|

**Beispiel**
```
#!json
"Fachdaten": {
    "Layer": [
        {
            "id": "123
        }
    ]
},
```

***

### Themenconfig.Ordner

[type:Layer]: # (Themenconfig.Layer)

[type:GroupLayer]: # (Themenconfig.GroupLayer)

[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Ordner definiert. Ordner können auch verschachtelt konfiguriert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Titel|ja|String||Titel des Ordners.|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|
|Ordner|nein|[Ordner](#markdown-header-themenconfigordner)[]||Definition der Ordner.|

**Beispiel Ordner mit einem Layer**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein Ordner"
            "Layer": [
                {
                    "id": "123
                }
            ]
        }
    ]
}
```

**Beispiel Ordner mit einem Unterordner in dem eine Layer konfiguriert ist**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein erster Ordner"
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner"
                    "Layer": [
                        {
                            "id": "123
                        }
                    ]
                }
            ]
        }
    ]
}
```

**Beispiel Ordner einem Unterordner. Auf der Ebene des Unterordners ist auch nochmal ein Layer definiert**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein erster Ordner"
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner"
                    "Layer": [
                        {
                            "id": "123
                        }
                    ]
                }
            ],
            "Layer": [
                {
                    "id": "456
                }
            ]
        }
    ]
}
```

***

### Themenconfig.GroupLayer

[type:Layer]: # (Themenconfig.Layer)

[type:Extent]: # (Datatypes.Extent)

Hier werden die GruppenLayer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein großteil der Attribute ist in der [services.json](services.json.md) definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für [WMS](#markdown-header-themenconfiglayerwms) und [Vector](#markdown-header-themenconfiglayervector).


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|ja|String/String[]||Id des Layers. In der [services.json](services.json.md) werden die ids aufgelöst und die notwendigen Informationen herangezogen.|
|children|nein|[Layer](#markdown-header-themenconfiglayer)[]||Wird dieses Attribut verwendet, so wird ein Gruppenlayer erzeugt, der beliebig viele Layer beinhaltet. In diesem Falle ist eine einzigartige Id manuell zu wählen.|
|name|nein|String||Name des Layers.|
|transparency|nein|Integer|0|Transparenz des Layers.|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an in denen der Layer verwendet werden kann.|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|
|displayInTree|nein|Boolean|false|Gibt an ob der Layer im Themenbaum angezeigt werden soll.|
|gfiTheme|nein|String|"default"|Wert aus [services.json](services.json.md). Gibt an welches theme für die GetFeatureInfo (gfi) verwendet werden soll.|
|layerAttribution|nein|String||Wert aus [services.json](services.json.md). HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|
|legendURL|nein|String||Wert aus [services.json](services.json.md). Url die verwendet wird um die Legende anzufragen.|
|maxScale|nein|String||Wert aus [services.json](services.json.md). Maximaler Maßstab bei dem dem Layer angezeigt werden soll.|
|minScale|nein|String||Wert aus [services.json](services.json.md). Minimaler Maßstab bei dem dem Layer angezeigt werden soll.|
|autoRefresh|nein|Integer||Automatischer reload des Layers. Angabe in ms. Minimum ist 500.|
|isVisibleInTree|nein|Boolean|true|Anzeige ob Layer im Themenbaum sichtbar ist.|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige ob Layer niemals im Themenbaum sichtbar ist.|

**Beispiel**
```
#!json
{
    "id": "myId",
    "name": "myGroupLayer",
    "children": [
        {
            "id": "123",
            "name": "myLayer_1"
        },
        {
            "id": "456",
            "name": "myLayer_2"
        }
    ]
}
```

***

### Themenconfig.Layer

[type:Extent]: # (Datatypes.Extent)

Hier werden die Layer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein großteil der Attribute ist in der [services.json](services.json.md) definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für [WMS](#markdown-header-themenconfiglayerwms) und [Vector](#markdown-header-themenconfiglayervector).


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|ja|String/String[]||Id des Layers. In der [services.json](services.json.md) werden die ids aufgelöst und die notwendigen Informationen herangezogen. ACHTUNG: Hierbei ist wichtig, dass die angegebenen ids diesselbe URL ansprechen, also den selben Dienst benutzen.|
|name|nein|String||Name des Layers.|
|transparency|nein|Integer|0|Transparenz des Layers.|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an in denen der Layer verwendet werden kann.|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|
|displayInTree|nein|Boolean|false|Gibt an ob der Layer im Themenbaum angezeigt werden soll.|
|gfiTheme|nein|String|"default"|Wert aus [services.json](services.json.md). Gibt an welches theme für die GetFeatureInfo (gfi) verwendet werden soll.|
|layerAttribution|nein|String||Wert aus [services.json](services.json.md). HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|
|legendURL|nein|String||Wert aus [services.json](services.json.md). Url die verwendet wird um die Legende anzufragen.|
|maxScale|nein|String||Wert aus [services.json](services.json.md). Maximaler Maßstab bei dem dem Layer angezeigt werden soll.|
|minScale|nein|String||Wert aus [services.json](services.json.md). Minimaler Maßstab bei dem dem Layer angezeigt werden soll.|
|autoRefresh|nein|Integer||Automatischer reload des Layers. Angabe in ms. Minimum ist 500.|
|isVisibleInTree|nein|Boolean|true|Anzeige ob Layer im Themenbaum sichtbar ist.|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige ob Layer niemals im Themenbaum sichtbar ist.|

**Beispiel mit einer Id**
```
#!json
{
    "id": "123"
}
```

**Beispiel mit einem Array von Ids**
```
#!json
{
    "id": ["123", "456", "789"],
    "name": "mein testlayer"
}
```

***

#### Themenconfig.Layer.WMS

[inherits]: # (Themenconfig.Layer)

Hier werde WMS typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attributesToStyle|nein|String[]||Array von Attributen nach denen der WMS gestylt werden kann. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|
|featureCount|nein|Integer|1|Anzahl der Features die zurückgegeben werden sollen bei einer GetFeatureInfo-Abfrage.|
|geomType|nein|String||Geometrietyp der Daten hinter dem WMS. Momentan wird nur "Polygon" unterstützt. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|
|styleable|nein|Boolean||Zeigt an der Layer vom Werkzeug "styleWMS" verwendet werden kann. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|
|infoFormat|nein|String|"text/xml"|Wert aus [services.json](services.json.md). Format in dem der WMS-GetFeatureInfo-request zurückgegeben werden soll.|
|styles|nein|String[]||Werden styles angegeben so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "MyWMSLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "displayInTree": true,
    "gfiTheme": "default",
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legendURL": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isVisibleInTree": true,
    "isNeverVisibleInTree": false,
    "attributesToStyle": ["MyFirstAttr"],
    "featureCount": 2,
    "geomType": "geometry",
    "infoFormat": "text/html",
    "styleable": true,
    "styles": ["firstStyle", "secondStyle"]
}
```

***
#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)

Hier werden typische Attribute für ein StaticImage aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|ja|String|"Eineindeutige-ID7711"|Es muss eine eineindeutige ID vergeben werden.|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage welcher statische Bilder als Layer darstellen kann.|
|url|ja|Link|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild|
|name|ja|String|"Static Image Name"|Setzt den Namen des Layers für den Layerbaum|
|extent|ja|Array|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet. |


**Beispiel**
```
#!json
{
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Testing PNG File",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***
#### Themenconfig.Layer.Vector

[inherits]: # (Themenconfig.Layer)

Hier werden Vector typische Attribute aufgelistet. Vector Layer sind WFS, GeoJSON, SensorLayer.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses PRadius werden alle features zu einem feature "geclustered".|
|extendedFilter|nein|Boolean||Gibt an ob dieser layer vom Werkzeug "extendedFilter" in [tools](#markdown-header-portalconfigmenutools) verwendet werden kann.|
|filterOptions|nein|[filterOption](#markdown-header-themenconfiglayervectorfilteroption)[]||Filteroptionen die vom Werkzeug "wfsFeatureFilter" in [tools](#markdown-header-portalconfigmenutools) benötigt werden.|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|
|routable|nein|Boolean||Gibt an ob die Position der GFI-Abfrage als Routing Ziel verwendet werden kann. Hierzu muss das Werkzeug [routing](#markdown-header-portalconfigmenutoolrouting) konfiguriert sein.|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|
|styleId|nein|String||Id die den Style definiert. Id wird in der [style.json](style.json.md) aufgelöst.|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|

**Beispiel**
```
#!json
{
"id": "123456",
"name": "MyVectorLayerName",
"transparency": 0,
"visibility": true,
"supported": ["2D"],
"extent": [454591, 5809000, 700000, 6075769],
"displayInTree": true,
"gfiTheme": "default",
"layerAttribution": "MyBoldAttribution for layer 123456",
"legendURL": "https://myServer/myService/legend.pdf",
"maxScale": "100000",
"minScale": "1000",
"autoRefresh": "10000",
"isVisibleInTree": true,
"isNeverVisibleInTree": false,
"clusterDistance": 60,
"extendedFilter": true,
"filterOptions": [
    {
        "fieldName": "myFirstAttributeToFilter",
        "filterName": "Filter_1",
        "filterString": ["*", "value1", "value2"],
        "filterType": "combo"
    },
    {
        "fieldName": "mySecondAttributeToFilter",
        "filterName": "Filter_2",
        "filterString": ["*", "value3", "value4"],
        "filterType": "combo"
    }
],
"mouseHoverField": "name",
"routable": false,
"searchField": "name",
"styleId": "123456",
"hitTolerance": 50,
}
```

***

#### Themenconfig.Layer.Vector.filterOption
Filteroption die vom Werkzeug "wfsFeatureFilter" in [tools](#markdown-header-portalconfigmenutools) benötigt wird.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|fieldName|ja|String||Attributname nach dem zu filtern ist.|
|filterName|ja|String||Name des Filters im Werkzeug.|
|filterString|ja|String[]||Array von Attributwerten nach denen gefiltert werden kann. Bei "*" werden alle Wertausprägungen angezeigt.|
|filterType|ja|String||typ des Filters Momentan wird nur "combo" unterstützt.|

**Beispiel**
```
#!json
{
    "fieldName": "myFirstAttributeToFilter",
    "filterName": "Filter_1",
    "filterString": ["*", "value1", "value2"],
    "filterType": "combo"
}
```

***

# Datatypes
In diesem Kapitel werden die erwarteten Datentypen definiert.

## Datatypes.Coordinate

Eine Koordinate besteht aus einem Array bestehend aus zwei Zahlen. Die erste repräsentiert den Rechtswert, die zweite den Hochwert.

**Beispiel Koordinate bestehend aus Ganzzahlen(Integer)**
```
#!json
[561210, 5932600]
```

**Beispiel Koordinate bestehend aus Gleitkommazahlen(Float)**
```
#!json
[561210.1458, 5932600.12358]
```

***

## Datatypes.Extent

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent besschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Rechtswert-Links-Unten, Hochwert-Links-Unten, Rechtswert-Rechts-Oben, Hochwert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```
#!json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```
***
