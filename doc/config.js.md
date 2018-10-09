>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# config.js #
Die *config.js* enthält die Konfigurationsoptionen für das Masterportal, die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen, z.B. Pfade zu weiteren Konfigurationsdateien. Die *config.js* liegt im Regelfall neben der index.html und neben der *config.json*.
Im Folgenden werden die einzelnen Konfigurationsoptionen beschrieben. Darüber hinaus gibt es für die Konfigurationen vom Typ *object* weitere Optionen, diese Konfigurationen sind verlinkt und werden im Anschluss an die folgende Tabelle jeweils genauer erläutert. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv/src/stable/portal/master/config.js).

|Name|Verpflichtend|Typ|Default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|[clickCounter](#markdown-header-clickcounter)|nein|Object||Konfigurationsobjekt des ClickCounterModuls. Dieses lädt für jeden registrierten Klick ein iFrame.||
|cswId|nein|String|"1"|Referenz auf eine CS-W Schnittstelle, die für die Layerinformation genutzt wird. ID wird über [rest-services.json](rest-services.json.md) aufgelöst.|`"1"`|
|customModules|nein|Array[String]||Pfad zu portalspezifischen Modulen. Der Pfad ist relativ zu *js/main.js*.| `["../portal/master/verkehrsfunctions"]`|
|[footer](#markdown-header-footer)|nein|Object||Zeigt einen Footer-Bereich an und konfiguriert diesen.||
|gfiWindow|nein|String|"detached"|Darstellungsart der Attributinformationen für alle Layertypen. **attached**: das Fenster mit Attributinformationen wird am Klickpunkt geöffnet. **detached**: das Fenster mit Attributinformationen wird oben rechts auf der Karte geöffnet. Der Klickpunkt wird zusätzlich mit einem Marker gekennzeichnet.|`"attached"`|
|ignoredKeys|nein|Array[String]||Liste der ignorierten Attributnamen bei der Anzeige von Attributinformationen aller Layertypen.|`["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]`|
|layerConf|ja|String||Pfad zur [services.json](services.json.md), die alle verfügbaren WMS-Layer bzw. WFS-FeatureTypes enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/services-fhhnet-ALL.json"`|
|[mouseHover](#markdown-header-mouseHover)|nein|Object||Steuert, ob MouseHover für Vektorlayer (WFS und GeoJSON) aktiviert ist. Weitere Konfigurationsmöglichkeiten pro Layer in [config.json](config.json.md) (*Themenconfig.Fachdaten.Layer*).|`true`|
|namedProjections|ja|Array[String]||Festlegung der nutzbaren Koordinatensysteme ([siehe Syntax](http://proj4js.org/#named-projections)).|`[["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]]`|
|proxyUrl|ja|String||Absoluter Server-Pfad zu einem Proxy-Skript, dass mit *"?url="* aufgerufen wird. Notwendig, wenn der Druck-Dienst konfiguriert ist (siehe [print](#markdown-header-print)).|`"/cgi-bin/proxy.cgi"`|
|quickHelp|nein|Boolean|false|Aktiviert das QuickHelp-Modul. Dieses zeigt kontextsensitive Hilfe für die verfügbaren Funktionen an (bisher verfügbar für: Themenbaum und Suche).|`true`|
|portalConf|nein|String|"config.json"|Pfad zur config.json des Portals. Es kann auch ein Knotenpunkt angegeben werden. Der Weiterführende Pfad wird dann über den URL-Parameter "config" gesteuert.|"../../portal/master/". Zusätzlich muss dann in der URL der Parameter "config=config.json" stehen.|
|restConf|ja|String||Pfad zur [rest-services.json](rest-services.json.md), die weitere, verfügbare Dienste enthält (z.B. Druckdienst, WPS, CSW). Der Pfad ist relativ zu js/main.js.|`"../components/lgv-config/rest-services-fhhnet.json"`|
|scaleLine|nein|Boolean|false|Steuert, ob eine Maßstabsleiste unten auf der Karte angezeigt wird. Ist der *Footer* aktiv, wird die Leiste unten rechts, sonst unten links angezeigt.|`true`|
|simpleMap|nein|Boolean|false|Fügt dem *„Auswahl speichern“-Dialog* eine SimpleMap-URL hinzu (ohne Menüleiste, Layerbau, Map Controls). Nicht für Portale mit Baumtyp: *„light“*.|`false`|
|uiStyle|nein|String|default|Steuert das Layout der Bedienelemente. |`table`|
|styleConf|ja|String||Pfad zur [style.json](style.json.md), die Styles für Vektorlayer (WFS) enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/style.json"`|
|[tree](#tree)|nein|Object||||
|infoJson|nein|String|"info.json"|Pfad zur info.json, die Zusatzinformationen für Snippets enthält. Der Pfad ist relativ zur index.html.|`"info.json"`|
|wfsImgPath|nein|String||Pfad zum Ordner mit Bildern, die für WFS-Styles benutzt werden. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/img/"`|
|wpsID|nein|String|""|Referenz auf eine WPS-Schnittstelle, die in verschiedenen Modulen genutzt wird. ID wird über [rest-services.json](rest-services.json.md) aufgelöst.|`""`|
|[zoomToFeature](#markdown-header-zoomtofeature)|nein|Object||Optionale Konfigurations-Einstellungen für den URL-Parameter *featureid*. Siehe [URL-Parameter](URL-Parameter.md).||
|[remoteInterface](#markdown-header-remoteInterface)|nein|object||Optionale Konfiguration für das remoteInterface.||
|[browserPrint](#markdown-header-browserPrint)|nein|object||Optionale Konfiguration für das clientseitige Druckmodul.||

******
## mouseHover ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minShift|nein|Integer|5|Gibt an, wieviele Pixel sich die Position gegenüber vorher verändert haben muss, um ein neues Tooltip zu rendern.|
|numFeaturesToShow|nein|Integer|2|Maximale Anzahl an Elementinformationen im Tooltip, bevor ein InfoText die Anzahl limitiert.|
|infoText|nein|String|"(weitere Objekte. Bitte zoomen.)"|Meldung die bei Überschreiten der numFeaturesToShow mit im MouseHover angezeigt wird.|
******
## remoteInterface ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|postMessageUrl|nein|String|"http://localhost:8080"|Url auf die das Portal per post-Message agieren und reagieren kann.

**Beispiel:**
```
#!json
remoteInterface:{
    postMessageUrl: "http://localhost:8080"
}

```
*********

******
## browserPrint ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|footerText|nein|String|"Kartographie und Gestaltung: Freie und Hansestadt Hamburg \nLandesbetrieb Geoinformation und Vermessung"|Text der in der Fußleiste angezeigt werden soll|
|titleText|nein|String|"PDF ohne Titel"|Text der im Titel-Element angezeigt werden soll|

**Beispiel:**
```
#!json
browserPrint:{
    footerText: "Mein Fußleisten-Text",
    titleText: "Mein Titel"
}

```
*********

******

## clickCounter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|desktop|nein|String||URL des iFrames bei Desktopausspielung.|
|mobile|nein|String||URL des iFrames bei mobiler Ausspielung.|

**Beispiel:**


```
#!json

clickCounter:
{
desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
}

```

*********

## footer ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[urls](#markdown-header-footerurls)|nein|Array[Object]||Array von URL-Konfigurationsobjekten. Auch hier existieren wiederum mehrere Konfigurationsmöglichkeiten, welche in der folgenden Tabelle aufgezeigt werden.|

******
### footer.urls ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|alias|nein|String|"Landesbetrieb Geoniformation und Vermessung"|Bezeichnung des Links bei Desktop-Ausspielung.|
|alias_mobil|nein|String|"LGV"|Bezeichnung bei mobiler Ausspielung.|
|bezeichnung|nein|String|"Kartographie und Gestaltung: "|Bezeichnung vor dem Link.|
|url|nein|String|„http://www.geoinfo.hamburg.de/“|Die aufzurufende URL.|


**Beispiel:**

```
#!json
footer: {
    urls: [
        {
            "bezeichnung": "Kartographie und Gestaltung: ",
            "url": "http://www.geoinfo.hamburg.de/",
            "alias": "Landesbetrieb Geoniformation und Vermessung",
            "alias_mobil": "LGV"
        },
        {
            "bezeichnung": "",
            "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
            "alias": "SDP Download",
            "alias_mobil": "SDP"
        },
        {
            "bezeichnung": "",
            "url": "http://www.hamburg.de/bsu/timonline",
            "alias": "Kartenunstimmigkeit"
        }
    ]
}
```
*********

## tree ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|orderBy|nein|String|OpenData|Gibt die Kategorie an nach der initial der Themenbaum sortiert wird.|
|layerIDsToIgnore|nein|Array|| Array mit LayerIDs aus der services.json die nicht im Themenbaum dargestellt werden.|
|[layerIDsToStyle](#markdown-header-layerIDsToStyle)|nein|Array[Object]||Speziell für HVV Dienst. Enthält Objekte um verschiedene Styles zu einer layerId abzufragen.|
|metaIDsToMerge|nein|Array||Fasst alle unter dieser metaID gefundenen Layer aus der services.json zu einem LAyer im Themenbaum zusammen.|
|metaIDsToIgnore|nein|Array||Alle Layer der Service.json mit entsprechender metaID werden ignoriert im Themenbaum.|
|isFolderSelectable|nein|Boolean|true|Legt auf globaler Ebene fest, ob eine Auswahlbox zur Selektierung aller Layer eines Ordners angezeigt werden soll. Diese Festlegung kann von Element-Eigenschaften überschrieben werden (vgl. [config.json](config.json.md#Ordnerkonfiguration-Fachdaten)).|

******
### tree.layerIDsToStyle ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|nein|Sring||Entsprechend der LayerId aus der service.json.|
|styles|nein|String oder Array||Enthält einen zu verwendenden Style als String oder bei verschiedenen Styles ein Array aus Strings.|
|name|nein|String oder Array||Enthält einen zu verwendenden Namen als String oder bei verschiedenen Namen ein Array aus Strings.|
|legendUrl|nein|String oder Array||Enthält eine zu verwendenden Legende als String oder bei verschiedenen Legenden ein Array aus Strings.|


**Beispiel:**

```
#!json

tree: {
            orderBy: "opendata",
            layerIDsToIgnore: ["1912", "1913"],
            layerIDsToStyle: [
                {
                    "id": "1935",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                    "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ],
            metaIDsToMerge: [
                "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
            ],
            metaIDsToIgnore: [
                "09DE39AB-A965-45F4-B8F9-0C339A45B154"
            ],
            isFolderSelectable: false
        }
```

## zoomToFeature ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imgLink|ja|String||Link für den Marker.|
|layerId|ja|String||ID des Layers an den die Marker gekoppelt werden.|
|wfsId|ja|String||ID des WFS-Layers von dem die Position abgefragt wird.|
|attribute|ja|String||Attributname. Entspricht Attribut nach dem der WFS gefiltert wird.|

**Beispiel:**
```
#!json
zoomtofeature: {
    attribute: "flaechenid",
    imgLink: "../img/location_eventlotse.svg",
    wfsId: "4560",
    layerId: "4561"
}
```

>Zurück zur [Dokumentation Masterportal](doc.md).
