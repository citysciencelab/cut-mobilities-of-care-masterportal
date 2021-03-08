>Zurück zur **[Dokumentation Masterportal](doc.de.md)**.

[TOC]

# services.json #
Die den Portalen zur Verfügung stehenden Dienste (WMS, WFS [SensorThings-API](sensorThings.de.md und Weitere)) bzw. deren Layer werden in einer JSON-Datei konfiguriert und gepflegt. Die Datei wird in der Datei *config.js*  der einzelnen Portale unter dem Parameter *layerConf* über ihren Pfad referenziert. Als Beispiel für eine solche Datei ist in *examples.zip* im Verzeichnis */examples/Basic/resources/*  *services-internet.json* vorhanden. Hier werden alle Informationen der Layer hinterlegt, die das Portal für die Nutzung der Dienste benötigt. Die Konfiguration unterscheidet sich leicht zwischen WMS, WFS, [SensorThings-API](sensorThings.de.md) und anderen Dienstetypen.
Es können auch lokale GeoJSON-Dateien in das Portal geladen werden (Siehe Beispiel GeoJSON).

***

## WMS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|cache|nein|Boolean||Ist dieser Layer Teil eines gecachten Dienstes? Wenn true wird bei Portalen, die in der **[config.json](config.json.de.md)** den „Baumtyp“ = „default“ benutzen, dieser Layer den Layern vorgezogen, die mit demselben Metadatensatz verknüpft sind, aber „cache“ = false haben. Bei anderen Baumtypen hat dieser Parameter keine Auswirkungen.|`false`|
|**[datasets](#markdown-header-wms_wfs_datasets)**|nein|Object/Boolean||Verknüpfung zu den Metadaten. Hier werden die Metadatensätze der Datensätze angegeben, die in diesem Layer dargestellt werden. Sie werden nach Click auf den „i“-Button des Layers in den Layerinformationen über die CSW-Schnittstelle angesprochen und dargestellt. Dazu muss in der **[rest-services.json](rest-services.json.de.md)** die URL des Metadatenkatalogs bzw. seiner CSW-Schnittstelle angegeben sein. Die Angaben unter *kategorie_opendata*, *kategorie_inspire* und *kategorie_organisation* werden verwandt, um die Layer in die entprechenden Kategorien einzuordnen, wenn in der **[config.json](config.json.de.md)** der Baumtyp *default* gesetzt ist. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|featureCount|ja|String||Anzahl der zurückzugebenden Features bei GFI-Abfragen. Entspricht dem *GetFeatureInfo-Parameter "FEATURE_COUNT"*|`"1"`|
|format|ja|String||Grafikformat der Kachel, die vom Portal über den *GetMap* aufgerufen wird. Muss einem der Werte aus den Capabilities unter *Capability/Request/GetMap/Format* entsprechen.|`"image/jpeg"`|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|gfiTheme|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|gutter|nein|String|"0"|Wert in Pixel, mit dem bei gekachelten Anfragen die Kacheln überlagert werden. Dient zur Vermeidung von abgeschnittenen Symbolen an Kachelgrenzen.|`"0"`|
|id|ja|String||Frei wählbare Layer-ID|`"8"`|
|infoFormat|nein|String|"text/xml"|Wert aus **[services.json](services.json.de.md)**. Format in dem die WMS-GetFeatureInfo ausgegeben werden soll. Die Formate: `"text/xml"`, `"text/html"` und `"application/vnd.ogc.gml"` werden unterstützt. Beim text/html Format wird die Antwort des Dienstes auf eine Tabelle überprüft und nur bei gefüllter Tabelle angezeigt.|`"text/xml"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|layers|ja|String||Layername im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *Layer/Layer/Name* entsprechen.|`"1"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|ja|String||Bis zu diesem Maßstab wird der Layer im Portal angezeigt|`"1000000"`|
|minScale|ja|String||Ab diesem Maßstab wird der Layer im Portal angezeigt|`"0"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Luftbilder DOP 10"`|
|singleTile|nein|Boolean||Soll die Grafik als eine große Kachel ausgeliefert werden? Wenn true wird immer der gesamte Kartenausschnitt angefragt, wenn false wird der Kartenausschnitt in kleineren Kacheln angefragt und zusammengesetzt.|`false`|
|tilesize|ja|String||Kachelgröße in Pixel. Diese wird verwandt wenn singleTile=false gesetzt ist.|`"512"`|
|transparent|ja|Boolean||Hintergrund der Kachel transparent oder nicht (false/true). Entspricht dem GetMap-Parameter *TRANSPARENT*|`true`|
|typ|ja|String||Diensttyp, in diesem Fall WMS (**[WMTS siehe unten](#markdown-header-wmts-layer)**, **[WFS siehe unten](#markdown-header-wfs-layer)** und **[SensorThings-API siehe unten](#markdown-header-sensor-layer)**)|`"WMS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WMS_DOP10"`|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Wird nur für die ABfrage des GFI verwendet. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|version|ja|String||Dienste Version, die über GetMap angesprochen wird.|`"1.3.0"`|
|isSecured|nein|Boolean|false|Anzeige ob der Layer zu einem abgesicherten Dienst gehört. (**[siehe unten](#markdown-header-wms-layerissecured)**)|false|
|authenticationUrl|nein|String||Zusätzliche Url, die aufgerufen wird um die basic Authentifizierung im Browser auszulösen.|"https://geodienste.hamburg.de/HH_WMS_DOP10?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetCapabilities"|

**Beispiel WMS:**

```json
{
      "id" : "8",
      "name" : "Luftbilder DOP 10",
      "url" : "https://geodienste.hamburg.de/HH_WMS_DOP10",
      "typ" : "WMS",
      "layers" : "1",
      "format" : "image/jpeg",
      "version" : "1.3.0",
      "singleTile" : false,
      "transparent" : true,
      "tilesize" : "512",
      "gutter" : "0",
      "minScale" : "0",
      "maxScale" : "1000000",
      "infoFormat": "text/html",
      "gfiAttributes" : "ignore",
      "gfiTheme" : "default",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "cache" : false,
      "featureCount" : "1",
      "isSecured": true,
      "authenticationUrl": "https://geodienste.hamburg.de/HH_WMS_DOP10?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetCapabilities",
      "datasets" : [
         {
            "md_id" : "25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "rs_id" : "HMDK/25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "md_name" : "Digitale Orthophotos 10cm - FHHNET",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Sonstiges"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Landesbetrieb Geoinformation und Vermessung"
         }
      ]
   }
```

***
## WMS-Layer.isSecured ##
WMS Layer der zu einem abgesicherte WMS Dienst gehört.

**ACHTUNG: Wenn der Layer zu einem abgesicherten Dienst gehört, müssen folgende Änderungen am Service vorgenommen werden!**

* Es müssen anhand des Referer zwei Header gesetzt werden.
* Die Konfiguration hierfür muss z.B. im Apache Webserver erfolgen.
* `Access-Control-Allow-Credentials: true`
* Dynamische Umschreibung des nachfolgenden HTTP Headers von: `Access-Control-Allow-Origin: *` nach `Access-Control-Allow-Origin: URL des zugreifenden Portals`

***

## WMTS-Layer ##

Es gibt zwei Wege, einen WMTS-Layer im Masterportal zu definieren:

A) Angabe aller nachfolgenden WMTS-Parameter
B) Nutzung der OpenLayers-optionsFromCapabilities-Methode (siehe Beispiel 2)

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|capabilitiesUrl|nein|String||Capabilities URL des WMTS-Dienstes|"https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml"|
|coordinateSystem|ja|String||Das Koordinatenreferenzsystem des Layers.|`"EPSG:3857"`|
|format|ja|String||Das Graphikformat der Kacheln des Layers. Wird nur benötigt, wenn der Parameter requestEncoding="KVP" ist.|`"image/png"`|
|id|ja|String||Frei wählbare Layer-ID|`"320"`|
|layers|ja|String||Name des Layers, welcher dem aus den WMTS Capabilities entsprechen muss.|`"geolandbasemap"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|maxScale|ja|String||Bis zu diesem Maßstab wird der Layer im Portal angezeigt|`"2500000"`|
|minScale|nein|String||Ab diesem Maßstab wird der Layer im Portal angezeigt|`"0"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Geoland Basemap"`|
|optionsFromCapabilities|nein|Boolean||Option zur Nutzung der getOptionsFromCapabilities Methode, um den WMTS-Layer zu definieren. Siehe nachfolgende Beispiele|true|
|origin|ja|Number[]||Der Ursprung des Kachelrasters. Dieser kann entweder den WMTS Capabilities entnommen werden oder entspricht meist der oberen linken Ecke des extents.|`[-20037508.3428, 20037508.3428]`|
|requestEncoding|ja|enum["KVP", "REST"]||Codierung der Anfrage an den WMTS Dienst.|`"REST"`|
|resLength|ja|String||Länge des resolutions und des matrixIds Arrays. Wird benötigt, um die maximale Zoom-Stufe des Layers einstellen zu können.|`"20"`|
|style|nein|String|"normal"|Name des Styles, welcher dem aus den WMTS Capabilities entsprechen muss.|`"normal"`|
|tileMatrixSet|ja|String||Set der Matrix, das für die Anfrage an den WMTS Dienst benötigt wird. Bei der optionsFromCapabilities-Variante, ist dieser Parameter nicht zwingend notwendig (es wird ein passendes TileMatrixSet gesucht).|`"google3857"`|
|tileSize|ja|String||Kachelgröße in Pixel.|`"256"`|
|transparent|ja|Boolean||Hintergrund der Kachel transparent oder nicht (false/true). Entspricht dem GetMap-Parameter *TRANSPARENT*|`false`|
|typ|ja|String||Diensttyp, in diesem Fall WMS (**[WMS siehe oben](#markdown-header-wms-layer)**, **[WFS siehe unten](#markdown-header-wfs-layer)** und **[SensorThings-API siehe unten](#markdown-header-sensor-layer)**)|`"WMTS"`|
|urls|ja|String[]/String||URLs des WMTS Dienstes. Wenn nur eine einzelne URL als String angegeben wird, dann wird diese intern zu einem Array verarbeitet.|`["https://maps1.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps2.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps3.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps4.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png", "https://maps.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"]`|
|version|ja|String||Dienste Version, die über GetMap angesprochen wird.|`"1.0.0"`|
|wrapX|nein|Boolean|false|Gibt an, ob die Welt horizontal gewrapped werden soll.|`true`|

**Beispiel 1 WMTS:**

```
#!json

{
   "id": "320",
   "name": "Geoland Basemap",
   "urls": [
      "https://maps1.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps2.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps3.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps4.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
      "https://maps.wien.gv.at/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
   ],
   "typ": "WMTS",
   "layer": "geolandbasemap",
   "version": "1.0.0",
   "format": "image/png",
   "style": "normal",
   "transparent": false,
   "tileSize": "256",
   "minScale": "0",
   "maxScale": "2500000",
   "tileMatrixSet": "google3857",
   "coordinateSystem": "EPSG:3857",
   "layerAttribution": "nicht vorhanden",
   "legend": false,
   "cache": true,
   "wrapX": true,
   "origin": [
      -20037508.3428,
      20037508.3428
   ],
   "resLength": "20",
   "requestEncoding": "REST"
}
```
**Beispiel 2 WMTS (optionsFromCapabilities Methode)**

```
{
  "id": "2020",
  "name": "EOC Basemap",
  "capabilitiesUrl": "https://tiles.geoservice.dlr.de/service/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
  "typ": "WMTS",
  "layers": "eoc:basemap",
  "optionsFromCapabilities": true
}

```
***

## WFS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|featureNS|ja|String||featureNamespace. Ist gewöhnlich im Header der WFS-Capabilities referenziert und löst den Namespace auf, der unter FeatureType/Name angegeben wird.|`"http://www.deegree.org/app"`|
|featureType|ja|String||featureType-Name im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *FeatureTypeList/FeatureType/Name* entsprechen. Allerdings ohne Namespace.|`"bab_vkl"`|
|featurePrefix|nein|String||Dient der eindeutigen Identifizierung eines FeatureTypes im Dienst.|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall WFS (**[WMS siehe oben](#markdown-header-wms-layer)**, **[WMTS siehe oben](#markdown-header-wmts-layer)** und **[SensorThings-API siehe unten](#markdown-header-sensor-layer)**)|`"WFS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"`|
|version|nein|String||Dienste Version, die über GetFeature angesprochen wird.|`"1.1.0"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|
|gfiTheme|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|isSecured|nein|Boolean|false|Anzeige ob der Layer zu einem abgesicherten Dienst gehört. (**[siehe unten](#markdown-header-wfs-layerissecured)**)|false|
|authenticationUrl|nein|String||Zusätzliche Url, die aufgerufen wird um die basic Authentifizierung im Browser auszulösen.|"https://geodienste.hamburg.de/HH_WMS_DOP10?SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType"|
**Beispiel WFS:**

```
#!json

{
      "id" : "44",
      "name" : "Verkehrslage auf Autobahnen",
      "url" : "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
      "typ" : "WFS",
      "featureType" : "bab_vkl",
      "format" : "image/png",
      "version" : "1.1.0",
      "featureNS" : "http://www.deegree.org/app",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : true,
      "isSecured": true,
      "authenticationUrl": "https://geodienste.hamburg.de/HH_WMS_DOP10?SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType",
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Verkehrslage auf Autobahnen (Schleifen) Hamburg",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Transport und Verkehr"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

**Beispiel WFS-T:**

```
#!json
{
    "id" : "1234",
    "name" : "WFSTLayer",
    "url" : "http://IP-Adresse/Beispiel/Pfad",
    "typ" : "WFS",
    "featureType" : "wfstBsp",
    "format" : "image/png",
    "version" : "1.1.0",
    "featureNS" : "http://beispiel.link.org/gmlsf",
    "featurePrefix" : "sf",
    "outputFormat" : "XML",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legend" : true,
    "datasets" : []
  }
```
***
## WFS-Layer.isSecured ##
WFS Layer der zu einem abgesicherte WFS Dienst gehört.

**ACHTUNG: Wenn der Layer zu einem abgesicherten Dienst gehört, müssen folgende Änderungen am Service vorgenommen werden!**

* Es müssen anhand des Referer zwei Header gesetzt werden.
* Die Konfiguration hierfür muss z.B. im Apache Webserver erfolgen.
* `Access-Control-Allow-Credentials: true`
* Dynamische Umschreibung des nachfolgenden HTTP Headers von: `Access-Control-Allow-Origin: *` nach `Access-Control-Allow-Origin: URL des zugreifenden Portals`

**ACHTUNG: Wenn es sich bei dem Layer auch um einen WFS-T Layer eines abgesicherten Dienstes handelt, dann muss zusätzlich folgende Änderung am Service vorgenommen werden!**

* Es muss anhand des Referer ein Header gesetzt werden.
* Die Konfiguration hierfür muss z.B. im Apache Webserver erfolgen.
* Wenn für diesen Header noch keine Einstellung vorgenommen wurde, dann muss der Header wie folgt gesetzt werden, damit es keine Auswirkungen auf andere Anfragen gibt: `Access-Control-Allow-Headers: Content-Type, *`
* Wenn für diesen Header schon Einstellungen vorgenommen wurden, dann muss der Header `Access-Control-Allow-Headers` mit folgendem Eintrag ergänzt werden: `Content-Type`

***


***
## Vector Tile Layer ##

[Diese Beschreibung](https://docs.mapbox.com/vector-tiles/specification/#what-the-spec-doesnt-cover) verdeutlicht, was VTL umfasst und was nicht.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|nein|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|epsg|nein|String|EPSG-Code des Portals|EPSG-String; wird zum Abgleich benutzt, bei Schiefstand wird jedoch nur eine Warnung ausgegeben. VTL sollten aus Performanzgründen serverseitig passend vorgehalten werden. Ist der Wert "EPSG:3857" und weder "extend", noch "origin", noch "resolutions", noch "tileSize" sind gesetzt, dann wird kein GridSet erzeugt. Der Ol-default wird verwendet.|`"EPSG:3857"`|
|extent|nein|Number[4]||Wird benötigt um das GridSet des VTC zu definieren. Ist dieser Parameter nicht angegeben, wird der Extent des Portal-EPSG verwendet.|`[902186.674876469653, 7054472.60470921732, 1161598.35425907862, 7175683.41171819717]`|
|origin|nein|Number[2]||Wird benötigt um das GridSet des VTC zu definieren. Ist dieser Parameter nicht angegeben, wird die obere linke Ecke des Extents verwendet.|`[-9497963.94293634221, 9997963.94293634221]`|
|origins|nein|Number[2][]||Wird benötigt um das GridSet des VTC zu definieren. Wird "origins" konfiguriert, so wird der Parameter "origin" ignoriert. Falls "origins" nicht konfiguriert wird, so wird "origin" benutzt|`[[239323.44497139292, 9336416.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9322080.0],[239323.44497139292, 9320288.0],[239323.44497139292, 9321005.0],[239323.44497139292, 9320646.0],[239323.44497139292, 9320467.0],[239323.44497139292, 9320288.0],[239323.44497139292, 9320109.0],[239323.44497139292, 9320145.0],[239323.44497139292, 9320109.0]]`|
|resolutions|nein|Number[]||Wird benötigt um das GridSet des VTC zu definieren. Ist dieser Parameter nicht angegeben, werden die Resolutions des Portals verwendet. Nur bei expliziter Angabe der Resolutions werden fehlende Zoomstufen extrapoliert. Daher dürfen nur Resolutions angeben werden, zu denen Kacheln existieren.|`[78271.5169640117238, 39135.7584820058619, 19567.8792410029309, 9783.93962050146547, 4891.96981025073273, 2445.98490512536637, 1222.99245256268318, 611.496226281341592, 305.7481131406708, 152.8740565703354, 76.437028285167699, 38.2185141425838495, 19.1092570712919247, 9.55462853564596237, 4.77731426782298119, 2.38865713391149059, 1.1943285669557453]`|
|tileSize|nein|Number|512|Wird benötigt um die Größe der VTC-Kachel zu definieren.|`256`|
|id|ja|String||Frei wählbare Layer-ID|`"41"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|transparency|nein|number|`0`|Initiale Layertransparenz von 0 bis 100 inklusive|`0`|
|visibility|nein|boolean|`false`|Ob Layer initial sichtbar ist|`true`|
|maxScale|ja|String||Bis zu diesem Maßstab wird der Layer im Portal angezeigt|`"1000000"`|
|minScale|nein|String||Ab diesem Maßstab wird der Layer im Portal angezeigt|`"0"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|vtStyles|nein|vtStyle[]||Siehe Beispiel und Definition in **[config.json](config.json.de.md)**. Beschreibt verfügbare Styles, aus denen mit dem Tool styleVT ausgewählt werden kann.|siehe Beispiel unten|
|typ|ja|String||Muss in diesem Fall "VectorTile" sein.|`"VectorTile"`|
|url|ja|String||Dienste URL|`"https://example.com/3857/tile/{z}/{y}/{x}.pbf"`|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|gfiTheme|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|


**Beispiel VectorTile:**

```
#!json

{
  "id": "UNIQUE_ID",
  "name": "Ein Vektortilelayername",
  "epsg": "EPSG:3857",
  "url": "https://example.com/3857/tile/{z}/{y}/{x}.pbf",
  "typ": "VectorTile",
  "transparency": 0,
  "visibility": true,
  "minScale": 4000,
  "maxScale": 200000,
  "legend": false,
  "gfiAttributes": "showAll",
  "gfiTheme": "default",
  "vtStyles": [
    {
      "id": "STYLE_1",
      "name": "Tagesansicht",
      "url": "https://example.com/3857/resources/styles/day.json",
      "defaultStyle": true
    },
    {
      "id": "STYLE_2",
      "name": "Nachtansicht",
      "url": "https://example.com/3857/resources/styles/night.json",
    }
  ]
}
```

***

## Sensor-Layer ##

Ein Feature kann mehrere Datastreams vorhalten. Im Portal wird für jeden Datastream die neueste Beobachtung als Attribut am Feature wie folgt eingetragen: "dataStream_[id]_[name]". id ist die @iot.id des Datastreams.
Der Name wird aus datastream.properties.type ausgelesen. Ist dieser parameter nicht verfügbar wird der Wert aus datastream.unitOfMeasurement.name verwendet.

Eine ausführliche Dokumentation der SensorThings-API befindet sich hier: [Dokumentation der SensorThings-API](sensorThings.de.md)

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|epsg|nein|String|"EPSG:4326"|Koordinatensystem der SensorThings-API|`"EPSG:4326"`|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|**[gfiTheme](#markdown-header-gfi_theme)**|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht default gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|id|ja|String||Frei wählbare Layer-ID|`"999999"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Elektro Ladestandorte"`|
|typ|ja|String||Diensttyp, in diesem Fall SensorThings-API (**[WMS siehe oben](#markdown-header-wms-layer)**, **[WMTS siehe oben](#markdown-header-wmts-layer)** und **[WFS siehe oben](#markdown-header-wfs-layer)**)|`"SensorThings"`|
|url|ja|String||Dienste URL die um "urlParameter" ergänzt werden kann |`"https://51.5.242.162/itsLGVhackathon"`|
|**[urlParameter](#markdown-header-url_parameter)**|nein|Object||Angabe von Query Options. Diese schränken die Abfrage der Sensordaten ein (z.B. durch "filter" oder "expand"). ||
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|
|version|nein|String|"1.1"|Dienste Version, die beim Anfordern der Daten angesprochen wird.|`"1.0"`|
|loadThingsOnlyInCurrentExtent|nein|Boolean|false|Gibt an ob Things ausschließlich im aktuellen Browser-Extent geladen werden sollen. Ändert sich der Extent, werden weitere Things nachgeladen.|`true`|
|showNoDataValue|nein|Boolean|true|Gibt an ob Datastreams ohne Observations angegeben werden sollen.|`true`|
|noDataValue|nein|String|"no data"|Platzhalter für nciht vorhandenen Observations der Datastreams.|`"Keine Daten"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|
|timezone|nein|String|Europe/Berlin|Name einer Moment-Timezone zur Umrechnung der PhaenomenonTime des Sensors (von UTC) in die Zeitzone des Client.|[Gültige Timezones laut Docs](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)|
|***[mqttOptions](#markdown-header-mqtt_options)**|nein|Object||Konfiuration der Websocket-Verbindung für mqtt||
**Beispiel Sensor:**
|mqttRh|nein|Number|2|Diese Option gibt an, ob beim Einrichten des Abonnements retained messages gesendet werden. Für weitere Informationen siehe **[SensorThings](sensorThings.de.md)**|0|
|mqttQos|nein|Number|2|Quality of service subscription level. Für weitere Informationen siehe **[SensorThings](sensorThings.de.md)**|0|


```
#!json

   {
      "id" : "999999",
      "name" : "Live - Elektro Ladestandorte",
      "typ" : "SensorThings",
      "version" : "1.0",
      "url" : "https://51.5.242.162/itsLGVhackathon",
      "urlParameter" : {
         "filter" : "startswith(Things/name,'Charging')",
         "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"
      },
      "epsg": "EPSG:4326",
      "gfiTheme" : "default",
      "gfiAttributes" : {
         "phenomenonTime" : "Letze Zustandsänderung",
         "state" : "Zustand",
         "plug" : "Stecker",
         "type" : "Typ",
         "dataStreamId" : "DataStreamID"
      }
   }
```
## mqtt_options ##

Anhand der mqttOptions kann das Ziel für die Websocket-Verbindung für mqtt definiert werden. Wird hier nichts angegeben so wird veruscht die Parameter aus der Server-URL zu extrahieren.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|host|nein|String||Adresse des Hosts|`"example.com"`|
|port|nein|String||Port am Host|`"9876"`|
|path|nein|String||Pfad|`"/mqtt"`|
|protocol|nein|String||Verwendetes Protokol|`"ws"`, `"wss"`|

## url_Parameter ##

Über die UrlParameter können die daten aus der SensorThingsAPI gefiltert werden.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|filter|nein|String||Koordinatensystem der SensorThings-API|`"startswith(Things/name,'Charging')"`|
|expand|nein|String/Array||Koordinatensystem der SensorThings-API|`"Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"`|
|root|nein|String|"Things"|Das Wurzelelement in der URL, auf dem die Query angewendet wird. Möglich sind `"Things"` oder `"Datastreams"`|"Datastreams"|

**Beispiel urlParameter: Zeige alle Things deren Name mit 'Charging' beginnt und alle zugehörigen Datastreams. Zeige auch von jedem Datastream die neueste Observation**

```
#!json

   {
      "urlParameter" : {
         "filter" : "startswith(Things/name,'Charging')",
         "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)",
         "root": "Datastreams"
      }
   }
```
**Beispiel urlParameter: Zeige alle Things deren Name mit 'Charging' beginnt und alle zugehörigen Datastreams die im Namen 'Lastenrad' enthalten. Zeige auch von jedem Datastream die neueste Observation und das Phänomen (ObservedProperty), das beobachtet wird. Wenn vorhanden wird die ObservedProperty für die dynamische Attributerstellung verwendet.**

```
#!json

   {
      "urlParameter": {
			"filter": "startswith(Things/name,'Charging')",
			"expand": [
				"Locations",
				"Datastreams($filter=indexof(Datastream/name,'Lastenrad') ge 1)",
				"Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)",
            "Datastreams/ObservedProperty"
			]
		}
   }
```

***

## WMS_WFS_datasets ##

Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter *kategorie..* werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|md_id|nein|String||Metadatensatz-Identifier des Metadatensatzes|
|rs_id|nein|String||Ressource-Identifier des Metadatensatzes|
|md_name|nein|String||Name des Datensatzes|
|bbox|nein|String||Ausdehnung des Datensatzes|
|kategorie_opendata|nein|String||Opendata-Kategorie aus der Codeliste von govdata.de|
|kategorie_inspire|nein|String||Inspire-Kategorie aus der Inspire-Codeliste wenn vorhanden, wenn nicht vorhanden *„nicht Inspire-identifiziert“*|
|kategorie_organisation|nein|String||Organisationsname der datenhaltenden Stelle|

***

## gfi_theme ##

Das Attribut "gfiTheme" kann entweder als String oder als Object angegeben werden.
Wird es als String angegeben, so wird das entsprechende Template verwendet.

Wird es als Objekt verwendet, so gelten folgende Parameter.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des gfi Templates.|
|**[params](#markdown-header-gfi_theme_params)**|nein|Object||Template spezifische Attribute.|

**Beispiel gfiTheme:**

```
#!json
"gfiTheme": {
   "name": "default",
   "params": {}
}
```

***

## gfi_theme_params ##
Hier werden die Parameter für die GFI-Templates definiert.

|Name|params|
|----|------|
|default|**[params](#markdown-header-gfi_theme_default_params)**|
|sensor|**[params](#markdown-header-gfi_theme_sensor_params)**|

***

## gfi_theme_default_params ##
Hier werden die Parameter für das GFI-Template "default" definiert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|imageLinks|nein|String/String[]|["bildlink", "link_bild"]|Gibt an in welchem Attribut die Referenz zum dem Bild steht. Es wird in der angegebenen Reihenfolge nach den Attributen gesucht. Der erste Treffer wird verwendet.|
|showFavoriteIcons|nein|Boolean|true|Gibt an ob eine Leiste mit Icons angezeigt werden soll, mittels derer sich verschiedene Werkzeuge verwenden lassen. Die Icons werden nur angezeigt, wenn die enstprechenden Werkzeuge konfiguriert sind. Bisher verwendbar für die Werkzeuge: compareFeatures/vergleichsliste (Bisher nicht für WMS verfügbar).

**Beispiel gfiTheme für das template "Default":**

```
#!json
"gfiTheme": {
   "name": "default",
   "params": {
        "imageLinks": ["imageLink", "linkImage", "abc"],
        "showFavoriteIcons": true
   }
}
```

***

## gfi_theme_sensor_params ##
Mit diesem Theme lassen sich historische Daten zu einem Layer der SensorThings-API visualisieren. Dabei wird zu jedem konfigurierten Result der Observations eine Grafik erzeugt. Dieses GFI-Theme lässt sich also nur für Results die einen Status (z.B. bei Ladesäulen die Status: frei, laden, außer Betrieb) beinhalten sinnvoll verwenden.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|**[charts](#markdown-header-gfi_theme_sensor_params_charts)**|ja|Object||Enthält die Attribute zur Konfiguration der Diagramme.|
|**[data](#markdown-header-gfi_theme_sensor_params_data)**|nein|Object||Gibt an wie die Spaltenbeschriftungen in den Daten sein sollen.|
|header|nein|Object|{"name": "Name", "description": "Beschreibung", "ownerThing": "Eigentümer"}|Gibt an welche Attribute für die Kopfzeilen verwendet werden sollen. Der Anzeigename jedes Attributes lässt sich hier angeben. Z.B. lässt sich das Attribut "description" als "Beschreibung" anzeigen. |
|**[historicalData](#markdown-header-gfi_theme_sensor_params_historicalData)**|nein|Object||Gibt an für welchen Zeitraum die historischen Observations angefragt werden sollen.|

**Beispiel gfiTheme für das template "Sensor":**

```
#!json
"gfiTheme": {
   "name": "sensor",
   "params": {
        "header": {
            "name": "Name",
            "description": "Beschreibung",
            "ownerThing": "Eigentümer"
        },
        "data": {
            "name": "Daten",
            "firstColumnHeaderName": "Eigenschaften",
            "columnHeaderAttribute": "layerName"
        },
        "charts": {
            "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
            "barPercentage": 1.1,
            "values": {
                "available": {
                    "title": "Verfügbar",
                    "color": "rgba(0, 220, 0, 1)"
                },
                "charging": {
                    "title": "Auslastung",
                    "color": "rgba(220, 0, 0, 1)"
                },
                "outoforder": {
                    "title": "common:modules.tools.gfi.themes.sensor.chargingStations.outoforder",
                    "color": "rgba(175, 175, 175, 1)"
                }
            }
        },
        "historicalData": {
            "periodLength": 3,
            "periodUnit": "month"
        }
    }
}
```

***

## gfi_theme_sensor_params_charts ##
Hier werden die Parameter für die Anzeige der Grafiken konfiguriert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|values|ja|String[] / **[valuesObject](#markdown-header-gfi_theme_sensor_params_charts_valuesObject)**||Hier wird definiert, zu welchen Results der Observations Grafiken angezeigt werden sollen. Es wird für jeden Result ein eigener Reiter mit einer eigenen Grafik angelegt. Die Results können als Array oder Object angegeben werden. Beim object lassen sich weitere Attribute definieren.|
|hoverBackgroundColor|nein|String|"rgba(0, 0, 0, 0.8)"|Die Hintergundfarbe der Balken beim Hovern.|
|barPercentage|nein|Number|1.0|Breite der Balken in der Grafik.|

**Beispiel Konfiguration value als Array**
```
#!json
"charts": {
    "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
    "barPercentage": 1.1,
    "values": ["available", "charging", "outoforder"]
}
```

**Beispiel Konfiguration value als Object**
```
#!json
"charts": {
    "hoverBackgroundColor": "rgba(0, 0, 0, 0.8)",
    "barPercentage": 1.1,
    "values": {
        "available": {
            "title": "Verfügbar",
            "color": "rgba(0, 220, 0, 1)"
        },
        "charging": {
            "title": "Auslastung",
            "color": "rgba(220, 0, 0, 1)"
        },
        "outoforder": {
            "title": "Außer Betrieb",
            "color": "rgba(175, 175, 175, 1)"
        }
    }
}
```

***

## gfi_theme_sensor_params_charts_valuesObject ##
Hier wird das Layout für eine einzelne Grafik zu einem result konfiguriert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|title|nein|String||Angabe eines Titels für die Grafik. Der Titel kann auch mit einem Pfad in der Übersetzungsdatei angegeben werden. Dazu besteht die Möglichkeit die Übersetzungsdateien unter masterportal/locales zu erweitern.|
|colcor|nein|String|"rgba(0, 0, 0, 1)"|Die Farbe der Balken.|

```
#!json
"available": {
    "title": "Verfügbar",
    "color": "rgba(0, 220, 0, 1)"
}
```

```
#!json
"charging": {
   "title": "common:modules.tools.gfi.themes.sensor.chargingStations.charging",
   "color": "rgba(220, 0, 0, 1)"
},
```

***

## gfi_theme_sensor_params_data ##
Hier wird der die Anzeige der Sachdaten konfiguriert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String||Angabe des Names für den Reiter.|
|firstColumnHeaderName|nein|String|"Eigenschaften"|Angabe des Titles für die Spalte mit den Attributnamen.|
|columnHeaderAttribute|nein|String|"dataStreamName"|Angabe des Attributes, das für die Titel der Spalten mit den Attributwerten verwendet werden soll.|

```
#!json
"data": {
    "name": "Daten",
    "firstColumnHeaderName": "Eigenschaften",
    "columnHeaderAttribute": "layerName"
}
```

***

## gfi_theme_sensor_params_historicalData ##
Hier wird konfiguriert für welchen Zeitraum die historischen Observations angefragt werden sollen.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String||Angabe des Names für den Reiter.|
|periodLength|nein|Number|3|Angabe der Länge des Zeitraumes.|
|periodUnit|nein|String|"month"|Angabe der Einheit des Zeitraumes. Möglich sind "month" und "year".|

```
#!json
"historicalData": {
    "periodLength" : 3,
    "periodUnit" : "month"
}
```

***

## gfi_attributes ##
Hier erlauben Key-Value-Paare die portalseitige Übersetzung manchmal diensteseitig kryptischer Attributnamen in lesbare. Weitere Optionen sind:
**ignore**: keine GFI-Abfrage möglich,
**showAll**: alle GFI-Attribute werden abgefragt und wie vom Dienst geliefert angezeigt.
Bestimmte Standard-Attribute ohne Informationswert für den Benutzer werden immer aus der Anzeige im Portal ausgeschlossen, siehe(**[config.js](config.js.de.md)**)

**Beispiel gfiAttributes als String:**

```
#!json
{
   "gfiAttributes": "showAll"
}
```

**Beispiel gfiAttributes als String:**

```
#!json
{
   "gfiAttributes": "ignore"
}
```

**Beispiel gfiAttributes als Objekt:**

```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "key3": "Key der im Portal gezeigt wird 3"
   }
}
```

Beispiel gfiAttributes als Objekt mit [Objektpfadverweis](style.json.md#markdown-header-objektpfadverweise).
```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "@Datastreams.0.Observations.0.result": "Key der im Portal gezeigt wird 3"
   }
}

```
Wird gfiAttributes als Objekt übergeben, kann der Value auch ein Objekt sein. Dann wird ein Key erst verwendet, wenn eine Bedingung erfüllt ist

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|name|true|String||Name, der bei exakt einem Match angezeigt werden soll. |'"Test"'|
|condition|true|enum["contains", "startsWith", "endsWith"]|| Bedingung nach welcher der key gegen alle Attribute des Features geprüft wird.| '"startsWith"'|
|type|false|enum["string","date"]|"string"|Wenn type = "date", dann wird versucht ein Datum aus dem Attributwert zu erzeugen.| '"date"'|
|format|false|String|"DD.MM.YYYY HH:mm:ss"|Datumsformat.| '"DD.MM.YYY"'|
|suffix|false|String||Suffix, das an den Attributwert angehängt wird.| '"°C"'|

**Beispiel gfiAttributes als Objekt mit suffix:**

```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "key3": {
         "name": "Key der im Portal gezeigt wird 3",
         "condition": "contains",
         "suffix": "°C"
      }
   }
}
```

**Beispiel gfiAttributes als Objekt mit type und format:**

```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "key3": {
         "name": "Key der im Portal gezeigt wird 3",
         "condition": "contains",
         "type": "date",
         "format": "DD.MM.YY"
      }
   }
}
```

Beispiel gfiAttributes als Objekt mit Key als [Objektpfadverweis](style.json.md#markdown-header-objektpfadverweise) und Value als Objekt.
```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "@Datastreams.0.Observations.0.result": {
        "name": "Temperatur",
        "suffix": "°C"
      }
   }
}
```

***

## GeoJSON-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|id|ja|String||Frei wählbare Layer-ID|`"11111"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"lokale GeoJSON"`|
|typ|ja|String||Diensttyp, in diesem Fall GeoJSON |`"GeoJSON"`|
|subTyp|nein|enum["OpenSenseMap]||SubTyp um spezielle Daten nachzuladen. |`"OpenSenseMap"`|
|url|ja|String||Pfad/URL zur GeoJSON. Der Pfad ist relativ zur index.html|`"/myJsons/test.json"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|
|gfiTheme|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|**[gfiTheme](#markdown-header-gfi_theme)**|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht default gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|

**Beispiel GeoJSON:**
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

```
#!json

    {
      "id" : "11111",
      "name" : "lokale GeoJSON",
      "url" : "myJsons/test.json",
      "typ" : "GeoJSON",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "",
      "gfiTheme": "default"
   }
```

***

## Heatmap-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|ja|String||Frei wählbare Layer-ID|`"11111"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Mein Heatmap Layer"`|
|typ|ja|String||Diensttyp, in diesem Fall Heatmap |`"Heatmap"`|
|attribute|nein|String|""|Attributname. Nur Features, die dem "attribute" und "value" entsprechen, werden verwendet. |`"attr1"`|
|value|nein|String|""|Attributwert. Nur Features, die dem "attribute" und "value" entsprechen, werden verwendet.|`"val1"`|
|radius|nein|Number|10|Radius der Heatmap features.|`10`|
|blur|nein|Number|15|Blur der Heatmap Features |`15`|
|gradient|nein|String[]|["#00f", "#0ff", "#0f0", "#ff0", "#f00"]|Farbgradient der Heatmap |`["#f00", "#0f0", "#00f"]`|
|dataLayerId|ja|String||Id des Layers der die Features für die Heatmap liefert |`"4321"`|

**Beispiel HeatmapLayer:**

```
#!json

    {
		"id": "1234",
		"name": "Heatmap des Vektorlayers mit der layerid 4321",
		"typ": "Heatmap",
		"attribute": "state",
		"value": "charging",
		"radius": 20,
		"blur": 30,
		"gradient": [
			"#ffffb2",
			"#fd8d3c",
			"#fd8d3c",
			"#f03b20",
			"#bd0026"
		],
        "gfiAttributes": "ignore",
        "dataLayerId": "4321"
	}
```

***

## 3D Object Layer TileSet ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|hiddenFeatures|nein|Array||Liste mit IDs, die in der Ebene versteckt werden sollen|`["id_1", "id_2"]`|
|typ|ja|String||Diensttyp, in diesem Fall TileSet3D |`"TileSet3D"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/buildings_lod2"`|
|**[cesium3DTilesetOptions]**|nein|Object|Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

[cesium3DTilesetOptions]: https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html

**Beispiel Tileset:**

```
#!json

{
      "id" : "buildings",
      "name" : "Gebäude",
      "url" : "https://geodienste.hamburg.de/b3dm_hamburg_lod2",
      "typ" : "Tileset3D",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "hiddenFeatures": ["id1", "id2"],
      "cesium3DTilesetOptions" : {
        maximumScreenSpaceError : 6
      },
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "LOD 2 Gebäude",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "LOD 2 Gebäude"
            ],
            "kategorie_inspire" : [
               "LOD 2 Gebäude"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

***

## Terrain3D Quantized Mesh Dataset ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|ja|String/String[]||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.Deprecated, bitte "legend" verwenden.|`"ignore"`|
|legend|nein|Boolean/String/String[]||Wert aus **[services.json](services.json.de.md)**. URL die verwendet wird, um die Legende anzufragen. Boolean-Wert um dynamisch die Legende aus dem WMS request oder dem styling zu generieren. String-Wert als Pfad auf Bild oder PDF-Datei.|false|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Terrain3D |`"Terrain3D"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/terrain"`|
|**[cesiumTerrainProviderOptions]**|nein|Object|Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

[cesiumTerrainProviderOptions]: https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html

**Beispiel Terrain:**

```
#!json
   {
      "id" : "buildings",
      "name" : "Terrain",
      "url" : "https://geodienste.hamburg.de/terrain",
      "typ" : "Terrain3D",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
      },
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Terrain",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Terrain"
            ],
            "kategorie_inspire" : [
               "Terrain"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

***

## Oblique Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Oblique |`"Oblique"`|
|hideLevels|nein|Number||Anzahl der Level der Bildpyramide, die nicht angezeigt werden sollen. |`0`|
|minZoom|nein|Number||Minimale Zoomstufe 0 zeigt das komplette Schrägluftbild in der Mitte des Bildschirms. |`0`|
|terrainUrl|nein|String||URL zu Cesium Quantized Mesh Terrain dataset |`"https://geodienste.hamburg.de/terrain"`|
|resolution|nein|Number||Auflösung der Schrägluftbilder in cm z.B. 10 . |`10`|
|projection|ja|String||Projektion der Schrägluftbild ebene. |`EPSG:25832`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/oblique"`|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Beispiel Oblique Ebene:**

```
#!json
   {
      "id" : "oblique",
      "name" : "Oblique",
      "url" : "https://geodienste.hamburg.de/oblique",
      "typ" : "Oblique",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legend" : false,
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Oblique",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Oblique"
            ],
            "kategorie_inspire" : [
               "Oblique"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

***

## Entities Layer 3D ##

Entities Layer um 3D Modelle im Gltf oder Glb Format darzustellen.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object[]/Boolean||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt. Es kann explizit "datasets": false gesetzt werden, damit der „i“-Button nicht angezeigt wird.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Entities3D |`"Entities3D"`|
|entities|ja|Array||Modelle, die angezeigt werden sollen |`[]`|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|false|

**Entity Optionen**

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

**Beispiel Entities3D Ebene:**

```
#!json
   {
     "id": "gltfLayer",
     "name": "GltfLayer",
     "typ": "Entities3D",
     "layerAttribution": "nicht vorhanden",
     "legend": false,
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
     ],
     "datasets": [
       {
         "md_id": "A39B4E86-15E2-4BF7-BA82-66F9913D5640",
         "rs_id": "https://registry.gdi-de.org/id/de.hh/6D10BE89-636D-4359-8B27-4AB4DCA02F3A",
         "md_name": "Digitales Höhenmodell Hamburg DGM 1",
         "bbox": "461468.97,5916367.23,587010.91,5980347.76",
         "kategorie_opendata": [
           "Geographie, Geologie und Geobasisdaten"
         ],
         "kategorie_inspire": [
           "Höhe"
         ],
         "kategorie_organisation": "Landesbetrieb Geoinformation und Vermessung"
       }
     ]
   }
```
>Zurück zur **[Dokumentation Masterportal](doc.de.md)**.
