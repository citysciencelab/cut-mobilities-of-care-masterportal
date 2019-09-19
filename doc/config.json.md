>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

***

# config.json
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem [Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/stable/portal/master/config.json).
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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|treeType|nein|enum["light", "default", "custom"]|"light"|Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|false|
|Baumtyp|nein|enum["light", "default", "custom"]|"light"|Deprecated in 3.0.0 Bitte Attribut "treeType" verwenden.|false|
|controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
|mapView|nein|[mapView](#markdown-header-portalconfigmapview)||Mit verschiedenen  Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|false|
|menu|nein|[menu](#markdown-header-portalconfigmenu)||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge, in der config.json (siehe [Tools](#markdown-header-portalconfigmenutools)).|false|
|portalTitle|nein|[portalTitle](#markdown-header-portalconfigportaltitle)||Der Titel und weitere Parameter die  in der Menüleiste angezeigt werden können.|false|
|searchBar|nein|[searchBar](#markdown-header-portalconfigsearchbar)||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|false|
|layersRemovable|nein|Boolean|false|Gibt an ob der Layer gelöscht werden darf.|false|

***

### Portalconfig.searchBar
Konfiguration der Searchbar

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bkg|nein|[bkg](#markdown-header-portalconfigsearchbarbkg)||Konfiguration des BKG Suchdienstes.|false|
|gazetteer|nein|[gazetteer](#markdown-header-portalconfigsearchbargazetteer)||Konfiguration des Gazetteer Suchdienstes.|false|
|gdi|nein|[gdi](#markdown-header-portalconfigsearchbargdi)||Konfiguration des GDI (elastic) Suchdienstes.|false|
|osm|nein|[osm](#markdown-header-portalconfigsearchbarosm)||Konfiguration des OpenStreetMap (OSM) Suchdienstes.|false|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|placeholder|nein|String|"Suche"|Placeholder für das Freitextfeld.|false|
|recommendedListLength|nein|Integer|5|Anzahl der Einträge in der Vorschlagsliste.|false|
|quickHelp|nein|Boolean|false|Gibt an ob eine Schnellhilfe angeboten wird.|false|
|specialWFS|nein|[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)||Konfiguration des specialWFS Suchdienstes.|false|
|tree|nein|[tree](#markdown-header-portalconfigsearchbartree)||Konfiguration der Suche im Themenbaum.|false|
|visibleWFS|nein|[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|visibleVector|nein|[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|zoomLevel|nein|Integer||ZoomLevel, auf das die Searchbar maximal hineinzoomt.|false|
|renderToDOM|nein|String||HTML-Id an diese sich die Searchbar rendert. Bei "#searchbarInMap" zeichnet sich die Searchbar auf der Karte. Wird verwendet in MeldeMichel.|true|

***

#### Portalconfig.searchBar.bkg

[type:Extent]: # (Datatypes.Extent)

Konfiguration des BKG Suchdienstes

**ACHTUNG: Backend notwendig!**

**Um die eigene UUID für den BKG nicht öffentlich zu machen, sollten die URLS (hier "bkg_geosearch" und "bkg_suggest") der restServices im Proxy abgefangen und umgeleitet werden.**
**Beispielhafte Proxy Einstellung**
```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|epsg|nein|String|"EPSG:25832"|EPSG-Code des zu verwendenden Koordinatensystems.|false|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmuss suchen soll.|false|
|filter|nein|String|"filter=(typ:*)"|Filter string der an die BKG-Schnittstelle geschickt wird.|false|
|geosearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|false|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|score|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|false|
|suggestCount|nein|Integer|20|Anzahl der Vorschläge.|false|
|suggestServiceId|ja|String||Id des Vorschlagsdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|false|
|zoomToResult|nein|Boolean||Gibt an, ob auf das Feature beim Mousehover auf die Adresse gezoomt werden soll.|false|

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
    "score": 0.6,
    "zoomToResult": true
}
```

***

#### Portalconfig.searchBar.osm ####
Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer. Wird nur durch Klick auf die Lupe oder Enter ausgelöst, da die Anzahl der Abfragen der OSM-Suchmaschine limitiert ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|false|
|serviceId|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor.|false|
|limit|nein|Number|50|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|states|nein|string|""|kann die Namen der Bundesländer enthalten. Trenner beliebig. Eventuell auch englische Ausprägungen eintragen, da die Daten frei im OpenSourceProjekt https://www.openstreetmap.org erfasst werden können.|false|
|classes|nein|string|[]|kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten.|false|

**Beispiel**

```
#!json

"osm": {
    "minChars": 3,
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

***

#### Portalconfig.searchBar.gazetteer

Konfiguration des Gazetteer Suchdienstes

**ACHTUNG: Backend notwendig!**

**Es wird eine Stored Query eines WFS mit vorgegebenen Parametern abgefragt.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|searchDistricts|nein|Boolean|false|Gibt an ob nach Bezirken gesucht werden soll.|false|
|searchHouseNumbers|nein|Boolean|false|Gibt an ob nach Straßen und Hausnummern gesucht werden soll. Bedingt **searchStreets**=true.|false|
|searchParcels|nein|Boolean|false|Gibt an ob nach Flurstücken gesucht werden soll.|false|
|searchStreetKey|nein|Boolean|false|Gibt an ob nach Straßenschlüsseln gesucht werden soll.|false|
|searchStreet|nein|Boolean|false|Gibt an ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|false|

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

#### Portalconfig.searchBar.gdi
Konfiguration des GDI Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|false|
|queryObject|ja|Object||Query Objekt, das vom Elastic Search Model ausgelesen wird.|false|

**Beispiel**
```
#!json
"gdi": {
    "minChars": 3,
    "serviceId": "elastic",
    "queryObject": {
                        "id": "query",
                        "params": {
                            "query_string": "%%searchString%%"
                        }
}
```

***


#### Portalconfig.searchBar.specialWFS
Konfiguration der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|glyphicon|nein|String|"glyhicon-home"|Default glyphicon das in der Vorschlagsliste erscheint. Kann in der [definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition) überschrieben werden.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der [definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition) überschrieben werden.|false|
|timeout|nein|Integer|6000|Timeout in ms für die Dienste Anfrage.|false|
|definitions|nein|[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)[]||Definition der speziellen WFS suchen.|false|

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

#### Portalconfig.searchBar.specialWFS.definition
Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|nein|String||URL des WFS.|false|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|false|
|glyphicon|nein|String|"glyhicon-home"|CSS Klasse des Glyphicons das in der Vorschlagsliste erscheint.|false|
|typeName|nein|String||TypeName des WFS layers.|false|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|false|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|false|
|data|nein|String||Deprecated in 3.0.0 Filterparameter für den WFS request.|false|

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

#### Portalconfig.searchBar.tree
Alle Layer, die im Themenbaum des Portals sind, werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|

**Beispiel**
```
#!json
"tree": {
    "minChars": 5
}
```

***

#### Portalconfig.searchBar.visibleWFS
Konfiguration der Suche über die sichtbaren WFS. Deprecated in 3.0.0. Verwenden Sie [visibleVector](#markdown-header-portalconfigsearchbarvisiblevector).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|

**Beispiel**
```
#!json
"visibleWFS": {
    "minChars": 3
}
```

***

#### Portalconfig.searchBar.visibleVector
Konfiguration der Suche über die sichtbaren VectorLayer. Bei der Layerdefinition unter "Fachdaten" muss für jeden VectorLayer, der durchsucht werden soll das attribut "searchField" gesetzt sein. siehe [searchField](#markdown-header-themenconfiglayervector)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|layerTypes|nein|enum["WFS", "GeoJSON"]|["WFS"]|Vector Typen die verwendet werden sollen.|true|
|gfiOnClick|nein|Boolean|false|Öffnet das GetFeatureInfo (gfi) bei Klick auf das Suchergebnis.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attributions|nein|[attributions](#markdown-header-portalconfigcontrolsattributions)|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|false|
|mousePosition|nein|Boolean|false|Die Koordinaten des Mauszeigers werden angeziegt.|false|
|orientation|nein|[orientation](#markdown-header-portalconfigcontrolsorientation)||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|false|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|false|
|overviewmap|nein|[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)|false|Deprecated in 3.0.0. Bitte "overviewMap" verwenden.|false|
|overviewMap|nein|[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)|false|Übersichtskarte.|false|
|totalview|nein|[totalView](#markdown-header-portalconfigcontrolstotalview)|false|Deprecated in 3.0.0. bitte "totalView" verwenden.|false|
|totalView|nein|[totalView](#markdown-header-portalconfigcontrolstotalview)|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|false|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|false|
|orientation3d|nein|Boolean|false|Legt fest, ob im 3D Modus eine Navigationsrose angezeigt werden soll.|false|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|false|
|backforward|nein|[backForward](#markdown-header-portalconfigcontrolsbackforward)|false|Deprecated in 3.0.0. Bitte "backForward" verwenden.|false|
|backForward|nein|[backForward](#markdown-header-portalconfigcontrolsbackforward)|false|Zeigt Buttons zur Steuerung der letzten und nächsten Kartenansichten an.|false|


***

#### Portalconfig.controls.attributions

Das Attribut attributions kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob vorhandene Attributions angezeigt werden sollen oder nicht. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|false|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomMode|nein|enum["none", "once", "always"]|"once"|*none* (Die Standortbestimmung ist deaktiviert.), *once* (Es wird einmalig beim Laden der Standort bestimmt und einmalig auf den Standort gezoomt.), *always* (Die Karte bleibt immer auf den Nutzerstandort gezoomt.).|false|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte  verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|false|

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

#### Portalconfig.controls.overviewMap

Das Attribut overviewMap kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean, zeigt es die Overviewmap mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||Legt die Resolution fest, die in der Overviewmap verwendet werden soll.|
|baselayer|nein|String||Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|
|isInitOpen|nein|Boolean|true|Legt fest, ob die OverviewMap beim Start dargestellt oder verborgen sein soll.|

**Beispiel overviewmap als Object:**
```
#!json
"overviewMap": {
    "resolution": 305.7487246381551,
    "baselayer": "452",
    "isInitOpen": false
}
```

**Beispiel overviewmap als Boolean:**
```
#!json
"overviewMap": true
```

***

### Portalconfig.portalTitle
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|nein|String|"Master"|Name des Portals.|false|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|false|
|link|nein|String|"https://geoinfo.hamburg.de"|URL der externen Seite, auf die verlinkt wird.|false|
|tooltip|nein|String||Deprecated in 3.0.0 Tooltip beim Hovern über das PortalLogo angezeigt wird.|false|
|toolTip|nein|String|"Landesbetrieb Geoinformation und Vermessung"|Tooltip beim Hovern über das PortalLogo angezeigt wird.|false|

**Beispiel portalTitle:**
```
#!json
"portalTitle": {
    "title": "Master",
    "logo": "../../lgv-config/img/hh-logo.png",
    "link": "https://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```
***

#### Portalconfig.controls.totalView

Das Attribut totalView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Butten an, der in den Defaulteinsellungen gesetzt ist. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|glyphicon|nein|String||Über den Parameter glyphicon kann ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|
|tableGlyphicon|nein|String||Über den Parameter tableGlyphicon kann bei einem TABLE Style ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|

**Beispiel totalView als Object:**
```
#!json
"totalView" : {
    "glyphicon": "glyphicon-step-forward",
    "tableGlyphicon": "glyphicon-step-forward"
},
```

**Beispiel totalView als Boolean:**
```
#!json
"totalView": true
```

***

#### Portalconfig.controls.backForward

Das Attribut backForward kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean, zeigt es die Buttons zur Steuerung der letzten und nächsten Kartenansichten mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|glyphiconFor|nein|String||Über den Parameter glyphiconFor kann ein anderes Glyphicon für das Vorschalten der Kartenansicht verwendet werden.|false|
|glyphiconBack|nein|String||Über den Parameter glyphiconBack kann ein anderes Glyphicon für das Zurückschalten der Kartenansicht verwendet werden.|false|

**Beispiel backForward als Object:**
```
#!json
"backForward" : {
    "glyphiconFor": "glyphicon-fast-forward",
    "glyphiconBack": "glyphicon-fast-backward"
}
```

**Beispiel backForward als Boolean:**
```
#!json
"backForward": true
```

***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)

[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backgroundImage|nein|String||Pfad zum alternativen Hintergrund angeben.|false|
|startCenter|nein|[Coordinate](#markdown-header-datatypescoordinate)|[565874, 5934140]|Die initiale Zentrumskoordinate.|false|
|options|nein|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|true|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|false|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|true|
|zoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|false|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|false|

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

Eine option definiert eine Zoomstufe. Diese muss definiert werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das ZoomLevel ist, desto kleiner ist die Scale. und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|true|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|true|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|true|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|info|nein|[info](#markdown-header-portalconfigmenuinfo)||Ordner im Menü, der [tools](#markdown-header-portalconfigmenutools) oder [staticlinks](#markdown-header-portalconfigmenustaticlinks) darstellt.|false|
|tools|nein|[tools](#markdown-header-portalconfigmenutools)||Ordner im Menü, der Werkzeuge darstellt.|false|
|tree|nein|[tree](#markdown-header-portalconfigmenutree)||Darstellung udn Position des Themenbaums.|false|

***

#### Portalconfig.menu.info

[inherits]: # (Portalconfig.menu.folder)

Informations-Ordner in dem Werkzeuge oder staticlinks eingetragen werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|[children](#markdown-header-portalconfigmenuinfochildren)||Konfiguration der Kindelemente des Informations Ordners.|false|

***

##### Portalconfig.menu.info.children
[type:staticlinks]: # (Portalconfig.menu.staticlinks)

Liste der Werkzeuge oder Staticlinks die im Info-Ordner erscheinen sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|[staticlinks](#markdown-header-portalconfigmenustaticlinks)||Konfiguration der Kindelemente des Informations Ordners.|false|

***

#### Portalconfig.menu.tree
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Themenbaumes.|false|
|glyphicon|nein|String||CSS Klasse des glyphicons.|false|
|isInitOpen|nein|Boolean|false|Gibt an ob der Themenbaum initial geöffnet ist.|false|

***

#### Portalconfig.menu.folder

[type:tool]: # (Portalconfig.menu.tool)

[type:staticlinks]: # (Portalconfig.menu.staticlinks)

Ein Ordner-Object wird dadurch definiert, dass es neben "name" und "glyphicon" noch das attribut "children" besitzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Ordners im Menu.|false|
|glyphicon|ja|String|"glyphicon-folder-open"|CSS Klasse des Glyphicons, das vor dem Ordnernamen im Menu angezeigt wird.|false|
|children|nein|[tool](#markdown-header-portalconfigmenutool)/[staticlinks](#markdown-header-portalconfigmenustaticlinks)||Kindelemente dieses Ordners.|false|

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

### Portalconfig.menu.tools

[inherits]: # (Portalconfig.menu.folder)

[type:tool]: # (Portalconfig.menu.tool)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|[children](#markdown-header-portalconfigmenutoolschildren)||Konfiguration der Werkzeuge.|false|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)

[type:einwohnerabfrage]: # (Portalconfig.menu.tool.einwohnerabfrage)

[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)

[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)

[type:print]: # (Portalconfig.menu.tool.print)

[type:routing]: # (Portalconfig.menu.tool.routing)

[type:featureLister]: # (Portalconfig.menu.tool.featureLister)

[type:lines]: # (Portalconfig.menu.tool.lines)

[type:animation]: # (Portalconfig.menu.tool.animation)

[type:layerSlider]: # (Portalconfig.menu.tool.layerSlider)

[type:contact]: # (Portalconfig.menu.tool.contact)

[type:schulwegrouting]: # (Portalconfig.menu.tool.schulwegrouting)

[type:filter]: # (Portalconfig.menu.tool.filter)

[type:shadow]: # (Portalconfig.menu.tool.shadow)

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von [tool](#markdown-header-portalconfigmenutool) und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|einwohnerabfrage|nein|[einwohnerabfrage](#markdown-header-portalconfigmenutooleinwohnerabfrage)||Hamburg spezifisches Werkzeug um die Einwohner in der FHH (Freie und Hansestadt Hamburg) und der MRH (Metropol Region Hamburg) über eine zu zeichnende Geometrie abfragen zu können.|true|
|compareFeatures|nein|[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)|| Vergleichsmöglichkeit von Vector-Features.|false|
|parcelSearch|nein|[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)||Flurstückssuche.|false|
|measure|nein|[tool](#markdown-header-portalconfigmenutool)||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km bzw m²/km² gewechselt werden.|false|
|coord|nein|[tool](#markdown-header-portalconfigmenutool)||Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in dei Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|false|
|gfi|nein|[tool](#markdown-header-portalconfigmenutool)||GetFeatureInfo(gfi). Werkzeug um Informationen abzufragen. Dabei wird entweder ein WMS-Request gestellt oder die Vectordaten im Browser abgefragt. Anschließend werden die Attribute der gefundenen Features dargestellt.|false|
|print|nein|[print](#markdown-header-portalconfigmenutoolprint)||Druckmodul mit dem die Karte als PDF exportiert werden kann.|false|
|searchByCoord|nein|[tool](#markdown-header-portalconfigmenutool)||Koordinatensuche. Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf.|false|
|kmlimport|nein|[tool](#markdown-header-portalconfigmenutool)||Import von KML Dateien. Über dieses Werkzeug können KML Dateien importiert werden.|false|
|wfsFeatureFilter|nein|[tool](#markdown-header-portalconfigmenutool)||Filtern von WFS Features. Über dieses Werkzeug können WFS features gefiltert werden. Dies setzt jedoch eine Konfiguration der "filterOptions" am WFS-Layer-Objekt vorraus.|false|
|extendedFilter|nein|[tool](#markdown-header-portalconfigmenutool)||Dynamisches Filtern von WFS Features. Über dieses Werkzeug können WFS features dynamisch gefiltert werden. Dies setzt jedoch eine Konfiguration der "extendedFilter" am WFS-Layer-Objekt vorraus.|false|
|routing|nein|[routing](#markdown-header-portalconfigmenutoolrouting)||Routing. Über dieses Werkzeug können Routen berechnet werden.|true|
|draw|nein|[tool](#markdown-header-portalconfigmenutool)||Zeichnen. Mithilfe dieses Werkzeuges können Punkte, Linien, Polygone, Kreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Das Gezeichnete kann auch als KML exportiert werden.|false|
|styleWMS|nein|[tool](#markdown-header-portalconfigmenutool)||Klassifizierung vom WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Requuest wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.|true|
|featureLister|nein|[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)||Listet alle Features eines Vektor Layers auf.|false|
|lines|nein|[lines](#markdown-header-portalconfigmenutoollines)||Pendlerdarstellung als linenhafte Objekte.|false|
|animation|nein|[animation](#markdown-header-portalconfigmenutoolanimation)||Pendleranimation als punkthafte Objekte.|false|
|saveSelection|nein|[tool](#markdown-header-portalconfigmenutool)||Werkzeug zum Zustand Speichern. Mithilfe dieses Werkzeuges kann der Kartenzustand als URL zum Abspeichern erzeugt werden. Dabei werden die Layer in deren Reihenfolge, Transparenz und Sichtbarkeit dargestellt. Zusätzlich wird auch noch die Zentrumskoordinate mit abgespeichert.|false|
|layerslider|nein|[layerSlider](#markdown-header-portalconfigmenutoollayerslider)||Deprecated in 3.0.0 Bitte "layerSlider" verwenden.|false|
|layerSlider|nein|[layerSlider](#markdown-header-portalconfigmenutoollayerslider)||Werkzeug zum Abspielen einer Reihendfolge von Layers.|false|
|legend|nein|[tool](#markdown-header-portalconfigmenutool)||Legende. Stellt die Legende aller sichtbaren Layer dar.|false|
|contact|nein|[contact](#markdown-header-portalconfigmenutoolcontact)||Kontaktformular. Stellt dem User eine Möglichkeit zur Verfügung, mit dem einem Konfigurierten Postfach in Verbindung zu treten um Fehler zu melden oder Wünsche und Anregungen zu äußern.|false|
|schulwegrouting|nein|[schulwegrouting](#markdown-header-portalconfigmenutoolschulwegrouting)||Schulwegrouting.|true|
|filter|nein|[filter](#markdown-header-portalconfigmenutoolfilter)||Neues Filtermodul.|false|
|virtualcity|nein|[virtualcity](#markdown-header-portalconfigmenutoolvirtualcity)||virtualcityPLANNER planning Viewer|
|shadow|nein|[shadow](#markdown-header-portalconfigmenutoolshadow)||Konfigurationsobjekt für die Schattenzeit im 3D-Modus.|


***

#### Portalconfig.menu.tool
Über den Attribut-key des Werkzeuges wird definiert, welches Werkzeug mit welchen Eigenschaften geladen wird. Jedes Tool besitzt mindestens die unten aufgeführten Attribute. Welche Tools konfigurierbar sind, finden Sie unter [tools](#markdown-header-portalconfigmenutools).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|false|
|onlyDesktop|nein|Boolean|false|Flag ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|false|
|isVisibleInMenu|nein|Boolean|true|Flag ob das Tool unter Werkzeuge angezeigt wird.|false|

**Beispiel eines Tools**
```
#!json
"legend":{
    "name": "Legende",
    "glyphicon": "glyphicon-book"
}
```

***

#### Portalconfig.menu.tool.einwohnerabfrage

[inherits]: # (Portalconfig.menu.tool)

Einwohnerabfrage für Hamburg und die MRH (Metropolregion Hamburg).

**ACHTUNG: Backend notwendig!**

**Es wird über einen WPS eine FME-Workbench angesprochen, welche die Anzahl der Einwohner berechnet, unter Beachtung des Datenschutzes.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|false|
|onlyDesktop|nein|Boolean|false|Flag ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|false|
|populationReqServiceId|ja|String|"2"|In rest-services.[...].js konfigurierte Service-ID|false|

**Beispiel Einwohnerabfrage**
```
#!json
"einwohnerabfrage": {
    "name": "Einwohneranzahl abfragen",
    "glyphicon": "glyphicon-wrench",
    "onlyDesktop": false
}
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

Der Filter bietet eine vielzahl von Möglichkeiten um Vektor-Daten filtern zu können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|isGeneric|nein|Boolean|false|Zeigt an ob sich der Filter dynamisch erzeugen lässt. Ist momentan noch nicht umgesetzt.|false|
|minScale|nein|Integer||Minimale Zoomstufe auf die der Filter bei der Darstellung der Ergebnisse heranzoomt.|false|
|liveZoomToFeatures|nein|Boolean|false|Gibt an ob der Filter sofort nach der Filterung auf die Filterergebnisse zoomt.|false|
|predefinedQueries|nein|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Definition der Filterabfragen.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers. Muss auch in der Themenconfig konfiguriert sein.|false|
|isActive|nein|Boolean|false|Gibt an ob diese Filtereinstellung initial durchgeführt werden soll.|false|
|isSelected|nein|Boolean|false|Gibt an ob diese Filtereinstellung initial angezeigt werden soll.|false|
|searchInMapExtent|nein|Boolean|false|Gibt an ob nur die Features im Kartenauschnitt gefiltert werden sollen.|false|
|info|nein|String||Kurzer Info text der über der Filtereinstellung erscheint.|false|
|predefinedRules|nein|[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)[]||Filterregel die die Daten vorfiltert.|true|
|attributeWhiteList|nein|String[]/[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)[]||Whitelist an Attributen die verwendet werden sollen.|true|
|snippetType|nein|String||Datentyp des Attributes. Wenn nicht angegeben wird der Datentyp automatisch ermittelt. Er kann in Ausnahmefällen auch manuell überschrieben werden. Beispielsweise mit "checkbox-classic". Dies wird benötigt im Projekt DIPAS auf der Touchtabl-Variante des Portals.|true|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String||Attributname nach dem vorgefiltert werden soll.|false|
|values|ja|String[]||Attributwerte für das Vorfiltern.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Attributname.|false|
|matchingMode|nein|enum["AND", "OR"]|"OR"|Logische Verknüpfung mehrerer Attributwerte (bei Mehrfachauswahl) innerhalb eines Attributes.|false|

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

**ACHTUNG: Backend notwendig!**

**Es wird über einen WPS eine FME-Workbench angesprochen, welche das Routing berechnet.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers der de Schulen enthält. Dieser Layer muss auch in den [Themenconfig](#markdown-header-themenconfig) konfiguriert sein.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|numberOfFeaturesToShow|nein|Integer|3|Anzahl der Features die maximal miteinander vergleichen werden können.|false|
|numberOfAttributesToShow|nein|Integer|12|Anzahl der Attribute die angezeigt wird. Gibt es mehr Attribute können diese über einen Button zusätzlich ein-/ bzw. ausgeblendet werden.|false|

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
Flurstückssuche.

**ACHTUNG: Backend notwendig!**

**Je nach Konfiguration werden spezielle Stored Queries eines WFS mit vorgegebenen Parametern abgefragt.**

Beispiel: https://geodienste.hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0&&StoredQuery_ID=Flurstueck&gemarkung=0601&flurstuecksnummer=00011

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des Dienstes der abgefragt werden soll. Wird in der rest-services.json abgelegt.|false|
|storedQueryId|ja|String||Id der stored query die verwendet werden soll.|true|
|configJSON|ja|String||Pfad zur Konfigurationsdatei, die die Gemarkungen enthält. [Beispiel](https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json).|false|
|parcelDenominator|nein|Boolean|false|Flag ob Flurnummern auch zur Suche verwendet werden sollen. Besonderheit Hamburg: Hamburg besitzt als Stadtstaat keine Fluren.|false|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben.|false|

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

Druckmodul. Konfigurierbar für 3 Druckdienste: den High Resolution PlotService, MapfishPrint 2 oder MapfishPrint 3.

**ACHTUNG: Backend notwendig!**

**Es wird mit einem [Mapfish-Print2](http://www.mapfish.org/doc/print/index.html), [Mapfish-Print3](http://mapfish.github.io/mapfish-print-doc) oder einem HighResolutionPlotService im Backend kommuniziert.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|mapfishServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat.|false|
|filename|nein|String|"report"|Dateiname des Druckergebnisses.|false|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|false|
|version|nein|String|| Flag welcher Druckdienst verwendet werden soll. Bei "HighResolutionPlotService" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 2 verwendet, sonst wird MapfishPrint 3 verwendet.|false|
|printID|nein|String||Deprecated in 3.0.0. Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|outputFilename|nein|String|"report"|Deprecated in 3.0.0. Dateiname des Druckergebnisses.|false|
|gfi|nein|Boolean|false|Deprecated in 3.0.0. Dateiname des Druckergebnisses.|false|
|configYAML|nein|String|"/master"|Deprecated in 3.0.0. Configuration des Templates das verwendet werden soll.|false|
|isLegendSelected|nein|Boolean|false|Gibt an ob die Checkbox zum Legende mitdrucken aktiviert sein soll. Wird nur angezeigt wenn der Druckdienst (Mapfish Print 3) das Drucken der Legende unterstützt.|false|
|legendText|nein|String|"Mit Legende"|Beschreibender Text für die printLegend-Checkbox.|false|
|dpiForPdf|nein|Number|200|Auflösung der Karte im PDF.|false|
**Beispiel Konfiguration mit MapfishPrint2**
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

**Beispiel Konfiguration mit High Resolution PlotService**
```
#!json
"print": {
    "name": "Karte drucken",
    "glyphicon": "glyphicon-print",
    "mapfishServiceId": "123456",
    "filename": "Ausdruck",
    "title": "Mein Titel",
    "version" : "HighResolutionPlotService"
}
```

**Beispiel Konfiguration mit MapfishPrint3**
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

Routing Modul.

**ACHTUNG: Backend notwendig!**

**Das Routing findet auf externen Daten statt und ist nur in wenigen Portalen vorenthalten, u.a. das [Verkehrsportal](https://geoportal-hamburg.de/verkehrsportal).**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|viomRoutingID|ja|String||Id des Routingdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|bkgSuggestID|ja|String||Id des Vorschlagsdienstes des BKG. Er wird verwendet um Addressvorschläge zu liefern. Wird in der rest-services.json abgelegt.|false|
|bkgGeosearchID|ja|String||Id des Geokodierungsdienstes des BKG. Er wird verwendet um gewählte Addressen in Koordinaten umzuwandeln. Wird in der rest-services.json abgelegt.|false|
|isInitOpen|nein|Boolean|false|Flag ob das tool initial geöffnet sein soll.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere features in dieser Anzahl zugeladen werden.|false|

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

Die Linienhafte Darstellung der Pendler wird für das Pendlerportal der MRH(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)

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

Die Pendleranimation wird für das Pendlerportal der MRH(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|steps|nein|Integer|50|Anzahl der Schritte, die in der Animation durchgeführt werden sollen.|false|
|minPx|nein|Integer|5|Minimalgröße der Kreisdarstellung der Pendler.|false|
|maxPx|nein|Integer|20|Maximalgröße der Kreisdarstellung der Pendler.|false|
|colors|nein|String[]|[]|Anzahl der Farben im RGBA-Muster ("rgba(255,0,0,1)").|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomLevel|nein|Integer|1|Zoomstufe auf die gezoomt wird bei Auswahl einer Gemeinde.|false|
|url|nein|String|"http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung"|Url des WFS Dienstes der abgefragt werden soll.|false|
|params|nein|[param](#markdown-header-portalconfigmenutoolpendlercoreparam)||Parameter mit denen der Dienst abgefragt werden soll.|false|
|featureType|nein|String|"mrh_einpendler_gemeinde"|FeatureType (Layer) des WFS Dienstes.|false|
|attrAnzahl|nein|String|"anzahl_einpendler"|Attributname das die Anzahl der Pendler pro Gemeinde enthält.|false|
|attrGemeinde|nein|String|"wohnort"|Attributname das die Gemeinde enthält.|false|

***

#### Portalconfig.menu.tool.pendlerCore.param
Parameter die für die Anfrage des Dienstes relevant sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|REQUEST|nein|String|"GetFeature"|Art des Requests.|false|
|SERVICE|nein|String|"WFS"|Typ des Dienstes.|false|
|TYPENAME|nein|String|"app:mrh_kreise"|Typename des Layers.|false|
|VERSION|nein|String|"1.1.0"|Version des WFS.|false|
|maxFeatures|nein|String|"10000"|Maximale Anzahl an Features die geholt werden sollen.|false|

***

#### Portalconfig.menu.tool.contact

[inherits]: # (Portalconfig.menu.tool)

Werkzeug, wodurch der Nutzer mit einem definierten Postfach Kontakt aufnehmen kann.

**ACHTUNG: Backend notwendig!**

**Das Contact kommuniziert mit einem SMTP-Server und ruft dort die sendmail.php auf.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceID|ja|String||Id des Emaildienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|from|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name":"LGVGeoportalHilfe"}]|Absender der Email.|false|
|to|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name": "LGVGeoportalHilfe"}]|Addressat der Email.|false|
|cc|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[]|CC der Email.|false|
|bcc|nein|[email](#markdown-header-portalconfigmenutoolcontactemail)[]|[]|BCC der Email.|false|
|ccToUser|nein|Boolean|false|Flag ob der Absender auch als CC eingetragen werden soll.|false|
|textPlaceholder|nein|String|"Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;"|Platzhaltertext im Freitextfeld.|false|
|includeSystemInfo|nein|Boolean|false|Flag ob systeminfos des Absendern mitgeschickt werden sollen.|false|
|deleteAfterSend|nein|Boolean|false|Flag ob das Kontaktfenster nach erfolgreichem Versenden der Nachricht geschlossen und der Inhalt gelöscht werden soll.|false|
|withTicketNo|nein|Boolean|true|Flag ob bei erfolgreichem Versand der Anfrage eine Ticketnummer zurückgegeben werden soll.|false|

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
    "textPlaceholder": "Hier Text eingeben.",
    "includeSystemInfo": true,
    "deleteAfterSend": true,
    "withTicketNo": false
}
```

***

#### Portalconfig.menu.tool.contact.email
Email Objekt bestehend aus der email und aus dem Anzeigename.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|email|nein|String||Email.|false|
|name|nein|String||Anzeigename.|false|

**Beispiel**
```
#!json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerSlider

[inherits]: # (Portalconfig.menu.tool)

Der Layerslider ist ein Werkzeug um verschiedene Layer in der Anwendung hintereinander an bzw auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Titel der im Werkzeug vorkommt.|false|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|false|
|layerIds|ja|[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)[]||Array von Objekten aus denen die Layerinformationen herangezogen werden.|false|

**Beispiel**
```
#!json
"layerSlider": {
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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Name des Diestes, wie er im Portal angezeigt werden soll.|false|
|layerId|ja|String||Id des Diestes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|

**Beispiel**
```
#!json
{
    "title": "Dienst 1",
    "layerId": "123"
}
```


#### Portalconfig.menu.tool.virtualcity

[inherits]: # (Portalconfig.menu.tool)

Das virtualcity Tool bietet die Möglichkeit die Planungen von einem virtualcityPLANNER Dienst im Masterportal anzuzeigen.
Die Planungen müssen im virtualcityPLANNER auf Öffentlich gesetzt sein, dann können sie über dieses Tool angezeigt werden


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceId|ja|String||Id des services. Wird aufgelöst in der [rest-services.json](rest-services.json.md).|

**Beispiel**
```
#!json
{
  "title": "virtualcityPLANNER",
  "serviceId": "1"
}
```


#### Portalconfig.menu.tool.shadow

[inherits]: # (Portalconfig.menu.tool)

Das ShadowTool bietet eine Oberfläche zur Definition einer Zeitangabe. Über Slider und Datepicker können Zeitangaben in einem 30-Minuten Raster angegeben werden. Die ausgewählte Zeitangabe dient dem Rendern der Schatten aller 3D-Objekte im 3D-Modus, indem der Sonnenstand simuliert wird. Durch Ziehen des Sliders oder Auswahl eines neuen Datums wird unmittelbar ein neuer Sonnenstand simuliert. Per default startet das Tool mit der aktuellen Zeitangabe, die über Parameter überschrieben werden kann.


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|shadowTime|nein|Object|Now()|Default-Zeitangabe, mit der das ShadowTool startet. Erkennt "month", "day", "hour", "minute"|
|isShadowEnabled|nein|Boolean|false|Default Shadow-Wert. True um unmittelbar Shadow einzuschalten. False zum manuellen bestätigen.|


**Beispiel**
```
#!json
{
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "isShadowEnabled": true
}
```


***

### Portalconfig.menu.staticlinks
Das Array staticlink beinhaltet Objekte die entweder als link zu einer anderen Webressource dienen oder als Trigger eines zu definierenden Events.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|staticlinks|nein|[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)[]||Array von Statischen links.|false|


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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des staticLink-Objekts im Menu.|false|
|glyphicon|nein|String|"glyphicon-globe"|CSS Klasse des Glyphicons, das vor dem staticLink-Objekt im Menu angezeigt wird.|false|
|url|nein|String||Url welche in einem neuen Tab angezeigt werden soll.|false|
|onClickTrigger|nein|[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)[]||Array von OnClickTrigger events.|false|

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|channel|ja|String||Name des Radio channels.|false|
|event|ja|String||Event des Radio channels das getriggered werden soll.|false|
|data|nein|String/Boolean/Number||Daten die mit geschickt werden sollen.|false|

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
Die Themenconfig definiert welche Inhalte an welche Stelle im Themenbaum vorkommen. Je nach vonfiguration des treeType können auch Ordner Strukturen in den [Fachdaten](#markdown-header-themenconfigfachdaten) angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Hintergrundkarten|ja|[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)||Definition der Hintergrundkarten.|false|
|Fachdaten|nein|[Fachdaten](#markdown-header-themenconfigfachdaten)||Definition der Fachdaten.|false|
|Fachdaten_3D|nein|[Fachdaten_3D](#markdown-header-themenconfigfachdaten_3d)||Definition der Fachdaten für den 3D-Modus.|false|

**Beispiel**
```
#!json
"Themenconfig": {
    "Hintergrundkarten": {},
    "Fachdaten": {},
    "Fachdaten_3D": {}
}
```

***

### Themenconfig.Hintergrundkarten

[type:Layer]: # (Themenconfig.Layer)

[type:GroupLayer]: # (Themenconfig.GroupLayer)

Hier werden die Hintergrundkarten definiert

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Hintergrundkarten"| Name der Schaltfläche für Hintergrundkarten im custom tree und default tree.|false|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|false|

**Beispiel**
```
#!json
"Hintergrundkarten": {
    "name": "Meine Hintergrundkarten",
    "Layer": [
        {
            "id": "123"
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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Fachdaten"| Name der Schaltfläche für Fachdaten im custom tree und default tree.|false|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|false|
|Ordner|nein|[Ordner](#markdown-header-themenconfigordner)[]||Definition der Ordner.|false|

**Beispiel**
```
#!json
"Fachdaten": {
    "name": "Meine Fachdaten",
    "Layer": [
        {
            "id": "123"
        }
    ]
},
```

***

### Themenconfig.Fachdaten_3D

[type:Layer]: # (Themenconfig.Layer)

Hier werden die 3D-Daten für die 3D-Ansicht definiert. Im custom tree und default tree. Wird nur im 3D-Modus eingeblendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"3D Daten"| Name der Schaltfläche für 3D-Daten.|false|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)[]||Definition der 3DLayer.|false|

**Beispiel**
```
#!json
"Fachdaten_3D":
    {
      "name": "Meine Fachdaten 3D",
      "Layer":
        [
        {
          "id": "12883"
        }
       ]
    }
```

***

### Themenconfig.Ordner

[type:Layer]: # (Themenconfig.Layer)

[type:GroupLayer]: # (Themenconfig.GroupLayer)

[type:Ordner]: # (Themenconfig.Ordner)

Hier werden die Ordner definiert. Ordner können auch verschachtelt konfiguriert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Titel|ja|String||Titel des Ordners.|false|
|Layer|ja|[Layer](#markdown-header-themenconfiglayer)/[GroupLayer](#markdown-header-themenconfiggrouplayer)[]||Definition der Layer.|false|
|Ordner|nein|[Ordner](#markdown-header-themenconfigordner)[]||Definition der Ordner.|false|

**Beispiel Ordner mit einem Layer**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein Ordner",
            "Layer": [
                {
                    "id": "123"
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
            "Titel": "Mein erster Ordner",
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner",
                    "Layer": [
                        {
                            "id": "123"
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
            "Titel": "Mein erster Ordner",
            "Ordner": [
                {
                    "Titel": "Mein zweiter Ordner",
                    "Layer": [
                        {
                            "id": "123"
                        }
                    ]
                }
            ],
            "Layer": [
                {
                    "id": "456"
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


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der [services.json](services.json.md) werden die ids aufgelöst und die notwendigen Informationen herangezogen.|false|
|children|nein|[Layer](#markdown-header-themenconfiglayer)[]||Wird dieses Attribut verwendet, so wird ein Gruppenlayer erzeugt, der beliebig viele Layer beinhaltet. In diesem Falle ist eine einzigartige Id manuell zu wählen.|false|
|name|nein|String||Name des Layers.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an in denen der Layer verwendet werden kann.|false|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|false|
|gfiTheme|nein|String|"default"|Wert aus [services.json](services.json.md). Gibt an welches theme für die GetFeatureInfo (gfi) verwendet werden soll.|true|
|layerAttribution|nein|String||Wert aus [services.json](services.json.md). HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus [services.json](services.json.md). Url die verwendet wird um die Legende anzufragen.|false|
|maxScale|nein|String||Wert aus [services.json](services.json.md). Maximaler Maßstab bei dem dem Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus [services.json](services.json.md). Minimaler Maßstab bei dem dem Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige ob Layer niemals im Themenbaum sichtbar ist.|false|

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


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der [services.json](services.json.md) werden die ids aufgelöst und die notwendigen Informationen herangezogen. ACHTUNG: Hierbei ist wichtig, dass die angegebenen ids diesselbe URL ansprechen, also den selben Dienst benutzen.|false|
|name|nein|String||Name des Layers.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an in denen der Layer verwendet werden kann.|false|
|extent|nein|[Extent](#markdown-header-datatypesextent)|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|false|
|gfiTheme|nein|String|"default"|Wert aus [services.json](services.json.md). Gibt an welches theme für die GetFeatureInfo (gfi) verwendet werden soll.|true|
|layerAttribution|nein|String||Wert aus [services.json](services.json.md). HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus [services.json](services.json.md). Url die verwendet wird um die Legende anzufragen.|false|
|maxScale|nein|String||Wert aus [services.json](services.json.md). Maximaler Maßstab bei dem dem Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus [services.json](services.json.md). Minimaler Maßstab bei dem dem Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige ob Layer niemals im Themenbaum sichtbar ist.|false|

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

Hier werden WMS typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attributesToStyle|nein|String[]||Array von Attributen nach denen der WMS gestylt werden kann. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|false|
|featureCount|nein|Integer|1|Anzahl der Features die zurückgegeben werden sollen bei einer GetFeatureInfo-Abfrage.|false|
|geomType|nein|String||Geometrietyp der Daten hinter dem WMS. Momentan wird nur "Polygon" unterstützt. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|false|
|styleable|nein|Boolean||Zeigt an der Layer vom Werkzeug "styleWMS" verwendet werden kann. Wird benötigt vom Werkzeug "styleWMS" in [tools](#markdown-header-portalconfigmenutools).|true|
|infoFormat|nein|String|"text/xml"|Wert aus [services.json](services.json.md). Format in dem der WMS-GetFeatureInfo-request zurückgegeben werden soll.|false|
|styles|nein|String[]||Werden styles angegeben so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|true|

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
    "gfiTheme": "default",
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legendURL": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
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

#### Themenconfig.Layer.Tileset

[inherits]: # (Themenconfig.Layer)

Hier werden Tileset typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|hiddenFeatures|nein|Array|[]|Liste mit IDs, die in der Ebene versteckt werden sollen|
|[cesium3DTilesetOptions]|nein|Object|{}|Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.|

[cesium3DTilesetOptions]: https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        maximumScreenSpaceError : 6
    },
}
```

***

#### Themenconfig.Layer.Terrain

[inherits]: # (Themenconfig.Layer)

Hier werden Terrain typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[cesiumTerrainProviderOptions]|nein|Object|Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.

[cesiumTerrainProviderOptions]: https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html

**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    },
}
```

***

#### Themenconfig.Layer.Entitites3D

[inherits]: # (Themenconfig.Layer)

Hier werden Entities3D typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|entities|ja|Array||Modelle, die angezeigt werden sollen |`[]`|

Entity Optionen

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|url|ja|String|`""`|Url zu dem Modell|`"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`|
|attributes|nein|Object|{}|Attribute für das Modell|`{"name": "test"}`|
|latitude|ja|Number| |Breitengrad des Modell-Origins in Grad|`53.541831`|
|longitude|ja|Number| |Längengrad des Modell-Origins in Grad|`9.917963`|
|height|nein|Number|0|Höhe des Modell-Origins|`10`|
|heading|nein|Number|0|Rotation des Modells, in Grad|`0`|
|pitch|nein|Number|0|Neigung des Modells in Grad |`0`|
|roll|nein|Number|0|Roll des Modells in Grad|`0`|
|scale|nein|Number|1|Skalierung des Modells|`1`|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI)|`true`|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein)|`true`|


**Beispiel**
```
#!json
{
    "id": "123456",
    "name": "EntitiesLayerName",
    "visibility": true,
    "entities": [
       {
         "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
         "attributes": {
           "name": "Fernsehturm.kmz"
         },
         "latitude": 53.541831,
         "longitude": 9.917963,
         "height": 10,
         "heading": -1.2502079000000208,
         "pitch": 0,
         "roll": 0,
         "scale": 5,
         "allowPicking": true,
         "show": true
       }
     ]
}
```

***

#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Hier werden typische Attribute für ein StaticImage aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String|"Eineindeutige-ID7711"|Es muss eine eineindeutige ID vergeben werden.|false|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage welcher statische Bilder als Layer darstellen kann.|false|
|url|ja|String|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild.|false|
|name|ja|String|"Static Image Name"|Setzt den Namen des Layers für den Layerbaum.|false|
|extent|ja|[Extent](#markdown-header-datatypesextent)|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet.|false|


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

Hier werden Vector typische Attribute aufgelistet. Vector Layer sind WFS, GeoJSON (nur in EPSG:4326), SensorLayer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses PRadius werden alle features zu einem feature "geclustered".|false|
|extendedFilter|nein|Boolean||Gibt an ob dieser layer vom Werkzeug "extendedFilter" in [tools](#markdown-header-portalconfigmenutools) verwendet werden kann.|false|
|filterOptions|nein|[filterOption](#markdown-header-themenconfiglayervectorfilteroption)[]||Filteroptionen die vom Werkzeug "wfsFeatureFilter" in [tools](#markdown-header-portalconfigmenutools) benötigt werden.|false|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|false|
|routable|nein|Boolean||Gibt an ob die Position der GFI-Abfrage als Routing Ziel verwendet werden kann. Hierzu muss das Werkzeug [routing](#markdown-header-portalconfigmenutoolrouting) konfiguriert sein.|false|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|false|
|additionalInfoField|nein|String|name|Attributname des Features für die Hitlist in der Searchbar. Ist das Attribut nicht vorhanden wird der Layername angegeben.|false|
|styleId|nein|String||Id die den Style definiert. Id wird in der [style.json](style.json.md) aufgelöst.|false|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|false|

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
    "gfiTheme": "default",
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legendURL": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
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
    "hitTolerance": 50
},
{
    "id" : "11111",
    "name" : "lokale GeoJSON",
    "url" : "portal/master/test.json",
    "typ" : "GeoJSON",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legendURL" : ""
}
```

***

#### Themenconfig.Layer.Vector.filterOption
Filteroption die vom Werkzeug "wfsFeatureFilter" in [tools](#markdown-header-portalconfigmenutools) benötigt wird.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fieldName|ja|String||Attributname nach dem zu filtern ist.|false|
|filterName|ja|String||Name des Filters im Werkzeug.|false|
|filterString|ja|String[]||Array von Attributwerten nach denen gefiltert werden kann. Bei "*" werden alle Wertausprägungen angezeigt.|false|
|filterType|ja|String||typ des Filters Momentan wird nur "combo" unterstützt.|false|

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
