>Zurück zur **[Dokumentation Masterportal](doc.de.md)**.

[TOC]

***

# config.json
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/portal/basic/config.json)**.
Die config.json besteht aus der **[Portalconfig](#markdown-header-Portalconfig)** und der **[Themenconfig](#markdown-header-Themenconfig)**

```
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

***

## Portalconfig
Im Abschnitt *Portalconfig* können folgende Eigenschaften konfiguriert werden:
1. Titel & Logo (*portalTitle*)
2. Art der Themenauswahl (*treeType*)
3. Starteinstellungen der Kartenansicht (*mapView*)
4. Schaltflächen auf der Kartenansicht sowie mögliche Interaktionen (*controls*)
5. Menüeinträge sowie Vorhandenheit jeweiliger Tools und deren Reihenfolge (*menu*)
6. Typ und Eigenschaften des genutzten Suchdienstes (*searchBar*)
7. Löschbarkeit von Themen (*layersRemovable*)

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|portalTitle|nein|**[portalTitle](#markdown-header-portalconfigportaltitle)**||Der Titel und weitere Parameter die in der Menüleiste angezeigt werden können.|false|
|treeType|nein|enum["light","default","custom"]|"light"|Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|false|
|singleBaselayer|nein|Boolean|false|Legt fest, ob nur ein Baselayer gleichzeitig ausgewählt werden kann, nur bei dem treeType „custom“ verfügbar.|false|
|Baumtyp|nein|enum["light","default","custom"]|"light"|Deprecated in 3.0.0 Bitte Attribut "treeType" verwenden.|false|
|mapView|nein|**[mapView](#markdown-header-portalconfigmapview)**||Mit verschiedenen Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|false|
|controls|nein|**[controls](#markdown-header-portalconfigcontrols)**||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
|menu|nein|**[menu](#markdown-header-portalconfigmenu)**||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge in der config.json (siehe **[Tools](#markdown-header-portalconfigmenutools)**).|false|
|searchBar|nein|**[searchBar](#markdown-header-portalconfigsearchbar)**||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|false|
|layersRemovable|nein|Boolean|false|Gibt an, ob der Layer gelöscht werden darf.|false|

***

### Portalconfig.searchBar
Konfiguration der Searchbar

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bkg|nein|**[bkg](#markdown-header-portalconfigsearchbarbkg)**||Konfiguration des BKG Suchdienstes.|false|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigsearchbargazetteer)**||Konfiguration des Gazetteer Suchdienstes.|false|
|gdi|nein|**[gdi](#markdown-header-portalconfigsearchbargdi)**||Konfiguration des GDI (elastic) Suchdienstes. Deprecated in 3.0.0. Bitte **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** verwenden.|false|
|elasticSearch|nein|**[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)**||Konfiguration des ElasticSearch Suchdienstes.|false|
|osm|nein|**[osm](#markdown-header-portalconfigsearchbarosm)**||Konfiguration des OpenStreetMap (OSM) Suchdienstes.|false|
|locationFinder|nein|**[locationFinder](#markdown-header-portalconfigsearchbarlocationfinder)**||Konfiguration des LocationFinder-Suchdienstes.|false|
|placeholder|nein|String|"Suche"|Placeholder für das Freitextfeld.|false|
|recommendedListLength|nein|Integer|5|Anzahl der Einträge in der Vorschlagsliste.|false|
|quickHelp|nein|Boolean|false|Gibt an ob eine Schnellhilfe angeboten wird.|false|
|specialWFS|nein|**[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)**||Konfiguration des specialWFS Suchdienstes.|false|
|tree|nein|**[tree](#markdown-header-portalconfigsearchbartree)**||Konfiguration der Suche im Themenbaum.|false|
|visibleWFS|nein|**[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)**||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|visibleVector|nein|**[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**||Konfiguration der Suche über die sichtbaren WFS Layer.|false|
|zoomLevel|nein|Integer||ZoomLevel, auf das die Searchbar maximal hineinzoomt.|false|
|sortByName|nein|Boolean|true|Legt fest ob die Ergebnisse einer Suche alphabetisch nach Namen sortiert werden sollen|false|
|selectRandomHits|nein|Boolean|true|Wenn `true` wird zufällig ausgewählt, welche Ergebnisse angezeigt werden sollen, wenn die Anzahl der Treffer `recomendedListLength` überschreitet. Wenn `false`, so wird die Liste an Treffern bei `recomendedListLength` abgeschnitten. Möglicherweise werden in diesem Fall trotz nur die Ergebnisse des Suchdienstes verwendet, welcher zuerst eine Liste mit Treffern zurück liefert.|false|

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
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmus suchen soll.|false|
|filter|nein|String|"filter=(typ:*)"|Filter string der an die BKG-Schnittstelle geschickt wird.|false|
|geosearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|minChars|nein|Integer|3|Deprecated in 3.0.0. Bitte "minCharacters" verwenden.|false|
|minCharacters|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|score|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|false|
|suggestCount|nein|Integer|20|Anzahl der Vorschläge.|false|
|suggestServiceId|ja|String||Id des Vorschlagsdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|zoomToResult|nein|Boolean|false|Deprecated in 3.0.0. Bitte "zoomToResultOnHover" oder "zoomToResultOnClick" verwenden. Gibt an, ob auf das Feature beim Mousehover auf die Adresse gezoomt werden soll.|false|
|zoomToResultOnHover|nein|Boolean|false|Gibt an, ob auf das Feature beim Mousehover auf die Adresse gezoomt werden soll.|false|
|zoomToResultOnClick|nein|Boolean|true|Gibt an, ob auf das Feature beim Klick auf die Adresse gezoomt werden soll.|false|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"bkg": {
    "minCharacters": 3,
    "suggestServiceId": "4",
    "geosearchServiceId": "5",
    "extent": [454591, 5809000, 700000, 6075769],
    "suggestCount": 10,
    "epsg": "EPSG:25832",
    "filter": "filter=(typ:*)",
    "score": 0.6,
    "zoomToResultOnHover": false,
    "zoomToResultOnClick": true,
    "zoomLevel": 10
}
```

***

#### Portalconfig.searchBar.osm ####
Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer. Wird nur durch Klick auf die Lupe oder Enter ausgelöst, da die Anzahl der Abfragen der OSM-Suchmaschine limitiert ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|limit|nein|Number|50|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|states|nein|string|""|Kann die Namen der Bundesländer enthalten. Trenner beliebig. Eventuell auch englische Ausprägungen eintragen, da die Daten frei im OpenSourceProjekt **[OpenStreetMap](https://www.openstreetmap.org)** erfasst werden können.|false|
|classes|nein|string|[]|Kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten.|false|

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

#### Portalconfig.searchBar.locationFinder ####
Konfiguration zur Suche unter Verwendung eines ESRI CH LocationFinders.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|incrementalSearch|nein|Boolean|true|Gibt an ob eine Suchverfollständigung (Autocomplete) stattfinden soll. Wenn `incrementalSearch` auf `false` gesetzt wird, so wird eine Surche nur durch einen Klick auf die Lupe bzw. durch Enter gestartet. Dies ist sinvoll, wenn die Anzahl erlaubter Anfragen an den eingebundenen Dienst kontigentiert ist.|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|classes|nein|**[LocationFinderClass](#markdown-header-portalconfigsearchbarlocationfinderLocationFinderClass)**||Kann Klassen (mit Eigenschaften) enthalten die berücksichtigt werden sollen. Wenn hier nichts angegeben wird, so werden alle Klassen berücksichtigt.|false|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|spatialReference|nein|String||Koordinatensystem, in dem das Ergebnis angefragt werden soll. Standardmäßig wird  hier der Wert von Portalconfig.mapView.epsg verwendet.|false|

##### Portalconfig.searchBar.locationFinder.LocationFinderClass #####

Definition von Klassen, welche als Ergebnis berücksichtigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Klasse|false|
|icon|nein|String|"glyphicon-road"|Visualisierung der Klasse durch ein Glyphicon|false|
|zoom|nein|String|"center"|Legt fest wie auf einen ausgewählten Treffer gezoomt werden soll. Wenn `center` ausgewählt ist, so wird auf die Zentrumskoordinate (`cx` und `cy`) gezoomt und ein Marker angezeigt. Im Falle von `bbox` wird auf die durch den LocationFinder angegebene BoundingBox (`xmin`, `ymin`, `xmax` und `ymax`) gezoomt. Ein Marker wird in dem Fall nicht angezeigt.|false|

**Beispiel**

```
#!json

"locationFinder": {
    "serviceId": "10",
    "classes": [
        {
			"name": "Haltestelle",
			"icon": "glyphicon-record"
		},
		{
			"name": "Adresse",
			"icon": "glyphicon-home"
		},
		{
			"name": "Straßenname",
			"zoom": "bbox"
		}
    ]
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
|searchDistricts|nein|Boolean|false|Gibt an, ob nach Bezirken gesucht werden soll.|false|
|searchHouseNumbers|nein|Boolean|false|Gibt an, ob nach Straßen und Hausnummern gesucht werden soll. Bedingt **searchStreets**=true.|false|
|searchParcels|nein|Boolean|false|Gibt an, ob nach Flurstücken gesucht werden soll.|false|
|searchStreetKey|nein|Boolean|false|Gibt an, ob nach Straßenschlüsseln gesucht werden soll.|false|
|searchStreet|nein|Boolean|false|Gibt an, ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|

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
Konfiguration des GDI Suchdienstes.
Deprecated in 3.0.0. Bitte **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** verwenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|serviceID|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|queryObject|ja|**[queryObject](#markdown-header-portalconfigsearchbargdiqueryobject)**||Query Objekt, das vom Elastic Search Model ausgelesen wird.|false|

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

#### Portalconfig.searchBar.gdi.queryObject
Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String|""|Todo|false|
|params|ja|**[params](#markdown-header-portalconfigsearchbargdiqueryobjectparams)**||Parameter Object für ElasticSearch.|false|

***

#### Portalconfig.searchBar.gdi.queryObject.params
Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|query_string|ja|String|"%%searchString%%"|Todo|false|

***

#### Portalconfig.searchBar.elasticSearch

Konfiguration des Elastic Search Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|type|nein|enum["POST", "GET"]|"POST"|Art des Requests.|false|
|searchStringAttribute|nein|String|"searchString"|Attributname im payload für den searchString.|false|
|responseEntryPath|nein|String|""|Der Pfad in der response (JSON) zum Attribut, das die gefundenen Features enthält.|false|
|triggerEvent|nein|**[triggerEvent](#markdown-header-portalconfigsearchbarelasticsearchtriggerevent)**|{}|Radio event das ausgelöst werden soll durch Mouseover und Click.|false|
|hitMap|nein|**[hitMap](#markdown-header-portalconfigsearchbarelasticsearchhitmap)**||Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.|true|
|hitType|nein|String|"Elastic"|Typ des Suchergebnisses, wird in der Auswahlliste hinter dem Namen angezeigt.|false|
|hitGlyphicon|nein|String|"glyphicon-road"|CSS Glyphicon Klasse des Suchergebnisses. Wird vor dem Namen angezeigt.|false|
|useProxy|nein|Boolean|false|Flag die angibt ob die URL geproxied werden soll oder nicht.|false|

Als zusätzliches property kann `payload` hinzugefügt werden. Es muss nicht zwingend gesetzt sein, und passt zur Beschreibung von **[CustomObject](#markdown-header-datatypescustomobject)**. Per default wird es als leeres Objekt `{}` gesetzt. Das Objekt beschreibt die Payload, die mitgeschickt werden soll. Es muss das Attribut für den searchString vorhalten. Dieses Objekt kann im Admintool nicht gepflegt werden, da dort **[CustomObject](#markdown-header-datatypescustomobject)** nicht definiert ist.

 **Beispiel**
```
#!json
"elasticSearch": {
    "minChars":3,
    "serviceId":"elastic_hh",
    "type": "GET",
    "payload": {
        "id":"query",
        "params":{
            "query_string":""
        }
    },
    "searchStringAttribute": "query_string",
    "responseEntryPath": "hits.hits",
    "triggerEvent": {
        "channel": "Parser",
        "event": "addGdiLayer"
    },
    "hitMap": {
        "name": "_source.name",
        "id": "_source.id",
        "source": "_source"
    },
    "hitType": "Fachthema",
    "hitGlyphicon": "glyphicon-list"
}
```


***
#### Portalconfig.searchBar.elasticSearch.hitMap

Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String|"name"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|id|ja|String|"id"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|coordinate|ja|String|"coordinate"|Attribut value wird auf attribut key gemappt. Notwendig um den mapMarker anzuzeigen.|false|

***

***
#### Portalconfig.searchBar.elasticSearch.triggerEvent

Radio event das ausgelöst werden soll durch Mouseover und Click. Definiert durch "channel" und "event".

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|channel|ja|String||Channel an den der hit beim mouseover und click in der recommendedList getriggered wird.|false|
|event|ja|String||Event das getriggered wird.|false|


***

#### Portalconfig.searchBar.specialWFS

Konfiguration der WFS-Suchfunktion "specialWFS": fragt Features eines WFS-Dienstes ab. Der Dienst muss hierfür WFS 2.0 Anfragen zulassen.

Beispielsweise würde bei der Eingabe "Kronenmatten" der Dienst
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
folgende Anfrage mit einer xml FeatureCollection beantworten. Die Features der Collection werden anschließend als Suchergebnisse vorgeschlagen.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```


Die WFS 2 query wird dabei dynamisch durch das Masterportal erstellt. Die Konfiguration einer stored query im WFS Dienst ist hierfür nicht erforderlich.



|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche losläuft.|false|
|glyphicon|nein|String|"glyhicon-home"|Default glyphicon das in der Vorschlagsliste erscheint. Kann in der **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)** überschrieben werden.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)** überschrieben werden.|false|
|timeout|nein|Integer|6000|Timeout in ms für die Dienste Anfrage.|false|
|definitions|nein|**[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**[]||Definition der speziellen WFS suchen.|false|

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
            "name": "B-Plan",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        }
    ]
}
```

***

#### Portalconfig.searchBar.specialWFS.definition

Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|nein|String||URL des WFS. Je nach proxy-Konfiguration muss die relative url vom Server des Portals aus angegeben werden. |false|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|false|
|glyphicon|nein|String|"glyhicon-home"|CSS Klasse des Glyphicons das in der Vorschlagsliste erscheint.|false|
|typeName|nein|String||Der Name des abzufragenden Layers innerhalb des WFS.|false|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|false|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|false|
|namespaces|nein|String||XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt).|false|
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
Konfiguration der Suche über die sichtbaren WFS. Deprecated in 3.0.0. Verwenden Sie **[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**.

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
Konfiguration der Suche über die sichtbaren VectorLayer. Bei der Layerdefinition unter "Fachdaten" muss für jeden VectorLayer, der durchsucht werden soll das Attribut "searchField" gesetzt sein. Siehe **[searchField](#markdown-header-themenconfiglayervector)**

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
|attributions|nein|**[attributions](#markdown-header-portalconfigcontrolsattributions)**|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|false|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|false|
|mousePosition|nein|Boolean|false|Die Koordinaten des Mauszeigers werden angezeigt.|false|
|orientation|nein|**[orientation](#markdown-header-portalconfigcontrolsorientation)**||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|false|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|false|
|overviewmap|nein|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Deprecated in 3.0.0. Bitte "overviewMap" verwenden.|false|
|overviewMap|nein|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Übersichtskarte.|false|
|totalview|nein|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Deprecated in 3.0.0. bitte "totalView" verwenden.|false|
|totalView|nein|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|false|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|false|
|orientation3d|nein|Boolean|false|Legt fest, ob im 3D Modus eine Navigationsrose angezeigt werden soll.|false|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|false|
|backforward|nein|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Deprecated in 3.0.0. Bitte "backForward" verwenden.|false|
|backForward|nein|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Zeigt Buttons zur Steuerung der letzten und nächsten Kartenansichten an.|false|

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
|zoomMode|nein|enum["once", "always"]|"once"|Der Standort wird bestimmt und der Marker wird an- oder ausgeschaltet. Dafür ist es notwendig das Portal über **https** zu laden. Modi: *once* (Es wird einmalig auf den Standort gezoomt. ), *always* (Die Karte wird mit jedem Einschalten auf den Standort gezoomt.).|false|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|false|

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

Das Attribut overviewMap kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Overviewmap mit den Defaulteinstellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||deprecated in 3.0.0: Legt die Resolution fest, die in der Overviewmap verwendet werden soll. Falls nicht angegeben, passt sich der Kartenausschnitt per Zoom automatisch an.|
|baselayer|nein|String||deprecated in 3.0.0, danach bitte layerId verwenden!: Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|
|layerId|nein|String||Über den Parameter layerId kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|
|isInitOpen|nein|Boolean|true|Legt fest, ob die OverviewMap beim Start dargestellt oder verborgen sein soll.|

**Beispiel overviewmap als Object:**
```
#!json
"overviewMap": {
    "resolution": 305.7487246381551,
    "layerId": "452",
    "isInitOpen": false
}
```

**Beispiel overviewmap als Boolean:**
```
#!json
"overviewMap": true
```

***

#### Portalconfig.controls.totalView

Das Attribut totalView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Butten an, der in den Defaulteinstellungen gesetzt ist. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|glyphicon|nein|String|"glyphicon-fast-backward"|Über den Parameter glyphicon kann ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|
|tableGlyphicon|nein|String|"glyphicon-home"|Über den Parameter tableGlyphicon kann bei einem TABLE Style ein anderes Glyphicon für das Zurückschalten zur Startansicht verwendet werden.|false|

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

Das Attribut backForward kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons zur Steuerung der letzten und nächsten Kartenansichten mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

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

### Portalconfig.portalTitle
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|nein|String|"Master"|Name des Portals.|false|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|false|
|link|nein|String|"https://geoinfo.hamburg.de"|URL der externen Seite, auf die verlinkt wird.|false|
|tooltip|nein|String||Deprecated in 3.0.0 Tooltip, der beim Hovern über das PortalLogo angezeigt wird.|false|
|toolTip|nein|String|"Landesbetrieb Geoinformation und Vermessung"|Tooltip, der beim Hovern über das PortalLogo angezeigt wird.|false|

**Beispiel portalTitle:**
```
#!json
"portalTitle": {
    "title": "Master",
    "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
    "link": "https://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```
***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)
[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backgroundImage|nein|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/config.json.md#markdown-header-portalconfigmapview"|Pfad zum alternativen Hintergrund angeben.|false|
|startCenter|nein|**[Coordinate](#markdown-header-datatypescoordinate)**|[565874, 5934140]|Die initiale Zentrumskoordinate.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|false|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|false|
|startZoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|false|
|zoomLevel|nein|Integer||Deprecated in 3.0.0 Bitte "startZoomLevel" verwenden.|false|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|false|
|options|nein|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|false|

**Beispiel:**
```
#!json
"mapView": {
    "backgroundImage": "https://geodienste.hamburg.de/lgv-config/img/backgroundCanvas.jpeg",
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

Eine option definiert eine Zoomstufe. Diese muss definiert werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das ZoomLevel ist, desto kleiner ist die Scale und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|false|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|false|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|false|

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
|info|nein|**[info](#markdown-header-portalconfigmenuinfo)**||Ordner im Menü, der **[tools](#markdown-header-portalconfigmenutools)** oder **[staticlinks](#markdown-header-portalconfigmenustaticlinks)** darstellt.|false|
|tools|nein|**[tools](#markdown-header-portalconfigmenutools)**||Ordner im Menü, der Werkzeuge darstellt.|false|
|tree|nein|**[tree](#markdown-header-portalconfigmenutree)**||Darstellung und Position des Themenbaums.|false|

***

#### Portalconfig.menu.legend

Konfigurations-Optionen der Legende.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Legende.|false|
|glyphicon|nein|String|"glyphicon-book"|Glyphicon der Legende.|false|
|showCollapseAllButton|nein|Boolean|false|Option zum Ein- bzw. Ausblenden aller Legenden|false|

***

#### Portalconfig.menu.info
[inherits]: # (Portalconfig.menu.folder)

Dies ist ein Menüreiter, in dem typischerweise Links *("staticlinks")* zu Informationen angelegt werden. Es können aber auch Werkzeuge *("tools")* hinterlegt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|children|nein|**[children](#markdown-header-portalconfigmenuinfochildren)**||Konfiguration der Kindelemente des Menüreiters.|false|

***

##### Portalconfig.menu.info.children

[type:staticlink]: # (Portalconfig.menu.staticlinks.staticlink)

Liste der Werkzeuge *("tools")* oder Links *("staticlinks")*, die im Menüreiter *"info"* erscheinen sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|staticlinks|nein|**[staticlink](#markdown-header-portalconfigmenustaticlinks)**[]||Konfigurationsobjekt zur Erstellung von Links im Menüreiter.|false|

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
|children|nein|**[tool](#markdown-header-portalconfigmenutool)**/**[staticlinks](#markdown-header-portalconfigmenustaticlinks)**||Kindelemente dieses Ordners.|false|

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
|children|nein|**[children](#markdown-header-portalconfigmenutoolschildren)**||Konfiguration der Werkzeuge.|false|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)
[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)
[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)
[type:print]: # (Portalconfig.menu.tool.print)
[type:draw]: # (Portalconfig.menu.tool.draw)
[type:featureLister]: # (Portalconfig.menu.tool.featureLister)
[type:lines]: # (Portalconfig.menu.tool.lines)
[type:animation]: # (Portalconfig.menu.tool.animation)
[type:layerSlider]: # (Portalconfig.menu.tool.layerSlider)
[type:contact]: # (Portalconfig.menu.tool.contact)
[type:filter]: # (Portalconfig.menu.tool.filter)
[type:shadow]: # (Portalconfig.menu.tool.shadow)
[type:virtualcity]: # (Portalconfig.menu.tool.virtualcity)
[type:gfi]: # (Portalconfig.menu.tool.gfi)
[type:wfst]: # (Portalconfig.menu.tool.wfst)
[type:measure]: # (Portalconfig.menu.tool.measure)
[type:styleWMS]: # (Portalconfig.menu.tool.styleWMS)
[type:legend]: # (Portalconfig.menu.legend)
[type:saveSelection]: # (Portalconfig.menu.tool.saveSelection)
[type:searchByCoord]: # (Portalconfig.menu.tool.searchByCoord)

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addWMS|nein|**[tool](#markdown-header-portalconfigmenutool)**||Mit diesem Werkzeug lassen sich Layer eines WMS laden. Die Angabe erfolgt über eine URL. Es werden alle Layer des Dienstes geladen und sind im Themenbaum unter "Externe Fachdaten" verfügbar. Bisher ist die Verwendung des Werkzeugs nur in Kombination mit den Tehmenbäumen "custom" und "default" möglich.|true|
|animation|nein|**[animation](#markdown-header-portalconfigmenutoolanimation)**||Pendleranimation als punkthafte Objekte.|false|
|compareFeatures|nein|**[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)**|| Bietet eine Vergleichsmöglichkeit von Vektor-Features. In der getFeatureInfo lassen sich Features über das Stern-Symbol auf die Vergleichliste setzen. Funktioniert in Verbindung mit dem GFI-Theme **Default**!|false|
|contact|nein|**[contact](#markdown-header-portalconfigmenutoolcontact)**||Das Kontaktformular bietet dem User eine Möglichkeit an das konfigurierte Postfach eine Nachricht zu senden. Es können beispielsweise Fehler oder Wünsche und Anregungen gemeldet werden.|false|
|coord|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "supplyCoord" verwenden. Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in die Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|false|
|draw|nein|**[draw](#markdown-header-portalconfigmenutooldraw)**||Mithilfe des Zeichnen-Werkzeuges können Punkte, Linien, Polygone, Kreise, Doppelkreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Die Zeichnungen können in den Formaten: KML, GeoJSON oder GPX heruntergeladen werden.|false|
|extendedFilter|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "filter" verwenden. Dynamisches Filtern von WFS Features. Über dieses Werkzeug können WFS features dynamisch gefiltert werden. Dies setzt jedoch eine Konfiguration der "extendedFilter" am WFS-Layer-Objekt voraus.|false|
|featureLister|nein|**[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)**||Listet alle Features eines Vektorlayers auf.|false|
|fileImport|nein|**[tool](#markdown-header-portalconfigmenutool)**||Import von Dateien des Typs *.kml, *.geojson und *. gpx. Über dieses Werkzeug können solche Dateien importiert werden.|false|
|filter|nein|**[filter](#markdown-header-portalconfigmenutoolfilter)**||Filtermodul mit dem sich Vektordaten aus WFS filtern lassen.|false|
|gfi|nein|**[gfi](#markdown-header-portalconfigmenutoolgfi)**||Mit der GetFeatureInfo(gfi) lassen sich Informationen zu beliebigen Layern anzeigen. Dabei werden bei einem WMS die Daten über die GetFeatureInfo geladen. Bei Vektordaten (WFS, Sensor, GeoJSON usw.) werden die angezeigten Attribute aus den Daten selbst verwendet.|false|
|kmlimport|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "fileImport" verwenden.|false|
|layerSlider|nein|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||Mit dem Layerslider lassen sich beliebige Dienste in einer Reihenfolge abspielen. Zum Beispiel geeignet für Luftbilder aus verschiedenen Jahrgängen.|false|
|layerslider|nein|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||Deprecated in 3.0.0 Bitte "layerSlider" verwenden.|false|
|legend|nein|**[legend](#markdown-header-portalconfigmenulegend)**||In der Legende werden alle sichtbaren Layer dargestellt.|false|
|lines|nein|**[lines](#markdown-header-portalconfigmenutoollines)**||Pendlerdarstellung als linienhafte Objekte.|false|
|measure|nein|**[measure](#markdown-header-portalconfigmenutoolmeasure)**||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km bzw m²/km² gewechselt werden.|false|
|parcelSearch|nein|**[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)**||Mit dieser Flurstückssuche lassen sich Flurstücke über Gemarkung, Flur (in Hamburg ohne Flur) und Flurstück suchen.|false|
|print|nein|**[print](#markdown-header-portalconfigmenutoolprint)**||Druckmodul mit dem die Karte als PDF exportiert werden kann.|false|
|saveSelection|nein|**[saveSelection](#markdown-header-portalconfigmenutoolsaveselection)**||Werkzeug mit dem sich die aktuellen Karteninhalte speichern lassen. Der Zustand der Karte wird als URL zum Abspeichern erzeugt. Dabei werden die Layer in deren Reihenfolge, Transparenz und Sichtbarkeit dargestellt. Zusätzlich wird die Zentrumskoordinate mit abgespeichert.|false|
|searchByCoord|nein|**[searchByCoord](#markdown-header-portalconfigmenutoolsearchbycoord)**||Koordinatensuche. Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf.|false|
|selectFeatures|nein|**[tool](#markdown-header-portalconfigmenutool)**||Ermöglicht Auswahl von Features durch Ziehen einer Box und Einsehen derer GFI-Attribute.|false|
|shadow|nein|**[shadow](#markdown-header-portalconfigmenutoolshadow)**||Konfigurationsobjekt für die Schattenzeit im 3D-Modus.|false|
|styleWMS|nein|**[styleWMS](#markdown-header-portalconfigmenutoolstylewms)**||Klassifizierung von WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Request wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.|true|
|styleVT|nein|**[tool](#markdown-header-portalconfigmenutool)**||Style-Auswahl zu VT-Diensten. Ermöglicht das Umschalten des Stylings eines Vector Tile Layers, wenn in der services.json mehrere Styles für ihn eingetragen sind.|false|
|supplyCoord|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "supplyCoord" verwenden. Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in die Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|false|
|virtualcity|nein|**[virtualcity](#markdown-header-portalconfigmenutoolvirtualcity)**||virtualcityPLANNER planning Viewer|false|
|wfsFeatureFilter|nein|**[tool](#markdown-header-portalconfigmenutool)**||Deprecated in 3.0.0 Bitte "filter" verwenden. Filtern von WFS Features. Über dieses Werkzeug können WFS features gefiltert werden. Dies setzt jedoch eine Konfiguration der "filterOptions" am WFS-Layer-Objekt voraus.|false|
|wfst|nein|**[wfst](#markdown-header-portalconfigmenutoolwfst)**||WFS-T Modul mit dem Features visualisiert, erstellt, aktualisiert und gelöscht werden können.|false|
|bufferAnalysis|nein|**[tool](#markdown-header-portalconfigmenutool)**||In der Buffer-Analyse muss ein Quell-Layer, ein Buffer-Radius und ein Ziel-Layer ausgewählt werden. Buffer-Radien werden um die Features des Quell-Layers dargestellt. Sobald ein Ziel-Layer gewählt wurde, werden nur die Features dieses Layers hervorgehoben, welche sich außerhalb der Buffer-Radien befinden. Auch eine invertierte Anzeige ist möglich. Bei dieser werden nur die Features des Ziel-Layers innerhalb der Radien hervorgehoben werden.|false|
***

#### Portalconfig.menu.tool

Über den Attribut-key des Werkzeuges wird definiert, welches Werkzeug mit welchen Eigenschaften geladen wird. Jedes Tool besitzt mindestens die unten aufgeführten Attribute. Welche Tools konfigurierbar sind, finden Sie unter **[tools](#markdown-header-portalconfigmenutools)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob ein Werkzeug beim starten des Portals geöffnet ist.|false|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|false|
|isVisibleInMenu|nein|Boolean|true|Flag, ob das Tool unter Werkzeuge angezeigt wird.|false|
|keepOpen|nein|Boolean|false|Flag, ob das Tool parallel zu anderen Tools geöffnet bleibt.|false|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|onlyDesktop|nein|Boolean|false|Flag, ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|false|
|renderToWindow|nein|Boolean|true|Flag, ob das Tool beim Anklicken im frei schwebenden Fenster dargestellt werden soll.|false|
|resizableWindow|nein|Boolean|false|Flag, ob das Tool-Fenster vergrößer-/verkleinerbar ist.|false|

**Beispiel eines Tools**
```
#!json
"legend":{
    "name": "Legende",
    "glyphicon": "glyphicon-book"
}
```

***

#### Portalconfig.menu.tool.gfi

[inherits]: # (Portalconfig.menu.tool)

Zeigt Informationen zu einem abgefragten Feature ab, indem GetFeatureInfo-Requests oder GetFeature-Requests oder geladene Vektordaten abgefragt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|centerMapToClickPoint|nein|Boolean|false|Wenn der Parameter auf true gesetzt wird, verschiebt sich die Karte beim Klick auf ein Feature so, dass das Feature im Mittelpunkt der sichtbaren Karte liegt. Dies ist nur bei der Verwendung des desktopTypes "Detached" relevant.|false|
|glyphicon|nein|String|"glyphicon-info-sign"|CSS Klasse des Glyphicons, das vor dem GFI im Menu angezeigt wird.|false|
|active|nein|Boolean|true|Gibt an, ob das GFI per default aktiviert ist.|false|
|desktopType|nein|String|"detached"|Gibt an welches Template für die GetFeatureInfo im Desktopmodus verwendet wird. Bei Attached wird das GFI direkt auf dem Punkt positioniert. Bei Detached wird ein Marker auf den geklickten Punkt gesetzt und das GFI wird rechts auf der Karte platziert.|false|
|centerMapMarkerPolygon|nein|Boolean|false|Angabe, ob für ein angeklicktes Feature die Koordinaten des Zentrums ermittelt werden sollen oder ob die Koordinaten der tatsächlich angeklickten Koordinate bestimmt werden.|false|
|highlightVectorRules|nein|**[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)**||Regeldefinitionen zum Überschreiben des Stylings von abgefragten Vektordaten.[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)|false|

**Beispiel einer GFI Konfiguration**
```
#!json
"gfi":{
    "name":"Informationen abfragen",
    "glyphicon":"glyphicon-info-sign",
    "active":true,
    "centerMapMarkerPolygon":true,
    "highlightVectorRules": {
        "fill": {
            "color": [215, 102, 41, 0.9]
        },
        "image": {
            "scale": 1.5
        },
        "stroke": {
            "width": 4
        },
        "text": {
            "scale": 2
        }
    }
}
```

**Beispiel einer GFI Konfiguration zur Informationsabfrage von Features**
```
#!json
"gfi":{
    "name":"Informationen abfragen",
    "glyphicon":"glyphicon-info-sign",
    "active":true,
    "centerMapMarkerPolygon":true
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules

Liste der Einstellungen zum Überschreiben von Vektorstyles bei GFI Abfragen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesfill)**||Mögliche Einstellung: color|false|
|image|nein|**[image](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesimage)**||Mögliche Einstellung: scale|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesstroke)**||Mögliche Einstellung: width|false|
|text|nein|**[text](#markdown-header-portalconfigmenutoolgfihighlightvectorrulestext)**||Mögliche Einstellung: scale|false|

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```
#!json
"fill": { "color": [215, 102, 41, 0.9] }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

```
#!json
"image": { "scale": 1.5 }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

```
#!json
"stroke": { "width": 4 }
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.text
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

```
#!json
"text": { "scale": 2 }
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

Der Filter bietet eine Vielzahl von Möglichkeiten um Vektor-Daten filtern zu können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|allowMultipleQueriesPerLayer|nein|Boolean|false|Regelt, ob beim selektieren nur der ausgewählte Layer gefiltert werden soll oder ob die Filtereinstellungen deselektierter Layer beibehalten werden sollen.|false|
|deactivateGFI|nein|Boolean|false|Wenn das Attribute auf true gesetzt wird ist bei geöffnetem Filter die GFI-Abfrage deaktiviert.|false|
|isGeneric|nein|Boolean|false|Zeigt an, ob sich der Filter dynamisch erzeugen lässt. Ist momentan noch nicht umgesetzt.|false|
|minScale|nein|Integer||Minimale Zoomstufe auf die der Filter bei der Darstellung der Ergebnisse heranzoomt.|false|
|liveZoomToFeatures|nein|Boolean|false|Gibt an, ob der Filter sofort nach der Filterung auf die Filterergebnisse zoomt.|false|
|predefinedQueries|nein|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Definition der Filterabfragen.|false|
|saveToUrl|nein|Boolean|true|Speichert das aktuelle Filterergebnis in der URL ab. Dadurch kann das Filterergebnis als Lesezeichen abgelegt werden.|false|

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
Objekt, das eine Filtereinstellung definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers. Muss auch in der Themenconfig konfiguriert sein.|false|
|isActive|nein|Boolean|false|Gibt an, ob diese Filtereinstellung initial durchgeführt werden soll.|false|
|isSelected|nein|Boolean|false|Gibt an, ob diese Filtereinstellung initial angezeigt werden soll.|false|
|searchInMapExtent|nein|Boolean|false|Gibt an, ob nur die Features im Kartenauschnitt gefiltert werden sollen.|false|
|info|nein|String||Kurzer Infotext, der über der Filtereinstellung erscheint.|false|
|predefinedRules|nein|**[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)**[]||Filterregel die die Daten vorfiltert.|true|
|attributeWhiteList|nein|String[]/**[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)**[]||Whitelist an Attributen die verwendet werden sollen.|true|
|snippetType|nein|String||Datentyp des Attributes. Wenn nicht angegeben, wird der Datentyp automatisch ermittelt. Er kann in Ausnahmefällen auch manuell überschrieben werden. Beispielsweise mit "checkbox-classic". Dies wird im Projekt DIPAS auf der Touchtabl-Variante des Portals benötigt.|true|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

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
Er kann aber auch ein Objekt sein. Erfolgt der Eintrag als Objekt, so kann eine Umbennung der zu filternden Attribute vorgenommen werden. Der Schlüssel muss dabei der originale Attributname sein. Der zugehörige Wert ist der alternative Name.

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

#### Portalconfig.menu.tool.compareFeatures

[inherits]: # (Portalconfig.menu.tool)

Hier können Vector Features miteinander verglichen werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|numberOfFeaturesToShow|nein|Integer|3|Anzahl der Features die maximal miteinander verglichen werden können.|false|
|numberOfAttributesToShow|nein|Integer|12|Anzahl der Attribute die angezeigt werden. Gibt es mehrere Attribute können diese über einen Button zusätzlich ein-/ bzw. ausgeblendet werden.|false|

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

Beispiel: **https://geodienste.hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0&&StoredQuery_ID=Flurstueck&gemarkung=0601&flurstuecksnummer=00011**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des Dienstes der abgefragt werden soll. Wird in der rest-services.json abgelegt.|false|
|storedQueryId|ja|String||Id der stored query die verwendet werden soll.|true|
|configJSON|ja|String||Pfad zur Konfigurationsdatei, die die Gemarkungen enthält. **[Beispiel](https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json)**.|false|
|parcelDenominator|nein|Boolean|false|Flag, ob Flurnummern auch zur Suche verwendet werden sollen. Besonderheit Hamburg: Hamburg besitzt als Stadtstaat keine Fluren.|false|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben.|false|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"parcelSearch": {
    "name": "Flurstückssuche",
    "glyphicon": "glyphicon-search",
    "serviceId": "6",
    "storedQueryID": "Flurstueck",
    "configJSON": "https://geodienste.hamburg.de/lgv-config/gemarkungen_hh.json",
    "parcelDenominator": false,
    "styleId": "flaecheninfo"
}
```

***

#### Portalconfig.menu.tool.saveSelection

[inherits]: # (Portalconfig.menu.tool)

Abspeicherung des aktuellen Karteninhalts.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|simpleMap|nein|Boolean|false|Fügt der Komponente eine SimpleMap-URL hinzu (ohne Menüleiste, Layerbau, Map Controls).|false|

***

#### Portalconfig.menu.tool.searchByCoord

[inherits]: # (Portalconfig.menu.tool)
Koordinatensuche.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomLevel|nein|Number|7|Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**
```
#!json
"searchByCoord": {
    "name": "Flurstückssuche",
    "glyphicon": "glyphicon-record",
    "zoomLevel": 7
}
```

***

#### Portalconfig.menu.tool.print

[inherits]: # (Portalconfig.menu.tool)

Druckmodul. Konfigurierbar für 2 Druckdienste: den High Resolution PlotService oder MapfishPrint 3. Das Drucken von Vector Tile Layern wird nicht unterstützt, da die Druckdienste es nicht unterstützen; falls der User versucht die Anzeige zu so einem Layer zu drucken, wird ihm eine Hinweismeldung dazu angezeigt.

**ACHTUNG: Backend notwendig!**

**Es wird mit einem [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc) oder einem HighResolutionPlotService im Backend kommuniziert.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|mapfishServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|currentLayoutName|nein|String|""|Legt fest, welches Layout als Standardwert beim Öffnen des Druckwerkzeuges ausgewählt sein soll. Zum Beispiel "A4 Hochformat". Wenn das angegebene Layout nicht vorhanden ist oder keins angegeben wurde, dann wird das erste Layout der Capabilities verwendet.|false|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat.|false|
|filename|nein|String|"report"|Dateiname des Druckergebnisses.|false|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|false|
|version|nein|String||Flag welcher Druckdienst verwendet werden soll. Bei "HighResolutionPlotService" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 3 verwendet.|false|
|isLegendSelected|nein|Boolean|false|Gibt an, ob die Checkbox, zum Legende mitdrucken, aktiviert sein soll. Wird nur angezeigt wenn der Druckdienst (Mapfish Print 3) das Drucken der Legende unterstützt.|false|
|legendText|nein|String|"Mit Legende"|Beschreibender Text für die printLegend-Checkbox.|false|
|dpiForPdf|nein|Number|200|Auflösung der Karte im PDF.|false|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

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
    "title": "Mein Titel"
}
```

***

#### Portalconfig.menu.tool.draw

[inherits]: # (Portalconfig.menu.tool)

Modul für das Zeichnen von Features auf der Karte. Dies beinhaltet Punkte, welche auch als Symbole dargestellt werden können, (Doppel-)Kreise, Polygone, Polyline und Text.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeugs im Menü.|false|
|iconList|nein|**[icon](#markdown-header-portalconfigmenutooldrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 0.5, "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}]|Liste an Symbolen, aus welcher ein Nutzer die Auswahl für das Zeichnen eines farbigen Punktes oder eines Symbols hat. Es können wie im Beispiel eigene Bild-Dateien verwendet werden.|false|
|drawSymbolSettings|nein|**[drawSymbolSet](#markdown-header-portalconfigmenutooldrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Zeichnen von Symbolen.|false|
|drawLineSettings|nein|**[drawLineSet](#markdown-header-portalconfigmenutooldrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Linien.|false|
|drawCurveSettings|nein|**[drawCurveSet](#markdown-header-portalconfigmenutooldrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Freihand-Linien.|false|
|drawAreaSettings|nein|**[drawAreaSet](#markdown-header-portalconfigmenutooldrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Flächen.|false|
|drawCircleSettings|nein|**[drawCircleSet](#markdown-header-portalconfigmenutooldrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Voreinstellung für das Zeichnen von Kreisen.|false|
|drawDoubleCircleSettings|nein|**[drawDoubleCircleSet](#markdown-header-portalconfigmenutooldrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Doppel-Kreisen.|false|
|writeTextSettings|nein|**[writeTextSet](#markdown-header-portalconfigmenutooldrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Schreiben von Texten.|false|
|download|nein|**[download](#markdown-header-portalconfigmenutooldrawdownload)**|{"preSelectedFormat": "KML"}|Einstellungen für das Herunterladen der Zeichnung.|false|

**Beispiel**

```
#!json
"draw": {
    "name": "Zeichnen / Schreiben",
    "glyphicon": "glyphicon-pencil",
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "wiese.png"
        },
        {
            "id": "gelber Pin",
            "type": "image",
            "scale": 0.5,
            "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
        }
    ],
    "drawDoubleCircleSettings": {
        "circleRadius": 1500,
        "circleOuterRadius": 3000,
        "strokeWidth": 3,
        "color": [55, 126, 184, 0],
        "opacity": 0,
        "colorContour": [228, 26, 28, 1],
        "opacityContour": 1,
        "tooltipStyle": {
            "fontSize": "14px",
            "paddingTop": "3px",
            "paddingLeft": "3px",
            "paddingRight": "3px",
            "backgroundColor": "rgba(255, 255, 255, .9)"
        }
    }
}
```

***

#### Portalconfig.menu.tool.draw.icon

Punkt Objekt, bestehend aus der Beschriftung, dem Typ und dem Wert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Diese muss in der Sprachdatei (meistens `common`) angelegt werden unter dem Punkt `modules.tools.draw.iconList`, wobei der darauffolgende Parameter standardmäßig mit `icon` beginnen und eine repräsentative Beschreibung darstellen sollte. Wird dieser Schlüssel in der Übersetzungesdatei nicht gefunden, dann wird die `id` in der Oberfläche angezeigt.|false|
|caption|nein|String||Deprecated in 3.0.0 Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Ggü. der id muss hier nicht die id aus der Sprachdatei sondern der gesamte Pfad (`modules.tools.draw.iconList` + id) angegeben werden.|false|
|type|ja|enum["image", "simple_point"]||Typ des zu zeichnenden Objektes.Bei `image` wird ein Bild gezeichnet, welches dem PNG-Bild oder der svg-Datei des Pfades aus `value` entspricht. Diese Bilder werden standardmäßig im Verzeichnis `/img/tools/draw/` abgelegt und sollten eine Seitenlänge von 96px für eine korrekte Skalierung aufweisen, alternativ kann ein scale-Faktor angegeben werden. Bei `simple_point` wird ein normaler Punkt gezeichnet.|false|
|scale|nein|number||Skalierungsfaktor|false|
|value|ja|String||Wert, des zu zeichnenden Objektes. Wenn ohne Pfad oder Url, dann wird der Eintrag aus der config.js - `wfsImgPath` als Dateiort angenommen.|false|

**Beispiele**

```
#!json
    {
        "id": "iconPoint",
        "type": "simple_point",
        "value": "simple_point"
    },
    {
        "id": "iconMeadow",
        "type": "image",
        "scale": 0.8,
        "value": "wiese.png"
    },
    {
        "id": "gelber Pin",
        "type": "image",
        "scale": 0.5,
        "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
    },
```

***


#### Portalconfig.menu.tool.draw.drawSymbolSet

Objekt zum Ändern des konfigurierten Default-Wertes des Punkt-Symbols im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Symbols als RGB color array mit Alpha-Kanal, wenn es sich um einen Punkt handelt.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Symbols in einer Range [0..1], wenn es sich um einen Punkt handelt.|false|


**Beispiel**

```
#!json
    {
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawLineSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Linie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Linie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Linie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Linie in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

#### Portalconfig.menu.tool.draw.drawCurveSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Freihandlinie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Freihandlinie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Freihandlinie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Freihandlinie in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

#### Portalconfig.menu.tool.draw.drawAreaSet

Objekt zum Ändern des konfigurierten Default-Wertes für eine Fläche im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes der Fläche in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe der Fläche in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawCircleSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Kreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"interactive"|Die voreingestellte Methode wie der Kreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Kreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des Kreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Kreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Kreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Kreises in einer Range [0..1].|false|
|tooltipStyle|no|String|{}|Die voreingestellte Style des Tooltips|false|

**Beispiel**

```
#!json
    {
        circleMethod: "interactive",
        unit: "m",
        circleRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.drawDoubleCircleSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Doppelkreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"defined"|Die voreingestellte Methode wie der Doppelkreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Doppelkreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des inneren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|circleOuterRadius|ja|Number|0|Der voreingestellte Durchmesser des äußeren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Doppelkreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Doppelkreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte innere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|outerColorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte äußere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Doppelkreises in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        circleMethod: "defined",
        unit: "m",
        circleRadius: 0,
        circleOuterRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

#### Portalconfig.menu.tool.draw.writeTextSet

Objekt zum Ändern des konfigurierten Default-Wertes für einen Text im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|text|ja|String|""|Der voreingestellte Text.|false|
|fontSize|ja|Number|10|Die voreingestellte Schriftgröße.|false|
|font|ja|String|"Arial"|Die voreingestellte Schriftart (beschränkt auf "Arial", "Calibri" oder "Times New Roman").|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|

**Beispiel**

```
#!json
    {
        text: "",
        fontSize: 10,
        font: "Arial",
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

#### Portalconfig.menu.tool.draw.download

Objekt zum Ändern des voreingestellten Formats beim Herunterladen einer Zeichnung. Das ist eins von "KML", "GPX", "GEOJSON".

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|preSelectedFormat|nein|String|"KML"|Die voreingestellte pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

***

#### Portalconfig.menu.tool.featureLister

[inherits]: # (Portalconfig.menu.tool)

Modul, das Vektor Features darstellt. Durch Hovern über ein Feature in der Liste wird auf der Karte der Marker gesetzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere Features in dieser Anzahl zugeladen werden.|false|

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

Die linienhafte Darstellung der Pendler wird für das Pendlerportal der MRH(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den **[pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)**

**Beispiel**
```
#!json
"animation": {
    "name": "Pendler (Animation)",
    "glyphicon": "glyphicon-play-circle",
    "url": "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
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

#### Portalconfig.menu.tool.measure

[inherits]: # (Portalconfig.menu.tool)

Mit dem Messwerkzeug können Strecken und Flächen gemessen werden. Dabei werden auch die Messungenauigkeiten mit angegeben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|earthRadius|nein|Number|6378137|Erdradius in Metern. Bitte beachten Sie, dass der Erdradius in Abhängigkeit zum Bezugsellipsoiden gewählt werden sollte. Für ETRS89 (EPSG:25832) ist dies beispielsweise GRS80.|false|

**Beispiel**

```
#!json
"measure": {
    "name": "translate#common:menu.tools.measure",
    "earthRadius": 6378137
},
```

***
#### Portalconfig.menu.tool.animation

[inherits]: # (Portalconfig.menu.tool.pendlerCore)

Die Pendleranimation wird für das Pendlerportal der MRH(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den **[pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|steps|nein|Integer|50|Anzahl der Schritte, die in der Animation durchgeführt werden sollen.|false|
|minPx|nein|Integer|5|Minimalgröße der Kreisdarstellung der Pendler.|false|
|maxPx|nein|Integer|20|Maximalgröße der Kreisdarstellung der Pendler.|false|
|colors|nein|String[]|[]|Anzahl der Farben im RGBA-Muster ("rgba(255,0,0,1)").|false|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel**
```
#!json
"animation": {
    "name": "Pendler (Animation)",
    "glyphicon": "glyphicon-play-circle",
    "steps": 30,
    "url": "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
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

Der PendlerCore ist die Kernkomponente der Werkzeuge "Lines" und "Animation". Seine Eigenschaften werden überschrieben durch **[lines](#markdown-header-portalconfigmenutoollines)** und **[animation](#markdown-header-portalconfigmenutoolanimation)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|zoomLevel|nein|Integer|1|Zoomstufe auf die gezoomt wird bei Auswahl einer Gemeinde.|false|
|url|nein|String|"https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung"|URL des WFS Dienstes der abgefragt werden soll.|false|
|params|nein|**[param](#markdown-header-portalconfigmenutoolpendlercoreparam)**||Parameter mit denen der Dienst abgefragt werden soll.|false|
|featureType|nein|String|"mrh_einpendler_gemeinde"|FeatureType (Layer) des WFS Dienstes.|false|
|attrAnzahl|nein|String|"anzahl_einpendler"|Attribut das die Anzahl der Pendler pro Gemeinde enthält.|false|
|attrGemeinde|nein|String|"wohnort"|Attribut das die Gemeinde enthält.|false|

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

Werkzeug, wodurch der Nutzer/die Nutzerin mit einem definierten Postfach Kontakt aufnehmen kann.

**ACHTUNG: Backend notwendig!**

**Das Contact kommuniziert mit einem SMTP-Server und ruft dort die sendmail.php auf.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|serviceId|ja|String||Id des E-Mail-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](rest-services.json.md)** bezogen.|false|
|serviceID|nein|String||_Deprecated im nächsten Major Release. Bitte nutzen Sie stattdessen **serviceId**._ Id des E-Mail-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](rest-services.json.md)** bezogen.|false|
|from|ja|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Absender der E-Mail. Bitte den **[Hinweis zur E-Mail-Sicherheit](#markdown-header-hinweis-zur-e-mail-sicherheit)** beachten.|false|
|to|ja|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]||Adressat der E-Mail. Bitte den **[Hinweis zur E-Mail-Sicherheit](#markdown-header-hinweis-zur-e-mail-sicherheit)** beachten.|false|
|closeAfterSend|nein|Boolean|false|Flag, ob das Kontaktfenster nach erfolgreichem Versenden einer Nachricht geschlossen werden soll.|false|
|contactInfo|nein|String||Weitere Informationen, welche oberhalb des Kontaktformulars angezeigt werden würden.|false|
|deleteAfterSend|nein|Boolean|false|Flag, ob der Inhalt des Kontaktfensters nach erfolgreichem Versenden der Nachricht gelöscht werden soll.|false|
|includeSystemInfo|nein|Boolean|false|Flag, ob Systeminformationen des Absenders mitgeschickt werden sollen.|false|
|locationOfCustomerService|nein|String|"de"|Land, in welchem sich der Kundensupport befindet. Wird verwendet für das Datum innerhalb der ticketId.|false|
|maxLines|nein|Number|5|Anzahl der Zeilen (Höhe) des Textbereiches des Formulars.|false|
|showPrivacyPolicy|nein|Boolean|false|Flag, ob eine Checkbox angezeigt werden soll, um der Datenschutzerklärung zuzustimmen.|false|
|privacyPolicyLink|no|String|"https://www.masterportal.org/datenschutz.html"|Link zur Datenschutzerklärung. Sollte gesetzt werden, wenn `showPrivacyPolicy` true ist.|false|
|subject|nein|String||Der Betreff, welcher für die E-Mail verwendet wird.|false|
|withTicketNo|nein|Boolean|true|Flag, ob bei erfolgreichem Versand der Anfrage eine Ticketnummer zurückgegeben werden soll.|false|

**Beispiel**

```json
{
    "contact": {
        "name": "common:menu.contact",
        "glyphicon": "glyphicon-envelope",
        "serviceId": "123",
        "from": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
            }
        ],
        "to": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
            }
        ],
        "includeSystemInfo": true,
        "closeAfterSend": true,
        "deleteAfterSend": true,
        "withTicketNo": false
    }
}
```

>Hinweis zur E-Mail-Sicherheit

Von der ungeprüften Übernahme von *Sender (FROM)*, *Empfänger (TO)*, *Kopie (CC)* und *Blindkopie (BCC)* durch den SMTP-Server wird hiermit aus Sicherheitsgründen **ausdrücklich abgeraten**.
Vor der ungeprüften Übernahme durch den SMTP-Server der Kunden-Email als *Antwort an* (REPLY-TO) wird gewarnt.

Wir empfehlen dringend *FROM* und *TO* am SMTP-Server manuell fest einzustellen, ohne eine Möglichkeit zur externen Konfiguration anzubieten.

>Aus Sicherheitsgründen darf der vom Masterportal an den SMTP-Server geschickte *Sender (FROM)* und der *Empfänger (TO)* nicht ungeprüft vom SMTP-Server als FROM und TO für die Email verwendet werden. Ansonsten entsteht eine Lücke über die Schad-Mails mit manipuliertem FROM und TO über den SMTP-Server versendet werden. Sollte dennoch eine Konfiguration im Masterportal gewünscht sein (siehe Beispiel oben), können die Parameter *from* und *to* unter dem Vorbehalt verwendet werden, dass *from* und *to* am SMTP-Server gegen eine **Whitelist** mit erlaubten Email-Adressen geprüft und das Versenden einer Email im Falle der Angabe inkorrekter Email-Adressen unterbunden wird.

Wir empfehlen auf das automatische Setzen in *CC* (bzw. *BCC*) der Email-Adresse des Kunden zu verzichten.

>Aus Sicherheitsgründen darf der Kunde nicht automatisch als *Kopie (CC)* oder *Blindkopie (BCC)* der Email gesetzt werden. Ein solcher Automatismus wird missbraucht um durch Angabe einer Fremd-Email-Adresse Schad-Mails über den SMTP-Server zu versenden.

Wir empfehlen dringend *CC* und *BCC* am SMTP-Server manuell zu nullen.

>Es darf keine Möglichkeit geben *Kopie (CC)* oder *Blindkopie (BCC)* über das Masterportal einzustellen. Ein solches Feature wird zum Versenden von Schad-Mails über den SMTP-Server missbraucht.

Wir warnen vor der automatischen Einstellung der Kunden-Mail als *REPLY-TO*.

>Die ungeprüfte Übernahme von Daten in den Email-Header ist je nach Sicherheitsstand (bzw. Alter) des SMTP-Servers mit dem Risiko verbunden, dass im einfachsten Fall durch Injektion von *Carriage Return* und *Line Feed* in z.B. *REPLY-TO* aus der Email-Header-Zeile ausgebrochen und der Email-Header selbst manipuliert wird (Beispiel: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In einem abstrakteren Fall sind auch UTF-Attacken denkbar, bei der eigentlich harmlose UTF-16- oder UTF-32-Zeichen durch Interpretation als ANSI oder UTF-8 zu Verhaltensänderungen des Email-Headers mit einem ähnlichen Ergebnis führen.

***

#### Portalconfig.menu.tool.contact.email

E-Mail Objekt bestehend aus der E-Mail und dem Anzeigenamen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|email|nein|String||Email.|false|
|name|nein|String||Anzeigename.|false|

**Beispiel**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerSlider

[inherits]: # (Portalconfig.menu.tool)

Der Layerslider ist ein Werkzeug um verschiedene Layer in der Anwendung hintereinander an bzw. auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Titel der im Werkzeug vorkommt.|false|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|false|
|layerIds|ja|**[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)**[]|[]|Array von Objekten aus denen die Layerinformationen herangezogen werden.|false|
|sliderType|nein|enum["player","handle"]|"player"|Typ des Layer sliders. Entweder als "player" mit Start/Pause/Stop-Buttons oder als "handle" mit einem Hebel. Bei "handle" wird die Transparenz der Layer zusätzlich mit angepasst.|false|

**Beispiel**
```
#!json
"layerSlider": {
    "name": "Zeitreihe",
    "glyphicon": "glyphicon-film",
    "title": "Simulation von Beispiel-WMS",
    "sliderType": "player",
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

#### Portalconfig.menu.tool.layerSlider.layerId

Definiert einen Layer für den Layerslider.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Name des Diestes, wie er im Portal angezeigt werden soll.|false|
|layerId|ja|String||Id des Diestes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|false|

**Beispiel**
```
#!json
{
    "title": "Dienst 1",
    "layerId": "123"
}
```

***

#### Portalconfig.menu.tool.virtualcity

[inherits]: # (Portalconfig.menu.tool)

Das virtualcity Tool bietet die Möglichkeit die Planungen von einem virtualcityPLANNER Dienst im Masterportal anzuzeigen.
Die Planungen müssen im virtualcityPLANNER auf öffentlich gesetzt sein, dann können sie über dieses Tool angezeigt werden.


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceId|ja|String||Id des services. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

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
|shadowTime|nein|**[shadowTime](#markdown-header-portalconfigmenutoolshadowshadowtime)**||Default-Zeitangabe, mit der das ShadowTool startet. Erkennt "month", "day", "hour", "minute"|
|isShadowEnabled|nein|Boolean|false|Default Shadow-Wert. True um unmittelbar Shadow einzuschalten. False zum manuellen Bestätigen.|


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

#### Portalconfig.menu.tool.shadow.shadowTime

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|month|nein|String||month|
|day|nein|String||day|
|hour|nein|String||hour|
|minute|nein|String||minute|

**Beispiel**
```
#!json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

#### Portalconfig.menu.tool.styleWMS

[inherits]: # (Portalconfig.menu.tool)

Klassifizierung von WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Request wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

***

#### Portalconfig.menu.tool.wfst

[inherits]: # (Portalconfig.menu.tool)

Das WFS-T Tool bietet die Möglichkeit Features aus Web Feature Services (WFS) in der Oberfläche sowohl zu visualisieren (Get Feature), zu aktualisieren (update) und zu löschen (delete), als auch die Möglichkeit neue Features hizuzufügen (insert).
Zur Vorbereitung muss ein WFS-T Service bereitgestellt werden (siehe services.json.de.md).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name dieses Tools, wie er im Portal angezeigt werden soll.|
|layerIds|ja|String[]||Array von Layer IDs.|false|
|toggleLayer|nein|Boolean|false|Flag ob die Features eines Layers beim Hinzufügen eines neuen Features sichtbar bleiben.|
|layerSelect|nein|String|"aktueller Layer:"|Möglichkeit die Beschriftung der Layer Auswahl zu konfigurieren.|
|pointButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen eines Punktes zur Verfügung steht und welche Beschriftung der Button haben soll.|
|lineButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen einer Linie zur Verfügung steht und welche Beschriftung der Button haben soll.|
|areaButton|nein|[Button](#markdown-header-portalconfigmenutoolwfstbutton)[]|false|Möglichkeit zu konfigurieren, für welchen Layer die Funktion zum Erfassen einer Fläche zur Verfügung steht und welche Beschriftung der Button haben soll.|
|edit|nein|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Möglichkeit zu konfigurieren, ob der edit Button angezeigt wird und mit wekcher Beschriftung er angezeigt wird.|
|delete|nein|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Möglichkeit zu konfigurieren, ob der delete Button angezeigt wird und mit welcher Beschriftung er angezeigt wird.|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel**
```
#!json
{
    "wfst": {
        "name": "WFS-T Tool",
        "glyphicon": "glyphicon-globe",
        "layerIds": ["1234", "5678"],
        "toggleLayer": true,
        "layerSelect": "TestLayer",
        "pointButton": [
            {
                "layerId":"1234",
                "caption": "Punkt-Test",
                "show": true
            },
            {
                "layerId": "5678",
                "show": true
            }
        ],
        "lineButton": false,
        "areaButton": [
            {
                "layerId": "4389",
                "show": false
            }
        ],
        "edit": "Bearbeiten",
        "delete": true
    }
}
```
#### Portalconfig.menu.tool.wfst.Button
Das Attribut pointButton/lineButton/areaButton kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob die Funktion zum Erfassen einer Geometrie für alle Layer zur Verfügung stehen soll. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Der Layer für den die Konfiguration vorgenommen werden soll|false|
|show|ja|Boolean|true|Flag ob der Button zur Verfügung stehen soll.|false|
|caption|nein|String|"Erfassen"|Beschriftung des Buttons. Der Default-Wert wird im Admintool genutzt. Falls hier kein Wert gegeben wird, benutzt das Masterportal je nach Umstand "Punkt erfassen", "Linie erfassen", oder "Fläche erfassen".|false|


**Beispiel als Boolean**

```json
{
    "pointButton": true
}
```

**Beispiel als Object**

```json
{
    "layerId": "1234",
    "show": true,
    "caption": "Punkt-Test"
}
```

```json
{
    "layerId": "5678",
    "show": true
}
```

```json
{
    "layerId": "5489",
    "show": false
}
```

***

#### Portalconfig.menu.tool.wfst.EditDelete
Das Attribut edit / delete kann vom Typ Boolean oder String sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob der Editier-/ Lösch-Button zur Verfügung stehen soll. Ist es vom Typ String so wird der Button mit der dort angegebenen Beschriftung angezeigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|edit|ja|Boolean|true|Flag ob der Editier-Button angezeigt werden soll|false|
|edit|ja|String|"Geometrie bearbeiten"|Beschriftung des Editier-Buttons|false|
|delete|ja|Boolean|true|Flag ob der Lösch-Button angezeigt werden soll|false|
|delete|ja|String|"Geometrie löschen"|Beschriftung des lösch-Buttons|false|

**Beispiel als Boolean**
```
#!json
"edit": true
```

**Beispiel als String**
```
#!json
"edit": "Editieren"
```


***

### Portalconfig.menu.staticlinks
Das Array staticlink beinhaltet Objekte die entweder als Link zu einer anderen Webresource dienen oder als Trigger eines zu definierenden Events.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|staticlinks|nein|**[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)**[]||Array von Statischen links.|false|


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
Ein Staticlink-Objekt enthält folgende Attribute.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des staticLink-Objekts im Menü.|false|
|glyphicon|nein|String|"glyphicon-globe"|CSS Klasse des Glyphicons, das vor dem staticLink-Objekt im Menü angezeigt wird.|false|
|url|nein|String||URL welche in einem neuen Tab angezeigt werden soll.|false|
|onClickTrigger|nein|**[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)**[]||Array von OnClickTrigger events.|false|

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
Über einen onClickTrigger wird ein Event getriggert und eventuell Daten mitgeschickt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|channel|ja|String||Name des Radio channels.|false|
|event|ja|String||Event des Radio channels das getriggered werden soll.|false|
|data|nein|String/Boolean/Number||Daten die mitgeschickt werden sollen.|false|

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
Die Themenconfig definiert, welche Inhalte an welcher Stelle im Themenbaum vorkommen. Je nach Konfiguration des treeType können auch Ordner Strukturen in den [Fachdaten](#markdown-header-themenconfigfachdaten) angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Hintergrundkarten|ja|**[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)**||Definition der Hintergrundkarten.|false|
|Fachdaten|nein|**[Fachdaten](#markdown-header-themenconfigfachdaten)**||Definition der Fachdaten.|false|
|Fachdaten_3D|nein|**[Fachdaten_3D](#markdown-header-themenconfigfachdaten_3d)**||Definition der Fachdaten für den 3D-Modus.|false|

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
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|

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
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|
|Ordner|nein|**[Ordner](#markdown-header-themenconfigordner)**[]||Definition der Ordner.|false|

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
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**[]||Definition der 3DLayer.|false|

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
|Layer|ja|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Definition der Layer.|false|
|Ordner|nein|**[Ordner](#markdown-header-themenconfigordner)**[]||Definition der Ordner.|false|
|isFolderSelectable|nein|Boolean|true|Legt fest, ob alle Layer eines Ordners auf einmal über einen Haken aktiviert bzw. deaktiviert werden dürfen.|false|
|invertLayerOrder|nein|Boolean|false|Legt fest, ob bei Klick auf den Ordner die Reihenfolge, in der die Layer der Map hinzugefügt werden, umgekehrt werden soll.|false|

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

**Beispiel Ordner mit einem Unterordner in dem ein Layer konfiguriert ist**
```
#!json
"Fachdaten": {
    "Ordner": [
        {
            "Titel": "Mein erster Ordner",
            "isFolderSelectable": true,
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

**Beispiel Ordner mit einem Unterordner. Auf der Ebene des Unterordners ist auch nochmal ein Layer definiert**
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

**Beispiel Ordner mit invertierter Layer-Reihenfolge**

In diesem Beispiel wird der Layer mit der Id 123 vor dem Layer 456 der Map hinzugefügt. Das führt dazu, dass Layer 123 unter Layer 456 dargestellt wird.

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "Mein Ordner",
                "invertLayerOrder": true,
                "Layer": [
                    {
                        "id": "123"
                    },
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```

***

### Themenconfig.GroupLayer

[type:Layer]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Hier werden die GruppenLayer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](services.json.de.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für **[WMS](#markdown-header-themenconfiglayerwms)** und **[Vector](#markdown-header-themenconfiglayervector)**.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der **[services.json](services.json.de.md)** werden die ids aufgelöst und die notwendigen Informationen herangezogen.|false|
|children|nein|**[Layer](#markdown-header-themenconfiglayer)**[]||Wird dieses Attribut verwendet, so wird ein Gruppenlayer erzeugt, der beliebig viele Layer beinhaltet. In diesem Fall ist eine einzigartige Id manuell zu wählen.|false|
|name|nein|String||Name des Layers.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an, in denen der Layer verwendet werden kann.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|false|
|layerAttribution|nein|String||Wert aus **[services.json](services.json.de.md)**. HTML String. Dieser wird angezeigt sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Deprecated, bitte "legend" verwenden.|false|
|legend|nein|Boolean/String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Maximaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Minimaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige, ob der Layer niemals im Themenbaum sichtbar ist.|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|

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
[type:Entity3D]: # (Themenconfig.Layer.Entity3D)
[type:WMS]: # (Themenconfig.Layer.WMS)

Hier werden die Layer definiert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](services.json.de.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für **[WMS](#markdown-header-themenconfiglayerwms)** und **[Vector](#markdown-header-themenconfiglayervector)**.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String/String[]||Id des Layers. In der **[services.json](services.json.de.md)** werden die ids aufgelöst und die notwendigen Informationen herangezogen. ACHTUNG: Hierbei ist wichtig, dass die angegebenen ids dieselbe URL ansprechen, also den selben Dienst benutzen. Bei Konfiguration eines Arrays von Ids ist die Angabe der minScale und maxScale in der services.json für jeden Layer notwendig.|false|
|name|nein|String||Name des Layers.|false|
|entities|ja|**[Entity3D](#markdown-header-themenconfiglayerentity3d)**[]||Modelle, die angezeigt werden sollen |false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers.|false|
|supported|nein|String[]|["2D", "3D"]|Gibt die Modi an, in denen der Layer verwendet werden kann.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers.|false|
|layerAttribution|nein|String||Wert aus **[services.json](services.json.de.md)**. HTML String. Dieser wird angezeigt, sobald der Layer aktiv ist.|false|
|legendURL|nein|String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Deprecated, bitte "legend" verwenden.|false|
|legend|nein|Boolean/String||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Maximaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|minScale|nein|String||Wert aus **[services.json](services.json.de.md)**. Minimaler Maßstab bei dem der Layer angezeigt werden soll.|false|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|isNeverVisibleInTree|nein|Boolean|false|Anzeige, ob der Layer niemals im Themenbaum sichtbar ist.|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|

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
|name|nein|String/String[]||Name des Layers. Falls das Attribute **styles** konfiguriert wird, muss dieses Attribute als Tpy String[] konfiguriert werden.|false|
|attributesToStyle|nein|String[]||Array von Attributen nach denen der WMS gestylt werden kann. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|false|
|featureCount|nein|Integer|1|Anzahl der Features, die bei einer GetFeatureInfo-Abfrage zurückgegeben werden sollen.|false|
|geomType|nein|String||Geometrietyp der Daten hinter dem WMS. Momentan wird nur "Polygon" unterstützt. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|false|
|styleable|nein|Boolean||Zeigt an, ob der Layer vom Werkzeug "styleWMS" verwendet werden kann. Wird benötigt vom Werkzeug "styleWMS" in **[tools](#markdown-header-portalconfigmenutools)**.|true|
|gfiAsNewWindow|nein|**[gfiAsNewWindow](#markdown-header-themenconfiglayerwmsgfiAsNewWindow)**|null|Wird nur berücksichtigt wenn infoFormat text/html ist.|true|
|styles|nein|String[]||Werden styles angegeben, so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|true|

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
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "attributesToStyle": ["MyFirstAttr"],
    "featureCount": 2,
    "geomType": "geometry",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styleable": true,
    "styles": ["firstStyle", "secondStyle"]
}
```

***

#### Themenconfig.Layer.WMS.gfiAsNewWindow

Der Parameter *gfiAsNewWindow* wird nur berücksichtigt wenn infoFormat text/html ist.

Mit dem Parameter *gfiAsNewWindow* lassen sich html-Inhalte Ihres WMS-Service einfach in einem eigenen Fenster oder Browser-Tab öffnen, anstatt in einem iFrame im GFI.
Um html-Inhalte in einem einfachen Standard-Fenster des Browsers zu öffnen, geben Sie für *gfiAsNewWindow* anstatt *null* ein leeres Objekt an.

Sie können nun das Verhalten des Öffnens durch den Parameter *name* beeinflussen:

**Hinweis zur SSL-Verschlüsselung**

Ist *gfiAsNewWindow* nicht bereits eingestellt, wird *gfiAsNewWindow* automatisch gesetzt (mit Standard-Einstellungen), wenn die aufzurufende Url nicht SSL-verschlüsselt ist (https).

Nicht SSL-verschlüsselter Inhalt kann im Masterportal aufgrund der *no mixed content*-policy moderner Browser nicht in einem iFrame dargestellt werden.

Bitte beachten Sie, dass automatische Weiterleitungen (z.B. per Javascript) im iFrame auf eine unsichere http-Verbindung (kein SSL) nicht automatisch erkannt und vom Browser ggf. unterbunden werden.

Stellen Sie in einem solchen Fall *gfiAsNewWindow* wie oben beschrieben manuell ein.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|enum["_blank_","_self_"]|"_blank"|Bei `"_blank"` öffnet sich ein neues Browser-Fenster oder ein neuer Browser-Tab (browserabhängig) mit dem html-Inhalt. Die Erscheinung des Fensters lässt sich mithilfe des Parameters *specs* beeinflussen. Bei `"_self"` öffnet sich der html-Inhalt im aktuellen Browser-Fenster.  |true|
|specs|nein|String||Beliebig viele der folgenden Einstellungen lassen sich durch durch Komma-Separation (z.B. {"specs": "width=800,height=700"}) kombinieren. Weitere Einstellungsmöglichkeiten entnehmen Sie bitte den einschlägigen Informationen zum Thema "javascript + window.open": [https://www.w3schools.com/jsref/met_win_open.asp](https://www.w3schools.com/jsref/met_win_open.asp) (deutsch), [https://javascript.info/popup-windows](https://javascript.info/popup-windows) (englisch), [https://developer.mozilla.org/en-US/docs/Web/API/Window/open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (englisch)|true|

Beispiel:
```
#!json
{
    "id": "123456",
    // (...)
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    },
    // (...)
}
```

***

#### Themenconfig.Layer.Tileset

[inherits]: # (Themenconfig.Layer)

Hier werden Tileset typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|hiddenFeatures|nein|String[]|[]|Liste mit IDs, die in der Ebene versteckt werden sollen|
|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**[]|no|**[cesium3DTilesetOption](#markdown-header-themenconfiglayertilesetcesium3dtilesetoption)**[]||Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.|

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

#### Themenconfig.Layer.Tileset.cesium3DTilesetOption

Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|maximumScreenSpaceError|nein|Number||Todo|

**Beispiel**
```
#!json
"cesium3DTilesetOptions" : {
    maximumScreenSpaceError : 6
}
```

***


#### Themenconfig.Layer.Terrain

[inherits]: # (Themenconfig.Layer)

Hier werden Terrain typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|no|**[cesiumTerrainProviderOption](#markdown-header-themenconfiglayerterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.|

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

#### Themenconfig.Layer.Terrain.cesiumTerrainProviderOption

Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|requestVertexNormals|nein|Boolean||Todo|

```
#!json
"cesiumTerrainProviderOptions": {
    "requestVertexNormals" : true
}
```

***

#### Themenconfig.Layer.Entity3D

Hier werden Entities3D typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|ja|String|""|URL zu dem Modell. Beispiel: `"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`|false|
|attributes|nein|**[Attribute](#markdown-header-themenconfiglayerentities3dattribute)**||Attribute für das Modell. Beispiel: `{"name": "test"}`|false|
|latitude|ja|Number||Breitengrad des Modell-Origins in Grad. Beispiel: `53.541831`|false|
|longitude|ja|Number||Längengrad des Modell-Origins in Grad. Beispiel: `9.917963`|false|
|height|nein|Number|0|Höhe des Modell-Origins. Beispiel: `10`|false|
|heading|nein|Number|0|Rotation des Modells in Grad. Beispiel: `0`|false|
|pitch|nein|Number|0|Neigung des Modells in Grad. Beispiel: `0`|false|
|roll|nein|Number|0|Roll des Modells in Grad. Beispiel: `0`|false|
|scale|nein|Number|1|Skalierung des Modells. Beispiel: `1`|false|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI). Beispiel: `true`|false|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein). Beispiel: `true`|false|


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

#### Themenconfig.Layer.Entity3D.Attribute

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|""|Todo|false|

**Beispiel**
```
#!json
{
   "name": "Fernsehturm.kmz"
}
```

***

#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Mit StaticImage lassen sich Bilder als Layer laden und georeferenziert auf der Karte darstellen. Es werden die Formate jpeg und png unterstützt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String|"Eineindeutige-ID7711"|Es muss eine eineindeutige ID vergeben werden.|false|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage, welcher statische Bilder als Layer darstellen kann.|false|
|url|ja|String|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild.|false|
|name|ja|String|"Static Image Name"|Setzt den Namen des Layers für den Layerbaum.|false|
|extent|ja|**[Extent](#markdown-header-datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet.|false|


**Beispiel**
```
#!json
{
    "id": "12345",
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

Hier werden Vector typische Attribute aufgelistet. Vector Layer sind WFS, GeoJSON (nur in EPSG:4326), [SensorLayer](sensorThings.de.md), und Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses Radius werden alle Features zu einem Feature "geclustered".|false|
|extendedFilter|nein|Boolean||Gibt an, ob dieser Layer vom Werkzeug "extendedFilter" in **[tools](#markdown-header-portalconfigmenutools)** verwendet werden kann.|false|
|filterOptions|nein|**[filterOption](#markdown-header-themenconfiglayervectorfilteroption)**[]||Filteroptionen die vom Werkzeug "wfsFeatureFilter" in **[tools](#markdown-header-portalconfigmenutools)** benötigt werden.|false|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|false|
|nearbyTitle|nein|String/String[]||Attributname oder Array von Attributnamen die bei der Umkreissuche in der Ergebnisliste als Titel angezeigt werden sollen.|false|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|false|
|additionalInfoField|nein|String|"name"|Attributname des Features für die Hitlist in der Searchbar. Ist das Attribut nicht vorhanden, wird der Layername angegeben.|false|
|styleId|nein|String||Id die den Style definiert. Id wird in der **[style.json](style.json.de.md)** aufgelöst.|false|
|styleGeometryType|nein|String/String[]||Geometrietypen für einen WFS-Style, falls nur bestimmte Geometrien eines Layers angezeigt werden sollen **[siehe dazu](style.json.md#markdown-header-abbildungsvorschriften)**.|false|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|false|
|vtStyles|nein|**[vtStyle](#markdown-header-themenconfiglayervectorvtstyle)**[]||Auswählbare externe Style-Definition (nur für Vector Tile Layer)|false|

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
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
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
    "nearbyTitle": "name",
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
    "legend" : true
}
```

***

#### Themenconfig.Layer.Vector.filterOption
Filteroption die vom Werkzeug "wfsFeatureFilter" in **[tools](#markdown-header-portalconfigmenutools)** benötigt wird.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fieldName|ja|String||Attributname nach dem zu filtern ist.|false|
|filterName|ja|String||Name des Filters im Werkzeug.|false|
|filterString|ja|String[]||Array von Attributwerten nach denen gefiltert werden kann. Bei "*" werden alle Wertausprägungen angezeigt.|false|
|filterType|ja|String||Typ des Filters. Momentan wird nur "combo" unterstützt.|false|

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

#### Themenconfig.Layer.Vector.vtStyle
Style-Definition; nur für Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||serviceübergreifend eindeutige ID|false|
|name|ja|String||Anzeigename, z.B. für das Auswahltool|false|
|url|ja|String||URL, von der der Style bezogen werden kann. Die verlinkte JSON muss zur [Mapbox Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/) passen.|false|
|defaultStyle|nein|String||Falls hier `true` gesetzt ist, wird der Style initial ausgewählt, unabhängig von seinem Index; wenn das Feld nirgends auf `true` gesetzt ist, wird der erste Style benutzt|false|

**Beispiel**
```
#!json
{
    "id": "EINDEUTIGE_ID",
    "name": "Rote Linien",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true
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

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent beschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Rechtswert-Links-Unten, Hochwert-Links-Unten, Rechtswert-Rechts-Oben, Hochwert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```
#!json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

## Datatypes.CustomObject

Ein Objekt mit den benötigten Inhalten.
Parameter können je nach Konfiguration, Verwendung und Backend-Komponenten unterschiedlich sein.

***
